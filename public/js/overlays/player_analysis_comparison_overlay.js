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
    const select2 = document.getElementById("player2-select");
    const player1Display = document.getElementById("player1-display");
    
    // Get the ID of the player currently selected in the Main Analysis Page
    // Try multiple sources: window.currentPlayerId, PA.cache.currentPlayerId, or from the dropdown button
    let mainPagePlayerId = window.currentPlayerId;
    if (!mainPagePlayerId && window.PlayerAnalysis && window.PlayerAnalysis.cache) {
      mainPagePlayerId = window.PlayerAnalysis.cache.currentPlayerId;
    }
    if (!mainPagePlayerId) {
      const btn = document.getElementById("player-dropdown-btn");
      mainPagePlayerId = btn ? btn.getAttribute("data-player-id") : null;
    }

    console.log("[COMPARISON] mainPagePlayerId:", mainPagePlayerId);

    if (!select2) return;

    // Populate Player 2 dropdown with all players
    const playerOptions = players
      .map((p) => {
        const id = p.userId || p.id;
        const name = p.gameName ? `${p.gameName}#${p.tagLine}` : (p.summonerName || `Player ${id}`);
        return `<option value="${id}">${name}</option>`;
      })
      .join("");

    select2.innerHTML =
      '<option value="">Select a player...</option>' +
      playerOptions +
      '<option value="coach-benchmark">Coach Benchmark</option>';

    // --- LOGIC FOR PLAYER 1: Display selected player from main page ---
    if (mainPagePlayerId) {
      selectedPlayer1 = parseInt(mainPagePlayerId, 10);
      const player1 = players.find(p => (p.userId || p.id) === selectedPlayer1);
      if (player1 && player1Display) {
        const player1Name = player1.gameName ? `${player1.gameName}#${player1.tagLine}` : (player1.summonerName || `Player ${selectedPlayer1}`);
        player1Display.textContent = player1Name;
        console.log("[COMPARISON] Player 1 loaded:", player1Name);
      }
      loadPlayerData(selectedPlayer1, 1);
    } else if (player1Display) {
      player1Display.textContent = 'No player selected';
      console.log("[COMPARISON] No player ID found from any source");
    }

    // Player 2 selection handler
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

  function checkAndUpdatePlayer1() {
    // Get the current player ID from the main page dropdown button
    const btn = document.getElementById("player-dropdown-btn");
    let currentPlayerId = null;

    if (btn) {
      currentPlayerId = btn.getAttribute("data-player-id");
    }

    // Check if it's different from the currently selected player 1
    if (currentPlayerId && parseInt(currentPlayerId, 10) !== selectedPlayer1) {
      console.log("[COMPARISON] Player selection changed, updating Player 1 to:", currentPlayerId);
      selectedPlayer1 = parseInt(currentPlayerId, 10);
      
      // Find and display the player
      const player1 = players.find(p => (p.userId || p.id) === selectedPlayer1);
      const player1Display = document.getElementById("player1-display");
      
      if (player1 && player1Display) {
        const player1Name = player1.gameName || `Player ${selectedPlayer1}`;
        player1Display.textContent = player1Name;
      }
      
      // Load the new player's data
      loadPlayerData(selectedPlayer1, 1);
    }
  }

  function setupPlayerChangeListener() {
    const btn = document.getElementById("player-dropdown-btn");
    if (!btn) {
      console.log("[COMPARISON] Player dropdown button not found");
      return;
    }

    // Use MutationObserver to watch for changes to data-player-id attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-player-id") {
          console.log("[COMPARISON] Detected player ID change");
          checkAndUpdatePlayer1();
        }
      });
    });

    // Start observing the button for attribute changes
    observer.observe(btn, { attributes: true, attributeFilter: ["data-player-id"] });
    console.log("[COMPARISON] Player change listener setup complete");
  }

  // Entry point (same flow as your original file: initialize then load players)
  Backend.initializeBenchmarks()
    .then(() => Backend.fetchPlayersList())
    .catch(() => Backend.fetchPlayersList())
    .then((data) => {
      players = data || [];
      populateSelects();
      // Set up listener for player changes on main page
      setupPlayerChangeListener();
    })
    .catch((err) => console.error("[COMPARISON] Error loading players:", err));
};