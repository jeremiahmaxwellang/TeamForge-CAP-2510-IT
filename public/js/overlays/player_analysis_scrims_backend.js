// player_analysis_scrims_backend.js
// ONLY: API calls + response formatting. NO DOM access.

(function () {
  const Backend = {};

  // Fetch existing evaluation
  Backend.fetchEvaluation = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/evaluation`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

//   TODO: Fix the save Evaluation feature (Feb 21 - jer)
  // Save or update evaluation
  Backend.saveEvaluation = async function (playerId, data) {
    console.log(playerId);
    console.log(data);
    return fetch(`/player_analysis/players/${playerId}/evaluation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    });
  };

  window.ScrimsBackend = Backend;
})();
