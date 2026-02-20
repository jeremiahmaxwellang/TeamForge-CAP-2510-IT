const mySqlPool = require('../config/database');

// Get all applicants
exports.getAllApplicants = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.userId,
                u.firstname,
                u.lastname,
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
