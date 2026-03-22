// player_analysis_comparison_backend.js
// ONLY: API calls + response formatting. NO DOM access.

(function () {
  const Backend = {};

  Backend.initializeBenchmarks = function () {
    return fetch("/player_analysis/benchmarks/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

  Backend.fetchPlayersList = function () {
    return fetch("/player_analysis/players").then((res) => res.json());
  };

  Backend.fetchPlayer = function (playerId) {
    return fetch(`/player_analysis/players/${playerId}`).then((res) => res.json());
  };

  Backend.fetchRoleBenchmarks = function (roleId) {
    return fetch(`/player_analysis/benchmarks/role/${roleId}`).then((res) => res.json());
  };

  Backend.formatBenchmarksAsStats = function (benchmarks) {
    const formattedStats = {
      benchmarkComparison: benchmarks,
      rawStats: {} // Stores all role-specific stats perfectly mapped
    };

    // Complete mapping from Database names to Frontend Chart names
    const dbToStatName = {
      "averagekills": "Kills",
      "averagedeaths": "Deaths",
      "averageassists": "Assists",
      "averagekda": "KDA",
      "averagecsperminute": "CS Per Minute",
      "averagegoldperminute": "Gold Per Minute",
      "averagevisionscoreperminute": "Vision Score Per Minute",
      "averagekillparticipation": "Kill Participation",
      "averagedamageshare": "Damage Share",
      "averagetotaldamagetaken": "Total Damage Taken",
      "averagetotaldamagedealt": "Total Damage Dealt",
      "averagesolokills": "Solo Kills",
      "averagewardsplaced": "Total Wards Placed",
      "averagewardsdestroyed": "Total Wards Destroyed",
      "averagedragonkills": "Dragon Kills",
      "averagedamagetobuildings": "Damage to Buildings"
    };

    benchmarks.forEach((benchmark) => {
      const metricName = String(benchmark.metricName || "").toLowerCase();
      const readableName = dbToStatName[metricName] || benchmark.metricName;
      formattedStats.rawStats[readableName] = benchmark.benchmarkValue;
    });

    // Map back to the top-level properties expected by the Player Cards
    formattedStats.avgKills = formattedStats.rawStats["Kills"] || 0;
    formattedStats.avgDeaths = formattedStats.rawStats["Deaths"] || 0;
    formattedStats.avgAssists = formattedStats.rawStats["Assists"] || 0;
    formattedStats.kdaRatio = formattedStats.rawStats["KDA"] || 0;
    formattedStats.avgDamage = formattedStats.rawStats["Total Damage Dealt"] || 0;
    formattedStats.totalDamage = formattedStats.rawStats["Total Damage Dealt"] || 0;
    formattedStats.totalDamageMitigated = formattedStats.rawStats["Total Damage Taken"] || 0;
    formattedStats.avgGold = formattedStats.rawStats["Gold Per Minute"] || 0;

    // Calculate KDA if it wasn't explicitly provided as a benchmark
    if (!formattedStats.kdaRatio && formattedStats.avgDeaths) {
        formattedStats.kdaRatio = (
            (Number(formattedStats.avgKills) + Number(formattedStats.avgAssists)) /
            (Number(formattedStats.avgDeaths) || 1)
        ).toFixed(2);
    }

    return formattedStats;
  };

  Backend.calculateAndFetchStats = function (playerId, roleId) {
    return fetch("/player_analysis/stats/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, roleId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !data.success) return null;

        const stats = data.playerStats || {};
        const formattedStats = {
          avgKills: stats["Kills"] || 0,
          avgDeaths: stats["Deaths"] || 0,
          avgAssists: stats["Assists"] || 0,
          kdaRatio: stats["KDA"] || 0,
          avgDamage: stats["Total Damage Dealt"] || 0,
          totalDamage: stats["Total Damage Dealt"] || 0,
          totalDamageMitigated: stats["Total Damage Taken"] || 0,
          avgGold: stats["Gold Per Minute"] || 0,
          winrate: stats["winrate"] || 0, 
          benchmarkComparison: data.benchmarkComparison,
          summary: data.summary,
          rawStats: stats 
        };

        return formattedStats;
      });
  };

  window.PlayerComparisonBackend = Backend;
})();