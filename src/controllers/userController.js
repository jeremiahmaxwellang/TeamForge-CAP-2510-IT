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
        const { userId, email, passwordHash, firstname, lastname, position, discord, status } = req.body
        if(!userId || !email || !passwordHash || !firstname || !lastname || !position || !discord || !status ){
            return res.status(500).send({
                success:false,
                message:'Please provide all fields'
            })
        }

        const data = await db.query(`INSERT INTO users(userId, email, passwordHash, firstname, lastname, position, discord, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, email, passwordHash, firstname, lastname, position, discord, status])
        if(!data) {
            return res.status(404).send({
                success:false,
                message:'Error creating account'
            })
        }
        res.status(201).send({
            success:true,
            message:'New user created'
        })

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