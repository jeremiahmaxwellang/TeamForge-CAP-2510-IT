// player_analysis_summary_overlay.js
// ONLY: DOM wiring + form handling.

window.initSummaryTab = function (userId) {
  const Backend = window.SummaryBackend;
  if (!Backend) {
    console.error("[SUMMARY] Backend module not loaded.");
    return;
  }

  Backend.fetchScrimSummary(userId)
    .then((scrims) => {
      const scrimTb = document.querySelector(".scrims-table tbody");
      const totalGames = document.querySelector("#total-games");

      scrimTb.innerHTML = "";

      scrims.forEach((item) => {
        totalGames.textContent = `(${item.totalScrims} games total)`;
        const row = document.createElement("tr");

        row.innerHTML = `
              <td>${item.averageGameSense}</td>
              <td>${item.averageComms}</td>
              <td>${item.averageChampionPool}</td>
            `;

        scrimTb.appendChild(row);

        const mostPlayedWith = document.querySelector("#most-played-with");
        const scrimsTogether = document.querySelector("#scrims-together");

        mostPlayedWith.textContent = item.mostPlayedWith;
        scrimsTogether.innerHTML = `Games: <strong>${item.scrimsTogether}</strong>`;
      });
    })
    .catch((err) => console.error("[SCRIMS] ✗ Error loading scrim summary:", err));


    Backend.fetchCommsSummary(userId)
    .then((comms) => {
        const bestComms = document.querySelector("#best-comms");
        const avgComms = document.querySelector("#avg-comms");
        const teammateAvgComms = document.querySelector("#teammate-avg-comms");

        bestComms.textContent = comms.teammate;
        avgComms.innerHTML = `Avg Comms: <strong>${comms.avg_comms}</strong></span>`;
        teammateAvgComms.innerHTML = `Teammate Avg Comms: <strong>${comms.teammate_avg_comms}</strong></span>`;
    })
    .catch((err) => console.error("[SUMMARY] ✗ Error loading comms summary:", err));


  Backend.fetchRoleSummary(userId)
    .then((roles) => {
      const tableBody = document.querySelector(".role-legend tbody");

      tableBody.innerHTML = "";

      roles.forEach((item) => {
        const row = document.createElement("tr");

        row.innerHTML = `
              <td>
                <div class="legend-dot" style="background:#3b82f6;"></div>
              </td>
              <td><strong>${item.percentage}</strong></td>
              <td>🛡️</td>
              <td>${item.displayedRole}</td>
              <td>(Games: <strong>${item.gamesPlayed}</strong>)</td>

            `;

        tableBody.appendChild(row);
      });
    })
    .catch((err) => console.error("[roles] ✗ Error loading scrim summary:", err));

  const champTableBody = document.querySelector(".champ-table tbody");

  Backend.fetchChampionPool(userId)
    .then((championPool) => {
      champTableBody.innerHTML = "";
      championPool.forEach((champ) => {

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${champ.championName}</td>
          <td>${champ.games}</td>
          <td class="kda-text">${champ.avg_kills} / ${champ.avg_deaths} / ${champ.avg_assists}</td>
        `;
        champTableBody.appendChild(row);
      });

      console.log("[SUMMARY] ✓ Champion pool rendered successfully");
    })
    .catch((err) => console.error("[SUMMARY] Error loading champion pool:", err));

};
