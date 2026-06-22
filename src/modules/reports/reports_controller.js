/**
 * Reports Controller
 * - contains the SQL Query for inserting/fetching scrim info
 */

const db = require("../../config/database");

// 1. Serve the HTML page
exports.getReportsPage = (req, res) => {
    res.sendFile('reports.html', { root: './src/modules/reports' }); // Adjust root if your html is somewhere else
};

// Get current players
exports.getCurrentPlayers = async (req, res) => {

    try {

        const [rows] = await db.query(
            `SELECT
                l.roleId, l.displayedRole,
                COUNT(*) AS role_count,
                COUNT(CASE WHEN p.yearLevel = '4th Year' THEN 1 END) AS is_leaving,
                (COUNT(*) - COUNT(CASE WHEN p.yearLevel = '4th Year' THEN 1 END)) AS players_left
            FROM users u
            JOIN players p ON u.userId = p.userId
            JOIN leagueroles l ON p.primaryRoleId = l.roleId
            WHERE u.position = 'Player'
            GROUP BY l.roleId, l.displayedRole
            ORDER BY l.roleId;
        `);

        console.log(rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'not found' });
        }

        res.json(rows);
        
    } catch (err) { 
        console.error("Error:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get applicant roles
exports.getApplicantRoles = async (req, res) => {

    try {

        const [rows] = await db.query(
            `SELECT 
                l.displayedRole,
                COUNT(*) AS role_count,
                ROUND(
                    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 
                    2
                ) AS role_percentage
            FROM users u
            JOIN players p ON u.userId = p.userId
            JOIN leagueroles l ON p.primaryRoleId = l.roleId
            WHERE u.position = 'Applicant'
            GROUP BY l.displayedRole
            `);

        console.log(rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'not found' });
        }

        res.json(rows);
        
    } catch (err) { 
        console.error("Error:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get applicant statuses
exports.getApplicantStatuses = async (req, res) => {

    try {

        const [rows] = await db.query(
            `SELECT
                a.status,
                ap.startDate, ap.endDate,
                COUNT(*) AS applicant_count,
                ROUND(
                    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 
                    2
                ) AS status_percentage
            FROM applications a
            JOIN application_periods ap ON a.periodId = ap.periodId
            WHERE ap.periodId = (
                SELECT MAX(periodId) 
                FROM application_periods
            )
            GROUP BY a.status, ap.startDate, ap.endDate;
        `);

        console.log(rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'not found' });
        }

        res.json(rows);
        
    } catch (err) { 
        console.error("Error:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get Num of Applications per Period /applications_total
exports.getApplicationsEachPeriod = async (req, res) => {

    try {

        const [rows] = await db.query(
            `SELECT 
                ap.periodId,
                ap.startDate,
                ap.endDate,
                COUNT(a.userId) AS registrations
            FROM application_periods ap
            LEFT JOIN applications a 
                ON a.periodId = ap.periodId
            GROUP BY ap.periodId, ap.startDate, ap.endDate
            ORDER BY ap.periodId DESC;
        `);

        console.log(rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'not found' });
        }

        res.json(rows);
        
    } catch (err) { 
        console.error("Error:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get best performing applicants based on last 15 role-matching games
exports.getBestPerformingApplicants = async (req, res) => {

    try {

        const [rows] = await db.query(
            `SELECT
                u.userId,
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(u.firstname, ''), ' ', COALESCE(u.lastname, ''))), ''),
                    CONCAT(COALESCE(p.gameName, 'Applicant'), '#', COALESCE(p.tagLine, ''))
                ) AS applicantName,
                l.displayedRole AS roleApplied,
                ROUND(
                    COALESCE(
                        SUM(CASE WHEN recent.win = 'W' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(recent.win), 0),
                        0
                    ),
                    1
                ) AS winrate,
                COUNT(recent.win) AS gamesCount
            FROM users u
            JOIN players p ON p.userId = u.userId
            JOIN leagueroles l ON l.roleId = p.primaryRoleId
            LEFT JOIN (
                SELECT ranked.puuid, ranked.teamPosition, ranked.win
                FROM (
                    SELECT
                        mp.puuid,
                        mp.teamPosition,
                        mp.win,
                        ROW_NUMBER() OVER (
                            PARTITION BY mp.puuid, mp.teamPosition
                            ORDER BY COALESCE(m.gameStartTimestamp, m.gameCreation) DESC
                        ) AS rowNum
                    FROM matchparticipants mp
                    JOIN matches m ON m.matchId = mp.matchId
                ) ranked
                WHERE ranked.rowNum <= 15
            ) recent
                ON recent.puuid = p.puuid
                AND recent.teamPosition = l.teamPosition
            WHERE u.position = 'Applicant'
            GROUP BY u.userId, applicantName, l.displayedRole
            ORDER BY winrate DESC, gamesCount DESC, applicantName ASC;
        `);

        res.json(rows);

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get applicants ranked by latest submitted communication rating from evaluations
exports.getBestCommunicationApplicants = async (req, res) => {

    try {

        const [rows] = await db.query(
            `SELECT
                u.userId,
                COALESCE(
                    NULLIF(TRIM(CONCAT(COALESCE(u.firstname, ''), ' ', COALESCE(u.lastname, ''))), ''),
                    CONCAT(COALESCE(p.gameName, 'Applicant'), '#', COALESCE(p.tagLine, ''))
                ) AS applicantName,
                l.displayedRole AS roleApplied,
                COALESCE(aeLatest.ratingCommunication, 0) AS communicationRating,
                COALESCE(aeSummary.evaluationsCount, 0) AS evaluationsCount
            FROM users u
            JOIN players p ON p.userId = u.userId
            JOIN leagueroles l ON l.roleId = p.primaryRoleId
            LEFT JOIN (
                SELECT
                    userId,
                    MAX(evaluationId) AS latestEvaluationId,
                    COUNT(*) AS evaluationsCount
                FROM applicantevaluations
                WHERE ratingCommunication BETWEEN 1 AND 5
                GROUP BY userId
            ) aeSummary ON aeSummary.userId = u.userId
            LEFT JOIN applicantevaluations aeLatest ON aeLatest.evaluationId = aeSummary.latestEvaluationId
            WHERE u.position = 'Applicant' OR aeSummary.latestEvaluationId IS NOT NULL
            ORDER BY communicationRating DESC, evaluationsCount DESC, applicantName ASC;
        `);

        res.json(rows);

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// GET Tournaments
// changed to cap2 events table
exports.getTournamentResultsReport = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                e.eventId,
                e.title_summary  AS name,
                e.start_date     AS tournamentDate,
                e.win            AS result,
                e.status,
                e.location
            FROM events e
            WHERE e.type = 'Tournament'
            ORDER BY e.start_date DESC`
        );

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (err) {
        console.error('Error fetching tournament results:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching tournament report data',
            error: err.message
        });
    }
};

// Fetch Term Dates
exports.getTermDates = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT termName, DATE_FORMAT(startDate, "%Y-%m-%d") as start, DATE_FORMAT(endDate, "%Y-%m-%d") as end FROM academic_terms ORDER BY termId ASC');
        
        // If the table is empty, provide defaults
        if (rows.length === 0) {
            return res.json({
                success: true,
                termDateRanges: {
                    'Term 1': { start: '2025-05-01', end: '2025-08-31' },
                    'Term 2': { start: '2025-09-01', end: '2025-12-31' },
                    'Term 3': { start: '2026-01-01', end: '2026-04-30' }
                }
            });
        }

        // Map database rows into the format the frontend expects
        const termDateRanges = {};
        rows.forEach(row => {
            termDateRanges[row.termName] = { start: row.start, end: row.end };
        });

        res.json({ success: true, termDateRanges });
    } catch (err) {
        console.error('Error fetching term dates:', err);
        // Fallback to defaults if the table doesn't exist yet
        res.json({
            success: true,
            termDateRanges: {
                'Term 1': { start: '2025-05-01', end: '2025-08-31' },
                'Term 2': { start: '2025-09-01', end: '2025-12-31' },
                'Term 3': { start: '2026-01-01', end: '2026-04-30' }
            }
        });
    }
};