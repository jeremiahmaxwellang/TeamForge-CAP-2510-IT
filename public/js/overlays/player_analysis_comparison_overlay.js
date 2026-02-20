// player_analysis_comparison_overlay.js
// ONLY: DOM wiring + charts + calling backend module.
// Requires PlayerComparisonBackend loaded first.

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

  console.log("[COMPARISON] Tab logic initialized.");

  function populateSelects() {
    const select1 = document.getElementById("player1-select");
    const select2 = document.getElementById("player2-select");

    if (!select1 || !select2) {
      console.error("[COMPARISON] Required select elements not found in DOM.");
      return;
    }

    const playerOptions = players
      .map((p) => {
        const id = p.id ?? p.userId;
        const name = p.summonerName || `Player ${id}`;
        return `<option value="${id}">${name}</option>`;
      })
      .join("");

    select1.innerHTML = '<option value="">Select a player...</option>' + playerOptions;
    select2.innerHTML =
      '<option value="">Select a player...</option>' +
      playerOptions +
      '<option value="coach-benchmark">Coach Benchmark</option>';

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