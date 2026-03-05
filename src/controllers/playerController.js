const db = require("../config/database");

// ============ BENCHMARKS HELPER FUNCTIONS ============

/**
 * Check if benchmarks table is empty
 */
async function isBenchmarksTableEmpty() {
  try {
    const [result] = await db.query("SELECT COUNT(*) as count FROM benchmarks");
    const isEmpty = result[0].count === 0;
    console.log("[BENCHMARKS] isBenchmarksTableEmpty check - count:", result[0].count, "isEmpty:", isEmpty);
    return isEmpty;
  } catch (err) {
    console.error("[BENCHMARKS] Error checking table status:", err);
    throw err;
  }
}

/**
 * Insert default benchmarks for all roles
 */
async function insertDefaultMetrics() {
  const metrics = [
    { metricId: 1,  metricName: "averageAdcProximityAt15",      metricDescription: "Average Proximity Time to ADC by 15 minutes" },
    { metricId: 2,  metricName: "averageAssists",              metricDescription: "Average Assists per game" },
    { metricId: 3,  metricName: "averageCsDiffAt15",           metricDescription: "Average CS Difference at 15 minutes" },
    { metricId: 4,  metricName: "averageCsPerMinute",          metricDescription: "Average Creep Score per Minute" },
    { metricId: 5,  metricName: "averageDamageShare",          metricDescription: "Average Damage Share Percentage" },
    { metricId: 6,  metricName: "averageDamageToBuildings",    metricDescription: "Average Damage dealt to buildings" },
    { metricId: 7,  metricName: "averageDeaths",               metricDescription: "Average Deaths per game" },
    { metricId: 8,  metricName: "averageDragonKills",          metricDescription: "Average Dragon Kills" },
    { metricId: 9,  metricName: "averageEnemyJungleControl",   metricDescription: "Average Enemy Jungle Monster Kills" },
    { metricId: 10, metricName: "averageGoldDiffAt15",         metricDescription: "Average Gold Difference at 15 minutes" },
    { metricId: 11, metricName: "averageGoldPerMinute",        metricDescription: "Average Gold Per Minute" },
    { metricId: 12, metricName: "averageKDA",                  metricDescription: "Average Kill/Death/Assist Ratio" },
    { metricId: 13, metricName: "averageKillParticipation",    metricDescription: "Average Kill Participation Percentage" },
    { metricId: 14, metricName: "averageKills",                metricDescription: "Average Kills per game" },
    { metricId: 15, metricName: "averageSoloKills",            metricDescription: "Average Solo Kills per game" },
    { metricId: 16, metricName: "averageTeamBaronKills",       metricDescription: "Average Team Baron Kills" },
    { metricId: 17, metricName: "averageTeamElderDragonKills", metricDescription: "Average Team Elder Dragon Kills" },
    { metricId: 18, metricName: "averageTeamRiftHeraldKills",  metricDescription: "Average Team Rift Herald Kills" },
    { metricId: 19, metricName: "averageTotalDamageTaken",     metricDescription: "Average Total Damage Taken" },
    { metricId: 20, metricName: "averageVisionScorePerMinute", metricDescription: "Average Vision Score Per Minute" },
    { metricId: 21, metricName: "averageVisionScoreShare",     metricDescription: "Average Vision Score Share Percentage" },
    { metricId: 22, metricName: "averageVoidMonsterKills",     metricDescription: "Average Void Monster Kills" },
    { metricId: 23, metricName: "averageWardsDestroyed",       metricDescription: "Average Total Wards Destroyed" },
    { metricId: 24, metricName: "averageWardsPlaced",          metricDescription: "Average Total Wards Placed" },
    { metricId: 25, metricName: "averageXpDiffAt15",           metricDescription: "Average Experience Difference at 15 minutes" },
    { metricId: 26, metricName: "averageWinrate",              metricDescription: "Average Winrate" },
  ];

  let insertedCount = 0;

  console.log("[METRICS] insertDefaultMetrics: Starting to insert", metrics.length, "metrics");

  for (const metric of metrics) {
    try {
      const sql = `
        INSERT INTO metrics (metricId, metricName, metricDescription)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          metricName = VALUES(metricName),
          metricDescription = VALUES(metricDescription)
      `;

      await db.query(sql, [
        metric.metricId,
        metric.metricName,
        metric.metricDescription,
      ]);

      insertedCount++;
      console.log(`[METRICS] Upserted metric ${metric.metricId}: ${metric.metricName}`);
    } catch (err) {
      console.error(`[METRICS] Error upserting metric ${metric.metricId}:`, err);
      throw err;
    }
  }

  console.log("[METRICS] insertDefaultMetrics: Successfully processed", insertedCount, "metrics");
  return insertedCount;
}

/**
 * Main seed function - checks if empty and inserts defaults
 */
async function seedBenchmarks() {
  try {
    console.log("[BENCHMARKS] Starting seed process...");
    
    const isEmpty = await isBenchmarksTableEmpty();
    
    if (isEmpty) {
      console.log("[BENCHMARKS] Table is empty, inserting default benchmarks...");
      const insertedCount = await insertDefaultBenchmarks();
      console.log(`[BENCHMARKS] Successfully inserted ${insertedCount} benchmarks`);
      return insertedCount; // just a number
    } else {
      const [result] = await db.query("SELECT COUNT(*) as count FROM benchmarks");
      console.log(`[BENCHMARKS] Table already populated with ${result[0].count} benchmarks`);
      return 0; // nothing inserted
    }

  } catch (err) {
    console.error("[BENCHMARKS] Error in seedBenchmarks:", err);
    throw err;
  }
}

// ============ PLAYER CONTROLLER EXPORTS ============

// Fetch all players
exports.getAllPlayers = async (req, res) => {
  try {
    const sql = `
	  SELECT u.*, p.*, 
      r1.displayedRole AS primaryRole, r2.displayedRole AS secondaryRole
      FROM users u
      JOIN players p ON u.userId = p.userId
	    JOIN leagueRoles r1 ON p.primaryRoleId = r1.roleId
      JOIN leagueRoles r2 ON p.secondaryRoleId = r2.roleId
      WHERE u.position = 'Player'
      ORDER BY primaryRoleId;
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
      SELECT u.*, p.*, 
      r1.displayedRole AS primaryRole, r1.role AS riotRole1, r1.teamPosition AS riotTeamPosition1,
      r2.displayedRole AS secondaryRole, r2.role AS riotRole2, r2.teamPosition AS riotTeamPosition2
      FROM users u
      JOIN players p ON u.userId = p.userId
      JOIN leagueRoles r1 ON p.primaryRoleId = r1.roleId
      JOIN leagueRoles r2 ON p.secondaryRoleId = r2.roleId
      WHERE u.userId = ? AND u.position = 'Player';
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

/**
 * Store a player statistic into playerStatistics table.
 * Expects body: { userId, roleId, metricId, metricValue }
 */
exports.storePlayerStatistic = async (req, res) => {
  try {
    const { userId, roleId, metricId, metricValue } = req.body;
    const parsedMetricValue = Number(metricValue);

    if (!userId || !metricId || metricValue === undefined || metricValue === null) {
      return res.status(400).json({ error: 'userId, metricId and metricValue are required' });
    }

    if (!Number.isFinite(parsedMetricValue)) {
      return res.status(400).json({ error: 'metricValue must be a valid number' });
    }

    const sql = `
      INSERT INTO playerStatistics (userId, metricId, roleId, metricValue, recordedAt)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        metricValue = VALUES(metricValue),
        recordedAt = NOW()
    `;

    await db.query(sql, [userId, metricId, roleId || null, Math.round(parsedMetricValue)]);

    res.json({ success: true });
  } catch (err) {
    console.error('[PLAYER STATS] Error storing player statistic:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ============ BENCHMARKS FUNCTIONS ============

/**
 * Check if benchmarks table is empty and return status
 */
exports.checkBenchmarkStatus = async (req, res) => {
  try {
    const isEmpty = await isBenchmarksTableEmpty();
    
    if (isEmpty) {
      res.json({ 
        status: 'empty', 
        message: 'Benchmarks table is empty',
        isEmpty: true
      });
    } else {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM benchmarks');
      res.json({ 
        status: 'populated', 
        message: 'Benchmarks table contains data',
        isEmpty: false,
        benchmarkCount: rows[0].count
      });
    }
  } catch (err) {
    console.error('[BENCHMARKS] Error checking status:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Initialize benchmarks - check if empty and insert defaults
 */
exports.initializeBenchmarks = async (req, res) => {
  try {
    console.log('[BENCHMARKS] Initialize request received');
    const result = await seedBenchmarks();
    
    console.log('[BENCHMARKS] Seed result:', result);
    
    res.json({ 
      success: true,
      message: result.message || 'Benchmarks initialized successfully',
      insertedCount: result.insertedCount,
      result
    });
  } catch (err) {
    console.error('[BENCHMARKS] Error initializing:', err.message);
    console.error('[BENCHMARKS] Full error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * Get all benchmarks for a specific role
 */
exports.getBenchmarksByRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    if (!roleId) {
      return res.status(400).json({ error: 'roleId is required' });
    }

    const [benchmarks] = await db.query(
      `SELECT b.benchmarkId, b.roleId, m.metricName, b.benchmarkValue, b.comparator
       FROM benchmarks b
       LEFT JOIN metrics m ON b.metricId = m.metricId
       WHERE b.roleId = ? 
       ORDER BY b.benchmarkId ASC`,
      [roleId]
    );

    if (benchmarks.length === 0) {
      return res.json({ 
        message: 'No benchmarks found for this role',
        benchmarks: []
      });
    }

    res.json({ 
      roleId: parseInt(roleId),
      benchmarkCount: benchmarks.length,
      benchmarks 
    });
  } catch (err) {
    console.error('[BENCHMARKS] Error fetching benchmarks:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all benchmarks
 */
exports.getAllBenchmarks = async (req, res) => {
  try {
    const [benchmarks] = await db.query(
      `SELECT b.benchmarkId, b.roleId, lr.displayedRole, m.metricName, b.benchmarkValue, b.comparator
       FROM benchmarks b
       LEFT JOIN leagueRoles lr ON b.roleId = lr.roleId
       LEFT JOIN metrics m ON b.metricId = m.metricId
       ORDER BY b.roleId ASC, b.benchmarkId ASC`
    );

    res.json({ 
      totalBenchmarks: benchmarks.length,
      benchmarks 
    });
  } catch (err) {
    console.error('[BENCHMARKS] Error fetching all benchmarks:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update a specific benchmark
 */
exports.updateBenchmark = async (req, res) => {
  try {
    const { benchmarkId } = req.params;
    const { benchmarkValue, comparator } = req.body;

    if (!benchmarkId) {
      return res.status(400).json({ error: 'benchmarkId is required' });
    }

    if (benchmarkValue === undefined || !comparator) {
      return res.status(400).json({ 
        error: 'benchmarkValue and comparator are required' 
      });
    }

    const sql = `
      UPDATE benchmarks 
      SET benchmarkValue = ?, comparator = ?
      WHERE benchmarkId = ?
    `;

    const [result] = await db.query(sql, [benchmarkValue, comparator, benchmarkId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Benchmark not found' });
    }

    res.json({ 
      success: true,
      message: 'Benchmark updated successfully',
      affectedRows: result.affectedRows
    });
  } catch (err) {
    console.error('[BENCHMARKS] Error updating benchmark:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete all benchmarks (admin function)
 */
exports.clearBenchmarks = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM benchmarks');

    res.json({ 
      success: true,
      message: 'All benchmarks deleted',
      deletedRows: result.affectedRows
    });
  } catch (err) {
    console.error('[BENCHMARKS] Error clearing benchmarks:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get benchmarks with player performance comparison
 * Compare a player's stats against role benchmarks
 */
exports.comparePlayerToBenchmarks = async (req, res) => {
  try {
    const { roleId, playerStats } = req.body;

    if (!roleId) {
      return res.status(400).json({ error: 'roleId is required' });
    }

    if (!playerStats || typeof playerStats !== 'object') {
      return res.status(400).json({ error: 'playerStats object is required' });
    }

    const [benchmarks] = await db.query(
      `SELECT b.benchmarkId, m.metricName, b.benchmarkValue, b.comparator
       FROM benchmarks b
       LEFT JOIN metrics m ON b.metricId = m.metricId
       WHERE b.roleId = ?
       ORDER BY b.benchmarkId ASC`,
      [roleId]
    );

    if (benchmarks.length === 0) {
      return res.status(404).json({ error: 'No benchmarks found for this role' });
    }

    // Compare player stats against benchmarks
    const comparison = benchmarks.map(benchmark => {
      const playerValue = playerStats[benchmark.metricName];
      const meetsStandard = evaluateComparison(playerValue, benchmark.benchmarkValue, benchmark.comparator);

      return {
        metricName: benchmark.metricName,
        benchmarkValue: benchmark.benchmarkValue,
        playerValue: playerValue || 'N/A',
        comparator: benchmark.comparator,
        meetsStandard,
        status: meetsStandard ? '✓' : '✗'
      };
    });

    // Calculate overall performance percentage
    const metGuidelines = comparison.filter(c => c.meetsStandard).length;
    const performancePercentage = (metGuidelines / comparison.length * 100).toFixed(1);

    res.json({ 
      roleId,
      benchmarkComparison: comparison,
      summary: {
        metGuidelines,
        totalGuidelines: comparison.length,
        performancePercentage: `${performancePercentage}%`
      }
    });
  } catch (err) {
    console.error('[BENCHMARKS] Error comparing stats:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Calculate player stats from match participants and compare against benchmarks
 * POST /player_analysis/calculate-stats
 * Request body: { playerId, roleId }
 * NOTE: Uses only the 15 most recent matches for averaging stats
 */
exports.calculatePlayerStatsFromMatches = async (req, res) => {
  try {
    const { playerId, roleId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }

    if (!roleId) {
      return res.status(400).json({ error: 'roleId is required' });
    }

    const [roleRows] = await db.query(
      `SELECT p.puuid, p.primaryRoleId, p.secondaryRoleId,
              r1.teamPosition AS primaryTeamPosition,
              r2.teamPosition AS secondaryTeamPosition
       FROM players p
       JOIN leagueRoles r1 ON p.primaryRoleId = r1.roleId
       LEFT JOIN leagueRoles r2 ON p.secondaryRoleId = r2.roleId
       WHERE p.userId = ?
       LIMIT 1`,
      [playerId]
    );

    const roleInfo = roleRows[0];
    if (!roleInfo || !roleInfo.puuid) {
      return res.status(404).json({ error: 'Player role or PUUID not found' });
    }

    const [primaryMatches] = await db.query(
      `SELECT mp.* FROM matchParticipants mp
       JOIN matches m ON mp.matchId = m.matchId
       WHERE mp.puuid = ? AND mp.teamPosition = ?
       ORDER BY COALESCE(m.gameStartTimestamp, m.gameCreation) DESC
       LIMIT 15`,
      [roleInfo.puuid, roleInfo.primaryTeamPosition]
    );

    const [secondaryMatches] =
      roleInfo.secondaryTeamPosition && roleInfo.secondaryTeamPosition !== roleInfo.primaryTeamPosition
        ? await db.query(
            `SELECT mp.* FROM matchParticipants mp
             JOIN matches m ON mp.matchId = m.matchId
             WHERE mp.puuid = ? AND mp.teamPosition = ?
             ORDER BY COALESCE(m.gameStartTimestamp, m.gameCreation) DESC
             LIMIT 15`,
            [roleInfo.puuid, roleInfo.secondaryTeamPosition]
          )
        : [[]];

    const deduped = new Map();
    [...primaryMatches, ...secondaryMatches].forEach((participantRow) => {
      if (!deduped.has(participantRow.matchId)) {
        deduped.set(participantRow.matchId, participantRow);
      }
    });

    const matchParticipants = Array.from(deduped.values());

    if (matchParticipants.length === 0) {
      return res.json({
        success: true,
        message: 'Player has no match data yet',
        playerStats: {},
        benchmarkComparison: []
      });
    }

    // Calculate aggregate stats from all matches
    const playerStats = calculateAggregateStats(matchParticipants);

    // Fetch benchmarks for the role
    const [benchmarks] = await db.query(
      `SELECT b.benchmarkId, m.metricName, b.benchmarkValue, b.comparator
       FROM benchmarks b
       LEFT JOIN metrics m ON b.metricId = m.metricId
       WHERE b.roleId = ?
       ORDER BY b.benchmarkId ASC`,
      [roleId]
    );

    if (benchmarks.length === 0) {
      return res.json({
        success: true,
        message: 'No benchmarks found for this role',
        playerStats,
        benchmarkComparison: []
      });
    }

    // Compare player stats against benchmarks
    const comparison = benchmarks.map(benchmark => {
      const playerValue = playerStats[benchmark.metricName];
      const meetsStandard = evaluateComparison(playerValue, benchmark.benchmarkValue, benchmark.comparator);

      return {
        benchmarkId: benchmark.benchmarkId,
        metricName: benchmark.metricName,
        benchmarkValue: parseFloat(benchmark.benchmarkValue),
        playerValue: playerValue !== undefined ? parseFloat(playerValue).toFixed(2) : 'N/A',
        comparator: benchmark.comparator,
        meetsStandard,
        status: meetsStandard ? '✓' : '✗'
      };
    });

    // Calculate overall performance percentage
    const metGuidelines = comparison.filter(c => c.meetsStandard).length;
    const performancePercentage = (metGuidelines / comparison.length * 100).toFixed(1);

    // Saving to playerstatistics table
    await saveCalculatedStats(playerId, roleId, playerStats);

    res.json({
      success: true,
      playerId,
      roleId,
      matchCount: matchParticipants.length,
      playerStats: playerStats,
      benchmarkComparison: comparison,
      summary: {
        metGuidelines,
        totalGuidelines: comparison.length,
        performancePercentage: `${performancePercentage}%`
      }
    });
  } catch (err) {
    console.error('[BENCHMARKS] Error calculating player stats:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Helper function to calculate aggregate stats from match participants
 */
function calculateAggregateStats(matchParticipants) {
  if (!matchParticipants || matchParticipants.length === 0) {
    return {};
  }

  const count = matchParticipants.length;
  let totals = {
    kills: 0,
    deaths: 0,
    assists: 0,
    creepScore: 0,
    goldEarned: 0,
    visionScore: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    soloKills: 0,
    wardsPlaced: 0,
    wardsKilled: 0,
    damageDealthToBuildings: 0,
    teamBaronKills: 0,
    teamElderDragonKills: 0,
    dragonKills: 0
  };

  matchParticipants.forEach(participant => {
    totals.kills += participant.kills || 0;
    totals.deaths += participant.deaths || 0;
    totals.assists += participant.assists || 0;
    totals.creepScore += participant.creepScore || 0;
    totals.goldEarned += participant.goldEarned || 0;
    totals.visionScore += participant.visionScore || 0;
    totals.totalDamageDealt += participant.totalDamageDealt || 0;
    totals.totalDamageTaken += participant.totalDamageTaken || 0;
    totals.soloKills += participant.soloKills || 0;
    totals.wardsPlaced += participant.wardsPlaced || 0;
    totals.wardsKilled += participant.wardsKilled || 0;
    totals.damageDealthToBuildings += participant.damageDealthToBuildings || 0;
    totals.teamBaronKills += participant.teamBaronKills || 0;
    totals.teamElderDragonKills += participant.teamElderDragonKills || 0;
    totals.dragonKills += participant.dragonKills || 0;
  });

  // Get game duration from first match (assuming all recent matches have similar duration)
  const gameDuration = 25; // Average 25 minutes per game for normalization

  // Calculate per-minute stats
  const playerStats = {
    'Kills': (totals.kills / count).toFixed(2),
    'Deaths': (totals.deaths / count).toFixed(2),
    'Assists': (totals.assists / count).toFixed(2),
    'KDA': ((totals.kills + totals.assists) / (totals.deaths || 1)).toFixed(2),
    'CS Per Minute': (totals.creepScore / count / gameDuration).toFixed(2),
    'Gold Per Minute': (totals.goldEarned / count / gameDuration).toFixed(2),
    'Vision Score Per Minute': (totals.visionScore / count / gameDuration).toFixed(3),
    'Total Damage Dealt': (totals.totalDamageDealt / count).toFixed(2),
    'Total Damage Taken': (totals.totalDamageTaken / count).toFixed(2),
    'Solo Kills': (totals.soloKills / count).toFixed(2),
    'Total Wards Placed': (totals.wardsPlaced / count).toFixed(2),
    'Total Wards Destroyed': (totals.wardsKilled / count).toFixed(2),
    'Damage to Buildings': (totals.damageDealthToBuildings / count).toFixed(2),
    'Kill Participation': calculateKillParticipation(matchParticipants),
    'Vision Score Share': calculateVisionScoreShare(matchParticipants),
    'Damage Share': calculateDamageShare(matchParticipants),
    'Dragon Kills': (totals.dragonKills / count).toFixed(2),
    'Team Baron Kills': (totals.teamBaronKills / count).toFixed(2),
    'Team Elder Dragon Kills': (totals.teamElderDragonKills / count).toFixed(2)
  };

  return playerStats;
}

/**
 * Calculate kill participation percentage
 */
function calculateKillParticipation(matchParticipants) {
  if (!matchParticipants || matchParticipants.length === 0) return 0;

  const avgKillParticipation = matchParticipants.reduce((sum, p) => {
    return sum + (p.killParticipation || 0);
  }, 0) / matchParticipants.length;

  return avgKillParticipation.toFixed(2);
}

/**
 * Calculate vision score share percentage
 */
function calculateVisionScoreShare(matchParticipants) {
  if (!matchParticipants || matchParticipants.length === 0) return 0;

  const avgVisionScoreShare = matchParticipants.reduce((sum, p) => {
    return sum + (p.visionScoreShare || 0);
  }, 0) / matchParticipants.length;

  return avgVisionScoreShare.toFixed(2);
}

/**
 * Calculate damage share percentage
 */
function calculateDamageShare(matchParticipants) {
  if (!matchParticipants || matchParticipants.length === 0) return 0;

  const avgDamageShare = matchParticipants.reduce((sum, p) => {
    return sum + (p.damageShare || 0);
  }, 0) / matchParticipants.length;

  return avgDamageShare.toFixed(2);
}

/**
 * Helper function to evaluate comparison operators
 */
function evaluateComparison(playerValue, benchmarkValue, comparator) {
  if (playerValue === undefined || playerValue === null) {
    return false;
  }

  const pVal = parseFloat(playerValue);
  const bVal = parseFloat(benchmarkValue);

  switch (comparator) {
    case '>=':
      return pVal >= bVal;
    case '<=':
      return pVal <= bVal;
    case '>':
      return pVal > bVal;
    case '<':
      return pVal < bVal;
    case '==':
      return pVal === bVal;
    case '!=':
      return pVal !== bVal;
    default:
      return false;
  }
}

/**
 * Helper: Smart-save calculated stats to the DB
 */
async function saveCalculatedStats(userId, roleId, stats) {
  try {
    // 1. Fetch the list of valid metrics from your DB so we know what IDs to use
    const [dbMetrics] = await db.query("SELECT metricId, metricName FROM metrics");
    
    // 2. Create a lookup map (e.g., "averagekills" -> 14)
    const metricLookup = {};
    dbMetrics.forEach(m => {
      if (m.metricName) {
        // Normalize: "averageKills" becomes "averagekills" for easier matching
        const key = m.metricName.toLowerCase().replace(/\s+/g, '');
        metricLookup[key] = m.metricId;
      }
    });

    // 3. Manual overrides for names that don't match perfectly
    // (Your JS calculates "Total Wards Placed", but DB expects "averageWardsPlaced")
    const manualOverrides = {
      'Total Wards Placed': 'averagewardsplaced',
      'Total Wards Destroyed': 'averagewardsdestroyed',
      'Damage to Buildings': 'averagedamagetobuildings'
    };

    const queries = [];
    const timestamp = new Date();

    // 4. Loop through the calculated averages
    for (const [key, value] of Object.entries(stats)) {
      let lookupKey;

      if (manualOverrides[key]) {
        lookupKey = manualOverrides[key];
      } else {
        // Standard Rule: Add "average" to the front (e.g. "Kills" -> "averagekills")
        lookupKey = "average" + key.toLowerCase().replace(/\s+/g, '');
      }

      const metricId = metricLookup[lookupKey];
      const numericValue = parseFloat(value);

      // 5. If this stat exists in your "metrics" table, save it!
      if (metricId && Number.isFinite(numericValue)) {
        queries.push(
          db.query(
            `INSERT INTO playerStatistics (userId, metricId, roleId, metricValue, recordedAt)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             metricValue = VALUES(metricValue), recordedAt = VALUES(recordedAt)`,
             [userId, metricId, roleId, Math.round(numericValue), timestamp]
          )
        );
      }
    }

    // 6. Execute all inserts
    if (queries.length > 0) {
      await Promise.all(queries);
      console.log(`[PLAYER STATS] Successfully saved ${queries.length} average stats for User ${userId}`);
    }

  } catch (err) {
    console.error("[PLAYER STATS] Error saving stats:", err);
  }
}

/**
 * Compare stored player statistics against benchmarks
 * Directly queries playerStatistics & benchmarks tables
 */
exports.getStoredStatsComparison = async (req, res) => {
  try {
    const { userId, roleId } = req.query; // Or req.params, depending on your route

    if (!userId || !roleId) {
      return res.status(400).json({ error: 'userId and roleId are required' });
    }

    // 1. The Magic Query: Joins PlayerStats + Benchmarks + Metrics
    const sql = `
      SELECT 
        m.metricName, 
        m.metricDescription,
        ps.metricValue AS playerValue, 
        b.benchmarkValue, 
        b.comparator,
        ps.recordedAt
      FROM playerStatistics ps
      JOIN benchmarks b ON ps.metricId = b.metricId AND ps.roleId = b.roleId
      JOIN metrics m ON ps.metricId = m.metricId
      WHERE ps.userId = ? AND ps.roleId = ?
    `;

    const [rows] = await db.query(sql, [userId, roleId]);

    if (rows.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No stored stats found. Please visit the analysis page to calculate and save stats first.',
        comparison: [] 
      });
    }

    // 2. Process the results using your existing helper
    const comparison = rows.map(row => {
      const meetsStandard = evaluateComparison(row.playerValue, row.benchmarkValue, row.comparator);
      
      return {
        metricName: row.metricName,
        playerValue: parseFloat(row.playerValue).toFixed(2),
        benchmarkValue: parseFloat(row.benchmarkValue),
        comparator: row.comparator,
        meetsStandard: meetsStandard,
        status: meetsStandard ? '✓' : '✗',
        lastUpdated: row.recordedAt
      };
    });

    // 3. Calculate Score
    const metGuidelines = comparison.filter(c => c.meetsStandard).length;
    const score = (metGuidelines / comparison.length * 100).toFixed(1);

    res.json({
      success: true,
      userId,
      roleId,
      performanceScore: `${score}%`,
      comparison
    });

  } catch (err) {
    console.error('[COMPARISON] Error fetching stored comparison:', err.message);
    res.status(500).json({ error: err.message });
  }
};