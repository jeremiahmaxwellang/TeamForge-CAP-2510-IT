const db = require('../../config/database');

const ROLE_ORDER = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

const normalizeResult = (value) => {
	if (!value && value !== 0) return 'N/A';
	const trimmed = String(value).trim();

	// Handle tournament results
	const upper = trimmed.toUpperCase();
	if (upper === 'W' || upper === 'L' || upper === 'N/A' || upper === 'NA') return upper === 'NA' ? 'N/A' : upper;

	// Handle scrim results
	if (trimmed === 'Team 1 Win' || trimmed === 'Team 2 Win' || trimmed === 'N/A') return trimmed;

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
		utility: 'Support',
		support: 'Support',
		sup: 'Support'
	};

	return mapping[normalized] || null;
};

const normalizeRoleId = (roleIdValue, roleNameValue) => {
	const parsedRoleId = Number.parseInt(roleIdValue, 10);
	if (Number.isInteger(parsedRoleId) && parsedRoleId > 0) {
		return parsedRoleId;
	}

	const normalizedRoleName = mapRoleName(roleNameValue);
	if (!normalizedRoleName) {
		return null;
	}

	const fallbackRoleIdByName = {
		Top: 1,
		Jungle: 2,
		Mid: 3,
		ADC: 4,
		Support: 5
	};

	return fallbackRoleIdByName[normalizedRoleName] || null;
};

// Sends the html file
const getPage = async (req, res) => {
	res.sendFile('tournament.html', { root: './src/modules/tournaments' }); // Adjust root if your html is somewhere else
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
			LEFT JOIN leagueroles lr1 ON lr1.roleId = p.primaryRoleId
			LEFT JOIN leagueroles lr2 ON lr2.roleId = p.secondaryRoleId
			WHERE u.position IN ('Player', 'Sub')
			AND u.status = 'Active'
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
		const { name, tournamentDate, result, type, assignments } = req.body;

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

		const normalizedType = type === 'Scrim' ? 'Scrim' : 'Tournament';

		const normalizedResult = normalizeResult(result);
		if (normalizedType !== 'Scrim' && !normalizedResult) {
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

		let teamTwoAssignments = [];
		if (normalizedType === 'Scrim') {
			teamTwoAssignments = assignments.filter((item) => item.team === 'Team 2');
			const validTeamTwoRoles = new Set(teamTwoAssignments.map((item) => item.role));
			const hasAllTeamTwoRoles = ROLE_ORDER.every((role) => validTeamTwoRoles.has(role));
			if (!hasAllTeamTwoRoles) {
				return res.status(400).send({
					success: false,
					message: 'Scrims require Team 2 to include Top, Jungle, Mid, ADC, and Support'
				});
			}
		}

		const teamRoleKeys = new Set();
		const playerIds = new Set();
		for (const item of assignments) {
			const assignmentTeam = normalizedType === 'Scrim' && item.team === 'Team 2' ? 'Team 2' : (item.team === 'Sub' ? 'Sub' : 'Team 1');
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

		let eventResult = normalizedResult;
		if (normalizedType === 'Scrim') {
			if (normalizedResult === 'Team 1 Win') {
				eventResult = 'W';
			} else if (normalizedResult === 'Team 2 Win') {
				eventResult = 'L';
			} else {
				eventResult = 'N/A';
			}
		}

		const [insertTournamentResult] = await connection.query(
			`INSERT INTO events (title_summary, type, start_date, end_date, win, creator_id) VALUES (?, ?, ?, ?, ?, ?)`,
			[String(name).trim(), normalizedType, normalizedDate, normalizedDate, eventResult, req.cookies.userId]
		);

		const tournamentId = insertTournamentResult.insertId;

		for (const item of assignments) {
			const playerId = Number.parseInt(item.playerId, 10);
			const roleId = normalizeRoleId(item.roleId, item.role);
			const isSub = item.team === 'Sub' ? 'Y' : 'N';
			const team = item.team;
            const championName = item.championName ? String(item.championName).trim() : null;

			if (!Number.isInteger(playerId) || playerId <= 0) {
				throw new Error('Invalid player assignment received');
			}

			let teamResult = 'N/A';
			if (normalizedType === 'Scrim') {
				if (normalizedResult === 'Team 1 Win' && team === 'Team 1') {
					teamResult = 'W';
				} else if (normalizedResult === 'Team 2 Win' && team === 'Team 2') {
					teamResult = 'W';
				} else if (normalizedResult === 'Team 1 Win' && team === 'Team 2') {
					teamResult = 'L';
				} else if (normalizedResult === 'Team 2 Win' && team === 'Team 1') {
					teamResult = 'L';
				}
			}

			await connection.query(
				`
				INSERT INTO event_attendees (eventId, userId, player_role, is_sub, team, win, championName)
				VALUES (?, ?, ?, ?, ?, ?, ?)
				`,
				[tournamentId, playerId, roleId, isSub, team, teamResult, championName]
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

const updateTournament = async (req, res) => {
	const connection = await db.getConnection();

	try {
		const tournamentId = Number.parseInt(req.params.tournamentId, 10);
		const { name, tournamentDate, result, type, assignments } = req.body;

		if (!Number.isInteger(tournamentId) || tournamentId <= 0) {
			return res.status(400).send({
				success: false,
				message: 'Valid tournament ID is required'
			});
		}

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

		const normalizedType = type === 'Scrim' ? 'Scrim' : 'Tournament';

		if (!Array.isArray(assignments) || assignments.length === 0) {
			return res.status(400).send({
				success: false,
				message: 'Player assignments are required'
			});
		}

		const teamOneAssignments = assignments.filter((item) => item.team === 'Team 1');
		const validTeamRoles = new Set(teamOneAssignments.map((item) => item.role));
		const hasAllRoles = ROLE_ORDER.every((role) => validTeamRoles.has(role));

		let teamTwoAssignments = [];
		if (normalizedType === 'Scrim') {
			teamTwoAssignments = assignments.filter((item) => item.team === 'Team 2');
			const validTeamTwoRoles = new Set(teamTwoAssignments.map((item) => item.role));
			const hasAllTeamTwoRoles = ROLE_ORDER.every((role) => validTeamTwoRoles.has(role));
			if (!hasAllTeamTwoRoles) {
				return res.status(400).send({
					success: false,
					message: 'Scrims require Team 2 to include Top, Jungle, Mid, ADC, and Support'
				});
			}
		}

		const teamRoleKeys = new Set();
		const playerIds = new Set();
		for (const item of assignments) {
			const assignmentTeam = normalizedType === 'Scrim' && item.team === 'Team 2' ? 'Team 2' : (item.team === 'Sub' ? 'Sub' : 'Team 1');
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

		const [existingRows] = await connection.query(
			`SELECT eventId FROM events WHERE eventId = ? AND type IN ('Tournament', 'Scrim') LIMIT 1`,
			[tournamentId]
		);

		if (!existingRows.length) {
			await connection.rollback();
			return res.status(404).send({
				success: false,
				message: 'Tournament not found'
			});
		}

		let eventResult = normalizedResult;
		if (normalizedType === 'Scrim') {
			if (normalizedResult === 'Team 1 Win') {
				eventResult = 'W';
			} else if (normalizedResult === 'Team 2 Win') {
				eventResult = 'L';
			} else {
				eventResult = 'N/A';
			}
		}

		await connection.query(
			`
			UPDATE events
			SET title_summary = ?, start_date = ?, end_date = ?, win = ?, type = ?
			WHERE eventId = ? AND type IN ('Tournament', 'Scrim')
			`,
			[String(name).trim(), normalizedDate, normalizedDate, eventResult, normalizedType, tournamentId]
		);

		await connection.query(`DELETE FROM event_attendees WHERE eventId = ?`, [tournamentId]);

		for (const item of assignments) {
			const playerId = Number.parseInt(item.playerId, 10);
			const roleId = normalizeRoleId(item.roleId, item.role);
			const isSub = item.team === 'Sub' ? 'Y' : 'N';
			const team = item.team;
            const championName = item.championName ? String(item.championName).trim() : null;

			if (!Number.isInteger(playerId) || playerId <= 0) {
				throw new Error('Invalid player assignment received');
			}

			let teamResult = 'N/A';
			if (normalizedType === 'Scrim') {
				if (normalizedResult === 'Team 1 Win' && team === 'Team 1') {
					teamResult = 'W';
				} else if (normalizedResult === 'Team 2 Win' && team === 'Team 2') {
					teamResult = 'W';
				} else if (normalizedResult === 'Team 1 Win' && team === 'Team 2') {
					teamResult = 'L';
				} else if (normalizedResult === 'Team 2 Win' && team === 'Team 1') {
					teamResult = 'L';
				}
			}

			await connection.query(
				`
				INSERT INTO event_attendees (eventId, userId, player_role, is_sub, team, win, championName)
				VALUES (?, ?, ?, ?, ?, ?, ?)
				`,
				[tournamentId, playerId, roleId, isSub, team, teamResult, championName]
			);
		}

		await connection.commit();

		return res.status(200).send({
			success: true,
			message: 'Tournament updated successfully',
			tournamentId
		});
	} catch (error) {
		await connection.rollback();
		console.log(error);
		return res.status(500).send({
			success: false,
			message: 'Error updating tournament',
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
				t.eventId AS tournamentId,
				t.title_summary AS name,
				t.start_date AS startDate,
				t.win,
				t.type,
				tp.userId AS playerId,
				tp.is_sub AS isSub,
				tp.player_role AS roleId,
				tp.team,
				tp.win AS teamWin,
                tp.championName,
				u.firstname,
				u.lastname,
				lr.teamPosition AS roleName
			FROM events t
			LEFT JOIN event_attendees tp ON tp.eventId = t.eventId
			LEFT JOIN users u ON u.userId = tp.userId
			LEFT JOIN leagueroles lr ON lr.roleId = tp.player_role
            WHERE t.type IN ('Tournament', 'Scrim')
			ORDER BY t.eventId DESC, tp.is_sub ASC, tp.player_role ASC
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
					type: row.type,
					assignments: []
				});
			}

			if (row.playerId) {
				grouped.get(row.tournamentId).assignments.push({
					playerId: row.playerId,
					playerName: `${row.firstname || ''} ${row.lastname || ''}`.trim(),
					roleId: row.roleId,
					team: row.team,
					teamWin: row.teamWin,
					role: mapRoleName(row.roleName) || 'Unknown',
                    championName: row.championName || ''
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
	updateTournament,
	getTournaments,
	getPage
};