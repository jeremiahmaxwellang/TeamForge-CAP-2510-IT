const express = require('express');
const path = require('path');
const router = express.Router();

const {
	getTournamentPlayers,
	createTournament,
	updateTournament,
	getTournaments,
	getPage
} = tournamentController = require('./tournament_controller');

// Route to load the webpage
router.get('/', getPage);

router.get('/api/players', getTournamentPlayers);
router.get('/api/list', getTournaments);
router.post('/api/create', createTournament);
router.put('/api/:tournamentId', updateTournament);

module.exports = router;
