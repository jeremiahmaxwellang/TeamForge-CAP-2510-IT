const express = require('express');
const router = express.Router();
const registerController = require('./registerController');

// Routes to load the webpages
router.get('/signup', registerController.getSignupPage);
router.get('/', registerController.getRegisterPage);

router.get('/academic-requirements', registerController.getAcademicRequirements);

// Route to handle user registration
router.post('/createuser', registerController.createUser);

module.exports = router;
