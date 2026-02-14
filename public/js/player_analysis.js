document.addEventListener('DOMContentLoaded', function() {

    // Helper for updating puuid in sql
    function updatePuuid(userId, puuid) {
        console.log(`[UPDATE PUUID] Updating PUUID for user ${userId}: ${puuid}`);
        fetch(`/player_analysis/players/${userId}/puuid`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puuid })
        })
            .then(res => res.json())
            .then(data => {
                console.log(`[UPDATE PUUID] ✓ Successfully updated PUUID:`, data);
            })
            .catch(err => console.error(`[UPDATE PUUID] ✗ Error updating PUUID:`, err));
    }

    function fetchWinrate(puuid) {
        console.log(`[FRONTEND] Requesting winrate for PUUID: ${puuid}`);
        
        fetch(`/riot/winrate/${puuid}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log(`[FRONTEND] ✓ Winrate Data Received:`, data);

                // Target the specific class from player_overview.html
                const percentWinEl = document.querySelector(".percentWin");
                const totalGamesEl = document.querySelector(".totalGames");

                if (percentWinEl) {
                    // data.winrate comes from riotApiController.js
                    percentWinEl.textContent = `${data.winrate}% WR`;
                }

                if (totalGamesEl) {
                    // Displays the breakdown (e.g., "Last 15 Games (8W - 7L)")
                    totalGamesEl.textContent = `Last ${data.total} Games (${data.wins}W - ${data.losses}L)`;
                }

                // Combine this logic with the rest of the code
                const winrateContainer = document.querySelector(".winrate");
                console.log(`[FRONTEND] Targeting winrate container:`, winrateContainer);

                if (winrateContainer) {
                    // Dynamically update the gradient for the ::before pseudo-element
                    const winrate = data.winrate;
                    const styleId = 'winrate-gradient-style';
                    
                    // Remove old style if it exists
                    let styleElement = document.getElementById(styleId);
                    if (styleElement) {
                        styleElement.remove();
                    }
                    
                    // Create new style with the current winrate gradient
                    styleElement = document.createElement('style');
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
            })
            .catch(err => console.error("[FRONTEND] ✗ Error fetching winrate:", err));
    }

    // Load one player’s details into overlay
    function loadPlayer(playerId) {
        console.log(`[LOAD PLAYER] Loading player: ${playerId}`);
        fetch(`/player_analysis/players/${playerId}`)
            .then(res => res.json())
            .then(player => {
                console.log(`[LOAD PLAYER] ✓ Loaded player data:`, player);

                // Remove later
                document.getElementById("puuid").textContent = `PUUID: ${player.puuid}`;

                // RIOT API: Fetch PUUID of Selected Player
                // riot/puuid route found in routes/riotApiRoutes
                let puuid = player.puuid || "";

                if(!player.puuid){
                    console.log(`[LOAD PLAYER] PUUID not found, fetching from Riot API: ${player.gameName}#${player.tagLine}`);
                    fetch(`/riot/puuid/${player.gameName}/${player.tagLine}`)
                        .then(res => res.json())
                        .then(data => {
                        console.log(`[LOAD PLAYER] ✓ Retrieved PUUID from Riot API:`, data.puuid);
                        return data; // pass data forward
                        })
                        .then(data => {
                            puuid = data.puuid;
                            console.log(`[LOAD PLAYER] Stored PUUID:`, puuid);

                            // update puuid in sql if null
                            updatePuuid(player.userId, puuid);

                            // Remove later
                            document.getElementById("puuid").textContent = `PUUID: ${puuid}`;

                            // Fetch recent matches after PUUID is retrieved
                            console.log(`[LOAD PLAYER] Initiating match fetch with PUUID: ${puuid}`);
                            fetchRecentMatches(puuid, 420); // 420 = Ranked Solo/Duo

                            fetchWinrate(puuid);
                        })
                        .catch(err => console.error(`[LOAD PLAYER] ✗ Error fetching PUUID:`, err));
                } else {
                    // PUUID already exists, fetch recent matches
                    console.log(`[LOAD PLAYER] PUUID exists: ${puuid}, fetching matches...`);
                    fetchRecentMatches(puuid, 420); // 420 = Ranked Solo/Duo
                    
                    fetchWinrate(puuid);
                }
                

                    const btn = document.getElementById("player-dropdown-btn");
                    btn.textContent = `${player.gameName}#${player.tagLine} (${player.primaryRole})`;
                    btn.setAttribute("data-player-id", player.userId);
                    btn.setAttribute("data-puuid", puuid);

                    document.getElementById("primaryRole").textContent = `Primary Role: ${player.primaryRole}`;
                    document.getElementById("secondaryRole").textContent = `Secondary Role: ${player.secondaryRole}`;

                    document.getElementById("email").textContent = `Email: ${player.email}`;
                    document.getElementById("discord").textContent = `Discord: ${player.discord}`;

                    document.getElementById("schoolId").textContent = `School ID: ${player.schoolId}`;
                    document.getElementById("course").textContent = `Course: ${player.course}`;
                    document.getElementById("year").textContent = `Year Level: ${player.yearLevel}`;

            })
            .catch(err => console.error(`[LOAD PLAYER] ✗ Error loading player data:`, err));
    }

  // Fetch all players and populate dropdown
  fetch('/player_analysis/players')
      .then(res => res.json())
      .then(players => {
          console.log("Players list:", players);
          const dropdownMenu = document.querySelector(".player-dropdown-menu");
          dropdownMenu.innerHTML = ""; // clear existing

          players.forEach(player => {
              const link = document.createElement("a");
              link.href = "#";
              link.textContent = `${player.gameName} (${player.primaryRole})`;
              link.addEventListener("click", () => loadPlayer(player.userId));
              dropdownMenu.appendChild(link);
          });

        //   //auto load first player if none 
            if(players.length > 0){
                loadPlayer(players[0].userId);
            }
      })
      .catch(err => console.error("[LOAD PLAYERS] ✗ Error loading player list:", err));

    // Fetch recent matches for a player by PUUID and queue ID
    function fetchRecentMatches(puuid, queueId) {
        console.log(`[FETCH MATCHES] Starting fetch for PUUID: ${puuid}, Queue: ${queueId}`);
        return fetch(`/riot/matches/${puuid}/${queueId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (!data.matches || !Array.isArray(data.matches)) {
                    throw new Error('Invalid response: matches array not found');
                }
                console.log(`[FETCH MATCHES] ✓ Retrieved ${data.matches.length} match IDs`);

                // Fetch details for each match ID
                const matchDetailsPromises = data.matches.map((matchId, index) => {
                    return fetchMatchDetails(matchId);
                });
                return Promise.all(matchDetailsPromises);
            })
            .then(matchesData => {
                console.log(`[FETCH MATCHES] ✓ Successfully fetched details for ${matchesData.length} matches`);
                
                // Calculate and display average KDA
                const kdaStats = calculateAverageKDA(matchesData, puuid);
                updateKDADisplay(kdaStats);
                
                // Extract and display top 3 champions
                const topChampions = getTop3Champions(matchesData, puuid);
                updateChampionDisplay(topChampions);
                
                // Store all fetched match details to database
                const currentPlayerId = document.getElementById("player-dropdown-btn").getAttribute("data-player-id");
                if (currentPlayerId && matchesData.length > 0) {
                    console.log(`[FETCH MATCHES] Initiating database storage for player: ${currentPlayerId}`);
                    storeMatchesToDatabase(currentPlayerId, matchesData);
                }
                return matchesData;
            })
            .catch(err => console.error("[FETCH MATCHES] ✗ Error fetching recent matches:", err));
    }

    function fetchMatchDetails(matchId) {
        return fetch(`/riot/match/${matchId}`)
            .then(res => res.json())
            .then(data => {
                return data.matchDetails;
            })
            .catch(err => {
                console.error(`[FETCH DETAILS] ✗ Error fetching match details for ${matchId}:`, err);
                throw err;
            });
    }

    // Calculate average KDA from match data for the selected player
    function calculateAverageKDA(matchesData, puuid) {
        console.log(`[CALC KDA] Calculating average KDA for PUUID: ${puuid} from ${matchesData.length} matches`);
        
        let totalKills = 0;
        let totalDeaths = 0;
        let totalAssists = 0;
        let validMatches = 0;

        matchesData.forEach((match, index) => {
            // Find the participant with matching PUUID
            if (match.info && match.info.participants) {
                const playerParticipant = match.info.participants.find(p => p.puuid === puuid);
                
                if (playerParticipant) {
                    totalKills += playerParticipant.kills || 0;
                    totalDeaths += playerParticipant.deaths || 0;
                    totalAssists += playerParticipant.assists || 0;
                    validMatches++;
                    console.log(`[CALC KDA] Match ${index + 1}: ${playerParticipant.kills}/${playerParticipant.deaths}/${playerParticipant.assists}`);
                }
            }
        });

        console.log(`[CALC KDA] Total from ${validMatches} matches: ${totalKills}K / ${totalDeaths}D / ${totalAssists}A`);

        // Calculate average stats
        const avgKills = validMatches > 0 ? (totalKills / validMatches).toFixed(2) : 0;
        const avgDeaths = validMatches > 0 ? (totalDeaths / validMatches).toFixed(2) : 0;
        const avgAssists = validMatches > 0 ? (totalAssists / validMatches).toFixed(2) : 0;
        
        // Calculate KDA ratio
        const kdaRatio = validMatches > 0 ? ((totalKills + totalAssists) / (totalDeaths || 1)).toFixed(2) : 0;

        console.log(`[CALC KDA] Averages: ${avgKills}/${avgDeaths}/${avgAssists}, KDA Ratio: ${kdaRatio}`);

        return {
            kdaRatio,
            avgKills,
            avgDeaths,
            avgAssists
        };
    }

    // Update KDA display in player_overview
    function updateKDADisplay(kdaStats) {
        console.log(`[UPDATE KDA] Looking for KDA elements...`);
        const averageKDAEl = document.querySelector("#averageKDA");
        const summarizedKDAEl = document.querySelector("#summarizedKDA");

        console.log(`[UPDATE KDA] averageKDAEl found:`, averageKDAEl);
        console.log(`[UPDATE KDA] summarizedKDAEl found:`, summarizedKDAEl);

        if (averageKDAEl) {
            averageKDAEl.textContent = `${kdaStats.kdaRatio} KDA`;
            console.log(`[UPDATE KDA] ✓ Updated averageKDA to: ${kdaStats.kdaRatio} KDA`);
        } else {
            console.log(`[UPDATE KDA] ✗ averageKDAEl not found in DOM`);
        }

        if (summarizedKDAEl) {
            summarizedKDAEl.textContent = `${kdaStats.avgKills} / ${kdaStats.avgDeaths} / ${kdaStats.avgAssists}`;
            console.log(`[UPDATE KDA] ✓ Updated summarizedKDA to: ${kdaStats.avgKills} / ${kdaStats.avgDeaths} / ${kdaStats.avgAssists}`);
        } else {
            console.log(`[UPDATE KDA] ✗ summarizedKDAEl not found in DOM`);
        }
    }

    // Extract top 3 champions by games played
    function getTop3Champions(matchesData, puuid) {
        console.log(`[TOP 3 CHAMPS] Extracting top 3 champions from ${matchesData.length} matches`);
        
        const championStats = {};

        matchesData.forEach((match) => {
            if (match.info && match.info.participants) {
                const playerParticipant = match.info.participants.find(p => p.puuid === puuid);
                
                if (playerParticipant) {
                    const champName = playerParticipant.championName;
                    const isWin = playerParticipant.win;
                    const kills = playerParticipant.kills || 0;
                    const deaths = playerParticipant.deaths || 0;
                    const assists = playerParticipant.assists || 0;

                    if (!championStats[champName]) {
                        championStats[champName] = {
                            name: champName,
                            games: 0,
                            wins: 0,
                            losses: 0,
                            totalKills: 0,
                            totalDeaths: 0,
                            totalAssists: 0
                        };
                    }

                    championStats[champName].games += 1;
                    championStats[champName].wins += isWin ? 1 : 0;
                    championStats[champName].losses += isWin ? 0 : 1;
                    championStats[champName].totalKills += kills;
                    championStats[champName].totalDeaths += deaths;
                    championStats[champName].totalAssists += assists;
                }
            }
        });

        // Sort by games played and get top 3
        const sortedChamps = Object.values(championStats)
            .sort((a, b) => b.games - a.games)
            .slice(0, 3);

        console.log(`[TOP 3 CHAMPS] Top champions:`, sortedChamps);
        return sortedChamps;
    }

    // Update champion display with images and stats
    function updateChampionDisplay(topChampions) {
        console.log(`[UPDATE CHAMPS] Updating champion display for ${topChampions.length} champions`);
        
        topChampions.forEach((champ, index) => {
            const champId = `champion${index + 1}`;
            const champElement = document.getElementById(champId);
            
            if (champElement) {
                // Calculate average KDA for this champion
                const avgKills = (champ.totalKills / champ.games).toFixed(2);
                const avgDeaths = (champ.totalDeaths / champ.games).toFixed(2);
                const avgAssists = (champ.totalAssists / champ.games).toFixed(2);
                const kdaRatio = ((champ.totalKills + champ.totalAssists) / (champ.totalDeaths || 1)).toFixed(2);
                
                // Update image
                const img = champElement.querySelector('.champion-icon');
                if (img) {
                    img.src = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champ.name}.png`;
                    img.alt = `${champ.name}`;
                    console.log(`[UPDATE CHAMPS] Updated image for ${champ.name}`);
                }
                
                // Update stats
                const kdaElement = champElement.querySelector('.kda-1');
                const advKdaElement = champElement.querySelector('.kda-2');
                
                if (kdaElement) {
                    kdaElement.innerHTML = `${kdaRatio} KDA <span class="note">(${champ.wins}W ${champ.losses}L)</span>`;
                }
                
                if (advKdaElement) {
                    advKdaElement.textContent = `${avgKills} / ${avgDeaths} / ${avgAssists}`;
                }
                
                console.log(`[UPDATE CHAMPS] ✓ Updated ${champ.name} - ${kdaRatio} KDA (${champ.wins}W ${champ.losses}L)`);
            } else {
                console.log(`[UPDATE CHAMPS] ✗ ${champId} element not found`);
            }
        });
    }

    // Store match details to database in batches
    function storeMatchesToDatabase(userId, matchesData) {
        const validMatches = matchesData.filter(m => m && m.metadata && m.info);
        
        if (validMatches.length === 0) {
            console.log("[STORE] No valid matches to store");
            return;
        }

        // Send matches in batches of 5 to avoid payload size issues
        const batchSize = 5;
        const batches = [];
        for (let i = 0; i < validMatches.length; i += batchSize) {
            batches.push(validMatches.slice(i, i + batchSize));
        }

        // Return a promise that resolves when all batches (and their participant uploads) complete
        const batchPromises = batches.map((batch, batchIndex) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Store match details
                    fetch(`/riot/matches/${userId}/store-multiple`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ matches: batch })
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log(`[STORE] ✓ Match batch ${batchIndex + 1}/${batches.length} stored:`, data);

                            // After storing matches, store participants and resolve when done
                            storeMatchParticipantsBatch(batch)
                                .then(participantResult => resolve({ storeResult: data, participantResult }))
                                .catch(() => resolve({ storeResult: data }));
                        })
                        .catch(err => {
                            console.error(`[STORE] ✗ Error storing match batch ${batchIndex + 1}:`, err);
                            resolve({ error: err.message });
                        });
                }, batchIndex * 500); // Stagger requests by 500ms
            });
        });

        return Promise.all(batchPromises);
    }

    // Store match participants in batches
    function storeMatchParticipantsBatch(matchesData) {
        if (!matchesData || matchesData.length === 0) {
            console.log("[PARTICIPANTS] No matches to extract participants from");
            return Promise.resolve({ totalParticipants: 0, stored: 0 });
        }

        console.log(`[PARTICIPANTS] Preparing batch upload for ${matchesData.length} matches...`);

        // Format data for batch upload
        const batchData = matchesData.map(match => ({
            matchId: match.metadata.matchId,
            matchData: match
        }));

        // Send batch to server
        return fetch(`/riot/participants/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matches: batchData })
        })
            .then(res => res.json())
            .then(data => {
                // console.log(`[PARTICIPANTS] ✓ Batch upload complete:`, data);
                // console.log(`[PARTICIPANTS] Summary - Total: ${data.totalParticipants}, Stored: ${data.successfulParticipants}, Failed: ${data.failedParticipants}`);
                return data;
            })
            .catch(err => {
                console.error(`[PARTICIPANTS] ✗ Error uploading participants batch:`, err);
                return { error: err.message };
            });
    }

// ===================  OVERLAY BACKEND  ============================
    const overviewButton = document.getElementById('overviewButton');
    const comparisonButton = document.getElementById('comparisonButton');
    const vodsButton = document.getElementById('vodsButton');
    const championButton = document.getElementById('championButton');
    const evaluationButton = document.getElementById('evaluationButton');
    const overlayContainer = document.getElementById('overlay-container');
    const tabButtons = [overviewButton, comparisonButton, vodsButton, championButton, evaluationButton];

    function closeOverlay() {
        const overlay = overlayContainer.querySelector('.overlay');
        if (overlay) overlay.style.display = 'none';
    }

    function setActiveTab(activeButton) {
        // Remove active class from all tabs
        tabButtons.forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        // Add active class to the clicked tab
        activeButton.classList.add('active');
    }

    // Attach click handlers to all tab buttons
    if (overlayContainer) {
        tabButtons.forEach(button => {
            if (button) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    setActiveTab(this);

                    // Map buttons to their overlay URLs
                    const urlMap = {
                        'overviewButton': '/player_analysis/overview',
                        'comparisonButton': '/player_analysis/comparison',
                        'vodsButton': '/player_analysis/vods',
                        'championButton': '/player_analysis/champion',
                        'evaluationButton': '/player_analysis/evaluation'
                    };

                    const url = urlMap[this.id];
                    if (url) {
                        fetch(url)
                            .then(response => {
                                if (!response.ok) throw new Error('Network response was not ok');
                                return response.text();
                            })
                            .then(html => {
                                overlayContainer.innerHTML = html;

                                const overlay = overlayContainer.querySelector('.overlay');
                                if (overlay) {
                                    overlay.style.display = 'block';

                                    overlay.addEventListener('click', function(event) {
                                        if (event.target === this) closeOverlay();
                                    });

                                    const closeButton = overlayContainer.querySelector('.close-button');
                                    if (closeButton) closeButton.addEventListener('click', closeOverlay);
                                    
                                    // Refetch winrate and KDA for the Overview tab after overlay is loaded
                                    if (this.id === 'overviewButton') {
                                        const btn = document.getElementById("player-dropdown-btn");
                                        const puuid = btn.getAttribute("data-puuid");
                                        if (puuid) {
                                            console.log(`[OVERVIEW TAB] Fetching winrate and KDA after overlay load`);
                                            fetchWinrate(puuid);
                                            fetchRecentMatches(puuid, 420); // 420 = Ranked Solo/Duo
                                        }
                                    }
                                }
                            })
                            .catch(err => console.log('Error loading overlay:', err));
                    }
                });
            }
        });
    }
});