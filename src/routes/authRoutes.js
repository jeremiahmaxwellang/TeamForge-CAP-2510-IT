/*
    AUTHENTICATION ROUTES 
    Assigned to: Justin

    Purpose:
    - Contain routes for login, signup, registration
*/

const express = require('express');
const path = require('path');
const mySqlPool = require('../config/database'); // your MySQL pool
const router = express.Router();

// Login page
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'login.html'));
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
router.get('/change_password', (req, res) => {
    res.sendFile(path.join(viewsPath, 'change_password.html'));
});

// --- POST /change_password ---
router.post('/change_password', async (req, res) => {
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

            // Redirect based on role
            switch(user.position) {
                case 'Team Manager':
                    return res.json({ redirect: '/manager_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Player':
                    return res.json({ redirect: '/player_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Team Coach':
                    return res.json({ redirect: '/coach_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Applicant':
                    return res.json({ redirect: '/applicant_dashboard', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                default:
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
router.get('/applicant_dashboard', (req, res) => {
    res.sendFile(path.join(viewsPath, 'applicant_dashboard.html'));
});

// Dashboard pages
router.get('/manager_dashboard.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'manager_dashboard.html'));
});

router.get('/player_dashboard.html', (req, res) => {
    res.sendFile(path.join(viewsPath, 'player_dashboard.html'));
});

router.get('/coach_dashboard.html', (req, res) => {
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

            // Check if first login
            if (user.firstLogin) {
                return res.json({ redirect: '/change_password', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
            }

            // You can store user in session if needed
            // req.session.user = user;

            // Redirect based on role
            switch(user.position) {
                case 'Team Manager':
                    return res.json({ redirect: '/manager_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Player':
                    return res.json({ redirect: '/player_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Team Coach':
                    return res.json({ redirect: '/coach_dashboard.html', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                case 'Applicant':
                    return res.json({ redirect: '/applicant_dashboard', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, position: user.position } });
                default:
                    return res.status(400).send('Role not recognized');
            }
        } else {
            return res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error');
    }
});

module.exports = router;
