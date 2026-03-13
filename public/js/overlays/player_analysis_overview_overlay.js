// player_analysis_overlay.js
// Only overlay/tab navigation and queue dropdown behavior lives here.

(function () {
  // Timer constants (1 minute in milliseconds)
  const FETCH_INTERVAL = 1 * 60 * 1000; // 1 minute
  let lastFetchTime = null;

  // Sample Function for Listing Match History
  // function renderMatches(matches) {
  //   const container = document.getElementById('match-list');

  //   matches.forEach(match => {
  //     // 1. Calculate Helpers
  //     const durationMin = Math.floor(match.gameDuration / 60);
  //     const durationSec = match.gameDuration % 60;
  //     const kdaRatio = ((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(2);
  //     const resultClass = match.win ? "win" : "loss";
  //     const resultText = match.win ? "Victory" : "Defeat";

  //     // 2. Create Card
  //     const card = document.createElement('div');
  //     card.className = `match-card ${resultClass}`;

  //     card.innerHTML = `
  //       <div class="game-info">
  //           <div class="queue-type">${match.queueType}</div>
  //           <div class="game-result">${resultText}</div>
  //           <div class="duration">${durationMin}m ${durationSec}s</div>
  //       </div>

  //       <div class="champ-info">
  //           <img src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${match.championName}.png" class="champ-icon" onerror="this.src='https://via.placeholder.com/50'">
  //           <div class="champ-name">${match.championName}</div>
  //       </div>

  //       <div class="kda-info">
  //           <div class="kda-score">${match.kills} / <span style="color:#e84057">${match.deaths}</span> / ${match.assists}</div>
  //           <div class="kda-ratio"><span>${kdaRatio}:1</span> KDA</div>
  //       </div>

  //       <div class="stats-info">
  //           <div class="stat-row">CS ${match.cs} (${(match.cs / durationMin).toFixed(1)})</div>
  //           <div class="stat-row">Gold ${match.gold.toLocaleString()}</div>
  //       </div>

  //       <div class="items-info">
  //           ${match.items.map(itemId => `
  //           <div class="item-box">
  //               ${itemId !== 0 ? `<img src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${itemId}.png">` : ''}
  //           </div>
  //           `).join('')}
  //       </div>
  //       `;

  //     container.appendChild(card);
  //   });
  // }

  // Fetch stored stats when tab loads
  async function loadStoredBenchmarks(userId, roleId) {
    if (!userId || !roleId) return;

    try {
      console.log(`[OVERLAY] Fetching stored comparison for Player ${userId}...`);
      const response = await fetch(`/player_analysis/stats/stored-comparison?userId=${userId}&roleId=${roleId}`);
      const data = await response.json();

      if (data.success) {
        console.log("[OVERLAY] ✅ Performance Score:", data.performanceScore);
        console.log("[OVERLAY] ✅ Stored Data:", data.comparison);

        // OPTIONAL: If you want to update the UI immediately, you can call a function here
        // e.g., if (window.updateComparisonUI) window.updateComparisonUI(data);
      } else {
        console.warn("[OVERLAY] No stored stats found:", data.message);
      }
    } catch (err) {
      console.error("[OVERLAY] Error loading stored stats:", err);
    }
  }

  function setupFetchMatchStatsButton(api, state) {
    const fetchBtn = document.getElementById("fetchMatchStatsBtn");
    const statusText = document.getElementById("timerInfo");
    const defaultTooltip = "Fetch Match Stats";

    if (!fetchBtn) {
      console.error("[FETCH BUTTON] Button not found in DOM");
      return;
    }

    if (statusText) {
      statusText.setAttribute("aria-live", "polite");
    }

    function setFetchStatus(message, color = "#666") {
      if (!statusText) return;
      statusText.textContent = message;
      statusText.style.color = color;
    }

    function formatCooldownLabel(timeRemainingMs) {
      const seconds = Math.ceil(timeRemainingMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    }

    function updateCooldownTooltip(timeRemainingMs) {
      if (timeRemainingMs > 0) {
        fetchBtn.title = `Available in ${formatCooldownLabel(timeRemainingMs)}`;
      } else {
        fetchBtn.title = defaultTooltip;
      }
    }

    fetchBtn.title = defaultTooltip;

    // Load last fetch time from localStorage
    const storedTime = localStorage.getItem("lastMatchStatsFetchTime");
    if (storedTime) {
      lastFetchTime = parseInt(storedTime, 10);
    }

    function updateButtonState() {
      const now = Date.now();
      const timeSinceLastFetch = lastFetchTime ? now - lastFetchTime : null;
      const timeRemaining = timeSinceLastFetch !== null ? FETCH_INTERVAL - timeSinceLastFetch : 0;

      if (lastFetchTime && timeRemaining > 0) {
        // Button is on cooldown
        fetchBtn.disabled = false;
        fetchBtn.style.opacity = "0.5";
        fetchBtn.style.cursor = "not-allowed";

        updateCooldownTooltip(timeRemaining);
      } else {
        // Button is enabled
        fetchBtn.disabled = false;
        fetchBtn.style.opacity = "1";
        fetchBtn.style.cursor = "pointer";
        updateCooldownTooltip(0);
      }
    }

    // Update button state immediately
    updateButtonState();

    // Update button state every second if it's disabled
    const updateInterval = setInterval(() => {
      updateButtonState();
      const now = Date.now();
      const timeSinceLastFetch = lastFetchTime ? now - lastFetchTime : null;
      if (!lastFetchTime || (timeSinceLastFetch && timeSinceLastFetch >= FETCH_INTERVAL)) {
        clearInterval(updateInterval);
      }
    }, 1000);

    fetchBtn.addEventListener("click", function (e) {
      e.preventDefault();

      const now = Date.now();
      const timeSinceLastFetch = lastFetchTime ? now - lastFetchTime : null;

      // Check if 1 minute has passed
      if (lastFetchTime && timeSinceLastFetch < FETCH_INTERVAL) {
        const timeRemaining = FETCH_INTERVAL - timeSinceLastFetch;
        console.error("Error: You can only fetch the match statistics once every 1 minute.");
        updateCooldownTooltip(timeRemaining);
        setFetchStatus(`Available in ${formatCooldownLabel(timeRemaining)}`, "#666");
        return;
      }

      // Proceed with fetch from Riot API
      console.log("[FETCH BUTTON] Fetching fresh match statistics from Riot API...");
      const btn = document.getElementById("player-dropdown-btn");
      const puuid = btn?.getAttribute("data-puuid");

      if (!puuid) {
        console.error("[FETCH BUTTON] No player PUUID found");
        setFetchStatus("Unable to fetch stats: missing player data.", "#dc3545");
        return;
      }

      // Update last fetch time
      lastFetchTime = Date.now();
      localStorage.setItem("lastMatchStatsFetchTime", lastFetchTime.toString());

      // Disable button and show timer
      updateButtonState();
      startButtonCooldown();
      setFetchStatus("Fetching match stats from Riot API...", "#007bff");

      // Fetch fresh data from Riot API (not from database)
      const primaryTeamPosition = btn?.getAttribute("data-primary-team-position");
      const secondaryTeamPosition = btn?.getAttribute("data-secondary-team-position");
      const selectedTeamPosition = state.currentRoleView === "secondary"
        ? (secondaryTeamPosition || primaryTeamPosition || null)
        : (primaryTeamPosition || null);

      api.fetchRecentMatches(puuid, state.currentQueueId, selectedTeamPosition)
        .then(() => {
          return api.fetchWinrate(puuid, state.currentQueueId, selectedTeamPosition);
        })
        .then(() => {
          if (document.querySelector("#overlay-container .winrate") && window.PlayerAnalysis?.cache?.winrateData) {
            requestAnimationFrame(() => api.updateWinrateDisplay(window.PlayerAnalysis.cache.winrateData));
          }
          setFetchStatus("Match stats updated.", "#28a745");
        })
        .catch((err) => {
          console.error("[FETCH BUTTON] Error fetching recent matches:", err);
          setFetchStatus("Failed to fetch match stats. Try again later.", "#dc3545");
        });
    });

    function startButtonCooldown() {
      let secondsLeft = Math.ceil(FETCH_INTERVAL / 1000);

      const countdownInterval = setInterval(() => {
        secondsLeft--;
        const minutes = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;

        if (secondsLeft > 0) {
          const timeLabel = `${minutes}m ${secs}s`;
          fetchBtn.disabled = false;
          fetchBtn.style.opacity = "0.5";
          fetchBtn.style.cursor = "not-allowed";
          fetchBtn.title = `Available in ${timeLabel}`;
        } else {
          clearInterval(countdownInterval);
          fetchBtn.disabled = false;
          fetchBtn.style.opacity = "1";
          fetchBtn.style.cursor = "pointer";
          fetchBtn.title = defaultTooltip;
        }
      }, 1000);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const PA = window.PlayerAnalysis;
    if (!PA || !PA.api || !PA.state) {
      console.error("[OVERLAY] PlayerAnalysis backend not loaded. Ensure backend script loads first.");
      return;
    }

    const { api, state } = PA;

    const overviewButton = document.getElementById("overviewButton");
    const comparisonButton = document.getElementById("comparisonButton");
    const scrimsButton = document.getElementById("scrimsButton");
    const championButton = document.getElementById("championButton");
    const summaryButton = document.getElementById("summaryButton");
    const overlayContainer = document.getElementById("overlay-container");

    const tabButtons = [overviewButton, comparisonButton, scrimsButton, championButton, summaryButton];

    // Auto-refresh overview winrate graph whenever backend computes new winrate data
    document.addEventListener("playeranalysis:winrate-updated", (event) => {
      const winrateEl = overlayContainer?.querySelector(".winrate");
      if (winrateEl && event?.detail) {
        requestAnimationFrame(() => api.updateWinrateDisplay(event.detail));
      }
    });

    function closeOverlay() {
      const overlay = overlayContainer?.querySelector(".overlay");
      if (overlay) overlay.style.display = "none";
    }

    function setActiveTab(activeButton) {
      tabButtons.forEach((btn) => btn && btn.classList.remove("active"));
      activeButton.classList.add("active");
    }

    function getSelectedTeamPosition() {
      const btn = document.getElementById("player-dropdown-btn");
      if (!btn) return null;

      const primaryTeamPosition = btn.getAttribute("data-primary-team-position");
      const secondaryTeamPosition = btn.getAttribute("data-secondary-team-position");

      if (state.currentRoleView === "secondary") {
        return secondaryTeamPosition || primaryTeamPosition || null;
      }

      return primaryTeamPosition || null;
    }

    function redrawWinrateFromCache() {
      if (!overlayContainer?.querySelector(".winrate") || !PA.cache.winrateData) return;
      requestAnimationFrame(() => api.updateWinrateDisplay(PA.cache.winrateData));
    }

    function refreshOverviewStats(useRiotApi = false) {
      const btn = document.getElementById("player-dropdown-btn");
      const puuid = btn?.getAttribute("data-puuid");
      if (!puuid) return;

      const selectedTeamPosition = getSelectedTeamPosition();

      const matchFetch = useRiotApi ? api.fetchRecentMatches : api.fetchRecentMatchesFromDatabase;
      matchFetch(puuid, state.currentQueueId, selectedTeamPosition)
        .then(() => api.fetchWinrate(puuid, state.currentQueueId, selectedTeamPosition))
        .then(() => redrawWinrateFromCache())
        .catch((err) => console.error("[OVERVIEW] Error refreshing recent matches:", err));
    }

    function hasDistinctSecondaryRole() {
      const btn = document.getElementById("player-dropdown-btn");
      if (!btn) return false;

      const primaryRoleId = btn.getAttribute("data-primary-role-id");
      const secondaryRoleId = btn.getAttribute("data-secondary-role-id");
      const primaryRoleName = (btn.getAttribute("data-primary-role-name") || "").trim().toLowerCase();
      const secondaryRoleName = (btn.getAttribute("data-secondary-role-name") || "").trim().toLowerCase();

      if (!secondaryRoleId && !secondaryRoleName) return false;

      if (secondaryRoleId && primaryRoleId && secondaryRoleId === primaryRoleId) return false;

      if (secondaryRoleName && primaryRoleName && secondaryRoleName === primaryRoleName) return false;

      return true;
    }

    function setupOverviewRoleDropdown() {
      const roleDropdownBtn = overlayContainer.querySelector("#overviewRoleDropdownBtn");
      const roleDropdownContent = overlayContainer.querySelector("#overviewRoleDropdownContent");
      const roleOptions = overlayContainer.querySelectorAll("#overviewRoleDropdownContent a");
      const roleDropdownWrapper = roleDropdownBtn?.closest(".dropdown");

      if (!roleDropdownBtn || !roleDropdownContent || roleOptions.length === 0) {
        return;
      }

      if (!hasDistinctSecondaryRole()) {
        state.currentRoleView = "primary";
        roleDropdownContent.style.display = "none";
        if (roleDropdownWrapper) {
          roleDropdownWrapper.style.display = "none";
        } else {
          roleDropdownBtn.style.display = "none";
        }
        return;
      }

      if (roleDropdownWrapper) {
        roleDropdownWrapper.style.display = "";
      }

      roleDropdownBtn.textContent = state.currentRoleView === "secondary" ? "Secondary Role" : "Primary Role";

      roleDropdownBtn.addEventListener("click", function (e) {
        e.preventDefault();
        roleDropdownContent.style.display = roleDropdownContent.style.display === "block" ? "none" : "block";
      });

      roleOptions.forEach((option) => {
        option.addEventListener("click", function (e) {
          e.preventDefault();

          const selectedRoleView = this.getAttribute("data-role-view");
          if (selectedRoleView !== "primary" && selectedRoleView !== "secondary") return;

          state.currentRoleView = selectedRoleView;
          roleDropdownBtn.textContent = selectedRoleView === "secondary" ? "Secondary Role" : "Primary Role";
          roleDropdownContent.style.display = "none";

          refreshOverviewStats(false);
        });
      });

      document.addEventListener("click", function (e) {
        if (!e.target.closest(".dropdown")) {
          roleDropdownContent.style.display = "none";
        }
      });
    }

    function setupQueueDropdown() {
      const queueDropdownBtn = overlayContainer.querySelector("#queueDropdownBtn");
      const queueDropdownContent = overlayContainer.querySelector("#queueDropdownContent");
      const queueOptions = overlayContainer.querySelectorAll("#queueDropdownContent a");

      if (!queueDropdownBtn || !queueDropdownContent) {
        console.log("[QUEUE DROPDOWN] ✗ Queue dropdown button or content not found");
        return;
      }

      queueDropdownBtn.addEventListener("click", function (e) {
        e.preventDefault();
        queueDropdownContent.style.display = queueDropdownContent.style.display === "block" ? "none" : "block";
      });

      queueOptions.forEach((option) => {
        option.addEventListener("click", function (e) {
          e.preventDefault();
          const queueId = parseInt(this.getAttribute("data-queue"), 10);
          const queueName = this.textContent;

          queueDropdownBtn.textContent = queueName;
          queueDropdownContent.style.display = "none";

          // Update shared state
          state.currentQueueId = queueId;

          refreshOverviewStats(true);
        });
      });

      document.addEventListener("click", function (e) {
        if (!e.target.closest(".dropdown")) {
          queueDropdownContent.style.display = "none";
        }
      });
    }

    if (!overlayContainer) return;

    // ============ TABS LOGIC ==================
    tabButtons.forEach((button) => {
      if (!button) return;

      button.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveTab(this);

        const urlMap = {
          overviewButton: "/player_analysis/overview",
          comparisonButton: "/player_analysis/comparison",
          scrimsButton: "/player_analysis/scrims",
          championButton: "/player_analysis/champion",
          summaryButton: "/player_analysis/summary",
        };

        const url = urlMap[this.id];
        if (!url) return;

        fetch(url)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
          })
          .then((html) => {
            overlayContainer.innerHTML = html;

            // Champion Pool Tab
            if (this.id === "championButton") {
              const btn = document.getElementById("player-dropdown-btn");
              const userId = btn.getAttribute("data-player-id");

              if (userId && typeof window.initChampionTab === "function") {
                window.initChampionTab(userId);
              } else {
                console.error("initChampionTab not found! Make sure champion overlay JS is loaded.");
              }
            }

            // Scrims tab
            if (this.id === "scrimsButton") {
              const btn = document.getElementById("player-dropdown-btn");
              // const menu = document.getElementById("player-dropdown-menu");
              const userId = btn.getAttribute("data-player-id");

              // menu.addEventListener("click", () => {
              //   const dropdownBtn = document.getElementById("player-dropdown-btn");
              //   const playerId = dropdownBtn?.getAttribute("data-player-id");
              //   window.initScrimsTab(playerId);
              // })

              if (userId && typeof window.initScrimsTab === "function") {
                window.initScrimsTab(userId);
              } else {
                console.error("initScrimsTab not found! Make sure scrim overlay JS is loaded.");
              }
            }

            // Summary Tab
            if (this.id === "summaryButton") {
              const btn = document.getElementById("player-dropdown-btn");
              const userId = btn.getAttribute("data-player-id");

              if (userId && typeof window.initSummaryTab === "function") {
                window.initSummaryTab(userId);
              } else {
                console.error("initSummaryTab not found! Make sure Summary overlay JS is loaded.");
              }
            }

            // Comparison tab init hook
            if (this.id === "comparisonButton") {
              if (typeof window.initComparisonTab === "function") window.initComparisonTab();
              else console.error("initComparisonTab not found! Make sure comparison.js is loaded in the main page.");

              const btn = document.getElementById("player-dropdown-btn");
              if (btn) {
                const userId = btn.getAttribute("data-player-id");
                // Default to Role 1 if missing, just for testing
                const roleId = btn.getAttribute("data-primary-role-id") || 1;

                loadStoredBenchmarks(userId, roleId);
              }
            }

            setupQueueDropdown();

            const overlay = overlayContainer.querySelector(".overlay");
            if (!overlay) return;

            overlay.style.display = "block";
            overlay.addEventListener("click", function (event) {
              if (event.target === this) closeOverlay();
            });

            const closeButton = overlayContainer.querySelector(".close-button");
            if (closeButton) closeButton.addEventListener("click", closeOverlay);

            // If overview loaded, set up the fetch button with timer and update displays with cached data
            // This ensures the fetch is manually triggered by the user, and cached data is displayed
            if (this.id === "overviewButton") {
              setupFetchMatchStatsButton(api, state);
              setupOverviewRoleDropdown();

              refreshOverviewStats(false);

              // Update display with cached data if available
              console.log("[OVERVIEW] Updating display with cached data");
              if (PA.cache.winrateData) {
                requestAnimationFrame(() => api.updateWinrateDisplay(PA.cache.winrateData));
              }
              if (PA.cache.kdaStats) {
                api.updateKDADisplay(PA.cache.kdaStats);
              }
              if (PA.cache.topChampions) {
                api.updateChampionDisplay(PA.cache.topChampions);
              }
            }

          }) // End of "then" statement
          .catch((err) => console.log("Error loading overlay:", err));
      });
    });
  });
})();