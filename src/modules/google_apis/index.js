// ACCESS THROUGH BROWSER: localhost:3000
// temp index file for oauth google integration
// node src/modules/oauth/index.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const { google } = require('googleapis');

const app = express();
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
const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.SECRET, process.env.REDIRECT);

app.get('/', (req, res) => {
    // const url = oauth2Client.generateAuthUrl({
    //     scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
    //     access_type: 'online',
    //     include_granted_scopes: 'true',
    //     response_type: 'code',
    //     state: 'there',
    //     client_id: process.env.CLIENT_ID
    //     redirect_uri: 'http://localhost:3000/redirect'
    // });

    // Read Only
    // Error: Missing required parameter: redirect_uri
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/calendar.readonly',

        redirect_uri: process.env.REDIRECT,
        client_id: process.env.CLIENT_ID

    });
    res.redirect(url);

});

app.get('/redirect', (req, res) => {
    const code = req.query.code;
    oauth2Client.getToken((code, (err, tokens) => {
        if (err) {
            console.error(`Couldn't get token`, err);
            res.send('Error');
            return;
        }
        oauth2Client.setCredentials(tokens);
        res.send('Successfully logged in');

    }))
})

app.get('/calendars', (req, res) => {
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

app.get('/events', (req, res) => {
    const calendarId = req.query.calendar ?? 'primary';
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.events.list({
        calendarId,
        timeMin: (new Date()).toString(),
        maxResults: 15,
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

app.listen(3000, () => console.log('Server running at 3000'));