const express = require('express'); 
const path = require('path'); 
const router = express.Router();

// /player_analysis
router.get('/', async function(req, res) {
    res.sendFile(path.join(viewsPath, 'player_analysis.html')); 
});

// Serve overlay HTML for player overview
router.get('/overview', async function(req, res) {
    res.sendFile(path.join(viewsPath, 'player_analysis_overlays/player_overview.html'));
});

module.exports = router;