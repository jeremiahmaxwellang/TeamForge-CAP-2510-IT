const db = require("../config/database");

// Fetch all players
exports.getAllPlayers = async (req, res) => {
  try {
    const sql = `
      SELECT u.*, p.*
      FROM users u
      JOIN players p ON u.userId = p.userId
      WHERE u.position = 'Player'
    `;
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch player by ID
exports.getPlayerById = async (req, res) => {
  try {
    const playerId = req.params.id;
    const sql = `
      SELECT u.*, p.*
      FROM users u
      JOIN players p ON u.userId = p.userId
      WHERE u.userId = ? AND u.position = 'Player'
    `;
    const [results] = await db.query(sql, [playerId]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update puuid
exports.updatePuuid = async (req, res) => {
  try {
    const playerId = req.params.id;
    const { puuid } = req.body;

    const sql = `
      UPDATE players 
      SET puuid = ?
      WHERE userId = ?;
    `;
    const [result] = await db.query(sql, [puuid, playerId]);
     
    res.json({ success: true, affectedRows: result.affectedRows }); 
    console.log("PUUID update result:", result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};