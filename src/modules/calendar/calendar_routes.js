const express = require('express');
const router  = express.Router();
const path    = require('path');
const { google } = require('googleapis');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db                 = require('../../config/database');
const calendarController = require('./calendar_controller');

// ── GOOGLE OAUTH CLIENT ──────────────────────────────────────────────────────
// Uses a dedicated redirect URI so this flow returns to /calendar, not /login
const CALENDAR_REDIRECT = process.env.CALENDAR_REDIRECT
    || 'http://localhost:3000/calendar/google/redirect';

function makeOAuthClient() {
    return new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.SECRET_ID,
        CALENDAR_REDIRECT
    );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'calendar.html'));
});

// ── TEAMFORGE CALENDAR APIS ──────────────────────────────────────────────────
router.get('/api/availability', calendarController.getAvailability);
router.get('/api/events',       calendarController.getEvents);
router.post('/api/create',      calendarController.createEvent);

// ── GOOGLE CALENDAR — STEP 1: Redirect signed-in user to consent screen ──────
// GET /calendar/google/connect
// The frontend calls window.location.href = '/calendar/google/connect'
router.get('/google/connect', (req, res) => {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.redirect('/calendar?error=not_logged_in');

    const oauth2Client = makeOAuthClient();
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',          // we need a refresh_token
        prompt:      'consent',          // force consent so refresh_token is always returned
        scope: [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email'
        ], // Jun 15: changed scope from readonly to events
        
        // Pass userId through state so we know who to save tokens for
        state: String(userId)
    });

    res.redirect(url);
});

// ── GOOGLE CALENDAR — STEP 2: OAuth callback, save tokens, redirect back ──────
// GET /calendar/google/redirect  (must be registered in Google Cloud Console)
router.get('/google/redirect', async (req, res) => {
    const { code, state: userId, error } = req.query;

    if (error) {
        console.warn('[CALENDAR OAUTH] User denied access:', error);
        return res.redirect('/calendar?gcal=denied');
    }

    if (!code || !userId) return res.redirect('/calendar?gcal=error');

    try {
        const oauth2Client = makeOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);
        // tokens = { access_token, refresh_token, expiry_date, token_type, scope }

        await db.query(`
            UPDATE users SET
                google_access_token  = ?,
                google_refresh_token = ?,
                google_token_expiry  = ?,
                google_connected     = 1
            WHERE userId = ?
        `, [
            tokens.access_token,
            tokens.refresh_token || null,   // only returned on first consent
            tokens.expiry_date   || null,
            userId
        ]);

        // Redirect back to calendar — frontend will auto-import on gcal=connected
        return res.redirect('/calendar?gcal=connected');

    } catch (err) {
        console.error('[CALENDAR OAUTH] Token exchange failed:', err);
        return res.redirect('/calendar?gcal=error');
    }
});

// ── GOOGLE CALENDAR — STEP 3: Import + persist events from Google ─────────────
// GET /calendar/api/google-events
// 1. Fetches events from Google Calendar API
// 2. Upserts them into the `events` table (INSERT … ON DUPLICATE KEY UPDATE)
//    using google_event_id as the dedup key — safe to call on every page load
// 3. Returns the saved rows in the same shape as /api/events so the frontend
//    can merge them with TeamForge events without any extra mapping
router.get('/api/google-events', async (req, res) => {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Not logged in' });

    try {
        // ── 1. Load stored tokens ────────────────────────────────────────────
        const [rows] = await db.query(`
            SELECT google_access_token, google_refresh_token, google_token_expiry, google_connected
            FROM users WHERE userId = ?
        `, [userId]);

        if (!rows.length || !rows[0].google_connected) {
            return res.json({ success: false, connected: false, message: 'Google Calendar not connected' });
        }

        const stored = rows[0];

        // ── 2. Build authenticated Google client ─────────────────────────────
        const oauth2Client = makeOAuthClient();
        oauth2Client.setCredentials({
            access_token:  stored.google_access_token,
            refresh_token: stored.google_refresh_token,
            expiry_date:   stored.google_token_expiry ? Number(stored.google_token_expiry) : undefined
        });

        // Persist any auto-refreshed access token back to the DB
        oauth2Client.on('tokens', async (newTokens) => {
            if (newTokens.access_token) {
                await db.query(`
                    UPDATE users SET google_access_token = ?, google_token_expiry = ?
                    WHERE userId = ?
                `, [newTokens.access_token, newTokens.expiry_date || null, userId]);
            }
        });

        // ── 3. Fetch from Google Calendar API ───────────────────────────────
        const gcal = google.calendar({ version: 'v3', auth: oauth2Client });

        const timeMin = new Date();
        timeMin.setMonth(timeMin.getMonth() - 3);   // 3 months back
        const timeMax = new Date();
        timeMax.setMonth(timeMax.getMonth() + 6);   // 6 months forward

        const response = await gcal.events.list({
            calendarId:   'primary',
            timeMin:      timeMin.toISOString(),
            timeMax:      timeMax.toISOString(),
            maxResults:   250,
            singleEvents: true,
            orderBy:      'startTime'
        });

        const items = response.data.items || [];
        if (items.length === 0) {
            return res.json({ success: true, connected: true, events: [], imported: 0 });
        }

        // ── 4. Upsert each Google event into the `events` table ──────────────
        // type is ENUM('Scrim','Tournament','Meeting','Other') — Google events → 'Other'
        // google_event_id UNIQUE constraint means re-syncing is always safe:
        //   - New events → INSERT
        //   - Existing events → UPDATE title/location/times in place
        //   - Deleted-from-Google events → left in DB (orphaned but harmless)
        let imported = 0;

        for (const ev of items) {
            const isAllDay     = !!(ev.start?.date && !ev.start?.dateTime);
            const startRaw     = ev.start?.dateTime || ev.start?.date || '';
            const endRaw       = ev.end?.dateTime   || ev.end?.date   || '';

            // YYYY-MM-DD
            const startDate    = startRaw.substring(0, 10);
            const endDate      = endRaw.substring(0, 10);

            // Full DATETIME strings for start_datetime / end_datetime
            // All-day events get midnight as their time component
            const startDatetime = isAllDay
                ? `${startDate} 00:00:00`
                : startRaw.replace('T', ' ').substring(0, 19);
            const endDatetime   = isAllDay
                ? `${endDate} 23:59:00`
                : endRaw.replace('T', ' ').substring(0, 19);

            const title    = (ev.summary   || '(No title)').substring(0, 500); // TEXT col, but be safe
            const location = (ev.location  || '').substring(0, 500);
            const gcalId   = ev.id; // Google's stable event ID — our dedup key

            await db.query(`
                INSERT INTO events
                    (title_summary, creator_id, type, location,
                     start_date, start_datetime,
                     end_date,   end_datetime,
                     google_event_id)
                VALUES (?, ?, 'Other', ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    title_summary  = VALUES(title_summary),
                    location       = VALUES(location),
                    start_date     = VALUES(start_date),
                    start_datetime = VALUES(start_datetime),
                    end_date       = VALUES(end_date),
                    end_datetime   = VALUES(end_datetime)
            `, [
                title, userId, location,
                startDate, startDatetime,
                endDate,   endDatetime,
                gcalId
            ]);

            imported++;
        }

        // ── 5. Return the now-persisted events in the same shape as /api/events ─
        const [savedEvents] = await db.query(`
            SELECT
                e.eventId,
                e.title_summary,
                e.type,
                DATE_FORMAT(e.start_date,     '%Y-%m-%d') AS start_date,
                DATE_FORMAT(e.start_datetime, '%H:%i')    AS start_time,
                DATE_FORMAT(e.end_datetime,   '%H:%i')    AS end_time,
                e.location,
                e.videoLink,
                e.win,
                e.google_event_id,
                u.firstname,
                u.lastname,
                u.position AS creatorRole,
                p.gameName 
            FROM events e
            LEFT JOIN users u ON e.creator_id = u.userId
            LEFT JOIN players p ON e.creator_id = p.userId
            WHERE e.google_event_id IS NOT NULL
              AND e.start_date BETWEEN ? AND ?
            ORDER BY e.start_date, e.start_datetime
        `, [
            timeMin.toISOString().substring(0, 10),
            timeMax.toISOString().substring(0, 10)
        ]);

        console.log(`[CALENDAR] Google import: ${imported} events upserted for userId=${userId}`);
        return res.json({ success: true, connected: true, events: savedEvents, imported });

    } catch (err) {
        console.error('[CALENDAR] Error fetching/saving Google events:', err);

        if (err.code === 401 || err.response?.status === 401) {
            await db.query('UPDATE users SET google_connected = 0 WHERE userId = ?', [userId]);
            return res.json({ success: false, connected: false, message: 'Google access revoked — please reconnect' });
        }

        return res.status(500).json({ success: false, message: 'Failed to import Google Calendar events' });
    }
});

// ── GOOGLE CALENDAR — Check connection status ─────────────────────────────────
// GET /calendar/api/google-status
router.get('/api/google-status', async (req, res) => {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.json({ connected: false });

    try {
        const [rows] = await db.query(
            'SELECT google_connected FROM users WHERE userId = ?', [userId]
        );
        const connected = rows.length > 0 && !!rows[0].google_connected;
        res.json({ connected });
    } catch (err) {
        res.json({ connected: false });
    }
});

// ── GOOGLE CALENDAR — Disconnect (revoke + clear tokens + remove imported events)
// POST /calendar/api/google-disconnect
router.post('/api/google-disconnect', async (req, res) => {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ success: false });

    try {
        const [rows] = await db.query(
            'SELECT google_access_token FROM users WHERE userId = ?', [userId]
        );

        if (rows.length && rows[0].google_access_token) {
            // Best-effort revoke so Google also forgets the token
            const oauth2Client = makeOAuthClient();
            try { await oauth2Client.revokeToken(rows[0].google_access_token); } catch (_) {}
        }

        // Clear tokens from the users table
        await db.query(`
            UPDATE users SET
                google_access_token  = NULL,
                google_refresh_token = NULL,
                google_token_expiry  = NULL,
                google_connected     = 0
            WHERE userId = ?
        `, [userId]);

        // Delete imported Google events from the events table
        // Only removes events created by this user (creator_id = userId) that came from Google
        const [deleted] = await db.query(`
            DELETE FROM events
            WHERE google_event_id IS NOT NULL AND creator_id = ?
        `, [userId]);

        console.log(`[CALENDAR] Disconnected userId=${userId}, deleted ${deleted.affectedRows} Google events`);
        res.json({ success: true, deletedEvents: deleted.affectedRows });

    } catch (err) {
        console.error('[CALENDAR] Disconnect error:', err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
