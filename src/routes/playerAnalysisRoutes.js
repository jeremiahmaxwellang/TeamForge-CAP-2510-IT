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

// ============ BENCHMARKS ROUTES ============

/**
 * GET /player_analysis/benchmarks/status
 * Check if benchmarks table is empty
 */
router.get('/benchmarks/status', playerController.checkBenchmarkStatus);

/**
 * POST /player_analysis/benchmarks/initialize
 * Initialize benchmarks - check if empty and insert defaults if needed
 */
router.post('/benchmarks/initialize', playerController.initializeBenchmarks);

/**
 * GET /player_analysis/benchmarks/all
 * Get all benchmarks with role information
 */
router.get('/benchmarks/all', playerController.getAllBenchmarks);

/**
 * GET /player_analysis/benchmarks/role/:roleId
 * Get benchmarks for a specific role
 */
router.get('/benchmarks/role/:roleId', playerController.getBenchmarksByRole);

/**
 * PUT /player_analysis/benchmarks/:benchmarkId
 * Update a specific benchmark
 */
router.put('/benchmarks/:benchmarkId', playerController.updateBenchmark);

/**
 * DELETE /player_analysis/benchmarks/clear
 * Clear all benchmarks (admin function)
 */
router.delete('/benchmarks/clear', playerController.clearBenchmarks);

/**
 * POST /player_analysis/benchmarks/compare
 * Compare player stats against role benchmarks
 * Request body: { roleId, playerStats: { metricName: value, ... } }
 */
router.post('/benchmarks/compare', playerController.comparePlayerToBenchmarks);

/**
 * POST /player_analysis/stats/calculate
 * Calculate player stats from matchParticipants and compare against benchmarks
 * Request body: { playerId, roleId }
 */
router.post('/stats/calculate', playerController.calculatePlayerStatsFromMatches);

module.exports = router;