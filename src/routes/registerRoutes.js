const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

router.get('/academic-requirements', registerController.getAcademicRequirements);

// Route to handle user registration
router.post('/createuser', registerController.createUser);

module.exports = router;
