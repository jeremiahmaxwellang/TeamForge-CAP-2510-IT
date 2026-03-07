// Controllers
// - contain all the backend and sql queries

const db = require("../config/database");

// GET ALL USERS
const getUsers = async (req,res) => {
    try {
        const data = await db.query('SELECT * FROM users')
        if(!data) {
            return res.status(404).send({
                success:false,
                message:'No Records Found'
            })
        }
        res.status(200).send({
            success: true,
            message: 'All users',
            data: data[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error fetching all users',
            error
        })
    }
}

// GET USER BY ID
const getUserById = async (req, res) => {
    try {
        const id = req.params.id
        if(!id) {
            return res.status(404).send({
                success:false,
                message:'Invalid'
            })
        }

        const data = await db.query(`SELECT * FROM users WHERE userId=?`, [id])
            if(!data) {
                return res.status(404).send({
                    success:false,
                    message:'No Records found'
                })
            }
            res.status(200).send({
                success:true,
                userDetails: data[0]
            })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Get User by ID'
        })
    }
}

// CREATE USERS
const createUser = async (req, res) => {
    try {
        let { userId, email, passwordHash, firstname, lastname, position, discord, status, riotId } = req.body
        // make sure discord is always string
        discord = discord || '';

        // Basic required fields (discord is optional)
        if (!email || !firstname || !lastname || !position || !status) {
            return res.status(400).send({
                success: false,
                message: 'Please provide required fields: email, firstname, lastname, position, status'
            })
        }

        // Check if email already exists
        try {
            const existingUser = await db.query('SELECT userId FROM users WHERE email = ?', [email])
            if (existingUser && existingUser[0] && existingUser[0].length > 0) {
                return res.status(400).send({
                    success: false,
                    message: 'An account with this email already exists'
                })
            }
        } catch (checkErr) {
            console.error('Error checking duplicate email:', checkErr);
        }

        // Provide default passwordHash if not supplied (development only)
        if (!passwordHash) passwordHash = '1234';

        let insertResult;
        if (userId) {
            insertResult = await db.query(`INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status, firstLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`, [userId, email, passwordHash, firstname, lastname, position, discord, status])
        } else {
            insertResult = await db.query(`INSERT INTO users(email, passwordHash, firstname, lastname, position, discord, status, firstLogin) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`, [email, passwordHash, firstname, lastname, position, discord, status])
        }

        if (!insertResult) {
            return res.status(500).send({ success: false, message: 'Error creating account' });
        }

        // Determine newly created userId
        let newUserId = userId;
        try {
            // insertResult is [result, fields] from mysql2
            if (!newUserId && insertResult[0] && insertResult[0].insertId) {
                newUserId = insertResult[0].insertId;
            }
        } catch (e) {
            // ignore
        }

        // If riotId provided, attempt to create a players row (store gameName and tagLine)
        if (riotId) {
            const parts = riotId.split('#');
            if (parts.length === 2) {
                const gameName = parts[0].trim();
                const tagLine = parts[1].trim();

                // Map textual position to primaryRoleId when possible
                const roleMap = {
                    'top': 1,
                    'jungle': 2,
                    'mid': 3,
                    'middle': 3,
                    'adc': 4,
                    'ad carry': 4,
                    'adcarry': 4,
                    'support': 5
                };

                let primaryRoleId = 1; // default
                if (position) {
                    const key = position.toString().toLowerCase();
                    if (roleMap[key]) primaryRoleId = roleMap[key];
                }

                try {
                    const applicationStatus = position === 'Player' ? 'Accepted' : null;
                    await db.query(`INSERT INTO players (userId, gameName, tagLine, primaryRoleId, applicationStatus) VALUES (?, ?, ?, ?, ?)`, [newUserId, gameName, tagLine, primaryRoleId, applicationStatus]);
                } catch (err) {
                    console.error('Error inserting into players for riotId:', err.message);
                }
            }
        }

        res.status(201).send({ success: true, message: 'New user created' });

    } catch(error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error creating user'
        })
    }
}


// DELETE USER
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id
        if(!userId) {
            return res.status(404).send({
                success:false,
                message:'Please provide valid ID'
            })
        }
        await db.query(`DELETE FROM users WHERE userId = ?`, [userId])
        res.status(200).send({
            success:true,
            message:'User deleted'
        })

    } catch(error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error deleting user'
        })
    }
}

module.exports = { 
    getUsers, 
    getUserById,
    createUser,
    deleteUser
};