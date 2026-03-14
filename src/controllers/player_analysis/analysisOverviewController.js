/**
 * ANALYSIS OVERVIEW CONTROLLER
 * - Backend for player analysis overview tab
 */

const db = require('../../config/database');
const OVERVIEW_MATCH_LIMIT = 15;

async function fetchRolePositionsByPuuid(puuid) {
    const [rows] = await db.query(
        `SELECT p.primaryRoleId, p.secondaryRoleId,
                r1.teamPosition AS primaryTeamPosition,
                r2.teamPosition AS secondaryTeamPosition
         FROM players p
         JOIN leagueRoles r1 ON p.primaryRoleId = r1.roleId
         LEFT JOIN leagueRoles r2 ON p.secondaryRoleId = r2.roleId
         WHERE p.puuid = ?
         LIMIT 1`,
        [puuid]
    );

    return rows[0] || null;
}

async function fetchRecentRoleBucketRows(puuid, queueId, teamPosition, limit = 15) {
    if (!teamPosition) return [];

    let sql = `
        SELECT mp.win, m.gameStartTimestamp, m.gameCreation, mp.queueId
        FROM matchParticipants mp
        JOIN matches m ON mp.matchId = m.matchId
        WHERE mp.puuid = ? AND mp.teamPosition = ?
    `;
    const params = [puuid, teamPosition];

    if (queueId) {
        sql += ` AND mp.queueId = ?`;
        params.push(queueId);
    }

    sql += ` ORDER BY COALESCE(m.gameStartTimestamp, m.gameCreation) DESC LIMIT ?`;
    params.push(limit);

    const [rows] = await db.query(sql, params);
    return rows;
}

async function fetchRecentRoleBucketMatches(puuid, queueId, teamPosition, limit = 15) {
    if (!teamPosition) return [];

    let sql = `
        SELECT m.*, mp.puuid, mp.kills, mp.deaths, mp.assists, mp.win,
               mp.championName, mp.queueId, mp.champLevel, mp.goldEarned
        FROM matches m
        JOIN matchParticipants mp ON m.matchId = mp.matchId
        WHERE mp.puuid = ? AND mp.teamPosition = ?
    `;
    const params = [puuid, teamPosition];

    if (queueId) {
        sql += ` AND mp.queueId = ?`;
        params.push(queueId);
    }

    sql += ` ORDER BY COALESCE(m.gameStartTimestamp, m.gameCreation) DESC LIMIT ?`;
    params.push(limit);

    const [rows] = await db.query(sql, params);
    return rows;
}

// Get winrate for last 15 games for a player by puuid
exports.getWinrate = async (req, res) => {
    try {
        const { puuid } = req.params;
        const { queueId, teamPosition } = req.query;

        if (!puuid) {
            return res.status(400).json({ error: 'puuid is required' });
        }

        console.log(`[Win Rate] Getting winrate for PUUID: ${puuid}, Queue: ${queueId || 'all'}`);

        let rows = [];

        if (teamPosition) {
            rows = await fetchRecentRoleBucketRows(puuid, queueId, teamPosition, OVERVIEW_MATCH_LIMIT);
        } else {
            const roleInfo = await fetchRolePositionsByPuuid(puuid);
            if (!roleInfo) {
                return res.json({ total: 0, wins: 0, losses: 0, winrate: 0 });
            }

            const primaryRows = await fetchRecentRoleBucketRows(puuid, queueId, roleInfo.primaryTeamPosition, OVERVIEW_MATCH_LIMIT);
            const secondaryRows =
                roleInfo.secondaryTeamPosition && roleInfo.secondaryTeamPosition !== roleInfo.primaryTeamPosition
                    ? await fetchRecentRoleBucketRows(puuid, queueId, roleInfo.secondaryTeamPosition, OVERVIEW_MATCH_LIMIT)
                    : [];

            rows = [...primaryRows, ...secondaryRows].sort((a, b) => {
                const aTs = Number(a.gameStartTimestamp || a.gameCreation || 0);
                const bTs = Number(b.gameStartTimestamp || b.gameCreation || 0);
                return bTs - aTs;
            }).slice(0, OVERVIEW_MATCH_LIMIT);
        }

        const total = rows.length;
        if (total === 0) {
            return res.json({ total: 0, wins: 0, losses: 0, winrate: 0 });
        }

        const wins = rows.reduce((acc, r) => {
            const w = (r.win === 'W' || r.win === 'w' || r.win === 1 || r.win === '1') ? 1 : 0;
            return acc + w;
        }, 0);

        const losses = total - wins;
        const winrate = Number(((wins / total) * 100).toFixed(1));

        res.json({ total, wins, losses, winrate });

        console.log(`[Win Rate] ✓ Calculated winrate for PUUID: ${winrate}% (${wins}W/${losses}L) - Queue: ${queueId || 'all'} [Primary+Secondary buckets]`);
    } catch (err) {
        console.error(`[Win Rate] ✗ ERROR in getWinrate:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get recent match details from database for a player by puuid
exports.getRecentMatchesFromDatabase = async (req, res) => {
    try {
        const { puuid } = req.params;
        const { queueId, teamPosition } = req.query;

        if (!puuid) {
            return res.status(400).json({ error: 'puuid is required' });
        }

        // Fetch the gameName and tagLine from the database
        let sql = `
            SELECT gameName, tagLine 
            FROM players
            WHERE puuid = ?;
        `;
        const [playerData] = await db.query(sql, [puuid]);

        if (playerData.length === 0) {
            console.log(`[DB MATCHES] No player found with PUUID: ${puuid}`);
            return res.json({ matches: [] });
        }

        const { gameName, tagLine } = playerData[0];

        // Log with gameName and tagLine instead of puuid
        console.log(`[DB MATCHES] Getting recent matches from database for Player: ${gameName}#${tagLine}, Queue: ${queueId || 'all'}`);

        let matches = [];

        if (teamPosition) {
            matches = await fetchRecentRoleBucketMatches(puuid, queueId, teamPosition, OVERVIEW_MATCH_LIMIT);
        } else {
            const roleInfo = await fetchRolePositionsByPuuid(puuid);

            const primaryMatches = roleInfo?.primaryTeamPosition
                ? await fetchRecentRoleBucketMatches(puuid, queueId, roleInfo.primaryTeamPosition, OVERVIEW_MATCH_LIMIT)
                : [];

            const secondaryMatches =
                roleInfo?.secondaryTeamPosition && roleInfo.secondaryTeamPosition !== roleInfo.primaryTeamPosition
                    ? await fetchRecentRoleBucketMatches(puuid, queueId, roleInfo.secondaryTeamPosition, OVERVIEW_MATCH_LIMIT)
                    : [];

            const deduped = new Map();
            [...primaryMatches, ...secondaryMatches].forEach((row) => {
                if (!deduped.has(row.matchId)) {
                    deduped.set(row.matchId, row);
                }
            });

            matches = Array.from(deduped.values()).sort((a, b) => {
                const aTs = Number(a.gameStartTimestamp || a.gameCreation || 0);
                const bTs = Number(b.gameStartTimestamp || b.gameCreation || 0);
                return bTs - aTs;
            }).slice(0, OVERVIEW_MATCH_LIMIT);
        }

        if (matches.length === 0) {
            console.log(`[DB MATCHES] No matches found in database for Player: ${gameName}#${tagLine}`);
            return res.json({ matches: [] });
        }

        // Convert database rows to match details format that mimics Riot API structure
        const formattedMatches = matches.map(row => ({
            metadata: {
                matchId: row.matchId,
                participants: [row.puuid],
                dataVersion: '1'
            },
            info: {
                gameCreation: row.gameCreation,
                gameDuration: row.gameDuration,
                gameEndTimestamp: row.gameEndTimestamp,
                gameStartTimestamp: row.gameStartTimestamp,
                gameMode: row.gameMode,
                gameName: row.gameName,
                gameType: row.gameType,
                gameVersion: row.gameVersion,
                participants: [{
                    puuid: row.puuid,
                    kills: row.kills,
                    deaths: row.deaths,
                    assists: row.assists,
                    win: row.win,
                    championName: row.championName,
                    queueId: row.queueId,
                    champLevel: row.champLevel,
                    goldEarned: row.goldEarned
                }]
            }
        }));

        console.log(`[DB MATCHES] ✓ Retrieved ${matches.length} matches from database for Player: ${gameName}#${tagLine} (15 primary + 15 secondary)`);
        res.json({ matches: formattedMatches });
    } catch (err) {
        console.error(`[DB MATCHES] ✗ ERROR:`, err.message);
        res.status(500).json({ error: err.message });
    }

};

// ============== SUMMARY TAB ==============
const overviewSummary = 
`
SELECT
	CASE 
		WHEN mp.role = 'CARRY' AND mp.teamPosition = 'BOT' THEN 'ADC'
		WHEN mp.role = 'SUPPORT' AND mp.teamPosition = 'UTILITY' THEN 'SUPPORT'
		ELSE mp.teamPosition
	END AS champ_role,
    COUNT(*) AS games,
    COUNT(CASE WHEN mp.win = 'W' THEN 1 END) AS wins,
    COUNT(CASE WHEN mp.win = 'L' THEN 1 END) AS losses,
	ROUND(AVG(mp.kills), 1) AS avgKills,
	ROUND(AVG(mp.deaths), 1) AS avgDeaths,
	ROUND(AVG(mp.assists), 1) AS avgAssists
FROM matchParticipants mp
JOIN players p ON mp.puuid = p.puuid
WHERE p.userId = ?
GROUP BY champ_role
`;

exports.getOverviewSummary = async (req, res) => {
    try {
        const playerId = req.params.id;

        const [results] = await db.query(overviewSummary, [playerId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Gets both roles of a player
exports.getPlayerRoles = async (req, res) => {
    try {
        const playerId = req.params.id;

        const [results] = await db.query(
            `SELECT
                p.primaryRoleId, r1.displayedRole AS displayedRole1, r1.role AS role1, r1.teamPosition AS teamPosition1,
                p.secondaryRoleId, r2.displayedRole AS displayedRole2, r2.role AS role2, r2.teamPosition AS teamPosition2
            FROM players p
            JOIN leagueRoles r1 ON r1.roleId = p.primaryRoleId
            JOIN leagueRoles r2 ON r2.roleId = p.secondaryRoleId
            WHERE p.userId = ?`,
            [playerId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



