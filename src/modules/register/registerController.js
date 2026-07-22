const mySqlPool = require('../../config/database');
const path = require('path');
const academicRequirementsService = require('../../services/academicRequirementsService');

const nodemailer = require('nodemailer'); // temp for testing

// 1. Serve the Signup page
exports.getSignupPage = (req, res) => {
    res.sendFile('signup.html', { root: './src/modules/register' });
};

// 2. Serve the Register page
exports.getRegisterPage = (req, res) => {
    res.sendFile('register.html', { root: './src/modules/register' });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function satisfiesRequirement(value, requirement) {
    if (!requirement || requirement.threshold === null) return true;
    switch (requirement.comparator) {
        case '>':  return value > requirement.threshold;
        case '<':  return value < requirement.threshold;
        case '>=': return value >= requirement.threshold;
        case '<=': return value <= requirement.threshold;
        default:   return true;
    }
}

function buildRequirementMessage(label, requirement) {
    return `${label} must be ${requirement.comparator} ${Number(requirement.threshold).toFixed(2)}.`;
}

/**
 * Parses a CSV buffer/string and extracts GPA and CGPA from the first data row.
 * Expects headers "GPA" and "CGPA" (case-insensitive).
 * Returns { gpa: Number, cgpa: Number } or throws an Error with a user-facing message.
 */
function parseGradesCSV(csvText) {
    const lines = csvText
        .trim()
        .split(/\r?\n/)
        .filter(l => l.trim() !== '');

    if (lines.length < 2) {
        throw new Error('Grades CSV must contain a header row and at least one data row.');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const gpaIdx  = headers.indexOf('gpa');
    const cgpaIdx = headers.indexOf('cgpa');

    if (gpaIdx === -1 || cgpaIdx === -1) {
        throw new Error('Grades CSV must contain "GPA" and "CGPA" columns.');
    }

    const values  = lines[1].split(',').map(v => v.trim());
    const parsedGpa  = Number.parseFloat(values[gpaIdx]);
    const parsedCgpa = Number.parseFloat(values[cgpaIdx]);

    if (!Number.isFinite(parsedGpa) || !Number.isFinite(parsedCgpa)) {
        throw new Error('GPA and CGPA in the CSV must be valid numbers.');
    }

    return { gpa: parsedGpa, cgpa: parsedCgpa };
}

// ── Routes ────────────────────────────────────────────────────────────────────

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
    const {
        email, password, firstname, lastname, riotId, discord,
        yearLevel, currentRank, peakRank, primaryRole, secondaryRole, currentPeriod
    } = req.body;

    // GPA / CGPA arrive via the body (parsed client-side from the CSV) but we
    // also accept the raw CSV file on the server side and re-parse it there as
    // the authoritative source to prevent tampering.
    let parsedGpa, parsedCgpa;

    try {
        const uploadedPhoto  = req.files && req.files.profilePhoto;
        const uploadedCSV    = req.files && req.files.gradesCSV;

        // ── Required field check ─────────────────────────────────────────────
        if (
            !email || !password || !firstname || !lastname ||
            !riotId || !discord || !yearLevel || !currentRank ||
            !peakRank || !primaryRole || !secondaryRole ||
            !uploadedPhoto || !currentPeriod
        ) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // ── Resolve GPA / CGPA ────────────────────────────────────────────────
        // Priority 1: re-parse the uploaded CSV on the server (most trustworthy)
        // Priority 2: fall back to the numeric values the client sent in the body
        if (uploadedCSV) {
            try {
                const csvText = uploadedCSV.data
                    ? uploadedCSV.data.toString('utf8')      // Buffer (express-fileupload default)
                    : (await uploadedCSV.mv && '');           // mv-only object – shouldn't happen for text

                // express-fileupload exposes the raw buffer in .data
                const csvBuffer = uploadedCSV.data;
                if (!csvBuffer) {
                    throw new Error('Could not read CSV content.');
                }

                const parsed = parseGradesCSV(csvBuffer.toString('utf8'));
                parsedGpa    = parsed.gpa;
                parsedCgpa   = parsed.cgpa;
            } catch (csvErr) {
                return res.status(400).json({ message: `Grades CSV error: ${csvErr.message}` });
            }
        } else {
            // Fallback: client-submitted body values (still validated below)
            const rawGpa  = req.body.gpa;
            const rawCgpa = req.body.cgpa;

            if (rawGpa === undefined || rawGpa === null || rawGpa === '' ||
                rawCgpa === undefined || rawCgpa === null || rawCgpa === '') {
                return res.status(400).json({
                    message: 'Please upload a grades CSV or provide GPA and CGPA values.'
                });
            }

            parsedGpa  = Number.parseFloat(rawGpa);
            parsedCgpa = Number.parseFloat(rawCgpa);
        }

        // ── Validate GPA / CGPA ───────────────────────────────────────────────
        if (!Number.isFinite(parsedGpa) || !Number.isFinite(parsedCgpa)) {
            return res.status(400).json({ message: 'GPA and CGPA must be valid numbers.' });
        }

        if (parsedGpa < 0 || parsedGpa > 9999.99) {
            return res.status(400).json({ message: 'GPA must be between 0 and 9999.99.' });
        }

        if (parsedCgpa < 0 || parsedCgpa > 9999.99) {
            return res.status(400).json({ message: 'CGPA must be between 0 and 9999.99.' });
        }

        // ── Photo validation ──────────────────────────────────────────────────
        const allowedMimeTypes = ['image/png', 'image/jpeg'];
        if (!allowedMimeTypes.includes(uploadedPhoto.mimetype)) {
            return res.status(400).json({
                message: 'Invalid photo type. Please upload a PNG or JPEG image.'
            });
        }

        // ── Role parsing ──────────────────────────────────────────────────────
        const parsedPrimaryRole   = Number.parseInt(primaryRole, 10);
        const parsedSecondaryRole = Number.parseInt(secondaryRole, 10);
        const parsedCurrentPeriod = Number.parseInt(currentPeriod, 10);

        if (!Number.isInteger(parsedPrimaryRole) || !Number.isInteger(parsedSecondaryRole)) {
            return res.status(400).json({ message: 'Primary and secondary roles are required.' });
        }

        // ── Academic requirements check ───────────────────────────────────────
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

        // ── Riot ID parsing ───────────────────────────────────────────────────
        const riotIdParts = riotId.split('#');
        if (riotIdParts.length !== 2) {
            return res.status(400).json({
                message: 'Invalid Riot ID format. Use format: gameName#tagLine'
            });
        }

        const gameName = riotIdParts[0].trim();
        const tagLine  = riotIdParts[1].trim();

        if (tagLine.length === 0) {
            return res.status(400).json({ message: 'Tagline cannot be empty.' });
        }
        if (tagLine.length > 5) {
            return res.status(400).json({ message: 'Tagline cannot exceed 5 characters.' });
        }

        // ── Photo upload ──────────────────────────────────────────────────────
        const ext = path.extname(uploadedPhoto.name || '').toLowerCase();
        const safeExt = (ext === '.png' || ext === '.jpg' || ext === '.jpeg')
            ? ext
            : (uploadedPhoto.mimetype === 'image/png' ? '.png' : '.jpg');
        const storedPhotoFileName =
            `profile_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
        const uploadPath = path.join(
            process.cwd(), 'public', 'uploads', 'profile-photos', storedPhotoFileName
        );

        // ── Duplicate email check ─────────────────────────────────────────────
        try {
            const [existingUsers] = await mySqlPool.query(
                'SELECT userId FROM users WHERE email = ?', [email]
            );
            if (existingUsers && existingUsers.length > 0) {
                return res.status(400).json({
                    message: 'An account with this email already exists.'
                });
            }
        } catch (checkErr) {
            console.error('Error checking duplicate email:', checkErr);
        }

        await uploadedPhoto.mv(uploadPath);

        // ── Insert user ───────────────────────────────────────────────────────
        const insertUserQuery = `
            INSERT INTO users (email, passwordHash, firstname, lastname, position, discord, status, firstLogin)
            VALUES (?, ?, ?, ?, 'Applicant', ?, 'Active', 0)
        `;
        const [userResult] = await mySqlPool.query(insertUserQuery, [
            email,
            password, // Hash with bcrypt in production
            firstname,
            lastname,
            discord
        ]);

        const userId = userResult.insertId;

        // ── Insert player ─────────────────────────────────────────────────────
        const insertPlayerQuery = `
            INSERT INTO players
                (userId, gameName, tagLine, currentRank, peakRank,
                 primaryRoleId, secondaryRoleId, CGPA, lastGPA, yearLevel, profilePhoto)
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

        // ── Insert application ────────────────────────────────────────────────
        const insertApplicantQuery = `
            INSERT INTO applications (periodId, userId, primaryRoleId) VALUES (?, ?, ?)
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

        if (error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
            const columnMatch = error.sqlMessage && error.sqlMessage.match(/column '(\w+)'/);
            const columnName  = columnMatch ? columnMatch[1] : 'value';
            return res.status(400).json({
                message: `${columnName} value is out of range. Maximum allowed is 9999.99`
            });
        }

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'This account information already exists in the system.'
            });
        }

        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
};