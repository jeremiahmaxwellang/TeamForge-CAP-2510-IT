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
async function insertDefaultBenchmarks() {
  const benchmarks = [
    // Top Lane (9 metrics)
    { benchmarkId: 1, roleId: 1, metricName: "CS Per Minute", benchmarkValue: 7.8, comparator: ">=" },
    { benchmarkId: 2, roleId: 1, metricName: "Gold Per Minute", benchmarkValue: 388.4, comparator: ">=" },
    { benchmarkId: 3, roleId: 1, metricName: "CS Diff @15", benchmarkValue: -0.3, comparator: ">=" },
    { benchmarkId: 4, roleId: 1, metricName: "XP Diff @15", benchmarkValue: -31.4, comparator: ">=" },
    { benchmarkId: 5, roleId: 1, metricName: "Deaths", benchmarkValue: 3.2, comparator: "<=" },
    { benchmarkId: 6, roleId: 1, metricName: "Solo Kills", benchmarkValue: 1.7, comparator: ">=" },
    { benchmarkId: 7, roleId: 1, metricName: "Kill Participation", benchmarkValue: 44.4, comparator: ">=" },
    { benchmarkId: 8, roleId: 1, metricName: "Damage to Buildings", benchmarkValue: 21.4, comparator: ">=" },
    { benchmarkId: 9, roleId: 1, metricName: "Total Damage Taken", benchmarkValue: 24.5, comparator: ">=" },

    // Jungle (8 metrics)
    { benchmarkId: 10, roleId: 2, metricName: "CS Per Minute", benchmarkValue: 6.8, comparator: ">=" },
    { benchmarkId: 11, roleId: 2, metricName: "Kill Participation", benchmarkValue: 67, comparator: ">=" },
    { benchmarkId: 12, roleId: 2, metricName: "Vision Score Per Minute", benchmarkValue: 1.6, comparator: ">=" },
    { benchmarkId: 13, roleId: 2, metricName: "CS Diff @15", benchmarkValue: 0, comparator: ">" },
    { benchmarkId: 14, roleId: 2, metricName: "Dragon Kills", benchmarkValue: 2, comparator: ">=" },
    { benchmarkId: 15, roleId: 2, metricName: "Team Baron Kills", benchmarkValue: 1, comparator: ">=" },
    { benchmarkId: 16, roleId: 2, metricName: "Team Elder Dragon Kills", benchmarkValue: 1, comparator: ">=" },
    { benchmarkId: 17, roleId: 2, metricName: "Enemy Jungle Control", benchmarkValue: 4, comparator: ">=" },

    // Mid Lane (7 metrics)
    { benchmarkId: 18, roleId: 3, metricName: "CS Per Minute", benchmarkValue: 8.6, comparator: ">=" },
    { benchmarkId: 19, roleId: 3, metricName: "Gold Per Minute", benchmarkValue: 400, comparator: ">=" },
    { benchmarkId: 20, roleId: 3, metricName: "Kill Participation", benchmarkValue: 62, comparator: ">=" },
    { benchmarkId: 21, roleId: 3, metricName: "Kills", benchmarkValue: 4, comparator: ">=" },
    { benchmarkId: 22, roleId: 3, metricName: "Deaths", benchmarkValue: 3.2, comparator: "<=" },
    { benchmarkId: 23, roleId: 3, metricName: "Assists", benchmarkValue: 6.6, comparator: ">=" },
    { benchmarkId: 24, roleId: 3, metricName: "Damage Share", benchmarkValue: 24.7, comparator: ">=" },

    // ADC (8 metrics)
    { benchmarkId: 25, roleId: 4, metricName: "KDA", benchmarkValue: 4.1, comparator: ">=" },
    { benchmarkId: 26, roleId: 4, metricName: "Vision Score Per Minute", benchmarkValue: 1.0, comparator: ">=" },
    { benchmarkId: 27, roleId: 4, metricName: "CS Per Minute", benchmarkValue: 8.9, comparator: ">=" },
    { benchmarkId: 28, roleId: 4, metricName: "CS Diff @15", benchmarkValue: -0.25, comparator: ">=" },
    { benchmarkId: 29, roleId: 4, metricName: "XP Diff @15", benchmarkValue: -6.75, comparator: ">=" },
    { benchmarkId: 30, roleId: 4, metricName: "Gold Diff @15", benchmarkValue: 7.75, comparator: ">=" },
    { benchmarkId: 31, roleId: 4, metricName: "Gold Per Minute", benchmarkValue: 460, comparator: ">=" },
    { benchmarkId: 32, roleId: 4, metricName: "Damage Share", benchmarkValue: 25, comparator: ">=" },

    // Support (8 metrics)
    { benchmarkId: 33, roleId: 5, metricName: "Vision Score Share", benchmarkValue: 43.47, comparator: ">=" },
    { benchmarkId: 34, roleId: 5, metricName: "Vision Score Per Minute", benchmarkValue: 3.6, comparator: ">=" },
    { benchmarkId: 35, roleId: 5, metricName: "Deaths", benchmarkValue: 4, comparator: "<=" },
    { benchmarkId: 36, roleId: 5, metricName: "Assists", benchmarkValue: 12.6, comparator: ">=" },
    { benchmarkId: 37, roleId: 5, metricName: "Kill Participation", benchmarkValue: 76, comparator: ">=" },
    { benchmarkId: 38, roleId: 5, metricName: "Total Wards Placed", benchmarkValue: 5, comparator: ">=" },
    { benchmarkId: 39, roleId: 5, metricName: "Total Wards Destroyed", benchmarkValue: 5, comparator: ">=" },
    { benchmarkId: 40, roleId: 5, metricName: "Proximity to ADC @15", benchmarkValue: 55, comparator: ">=" }
  ];

  let insertedCount = 0;

  console.log('[BENCHMARKS] insertDefaultBenchmarks: Starting to insert', benchmarks.length, 'benchmarks');

  for (const benchmark of benchmarks) {
    try {
      const sql = `
        INSERT INTO benchmarks (benchmarkId, roleId, metricName, benchmarkValue, comparator)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          benchmarkValue = VALUES(benchmarkValue),
          comparator = VALUES(comparator)
      `;
      
      await db.query(sql, [
        benchmark.benchmarkId,
        benchmark.roleId,
        benchmark.metricName,
        benchmark.benchmarkValue,
        benchmark.comparator
      ]);
      
      insertedCount++;
      console.log(`[BENCHMARKS] Inserted benchmark ${benchmark.benchmarkId}: ${benchmark.metricName}`);
    } catch (err) {
      console.error(`[BENCHMARKS] Error inserting benchmark ${benchmark.benchmarkId}:`, err);
      throw err;
    }
  }

  console.log('[BENCHMARKS] insertDefaultBenchmarks: Successfully inserted', insertedCount, 'benchmarks');
  return insertedCount;
}

/**
 * Main seed function - checks if empty and inserts defaults
 */
async function seedBenchmarks() {
  try {
    console.log("[BENCHMARKS] Starting seed process...");
    
    const isEmpty = await isBenchmarksTableEmpty();
    console.log("[BENCHMARKS] Table is empty:", isEmpty);
    
    if (isEmpty) {
      console.log("[BENCHMARKS] Table is empty, inserting default benchmarks...");
      const insertedCount = await insertDefaultBenchmarks();
      console.log(`[BENCHMARKS] Successfully inserted ${insertedCount} benchmarks`);
      
      return {
        success: true,
        message: `Successfully seeded ${insertedCount} benchmark metrics`,
        insertedCount,
        wasPreviouslyEmpty: true
      };
    } else {
      const [result] = await db.query("SELECT COUNT(*) as count FROM benchmarks");
      console.log(`[BENCHMARKS] Table already populated with ${result[0].count} benchmarks`);
      
      return {
        success: true,
        message: "Benchmarks table already populated",
        insertedCount: 0,
        wasPreviouslyEmpty: false,
        existingCount: result[0].count
      };
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
      `SELECT benchmarkId, roleId, metricName, benchmarkValue, comparator
       FROM benchmarks 
       WHERE roleId = ? 
       ORDER BY benchmarkId ASC`,
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
      `SELECT b.benchmarkId, b.roleId, lr.displayedRole, b.metricName, b.benchmarkValue, b.comparator
       FROM benchmarks b
       LEFT JOIN leagueRoles lr ON b.roleId = lr.roleId
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
      `SELECT benchmarkId, metricName, benchmarkValue, comparator
       FROM benchmarks 
       WHERE roleId = ?
       ORDER BY benchmarkId ASC`,
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

    // Fetch all match participants for this player
    const [matchParticipants] = await db.query(
      `SELECT mp.* FROM matchParticipants mp
       JOIN matches m ON mp.matchId = m.matchId
       WHERE m.userId = ?
       ORDER BY m.gameCreation DESC`,
      [playerId]
    );

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
      `SELECT benchmarkId, metricName, benchmarkValue, comparator
       FROM benchmarks 
       WHERE roleId = ?
       ORDER BY benchmarkId ASC`,
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
    'Total Damage Dealt': totals.totalDamageDealt,
    'Total Damage Taken': totals.totalDamageTaken,
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