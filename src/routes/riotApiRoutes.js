/**
 * RIOT API ROUTES
 * - Routes for anything Riot API related
 */

const express = require('express');
const router = express.Router();
const riotApiController = require('../controllers/riotApiController'); // backend found in riotApiController
const analysisOverviewController = require('../controllers/player_analysis/analysisOverviewController'); // backend for player analysis overview tab

// Route: GET /riot/puuid/:gameName/:tagLine
router.get('/puuid/:gameName/:tagLine', riotApiController.getPuuid);

// MORE SPECIFIC ROUTES FIRST (to prevent matching by parameterized routes)
// Route: GET /riot/matches/database/:puuid - Fetch from Database (stored data)
router.get('/matches/database/:puuid', analysisOverviewController.getRecentMatchesFromDatabase);

// THEN MORE GENERAL PARAMETERIZED ROUTES
// Route: GET /riot/matches/:puuid/:queueId - Fetch from Riot API
router.get('/matches/:puuid/:queueId', riotApiController.getRecentMatches);

// Route: GET /riot/winrate/:puuid
router.get('/winrate/:puuid', analysisOverviewController.getWinrate);

// Route: GET /riot/match/:matchId
router.get('/match/:matchId', riotApiController.getMatchDetails);

// Route: POST /riot/match/:userId/store - Store a single match
router.post('/match/:userId/store', riotApiController.saveMatchDetails);

// Route: POST /riot/matches/:userId/store-multiple - Store multiple matches
router.post('/matches/:userId/store-multiple', riotApiController.saveMultipleMatches);

// Route: POST /riot/match/:matchId/participants - Store participants from a single match
router.post('/match/:matchId/participants', riotApiController.saveMatchParticipants);

// Route: POST /riot/participants/batch - Batch upload participants from multiple matches
router.post('/participants/batch', riotApiController.saveMultipleMatchParticipants);

module.exports = router;
