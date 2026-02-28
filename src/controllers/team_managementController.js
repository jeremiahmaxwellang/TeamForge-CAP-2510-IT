// Team Management Controller
// - Contains queries for team management page

const db = require("../config/database");

// GET ALL USERS WITH PLAYER DATA
const getAllUsersWithPlayerData = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.userId,
                u.firstname,
                u.lastname,
                u.email,
                u.position,
                u.status,
                COALESCE(CONCAT(p.gameName, '#', p.tagLine), 'N/A') AS riotId,
                COALESCE(p.teamId, 'N/A') AS teamId
            FROM users u
            LEFT JOIN players p ON u.userId = p.userId
            ORDER BY u.firstname ASC
        `;

        const data = await db.query(query);
        
        if(!data || data[0].length === 0) {
            return res.status(200).send({
                success: false,
                message: 'No users found',
                data: []
            });
        }

        res.status(200).send({
            success: true,
            message: 'All users with player data',
            data: data[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// GET USERS BY STATUS
const getUsersByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['Active', 'Inactive', 'Deactivated'];

        if (!validStatuses.includes(status)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid status'
            });
        }

        const query = `
            SELECT 
                u.userId,
                u.firstname,
                u.lastname,
                u.email,
                u.position,
                u.status,
                COALESCE(CONCAT(p.gameName, '#', p.tagLine), 'N/A') AS riotId,
                COALESCE(p.teamId, 'N/A') AS teamId
            FROM users u
            LEFT JOIN players p ON u.userId = p.userId
            WHERE u.status = ?
            ORDER BY u.firstname ASC
        `;

        const data = await db.query(query, [status]);
        
        if(!data || data[0].length === 0) {
            return res.status(200).send({
                success: false,
                message: 'No users found with that status',
                data: []
            });
        }

        res.status(200).send({
            success: true,
            message: `Users with status: ${status}`,
            data: data[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching users by status',
            error: error.message
        });
    }
};

// DEACTIVATE USERS
const deactivateUsers = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || userIds.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No users selected'
            });
        }

        // Create placeholders for the IN clause
        const placeholders = userIds.map(() => '?').join(',');
        const query = `UPDATE users SET status = 'Deactivated' WHERE userId IN (${placeholders})`;

        await db.query(query, userIds);

        res.status(200).send({
            success: true,
            message: `${userIds.length} user(s) deactivated successfully`
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error deactivating users',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsersWithPlayerData,
    getUsersByStatus,
    deactivateUsers
};
