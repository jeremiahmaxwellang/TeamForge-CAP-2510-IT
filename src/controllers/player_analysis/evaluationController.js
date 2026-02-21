/**
 * Evaluation Controller
 * - contains the SQL Query for inserting/fetching a player's evaluation
 */

const db = require("../../config/database");

// Get a player's evaluation
exports.getEvaluation = async (req, res) => {

    try {
        const playerId = req.params.id;
        const sql = `
            SELECT * FROM evaluations WHERE playerId = ?
        `;

        const [rows] = await db.query(sql, [playerId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Eval not found' });
        }

        res.json(rows[0]);
        console.log("Eval: " + rows[0]);
    } catch (err) { 
        console.error("Error fetching evaluation:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
}

// Create new Evaluation
exports.createEvaluation = async (req, res) => {

    try {
        const playerId = req.params.id;
        const { comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId } = req.body;

        if(!playerId || !gameSense || !communication || !champPool) {
            return res.status(400).json({error: "Missing required fields"});
        }

        const sql = `
            INSERT INTO evaluations (playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId) 
            VALUES (?, ?, ?, ?, ?, ?)
            AS new
            DUPLICATE KEY UPDATE
                comment = new.comment,
                ratingGameSense = new.ratingGameSense,
                ratingCommunication = new.ratingCommunication,
                ratingChampionPool = new.ratingChampionPool,
                coachId = new.coachId
        `;

        await db.query(sql, [playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId]);
        
        // Fetch the updated eval
        const [rows] = await db.query("SELECT * FROM evaluations WHERE playerId = ?", [playerId]); 
        
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