/**
 * Reports Controller
 * - contains the SQL Query for inserting/fetching scrim info
 */

const db = require("../config/database");

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
            JOIN leagueRoles l ON p.primaryRoleId = l.roleId
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
            JOIN leagueRoles l ON p.primaryRoleId = l.roleId
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
            JOIN leagueRoles l ON l.roleId = p.primaryRoleId
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
                    FROM matchParticipants mp
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