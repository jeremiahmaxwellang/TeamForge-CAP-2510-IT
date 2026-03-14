const express = require('express');
const path = require('path');
const router = express.Router();

const {
	getTournamentPlayers,
	createTournament,
	updateTournament,
	getTournaments
} = require('../controllers/tournamentControllers');

router.get('/', (req, res) => {
	res.sendFile(path.join(viewsPath, 'tournament.html'));
});

router.get('/api/players', getTournamentPlayers);
router.get('/api/list', getTournaments);
router.post('/api/create', createTournament);
router.put('/api/:tournamentId', updateTournament);

module.exports = router;
