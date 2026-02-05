/*
    AUTHENTICATION ROUTES 
    Assigned to: Justin

    Purpose:
    - Contain routes for login, signup, registration
*/

const express = require('express');
const path = require('path');
const router = express.Router();

const viewsPath = path.join(process.cwd(), 'views');

// Login
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'login.html'));
});

// Signup
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/signup.html'));
});

// Registration
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/register.html'));
});

module.exports = router;
