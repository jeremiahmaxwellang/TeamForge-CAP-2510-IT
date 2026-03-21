const mySqlPool = require('../config/database');
const path = require('path');
const academicRequirementsService = require('../services/academicRequirementsService');

function satisfiesRequirement(value, requirement) {
    if (!requirement || requirement.threshold === null) {
        return true;
    }

    switch (requirement.comparator) {
        case '>':
            return value > requirement.threshold;
        case '<':
            return value < requirement.threshold;
        case '>=':
            return value >= requirement.threshold;
        case '<=':
            return value <= requirement.threshold;
        default:
            return true;
    }
}

function buildRequirementMessage(label, requirement) {
    return `${label} must be ${requirement.comparator} ${Number(requirement.threshold).toFixed(2)}.`;
}

exports.getAcademicRequirements = async (req, res) => {
    try {
        const requirements = await academicRequirementsService.getAcademicRequirements();
        res.status(200).json({ success: true, requirements });
    } catch (error) {
        console.error('Error fetching academic requirements for registration:', error);
        res.status(500).json({ success: false, message: 'Failed to load academic requirements.' });
    }
};

// Create a user and player record
exports.createUser = async (req, res) => {
    const { email, password, firstname, lastname, riotId, discord, gpa, cgpa, yearLevel, currentRank, peakRank, primaryRole, secondaryRole, currentPeriod } = req.body;

    try {
        const uploadedPhoto = req.files && req.files.profilePhoto;

        // Validate required fields
        if (!email || !password || !firstname || !lastname || !riotId || !discord || !gpa || !cgpa || !yearLevel || !currentRank || !peakRank || !primaryRole || !secondaryRole || !uploadedPhoto || !currentPeriod) {
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

        const parsedCurrentPeriod = Number.parseInt(currentPeriod, 10);
        const parsedGpa = Number.parseFloat(gpa);
        const parsedCgpa = Number.parseFloat(cgpa);

        if (!Number.isInteger(parsedPrimaryRole) || !Number.isInteger(parsedSecondaryRole)) {
            return res.status(400).json({
                message: 'Primary and secondary roles are required'
            });
        }

        if (!Number.isFinite(parsedGpa) || !Number.isFinite(parsedCgpa)) {
            return res.status(400).json({
                message: 'GPA and CGPA must be valid numbers.'
            });
        }

        const academicRequirements = await academicRequirementsService.getAcademicRequirements();

        if (!satisfiesRequirement(parsedGpa, academicRequirements.gpa)) {
            return res.status(400).json({
                message: buildRequirementMessage('GPA', academicRequirements.gpa)
            });
        }

        if (!satisfiesRequirement(parsedCgpa, academicRequirements.cgpa)) {
            return res.status(400).json({
                message: buildRequirementMessage('CGPA', academicRequirements.cgpa)
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
            parsedCgpa,
            parsedGpa,
            yearLevel,
            storedPhotoFileName
        ]);

        // Insert into applicants table
        const insertApplicantQuery = `
            INSERT INTO applications (periodId, userId, primaryRoleId) VALUES
            (?, ?, ?)
        `;

        await mySqlPool.query(insertApplicantQuery, [
            parsedCurrentPeriod,
            userId,
            parsedPrimaryRole
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