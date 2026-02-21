// player_analysis_overlay.js
// Only overlay/tab navigation and queue dropdown behavior lives here.

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const PA = window.PlayerAnalysis;
    if (!PA || !PA.api || !PA.state) {
      console.error("[OVERLAY] PlayerAnalysis backend not loaded. Ensure backend script loads first.");
      return;
    }

    const { api, state } = PA;

    const overviewButton = document.getElementById("overviewButton");
    const comparisonButton = document.getElementById("comparisonButton");
    const vodsButton = document.getElementById("vodsButton");
    const championButton = document.getElementById("championButton");
    const evaluationButton = document.getElementById("evaluationButton");
    const overlayContainer = document.getElementById("overlay-container");

    const tabButtons = [overviewButton, comparisonButton, vodsButton, championButton, evaluationButton];

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
          vodsButton: "/player_analysis/vods",
          championButton: "/player_analysis/champion",
          evaluationButton: "/player_analysis/evaluation",
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

            // Evaluation tab
            if (this.id === "evaluationButton") {
              const btn = document.getElementById("player-dropdown-btn");
              const userId = btn.getAttribute("data-player-id");

              if (userId && typeof window.initEvaluationTab === "function") {
                window.initEvaluationTab(userId);
              } else {
                console.error("initEvaluationTab not found! Make sure evaluation overlay JS is loaded.");
              }
            }

            // Comparison tab init hook
            if (this.id === "comparisonButton") {
              if (typeof window.initComparisonTab === "function") window.initComparisonTab();
              else console.error("initComparisonTab not found! Make sure comparison.js is loaded in the main page.");
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

            // If overview loaded, refetch immediately using shared queue
            // This ensures display functions run after overlay HTML is rendered
            if (this.id === "overviewButton") {
              const btn = document.getElementById("player-dropdown-btn");
              const puuid = btn?.getAttribute("data-puuid");
              if (puuid) {
                console.log("[OVERVIEW] Overlay rendered, updating display with latest data");
                // Always refetch to ensure data is fresh and display updates properly
                api.fetchWinrate(puuid, state.currentQueueId);
                api.fetchRecentMatches(puuid, state.currentQueueId);
              }
            }

          }) // End of "then" statement
          .catch((err) => console.log("Error loading overlay:", err));
      });
    });
  });
})();