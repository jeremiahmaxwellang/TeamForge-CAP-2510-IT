// player_analysis_overlay.js
// Only overlay/tab navigation and queue dropdown behavior lives here.

(function () {
  // Timer constants (1 minute in milliseconds)
  const FETCH_INTERVAL = 1 * 60 * 1000; // 1 minute
  let lastFetchTime = null;

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
    const timerInfo = document.getElementById("timerInfo");

    if (!fetchBtn) {
      console.error("[FETCH BUTTON] Button not found in DOM");
      return;
    }

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
        // Button is disabled
        fetchBtn.disabled = true;
        fetchBtn.style.opacity = "0.5";
        fetchBtn.style.cursor = "not-allowed";

        const seconds = Math.ceil(timeRemaining / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerInfo.textContent = `(Available in ${minutes}m ${secs}s)`;
      } else {
        // Button is enabled
        fetchBtn.disabled = false;
        fetchBtn.style.opacity = "1";
        fetchBtn.style.cursor = "pointer";
        timerInfo.textContent = "";
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
        const seconds = Math.ceil(timeRemaining / 1000);
        console.error("Error: You can only fetch the match statistics once every 1 minute.");
        timerInfo.textContent = `(Available in ${Math.ceil(seconds / 60)}m ${seconds % 60}s)`;
        return;
      }

      // Proceed with fetch from Riot API
      console.log("[FETCH BUTTON] Fetching fresh match statistics from Riot API...");
      const btn = document.getElementById("player-dropdown-btn");
      const puuid = btn?.getAttribute("data-puuid");

      if (!puuid) {
        console.error("[FETCH BUTTON] No player PUUID found");
        return;
      }

      // Update last fetch time
      lastFetchTime = Date.now();
      localStorage.setItem("lastMatchStatsFetchTime", lastFetchTime.toString());

      // Disable button and show timer
      updateButtonState();
      startButtonCooldown();

      // Fetch fresh data from Riot API (not from database)
      api.fetchWinrate(puuid, state.currentQueueId)
        .catch((err) => console.error("[FETCH BUTTON] Error fetching winrate:", err));

      api.fetchRecentMatches(puuid, state.currentQueueId)
        .catch((err) => console.error("[FETCH BUTTON] Error fetching recent matches:", err));
    });

    function startButtonCooldown() {
      let secondsLeft = Math.ceil(FETCH_INTERVAL / 1000);

      const countdownInterval = setInterval(() => {
        secondsLeft--;
        const minutes = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;

        if (secondsLeft > 0) {
          timerInfo.textContent = `(Available in ${minutes}m ${secs}s)`;
          fetchBtn.disabled = true;
          fetchBtn.style.opacity = "0.5";
          fetchBtn.style.cursor = "not-allowed";
        } else {
          clearInterval(countdownInterval);
          fetchBtn.disabled = false;
          fetchBtn.style.opacity = "1";
          fetchBtn.style.cursor = "pointer";
          timerInfo.textContent = "";
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
        api.updateWinrateDisplay(event.detail);
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

          // Refetch for current selected player
          const btn = document.getElementById("player-dropdown-btn");
          const puuid = btn?.getAttribute("data-puuid");
          if (puuid) {
            api.fetchWinrate(puuid, state.currentQueueId);
            api.fetchRecentMatches(puuid, state.currentQueueId);
          }
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

              const selectedPlayerBtn = document.getElementById("player-dropdown-btn");
              const puuid = selectedPlayerBtn?.getAttribute("data-puuid");
              if (puuid) {
                api.fetchWinrate(puuid, state.currentQueueId)
                  .catch((err) => console.error("[OVERVIEW] Error refreshing winrate for graph:", err));
              }
              
              // Update display with cached data if available
              console.log("[OVERVIEW] Updating display with cached data");
              if (PA.cache.winrateData) {
                api.updateWinrateDisplay(PA.cache.winrateData);
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