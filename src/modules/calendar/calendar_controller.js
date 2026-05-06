const db = require('../../config/database');

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
            WHERE u.position = 'Player' AND u.status = 'Active'
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
        const { title_summary, type, location, start_date, start_datetime, end_date, end_datetime, videoLink, win, participants } = req.body;
        const creator_id = req.cookies && req.cookies.userId ? req.cookies.userId : null;

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
                p.isSub || 'N'
            ]);
            
            await db.query(`
                INSERT INTO event_attendees (eventId, userId, player_role, is_sub) 
                VALUES ?
            `, [values]);
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
        // We use DATE_FORMAT so MySQL passes the exact string formats the frontend expects (YYYY-MM-DD and HH:mm)
        const [events] = await db.query(`
            SELECT 
                eventId, 
                title_summary, 
                type, 
                DATE_FORMAT(start_date, '%Y-%m-%d') as start_date, 
                DATE_FORMAT(start_datetime, '%H:%i') as start_time, 
                DATE_FORMAT(end_datetime, '%H:%i') as end_time,
                location, 
                videoLink, 
                win
            FROM events
        `);
        
        res.json({ success: true, events });
    } catch (error) {
        console.error('[CALENDAR] Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};