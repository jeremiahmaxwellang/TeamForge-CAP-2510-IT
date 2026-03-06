// player_analysis_backend.js
// All Riot/API fetches, calculations, DB-store calls, and player dropdown loading live here.

(function () {
  // Shared namespace/state
  window.PlayerAnalysis = window.PlayerAnalysis || {};
  const PA = window.PlayerAnalysis;

  PA.state = PA.state || {
    currentQueueId: 420, // default Ranked Solo/Duo
    currentRoleView: "primary", // primary | secondary
  };

  // Cache for storing fetched data
  PA.cache = PA.cache || {
    currentPlayerId: null,
    currentPuuid: null,
    matches: null,
    winrateData: null,
    kdaStats: null,
    topChampions: null,
  };
  const OVERVIEW_MATCH_LIMIT = 15;

  function normalizeTeamPosition(position) {
    return String(position || "").trim().toUpperCase();
  }

  // -----------------------------
  // NEW: RANK FETCHING LOGIC
  // -----------------------------

  /**
   * Fetches current and peak rank from the backend proxy
   * @param {string} puuid - The player's unique PUUID
   */
  async function fetchPlayerRanks(puuid) {
    const currentRankEl = document.getElementById('currentRank');
    const peakRankEl = document.getElementById('peakRank');
    const currentRankIconEl = document.getElementById('currentRankIcon');
    const peakRankIconEl = document.getElementById('peakRankIcon');

    const RANK_ICON_BASE_URL = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests';
    const validRankTiers = new Set([
      'iron',
      'bronze',
      'silver',
      'gold',
      'platinum',
      'emerald',
      'diamond',
      'master',
      'grandmaster',
      'challenger',
      'unranked'
    ]);

    function getRankTier(rankValue) {
      if (!rankValue || typeof rankValue !== 'string') return 'unranked';

      const firstWord = rankValue.trim().split(/\s+/)[0].toLowerCase();
      return validRankTiers.has(firstWord) ? firstWord : 'unranked';
    }

    function getRankIconUrl(rankValue) {
      const tier = getRankTier(rankValue);
      const filename = tier === 'emerald' ? 'emerald_tft.svg' : `${tier}.png`;
      return `${RANK_ICON_BASE_URL}/${filename}`;
    }

    try {
        const response = await fetch(`/riot/rank/${puuid}`);
        const data = await response.json();

        if (response.ok) {
            // Display: "PLATINUM II (45 LP)"
            currentRankEl.textContent = data.lp > 0 
                ? `${data.currentRank} (${data.lp} LP)` 
                : data.currentRank;
            
            peakRankEl.textContent = data.peakRank;
            if (currentRankIconEl) currentRankIconEl.src = getRankIconUrl(data.currentRank);
            if (peakRankIconEl) peakRankIconEl.src = getRankIconUrl(data.peakRank);
            console.log(`[RANK] ✅ Updated: ${data.currentRank}`);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error("[RANK] ❌ UI Update Failed:", error);
        currentRankEl.textContent = "Error";
    }
  }

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

  function fetchWinrate(puuid, queueId = 420, teamPosition = null) {
    console.log(`[FETCH WINRATE] Requesting winrate for PUUID: ${puuid}, Queue: ${queueId}, TeamPosition: ${teamPosition || "all"}`);

    const params = new URLSearchParams({ queueId: String(queueId) });
    if (teamPosition) params.append("teamPosition", teamPosition);

    return fetch(`/riot/winrate/${puuid}?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log(`[FETCH WINRATE] ✓ Winrate Data Received:`, data);

        // Calculate the winrate
        const wins = Number(data.wins) || 0;
        const total = Number(data.total) || 0;
        const winrate = total > 0 ? (wins / total) * 100 : 0; // Winrate calculation

        // Update the winrate and games information
        const winrateData = {
          winrate: Number(winrate.toFixed(2)),
          wins,
          losses: Math.max(total - wins, 0),
          total,
        };

        // Cache the winrate data
        PA.cache.winrateData = winrateData;

        // Update the display with winrate data (if elements exist)
        updateWinrateDisplay(winrateData);

        // Notify overlays/listeners that winrate data changed
        document.dispatchEvent(new CustomEvent("playeranalysis:winrate-updated", { detail: winrateData }));

        console.log(`[FETCH WINRATE] ✓ Cached winrate data:`, PA.cache.winrateData);

        // Store winrate into playerStatistics table via backend
        try {
          const currentPlayerId = document.getElementById("player-dropdown-btn")?.getAttribute("data-player-id");
          const primaryRoleId = document.getElementById("player-dropdown-btn")?.getAttribute("data-primary-role-id");
          if (currentPlayerId) {
            const payload = {
              userId: Number(currentPlayerId),
              roleId: primaryRoleId ? Number(primaryRoleId) : null,
              metricId: 26, // metricId 26 corresponds to averageWinrate
              metricValue: Number(winrate.toFixed(2))
            };

            fetch('/player_analysis/stats/store', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
              .then(res => res.json())
              .then(result => console.log('[STORE WINRATE] ✓ Stored winrate result:', result))
              .catch(err => console.error('[STORE WINRATE] ✗ Error storing winrate:', err));
          }
        } catch (err) {
          console.error('[STORE WINRATE] ✗ Unexpected error preparing store request:', err);
        }

        return winrateData;
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

  function updateWinrateDisplay(winrateData) {
    console.log(`[UPDATE WINRATE] Updating display with:`, winrateData);

    const percentWinEl = document.querySelector(".percentWin");
    const totalGamesEl = document.querySelector(".totalGames");
    const winrateContainer = document.querySelector(".winrate"); // Select the container

    const normalizedWinrate = Math.min(100, Math.max(0, Number(winrateData?.winrate) || 0));

    if (percentWinEl) percentWinEl.textContent = `${normalizedWinrate.toFixed(2)}%`;
    if (totalGamesEl) {
      totalGamesEl.textContent = `${winrateData.wins}W ${winrateData.losses}L (${winrateData.total} games)`;
    }

    // Update the Circle Graph
    if (winrateContainer) {
      // Calculate degrees: (percentage / 100) * 360
      const degrees = (normalizedWinrate / 100) * 360;

      // Set the CSS variable on the element so the ::before pseudo-element can use it
      winrateContainer.style.setProperty('--winrate-angle', `${degrees}deg`);
    }
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

  function storeMatchesToDatabase(userId, matchesData, syncOptions = null) {
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

    return Promise.all(batchPromises)
      .then(async (storeResults) => {
        if (!syncOptions || !syncOptions.puuid) {
          return { storeResults };
        }

        try {
          const syncResponse = await fetch(`/riot/matches/${userId}/sync-role-window`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              puuid: syncOptions.puuid,
              queueId: syncOptions.queueId,
            }),
          });

          const syncResult = await syncResponse.json();
          if (!syncResponse.ok) {
            throw new Error(syncResult?.error || `HTTP ${syncResponse.status}`);
          }

          console.log("[STORE] ✓ Synced role match window:", syncResult);
          return { storeResults, syncResult };
        } catch (syncErr) {
          console.error("[STORE] ✗ Error syncing role match window:", syncErr);
          return { storeResults, syncError: syncErr.message };
        }
      });
  }

  function fetchRecentMatches(puuid, queueId, teamPosition = null) {
    console.log(`[FETCH MATCHES] Starting fetch for PUUID: ${puuid}, Queue: ${queueId}, SelectedTeamPosition: ${teamPosition || "all"}`);

    return fetch(`/riot/matches/${puuid}/${queueId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.matches || !Array.isArray(data.matches)) throw new Error("Invalid response: matches array not found");

        console.log(`[FETCH MATCHES] Received ${data.matches.length} match IDs from API for queue ${queueId}`);

        if (data.roleBuckets) {
          console.log(
            `[FETCH MATCHES] Role buckets from backend: ${data.roleBuckets.primary}/${data.roleBuckets.targetPerRole} primary, ${data.roleBuckets.secondary}/${data.roleBuckets.targetPerRole} secondary`
          );
        }

        const matchIds = data.matches;

        console.log(`[FETCH MATCHES] Processing ${matchIds.length} matches for details fetch`);

        const detailPromises = matchIds.map((matchId) => fetchMatchDetails(matchId));
        return Promise.all(detailPromises);
      })
      .then((matchesData) => {
        const normalizedSelectedRole = normalizeTeamPosition(teamPosition);
        const displayMatches = normalizedSelectedRole
          ? matchesData
              .filter((match) => {
                const participant = match?.info?.participants?.find((p) => p.puuid === puuid);
                return normalizeTeamPosition(participant?.teamPosition) === normalizedSelectedRole;
              })
              .slice(0, OVERVIEW_MATCH_LIMIT)
          : matchesData.slice(0, OVERVIEW_MATCH_LIMIT);

        // Cache the matches
        PA.cache.matches = displayMatches;

        // Calculate and cache stats from matches
        const kdaStats = calculateAverageKDA(displayMatches, puuid);
        PA.cache.kdaStats = kdaStats;
        updateKDADisplay(kdaStats);

        // Store average KDA and K/D/A metrics into playerStatistics
        try {
          const currentPlayerId = document.getElementById("player-dropdown-btn")?.getAttribute("data-player-id");
          const primaryRoleId = document.getElementById("player-dropdown-btn")?.getAttribute("data-primary-role-id");
          if (currentPlayerId) {
            const statsToStore = [
              { metricId: 12, metricValue: Number(kdaStats.kdaRatio) }, // averageKDA
              { metricId: 14, metricValue: Number(kdaStats.avgKills) }, // averageKills
              { metricId: 7,  metricValue: Number(kdaStats.avgDeaths) }, // averageDeaths
              { metricId: 2,  metricValue: Number(kdaStats.avgAssists) } // averageAssists
            ];

            statsToStore.forEach(stat => {
              fetch('/player_analysis/stats/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: Number(currentPlayerId),
                  roleId: primaryRoleId ? Number(primaryRoleId) : null,
                  metricId: stat.metricId,
                  metricValue: Number(stat.metricValue.toFixed ? stat.metricValue.toFixed(2) : stat.metricValue)
                })
              })
                .then(res => res.json())
                .then(result => console.log('[STORE KDA] ✓ Stored metric', stat.metricId, result))
                .catch(err => console.error('[STORE KDA] ✗ Error storing metric', stat.metricId, err));
            });
          }
        } catch (err) {
          console.error('[STORE KDA] ✗ Unexpected error preparing store request:', err);
        }

        const topChampions = getTop3Champions(displayMatches, puuid);
        PA.cache.topChampions = topChampions;
        updateChampionDisplay(topChampions);

        // Store to DB (both primary+secondary role buckets), then trim to latest 15 per role
        const currentPlayerId = document.getElementById("player-dropdown-btn")?.getAttribute("data-player-id");
        if (currentPlayerId && matchesData.length > 0) {
          storeMatchesToDatabase(currentPlayerId, matchesData, {
            puuid,
            queueId,
          });
        }

        return displayMatches;
      })
      .catch((err) => {
        console.error("[FETCH MATCHES] ✗ Error fetching recent matches:", err);
        throw err;
      });
  }
  // Fetch recent matches from database (cached data)
  function fetchRecentMatchesFromDatabase(puuid, queueId, teamPosition = null) {
    console.log(`[FETCH MATCHES DB] Starting database fetch for PUUID: ${puuid}, Queue: ${queueId}, TeamPosition: ${teamPosition || "all"}`);

    const params = new URLSearchParams({ queueId: String(queueId) });
    if (teamPosition) params.append("teamPosition", teamPosition);

    return fetch(`/riot/matches/database/${puuid}?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.matches || !Array.isArray(data.matches)) {
          console.log(`[FETCH MATCHES DB] No matches in database for PUUID: ${puuid}`);
          return [];
        }

        console.log(`[FETCH MATCHES DB] ✓ Retrieved ${data.matches.length} matches from database for PUUID: ${puuid}`);

        const matchesData = data.matches.slice(0, OVERVIEW_MATCH_LIMIT);

        // Cache the matches
        PA.cache.matches = matchesData;

        // Calculate and cache stats from matches
        const kdaStats = calculateAverageKDA(matchesData, puuid);
        PA.cache.kdaStats = kdaStats;
        updateKDADisplay(kdaStats);

        // Store average KDA and K/D/A metrics into playerStatistics
        try {
          const currentPlayerId = document.getElementById("player-dropdown-btn")?.getAttribute("data-player-id");
          const primaryRoleId = document.getElementById("player-dropdown-btn")?.getAttribute("data-primary-role-id");
          if (currentPlayerId) {
            const statsToStore = [
              { metricId: 12, metricValue: Number(kdaStats.kdaRatio) }, // averageKDA
              { metricId: 14, metricValue: Number(kdaStats.avgKills) }, // averageKills
              { metricId: 7,  metricValue: Number(kdaStats.avgDeaths) }, // averageDeaths
              { metricId: 2,  metricValue: Number(kdaStats.avgAssists) } // averageAssists
            ];

            statsToStore.forEach(stat => {
              fetch('/player_analysis/stats/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: Number(currentPlayerId),
                  roleId: primaryRoleId ? Number(primaryRoleId) : null,
                  metricId: stat.metricId,
                  metricValue: Number(stat.metricValue.toFixed ? stat.metricValue.toFixed(2) : stat.metricValue)
                })
              })
                .then(res => res.json())
                .then(result => console.log('[STORE KDA] ✓ Stored metric', stat.metricId, result))
                .catch(err => console.error('[STORE KDA] ✗ Error storing metric', stat.metricId, err));
            });
          }
        } catch (err) {
          console.error('[STORE KDA] ✗ Unexpected error preparing store request:', err);
        }

        const topChampions = getTop3Champions(matchesData, puuid);
        PA.cache.topChampions = topChampions;
        updateChampionDisplay(topChampions);

        console.log(`[FETCH MATCHES DB] ✓ Data cached:`, {
          matches: matchesData.length,
          kdaStats: PA.cache.kdaStats,
          topChampions: PA.cache.topChampions
        });

        return matchesData;
      })
      .catch((err) => {
        console.error("[FETCH MATCHES DB] ✗ Error fetching recent matches from database:", err);
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

              // store primary role id so frontend can send role context when storing metrics
              if (player.primaryRoleId) btn.setAttribute("data-primary-role-id", player.primaryRoleId);
              if (player.secondaryRoleId) btn.setAttribute("data-secondary-role-id", player.secondaryRoleId);
              if (player.riotTeamPosition1) btn.setAttribute("data-primary-team-position", player.riotTeamPosition1);
              if (player.riotTeamPosition2) btn.setAttribute("data-secondary-team-position", player.riotTeamPosition2);
              if (player.primaryRole) btn.setAttribute("data-primary-role-name", player.primaryRole);
              if (player.secondaryRole) btn.setAttribute("data-secondary-role-name", player.secondaryRole);
          }

          document.getElementById("primaryRole") && (document.getElementById("primaryRole").textContent = `Primary Role: ${player.primaryRole}`);
          document.getElementById("secondaryRole") && (document.getElementById("secondaryRole").textContent = `Secondary Role: ${player.secondaryRole}`);
          document.getElementById("email") && (document.getElementById("email").textContent = `Email: ${player.email}`);
          document.getElementById("discord") && (document.getElementById("discord").textContent = `Discord: ${player.discord}`);
          document.getElementById("schoolId") && (document.getElementById("schoolId").textContent = `School ID: ${player.schoolId}`);
          document.getElementById("course") && (document.getElementById("course").textContent = `Course: ${player.course}`);
          document.getElementById("year") && (document.getElementById("year").textContent = `Year Level: ${player.yearLevel}`);
        };

        // Helper to trigger all data fetches once PUUID is known
        const triggerDataFetches = (targetPuuid) => {
          PA.cache.currentPlayerId = player.userId;
          PA.cache.currentPuuid = targetPuuid;

          console.log(`[LOAD PLAYER] Triggering data fetches for PUUID: ${targetPuuid}`);

          // 1. FETCH RANKS (The missing call)
          fetchPlayerRanks(targetPuuid);

          // 2. FETCH WINRATE
          const currentRoleView = PA.state.currentRoleView || "primary";
          const selectedTeamPosition =
            currentRoleView === "secondary"
              ? (player.riotTeamPosition2 || player.riotTeamPosition1 || null)
              : (player.riotTeamPosition1 || null);

          fetchWinrate(targetPuuid, PA.state.currentQueueId, selectedTeamPosition)
            .catch((err) => console.error("[LOAD PLAYER] Error fetching winrate:", err));

          // 3. FETCH MATCHES
          fetchRecentMatchesFromDatabase(targetPuuid, PA.state.currentQueueId, selectedTeamPosition)
            .catch((err) => console.error("[LOAD PLAYER] Error fetching recent matches from database:", err));
        };

        if (!player.puuid) {
          return fetch(`/riot/puuid/${player.gameName}/${player.tagLine}`)
            .then((res) => res.json())
            .then((data) => {
              puuid = data.puuid;
              // update puuid in sql if null
              return updatePuuid(player.userId, puuid).catch(() => { });
            })
            .finally(() => {
              // Remove later
              const puuidEl2 = document.getElementById("puuid");
              if (puuidEl2) puuidEl2.textContent = `PUUID: ${puuid}`;

              applyPlayerToDOM();
              triggerDataFetches(puuid);

              // Cache the player and puuid for later reference
              PA.cache.currentPlayerId = player.userId;
              PA.cache.currentPuuid = puuid;

              // Fetch from database by default
              console.log(`[LOAD PLAYER] Loading cached match statistics from database for PUUID: ${puuid}, Queue: ${PA.state.currentQueueId}`);

              const currentRoleView = PA.state.currentRoleView || "primary";
              const selectedTeamPosition =
                currentRoleView === "secondary"
                  ? (player.riotTeamPosition2 || player.riotTeamPosition1 || null)
                  : (player.riotTeamPosition1 || null);

              fetchWinrate(puuid, PA.state.currentQueueId, selectedTeamPosition)
                .catch((err) => console.error("[LOAD PLAYER] Error fetching winrate:", err));

              fetchRecentMatchesFromDatabase(puuid, PA.state.currentQueueId, selectedTeamPosition)
                .catch((err) => console.error("[LOAD PLAYER] Error fetching recent matches from database:", err));
            });
        }

        applyPlayerToDOM();
        triggerDataFetches(puuid);

        // Cache the player and puuid for later reference
        PA.cache.currentPlayerId = player.userId;
        PA.cache.currentPuuid = puuid;

        // Fetch from database by default
        console.log(`[LOAD PLAYER] Loading cached match statistics from database for PUUID: ${puuid}, Queue: ${PA.state.currentQueueId}`);

        const currentRoleView = PA.state.currentRoleView || "primary";
        const selectedTeamPosition =
          currentRoleView === "secondary"
            ? (player.riotTeamPosition2 || player.riotTeamPosition1 || null)
            : (player.riotTeamPosition1 || null);

        fetchWinrate(puuid, PA.state.currentQueueId, selectedTeamPosition)
          .catch((err) => console.error("[LOAD PLAYER] Error fetching winrate:", err));

        fetchRecentMatchesFromDatabase(puuid, PA.state.currentQueueId, selectedTeamPosition)
          .catch((err) => console.error("[LOAD PLAYER] Error fetching recent matches from database:", err));

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
    fetchRecentMatchesFromDatabase,
    loadPlayer,
    updateWinrateDisplay,
    updateKDADisplay,
    updateChampionDisplay,
  };

  console.log("[BACKEND] PlayerAnalysis API initialized. Available methods:", Object.keys(PA.api));

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