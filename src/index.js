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
// for shared assets (style.css, sidebar.js, images, fonts)
app.use(express.static(path.join(process.cwd(), './public')));

global.viewsPath = path.join(process.cwd(), 'views');

// =================== Login =================== 
app.use("/", require("./routes/authRoutes")); // login routes

// =================== Announcements Module =================== 
app.use('/announcements/static', express.static(path.join(__dirname, 'modules/announcements/public')));
app.use('/announcements', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/announcements/announcements_routes')); // announcement routes

// =================== Attendance Module =================== 
app.use('/attendance/static',    express.static(path.join(__dirname, 'modules/attendance/public')));
app.use('/attendance', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/attendance/attendance_routes')); // attendance routes

// =================== Calendar Scheduling Module =================== 
app.use('/calendar/static',      express.static(path.join(__dirname, 'modules/calendar/public')));
app.use('/calendar', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/calendar/calendar_routes')); // calendar routes

// =================== Recruitment Module ===================
app.use('/recruitment/static',      express.static(path.join(__dirname, 'modules/recruitment/public')));
app.use('/recruitment', require("./modules/recruitment/recruitment_routes")); // just gets the recruitment period

app.get('/applicant_list/getbyemail', require('./controllers/applicant_listController').getApplicantByEmail); // Allow users to fetch their own application data without needing Coach privileges
app.post('/applicant_list/claim_spot', require('./controllers/applicant_listController').claimRosterSpot); // Allow applicants to press the Claim Spot button
app.get('/applicant_list/report_data', requireAnyRole(['Team Manager', 'Team Coach']), require('./controllers/applicant_listController').getReportData); // Allow both managers and coaches to download applicant report
app.use('/applicant_list', requireRole('Team Coach'), require('./routes/applicant_listRoutes')); // applicant list routes

// =================== Register =================== 
app.use('/register/static',       express.static(path.join(__dirname, 'modules/register/public')));
app.use('/register', require("./modules/register/registerRoutes")); // register routes

// =================== Reports Module =================== 
app.use('/reports/static',       express.static(path.join(__dirname, 'modules/reports/public')));
app.use('/reports', requireAnyRole(['Team Manager', 'Team Coach']), require('./modules/reports/reports_routes'));

// =================== Tournaments Module =================== 
app.use('/tournaments/static',       express.static(path.join(__dirname, 'modules/tournaments/public'))); // public css and js
app.use('/tournament', requireRole('Team Coach'), require('./modules/tournaments/tournament_routes')); // tournament routes

// =================== Settings Page =================== 
app.use('/settings/static',       express.static(path.join(__dirname, 'modules/settings/public'))); // public css and js
app.use('/settings', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/settings/settings_routes')); // Settings Routes

// Routes
app.use('/events', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/calendar/event_routes'));

app.use('/player_analysis', requireAnyRole(['Team Coach', 'Player']), require('./routes/playerAnalysisRoutes'));
app.use('/riot', requireAnyRole(['Team Coach', 'Player']), require('./routes/riotApiRoutes'));

app.use('/team_management', requireRole('Team Manager'), require('./routes/team_managementRoutes')); // team management routes

app.use('/coach_dashboard', requireRole('Team Coach'), require('./routes/coachDashboardRoutes')); // coach dashboard
app.use('/manager_dashboard', requireRole('Team Manager'), require('./routes/managerDashboardRoutes')); // Give the Manager their own secure API lane


app.get('/api/user/profile', async (req, res) => {
    try {
        const userId = req.cookies && req.cookies.userId;
        
        if (!userId) {
            return res.status(401).json({ error: "Not logged in" });
        }

        // Query the database for the user's details and the saved profile photo, if available.
        const [rows] = await mySqlPool.query(
            `SELECT u.position, u.firstname, u.lastname, p.profilePhoto
             FROM users u
             LEFT JOIN players p ON p.userId = u.userId
             WHERE u.userId = ?`,
            [userId]
        );

        if (rows.length > 0) {
            const photoFile = rows[0].profilePhoto || 'defaultusericon.png';
            res.json({
                name: `${rows[0].firstname} ${rows[0].lastname}`,
                firstname: rows[0].firstname,
                lastname: rows[0].lastname,
                role: rows[0].position,
                position: rows[0].position,
                profilePhoto: photoFile,
                profilePhotoUrl: `/uploads/profile-photos/${photoFile}`
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

app.use('/api/v1/users', require("./routes/userRoutes"));




mySqlPool.query('SELECT 1').then(() => {
    console.log('MySQL DB Connected');
})
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// --- GET CURRENT USER ROLE ---
app.get('/api/current-role', async (req, res) => {
    try {
        // Grab the userId from the cookie (adjust if your cookie is named differently)
        const userId = req.cookies.userId; 
        
        if (!userId) {
            return res.status(401).json({ success: false, role: 'Guest' });
        }

        // Query the database for their exact position
        const [rows] = await mySqlPool.query('SELECT position FROM users WHERE userId = ?', [userId]);
        
        if (rows.length > 0) {
            res.status(200).json({ success: true, role: rows[0].position });
        } else {
            res.status(404).json({ success: false, role: 'Guest' });
        }
    } catch (error) {
        console.error("Error fetching role:", error);
        res.status(500).json({ success: false, role: 'Guest' });
    }
});