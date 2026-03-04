const mySqlPool = require('../config/database');

// Get all applicants
exports.getAllApplicants = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.userId,
                u.firstname,
                u.lastname,
                u.email,          
                u.discord,        
                p.gameName,
                p.tagLine,
                p.primaryRoleId,
                p.secondaryRoleId,
                p.peakRank,
                p.currentRank,
                p.course,         
                p.yearLevel,      
                p.lastGPA,
                p.CGPA,
                p.applicationStatus
            FROM users u
            JOIN players p ON u.userId = p.userId
            WHERE u.position = 'Applicant'
            ORDER BY u.createdAt DESC
        `;

        const [applicants] = await mySqlPool.query(query);

        res.status(200).json({
            success: true,
            applicants: applicants
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applicants',
            error: error.message
        });
    }
};

// Get applicant by email
exports.getApplicantByEmail = async (req, res) => {
    try {
        const email = req.query.email;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email parameter is required'
            });
        }

        const query = `
            SELECT 
                u.userId,
                u.firstname,
                u.lastname,
                u.email,
                p.gameName,
                p.tagLine,
                p.primaryRoleId,
                p.secondaryRoleId,
                p.peakRank,
                p.currentRank,
                p.lastGPA,
                p.CGPA,
                p.applicationStatus
            FROM users u
            JOIN players p ON u.userId = p.userId
            WHERE u.email = ? AND u.position = 'Applicant'
        `;

        const [applicants] = await mySqlPool.query(query, [email]);

        if (applicants.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }

        res.status(200).json({
            success: true,
            applicant: applicants[0]
        });
    } catch (error) {
        console.error('Error fetching applicant:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applicant',
            error: error.message
        });
    }
};

// Save Coach Evaluation (Ratings, Notes, and Status)
exports.saveEvaluation = async (req, res) => {
    // We use a transaction so if one query fails, it cancels both to prevent corrupted data
    const connection = await mySqlPool.getConnection();
    
    try {
        const { 
            userId, 
            coachId, 
            notes, 
            gameSense, 
            communication, 
            champPool, 
            status 
        } = req.body;

        if (!userId || !coachId) {
            return res.status(400).json({ success: false, message: 'Applicant ID and Coach ID are required.' });
        }

        await connection.beginTransaction();

        // 1. Insert the ratings and notes into our new table
        const insertEvalQuery = `
            INSERT INTO applicantEvaluations 
            (userId, coachId, comment, ratingGameSense, ratingCommunication, ratingChampionPool) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.query(insertEvalQuery, [userId, coachId, notes, gameSense, communication, champPool]);

        // 2. Update their final Accept/Reject status in the players table
        const updateStatusQuery = `
            UPDATE players 
            SET applicationStatus = ? 
            WHERE userId = ?
        `;
        await connection.query(updateStatusQuery, [status, userId]);

        await connection.commit();
        
        res.status(200).json({ success: true, message: 'Evaluation securely saved!' });
    } catch (error) {
        await connection.rollback();
        console.error('Error saving applicant evaluation:', error);
        res.status(500).json({ success: false, message: 'Database error while saving evaluation.' });
    } finally {
        connection.release();
    }
};
