// player_analysis_backend.js
// All Riot/API fetches, calculations, DB-store calls, and player dropdown loading live here.

(function () {
  // Shared namespace/state
  window.PlayerAnalysis = window.PlayerAnalysis || {};
  const PA = window.PlayerAnalysis;

  PA.state = PA.state || {
    currentQueueId: 420, // default Ranked Solo/Duo
  };

  // -----------------------------
  // BACKEND / DATA-FETCH HELPERS
  // -----------------------------

  function updatePuuid(userId, puuid) {
    console.log(`[UPDATE PUUID] Updating PUUID for user ${userId}: ${puuid}`);
    return fetch(`/player_analysis/players/${userId}/puuid`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puuid }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(`[UPDATE PUUID] ✓ Successfully updated PUUID:`, data);
        return data;
      })
      .catch((err) => {
        console.error(`[UPDATE PUUID] ✗ Error updating PUUID:`, err);
        throw err;
      });
  }

  function fetchWinrate(puuid, queueId = 420) {
    console.log(`[FETCH WINRATE] Requesting winrate for PUUID: ${puuid}, Queue: ${queueId}`);

    return fetch(`/riot/winrate/${puuid}?queueId=${queueId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log(`[FETCH WINRATE] ✓ Winrate Data Received:`, data);

        // These elements exist in the overview overlay HTML (when loaded)
        const percentWinEl = document.querySelector(".percentWin");
        const totalGamesEl = document.querySelector(".totalGames");

        if (percentWinEl) percentWinEl.textContent = `${data.winrate}% WR`;
        if (totalGamesEl) totalGamesEl.textContent = `Last ${data.total} Games (${data.wins}W - ${data.losses}L)`;

        const winrateContainer = document.querySelector(".winrate");
        console.log(`[FRONTEND] Targeting winrate container:`, winrateContainer);

        if (winrateContainer) {
          const winrate = data.winrate;
          const styleId = "winrate-gradient-style";

          let styleElement = document.getElementById(styleId);
          if (styleElement) styleElement.remove();

          styleElement = document.createElement("style");
          styleElement.id = styleId;
          styleElement.textContent = `
            .winrate::before {
              background: conic-gradient(
                #28b5ff 0deg,
                #28b5ff ${(winrate / 100) * 360}deg,
                #ff6b6b ${(winrate / 100) * 360}deg,
                #ff6b6b 360deg
              ) !important;
            }
          `;
          document.head.appendChild(styleElement);
        }

        return data;
      })
      .catch((err) => {
        console.error("[FETCH WINRATE] ✗ Error fetching winrate:", err);
        throw err;
      });
  }

  function fetchMatchDetails(matchId) {
    return fetch(`/riot/match/${matchId}`)
      .then((res) => res.json())
      .then((data) => data.matchDetails)
      .catch((err) => {
        console.error(`[FETCH DETAILS] ✗ Error fetching match details for ${matchId}:`, err);
        throw err;
      });
  }

  function calculateAverageKDA(matchesData, puuid) {
    console.log(`[CALC KDA] Calculating average KDA for PUUID: ${puuid} from ${matchesData.length} matches`);

    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let validMatches = 0;

    matchesData.forEach((match, index) => {
      if (match.info && match.info.participants) {
        const playerParticipant = match.info.participants.find((p) => p.puuid === puuid);
        if (playerParticipant) {
          totalKills += playerParticipant.kills || 0;
          totalDeaths += playerParticipant.deaths || 0;
          totalAssists += playerParticipant.assists || 0;
          validMatches++;
          console.log(
            `[CALC KDA] Match ${index + 1}: ${playerParticipant.kills}/${playerParticipant.deaths}/${playerParticipant.assists}`
          );
        }
      }
    });

    const avgKills = validMatches > 0 ? (totalKills / validMatches).toFixed(2) : 0;
    const avgDeaths = validMatches > 0 ? (totalDeaths / validMatches).toFixed(2) : 0;
    const avgAssists = validMatches > 0 ? (totalAssists / validMatches).toFixed(2) : 0;
    const kdaRatio = validMatches > 0 ? ((totalKills + totalAssists) / (totalDeaths || 1)).toFixed(2) : 0;

    return { kdaRatio, avgKills, avgDeaths, avgAssists };
  }

  function updateKDADisplay(kdaStats) {
    const averageKDAEl = document.querySelector("#averageKDA");
    const summarizedKDAEl = document.querySelector("#summarizedKDA");

    if (averageKDAEl) averageKDAEl.textContent = `${kdaStats.kdaRatio} KDA`;
    if (summarizedKDAEl) summarizedKDAEl.textContent = `${kdaStats.avgKills} / ${kdaStats.avgDeaths} / ${kdaStats.avgAssists}`;
  }

  function getTop3Champions(matchesData, puuid) {
    const championStats = {};

    matchesData.forEach((match) => {
      if (match.info && match.info.participants) {
        const p = match.info.participants.find((x) => x.puuid === puuid);
        if (!p) return;

        const champName = p.championName;
        const isWin = p.win;

        if (!championStats[champName]) {
          championStats[champName] = {
            name: champName,
            games: 0,
            wins: 0,
            losses: 0,
            totalKills: 0,
            totalDeaths: 0,
            totalAssists: 0,
          };
        }

        championStats[champName].games += 1;
        championStats[champName].wins += isWin ? 1 : 0;
        championStats[champName].losses += isWin ? 0 : 1;
        championStats[champName].totalKills += p.kills || 0;
        championStats[champName].totalDeaths += p.deaths || 0;
        championStats[champName].totalAssists += p.assists || 0;
      }
    });

    return Object.values(championStats)
      .sort((a, b) => b.games - a.games)
      .slice(0, 3);
  }

  function updateChampionDisplay(topChampions) {
    topChampions.forEach((champ, index) => {
      const champElement = document.getElementById(`champion${index + 1}`);
      if (!champElement) return;

      const avgKills = (champ.totalKills / champ.games).toFixed(2);
      const avgDeaths = (champ.totalDeaths / champ.games).toFixed(2);
      const avgAssists = (champ.totalAssists / champ.games).toFixed(2);
      const kdaRatio = ((champ.totalKills + champ.totalAssists) / (champ.totalDeaths || 1)).toFixed(2);

      const img = champElement.querySelector(".champion-icon");
      if (img) {
        img.src = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champ.name}.png`;
        img.alt = champ.name;
      }

      const kdaElement = champElement.querySelector(".kda-1");
      const advKdaElement = champElement.querySelector(".kda-2");

      if (kdaElement) kdaElement.innerHTML = `${kdaRatio} KDA <span class="note">(${champ.wins}W ${champ.losses}L)</span>`;
      if (advKdaElement) advKdaElement.textContent = `${avgKills} / ${avgDeaths} / ${avgAssists}`;
    });
  }

  function storeMatchParticipantsBatch(matchesData) {
    if (!matchesData || matchesData.length === 0) {
      console.log("[PARTICIPANTS] No matches to extract participants from");
      return Promise.resolve({ totalParticipants: 0, stored: 0 });
    }

    const batchData = matchesData.map((match) => ({
      matchId: match.metadata.matchId,
      matchData: match,
    }));

    return fetch(`/riot/participants/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matches: batchData }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error(`[PARTICIPANTS] ✗ Error uploading participants batch:`, err);
        return { error: err.message };
      });
  }

  function storeMatchesToDatabase(userId, matchesData) {
    const validMatches = matchesData.filter((m) => m && m.metadata && m.info);
    if (validMatches.length === 0) {
      console.log("[STORE] No valid matches to store");
      return Promise.resolve();
    }

    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < validMatches.length; i += batchSize) {
      batches.push(validMatches.slice(i, i + batchSize));
    }

    const batchPromises = batches.map((batch, batchIndex) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          fetch(`/riot/matches/${userId}/store-multiple`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matches: batch }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(`[STORE] ✓ Match batch ${batchIndex + 1}/${batches.length} stored:`, data);
              storeMatchParticipantsBatch(batch)
                .then((participantResult) => resolve({ storeResult: data, participantResult }))
                .catch(() => resolve({ storeResult: data }));
            })
            .catch((err) => {
              console.error(`[STORE] ✗ Error storing match batch ${batchIndex + 1}:`, err);
              resolve({ error: err.message });
            });
        }, batchIndex * 500);
      });
    });

    return Promise.all(batchPromises);
  }

  function fetchRecentMatches(puuid, queueId) {
    console.log(`[FETCH MATCHES] Starting fetch for PUUID: ${puuid}, Queue: ${queueId}`);

    return fetch(`/riot/matches/${puuid}/${queueId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.matches || !Array.isArray(data.matches)) throw new Error("Invalid response: matches array not found");

        const detailPromises = data.matches.map((matchId) => fetchMatchDetails(matchId));
        return Promise.all(detailPromises);
      })
      .then((matchesData) => {
        // Update overview stats if overlay is open
        const kdaStats = calculateAverageKDA(matchesData, puuid);
        updateKDADisplay(kdaStats);

        const topChampions = getTop3Champions(matchesData, puuid);
        updateChampionDisplay(topChampions);

        // Store to DB
        const currentPlayerId = document.getElementById("player-dropdown-btn")?.getAttribute("data-player-id");
        if (currentPlayerId && matchesData.length > 0) storeMatchesToDatabase(currentPlayerId, matchesData);

        return matchesData;
      })
      .catch((err) => {
        console.error("[FETCH MATCHES] ✗ Error fetching recent matches:", err);
        throw err;
      });
  }

  // Load one player’s details into the main page + triggers data fetches
  function loadPlayer(playerId) {
    console.log(`[LOAD PLAYER] Loading player: ${playerId}`);

    return fetch(`/player_analysis/players/${playerId}`)
      .then((res) => res.json())
      .then((player) => {
        // Remove later
        const puuidEl = document.getElementById("puuid");
        if (puuidEl) puuidEl.textContent = `PUUID: ${player.puuid || ""}`;

        let puuid = player.puuid || "";

        const applyPlayerToDOM = () => {
          const btn = document.getElementById("player-dropdown-btn");
          if (btn) {
            btn.textContent = `${player.gameName}#${player.tagLine} (${player.primaryRole})`;
            btn.setAttribute("data-player-id", player.userId);
            btn.setAttribute("data-puuid", puuid);
          }

          document.getElementById("primaryRole") && (document.getElementById("primaryRole").textContent = `Primary Role: ${player.primaryRole}`);
          document.getElementById("secondaryRole") && (document.getElementById("secondaryRole").textContent = `Secondary Role: ${player.secondaryRole}`);
          document.getElementById("email") && (document.getElementById("email").textContent = `Email: ${player.email}`);
          document.getElementById("discord") && (document.getElementById("discord").textContent = `Discord: ${player.discord}`);
          document.getElementById("schoolId") && (document.getElementById("schoolId").textContent = `School ID: ${player.schoolId}`);
          document.getElementById("course") && (document.getElementById("course").textContent = `Course: ${player.course}`);
          document.getElementById("year") && (document.getElementById("year").textContent = `Year Level: ${player.yearLevel}`);
        };

        if (!player.puuid) {
          return fetch(`/riot/puuid/${player.gameName}/${player.tagLine}`)
            .then((res) => res.json())
            .then((data) => {
              puuid = data.puuid;
              // update puuid in sql if null
              return updatePuuid(player.userId, puuid).catch(() => {});
            })
            .finally(() => {
              // Remove later
              const puuidEl2 = document.getElementById("puuid");
              if (puuidEl2) puuidEl2.textContent = `PUUID: ${puuid}`;

              applyPlayerToDOM();

              // Trigger fetches
              fetchRecentMatches(puuid, PA.state.currentQueueId);
              fetchWinrate(puuid, PA.state.currentQueueId);
            });
        }

        applyPlayerToDOM();

        // Trigger fetches
        fetchRecentMatches(puuid, PA.state.currentQueueId);
        fetchWinrate(puuid, PA.state.currentQueueId);

        return player;
      })
      .catch((err) => {
        console.error(`[LOAD PLAYER] ✗ Error loading player data:`, err);
        throw err;
      });
  }

  // Expose API for overlay code
  PA.api = {
    updatePuuid,
    fetchWinrate,
    fetchRecentMatches,
    loadPlayer,
  };

  // -----------------------------
  // MAIN PAGE: populate dropdown
  // -----------------------------
  document.addEventListener("DOMContentLoaded", function () {
    fetch("/player_analysis/players")
      .then((res) => res.json())
      .then((players) => {
        const dropdownMenu = document.querySelector(".player-dropdown-menu");
        if (!dropdownMenu) return;

        dropdownMenu.innerHTML = "";
        players.forEach((player) => {
          const link = document.createElement("a");
          link.href = "#";
          link.textContent = `${player.gameName} (${player.primaryRole})`;
          link.addEventListener("click", () => loadPlayer(player.userId));
          dropdownMenu.appendChild(link);
        });

        if (players.length > 0) loadPlayer(players[0].userId);
      })
      .catch((err) => console.error("[LOAD PLAYERS] ✗ Error loading player list:", err));
  });
})();