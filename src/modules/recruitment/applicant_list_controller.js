const mySqlPool = require('../../config/database');
const nodemailer = require('nodemailer');

// 1. Serve the Applicant List
exports.getApplicantListPage = (req, res) => {
    res.sendFile('applicant_list.html', { root: './src/modules/recruitment' });
};

// 1. Serve the Applicant Profile
exports.getApplicantProfile = (req, res) => {
    res.sendFile('applicant_profile.html', { root: './src/modules/recruitment' });
};

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
                p.peakRank AS peakRank,
                p.currentRank AS currentRank,
                p.course,         
                p.yearLevel,      
                p.lastGPA,
                p.CGPA,
                p.puuid,
                a.status AS applicationStatus
            FROM users u
            JOIN players p ON u.userId = p.userId
            JOIN applications a ON a.userId = p.userId
            WHERE a.periodId = (
                SELECT MAX(periodId) 
                FROM application_periods
            )
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
            return res.status(400).json({ success: false, message: 'Email parameter is required' });
        }

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
                p.peakRank AS peakRank,
                p.currentRank AS currentRank,
                p.course,         
                p.yearLevel,      
                p.lastGPA,
                p.CGPA,
                p.puuid,
                a.status AS applicationStatus
            FROM users u
            JOIN players p ON u.userId = p.userId
            JOIN applications a ON a.userId = p.userId
            WHERE u.email = ?
            AND a.periodId = (
                SELECT MAX(periodId) 
                FROM application_periods
            )
            ORDER BY u.createdAt DESC
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


// Get Team Details
async function getTeamName() {
    const [rows] = await mySqlPool.query('SELECT teamName FROM teamdetails LIMIT 1');
    return rows.length ? rows[0].teamName : '';
}

// Save Coach Evaluation (Ratings, Notes, and Status)
exports.saveEvaluation = async (req, res) => {
    // We use a transaction so if one query fails, it cancels both to prevent corrupted data
    const connection = await mySqlPool.getConnection();

    try {
        const {
            userId,
            notes,
            gameSense,
            communication,
            champPool,
            status
        } = req.body;

        const coachId = req.cookies && req.cookies.userId;

        if (!userId || !coachId) {
            return res.status(400).json({ success: false, message: 'Applicant ID and Coach ID are required or your session expired.' });
        }

        await connection.beginTransaction();

        // 1. Upsert coach evaluation for this applicant so future edits overwrite prior values
        const [existingEvalRows] = await connection.query(
            `SELECT evaluationId
             FROM applicantevaluations
             WHERE userId = ? AND coachId = ?
             ORDER BY evaluationId DESC
             LIMIT 1`,
            [userId, coachId]
        );

        if (existingEvalRows.length > 0) {
            const updateEvalQuery = `
                UPDATE applicantevaluations
                SET comment = ?,
                    ratingGameSense = ?,
                    ratingCommunication = ?,
                    ratingChampionPool = ?,
                    evaluatedAt = CURRENT_TIMESTAMP
                WHERE evaluationId = ?
            `;
            await connection.query(updateEvalQuery, [
                notes,
                gameSense,
                communication,
                champPool,
                existingEvalRows[0].evaluationId
            ]);
        } else {
            const insertEvalQuery = `
                INSERT INTO applicantevaluations
                (userId, coachId, comment, ratingGameSense, ratingCommunication, ratingChampionPool)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await connection.query(insertEvalQuery, [userId, coachId, notes, gameSense, communication, champPool]);
        }

        // DONE: USE APPLICATIONS TABLE FOR STATUS
        // 2. Update their final Accept/Reject status in the applications table
        const updateStatusQuery = `
            UPDATE applications 
            SET status = ?
            WHERE userId = ?
        `;
        await connection.query(updateStatusQuery, [status, userId]);

        await connection.commit();

        // AUTOMATED EMAIL LOGIC 
        const teamName = await getTeamName();

        try {
            // 1. Fetch the applicant's name and email
            const [userRows] = await connection.query('SELECT firstname, email FROM users WHERE userId = ?', [userId]);

            if (userRows.length > 0) {
                const user = userRows[0];

                // 2. Set up the email sender
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                // 3. Draft the email based on the Coach's decision
                let subject = '';
                let text = '';

                if (status === 'Accepted') {
                    subject = `Congratulations! Welcome to ${teamName}`;
                    text = `Hi ${user.firstname},\n\nGreat news! The coaching staff has reviewed your application and you have been accepted into ${teamName}.\n\nPlease log in to your dashboard to claim your roster spot and view your new team access.\n\nWelcome to the team!\n- TeamForge Management`;
                } else if (status === 'Rejected') {
                    subject = `${teamName} Application Update`;
                    text = `Hi ${user.firstname},\n\nThank you for applying to ${teamName}. We appreciate the time you took to share your stats and gameplay with us.\n\nUnfortunately, we have decided to move forward with other candidates who better fit our current roster needs at this time. We wish you the best of luck in your future matches.\n\n- TeamForge Management`;
                }

                // 4. Send the email
                if (subject && text) {
                    await transporter.sendMail({
                        from: `"TeamForge" <${process.env.EMAIL_USER}>`,
                        to: user.email,
                        subject: subject,
                        text: text
                    });
                    console.log(`[Email System] Notification sent to ${user.email} for status: ${status}`);
                }
            }
        } catch (emailError) {
            // If the email fails, we just log it. We don't want to crash the whole app 
            // since the database update was already successful!
            console.error('[Email System] Failed to send email:', emailError);
        }

        res.status(200).json({ success: true, message: 'Evaluation securely saved!' });
    } catch (error) {
        await connection.rollback();
        console.error('Error saving applicant evaluation:', error);
        res.status(500).json({ success: false, message: 'Database error while saving evaluation.' });
    } finally {
        connection.release();
    }
};

// Allow an accepted applicant to claim their spot and become a Player
exports.claimRosterSpot = async (req, res) => {
    try {
        const userId = req.cookies && req.cookies.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Not logged in' });

        // 1. Promote them in the database
        const updateQuery = `UPDATE users SET position = 'Player' WHERE userId = ?`;
        await mySqlPool.query(updateQuery, [userId]);

        // 2. Overwrite their old 'Applicant' cookie with a new 'Player' cookie
        res.cookie('userRole', 'Player', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 8 * 60 * 60 * 1000
        });

        // 3. Send them to their new home
        res.status(200).json({ success: true, redirect: '/player_dashboard.html' });
    } catch (err) {
        console.error("Error claiming roster spot:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// REJECT APPLICANT
exports.rejectApplicant = async (req, res) => {
    try {
        const { applicantId } = req.body;

        if (!applicantId) {
            return res.status(400).json({ success: false, message: 'Applicant ID is required.' });
        }

        const updateQuery = `UPDATE applications SET status = 'Rejected' WHERE userId = ?`;

        // Changed db.query to mySqlPool.query
        const [result] = await mySqlPool.query(updateQuery, [applicantId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Applicant not found or already processed.' });
        }

        res.status(200).json({ success: true, message: 'Applicant has been rejected.' });

    } catch (error) {
        console.error('Error rejecting applicant:', error);
        res.status(500).json({ success: false, message: 'Database error while rejecting applicant.' });
    }
};

// Get latest saved evaluation for a specific applicant by the logged-in coach
exports.getEvaluationByApplicant = async (req, res) => {
    try {
        const userId = Number.parseInt(req.params.userId, 10);
        const coachId = req.cookies && req.cookies.userId;

        if (!userId || !coachId) {
            return res.status(400).json({ success: false, message: 'Applicant ID and Coach ID are required or your session expired.' });
        }

        const [rows] = await mySqlPool.query(
            `SELECT 
                ae.evaluationId,
                ae.userId,
                ae.coachId,
                ae.comment,
                ae.ratingGameSense,
                ae.ratingCommunication,
                ae.ratingChampionPool,
                ae.evaluatedAt,
                a.status AS applicationStatus
             FROM applicantevaluations ae
             LEFT JOIN applications a ON a.userId = ae.userId
             WHERE ae.userId = ? AND ae.coachId = ?
             ORDER BY ae.evaluationId DESC
             LIMIT 1`,
            [userId, coachId]
        );

        if (!rows.length) {
            return res.status(200).json({ success: true, evaluation: null });
        }

        return res.status(200).json({ success: true, evaluation: rows[0] });
    } catch (error) {
        console.error('Error fetching applicant evaluation:', error);
        return res.status(500).json({ success: false, message: 'Database error while fetching evaluation.' });
    }
};

// Get ALL applicants + their stats specifically for the PDF Report
exports.getReportData = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.userId, u.firstname, u.lastname, p.gameName, p.tagLine, p.primaryRoleId,
                m.metricName, ps.metricValue
            FROM users u
            JOIN players p ON u.userId = p.userId
            JOIN applications a ON u.userId = p.userId
            LEFT JOIN playerstatistics ps ON ps.userId = u.userId
            LEFT JOIN metrics m ON ps.metricId = m.metricId
            WHERE a.periodId = (SELECT MAX(periodId) FROM application_periods)
              AND a.status = 'Pending'
        `;
        const [rows] = await mySqlPool.query(query);

        // Group the flat SQL rows into structured objects per applicant
        const applicantsMap = {};
        rows.forEach(row => {
            if (!applicantsMap[row.userId]) {
                applicantsMap[row.userId] = {
                    userId: row.userId,
                    riotId: `${row.gameName}#${row.tagLine}`,
                    roleId: row.primaryRoleId,
                    stats: {}
                };
            }
            if (row.metricName) {
                applicantsMap[row.userId].stats[row.metricName] = row.metricValue;
            }
        });

        res.json({ success: true, applicants: Object.values(applicantsMap) });
    } catch (error) {
        console.error("Error fetching report data:", error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

// GET current (latest) application period
exports.getCurrentPeriod = async (req, res) => {
    try {
        const [rows] = await mySqlPool.query(
            `SELECT periodId, startDate, endDate FROM application_periods ORDER BY periodId DESC LIMIT 1`
        );
        if (!rows.length) return res.json({ success: true, period: null });
        res.json({ success: true, period: rows[0] });
    } catch (error) {
        console.error('Error fetching current period:', error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
};

// POST start a new application period
exports.startNewPeriod = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        if (!startDate || !endDate)
            return res.status(400).json({ success: false, message: 'Start and end dates are required.' });

        await mySqlPool.query(
            `INSERT INTO application_periods (startDate, endDate) VALUES (?, ?)`,
            [startDate, endDate]
        );
        res.json({ success: true, message: 'New application period started!' });
    } catch (error) {
        console.error('Error starting period:', error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
};

// PUT edit dates of the current (latest) period
exports.editPeriodDates = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        if (!startDate || !endDate)
            return res.status(400).json({ success: false, message: 'Start and end dates are required.' });

        const [result] = await mySqlPool.query(
            `UPDATE application_periods SET startDate = ?, endDate = ?
             WHERE periodId = (SELECT MAX(periodId) FROM (SELECT periodId FROM application_periods) AS sub)`,
            [startDate, endDate]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'No active period found.' });

        res.json({ success: true, message: 'Dates updated successfully!' });
    } catch (error) {
        console.error('Error editing period:', error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
};

// PUT end the current period (sets endDate to today)
exports.endCurrentPeriod = async (req, res) => {
    try {
        const [result] = await mySqlPool.query(
            `UPDATE application_periods SET endDate = CURDATE()
             WHERE periodId = (SELECT MAX(periodId) FROM (SELECT periodId FROM application_periods) AS sub)`
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'No active period found.' });

        res.json({ success: true, message: 'Application period ended.' });
    } catch (error) {
        console.error('Error ending period:', error);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
};