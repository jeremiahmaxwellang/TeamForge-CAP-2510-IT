const db = require('../../config/database');
const { google } = require('googleapis');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const CALENDAR_REDIRECT = process.env.CALENDAR_REDIRECT || 'http://localhost:3000/calendar/google/redirect';

function makeOAuthClient() {
    return new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.SECRET_ID,
        CALENDAR_REDIRECT
    );
}

// 1. Get Player Availability
exports.getAvailability = async (req, res) => {
    try {
        const { date, start, end } = req.query;

        // Fetch active players
        const [players] = await db.query(`
            SELECT u.userId, u.firstname, u.lastname, p.gameName, 
                   r1.displayedRole as primaryRole, r2.displayedRole as secondaryRole
            FROM users u
            JOIN players p ON u.userId = p.userId
            LEFT JOIN leagueRoles r1 ON p.primaryRoleId = r1.roleId
            LEFT JOIN leagueRoles r2 ON p.secondaryRoleId = r2.roleId
            WHERE u.position IN ('Player', 'Sub') AND u.status = 'Active'
        `);

        if (!date || !start || !end) {
            const mapped = players.map(p => ({ ...p, availability: 'Available' }));
            return res.json({ success: true, players: mapped });
        }

        const inputStart = new Date(`${date}T${start}`);
        const inputEnd = new Date(`${date}T${end}`);
        const bufferStart = new Date(inputStart.getTime() - 60 * 60 * 1000); // 1 hour before
        const bufferEnd = new Date(inputEnd.getTime() + 60 * 60 * 1000);   // 1 hour after

        // Query existing event_attendees
        const [events] = await db.query(`
            SELECT ea.userId, e.start_datetime, e.end_datetime
            FROM event_attendees ea
            JOIN events e ON ea.eventId = e.eventId
            WHERE DATE(e.start_datetime) = ? OR DATE(e.end_datetime) = ?
        `, [date, date]);

        // Calculate availability
        const playersWithAvailability = players.map(player => {
            let status = 'Available';
            const playerEvents = events.filter(e => e.userId === player.userId);
            
            for (let e of playerEvents) {
                const eventStart = new Date(e.start_datetime);
                const eventEnd = new Date(e.end_datetime);

                // Unavailable: Direct Overlap
                if (eventStart < inputEnd && eventEnd > inputStart) {
                    status = 'Unavailable';
                    break; // Overrides all
                } 
                // Semi-available: within 1 hour before or after
                else if (eventStart < bufferEnd && eventEnd > bufferStart) {
                    status = 'Semi';
                }
            }
            return { ...player, availability: status };
        });

        res.json({ success: true, players: playersWithAvailability });

    } catch (error) {
        console.error('[CALENDAR] Error fetching availability:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 2. Create Event & Insert Attendees
exports.createEvent = async (req, res) => {
    try {
        // Extract all data, including the new sendGcal toggle
        const { title_summary, type, location, start_date, start_datetime, end_date, end_datetime, videoLink, win, participants, sendGcal } = req.body;
        const creator_id = req.cookies && req.cookies.userId ? req.cookies.userId : null;

                // ── TEMP DEBUG ──
        console.log('[DEBUG] creator_id from cookie:', creator_id);
        const [debugRow] = await db.query('SELECT google_connected FROM users WHERE userId = ?', [creator_id]);
        console.log('[DEBUG] google_connected in DB:', debugRow[0]);
        // ── END DEBUG ──

        // Insert Event
        const [result] = await db.query(`
            INSERT INTO events (title_summary, creator_id, type, location, start_date, start_datetime, end_date, end_datetime, videoLink, win) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title_summary, creator_id, type, location, start_date, start_datetime, end_date, end_datetime, videoLink, win]);

        const eventId = result.insertId;

        // Role Map to convert "Top" strings to leagueRoles IDs
        const roleMap = { 'Top': 1, 'Jungle': 2, 'Mid': 3, 'ADC': 4, 'Support': 5 };

        // Insert into event_attendees (only for Scrims/Tournaments)
        if (participants && participants.length > 0) {
            const values = participants.map(p => [
                eventId, 
                p.userId, 
                roleMap[p.role] || null, // Translates to an integer (1-5)
                p.isSub || 'N',
                p.team || 'Team 1'
            ]);
            
            await db.query(`
                INSERT INTO event_attendees (eventId, userId, player_role, is_sub, team) 
                VALUES ?
            `, [values]);
        }

        // ── GOOGLE CALENDAR INVITE LOGIC ─────────────────────────────────────────
        // Added 'sendGcal === true' back so it respects the checkbox
        if (sendGcal === true && ['Scrim', 'Tournament', 'Meeting'].includes(type) && creator_id) {
            console.log('[DEBUG] type passed check:', type); 

            const [userRows] = await db.query(`
                SELECT google_access_token, google_refresh_token, google_token_expiry, google_connected
                FROM users WHERE userId = ?
            `, [creator_id]);

             console.log('[DEBUG] userRows[0].google_connected:', userRows[0]?.google_connected); 

            if (userRows.length > 0 && userRows[0].google_connected) {
                const stored = userRows[0];
                const oauth2Client = makeOAuthClient();
                oauth2Client.setCredentials({
                    access_token:  stored.google_access_token,
                    refresh_token: stored.google_refresh_token,
                    expiry_date:   stored.google_token_expiry ? Number(stored.google_token_expiry) : undefined
                });

                // Save automatically refreshed tokens back to the DB
                oauth2Client.on('tokens', async (newTokens) => {
                    if (newTokens.access_token) {
                        await db.query(`
                            UPDATE users SET google_access_token = ?, google_token_expiry = ?
                            WHERE userId = ?
                        `, [newTokens.access_token, newTokens.expiry_date || null, creator_id]);
                    }
                });

                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

                // Get participant emails from the DB to send the invites
                let attendeesList = [];
                if (participants && participants.length > 0) {
                    const userIds = participants.map(p => p.userId);
                    const [emailRows] = await db.query(`SELECT email FROM users WHERE userId IN (?)`, [userIds]);
                    attendeesList = emailRows.map(row => ({ email: row.email }));
                }

                // Convert 'YYYY-MM-DD HH:mm:00' to ISO format 'YYYY-MM-DDTHH:mm:00' required by Google
                const formatGcalDate = (dt) => dt ? dt.replace(' ', 'T') : null;

                try {
                    const gcalRes = await calendar.events.insert({
                        calendarId: 'primary',
                        sendUpdates: 'all', // <-- This triggers the Google Calendar email invitations
                        resource: {
                            summary: `[${type}] ${title_summary}`,
                            location: location || '',
                            start: {
                                dateTime: formatGcalDate(start_datetime),
                                timeZone: 'Asia/Manila'
                            },
                            end: {
                                dateTime: formatGcalDate(end_datetime),
                                timeZone: 'Asia/Manila'
                            },
                            attendees: attendeesList
                        }
                    });

                    // Save the generated Google Event ID to local DB
                    if (gcalRes.data && gcalRes.data.id) {
                        await db.query(`UPDATE events SET google_event_id = ? WHERE eventId = ?`, [gcalRes.data.id, eventId]);
                        
                        // SUCCESS MESSAGE
                        console.log(`[CALENDAR] SUCCESS: Google Calendar invite sent for "${title_summary}".`);
                    }
                } catch (gcalErr) {
                    // FAILURE MESSAGE WITH REASON
                    console.log(`[CALENDAR] FAILURE: Could not send Google Calendar invite for "${title_summary}". Reason: ${gcalErr.message}`);
                    console.error('[CALENDAR] Detailed Google API Error:', gcalErr.response?.data || gcalErr);
                }
            }
        }

        res.status(201).json({ success: true, message: 'Event created!', eventId });

    } catch (error) {
        console.error('[CALENDAR] Error creating event:', error);
        res.status(500).json({ success: false, message: 'Failed to create event.' });
    }
};

// 3. Fetch All Events for the Calendar
exports.getEvents = async (req, res) => {
    try {
        const [events] = await db.query(`
            SELECT 
                e.eventId, 
                e.title_summary, 
                e.type, 
                DATE_FORMAT(e.start_date, '%Y-%m-%d') as start_date, 
                DATE_FORMAT(e.start_datetime, '%H:%i') as start_time, 
                DATE_FORMAT(e.end_datetime, '%H:%i') as end_time,
                e.location, 
                e.videoLink, 
                e.win,
                u.firstname,
                u.lastname,
                u.position AS creatorRole,
                e.google_event_id
            FROM events e
            LEFT JOIN users u ON e.creator_id = u.userId
        `);
        
        res.json({ success: true, events });
    } catch (error) {
        console.error('[CALENDAR] Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
