const express = require('express');
const { 
    getUsers, 
    getUserById, 
    createUser,
    deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Routes
router.get('/getall', getUsers); // http://localhost:3000/api/v1/users/getall

router.get('/get/:id', getUserById); // http://localhost:3000/api/v1/users/get/2

router.post('/create', createUser); // http://localhost:3000/api/v1/users/create

router.delete('/delete/:id', deleteUser); // http://localhost:3000/api/v1/users/delete/2

module.exports = router;