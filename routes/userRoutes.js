const express = require('express');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

// Routes
router.get('/getall', getUsers); // http://localhost:3000/api/v1/users/getall

module.exports = router;