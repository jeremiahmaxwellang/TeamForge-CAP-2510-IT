// player_analysis_summary_backend.js
// ONLY: API calls + response formatting. NO DOM access.

(function () {
  const Backend = {};

//   Backend.fetchScrims = async function (playerId) {
//     return fetch(`/player_analysis/players/${playerId}/scrims`)
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
//         return res.json();
//       });
//   };

  window.SummaryBackend = Backend;
})();
