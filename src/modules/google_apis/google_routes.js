const express = require('express');
const { google } = require('googleapis');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const router = express.Router();

/**
 * Note:
 * On Google Cloud OAuth Client ID,
 * make sure to input the following:
 * 
 * 1. Authorized JavaScript origins
 * http://localhost:3000
 * 
 * 2. Authorized redirect URIs
 * http://localhost:3000/redirect
 */
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.SECRET_ID,
    process.env.REDIRECT
);


/**
 * Route to Sign in with Google
 * /google
 */
router.get('/', (req, res) => {
    // Read Only
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        include_granted_scopes: true

    });

    res.redirect(url);

});

// http://localhost:3000/google/redirect
router.get('/redirect', async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await oauth2Client.getToken(code); // get tokens
        oauth2Client.setCredentials(tokens);
        res.send('Successfully logged in');
    } catch (err) {
        console.error('Error retrieving access token', err);
        res.send('Error');
    }
});

// http://localhost:3000/google/calendars
router.get('/calendars', (req, res) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.calendarList.list({}, (err, response) => {
        if (err) {
            console.error('error fetching calendars', err);
            res.end('Error');
            return;
        }
        const calendars = response.data.items;
        res.json(calendars);
    });
})

// http://localhost:3000/google/events
router.get('/events', (req, res) => {
    const calendarId = req.query.calendar ?? 'primary';
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(), // must be ISO string
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime'
    }, (err, response) => {
        if (err) {
            console.error('error fetching events', err);
            res.end('Error');
            return;
        }
        const events = response.data.items;
        res.json(events);
    })
})

module.exports = router;