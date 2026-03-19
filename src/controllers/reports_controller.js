/**
 * Reports Controller
 * - contains the SQL Query for inserting/fetching scrim info
 */

const db = require("../config/database");

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