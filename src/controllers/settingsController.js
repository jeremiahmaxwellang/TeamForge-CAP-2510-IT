const db = require('../config/database');
const path = require('path');

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

// 1. Fetch Benchmarks for a specific Role
exports.getBenchmarksByRole = async (req, res) => {
    try {
        const coach = await ensureCoach(req, res);
        if (!coach) return;

        const roleId = req.params.roleId;

        // Fetch all metrics assigned to this role, and LEFT JOIN any existing benchmark values
        const query = `
            SELECT m.metricId, m.metricName, m.metricDescription, 
                   b.benchmarkValue, b.comparator
            FROM metricRoles mr
            JOIN metrics m ON mr.metricId = m.metricId
            LEFT JOIN benchmarks b ON m.metricId = b.metricId AND b.roleId = ?
            WHERE mr.roleId = ?
            ORDER BY m.metricName ASC
        `;
        
        const [benchmarks] = await db.query(query, [roleId, roleId]);
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