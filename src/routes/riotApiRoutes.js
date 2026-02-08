/**
 * RIOT API ROUTES
 * - Routes for anything Riot API related
 */

const express = require('express');
const router = express.Router();
const riotApiController = require('../controllers/riotApiController'); // backend found in riotApiController

// Route: GET /riot/puuid/:gameName/:tagLine
router.get('/puuid/:gameName/:tagLine', riotApiController.getPuuid);

// Route: GET /riot/matches/:puuid/:queueId
router.get('/matches/:puuid/:queueId', riotApiController.getRecentMatches);

// Route: GET /riot/match/:matchId
router.get('/match/:matchId', riotApiController.getMatchDetails);

// Route: POST /riot/match/:userId/store - Store a single match
router.post('/match/:userId/store', riotApiController.saveMatchDetails);

// Route: POST /riot/matches/:userId/store-multiple - Store multiple matches
router.post('/matches/:userId/store-multiple', riotApiController.saveMultipleMatches);

module.exports = router;