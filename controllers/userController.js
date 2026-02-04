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
            data
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

module.exports = { getUsers };