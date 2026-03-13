// player_analysis_summary_backend.js
// ONLY: API calls + response formatting. NO DOM access.

(function () {
  const Backend = {};

  Backend.fetchOverviewSummary = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/overview_summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

  Backend.fetchScrimSummary = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/scrims_summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

  Backend.fetchCommsSummary = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/comms_summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

  Backend.fetchChampionPool = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/champion_summary`)
        .then((res) => {
            if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            return res.json();
        });
  };

  Backend.fetchTotalChampions = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/total_champions`)
        .then((res) => {
            if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            return res.json();
        });
  };

  window.SummaryBackend = Backend;
})();
