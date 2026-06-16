const db = require("../../config/database");
const path = require('path');
const riotApiKeyService = require('../../services/riotApiKeyService');
const academicRequirementsService = require('../../services/academicRequirementsService');

const DEFAULT_TEAM_NAME = 'Viridis Arcus';
const DEFAULT_TEAM_LOGO_FILE = 'VA_logo.png';

async function getAuthenticatedUser(req) {
    const userId = req.cookies && req.cookies.userId;
    if (!userId) return null;

    const [rows] = await db.query(
        'SELECT userId, position, passwordHash FROM users WHERE userId = ?',
        [userId]
    );

    return rows.length ? rows[0] : null;
}

async function ensureCoach(req, res) {
    const user = await getAuthenticatedUser(req);
    if (!user || user.position !== 'Team Coach') {
        res.status(403).json({ success: false, message: 'Only Team Coaches can access benchmark settings.' });
        return null;
    }
    return user;
}

async function ensureRiotApiKeyManager(req, res) {
    const user = await getAuthenticatedUser(req);
    const allowedRoles = ['Team Manager', 'Team Coach'];

    if (!user || !allowedRoles.includes(user.position)) {
        res.status(403).json({ success: false, message: 'Only Team Managers and Team Coaches can manage the Riot API key.' });
        return null;
    }

    return user;
}

async function ensureManager(req, res) {
    const user = await getAuthenticatedUser(req);
    if (!user || user.position !== 'Team Manager') {
        res.status(403).json({ success: false, message: 'Only Team Managers can manage team settings.' });
        return null;
    }

    return user;
}

async function ensureTeamDetailsRow() {
    const [rows] = await db.query(
        'SELECT teamName, teamIcon FROM teamDetails LIMIT 1'
    );

    if (!rows.length) {
        await db.query(
            'INSERT INTO teamDetails (teamName, teamIcon) VALUES (?, ?)',
            [DEFAULT_TEAM_NAME, DEFAULT_TEAM_LOGO_FILE]
        );

        return {
            teamName: DEFAULT_TEAM_NAME,
            teamIcon: DEFAULT_TEAM_LOGO_FILE
        };
    }

    const teamName = rows[0].teamName || DEFAULT_TEAM_NAME;
    const teamIcon = rows[0].teamIcon || DEFAULT_TEAM_LOGO_FILE;

    if (!rows[0].teamIcon || !rows[0].teamName) {
        await db.query(
            'UPDATE teamDetails SET teamName = ?, teamIcon = ? WHERE teamName = ?',
            [teamName, teamIcon, rows[0].teamName]
        );
    }

    return {
        teamName,
        teamIcon
    };
}

function resolveTeamLogoUrl(teamIcon) {
    return `/uploads/team-logos/${teamIcon || DEFAULT_TEAM_LOGO_FILE}`;
}

// Serve the HTML Page
exports.getPage = (req, res) => {
    res.sendFile('settings.html', { root: './src/modules/settings' }); // Adjust root if your html is somewhere else
};

exports.getTeamDetails = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Not logged in.' });
        }

        const teamDetails = await ensureTeamDetailsRow();

        return res.status(200).json({
            success: true,
            teamName: teamDetails.teamName,
            teamIcon: teamDetails.teamIcon,
            teamLogoUrl: resolveTeamLogoUrl(teamDetails.teamIcon)
        });
    } catch (error) {
        console.error('Error fetching team details:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch team details.' });
    }
};

exports.updateTeamDetails = async (req, res) => {
    try {
        const manager = await ensureManager(req, res);
        if (!manager) return;

        await ensureTeamDetailsRow();

        const [rows] = await db.query(
            'SELECT teamName, teamIcon FROM teamDetails LIMIT 1'
        );

        const currentTeamName = rows.length ? (rows[0].teamName || DEFAULT_TEAM_NAME) : DEFAULT_TEAM_NAME;
        const currentTeamIcon = rows.length ? (rows[0].teamIcon || DEFAULT_TEAM_LOGO_FILE) : DEFAULT_TEAM_LOGO_FILE;

        const requestedTeamName = String(req.body?.teamName || '').trim();
        const nextTeamName = requestedTeamName || currentTeamName;

        if (nextTeamName.length > 45) {
            return res.status(400).json({ success: false, message: 'Team name must not exceed 45 characters.' });
        }

        const uploadedTeamLogo = req.files && req.files.teamLogo;
        let nextTeamIcon = currentTeamIcon;

        if (uploadedTeamLogo) {
            const allowedMimeTypes = ['image/png', 'image/jpeg'];
            if (!allowedMimeTypes.includes(uploadedTeamLogo.mimetype)) {
                return res.status(400).json({ success: false, message: 'Only PNG and JPEG files are allowed.' });
            }

            const ext = path.extname(uploadedTeamLogo.name || '').toLowerCase();
            const safeExt = ext === '.png' || ext === '.jpg' || ext === '.jpeg'
                ? ext
                : (uploadedTeamLogo.mimetype === 'image/png' ? '.png' : '.jpg');
            const storedTeamLogoFileName = `team_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
            const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'team-logos', storedTeamLogoFileName);

            await uploadedTeamLogo.mv(uploadPath);
            nextTeamIcon = storedTeamLogoFileName;
        }

        if (rows.length) {
            await db.query(
                'UPDATE teamDetails SET teamName = ?, teamIcon = ? WHERE teamName = ?',
                [nextTeamName, nextTeamIcon, rows[0].teamName]
            );
        } else {
            await db.query(
                'INSERT INTO teamDetails (teamName, teamIcon) VALUES (?, ?)',
                [nextTeamName, nextTeamIcon]
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Team settings updated successfully.',
            teamName: nextTeamName,
            teamIcon: nextTeamIcon,
            teamLogoUrl: resolveTeamLogoUrl(nextTeamIcon),
            updatedBy: manager.userId
        });
    } catch (error) {
        console.error('Error updating team details:', error);
        return res.status(500).json({ success: false, message: 'Failed to update team settings.' });
    }
};

// 0. Update password for the currently logged-in user
exports.changePassword = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Not logged in.' });
        }

        const allowedRoles = ['Team Manager', 'Team Coach', 'Player'];
        if (!allowedRoles.includes(user.position)) {
            return res.status(403).json({ success: false, message: 'You are not allowed to update password from this page.' });
        }

        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ success: false, message: 'Please complete all password fields.' });
        }

        if (user.passwordHash !== oldPassword) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
        }

        if (newPassword.length < 4) {
            return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
        }

        await db.query(
            'UPDATE users SET passwordHash = ?, firstLogin = 0 WHERE userId = ?',
            [newPassword, user.userId]
        );

        return res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ success: false, message: 'Failed to change password.' });
    }
};

// 0.5 Update profile photo for the currently logged-in user
exports.changeProfilePhoto = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Not logged in.' });
        }

        const allowedRoles = ['Team Manager', 'Team Coach', 'Player'];
        if (!allowedRoles.includes(user.position)) {
            return res.status(403).json({ success: false, message: 'You are not allowed to update profile photo from this page.' });
        }

        const uploadedPhoto = req.files && req.files.profilePhoto;
        if (!uploadedPhoto) {
            return res.status(400).json({ success: false, message: 'Please choose a photo to upload.' });
        }

        const allowedMimeTypes = ['image/png', 'image/jpeg'];
        if (!allowedMimeTypes.includes(uploadedPhoto.mimetype)) {
            return res.status(400).json({ success: false, message: 'Only PNG and JPEG files are allowed.' });
        }

        const ext = path.extname(uploadedPhoto.name || '').toLowerCase();
        const safeExt = ext === '.png' || ext === '.jpg' || ext === '.jpeg'
            ? ext
            : (uploadedPhoto.mimetype === 'image/png' ? '.png' : '.jpg');
        const storedPhotoFileName = `profile_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'profile-photos', storedPhotoFileName);

        await uploadedPhoto.mv(uploadPath);

        // Some Team Manager/Team Coach accounts may not have a players row yet.
        // Create one with a safe default primary role so photo storage is available for all allowed roles.
        await db.query(
            `INSERT INTO players (userId, primaryRoleId, profilePhoto)
             VALUES (?, 1, ?)
             ON DUPLICATE KEY UPDATE profilePhoto = VALUES(profilePhoto)`,
            [user.userId, storedPhotoFileName]
        );

        return res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully.',
            profilePhoto: storedPhotoFileName,
            profilePhotoUrl: `/uploads/profile-photos/${storedPhotoFileName}`
        });
    } catch (error) {
        console.error('Error updating profile photo:', error);
        return res.status(500).json({ success: false, message: 'Failed to update profile photo.' });
    }
};

exports.getRiotApiKeyStatus = async (req, res) => {
    try {
        const user = await ensureRiotApiKeyManager(req, res);
        if (!user) return;

        const status = await riotApiKeyService.getActiveRiotApiKeyStatus();
        return res.status(200).json({ success: true, ...status });
    } catch (error) {
        console.error('Error fetching Riot API key status:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch Riot API key status.' });
    }
};

exports.updateRiotApiKey = async (req, res) => {
    try {
        const user = await ensureRiotApiKeyManager(req, res);
        if (!user) return;

        const apiKey = String(req.body?.apiKey || '').trim();
        if (!apiKey) {
            return res.status(400).json({ success: false, message: 'Please enter a Riot API key.' });
        }

        const result = await riotApiKeyService.setActiveRiotApiKey(apiKey, user.userId);

        return res.status(200).json({
            success: true,
            message: 'Riot API key updated successfully.',
            maskedKey: result.maskedKey
        });
    } catch (error) {
        console.error('Error updating Riot API key:', error);
        return res.status(500).json({ success: false, message: 'Failed to update Riot API key.' });
    }
};

exports.getAcademicRequirements = async (req, res) => {
    try {
        const coach = await ensureCoach(req, res);
        if (!coach) return;

        const requirements = await academicRequirementsService.getAcademicRequirements();
        return res.status(200).json({ success: true, requirements });
    } catch (error) {
        console.error('Error fetching academic requirements:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch academic requirements.' });
    }
};

exports.updateAcademicRequirements = async (req, res) => {
    try {
        const coach = await ensureCoach(req, res);
        if (!coach) return;

        const requirements = req.body && req.body.requirements;
        if (!requirements || typeof requirements !== 'object') {
            return res.status(400).json({ success: false, message: 'Invalid academic requirements payload.' });
        }

        const updatedRequirements = await academicRequirementsService.updateAcademicRequirements(requirements, coach.userId);
        return res.status(200).json({
            success: true,
            message: 'Academic requirements updated successfully.',
            requirements: updatedRequirements
        });
    } catch (error) {
        console.error('Error updating academic requirements:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update academic requirements.'
        });
    }
};

// 1. Fetch Benchmarks for a specific Role
exports.getBenchmarksByRole = async (req, res) => {
    try {
        const coach = await ensureCoach(req, res);
        if (!coach) return;

        const roleId = req.params.roleId;
        const query = `
            SELECT m.metricId, m.metricName, m.metricDescription, 
                   b.benchmarkValue, b.comparator
            FROM benchmarks b
            JOIN metrics m ON b.metricId = m.metricId
            WHERE b.roleId = ?
            ORDER BY m.metricName ASC
        `;
        
        const [benchmarks] = await db.query(query, [roleId]);
        res.status(200).json({ success: true, benchmarks });
    } catch (error) {
        console.error('Error fetching benchmarks:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch benchmarks.' });
    }
};

// 2. Save/Update Benchmarks
exports.updateBenchmarks = async (req, res) => {
    try {
        const coach = await ensureCoach(req, res);
        if (!coach) return;

        const { roleId, updates } = req.body; // updates is an array of { metricId, comparator, value }

        if (!roleId || !updates || !Array.isArray(updates)) {
            return res.status(400).json({ success: false, message: 'Invalid data format.' });
        }

        // Loop through and upsert each benchmark
        for (let update of updates) {
            // First, check if a benchmark already exists for this metric + role combo
            const checkQuery = `SELECT benchmarkId FROM benchmarks WHERE metricId = ? AND roleId = ?`;
            const [existing] = await db.query(checkQuery, [update.metricId, roleId]);

            if (existing.length > 0) {
                // Update existing
                const updateQuery = `UPDATE benchmarks SET comparator = ?, benchmarkValue = ? WHERE benchmarkId = ?`;
                await db.query(updateQuery, [update.comparator, update.value, existing[0].benchmarkId]);
            } else {
                // Insert new
                const insertQuery = `INSERT INTO benchmarks (metricId, roleId, comparator, benchmarkValue) VALUES (?, ?, ?, ?)`;
                await db.query(insertQuery, [update.metricId, roleId, update.comparator, update.value]);
            }
        }

        res.status(200).json({ success: true, message: 'Benchmarks updated successfully!' });
    } catch (error) {
        console.error('Error updating benchmarks:', error);
        res.status(500).json({ success: false, message: 'Failed to update benchmarks.' });
    }
};