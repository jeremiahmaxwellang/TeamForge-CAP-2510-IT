// player_analysis_comparison_overlay.js
// ONLY: DOM wiring + charts + calling backend module.
// Requires PlayerComparisonBackend loaded first.

// player_analysis_comparison_overlay.js

window.initComparisonTab = function () {
  const Backend = window.PlayerComparisonBackend;
  if (!Backend) {
    console.error("[COMPARISON] Backend module not loaded.");
    return;
  }

  let players = [];
  let selectedPlayer1 = null;
  let selectedPlayer2 = null;
  let player1Data = null;
  let player2Data = null;
  let activeComparisonRoleId = null;

  function populateSelects() {
    const p1Select = document.getElementById("player1-select");
    const p2Select = document.getElementById("player2-select");
    const player1Display = document.getElementById("player1-display"); // Fallback if no dropdown

    // 1. Get Current Player ID from Main Page (to auto-select Player 1)
    let mainPagePlayerId = window.currentPlayerId;
    if (!mainPagePlayerId && window.PlayerAnalysis && window.PlayerAnalysis.cache) {
      mainPagePlayerId = window.PlayerAnalysis.cache.currentPlayerId;
    }
    if (!mainPagePlayerId) {
      const btn = document.getElementById("player-dropdown-btn");
      mainPagePlayerId = btn ? btn.getAttribute("data-player-id") : null;
    }

    console.log("[COMPARISON] mainPagePlayerId:", mainPagePlayerId);

    // 2. Group Players by Role
    const playersByRole = {};
    players.forEach((player) => {
      // Use the displayedRole from your DB join, or fallback to 'Unassigned'
      const role = player.primaryRole || "Unassigned";
      if (!playersByRole[role]) {
        playersByRole[role] = [];
      }
      playersByRole[role].push(player);
    });

    // Sort roles nicely: Top -> Jungle -> Mid -> Bot -> Support
    const roleOrder = ["Top", "Jungle", "Mid", "Bot", "Support", "Unassigned"];
    const sortedRoles = Object.keys(playersByRole).sort((a, b) => {
      return roleOrder.indexOf(a) - roleOrder.indexOf(b);
    });

    // 3. Helper to build grouped options
    function buildGroupedOptions(targetSelect, includeCoach) {
      if (!targetSelect) return;
      targetSelect.innerHTML = '<option value="">Select a player...</option>';

      if (includeCoach) {
        const coachOpt = document.createElement("option");
        coachOpt.value = "coach-benchmark";
        coachOpt.textContent = "🏆 Coach Benchmark (Target)";
        targetSelect.appendChild(coachOpt);
      }

      sortedRoles.forEach((role) => {
        const group = document.createElement("optgroup");
        group.label = role.toUpperCase();

        playersByRole[role].forEach((player) => {
          const isSub = player.isSub === 'T'; // Check DB value for Sub
          const statusText = isSub ? '[SUB]' : '(Main)';
          const name = player.gameName ? `${player.gameName}#${player.tagLine}` : (player.summonerName || `Player ${player.userId}`);
          
          const option = document.createElement("option");
          option.value = player.userId || player.id;
          option.textContent = `${name} ${statusText}`;
          if (isSub) option.textContent += " 🔄"; // Add icon for subs

          group.appendChild(option);
        });
        targetSelect.appendChild(group);
      });
    }

    // 4. Populate Dropdowns
    buildGroupedOptions(p1Select, false);
    buildGroupedOptions(p2Select, true);

    // Auto-Select Player 2 as Coach Benchmark
    if (p2Select) {
        p2Select.value = "coach-benchmark";
        selectedPlayer2 = "coach-benchmark";
    }

    // 5. Auto-Select Player 1 based on context
    if (mainPagePlayerId) {
      selectedPlayer1 = parseInt(mainPagePlayerId, 10);
      
      // If Player 1 is a dropdown, select the value
      if (p1Select) p1Select.value = selectedPlayer1;

      // If Player 1 is just text, update the text
      const player1 = players.find(p => (p.userId || p.id) === selectedPlayer1);
      if (player1 && player1Display) {
        const player1Name = player1.gameName ? `${player1.gameName}#${player1.tagLine}` : player1.summonerName;
        player1Display.textContent = player1Name;
      }
      
      console.log("[COMPARISON] Player 1 auto-loaded from main page:", selectedPlayer1);
      loadPlayerData(selectedPlayer1, 1);
      
    } else if (p1Select && p1Select.options.length > 0) {
      // If no ID was passed, force-load the very first player on the list
      p1Select.selectedIndex = 0;
      selectedPlayer1 = parseInt(p1Select.value, 10);
      
      console.log("[COMPARISON] No main ID found. Defaulting to first dropdown player:", selectedPlayer1);
      loadPlayerData(selectedPlayer1, 1);
    }

    // 6. Attach Event Listeners
    if (p1Select) {
      p1Select.addEventListener("change", (e) => {
        selectedPlayer1 = parseInt(e.target.value, 10);
        if (selectedPlayer1) loadPlayerData(selectedPlayer1, 1);
      });
    }

    if (p2Select) {
      p2Select.addEventListener("change", (e) => {
        const val = e.target.value;
        selectedPlayer2 = val;
        if (val === "coach-benchmark") loadCoachBenchmark();
        else if (val) loadPlayerData(parseInt(val, 10), 2);
      });
    }
  }

  function updatePlayerCard(player, playerNumber) {
    const prefix = playerNumber === 1 ? "player1" : "player2";
    const nameEl = document.getElementById(`name-${prefix}`);
    const rankEl = document.getElementById(`rank-${prefix}`);

    // Helper to extract role name
    const getRoleStr = (id) => ({1:'Top', 2:'Jungle', 3:'Mid', 4:'ADC', 5:'Support'})[id] || 'Flex';
    
    // Determine the currently active role for this specific player card
    let activeRoleStr;
    if (playerNumber === 1 && activeComparisonRoleId) {
        activeRoleStr = getRoleStr(activeComparisonRoleId);
    } else {
        activeRoleStr = player.primaryRole || getRoleStr(player.primaryRoleId);
    }
    
    const nameStr = player.gameName ? `${player.gameName}#${player.tagLine}` : (player.summonerName || `Player ${player.userId ?? player.id}`);

    if (nameEl) {
        // Add the active role text in green next to the player's name
        nameEl.innerHTML = `${nameStr} <span style="color:#1f77b4; font-size: 0.85em; margin-left: 5px;">(${activeRoleStr})</span>`;

        // INJECT ROLE TOGGLES FOR PLAYER 1 IN THE OVERLAY
        if (playerNumber === 1) {
            let toggleContainer = document.getElementById('overlay-role-toggles');
            if (!toggleContainer) {
                toggleContainer = document.createElement('div');
                toggleContainer.id = 'overlay-role-toggles';
                toggleContainer.style.display = 'flex';
                toggleContainer.style.gap = '10px';
                toggleContainer.style.marginTop = '10px';
                toggleContainer.style.justifyContent = 'center';
                nameEl.parentNode.insertBefore(toggleContainer, nameEl.nextSibling); // Insert under the name
            }

            const pRoleName = getRoleStr(player.primaryRoleId);
            const sRoleName = player.secondaryRoleId ? getRoleStr(player.secondaryRoleId) : 'None';
            const isPrimaryActive = (!activeComparisonRoleId || activeComparisonRoleId === player.primaryRoleId);

            // Draw the buttons
            toggleContainer.innerHTML = `
                <style>
                    /* --- Base Button Styles --- */
                    .overlay-role-btn {
                        background-color: #2a2d33; /* Dark grey base */
                        color: #ffffff; /* Forced white text for visibility */
                        border: 1px solid #444444; /* Dark border */
                        padding: 7px 15px; 
                        border-radius: 6px; 
                        cursor: pointer; 
                        font-size: 13px; 
                        transition: all 0.2s ease-in-out; 
                        flex: 1; 
                        font-weight: bold;
                        text-align: center;
                        outline: none; /* Remove blue outline on click */
                    }

                    /* --- Hover State --- */
                    .overlay-role-btn:hover:not(.active):not(:disabled) {
                        background-color: #3a3e44; /* Lighter grey on hover */
                        border-color: #666666;
                    }

                    /* --- Active/Selected State (Light Blue) --- */
                    .overlay-role-btn.active {
                        background-color: #007bff; /* Clear Light Blue */
                        color: #ffffff; /* White text on blue for high contrast */
                        border-color: #007bff;
                        box-shadow: 0 0 10px rgba(0, 123, 255, 0.4); /* Subtle glow */
                    }

                    /* --- Disabled State (e.g., No Secondary Role) --- */
                    .overlay-role-btn:disabled {
                        opacity: 0.3; 
                        cursor: not-allowed;
                        background-color: #1a1c20;
                        color: #666666;
                        border-color: #333333;
                    }
                </style>
                <button id="overlay-btn-primary" class="overlay-role-btn ${isPrimaryActive ? 'active' : ''}">
                    Primary: <b>${pRoleName}</b>
                </button>
                <button id="overlay-btn-secondary" class="overlay-role-btn ${!isPrimaryActive ? 'active' : ''}" ${!player.secondaryRoleId ? 'disabled' : ''}>
                    Secondary: <b>${sRoleName}</b>
                </button>
            `;

            // Attach listeners to instantly trigger a reload on click
            document.getElementById('overlay-btn-primary').addEventListener('click', () => {
                if (activeComparisonRoleId === player.primaryRoleId) return;
                activeComparisonRoleId = player.primaryRoleId;
                loadPlayerData(player.userId || player.id, 1, activeComparisonRoleId);
            });

            document.getElementById('overlay-btn-secondary').addEventListener('click', () => {
                if (!player.secondaryRoleId || activeComparisonRoleId === player.secondaryRoleId) return;
                activeComparisonRoleId = player.secondaryRoleId;
                loadPlayerData(player.userId || player.id, 1, activeComparisonRoleId);
            });
        }
    }
    
    if (rankEl) rankEl.textContent = player.tier ? `${player.tier} ${player.rank}` : "Unranked";

    const pfpEl = document.getElementById(`pfp-${prefix}`);
    if (pfpEl && player.profilePhoto) {
      pfpEl.src = player.profilePhoto;
    }
  }

  function loadPlayerData(playerId, playerNumber, forceRoleId = null) {
    if (!playerId) return; // Safety check

    Backend.fetchPlayer(playerId)
      .then((player) => {
        if (playerNumber === 1) {
          player1Data = player;
          // Set active role, defaulting to 1 (Top) if the player has no assigned role
          activeComparisonRoleId = forceRoleId || player.primaryRoleId || 1; 
          updatePlayerCard(player, 1);
        } else {
          player2Data = player;
          updatePlayerCard(player, 2);
        }

        const roleToFetch = (playerNumber === 1) ? activeComparisonRoleId : (player.primaryRoleId || 1);
        const actualPlayerId = player.userId || player.id || playerId; // Bulletproof ID extraction

        if (actualPlayerId && roleToFetch) {
          return Backend.calculateAndFetchStats(actualPlayerId, roleToFetch).then((stats) => {
            if (!stats) return;

            if (playerNumber === 1) {
                player1Data.stats = stats;
                // If Player 2 is Coach Benchmark, chain the fetch
                if (selectedPlayer2 === "coach-benchmark") {
                    loadCoachBenchmark();
                } else if (player1Data?.stats && player2Data?.stats) {
                    updateComparison();
                }
            } else {
                player2Data.stats = stats;
                if (player1Data?.stats && player2Data?.stats) updateComparison();
            }
          });
        }
      })
      .catch((err) => console.error(`[COMPARISON] Error loading player ${playerId}:`, err));
  }

  function loadCoachBenchmark() {
    if (!player1Data) {
      console.error("[COMPARISON] Player 1 must be selected first to load coach benchmark.");
      return;
    }

    // Use activeComparisonRoleId so it respects the Primary/Secondary toggle buttons
    const roleId = activeComparisonRoleId || player1Data.primaryRoleId || 1;
    console.log("[COMPARISON] Loading coach benchmark for role:", roleId);

    Backend.fetchRoleBenchmarks(roleId)
      .then((response) => {
        // Safely extract the array whether it's raw or wrapped in an API response object
        const benchmarksArray = Array.isArray(response) ? response : (response.benchmarks || response.data || []);

        const coachBenchmarkData = {
          id: "coach-benchmark",
          summonerName: "Expected Stats",
          tier: "Coach",
          rank: "Benchmark",
          userId: null,
          primaryRoleId: roleId,
          stats: Backend.formatBenchmarksAsStats(benchmarksArray) // Pass the extracted array!
        };

        player2Data = coachBenchmarkData;
        updatePlayerCard(coachBenchmarkData, 2);

        if (player1Data?.stats) updateComparison();
      })
      .catch((err) => console.error("[COMPARISON] Error loading coach benchmark:", err));
  }
  
  function calculateSkillRatings(playerData) {
    const stats = playerData.stats || {};
    const kda = Number(stats.kdaRatio) || 0;
    const avgDamage = Number(stats.avgDamage) || 0;
    const mitigated = Number(stats.totalDamageMitigated) || 0;
    const avgGold = Number(stats.avgGold) || 0;
    const winrate = Number(stats.winrate) || 0;

    return {
      kdaScore: Math.min(kda * 1.5, 10),
      damageScore: Math.min((avgDamage / 400) * 10, 10),
      tankScore: Math.min((mitigated / 100000) * 10, 10),
      goldScore: Math.min((avgGold / 350) * 10, 10),
      consistencyScore: winrate / 10,
    };
  }

// --- ROLE SPECIFIC CONFIGURATION (Dynamic DB Scales) ---
  const ROLE_CONFIGS = {
    1: { axes: [{ id: "KDA", label: "KDA" }, { id: "CS Per Minute", label: "CS/Min" }, { id: "Damage Share", label: "Dmg Share%" }, { id: "Total Damage Taken", label: "Tanking" }, { id: "Solo Kills", label: "Solo Kills" }] },
    2: { axes: [{ id: "KDA", label: "KDA" }, { id: "Kill Participation", label: "KP%" }, { id: "Dragon Kills", label: "Dragons" }, { id: "Vision Score Per Minute", label: "Vision/Min" }, { id: "Gold Per Minute", label: "Gold/Min" }] },
    3: { axes: [{ id: "KDA", label: "KDA" }, { id: "CS Per Minute", label: "CS/Min" }, { id: "Damage Share", label: "Dmg Share%" }, { id: "Kill Participation", label: "KP%" }, { id: "Solo Kills", label: "Solo Kills" }] },
    4: { axes: [{ id: "KDA", label: "KDA" }, { id: "CS Per Minute", label: "CS/Min" }, { id: "Damage Share", label: "Dmg Share%" }, { id: "Gold Per Minute", label: "Gold/Min" }, { id: "Total Damage Dealt", label: "Total Dmg" }] },
    5: { axes: [{ id: "KDA", label: "KDA" }, { id: "Kill Participation", label: "KP%" }, { id: "Vision Score Per Minute", label: "Vision/Min" }, { id: "Total Wards Placed", label: "Wards Placed" }, { id: "Total Wards Destroyed", label: "Wards Clear" }] },
    default: { axes: [{ id: "KDA", label: "KDA" }, { id: "CS Per Minute", label: "CS/Min" }, { id: "Gold Per Minute", label: "Gold/Min" }, { id: "Kill Participation", label: "KP%" }, { id: "Damage Share", label: "Dmg Share%" }] }
  };

  const FALLBACK_SCALES = {
    "KDA": 8, "CS Per Minute": 9, "Damage Share": 35, "Total Damage Taken": 40000, 
    "Solo Kills": 3, "Kill Participation": 75, "Dragon Kills": 3, 
    "Vision Score Per Minute": 3.5, "Gold Per Minute": 500, "Total Damage Dealt": 30000,
    "Total Wards Placed": 45, "Total Wards Destroyed": 15
  };

  function calculateRadarScore(playerValue, statId, benchmarks) {
    if (!benchmarks) benchmarks = [];
    const normalizedId = statId.toLowerCase().replace(/\s/g, '');
    const dbMatch = benchmarks.find(b => b.metricName.toLowerCase().includes(normalizedId));
    
    let maxScale;
    if (dbMatch && Number(dbMatch.benchmarkValue) > 0) {
        maxScale = Number(dbMatch.benchmarkValue) * 1.25; 
    } else {
        maxScale = FALLBACK_SCALES[statId] || 10;
    }
    return Math.min((Number(playerValue) / maxScale) * 10, 10);
  }

  function updateComparison() {
    console.log("[COMPARISON] Drawing chart and table...");
    if (!player1Data?.stats || !player2Data?.stats) {
        console.warn("[COMPARISON] Missing stats for one or both players. Aborting draw.");
        return;
    }
    
    try {
        updateRadarChart();
        updateStatsTable();
    } catch (err) {
        console.error("[COMPARISON] Error drawing visuals:", err);
    }
  }

  function updateRadarChart() {
    const chartContainer = document.getElementById("chart-container");
    if (!chartContainer || !player1Data?.stats || !player2Data?.stats) return;

    const roleId = activeComparisonRoleId || player1Data.primaryRoleId || 1;
    const config = ROLE_CONFIGS[roleId] || ROLE_CONFIGS.default;

    // Use Player 1's benchmarks to scale the chart contextually
    const benchmarksToUse = player1Data.stats.benchmarkComparison || [];

    const chartData = [
      { 
        className: "Player1", 
        axes: config.axes.map(a => ({ 
            axis: a.label, 
            value: calculateRadarScore(player1Data.stats.rawStats[a.id] || 0, a.id, benchmarksToUse) 
        })) 
      },
      { 
        className: "Player2", 
        axes: config.axes.map(a => ({ 
            axis: a.label, 
            value: calculateRadarScore(player2Data.stats.rawStats[a.id] || 0, a.id, benchmarksToUse) 
        })) 
      }
    ];

    chartContainer.innerHTML = "";
    RadarChart.defaultConfig.w = 400;
    RadarChart.defaultConfig.h = 400;
    RadarChart.defaultConfig.maxValue = 10;
    RadarChart.draw("#chart-container", chartData);
  }

  function updateStatsTable() {
    const statsContainer = document.getElementById("stats-list");
    if (!statsContainer || !player1Data?.stats || !player2Data?.stats) return;

    const roleId = activeComparisonRoleId || player1Data.primaryRoleId || 1;
    const config = ROLE_CONFIGS[roleId] || ROLE_CONFIGS.default;

    const getRoleStr = (id) => ({1:'Top', 2:'Jungle', 3:'Mid', 4:'ADC', 5:'Support'})[id] || 'Flex';
    
    const p1Name = player1Data.gameName ? `${player1Data.gameName}#${player1Data.tagLine}` : (player1Data.summonerName || 'Player 1');
    const p2Name = player2Data.gameName ? `${player2Data.gameName}#${player2Data.tagLine}` : (player2Data.summonerName || 'Player 2');
    
    const p1Role = activeComparisonRoleId ? getRoleStr(activeComparisonRoleId) : (player1Data.primaryRole || getRoleStr(player1Data.primaryRoleId));
    const p2Role = player2Data.primaryRole || getRoleStr(player2Data.primaryRoleId) || 'Benchmark';

    // 1. Core Good Stats (Always present)
    const coreGood = [
        { id: "Kills", label: "Kills" },
        { id: "Assists", label: "Assists" },
        { id: "KDA", label: "KDA" },
        { id: "CS Per Minute", label: "CS/Min" },
        { id: "Gold Per Minute", label: "Gold/Min" }
    ];

    // Add Role-Specific Stats to Good Stats (if not already there)
    config.axes.forEach(a => {
        if (!coreGood.find(g => g.id === a.id) && a.id !== "Deaths") {
            coreGood.push(a);
        }
    });

    // 2. Bad Stats (Lower is Better)
    const coreBad = [
        { id: "Deaths", label: "Deaths" }
    ];

    // Helper to safely grab stats (Handles differences between Riot API naming and DB Benchmark naming)
    const getStat = (statsObj, id) => {
        if (!statsObj || !statsObj.rawStats) return 0;
        if (statsObj.rawStats[id] !== undefined) return Number(statsObj.rawStats[id]);
        
        // Fallback search
        const altId1 = "average" + id.replace(/[^a-zA-Z0-9]/g, '');
        const altId2 = id.replace(/[^a-zA-Z0-9]/g, '');
        for (let key in statsObj.rawStats) {
            const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (cleanKey === altId1.toLowerCase() || cleanKey === altId2.toLowerCase()) {
                return Number(statsObj.rawStats[key]);
            }
        }
        return 0;
    };

    // Helper to format numbers with commas (e.g. 30000 -> 30,000)
    const formatNum = (num) => Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });

    let html = `
      <table class="comparison-table" style="width: 100%; text-align: center; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #ddd;">
            <th style="padding: 10px; width: 33%; font-size: 16px;">${p1Name} <span style="color: #1f77b4; font-size: 14px;">(${p1Role})</span></th>
            <th style="padding: 10px; width: 34%;">Metric</th>
            <th style="padding: 10px; width: 33%; font-size: 16px;">${p2Name} <span style="color: #1f77b4; font-size: 14px;">(${p2Role})</span></th>
          </tr>
        </thead>
        <tbody>
    `;

    // === TOP HALF: POSITIVE INDICATORS (Higher is Better) ===
    html += `<tr><td colspan="3" style="padding: 8px; background: rgba(76, 175, 80, 0.1); color: #4CAF50; font-weight: bold; font-size: 13px; text-transform: uppercase;">Positive Indicators (Higher is Better)</td></tr>`;

    coreGood.forEach(m => {
      const val1 = getStat(player1Data.stats, m.id);
      const val2 = getStat(player2Data.stats, m.id);

      let p1Style = "padding: 8px;";
      let p2Style = "padding: 8px;";
      
      if (val1 > val2) {
          p1Style += " color: #4CAF50; font-weight: bold;"; // Green Winner
          p2Style += " color: #f44336; font-weight: bold;"; // Red Loser
      } else if (val2 > val1) {
          p2Style += " color: #4CAF50; font-weight: bold;"; // Green Winner
          p1Style += " color: #f44336; font-weight: bold;"; // Red Loser
      }

      html += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="${p1Style}">${formatNum(val1)}</td>
          <td style="padding: 8px; font-weight: bold; background-color: #f9f9f9; color: #333;">${m.label}</td>
          <td style="${p2Style}">${formatNum(val2)}</td>
        </tr>
      `;
    });

    // === BOTTOM HALF: NEGATIVE INDICATORS (Lower is Better) ===
    html += `<tr><td colspan="3" style="padding: 8px; background: rgba(244, 67, 54, 0.1); color: #f44336; font-weight: bold; font-size: 13px; text-transform: uppercase; border-top: 2px solid #ddd;">Negative Indicators (Lower is Better)</td></tr>`;

    coreBad.forEach(m => {
      const val1 = getStat(player1Data.stats, m.id);
      const val2 = getStat(player2Data.stats, m.id);

      let p1Style = "padding: 8px;";
      let p2Style = "padding: 8px;";
      
      // Lower is now green (good), Higher is red (bad)
      if (val1 < val2) {
          p1Style += " color: #4CAF50; font-weight: bold;"; // Green Winner (Lower)
          p2Style += " color: #f44336; font-weight: bold;"; // Red Loser (Higher)
      } else if (val2 < val1) {
          p2Style += " color: #4CAF50; font-weight: bold;"; // Green Winner (Lower)
          p1Style += " color: #f44336; font-weight: bold;"; // Red Loser (Higher)
      }

      html += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="${p1Style}">${formatNum(val1)}</td>
          <td style="padding: 8px; font-weight: bold; background-color: #f9f9f9; color: #333;">${m.label}</td>
          <td style="${p2Style}">${formatNum(val2)}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    statsContainer.innerHTML = html;
  }
  
  function updateComparison() {
    updateRadarChart();
    if (typeof updateStatsTable === "function") updateStatsTable();
  }

  function checkAndUpdatePlayer1() {
    // Get the current player ID from the main page dropdown button
    const btn = document.getElementById("player-dropdown-btn");
    let currentPlayerId = null;

    if (btn) {
      currentPlayerId = btn.getAttribute("data-player-id");
    }

    // Check if it's different from the currently selected player 1
    if (currentPlayerId && parseInt(currentPlayerId, 10) !== selectedPlayer1) {
      console.log("[COMPARISON] Player selection changed, updating Player 1 to:", currentPlayerId);
      selectedPlayer1 = parseInt(currentPlayerId, 10);
      
      // Find and display the player
      const player1 = players.find(p => (p.userId || p.id) === selectedPlayer1);
      const player1Display = document.getElementById("player1-display");
      
      if (player1 && player1Display) {
        const player1Name = player1.gameName || `Player ${selectedPlayer1}`;
        player1Display.textContent = player1Name;
      }
      
      // Load the new player's data
      loadPlayerData(selectedPlayer1, 1);
    }
  }

  function setupPlayerChangeListener() {
    const btn = document.getElementById("player-dropdown-btn");
    if (!btn) {
      console.log("[COMPARISON] Player dropdown button not found");
      return;
    }

    // Use MutationObserver to watch for changes to data-player-id attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-player-id") {
          console.log("[COMPARISON] Detected player ID change");
          checkAndUpdatePlayer1();
        }
      });
    });

    // Start observing the button for attribute changes
    observer.observe(btn, { attributes: true, attributeFilter: ["data-player-id"] });
    console.log("[COMPARISON] Player change listener setup complete");
  }

  // Entry point 
  Backend.initializeBenchmarks()
    .then(() => Backend.fetchPlayersList())
    .catch(() => Backend.fetchPlayersList())
    .then((data) => {
      players = data || [];
      populateSelects();
      // Set up listener for player changes on main page
      setupPlayerChangeListener();

      // --- Force the initial chart draw ---
      const p1Select = document.getElementById("player1-select");
      if (p1Select && !selectedPlayer1) {
          selectedPlayer1 = p1Select.value;
      }
      
      if (selectedPlayer1) {
          loadPlayerData(selectedPlayer1, 1);
      }
    })
    .catch((err) => console.error("[COMPARISON] Error loading players:", err));
};