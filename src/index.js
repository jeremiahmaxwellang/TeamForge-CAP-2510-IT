const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const mySqlPool = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", 'hbs');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true
}));
app.use(cookieParser());

function requireRole(requiredRole) {
    return async (req, res, next) => {
        try {
            const role = req.cookies && req.cookies.userRole;
            const userId = req.cookies && req.cookies.userId;

            if (role !== requiredRole || !userId) {
                res.clearCookie('userRole');
                res.clearCookie('userId');
                return res.redirect('/');
            }

            const [rows] = await mySqlPool.query(
                'SELECT userId, position FROM users WHERE userId = ?',
                [userId]
            );

            if (!rows.length || rows[0].position !== requiredRole) {
                res.clearCookie('userRole');
                res.clearCookie('userId');
                return res.redirect('/');
            }

            return next();
        } catch (err) {
            console.error(err);
            res.clearCookie('userRole');
            res.clearCookie('userId');
            return res.redirect('/');
        }
    };
}

function requireAnyRole(allowedRoles) {
    return async (req, res, next) => {
        try {
            const role = req.cookies && req.cookies.userRole;
            const userId = req.cookies && req.cookies.userId;

            if (!allowedRoles.includes(role) || !userId) {
                res.clearCookie('userRole');
                res.clearCookie('userId');
                return res.redirect('/');
            }

            const [rows] = await mySqlPool.query(
                'SELECT userId, position FROM users WHERE userId = ?',
                [userId]
            );

            if (!rows.length || !allowedRoles.includes(rows[0].position)) {
                res.clearCookie('userRole');
                res.clearCookie('userId');
                return res.redirect('/');
            }

            return next();
        } catch (err) {
            console.error(err);
            res.clearCookie('userRole');
            res.clearCookie('userId');
            return res.redirect('/');
        }
    };
}

async function requireCoachRole(req, res, next) {
    try {
        const role = req.cookies && req.cookies.userRole;
        const userId = req.cookies && req.cookies.userId;

        if (role !== 'Team Coach' || !userId) {
            res.clearCookie('userRole');
            res.clearCookie('userId');
            return res.redirect('/');
        }

        const [rows] = await mySqlPool.query(
            'SELECT userId, position FROM users WHERE userId = ?',
            [userId]
        );

        if (!rows.length || rows[0].position !== 'Team Coach') {
            res.clearCookie('userRole');
            res.clearCookie('userId');
            return res.redirect('/');
        }

        return next();
    } catch (err) {
        console.error(err);
        res.clearCookie('userRole');
        res.clearCookie('userId');
        return res.redirect('/');
    }
}

// Serve static files from the "public" directory
app.use(express.static(path.join(process.cwd(), './public')));
global.viewsPath = path.join(process.cwd(), 'views');

// Routes 
app.use("/", require("./routes/authRoutes")); // login routes
app.use('/register', require("./routes/registerRoutes")); // registration routes
app.use('/applicant_list', requireRole('Team Coach'), require('./routes/applicant_listRoutes')); // applicant list routes
app.use('/player_analysis', requireAnyRole(['Team Coach', 'Player']), require('./routes/playerAnalysisRoutes'));
app.use('/riot', requireAnyRole(['Team Coach', 'Player']), require('./routes/riotApiRoutes'));
app.use('/team_management', requireRole('Team Manager'), require('./routes/team_managementRoutes')); // team management routes
app.use('/announcements', requireRole('Team Manager'), require('./routes/announcementRoutes')); // announcement routes
app.use('/tournament', requireRole('Team Coach'), require('./routes/tournamentRoutes')); // tournament routes

// Backward-compatible URL aliases for applicant profile page
app.get('/applicant_profile', (req, res) => {
    if (!req.cookies || req.cookies.userRole !== 'Team Coach' || !req.cookies.userId) {
        res.clearCookie('userRole');
        res.clearCookie('userId');
        return res.redirect('/');
    }

    res.redirect('/applicant_list/profile');
});

app.get('/applicant_profile.html', (req, res) => {
    if (!req.cookies || req.cookies.userRole !== 'Team Coach' || !req.cookies.userId) {
        res.clearCookie('userRole');
        res.clearCookie('userId');
        return res.redirect('/');
    }

    res.redirect('/applicant_list/profile');
});

// Backward-compatible URL for pages linking to /tournament.html
app.get('/tournament.html', (req, res) => {
    if (!req.cookies || req.cookies.userRole !== 'Team Coach' || !req.cookies.userId) {
        res.clearCookie('userRole');
        res.clearCookie('userId');
        return res.redirect('/');
    }

    res.redirect('/tournament');
});

app.use('/api/v1/users', require("./routes/userRoutes"));




mySqlPool.query('SELECT 1').then(() => {
    console.log('MySQL DB Connected');
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

