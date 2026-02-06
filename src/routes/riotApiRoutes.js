/**
 * RIOT API ROUTES
 * - Routes for anything Riot API related
 */

const express = require('express');
const router = express.Router();
const riotApiController = require('../controllers/riotApiController'); // backend found in riotApiController

// Route: GET /riot/puuid/:gameName/:tagLine
router.get('/puuid/:gameName/:tagLine', riotApiController.getPuuid);

module.exports = router;