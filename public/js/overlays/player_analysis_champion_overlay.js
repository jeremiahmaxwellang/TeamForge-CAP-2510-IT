// player_analysis_champion_overlay.js
// ONLY: DOM wiring + rendering champion pool table.
// Requires ChampionPoolBackend loaded first.

// TODO: Update champ pool table when new player is selected from dropdown

window.initChampionTab = function (userId) {
  const champBackend = window.ChampionPoolBackend;
  if (!champBackend) {
    console.error("[CHAMPION] champBackend module not loaded.");
    return;
  }

  console.log("[CHAMPION] Tab logic initialized for user:", userId);

  const tableBody = document.querySelector("table tbody");
  if (!tableBody) {
    console.error("[CHAMPION] Table body not found in DOM.");
    return;
  }

  champBackend.fetchChampionPool(userId)
    .then((championPool) => {
      const formatted = champBackend.formatChampionStats(championPool);

      tableBody.innerHTML = "";
      formatted.forEach((champ, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${champ.championName}</td>
          <td>${champ.role}</td>
          <td>${champ.games}</td>
          <td>${champ.winrate}</td>
          <td>${champ.avgKills} / ${champ.avgDeaths} / ${champ.avgAssists}</td>
          <td>${champ.avgCsm}</td>
          <td>${champ.avgGoldDiff}</td>
          <td>${champ.avgDamageShare}</td>
          <td>${champ.avgKp}</td>
        `;
        tableBody.appendChild(row);
      });

      console.log("[CHAMPION] ✓ Champion pool rendered successfully");
    })
    .catch((err) => console.error("[CHAMPION] Error loading champion pool:", err));
};
