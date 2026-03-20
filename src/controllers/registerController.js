const mySqlPool = require('../config/database');
const path = require('path');

// Create a user and player record
exports.createUser = async (req, res) => {
    const { email, password, firstname, lastname, riotId, discord, gpa, cgpa, yearLevel, currentRank, peakRank, primaryRole, secondaryRole } = req.body;

    try {
        const uploadedPhoto = req.files && req.files.profilePhoto;

        // Validate required fields
        if (!email || !password || !firstname || !lastname || !riotId || !discord || !gpa || !cgpa || !yearLevel || !currentRank || !peakRank || !primaryRole || !secondaryRole || !uploadedPhoto) {
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        const allowedMimeTypes = ['image/png', 'image/jpeg'];
        if (!allowedMimeTypes.includes(uploadedPhoto.mimetype)) {
            return res.status(400).json({
                message: 'Invalid photo type. Please upload a PNG or JPEG image.'
            });
        }

        const parsedPrimaryRole = Number.parseInt(primaryRole, 10);
        const parsedSecondaryRole = Number.parseInt(secondaryRole, 10);
        if (!Number.isInteger(parsedPrimaryRole) || !Number.isInteger(parsedSecondaryRole)) {
            return res.status(400).json({
                message: 'Primary and secondary roles are required'
            });
        }

        const ext = path.extname(uploadedPhoto.name || '').toLowerCase();
        const safeExt = ext === '.png' || ext === '.jpg' || ext === '.jpeg'
            ? ext
            : (uploadedPhoto.mimetype === 'image/png' ? '.png' : '.jpg');
        const storedPhotoFileName = `profile_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'profile-photos', storedPhotoFileName);

        // Check if email already exists
        try {
            const [existingUsers] = await mySqlPool.query('SELECT userId FROM users WHERE email = ?', [email])
            if (existingUsers && existingUsers.length > 0) {
                return res.status(400).json({
                    message: 'An account with this email already exists'
                });
            }
        } catch (checkErr) {
            console.error('Error checking duplicate email:', checkErr);
        }

        // Parse Riot ID (format: gameName#tagLine)
        const riotIdParts = riotId.split('#');
        if (riotIdParts.length !== 2) {
            return res.status(400).json({
                message: 'Invalid Riot ID format. Use format: gameName#tagLine'
            });
        }

        const gameName = riotIdParts[0].trim();
        const tagLine = riotIdParts[1].trim();

        await uploadedPhoto.mv(uploadPath);

        // Insert into users table
        const insertUserQuery = `
            INSERT INTO users (email, passwordHash, firstname, lastname, position, discord, status, firstLogin)
            VALUES (?, ?, ?, ?, 'Applicant', ?, 'Active', 0)
        `;

        const [userResult] = await mySqlPool.query(insertUserQuery, [
            email,
            password, // In production, hash the password using bcrypt
            firstname,
            lastname,
            discord
        ]);

        const userId = userResult.insertId;

        // Insert into players table
        const insertPlayerQuery = `
            INSERT INTO players (userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, CGPA, lastGPA, yearLevel, profilePhoto)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await mySqlPool.query(insertPlayerQuery, [
            userId,
            gameName,
            tagLine,
            currentRank,
            peakRank,
            parsedPrimaryRole,
            parsedSecondaryRole,
            cgpa,
            gpa,
            yearLevel,
            storedPhotoFileName
        ]);

        res.status(201).json({
            message: 'User and player created successfully',
            userId: userId
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
};
