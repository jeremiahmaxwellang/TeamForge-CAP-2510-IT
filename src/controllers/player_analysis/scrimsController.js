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
        // console.log(rows);

    } catch (err) { 
        console.error("Error fetching scrim:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

const fetchTimesPlayed = `
    SELECT sp2.playerId, p.gameName, COUNT(*) AS timesPlayed
    FROM scrimPlayers sp1
    JOIN scrimPlayers sp2 ON sp1.scrimId = sp2.scrimId
    JOIN players p ON sp2.playerId = p.userId
    AND sp1.playerId <> sp2.playerId
    WHERE sp1.playerId = ?
    GROUP BY sp2.playerId 
    ORDER BY timesPlayed DESC
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