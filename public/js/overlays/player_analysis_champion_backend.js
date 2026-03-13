// player_analysis_champion_backend.js 
// ONLY: API calls + response formatting. NO DOM access.

(function () {
    const champBackend = {};

    champBackend.fetchChampionPool = function (playerId) {
        return fetch(`/player_analysis/players/${playerId}/champion_pool`)
            .then((res) => {
                if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                return res.json();
            });
    };

    champBackend.formatChampionStats = function (championPool) {
    // Normalize or calculate extra fields before sending to frontend
    return championPool.map((champ) => ({
      championName: champ.championName,
      role: champ.champ_role,
      games: champ.games,
      winrate: champ.winrate || "N/A",
      avgKills: champ.avg_kills,
      avgDeaths: champ.avg_deaths,
      avgAssists: champ.avg_assists,
      avgCsm: champ.avg_csm,
      avgGpm: champ.avg_gpm || "N/A",
      avgDamageShare: champ.avg_damageshare,
      avgKp: champ.avg_kp,
    }));
  };

    window.ChampionPoolBackend = champBackend;
})();
