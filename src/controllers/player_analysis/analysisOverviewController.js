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
