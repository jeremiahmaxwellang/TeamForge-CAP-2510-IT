/**
 * ANALYSIS OVERVIEW CONTROLLER
 * - Backend for player analysis overview tab
 */

const db = require('../../config/database');

// Get winrate for last 15 games for a player by puuid
exports.getWinrate = async (req, res) => {
    try {
        const { puuid } = req.params;
        const { queueId } = req.query;

        if (!puuid) {
            return res.status(400).json({ error: 'puuid is required' });
        }

        console.log(`[Win Rate] Getting winrate for PUUID: ${puuid}, Queue: ${queueId || 'all'}`);

        // Select the player's most recent 15 participant records joined with match timestamps
        let sql = `
            SELECT mp.win, m.gameStartTimestamp, m.gameCreation, mp.queueId
            FROM matchParticipants mp
            JOIN matches m ON mp.matchId = m.matchId
            WHERE mp.puuid = ?
        `;
        const params = [puuid];

        // Add queue filter if provided
        if (queueId) {
            sql += ` AND mp.queueId = ?`;
            params.push(queueId);
        }

        sql += ` ORDER BY COALESCE(m.gameStartTimestamp, m.gameCreation) DESC
            LIMIT 15`;

        const [rows] = await db.query(sql, params);

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

        console.log(`[Win Rate] ✓ Calculated winrate for PUUID: ${winrate}% (${wins}W/${losses}L) - Queue: ${queueId || 'all'}`);
    } catch (err) {
        console.error(`[Win Rate] ✗ ERROR in getWinrate:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get recent match details from database for a player by puuid
exports.getRecentMatchesFromDatabase = async (req, res) => {
    try {
        const { puuid } = req.params;
        const { queueId } = req.query;

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

        // Fetch the 15 most recent matches from database
        sql = `
            SELECT m.*, mp.puuid, mp.kills, mp.deaths, mp.assists, mp.win, 
                   mp.championName, mp.queueId, mp.champLevel, mp.goldEarned
            FROM matches m
            JOIN matchParticipants mp ON m.matchId = mp.matchId
            WHERE mp.puuid = ?
        `;
        const params = [puuid];

        // Add queue filter if provided
        if (queueId) {
            sql += ` AND mp.queueId = ?`;
            params.push(queueId);
        }

        sql += ` ORDER BY COALESCE(m.gameStartTimestamp, m.gameCreation) DESC
            LIMIT 15`;

        const [matches] = await db.query(sql, params);

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

        console.log(`[DB MATCHES] ✓ Retrieved ${matches.length} matches from database for Player: ${gameName}#${tagLine}`);
        res.json({ matches: formattedMatches });
    } catch (err) {
        console.error(`[DB MATCHES] ✗ ERROR:`, err.message);
        res.status(500).json({ error: err.message });
    }
};
