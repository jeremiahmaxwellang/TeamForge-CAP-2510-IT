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
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      kdaRatio: 0,
      avgDamage: 0,
      totalDamage: 0,
      totalDamageMitigated: 0,
      avgGold: 0,
      winrate: 0,
      benchmarkComparison: benchmarks,
    };

    benchmarks.forEach((benchmark) => {
      const metricName = String(benchmark.metricName || "").toLowerCase();

      if (metricName.includes("kill") && metricName.includes("participation")) {
        formattedStats.avgKills = benchmark.benchmarkValue;
      } else if (metricName.includes("death")) {
        formattedStats.avgDeaths = benchmark.benchmarkValue;
      } else if (metricName.includes("assist")) {
        formattedStats.avgAssists = benchmark.benchmarkValue;
      } else if (metricName.includes("damage") && metricName.includes("share")) {
        // same heuristic from your file
        formattedStats.totalDamage = benchmark.benchmarkValue * 400;
      } else if (metricName.includes("gold") && metricName.includes("minute")) {
        formattedStats.avgGold = benchmark.benchmarkValue;
      } else if (metricName.includes("vision")) {
        formattedStats.visionScore = benchmark.benchmarkValue;
      }
    });

    formattedStats.kdaRatio = (
      (Number(formattedStats.avgKills) + Number(formattedStats.avgAssists)) /
      (Number(formattedStats.avgDeaths) || 1)
    ).toFixed(2);

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
          winrate: 0, // unchanged from your code
          benchmarkComparison: data.benchmarkComparison,
          summary: data.summary,
        };

        return formattedStats;
      });
  };

  window.PlayerComparisonBackend = Backend;
})();