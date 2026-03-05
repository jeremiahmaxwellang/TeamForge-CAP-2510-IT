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
          const tableBody = document.querySelector(".scrims-table tbody");

          tableBody.innerHTML = "";

          scrims.forEach((item) => {
            const row = document.createElement("tr");

            // row.classList.add("times-played-row");

            row.innerHTML = `
              <td>${item.totalScrims}</td>
              <td>${item.averageGameSense}</td>
              <td>${item.averageComms}</td>
              <td>${item.averageChampionPool}</td>
              <td>${item.mostPlayedWith}</td>
              <td>${item.scrimsTogether}</td>
            `;

            tableBody.appendChild(row);
          });
        })
        .catch((err) => console.error("[SCRIMS] ✗ Error loading scrim summary:", err));

};
