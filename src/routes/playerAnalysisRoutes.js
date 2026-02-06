/**
 * PLAYER ANALYSIS ROUTES
 * - Routes under /player_analysis
 */

const express = require('express'); 
const path = require('path'); 
const router = express.Router();

// Controller
const playerController = require('../controllers/playerController');

// GET all players
router.get('/players', playerController.getAllPlayers);

// GET /players/:id [fetch player by ID]
router.get('/players/:id', playerController.getPlayerById);

// Update puuid
router.put('/players/:id/puuid', playerController.updatePuuid);


// /player_analysis
router.get('/', async function(req, res) {
    res.sendFile(path.join(viewsPath, 'player_analysis.html')); 
});

// Serve overlay HTML for player overview
router.get('/overview', async function(req, res) {
    res.sendFile(path.join(viewsPath, 'player_analysis_overlays/player_overview.html'));
});

// Serve overlay HTML for player comparison
router.get('/comparison', async function(req, res) {
    res.sendFile(path.join(viewsPath, 'player_analysis_overlays/player_comparison.html'));
});

// Serve overlay HTML for player VODs
router.get('/vods', async function(req, res) {
    res.sendFile(path.join(viewsPath, 'player_analysis_overlays/player_vod.html'));
});

// Serve overlay HTML for player champion pool
router.get('/champion', async function(req, res) {
    res.sendFile(path.join(viewsPath, 'player_analysis_overlays/player_champion_pool.html'));
});

// Serve overlay HTML for player evaluation
router.get('/evaluation', async function(req, res) {
    res.sendFile(path.join(viewsPath, 'player_analysis_overlays/player_evaluation.html'));
});

module.exports = router;