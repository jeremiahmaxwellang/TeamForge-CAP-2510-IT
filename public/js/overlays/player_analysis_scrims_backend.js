(function () {
  const Backend = {};

  // Fetch events (type = 'Scrim') for a player via event_attendees
  Backend.fetchScrims = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/scrims`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

  // Fetch times played with other players
  Backend.fetchTimesPlayed = async function (playerId) {
    return fetch(`/player_analysis/players/${playerId}/timesPlayed`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

  // Fetch existing evaluation — now uses eventId
  Backend.fetchEvaluation = async function (playerId, eventId) {
    return fetch(`/player_analysis/players/${playerId}/${eventId}/evaluation`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      });
  };

  // Save or update evaluation — now uses eventId + player_evaluations table
  Backend.saveEvaluation = async function (playerId, eventId, data) {
    console.log('[SAVE EVAL] playerId:', playerId, 'eventId:', eventId, 'data:', data);
    return fetch(`/player_analysis/players/${playerId}/${eventId}/evaluation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    });
  };

  window.ScrimsBackend = Backend;
})();