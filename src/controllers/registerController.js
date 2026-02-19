const mySqlPool = require('../config/database');

// Create a user and player record
exports.createUser = async (req, res) => {
    const { email, password, firstname, lastname, riotId, gpa, cgpa, currentRank, peakRank, primaryRole, secondaryRole } = req.body;

    try {
        // Validate required fields
        if (!email || !password || !firstname || !lastname || !riotId || !currentRank || !peakRank || !primaryRole) {
            return res.status(400).json({
                message: 'Missing required fields'
            });
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

        // Insert into users table
        const insertUserQuery = `
            INSERT INTO users (email, passwordHash, firstname, lastname, position, status)
            VALUES (?, ?, ?, ?, ?, 'Active')
        `;

        const [userResult] = await mySqlPool.query(insertUserQuery, [
            email,
            password, // In production, hash the password using bcrypt
            firstname,
            lastname,
            'Player' // Default position, can be modified based on requirements
        ]);

        const userId = userResult.insertId;

        // Insert into players table
        const insertPlayerQuery = `
            INSERT INTO players (userId, gameName, tagLine, currentRank, peakRank, primaryRoleId, secondaryRoleId, CGPA, lastGPA, applicationStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `;

        await mySqlPool.query(insertPlayerQuery, [
            userId,
            gameName,
            tagLine,
            currentRank,
            peakRank,
            primaryRole,
            secondaryRole || null,
            cgpa,
            gpa,
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
