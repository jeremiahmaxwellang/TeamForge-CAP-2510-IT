// player_analysis_champion_overlay.js
// ONLY: DOM wiring + rendering champion pool table.
// Requires ChampionPoolBackend loaded first.

window.initChampionTab = function (userId) {
  const champBackend = window.ChampionPoolBackend;
  if (!champBackend) {
    console.error("[CHAMPION] champBackend module not loaded.");
    return;
  }

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const normalizeChampionKey = (name) => {
    const base = String(name || "").replace(/[^A-Za-z0-9]/g, "").toLowerCase();
    const aliases = {
      wukong: "MonkeyKing", nunuandwillump: "Nunu", khazix: "Khazix", kogmaw: "KogMaw",
      reksai: "RekSai", leesin: "LeeSin", tahmkench: "TahmKench", jarvaniv: "JarvanIV",
      missfortune: "MissFortune", xinzhao: "XinZhao", aurelionsol: "AurelionSol",
      drmundo: "DrMundo", masteryi: "MasterYi", twistedfate: "TwistedFate", monkeyking: "MonkeyKing"
    };
    return aliases[base] || String(name || "").replace(/[^A-Za-z0-9]/g, "");
  };

  const getChampionIconUrl = (championName) => {
    const champKey = normalizeChampionKey(championName);
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champKey}.png`;
  };

  const normalizeRoleKey = (role) => String(role || "").toLowerCase().replace(/[^a-z]/g, "");

  const getLaneIconPath = (role) => {
    const roleKey = normalizeRoleKey(role);
    if (roleKey.includes("top")) return "/images/top_lane.png";
    if (roleKey.includes("jungle")) return "/images/jungle.png";
    if (roleKey.includes("mid") || roleKey.includes("middle")) return "/images/mid_lane.png";
    if (roleKey.includes("bot") || roleKey.includes("adc")) return "/images/bottom_lane.png";
    return "/images/support.png";
  };

  // Truncates Riot's long patch strings (e.g. 14.5.1234 -> 14.5)
  const formatPatch = (rawPatch) => {
    if (!rawPatch || rawPatch === "Unknown") return "N/A";
    const parts = String(rawPatch).split('.');
    if (parts.length >= 2) return `${parts[0]}.${parts[1]}`;
    return rawPatch;
  };

  // Core Render Function
  const loadAndRenderTable = (targetUserId) => {
    const championRoot = document.querySelector('.champion-pool-container');
    if (!championRoot) return;

    const tableBody = championRoot.querySelector('table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="11" style="text-align: center;">Loading champion pool...</td></tr>`;

    champBackend.fetchChampionPool(targetUserId)
      .then((championPool) => {
        const formatted = champBackend.formatChampionStats(championPool);

        // --- 1. ADVANCED SORTING LOGIC ---
        // Read roles directly from the main page's DOM elements
        const pRoleEl = document.getElementById("primaryRole");
        const sRoleEl = document.getElementById("secondaryRole");
        const pRoleText = pRoleEl ? pRoleEl.innerText.toUpperCase() : "";
        const sRoleText = sRoleEl ? sRoleEl.innerText.toUpperCase() : "";

        // Helper to extract clean role name
        const extractRole = (text) => {
            if (text.includes("TOP")) return "TOP";
            if (text.includes("JUNGLE")) return "JUNGLE";
            if (text.includes("MID")) return "MID";
            if (text.includes("ADC") || text.includes("BOT")) return "ADC";
            if (text.includes("SUPPORT")) return "SUPPORT";
            return "NONE";
        };

        const pRole = extractRole(pRoleText);
        const sRole = extractRole(sRoleText);

        formatted.sort((a, b) => {
            const roleA = (a.role || "").toUpperCase();
            const roleB = (b.role || "").toUpperCase();

            // Priority 1 & 2: Match Roles
            const getWeight = (r) => {
                if (pRole !== "NONE" && r.includes(pRole)) return 1;
                if (sRole !== "NONE" && r.includes(sRole)) return 2;
                return 3;
            };

            const wA = getWeight(roleA);
            const wB = getWeight(roleB);

            if (wA !== wB) return wA - wB;

            // Priority 3: Games Played (Descending)
            if (b.games !== a.games) return b.games - a.games;

            // Priority 4: Winrate (Descending)
            const wrA = parseFloat(a.winrate) || 0;
            const wrB = parseFloat(b.winrate) || 0;
            return wrB - wrA;
        });

        // --- 2. RENDER TABLE ---
        tableBody.innerHTML = "";
        formatted.forEach((champ, index) => {
          const championNameSafe = escapeHtml(champ.championName);
          const roleSafe = escapeHtml(champ.role);
          const patchSafe = formatPatch(champ.gameVersion);
          const iconUrl = getChampionIconUrl(champ.championName);
          const laneIconPath = getLaneIconPath(champ.role);
          
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>
              <div class="champion-cell" data-tooltip="${championNameSafe}">
                <img class="champion-pool-icon" src="${iconUrl}" alt="${championNameSafe}" loading="lazy" onerror="this.onerror=null;this.src='/images/sample_hero.png';">
                <span class="champion-name" style="font-weight: bold;">${championNameSafe}</span>
              </div>
            </td>
            <td>
              <div class="role-cell">
                <img class="lane-role-icon" src="${laneIconPath}" alt="${roleSafe}" loading="lazy" onerror="this.style.display='none';">
                <span class="role-name">${roleSafe}</span>
              </div>
            </td>
            <td>${patchSafe}</td> <td>${champ.games}</td>
            <td style="color: ${parseFloat(champ.winrate) >= 50 ? '#4CAF50' : '#f44336'}; font-weight: bold;">${champ.winrate}</td>
            <td>${champ.avgKills} / ${champ.avgDeaths} / ${champ.avgAssists}</td>
            <td>${champ.avgCsm}</td>
            <td>${champ.avgGpm}</td>
            <td>${champ.avgDamageShare}</td>
            <td>${champ.avgKp}</td>
          `;
          tableBody.appendChild(row);
        });

        console.log("[CHAMPION] ✓ Champion pool sorted and rendered successfully");
      })
      .catch((err) => {
          console.error("[CHAMPION] Error loading champion pool:", err);
          const championRoot = document.querySelector('.champion-pool-container');
          const tableBody = championRoot?.querySelector('table tbody');
          if (tableBody) tableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: #ff6b6b;">Failed to load champion pool.</td></tr>`;
      });
  };

  // --- 3. DYNAMIC DROPDOWN OBSERVER ---
  // Ensure we only attach the observer once so we don't accidentally fetch data multiple times
  if (!window.championObserverSetup) {
      const btn = document.getElementById("player-dropdown-btn");
      if (btn) {
          const observer = new MutationObserver((mutations) => {
              const championRoot = document.querySelector('.champion-pool-container');
              if (!championRoot) {
                  return;
              }

              mutations.forEach((mutation) => {
                  if (mutation.type === "attributes" && mutation.attributeName === "data-player-id") {
                      const newPlayerId = btn.getAttribute("data-player-id");
                      if (newPlayerId) {
                          console.log("[CHAMPION] Dropdown changed. Reloading pool for:", newPlayerId);
                          loadAndRenderTable(newPlayerId);
                      }
                  }
              });
          });
          observer.observe(btn, { attributes: true, attributeFilter: ["data-player-id"] });
          window.championObserverSetup = true;
          console.log("[CHAMPION] Observer attached to dropdown");
      }
  }

  // Initial load when tab is clicked
  if (userId) {
      loadAndRenderTable(userId);
  }
};