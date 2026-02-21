// player_analysis_comparison_overlay.js
// ONLY: DOM wiring + charts + calling backend module.
// Requires PlayerComparisonBackend loaded first.

// player_analysis_comparison_overlay.js

window.initComparisonTab = function () {
  const Backend = window.PlayerComparisonBackend;
  if (!Backend) {
    console.error("[COMPARISON] Backend module not loaded.");
    return;
  }

  let players = [];
  let selectedPlayer1 = null;
  let selectedPlayer2 = null;
  let player1Data = null;
  let player2Data = null;

  function populateSelects() {
    const select1 = document.getElementById("player1-select");
    const select2 = document.getElementById("player2-select");
    
    // Get the ID of the player currently selected in the Main Analysis Page
    // We assume the dropdown button or a global variable holds the current userId
    const mainPagePlayerId = window.currentPlayerId; 

    if (!select1 || !select2) return;

    const playerOptions = players
      .map((p) => {
        const id = p.userId || p.id;
        const name = p.summonerName || `Player ${id}`;
        return `<option value="${id}">${name}</option>`;
      })
      .join("");

    select1.innerHTML = '<option value="">Select a player...</option>' + playerOptions;
    select2.innerHTML =
      '<option value="">Select a player...</option>' +
      playerOptions +
      '<option value="coach-benchmark">Coach Benchmark</option>';

    // --- LOGIC FOR PLAYER 1 AUTO-SELECTION ---
    if (mainPagePlayerId) {
      select1.value = mainPagePlayerId;
      selectedPlayer1 = parseInt(mainPagePlayerId, 10);
      loadPlayerData(selectedPlayer1, 1);
    }

    select1.addEventListener("change", (e) => {
      selectedPlayer1 = parseInt(e.target.value, 10);
      if (selectedPlayer1) loadPlayerData(selectedPlayer1, 1);
    });

    select2.addEventListener("change", (e) => {
      selectedPlayer2 = e.target.value;
      if (selectedPlayer2 === "coach-benchmark") {
        loadCoachBenchmark();
      } else if (selectedPlayer2) {
        selectedPlayer2 = parseInt(selectedPlayer2, 10);
        loadPlayerData(selectedPlayer2, 2);
      }
    });
  }

  function updatePlayerCard(player, playerNumber) {
    const prefix = playerNumber === 1 ? "player1" : "player2";
    const nameEl = document.getElementById(`name-${prefix}`);
    const rankEl = document.getElementById(`rank-${prefix}`);

    if (nameEl) nameEl.textContent = player.summonerName || `Player ${player.userId ?? player.id}`;
    if (rankEl) rankEl.textContent = player.tier ? `${player.tier} ${player.rank}` : "Unranked";

    const pfpEl = document.getElementById(`pfp-${prefix}`);
    if (pfpEl && player.profilePhoto) {
      pfpEl.src = player.profilePhoto;
    }
  }

  function loadPlayerData(playerId, playerNumber) {
    Backend.fetchPlayer(playerId)
      .then((player) => {
        if (playerNumber === 1) {
          player1Data = player;
          updatePlayerCard(player, 1);
        } else {
          player2Data = player;
          updatePlayerCard(player, 2);
        }

        if (player.userId && player.primaryRoleId) {
          return Backend.calculateAndFetchStats(player.userId, player.primaryRoleId).then((stats) => {
            if (!stats) return;

            if (playerNumber === 1) player1Data.stats = stats;
            else player2Data.stats = stats;

            if (player1Data?.stats && player2Data?.stats) updateComparison();
          });
        }
      })
      .catch((err) => console.error(`[COMPARISON] Error loading player ${playerId}:`, err));
  }

  function loadCoachBenchmark() {
    if (!player1Data || !player1Data.primaryRoleId) {
      console.error("[COMPARISON] Player 1 must be selected first to load coach benchmark.");
      return;
    }

    const roleId = player1Data.primaryRoleId;
    console.log("[COMPARISON] Loading coach benchmark for role:", roleId);

    Backend.fetchRoleBenchmarks(roleId)
      .then((benchmarks) => {
        const coachBenchmarkData = {
          id: "coach-benchmark",
          summonerName: "Coach Benchmark",
          tier: "Benchmark",
          rank: "Standard",
          userId: null,
          primaryRoleId: roleId,
          stats: Backend.formatBenchmarksAsStats(benchmarks),
        };

        player2Data = coachBenchmarkData;
        updatePlayerCard(coachBenchmarkData, 2);

        if (player1Data?.stats) updateComparison();
      })
      .catch((err) => console.error("[COMPARISON] Error loading coach benchmark:", err));
  }

  function calculateSkillRatings(playerData) {
    const stats = playerData.stats || {};
    const kda = Number(stats.kdaRatio) || 0;
    const avgDamage = Number(stats.avgDamage) || 0;
    const mitigated = Number(stats.totalDamageMitigated) || 0;
    const avgGold = Number(stats.avgGold) || 0;
    const winrate = Number(stats.winrate) || 0;

    return {
      kdaScore: Math.min(kda * 1.5, 10),
      damageScore: Math.min((avgDamage / 400) * 10, 10),
      tankScore: Math.min((mitigated / 100000) * 10, 10),
      goldScore: Math.min((avgGold / 350) * 10, 10),
      consistencyScore: winrate / 10,
    };
  }

  function updateRadarChart() {
    const chartContainer = document.getElementById("chart-container");
    if (!chartContainer || !player1Data?.stats || !player2Data?.stats) return;

    const p1Skills = calculateSkillRatings(player1Data);
    const p2Skills = calculateSkillRatings(player2Data);

    const chartData = [
      {
        className: "Player1",
        axes: [
          { axis: "KDA", value: p1Skills.kdaScore },
          { axis: "Damage", value: p1Skills.damageScore },
          { axis: "Tanking", value: p1Skills.tankScore },
          { axis: "Gold Efficiency", value: p1Skills.goldScore },
          { axis: "Consistency", value: p1Skills.consistencyScore },
        ],
      },
      {
        className: "Player2",
        axes: [
          { axis: "KDA", value: p2Skills.kdaScore },
          { axis: "Damage", value: p2Skills.damageScore },
          { axis: "Tanking", value: p2Skills.tankScore },
          { axis: "Gold Efficiency", value: p2Skills.goldScore },
          { axis: "Consistency", value: p2Skills.consistencyScore },
        ],
      },
    ];

    chartContainer.innerHTML = "";
    RadarChart.defaultConfig.w = 400;
    RadarChart.defaultConfig.h = 400;
    RadarChart.defaultConfig.maxValue = 10;
    RadarChart.draw("#chart-container", chartData);
  }

  function updateStatsTable() {
    const statsContainer = document.getElementById("stats-list");
    if (!statsContainer || !player1Data?.stats || !player2Data?.stats) return;

    // keys defined in backend formatter
    const metrics = [
      { key: "avgKills", label: "Average Kills" },
      { key: "avgDeaths", label: "Average Deaths" },
      { key: "avgAssists", label: "Average Assists" },
      { key: "kdaRatio", label: "KDA Ratio" },
      { key: "avgDamage", label: "Avg Damage Dealt" },
      { key: "totalDamageMitigated", label: "Damage Taken" },
      { key: "avgGold", label: "Gold Per Minute" }
    ];

    let html = `
      <table class="comparison-table" style="width: 100%; text-align: center; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #ddd;">
            <th style="padding: 10px;">${player1Data.summonerName || 'Player 1'}</th>
            <th style="padding: 10px;">Metric</th>
            <th style="padding: 10px;">${player2Data.summonerName || 'Player 2'}</th>
          </tr>
        </thead>
        <tbody>
    `;

    metrics.forEach(m => {
      // Grab the numbers, default to 0 if missing
      const val1 = Number(player1Data.stats[m.key]) || 0;
      const val2 = Number(player2Data.stats[m.key]) || 0;

      // Highlight the bigger number in green
      let p1Style = "padding: 8px;";
      let p2Style = "padding: 8px;";
      
      if (val1 > val2) p1Style += " color: #4CAF50; font-weight: bold;";
      else if (val2 > val1) p2Style += " color: #4CAF50; font-weight: bold;";

      html += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="${p1Style}">${val1.toFixed(2)}</td>
          <td style="padding: 8px; font-weight: bold; background-color: #f9f9f9;">${m.label}</td>
          <td style="${p2Style}">${val2.toFixed(2)}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    statsContainer.innerHTML = html;
  }

  function updateComparison() {
    updateRadarChart();
    if (typeof updateStatsTable === "function") updateStatsTable();
  }

  // Entry point (same flow as your original file: initialize then load players)
  Backend.initializeBenchmarks()
    .then(() => Backend.fetchPlayersList())
    .catch(() => Backend.fetchPlayersList())
    .then((data) => {
      players = data || [];
      populateSelects();
    })
    .catch((err) => console.error("[COMPARISON] Error loading players:", err));
};