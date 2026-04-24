/*
    AUTHENTICATION ROUTES 
    Assigned to: Justin

    Purpose:
    - Contain routes for login, signup, registration
*/

const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const mySqlPool = require('../config/database');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const router = express.Router();

// ── GOOGLE OAUTH ──────────────────────────────────────────
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.SECRET_ID,
    process.env.REDIRECT
);

// GET /google — redirect to Google consent screen
router.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
        include_granted_scopes: true
    });
    res.redirect(url);
});

// GET /google/redirect — Google callback
router.get('/google/redirect', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('/?error=no_code');

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: googleUser } = await oauth2.userinfo.get();

        const [rows] = await mySqlPool.query(
            'SELECT * FROM users WHERE email = ?', [googleUser.email]
        );

        if (!rows.length)                    return res.redirect('/?error=not_registered');
        if (rows[0].status === 'Deactivated') return res.redirect('/?error=deactivated');

        const user = rows[0];
        setAuthCookies(res, user);
        console.log(user);
        return redirectByRole(res, user);

    } catch (err) {
        console.error('[GOOGLE LOGIN]', err);
        return res.redirect('/?error=oauth_failed');
    }
});

// ── GOOGLE CALENDAR | TODO: Move to calendar_routes.js ───────────────────────────────────────
router.get('/google/calendars', (req, res) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.calendarList.list({}, (err, response) => {
        if (err) { console.error(err); return res.status(500).end('Error'); }
        res.json(response.data.items);
    });
});

router.get('/google/events', (req, res) => {
    const calendarId = req.query.calendar ?? 'primary';
    const calendar   = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.events.list({
        calendarId,
        timeMin:      new Date().toISOString(),
        maxResults:   100,
        singleEvents: true,
        orderBy:      'startTime'
    }, (err, response) => {
        if (err) { console.error(err); return res.status(500).end('Error'); }
        res.json(response.data.items);
    });
});

// ── HELPERS ───────────────────────────────────────────────
function setAuthCookies(res, user) {
    res.cookie('userRole', user.position, {
        httpOnly: true, sameSite: 'lax', secure: false,
        maxAge: 8 * 60 * 60 * 1000
    });
    res.cookie('userId', String(user.userId), {
        httpOnly: true, sameSite: 'lax', secure: false,
        maxAge: 8 * 60 * 60 * 1000
    });
}

function clearAuthCookies(res) {
    res.clearCookie('userRole');
    res.clearCookie('userId');
}

function redirectByRole(res, user) {
    // First login -> force password change
    if (user.firstLogin) {
        return res.redirect('/change_password');
    }

    switch (user.position) {
        case 'Team Manager': return res.redirect('/manager_dashboard.html');
        case 'Team Coach':   return res.redirect('/coach_dashboard.html');
        case 'Player':       return res.redirect('/player_analysis');
        case 'Applicant':    return res.redirect('/applicant_dashboard');
        default:
            clearAuthCookies(res);
            return res.redirect('/?error=unknown_role');
    }
}

function redirectByRoleJson(res, user) {
    const userPayload = {
        firstname: user.firstname,
        lastname:  user.lastname,
        email:     user.email,
        position:  user.position
    };

    if (user.firstLogin) {
        return res.json({ redirect: '/change_password', user: userPayload });
    }

    switch (user.position) {
        case 'Team Manager': return res.json({ redirect: '/manager_dashboard.html', user: userPayload });
        case 'Team Coach':   return res.json({ redirect: '/coach_dashboard.html',   user: userPayload });
        case 'Player':       return res.json({ redirect: '/player_analysis',         user: userPayload });
        case 'Applicant':    return res.json({ redirect: '/applicant_dashboard',     user: userPayload });
        default:
            clearAuthCookies(res);
            return res.status(400).send('Role not recognized');
    }
}

async function requireCoachRole(req, res, next) {
    try {
        const role = req.cookies && req.cookies.userRole;
        const userId = req.cookies && req.cookies.userId;

        if (role !== 'Team Coach' || !userId) {
            clearAuthCookies(res);
            return res.redirect('/');
        }

        const [rows] = await mySqlPool.query(
            'SELECT userId, position FROM users WHERE userId = ?',
            [userId]
        );

        if (!rows.length || rows[0].position !== 'Team Coach') {
            clearAuthCookies(res);
            return res.redirect('/');
        }

        return next();
    } catch (err) {
        console.error(err);
        clearAuthCookies(res);
        return res.redirect('/');
    }
}

function requireRole(requiredRole) {
    return (req, res, next) => {
        if (req.cookies && req.cookies.userRole === requiredRole) {
            return next();
        }

        return res.redirect('/');
    };
}

function requireAnyRole(allowedRoles) {
    return (req, res, next) => {
        const role = req.cookies && req.cookies.userRole;
        const userId = req.cookies && req.cookies.userId;

        if (userId && allowedRoles.includes(role)) {
            return next();
        }

        clearAuthCookies(res);
        return res.redirect('/');
    };
}

// Login page
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'login.html'));
});

// Logout endpoint
router.get('/logout', (req, res) => {
    clearAuthCookies(res);
    res.redirect('/');
});

// Signup page
router.get('/signup', (req, res) => {
    res.sendFile(path.join(viewsPath, 'signup.html'));
});

// Registration page
router.get('/register', (req, res) => {
    res.sendFile(path.join(viewsPath, 'register.html'));
});

// Change password page
router.get('/change_password', requireAnyRole(['Team Manager', 'Team Coach', 'Player', 'Applicant', 'Sub']), (req, res) => {
    res.sendFile(path.join(viewsPath, 'change_password.html'));
});

// --- POST /change_password ---
router.post('/change_password', requireAnyRole(['Team Manager', 'Team Coach', 'Player', 'Applicant', 'Sub']), async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Update password and set firstLogin to 0
        const [result] = await mySqlPool.query(
            'UPDATE users SET passwordHash = ?, firstLogin = 0 WHERE email = ?',
            [newPassword, email]
        );

        if (result.affectedRows > 0) {
            // Get updated user
            const [rows] = await mySqlPool.query('SELECT * FROM users WHERE email = ?', [email]);
            const user = rows[0];

            setAuthCookies(res, user);

            switch (user.position) {
                case 'Team Manager':
                    return res.json({ redirect: '/manager_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Player':
                    return res.json({ redirect: '/player_analysis', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Team Coach':
                    return res.json({ redirect: '/coach_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Applicant':
                    return res.json({ redirect: '/applicant_dashboard', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                default:
                    clearAuthCookies(res);
                    return res.status(400).send('Role not recognized');
            }
        } else {
            return res.status(400).send('Failed to update password');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error');
    }
});

// Applicant dashboard page
router.get('/applicant_dashboard', requireRole('Applicant'), (req, res) => {
    res.sendFile(path.join(viewsPath, 'applicant_dashboard.html'));
});

// Dashboard pages
router.get('/manager_dashboard.html', requireRole('Team Manager'), (req, res) => {
    res.sendFile(path.join(viewsPath, 'manager_dashboard.html'));
});

router.get('/player_dashboard.html', requireRole('Player'), (req, res) => {
    res.redirect('/player_analysis');
});

router.get('/coach_dashboard.html', requireCoachRole, (req, res) => {
    res.sendFile(path.join(viewsPath, 'coach_dashboard.html'));
});

// --- POST /login ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check user in DB
        const [rows] = await mySqlPool.query(
            'SELECT * FROM users WHERE email = ? AND passwordHash = ?',
            [email, password]
        );

        if (rows.length > 0) {
            const user = rows[0];

            // Block deactivated accounts from logging in
            if (user.status === 'Deactivated') {
                clearAuthCookies(res);
                return res.status(403).send('Your account has been deactivated. Please contact the team manager.');
            }

            // Check if first login
            if (user.firstLogin) {
                setAuthCookies(res, user);
                return res.json({ redirect: '/change_password', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
            }

            // You can store user in session if needed
            // req.session.user = user;

            setAuthCookies(res, user);

            switch (user.position) {
                case 'Team Manager':
                    return res.json({ redirect: '/manager_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Player':
                    return res.json({ redirect: '/player_analysis', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Team Coach':
                    return res.json({ redirect: '/coach_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Applicant':
                    return res.json({ redirect: '/applicant_dashboard', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                default:
                    clearAuthCookies(res);
                    return res.status(400).send('Role not recognized');
            }
        } else {
            clearAuthCookies(res);
            return res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error');
    }
});

module.exports = router;
