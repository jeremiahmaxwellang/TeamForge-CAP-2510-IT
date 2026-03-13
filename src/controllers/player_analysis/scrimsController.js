/**
 * Scrims Controller
 * - contains the SQL Query for inserting/fetching scrim info
 */

const db = require("../../config/database");

const fetchEval = `
            SELECT e.*, s.name, p.gameName AS playerName, s.date AS scrimDate
            FROM evaluations e
            JOIN scrims s ON e.scrimId = s.scrimId
            JOIN players p ON e.playerId = p.userId
            WHERE e.playerId = ? AND e.scrimId = ?
        `;

// Get a player's Scrims
exports.getScrims = async (req, res) => {

    // TODO: make this fetch all the team players
    try {
        const playerId = req.params.id;
        const sql = `
            SELECT *
            FROM scrims s 
            JOIN scrimPlayers p ON s.scrimId = p.scrimId
            WHERE p.playerId = ?
            ORDER BY s.date DESC
        `;

        const [rows] = await db.query(sql, [playerId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Scrim not found' });
        }

        res.json(rows);

    } catch (err) { 
        console.error("Error fetching scrim:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

const fetchTimesPlayed = `
    SELECT sp2.playerId, 
    CONCAT(p.gameName , ' (', r.displayedRole, ')') AS gameName, 
    COUNT(*) AS timesPlayed, 
    ROUND(AVG(CAST(e.ratingCommunication AS DECIMAL(10,2))), 1) AS averageComms
    FROM scrimPlayers sp1 -- Currently Selected Player
	JOIN 
		scrimPlayers sp2 ON sp1.scrimId = sp2.scrimId
        AND sp1.playerId <> sp2.playerId
	JOIN 
		players p ON sp2.playerId = p.userId
	JOIN 
		leagueRoles r ON r.roleId = sp2.roleId
	LEFT JOIN 
		evaluations e ON sp1.scrimId = e.scrimId
        AND e.playerId = sp1.playerId -- only ratings for player 4
    
    WHERE sp1.playerId = ?
    GROUP BY sp2.playerId, CONCAT(p.gameName , ' (', r.displayedRole, ')') 
    ORDER BY timesPlayed DESC;
`;

// Get times played with other players
exports.getTimesPlayed = async (req, res) => {

    try {
        const playerId = req.params.id;

        const [rows] = await db.query(fetchTimesPlayed, [playerId]);

        console.log(rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Scrim not found' });
        }

        res.json(rows);
        
    } catch (err) { 
        console.error("Error fetching times played:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get a player's evaluation
exports.getEvaluation = async (req, res) => {

    try {
        const playerId = req.params.playerId;
        const scrimId = req.params.scrimId;

        const [rows] = await db.query(fetchEval, [playerId, scrimId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Eval not found' });
        }

        res.json(rows[0]);
        // console.log("Eval: " + rows[0]);
    } catch (err) { 
        console.error("Error fetching evaluation:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

// Create new Evaluation
exports.createEvaluation = async (req, res) => {

    try {
        const playerId = req.params.playerId;
        const scrimId = req.params.scrimId;

        const { comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId } = req.body;

        if(!playerId || !ratingGameSense || !ratingCommunication || !ratingChampionPool) {
            return res.status(400).json({error: "Missing required fields"});
        }

        const sql = `
            INSERT INTO evaluations (scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
            AS new
            ON DUPLICATE KEY UPDATE
                comment = new.comment,
                ratingGameSense = new.ratingGameSense, 
                ratingCommunication = new.ratingCommunication, 
                ratingChampionPool = new.ratingChampionPool, 
                coachId = new.coachId
        `;

        await db.query(sql, [scrimId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId]);

        // Fetch the updated eval
        const [rows] = await db.query(fetchEval, [playerId, scrimId]); 
        
        if (rows.length === 0) { 
            return res.status(404).json({ message: "Evaluation not found after insert/update" }); 
        }
         
        res.json({ success: true, evaluation: rows[0] }); 
        console.log("Eval saved:", rows[0]);

    } catch (err) { 
        console.error("Error fetching evaluation:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

// ============== SUMMARY TAB ==============

const fetchScrimSummary = `
    WITH total_scrims AS (
    SELECT COUNT(DISTINCT sp.scrimId) AS totalScrims,
        ROUND(AVG(CAST(e.ratingGameSense AS DECIMAL(10,2))), 1) AS averageGameSense,
        ROUND(AVG(CAST(e.ratingCommunication AS DECIMAL(10,2))), 1) AS averageComms,
        ROUND(AVG(CAST(e.ratingChampionPool AS DECIMAL(10,2))), 1) AS averageChampionPool
    FROM scrimPlayers sp
    JOIN evaluations e ON e.playerId = sp.playerId
    WHERE sp.playerId = ?
    )
    SELECT 
        ts.totalScrims, 
        ts.averageGameSense, ts.averageComms, ts.averageChampionPool,
        sp2.playerId AS teammateId,
        CONCAT(p.gameName , ' (', r.displayedRole, ')') AS mostPlayedWith,
        COUNT(DISTINCT sp1.scrimId) AS scrimsTogether
    FROM scrimPlayers sp1
    JOIN scrimPlayers sp2 
    ON sp1.scrimId = sp2.scrimId
    AND sp1.playerId <> sp2.playerId
    JOIN players p 
    ON sp2.playerId = p.userId
    JOIN leagueRoles r 
    ON r.roleId = p.primaryRoleId

    CROSS JOIN total_scrims ts
    WHERE sp1.playerId = ?
    GROUP BY 
        sp2.playerId, 
        CONCAT(p.gameName , ' (', r.displayedRole, ')'), 
        ts.totalScrims
    ORDER BY scrimsTogether DESC
    LIMIT 1;
`;

// Get scrims summary
exports.getScrimSummary = async (req, res) => {

    try {
        const playerId = req.params.id;

        const [rows] = await db.query(fetchScrimSummary, [playerId, playerId]);

        console.log(rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Scrim not found' });
        }

        res.json(rows);
        
    } catch (err) { 
        console.error("Error fetching times played:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

const commsSummary = `
SELECT 
	sp2.playerId AS teammateId,
    CONCAT(p.gameName , ' (', r.displayedRole, ')') AS teammate,
    ROUND(AVG(DISTINCT e1.ratingCommunication), 1) AS avg_comms,
    ROUND(AVG(DISTINCT e2.ratingCommunication), 1) AS teammate_avg_comms
FROM scrimPlayers sp1
JOIN scrimPlayers sp2 
  ON sp1.scrimId = sp2.scrimId
  AND sp1.playerId <> sp2.playerId
JOIN players p 
  ON sp2.playerId = p.userId
JOIN leagueRoles r 
  ON r.roleId = p.primaryRoleId
JOIN evaluations e1 
	ON e1.playerId = sp1.playerId
JOIN evaluations e2
	ON e2.playerId = sp2.playerId

WHERE sp1.playerId = ?
GROUP BY 
	sp2.playerId, 
	CONCAT(p.gameName , ' (', r.displayedRole, ')')
ORDER BY avg_comms, teammate_avg_comms DESC
LIMIT 1;
`
exports.getCommsSummary = async (req, res) => {

    try {
        const playerId = req.params.id;

        const [rows] = await db.query(commsSummary, playerId);

        console.log(rows);

        res.json(rows[0]);
        
    } catch (err) { 
        console.error("Error fetching comms summary:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}