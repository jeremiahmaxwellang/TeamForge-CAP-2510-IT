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
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true
}));

// Middleware to handle file upload errors and return JSON
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE' || (err.message && err.message.includes('File size'))) {
        return res.status(413).json({
            success: false,
            message: 'File size exceeds the maximum allowed limit of 50MB'
        });
    }
    next(err);
});

app.use(cookieParser());

function isApiRequest(req) {
    return req.originalUrl.includes('/api/');
}

function requireRole(requiredRole) {
    return async (req, res, next) => {
        try {
            const role = req.cookies?.userRole;
            const userId = req.cookies?.userId;

            // No active login
            if (!role || !userId) {
                res.clearCookie('userRole');
                res.clearCookie('userId');

                if (isApiRequest(req)) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required.'
                    });
                }

                return res.redirect('/');
            }

            const [rows] = await mySqlPool.query(
                'SELECT userId, position FROM users WHERE userId = ?',
                [userId]
            );

            // Invalid or stale authentication cookies
            if (!rows.length || rows[0].position !== role) {
                res.clearCookie('userRole');
                res.clearCookie('userId');

                if (isApiRequest(req)) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid or expired session.'
                    });
                }

                return res.redirect('/');
            }

            // Valid user, but wrong role for this route.
            // Do not destroy their valid login session.
            if (role !== requiredRole) {
                if (isApiRequest(req)) {
                    return res.status(403).json({
                        success: false,
                        message: `This endpoint requires the ${requiredRole} role.`
                    });
                }

                return res.status(403).send('Forbidden');
            }

            return next();
        } catch (error) {
            console.error('Role authorization error:', error);

            if (isApiRequest(req)) {
                return res.status(500).json({
                    success: false,
                    message: 'Unable to authorize request.'
                });
            }

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
app.use("/", require("./routes/authRoutes"));

// =================== Announcements Module ===================
app.get('/get-latest-announcement', require('./modules/announcements/announcements_controller').getLatestAnnouncement);
app.use('/announcements/static', express.static(path.join(__dirname, 'modules/announcements/public')));
app.use('/announcements', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/announcements/announcements_routes'));

// =================== Attendance Module ===================
app.use('/attendance/static', express.static(path.join(__dirname, 'modules/attendance/public')));
app.use('/attendance', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/attendance/attendance_routes'));

// =================== Calendar Scheduling Module ===================
app.use('/calendar/static', express.static(path.join(__dirname, 'modules/calendar/public')));
app.use('/calendar', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/calendar/calendar_routes'));

// =================== Recruitment Module ===================
app.use('/recruitment/static', express.static(path.join(__dirname, 'modules/recruitment/public')));
app.use('/recruitment', require("./modules/recruitment/recruitment_routes"));

app.get('/get-my-application', require('./modules/recruitment/applicant_list_controller').getApplicantByEmail);
app.post('/claim_spot', require('./modules/recruitment/applicant_list_controller').claimRosterSpot);
app.get('/applicant_list/report_data', requireAnyRole(['Team Manager', 'Team Coach']), require('./modules/recruitment/applicant_list_controller').getReportData);

app.use('/applicant_list', requireRole('Team Coach'), require('./modules/recruitment/applicant_list_routes'));

// =================== Register ===================
app.use('/register/static', express.static(path.join(__dirname, 'modules/register/public')));
app.use('/register', require("./modules/register/registerRoutes"));

// =================== Reports Module ===================
app.use('/reports/static', express.static(path.join(__dirname, 'modules/reports/public')));
app.use('/reports', requireAnyRole(['Team Manager', 'Team Coach']), require('./modules/reports/reports_routes'));

// =================== Tournaments Module ===================
app.use('/tournaments/static', express.static(path.join(__dirname, 'modules/tournaments/public')));
app.use('/tournament', requireRole('Team Coach'), require('./modules/tournaments/tournament_routes'));

// =================== Settings Page ===================
app.use('/settings/static', express.static(path.join(__dirname, 'modules/settings/public')));
app.use('/settings', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/settings/settings_routes'));

// Routes
app.use('/events', requireAnyRole(['Team Manager', 'Team Coach', 'Player']), require('./modules/calendar/event_routes'));

app.use('/player_analysis', requireAnyRole(['Team Coach', 'Player']), require('./routes/playerAnalysisRoutes'));
app.use('/riot', requireAnyRole(['Team Coach', 'Player']), require('./routes/riotApiRoutes'));

app.use('/team_management', requireRole('Team Manager'), require('./routes/team_managementRoutes'));

app.use('/coach_dashboard', requireRole('Team Coach'), require('./routes/coachDashboardRoutes'));
app.use('/manager_dashboard', requireRole('Team Manager'), require('./routes/managerDashboardRoutes'));

app.get('/api/user/profile', async (req, res) => {
    try {
        const userId = req.cookies && req.cookies.userId;

        if (!userId) {
            return res.status(401).json({ error: "Not logged in" });
        }

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

// --- GET CURRENT USER ROLE ---
// FIXED: moved above app.listen() and protected by requireAnyRole so
// unauthenticated requests cannot probe user roles.
app.get(
    '/api/current-role',
    requireAnyRole(['Team Manager', 'Team Coach', 'Player']),
    async (req, res) => {
        try {
            const userId = req.cookies.userId;

            if (!userId) {
                return res.status(401).json({ success: false, role: 'Guest' });
            }

            const [rows] = await mySqlPool.query(
                'SELECT position FROM users WHERE userId = ?',
                [userId]
            );

            if (rows.length > 0) {
                res.status(200).json({ success: true, role: rows[0].position });
            } else {
                res.status(404).json({ success: false, role: 'Guest' });
            }
        } catch (error) {
            console.error("Error fetching role:", error);
            res.status(500).json({ success: false, role: 'Guest' });
        }
    }
);

mySqlPool.query('SELECT 1').then(() => {
    console.log('MySQL DB Connected');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});