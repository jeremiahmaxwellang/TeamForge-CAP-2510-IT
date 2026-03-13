const db = require('../config/database');

const ROLE_ORDER = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

const normalizeResult = (value) => {
	if (!value && value !== 0) return 'N/A';
	const upper = String(value).trim().toUpperCase();
	if (upper === 'W' || upper === 'L' || upper === 'N/A') return upper;
	if (upper === 'NA') return 'N/A';
	return null;
};

const toIsoDate = (input) => {
	if (!input) return null;
	const parsed = new Date(input);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toISOString().slice(0, 10);
};

const mapRoleName = (value) => {
	if (!value) return null;
	const normalized = String(value).trim().toLowerCase();
	const mapping = {
		top: 'Top',
		jungle: 'Jungle',
		mid: 'Mid',
		middle: 'Mid',
		adc: 'ADC',
		bottom: 'ADC',
		bot: 'ADC',
		support: 'Support',
		sup: 'Support'
	};

	return mapping[normalized] || null;
};

const getTournamentPlayers = async (req, res) => {
	try {
		const query = `
			SELECT
				u.userId,
				u.firstname,
				u.lastname,
				p.primaryRoleId,
				p.secondaryRoleId,
				lr1.teamPosition AS primaryRoleName,
				lr2.teamPosition AS secondaryRoleName
			FROM users u
			INNER JOIN players p ON p.userId = u.userId
			LEFT JOIN leagueRoles lr1 ON lr1.roleId = p.primaryRoleId
			LEFT JOIN leagueRoles lr2 ON lr2.roleId = p.secondaryRoleId
			WHERE u.position IN ('Player', 'Sub')
			ORDER BY u.firstname ASC, u.lastname ASC
		`;

		const [rows] = await db.query(query);

		const data = rows
			.map((row) => {
				const primaryRole = mapRoleName(row.primaryRoleName);
				const secondaryRole = mapRoleName(row.secondaryRoleName);

				if (!primaryRole && !secondaryRole) {
					return null;
				}

				return {
					userId: row.userId,
					name: `${row.firstname || ''} ${row.lastname || ''}`.trim(),
					primaryRoleId: row.primaryRoleId,
					secondaryRoleId: row.secondaryRoleId,
					primaryRole,
					secondaryRole
				};
			})
			.filter((item) => item !== null);

		return res.status(200).send({
			success: true,
			data
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			success: false,
			message: 'Error fetching tournament players',
			error: error.message
		});
	}
};

const createTournament = async (req, res) => {
	const connection = await db.getConnection();

	try {
		const { name, tournamentDate, result, assignments } = req.body;

		if (!name || !String(name).trim()) {
			return res.status(400).send({
				success: false,
				message: 'Tournament name is required'
			});
		}

		const normalizedDate = toIsoDate(tournamentDate);
		if (!normalizedDate) {
			return res.status(400).send({
				success: false,
				message: 'Valid tournament date is required'
			});
		}

		const normalizedResult = normalizeResult(result);
		if (!normalizedResult) {
			return res.status(400).send({
				success: false,
				message: 'Result must be W, L, or N/A'
			});
		}

		if (!Array.isArray(assignments) || assignments.length === 0) {
			return res.status(400).send({
				success: false,
				message: 'Player assignments are required'
			});
		}

		const teamOneAssignments = assignments.filter((item) => item.team === 'Team 1');
		const validTeamRoles = new Set(teamOneAssignments.map((item) => item.role));
		const hasAllRoles = ROLE_ORDER.every((role) => validTeamRoles.has(role));

		const teamRoleKeys = new Set();
		const playerIds = new Set();
		for (const item of assignments) {
			const assignmentTeam = item.team === 'Sub' ? 'Sub' : 'Team 1';
			const assignmentRole = String(item.role || '').trim();
			const assignmentPlayerId = Number.parseInt(item.playerId, 10);
			const teamRoleKey = `${assignmentTeam}:${assignmentRole}`;

			if (!ROLE_ORDER.includes(assignmentRole)) {
				return res.status(400).send({
					success: false,
					message: 'Invalid role received in assignments'
				});
			}

			if (teamRoleKeys.has(teamRoleKey)) {
				return res.status(400).send({
					success: false,
					message: 'Only one player per role per team is allowed'
				});
			}

			if (!Number.isInteger(assignmentPlayerId) || assignmentPlayerId <= 0) {
				return res.status(400).send({
					success: false,
					message: 'Invalid player assignment received'
				});
			}

			if (playerIds.has(assignmentPlayerId)) {
				return res.status(400).send({
					success: false,
					message: 'A player can only be assigned once per tournament'
				});
			}

			teamRoleKeys.add(teamRoleKey);
			playerIds.add(assignmentPlayerId);
		}

		if (!hasAllRoles) {
			return res.status(400).send({
				success: false,
				message: 'Team 1 must include Top, Jungle, Mid, ADC, and Support'
			});
		}

		await connection.beginTransaction();

		const [insertTournamentResult] = await connection.query(
			`INSERT INTO tournaments (name, startDate, endDate, win) VALUES (?, ?, ?, ?)`,
			[String(name).trim(), normalizedDate, normalizedDate, normalizedResult]
		);

		const tournamentId = insertTournamentResult.insertId;

		for (const item of assignments) {
			const playerId = Number.parseInt(item.playerId, 10);
			const roleId = Number.parseInt(item.roleId, 10);
			const isSub = item.team === 'Sub' ? 'Y' : 'N';

			if (!Number.isInteger(playerId) || playerId <= 0) {
				throw new Error('Invalid player assignment received');
			}

			await connection.query(
				`
				INSERT INTO tournament_players (tournamentId, playerId, roleId, isSub)
				VALUES (?, ?, ?, ?)
				`,
				[tournamentId, playerId, Number.isInteger(roleId) ? roleId : null, isSub]
			);
		}

		await connection.commit();

		return res.status(201).send({
			success: true,
			message: 'Tournament created successfully',
			tournamentId
		});
	} catch (error) {
		await connection.rollback();
		console.log(error);
		return res.status(500).send({
			success: false,
			message: 'Error creating tournament',
			error: error.message
		});
	} finally {
		connection.release();
	}
};

const getTournaments = async (req, res) => {
	try {
		const query = `
			SELECT
				t.tournamentId,
				t.name,
				t.startDate,
				t.win,
				tp.playerId,
				tp.isSub,
				tp.roleId,
				u.firstname,
				u.lastname,
				lr.teamPosition AS roleName
			FROM tournaments t
			LEFT JOIN tournament_players tp ON tp.tournamentId = t.tournamentId
			LEFT JOIN users u ON u.userId = tp.playerId
			LEFT JOIN leagueRoles lr ON lr.roleId = tp.roleId
			ORDER BY t.tournamentId DESC, tp.isSub ASC, tp.roleId ASC
		`;

		const [rows] = await db.query(query);

		const grouped = new Map();

		rows.forEach((row) => {
			if (!grouped.has(row.tournamentId)) {
				grouped.set(row.tournamentId, {
					tournamentId: row.tournamentId,
					name: row.name,
					tournamentDate: row.startDate,
					result: row.win,
					assignments: []
				});
			}

			if (row.playerId) {
				grouped.get(row.tournamentId).assignments.push({
					playerId: row.playerId,
					playerName: `${row.firstname || ''} ${row.lastname || ''}`.trim(),
					team: row.isSub === 'Y' ? 'Sub' : 'Team 1',
					role: mapRoleName(row.roleName) || 'Unknown'
				});
			}
		});

		return res.status(200).send({
			success: true,
			data: Array.from(grouped.values())
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			success: false,
			message: 'Error fetching tournaments',
			error: error.message
		});
	}
};

module.exports = {
	getTournamentPlayers,
	createTournament,
	getTournaments
};
