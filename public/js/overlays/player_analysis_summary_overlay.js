// player_analysis_summary_overlay.js
// ONLY: DOM wiring + form handling.

window.initSummaryTab = function (userId) {
  const Backend = window.SummaryBackend;
  if (!Backend) {
    console.error("[SUMMARY] Backend module not loaded.");
    return;
  }

  const recText = document.querySelector(".rec-text");

  // Scrims Elements
  const totalGames = document.querySelector("#total-games");
  let averageGameSense = 0.0;
  let averageComms = 0.0;
  let averageChampionPool = 0.0;

  // Champion Elements
  const totalChamps = document.querySelector("#total-champs");
  const champTableBody = document.querySelector("#champ-table tbody");

  const totalChampsPromise = Backend.fetchTotalChampions(userId)
    .then((item) => {
      
      if(item.totalChamps)
        totalChamps.textContent = `(${item.totalChamps} champions total)`;
    })

  const matchPromise = Backend.fetchOverviewSummary(userId)
    .then((items) => {
      const overviewTb = document.querySelector("#overview-table tbody");

      overviewTb.innerHTML = "";

      items.forEach((item) => {
        const row = document.createElement("tr");

        const tempWinrate = item.wins / item.games * 100;
        const winrate = parseFloat(tempWinrate.toFixed(2));

        row.innerHTML = `
              <td>
                  <div class="role-wrap">
                      <!-- Temp Role icon -->
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <rect width="28" height="28" rx="3" fill="#e8ecf2" />
                          <path d="M14 6 L10 10 L10 16 L14 22 L18 16 L18 10 Z" fill="#c8a84b"
                              opacity="0.85" />
                          <path d="M14 8 L11.5 11 L11.5 15.5 L14 19 L16.5 15.5 L16.5 11 Z"
                              fill="#e8c55a" />
                          <path d="M14 10 L12.5 12 L12.5 15 L14 17 L15.5 15 L15.5 12 Z" fill="#c8a84b" />
                      </svg>
                      <span class="role-name">${item.champ_role}</span>
                  </div>
              </td>
              <td><span class="games-num">${item.games}</span></td>
              <td>
                  <div class="donut-cell">
                      <svg class="donut" viewBox="0 0 42 42">
                          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#e85050"
                              stroke-width="5.5" />
                          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#4d8ef0" stroke-width="5.5"
                              stroke-dasharray="27 73" transform="rotate(-90 21 21)"
                              stroke-linecap="round" />
                      </svg>
                      <span class="wr-text">${winrate}% WR</span>
                  </div>
              </td>
              <td><span class="kda-text">${item.avgKills} / ${item.avgDeaths} / ${item.avgAssists}</span></td>
            `;    

        overviewTb.appendChild(row);
      });
    })
    .catch((err) => console.error("[SCRIMS] ✗ Error loading scrim summary:", err));

  const scrimsPromise = Backend.fetchScrimSummary(userId)
    .then((scrims) => {
      const scrimTb = document.querySelector("#scrims-table tbody");

      scrimTb.innerHTML = "";

      scrims.forEach((item) => {
        totalGames.textContent = `(${item.totalScrims} games total)`;

        // Assigning global variables
        averageGameSense = parseFloat(item.averageGameSense);
        averageComms = parseFloat(item.averageComms);
        averageChampionPool = parseFloat(item.averageChampionPool);
        console.log(averageComms);

        const row = document.createElement("tr");

        let rowGameSense = `<td>${item.averageGameSense}</td>`;
        let rowComms = `<td>${item.averageComms}</td>`;
        let rowChampionPool = `<td>${item.averageChampionPool}</td>`;

        if(parseFloat(item.averageGameSense) <= 2.5) {
          rowGameSense = `<td><span class="score-red">${item.averageGameSense}</span></td>`
        }

        if(parseFloat(item.averageComms) <= 2.5) {
          rowComms = `<td><span class="score-red">${item.averageComms}</span></td>`
        }

        if(parseFloat(item.averageChampionPool) <= 2.5) {
          rowChampionPool = `<td><span class="score-red">${item.averageChampionPool}</span></td>`
        }

        row.innerHTML = `
            ${rowGameSense}
            ${rowComms}
            ${rowChampionPool}
        `;

        scrimTb.appendChild(row);

        const mostPlayedWith = document.querySelector("#most-played-with");
        const scrimsTogether = document.querySelector("#scrims-together");

        if (mostPlayedWith) mostPlayedWith.textContent = item.mostPlayedWith;
        if (scrimsTogether) scrimsTogether.textContent = item.scrimsTogether;
      });
    })
    .catch((err) => console.error("[SCRIMS] ✗ Error loading scrim summary:", err));


  const commsPromise = Backend.fetchCommsSummary(userId)
    .then((comms) => {
      const bestComms = document.querySelector("#best-comms");
      const avgComms = document.querySelector("#avg-comms");
      const teammateAvgComms = document.querySelector("#teammate-avg-comms");

      bestComms.textContent = comms.teammate;
      avgComms.textContent = comms.avg_comms;
      teammateAvgComms.textContent = comms.teammate_avg_comms;
    })
    .catch((err) => console.error("[SUMMARY] ✗ Error loading comms summary:", err));



  const championPromise = Backend.fetchChampionPool(userId)
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



    // Recommendations Section
    
    async function generateRecommendations() {
      // Wait for all data to load before generating recommendation
      await Promise.all([scrimsPromise, totalChampsPromise, championPromise, commsPromise, matchPromise]);

      // TODO: Get player name and primary role
      let recommendation = `Player ${userId} has`;

      console.log(averageComms);

      // Ranked
      // TODO: Ranked summary with creep score for all roles except support (needs calculation in overview/riotapi controller)

      // Champions
      // TODO: High/Low amount of champs

      // Scrims
      if(averageComms <= 2.5 && averageComms != 0) {
        recommendation = recommendation.concat(` has poor communication during scrims (${averageComms})` )
      }
      else if(averageComms > 2.5 && averageComms != 0) {
        recommendation = recommendation.concat(` has good communication during scrims (${averageComms})` )
      }

      console.log(recommendation);

      if(recommendation) {
        recText.textContent = recommendation;
      }
      
    }

    generateRecommendations();
    


};
