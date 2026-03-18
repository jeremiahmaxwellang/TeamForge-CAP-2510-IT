const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const mySqlPool = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", 'hbs');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
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
app.get('/applicant_list/getbyemail', require('./controllers/applicant_listController').getApplicantByEmail); // Allow users to fetch their own application data without needing Coach privileges
app.post('/applicant_list/claim_spot', require('./controllers/applicant_listController').claimRosterSpot); // Allow applicants to press the Claim Spot button
app.use('/applicant_list', requireRole('Team Coach'), require('./routes/applicant_listRoutes')); // applicant list routes
app.use('/player_analysis', requireRole('Team Coach'), require('./routes/playerAnalysisRoutes'));
app.use('/riot', requireRole('Team Coach'), require('./routes/riotApiRoutes'));
app.use('/team_management', requireRole('Team Manager'), require('./routes/team_managementRoutes')); // team management routes
app.use('/announcements', requireRole('Team Manager'), require('./routes/announcementRoutes')); // announcement routes
app.use('/tournament', requireRole('Team Coach'), require('./routes/tournamentRoutes')); // tournament routes
app.use('/coach_dashboard', requireRole('Team Coach'), require('./routes/coachDashboardRoutes')); // coach dashboard
app.use('/settings', require('./routes/settingsRoutes')); // user settings

app.get('/api/user/profile', async (req, res) => {
    try {
        const userId = req.cookies && req.cookies.userId;
        
        if (!userId) {
            return res.status(401).json({ error: "Not logged in" });
        }

        // Query the database for the user's details
        const [rows] = await mySqlPool.query(
            'SELECT position, firstName, lastName FROM users WHERE userId = ?', 
            [userId]
        );

        if (rows.length > 0) {
            // Adjust firstName and lastName to match your actual database column names
            res.json({
                name: `${rows[0].firstName} ${rows[0].lastName}`, 
                role: rows[0].position
            });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});

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

