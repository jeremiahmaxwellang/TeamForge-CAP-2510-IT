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

  // Connects to Riot API, fetches matches, and builds a mock stats object
  Backend.fetchExternalPlayerStats = async function(gameName, tagLine) {
    // 1. Get PUUID
    const puuidRes = await fetch(`/riot/puuid/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
    if (!puuidRes.ok) throw new Error("Player not found.");
    const { puuid } = await puuidRes.json();

    // 2. Get Matches (Queue 420 for Solo/Duo Ranked)
    const matchRes = await fetch(`/riot/matches/${puuid}/420`);
    if (!matchRes.ok) throw new Error("Failed to fetch matches.");
    const matchData = await matchRes.json();
    const matchIds = matchData.matches || [];

    if (matchIds.length === 0) throw new Error("No recent ranked matches found.");

    // 3. Fetch Match Details (Limit to 10 to keep the fetch fast)
    const matchesToFetch = matchIds.slice(0, 10);
    const detailPromises = matchesToFetch.map(id => 
        fetch(`/riot/match/${id}`).then(r => r.json()).then(d => d.matchDetails)
    );
    const matches = await Promise.all(detailPromises);

    // 4. Calculate Stats on the fly
    return Backend.calculateExternalStats(matches, puuid);
  };

  // Crunches raw match data into averages
  Backend.calculateExternalStats = function(matches, puuid) {
    let validMatches = 0;
    let wins = 0;
    const sums = {
        "Kills": 0, "Deaths": 0, "Assists": 0, "Total Damage Taken": 0, 
        "Total Damage Dealt": 0, "Gold Per Minute": 0, "CS Per Minute": 0,
        "Damage Share": 0, "Kill Participation": 0, "Vision Score Per Minute": 0, 
        "Total Wards Placed": 0, "Total Wards Destroyed": 0, "Solo Kills": 0, "Dragon Kills": 0
    };

    matches.forEach(m => {
        if (!m || !m.info || !m.info.participants) return;
        const p = m.info.participants.find(x => x.puuid === puuid);
        if (!p) return;

        validMatches++;
        if (p.win) wins++;

        const durationMins = m.info.gameDuration / 60;
        sums["Kills"] += p.kills || 0;
        sums["Deaths"] += p.deaths || 0;
        sums["Assists"] += p.assists || 0;
        sums["Total Damage Taken"] += p.totalDamageTaken || 0;
        sums["Total Damage Dealt"] += p.totalDamageDealtToChampions || 0;
        sums["Total Wards Placed"] += p.wardsPlaced || 0;
        sums["Total Wards Destroyed"] += p.wardsKilled || 0;
        sums["Dragon Kills"] += p.dragonKills || 0;
        sums["Gold Per Minute"] += (p.goldEarned || 0) / durationMins;
        sums["CS Per Minute"] += ((p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0)) / durationMins;
        
        if (p.challenges) {
            sums["Damage Share"] += (p.challenges.teamDamagePercentage || 0) * 100;
            sums["Kill Participation"] += (p.challenges.killParticipation || 0) * 100;
            sums["Vision Score Per Minute"] += p.challenges.visionScorePerMinute || 0;
            sums["Solo Kills"] += p.challenges.soloKills || 0;
        } else {
            sums["Vision Score Per Minute"] += (p.visionScore || 0) / durationMins;
        }
    });

    if (validMatches === 0) throw new Error("No valid match data.");

    const rawStats = {};
    for (let key in sums) {
        rawStats[key] = (sums[key] / validMatches).toFixed(2);
    }
    rawStats["KDA"] = ((parseFloat(rawStats["Kills"]) + parseFloat(rawStats["Assists"])) / Math.max(1, parseFloat(rawStats["Deaths"]))).toFixed(2);
    
    return {
        winrate: ((wins / validMatches) * 100).toFixed(1),
        rawStats
    };
  };

  window.PlayerComparisonBackend = Backend;

  // --- CANDIDATE FAVORITE API HELPERS ---
  Backend.checkCoachRole = function () {
    return fetch('/api/current-role')
      .then(res => res.json())
      .then(data => data.role === 'Team Coach')
      .catch(() => false);
  };

  Backend.fetchFavoriteStatus = function (roleId) {
    return fetch(`/player_analysis/candidate-favorites/${roleId}`)
      .then(res => res.ok ? res.json() : null);
  };

  Backend.toggleFavorite = function (candidateUserId, roleId) {
    return fetch("/player_analysis/candidate-favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateUserId: Number(candidateUserId), roleId: Number(roleId) })
    }).then(res => res.json());
  };

  Backend.saveMemo = function (candidateUserId, roleId, memo) {
    return fetch("/player_analysis/candidate-favorites/memo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateUserId: Number(candidateUserId), roleId: Number(roleId), memo: memo })
    });
  };
})();