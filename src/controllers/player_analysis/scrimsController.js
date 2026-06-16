/**
 * Scrims Controller
 * - Refactored to use events, event_attendees, player_evaluations tables
 */

const db = require("../../config/database");

// ── SHARED FETCH EVAL QUERY ───────────────────────────────────────────────────
const fetchEvalQuery = `
  SELECT 
    pe.*,
    e.title_summary AS name,
    e.start_datetime AS scrimDate,
    p.gameName AS playerName
  FROM player_evaluations pe
  JOIN events e ON pe.eventId = e.eventId
  JOIN players p ON pe.playerId = p.userId
  WHERE pe.playerId = ? AND pe.eventId = ?
`;

// ── GET SCRIMS ────────────────────────────────────────────────────────────────
exports.getScrims = async (req, res) => {
  try {
    const playerId = req.params.id;

    const sql = `
    SELECT
        e.eventId,
        e.title_summary,
        e.start_datetime,
        e.videoLink,
        e.length,
        e.win,
        ea.player_role AS roleId,
        CASE
        WHEN EXISTS (
            SELECT 1 FROM player_evaluations pe
            WHERE pe.eventId = e.eventId AND pe.playerId = ?
        ) THEN 'evaluated'
        ELSE 'unevaluated'
        END AS status,
        CONCAT(pl.gameName, ' (', lr.displayedRole, ')') AS playerDisplay,
        -- All attendees comma-separated for the Team column
        (
        SELECT GROUP_CONCAT(
            CONCAT(pl2.gameName)
            ORDER BY pl2.gameName
            SEPARATOR ', '
        )
        FROM event_attendees ea2
        JOIN players pl2 ON ea2.userId = pl2.userId
        WHERE ea2.eventId = e.eventId
        ) AS teamDisplay
    FROM events e
    JOIN event_attendees ea
        ON e.eventId = ea.eventId AND ea.userId = ?
    JOIN players pl
        ON ea.userId = pl.userId
    LEFT JOIN leagueroles lr
        ON ea.player_role = lr.roleId
    WHERE e.type = 'Scrim'
    GROUP BY
        e.eventId, e.title_summary, e.start_datetime,
        e.videoLink, e.length, e.win,
        ea.player_role, pl.gameName, pl.tagLine, lr.displayedRole
    ORDER BY
        CASE
        WHEN EXISTS (
            SELECT 1 FROM player_evaluations pe
            WHERE pe.eventId = e.eventId AND pe.playerId = ?
        ) THEN 0
        ELSE 1
        END,
        e.start_datetime DESC
    `;

    const [rows] = await db.query(sql, [playerId, playerId, playerId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No scrims found for this player.' });
    }

    res.json(rows);

  } catch (err) {
    console.error('[getScrims] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ── GET TIMES PLAYED ──────────────────────────────────────────────────────────
exports.getTimesPlayed = async (req, res) => {
  try {
    const playerId = req.params.id;

    const sql = `
      SELECT
        ea2.userId AS playerId,
        CONCAT(p.gameName, ' (', r.displayedRole, ')') AS gameName,
        COUNT(*) AS timesPlayed,
        ROUND(
          AVG(CAST(pe.ratingCommunication AS DECIMAL(10,2))),
        1) AS averageComms
      FROM event_attendees ea1
      JOIN event_attendees ea2
        ON ea1.eventId = ea2.eventId
        AND ea1.userId <> ea2.userId
      JOIN events e
        ON ea1.eventId = e.eventId AND e.type = 'Scrim'
      JOIN players p
        ON ea2.userId = p.userId
      LEFT JOIN leagueroles r
        ON ea2.player_role = r.roleId
      LEFT JOIN player_evaluations pe
        ON ea1.eventId = pe.eventId
        AND pe.playerId = ea1.userId
      WHERE ea1.userId = ?
      GROUP BY
        ea2.userId,
        CONCAT(p.gameName, ' (', r.displayedRole, ')')
      ORDER BY timesPlayed DESC
    `;

    const [rows] = await db.query(sql, [playerId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No teammates found.' });
    }

    res.json(rows);

  } catch (err) {
    console.error('[getTimesPlayed] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ── GET EVALUATION ────────────────────────────────────────────────────────────
exports.getEvaluation = async (req, res) => {
  try {
    const { playerId, scrimId: eventId } = req.params;

    const [rows] = await db.query(fetchEvalQuery, [playerId, eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Evaluation not found.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('[getEvaluation] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ── CREATE / UPDATE EVALUATION ────────────────────────────────────────────────
exports.createEvaluation = async (req, res) => {
  try {
    const { playerId, scrimId: eventId } = req.params;
    const { comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId } = req.body;

    if (!playerId || !ratingGameSense || !ratingCommunication || !ratingChampionPool) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const sql = `
      INSERT INTO player_evaluations
        (eventId, playerId, comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        comment             = VALUES(comment),
        ratingGameSense     = VALUES(ratingGameSense),
        ratingCommunication = VALUES(ratingCommunication),
        ratingChampionPool  = VALUES(ratingChampionPool),
        coachId             = VALUES(coachId)
    `;

    await db.query(sql, [
      eventId, playerId,
      comment, ratingGameSense, ratingCommunication, ratingChampionPool, coachId
    ]);

    // Return the saved evaluation
    const [rows] = await db.query(fetchEvalQuery, [playerId, eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Evaluation not found after save.' });
    }

    console.log('[createEvaluation] Saved:', rows[0]);
    res.json({ success: true, evaluation: rows[0] });

  } catch (err) {
    console.error('[createEvaluation] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ── SCRIM SUMMARY ─────────────────────────────────────────────────────────────
exports.getScrimSummary = async (req, res) => {
  try {
    const playerId = req.params.id;

    const sql = `
      WITH total_scrims AS (
        SELECT
          COUNT(DISTINCT ea.eventId) AS totalScrims,
          ROUND(AVG(CAST(pe.ratingGameSense     AS DECIMAL(10,2))), 1) AS averageGameSense,
          ROUND(AVG(CAST(pe.ratingCommunication AS DECIMAL(10,2))), 1) AS averageComms,
          ROUND(AVG(CAST(pe.ratingChampionPool  AS DECIMAL(10,2))), 1) AS averageChampionPool
        FROM event_attendees ea
        JOIN events e ON ea.eventId = e.eventId AND e.type = 'Scrim'
        JOIN player_evaluations pe
          ON pe.playerId = ea.userId AND pe.eventId = ea.eventId
        WHERE ea.userId = ?
      )
      SELECT
        ts.totalScrims,
        ts.averageGameSense,
        ts.averageComms,
        ts.averageChampionPool,
        ea2.userId AS teammateId,
        CONCAT(p.gameName, ' (', r.displayedRole, ')') AS mostPlayedWith,
        COUNT(DISTINCT ea1.eventId) AS scrimsTogether
      FROM event_attendees ea1
      JOIN events e
        ON ea1.eventId = e.eventId AND e.type = 'Scrim'
      JOIN event_attendees ea2
        ON ea1.eventId = ea2.eventId AND ea1.userId <> ea2.userId
      JOIN players p
        ON ea2.userId = p.userId
      JOIN leagueroles r
        ON r.roleId = p.primaryRoleId
      CROSS JOIN total_scrims ts
      WHERE ea1.userId = ?
      GROUP BY
        ea2.userId,
        CONCAT(p.gameName, ' (', r.displayedRole, ')'),
        ts.totalScrims, ts.averageGameSense,
        ts.averageComms, ts.averageChampionPool
      ORDER BY scrimsTogether DESC
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [playerId, playerId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No scrim summary found.' });
    }

    res.json(rows);

  } catch (err) {
    console.error('[getScrimSummary] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ── COMMS SUMMARY ─────────────────────────────────────────────────────────────
exports.getCommsSummary = async (req, res) => {
  try {
    const playerId = req.params.id;

    const sql = `
      SELECT
        ea2.userId AS teammateId,
        CONCAT(p.gameName, ' (', r.displayedRole, ')') AS teammate,
        ROUND(AVG(pe1.ratingCommunication), 1) AS avg_comms,
        ROUND(AVG(pe2.ratingCommunication), 1) AS teammate_avg_comms
      FROM event_attendees ea1
      JOIN events e
        ON ea1.eventId = e.eventId AND e.type = 'Scrim'
      JOIN event_attendees ea2
        ON ea1.eventId = ea2.eventId AND ea1.userId <> ea2.userId
      JOIN players p
        ON ea2.userId = p.userId
      JOIN leagueroles r
        ON r.roleId = p.primaryRoleId
      LEFT JOIN player_evaluations pe1
        ON pe1.playerId = ea1.userId AND pe1.eventId = ea1.eventId
      LEFT JOIN player_evaluations pe2
        ON pe2.playerId = ea2.userId AND pe2.eventId = ea2.eventId
      WHERE ea1.userId = ?
      GROUP BY
        ea2.userId,
        CONCAT(p.gameName, ' (', r.displayedRole, ')')
      ORDER BY avg_comms, teammate_avg_comms DESC
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [playerId]);

    res.json(rows[0] || null);

  } catch (err) {
    console.error('[getCommsSummary] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};