// Team Management Routes
// Routes for team management page

const express = require('express');
const path = require('path');
const router = express.Router();
const {
    getAllUsersWithPlayerData,
    getUsersByStatus,
    deactivateUsers,
    updateUserPositionAndStatus
} = require('../controllers/team_managementController');

// GET - Render team management page
router.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'team_management.html'));
});

// GET - All users with player data
router.get('/api/users', getAllUsersWithPlayerData);

// GET - Users by status
router.get('/api/users/status/:status', getUsersByStatus);

// POST - Deactivate selected users
router.post('/api/deactivate', deactivateUsers);

// PUT - Update one user's position and status
router.put('/api/users/:userId', updateUserPositionAndStatus);

module.exports = router;
