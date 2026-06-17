const db = require('../config/database');

// Placeholder: Fetch simplified active player list for the Manager Dashboard
exports.getPlayerList = async (req, res) => {
    try {
        const query = `
            SELECT p.gameName, u.firstname, u.lastname, r1.displayedRole AS primaryRole
            FROM users u 
            JOIN players p ON u.userId = p.userId 
            JOIN leagueroles r1 ON p.primaryRoleId = r1.roleId 
            WHERE u.position = 'Player' AND u.status = 'Active' 
            ORDER BY r1.roleId ASC
        `;
        const [players] = await db.query(query);
        res.status(200).json({ success: true, players });
    } catch (error) {
        console.error('Error fetching manager player list:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch roster.' });
    }
};