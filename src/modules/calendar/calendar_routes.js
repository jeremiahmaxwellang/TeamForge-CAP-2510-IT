const express = require('express');
const router = express.Router();
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db = require('../../config/database');
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
router.get('/api/events', calendarController.getEvents);
router.post('/api/create', calendarController.createEvent);

// ── GOOGLE CALENDAR — STEP 1: Redirect signed-in user to consent screen ──────
// GET /calendar/google/connect
// The frontend calls window.location.href = '/calendar/google/connect'
router.get('/google/connect', (req, res) => {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.redirect('/calendar?error=not_logged_in');

    const oauth2Client = makeOAuthClient();
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',          // we need a refresh_token
        prompt: 'consent',          // force consent so refresh_token is always returned
        scope: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
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
            tokens.expiry_date || null,
            userId
        ]);

        // Redirect back to calendar — frontend will auto-import on gcal=connected
        return res.redirect('/calendar?gcal=connected');

    } catch (err) {
        console.error('[CALENDAR OAUTH] Token exchange failed:', err);
        return res.redirect('/calendar?gcal=error');
    }
});

// ── GOOGLE CALENDAR — STEP 3: Import events from Google into app ──────────────
// GET /calendar/api/google-events
// Called by the frontend after OAuth is done (or on any page load if connected)
router.get('/api/google-events', async (req, res) => {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Not logged in' });

    try {
        // Fetch stored tokens for this user
        const [rows] = await db.query(`
            SELECT google_access_token, google_refresh_token, google_token_expiry, google_connected
            FROM users WHERE userId = ?
        `, [userId]);

        if (!rows.length || !rows[0].google_connected) {
            return res.json({ success: false, connected: false, message: 'Google Calendar not connected' });
        }

        const stored = rows[0];

        // Build an authenticated client using the stored tokens
        const oauth2Client = makeOAuthClient();
        oauth2Client.setCredentials({
            access_token: stored.google_access_token,
            refresh_token: stored.google_refresh_token,
            expiry_date: stored.google_token_expiry
                ? Number(stored.google_token_expiry)
                : undefined
        });

        // Auto-refresh: if the access token was refreshed, persist the new one
        oauth2Client.on('tokens', async (newTokens) => {
            if (newTokens.access_token) {
                await db.query(`
                    UPDATE users SET
                        google_access_token = ?,
                        google_token_expiry = ?
                    WHERE userId = ?
                `, [newTokens.access_token, newTokens.expiry_date || null, userId]);
            }
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Pull 3 months back and 6 months forward so the calendar is well-populated
        const timeMin = new Date();
        timeMin.setMonth(timeMin.getMonth() - 3);

        const timeMax = new Date();
        timeMax.setMonth(timeMax.getMonth() + 6);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 250,
            singleEvents: true,
            orderBy: 'startTime'
        });

        const googleEvents = (response.data.items || []).map(ev => {
            // Google events can be all-day (date only) or timed (dateTime)
            const isAllDay = !!(ev.start && ev.start.date && !ev.start.dateTime);
            const startRaw = ev.start.dateTime || ev.start.date || '';
            const endRaw = ev.end.dateTime || ev.end.date || '';

            // Extract just the date portion (YYYY-MM-DD)
            const date = startRaw.substring(0, 10);

            // Extract HH:mm — fallback to '00:00' / '23:59' for all-day events
            const startTime = isAllDay ? '00:00' : startRaw.substring(11, 16);
            const endTime = isAllDay ? '23:59' : endRaw.substring(11, 16);

            return {
                id: 'gcal_' + ev.id,   // prefix so frontend can distinguish
                title: ev.summary || '(No title)',
                type: 'GoogleCalendar',
                date,
                start: startTime,
                end: endTime,
                location: ev.location || '',
                isAllDay,
                color: '#818cf8',          // indigo — visually distinct from TeamForge events
                source: 'google'
            };
        });

        return res.json({ success: true, connected: true, events: googleEvents });

    } catch (err) {
        console.error('[CALENDAR] Error fetching Google events:', err);

        // If it's a 401 / token revoked, clear the connection flag
        if (err.code === 401 || (err.response && err.response.status === 401)) {
            await db.query(
                'UPDATE users SET google_connected = 0 WHERE userId = ?', [userId]
            );
            return res.json({ success: false, connected: false, message: 'Google access revoked — please reconnect' });
        }

        return res.status(500).json({ success: false, message: 'Failed to fetch Google Calendar events' });
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

// ── GOOGLE CALENDAR — Disconnect (revoke + clear tokens) ─────────────────────
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
            try { await oauth2Client.revokeToken(rows[0].google_access_token); } catch (_) { }
        }

        await db.query(`
            UPDATE users SET
                google_access_token  = NULL,
                google_refresh_token = NULL,
                google_token_expiry  = NULL,
                google_connected     = 0
            WHERE userId = ?
        `, [userId]);

        res.json({ success: true });
    } catch (err) {
        console.error('[CALENDAR] Disconnect error:', err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
