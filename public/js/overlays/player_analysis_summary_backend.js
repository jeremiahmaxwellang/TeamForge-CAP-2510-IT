// player_analysis_summary_backend.js
// ONLY: API calls + response formatting. NO DOM access.

(function () {
  const Backend = {};

  Backend.fetchScrimSummary = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/scrims_summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

  window.SummaryBackend = Backend;
})();
