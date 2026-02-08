document.addEventListener('DOMContentLoaded', function() {

    // Helper for updating puuid in sql
    function updatePuuid(userId, puuid) {
        fetch(`/player_analysis/players/${userId}/puuid`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puuid })
        })
            .then(res => res.json())
            .then(data => console.log("Update response:", data))
            .catch(err => console.error("Error updating PUUID:", err));
    }

    // Load one player’s details into overlay
    function loadPlayer(playerId) {
        fetch(`/player_analysis/players/${playerId}`)
            .then(res => res.json())
            .then(player => {
                console.log("Fetched player:", player);

                // Remove later
                document.getElementById("puuid").textContent = `PUUID: ${player.puuid}`;

                // RIOT API: Fetch PUUID of Selected Player
                // riot/puuid route found in routes/riotApiRoutes
                let puuid = player.puuid || "";

                if(!player.puuid){
                    fetch(`/riot/puuid/${player.gameName}/${player.tagLine}`)
                        .then(res => res.json())
                        .then(data => {
                        // console.log("PUUID:", data.puuid);
                        return data; // pass data forward
                        })
                        .then(data => {
                            puuid = data.puuid;
                            console.log("Stored PUUID:", puuid);

                            // update puuid in sql if null
                            updatePuuid(player.userId, puuid);

                            // Remove later
                            document.getElementById("puuid").textContent = `PUUID: ${puuid}`;

                            // Fetch recent matches after PUUID is retrieved
                            fetchRecentMatches(puuid, 420); // 420 = Ranked Solo/Duo
                        })
                        .catch(err => console.error(err));
                } else {
                    // PUUID already exists, fetch recent matches
                    fetchRecentMatches(puuid, 420); // 420 = Ranked Solo/Duo
                    
                }
                

                    const btn = document.getElementById("player-dropdown-btn");
                    btn.textContent = `${player.gameName}#${player.tagLine} (${player.primaryRole})`;
                    btn.setAttribute("data-player-id", player.userId);

                    document.getElementById("primaryRole").textContent = `Primary Role: ${player.primaryRole}`;
                    document.getElementById("secondaryRole").textContent = `Secondary Role: ${player.secondaryRole}`;

                    document.getElementById("email").textContent = `Email: ${player.email}`;
                    document.getElementById("discord").textContent = `Discord: ${player.discord}`;

                    document.getElementById("schoolId").textContent = `School ID: ${player.schoolId}`;
                    document.getElementById("course").textContent = `Course: ${player.course}`;
                    document.getElementById("year").textContent = `Year Level: ${player.yearLevel}`;

            })
            .catch(err => console.error(err));
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
      .catch(err => console.error(err));

    // Fetch recent matches for a player by PUUID and queue ID
    function fetchRecentMatches(puuid, queueId) {
        return fetch(`/riot/matches/${puuid}/${queueId}`)
            .then(res => res.json())
            .then(data => {
                console.log("Recent matches:", data.matches);

                // Fetch details for each match ID
                const matchDetailsPromises = data.matches.map(matchId => fetchMatchDetails(matchId));
                return Promise.all(matchDetailsPromises);
            })
            .then(matchesData => {
                // Store all fetched match details to database
                const currentPlayerId = document.getElementById("player-dropdown-btn").getAttribute("data-player-id");
                if (currentPlayerId && matchesData.length > 0) {
                    storeMatchesToDatabase(currentPlayerId, matchesData);
                }
                return matchesData;
            })
            .catch(err => console.error("Error fetching recent matches:", err));
    }

    function fetchMatchDetails(matchId) {
        return fetch(`/riot/match/${matchId}`)
            .then(res => res.json())
            .then(data => {
                console.log("Match details for", matchId, ":", data);
                return data.matchDetails;
            })
            .catch(err => console.error("Error fetching match details:", err));
    }

    // Store match details to database in batches
    function storeMatchesToDatabase(userId, matchesData) {
        const validMatches = matchesData.filter(m => m && m.metadata && m.info);
        
        if (validMatches.length === 0) {
            console.log("No valid matches to store");
            return;
        }

        // Send matches in batches of 5 to avoid payload size issues
        const batchSize = 5;
        const batches = [];
        for (let i = 0; i < validMatches.length; i += batchSize) {
            batches.push(validMatches.slice(i, i + batchSize));
        }

        console.log(`Storing ${validMatches.length} matches in ${batches.length} batches...`);

        batches.forEach((batch, batchIndex) => {
            setTimeout(() => {
                fetch(`/riot/matches/${userId}/store-multiple`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ matches: batch })
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log(`Batch ${batchIndex + 1}/${batches.length} stored:`, data);
                    })
                    .catch(err => console.error(`Error storing batch ${batchIndex + 1}:`, err));
            }, batchIndex * 500); // Stagger requests by 500ms
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
                                }
                            })
                            .catch(err => console.log('Error loading overlay:', err));
                    }
                });
            }
        });
    }
});