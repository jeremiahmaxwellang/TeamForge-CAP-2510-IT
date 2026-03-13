/**
 * CHAMPION POOL Controller
 * - contains the SQL Query for fetching a player's champion statistics
 */

const db = require("../../config/database");

// Get a player's champion pool
exports.getChampionPool = async (req, res) => {
    try {
        const playerId = req.params.id;
        const sql = `
        SELECT mp.championName, mp.championId, COUNT(*) AS games, 
        CASE 
            WHEN mp.role = 'CARRY' AND mp.teamPosition = 'BOT' THEN 'ADC'
            WHEN mp.role = 'SUPPORT' AND mp.teamPosition = 'UTILITY' THEN 'SUPPORT'
            ELSE mp.teamPosition
        END AS champ_role,
        CONCAT(ROUND(AVG(CASE WHEN mp.win = 'W' THEN 1 ELSE 0 END) * 100, 1), '%') AS winrate,
        ROUND(AVG(CAST(mp.kills AS DECIMAL(10,2))), 1) AS avg_kills,
        ROUND(AVG(CAST(mp.deaths AS DECIMAL(10,2))), 1) AS avg_deaths,
        ROUND(AVG(CAST(mp.assists AS DECIMAL(10,2))), 1) AS avg_assists,
        ROUND(AVG(CAST(mp.creepScorePerMinute AS DECIMAL(10,2))), 1) AS avg_csm,
        ROUND(AVG(CAST(mp.goldPerMinute AS DECIMAL(10,2))), 1) AS avg_gpm,
        ROUND(AVG(CAST(mp.damageShare AS DECIMAL(10,2))), 1) AS avg_damageshare,

        CONCAT(ROUND(AVG(CAST(mp.killParticipation AS DECIMAL(10,2))), 1), '%') AS avg_kp
        FROM matches m
        JOIN matchParticipants mp ON m.matchId = mp.matchId
        JOIN players p ON p.puuid = mp.puuid
        WHERE m.userId = ?
        GROUP BY mp.championName, mp.championId, champ_role
        ORDER BY games DESC,  mp.championName;
        `;
        const [results] = await db.query(sql, [playerId]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============== SUMMARY TAB ==============

// Total unique champs
exports.getTotalChampions = async(req, res) => {
    try {
        const playerId = req.params.id;
        const sql = `
            SELECT COUNT(DISTINCT  mp.championId) AS totalChamps
            FROM matches m
                JOIN matchParticipants mp ON m.matchId = mp.matchId
                JOIN players p ON p.puuid = mp.puuid
            WHERE m.userId = ?
        `;
        const [results] = await db.query(sql, [playerId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Champions not found' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Top 3 Champs
exports.getChampionSummary = async (req, res) => {
    try {
        const playerId = req.params.id;
        const sql = `
            SELECT mp.championName, mp.championId, COUNT(*) AS games, 
                CASE 
                    WHEN mp.role = 'CARRY' AND mp.teamPosition = 'BOT' THEN 'ADC'
                    WHEN mp.role = 'SUPPORT' AND mp.teamPosition = 'UTILITY' THEN 'SUPPORT'
                    ELSE mp.teamPosition
                END AS champ_role,
                CONCAT(ROUND(AVG(CASE WHEN mp.win = 'W' THEN 1 ELSE 0 END) * 100, 1), '%') AS winrate,
                ROUND(AVG(CAST(mp.kills AS DECIMAL(10,2))), 1) AS avg_kills,
                ROUND(AVG(CAST(mp.deaths AS DECIMAL(10,2))), 1) AS avg_deaths,
                ROUND(AVG(CAST(mp.assists AS DECIMAL(10,2))), 1) AS avg_assists,
                ROUND(AVG(CAST(mp.creepScorePerMinute AS DECIMAL(10,2))), 1) AS avg_csm,
                ROUND(AVG(CAST(mp.goldPerMinute AS DECIMAL(10,2))), 1) AS avg_gpm,
                ROUND(AVG(CAST(mp.damageShare AS DECIMAL(10,2))), 1) AS avg_damageshare,
                CONCAT(ROUND(AVG(CAST(mp.killParticipation AS DECIMAL(10,2))), 1), '%') AS avg_kp
            FROM matches m
            JOIN matchParticipants mp ON m.matchId = mp.matchId
            JOIN players p ON p.puuid = mp.puuid
            CROSS JOIN total_champs tc
            WHERE m.userId = ?
            GROUP BY mp.championName, mp.championId, champ_role
            ORDER BY games DESC,  mp.championName
            LIMIT 3
        `;
        const [results] = await db.query(sql, [playerId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Champions not found' });
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};