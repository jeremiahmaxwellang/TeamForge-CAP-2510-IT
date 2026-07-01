// player_analysis_champion_overlay.js
// ONLY: DOM wiring + rendering champion pool table.
// Requires ChampionPoolBackend loaded first.

window.initChampionTab = function (userId) {
  const champBackend = window.ChampionPoolBackend;
  if (!champBackend) {
    console.error("[CHAMPION] champBackend module not loaded.");
    return;
  }

  // --- SORTING STATE ---
  let currentSort = 'default';
  let sortDesc = true;
  let champData = []; // Caches the data to sort without re-fetching

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

  const formatPatch = (rawPatch) => {
    if (!rawPatch || rawPatch === "Unknown") return "N/A";
    const parts = String(rawPatch).split('.');
    if (parts.length >= 2) return `${parts[0]}.${parts[1]}`;
    return rawPatch;
  };

  // --- NEW SORTING LOGIC ---
  const sortData = (data) => {
    const pRoleEl = document.getElementById("primaryRole");
    const sRoleEl = document.getElementById("secondaryRole");
    const pRoleText = pRoleEl ? pRoleEl.innerText.toUpperCase() : "";
    const sRoleText = sRoleEl ? sRoleEl.innerText.toUpperCase() : "";

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

    return data.sort((a, b) => {
        let valA, valB;

        switch(currentSort) {
            case 'name': valA = a.championName.toLowerCase(); valB = b.championName.toLowerCase(); break;
            case 'role': valA = a.role.toLowerCase(); valB = b.role.toLowerCase(); break;
            case 'patch': valA = parseFloat(a.gameVersion) || 0; valB = parseFloat(b.gameVersion) || 0; break;
            case 'games': valA = a.games; valB = b.games; break;
            case 'wr': valA = parseFloat(a.winrate) || 0; valB = parseFloat(b.winrate) || 0; break;
            case 'kda':
                valA = (a.avgKills + a.avgAssists) / Math.max(1, a.avgDeaths);
                valB = (b.avgKills + b.avgAssists) / Math.max(1, b.avgDeaths);
                break;
            case 'csm': valA = parseFloat(a.avgCsm) || 0; valB = parseFloat(b.avgCsm) || 0; break;
            case 'gpm': valA = parseFloat(a.avgGpm) || 0; valB = parseFloat(b.avgGpm) || 0; break;
            case 'dpm': valA = parseFloat(a.avgDamageShare) || 0; valB = parseFloat(b.avgDamageShare) || 0; break;
            case 'kp': valA = parseFloat(a.avgKp) || 0; valB = parseFloat(b.avgKp) || 0; break;
            default:
                // Default fallback: Role -> Games Played -> Winrate
                const getWeight = (r) => {
                    const roleUpper = (r || "").toUpperCase();
                    if (pRole !== "NONE" && roleUpper.includes(pRole)) return 1;
                    if (sRole !== "NONE" && roleUpper.includes(sRole)) return 2;
                    return 3;
                };
                const wA = getWeight(a.role);
                const wB = getWeight(b.role);
                if (wA !== wB) return wA - wB; // ASC
                if (b.games !== a.games) return b.games - a.games; // DESC
                return (parseFloat(b.winrate) || 0) - (parseFloat(a.winrate) || 0); // DESC
        }

        // Apply determined ascending or descending sort
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });
  };

  // --- TABLE RENDERING ---
  const renderTable = () => {
    const championRoot = document.querySelector('.champion-pool-container');
    if (!championRoot) return;
    const tableBody = championRoot.querySelector('table tbody');
    if (!tableBody) return;

    const sortedData = sortData([...champData]);

    tableBody.innerHTML = "";
    sortedData.forEach((champ, index) => {
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
        <td>${patchSafe}</td> 
        <td>${champ.games}</td>
        <td style="color: ${parseFloat(champ.winrate) >= 50 ? '#4CAF50' : '#f44336'}; font-weight: bold;">${champ.winrate}</td>
        <td>${champ.avgKills} / ${champ.avgDeaths} / ${champ.avgAssists}</td>
        <td>${champ.avgCsm}</td>
        <td>${champ.avgGpm}</td>
        <td>${champ.avgDamageShare}</td>
        <td>${champ.avgKp}</td>
      `;
      tableBody.appendChild(row);
    });

    // Visually update the sorting arrows in the headers
    const headers = championRoot.querySelectorAll('thead th');
    const sortKeys = [null, 'name', 'role', 'patch', 'games', 'wr', 'kda', 'csm', 'gpm', 'dpm', 'kp'];
    
    headers.forEach((th, index) => {
        const sortKey = sortKeys[index];
        if (!sortKey) return;
        const icon = th.querySelector('.sort-icon');
        if (icon) {
            if (currentSort === sortKey) {
                icon.innerHTML = sortDesc ? '&#9660;' : '&#9650;'; // Highlighted Up/Down Triangle
                icon.style.color = '#fff';
            } else {
                icon.innerHTML = '&#8693;'; // Idle Up-Down Arrow
                icon.style.color = '#666';
            }
        }
    });
  };

  // --- DYNAMIC HEADER INITIALIZATION ---
  const setupHeaders = () => {
    const championRoot = document.querySelector('.champion-pool-container');
    if (!championRoot) return;
    const headers = championRoot.querySelectorAll('thead th');

    // Maps directly to the HTML columns ignoring the # column (index 0)
    const sortKeys = [null, 'name', 'role', 'patch', 'games', 'wr', 'kda', 'csm', 'gpm', 'dpm', 'kp'];

    headers.forEach((th, index) => {
        const sortKey = sortKeys[index];
        if (!sortKey) return;

        // Apply clickable styling dynamically
        th.style.cursor = 'pointer';
        th.title = 'Click to sort';
        th.style.userSelect = 'none';

        // Add the actual icon container to the header if it isn't there
        if (!th.querySelector('.sort-icon')) {
            const icon = document.createElement('span');
            icon.className = 'sort-icon';
            icon.style.marginLeft = '6px';
            icon.style.fontSize = '10px';
            th.appendChild(icon);
        }

        // Clone the element to remove any old listeners before attaching new ones
        const newTh = th.cloneNode(true);
        th.parentNode.replaceChild(newTh, th);

        newTh.addEventListener('click', () => {
            if (currentSort === sortKey) {
                sortDesc = !sortDesc;
            } else {
                currentSort = sortKey;
                sortDesc = true;
            }
            renderTable();
        });
    });
  };

  // --- MAIN FETCH AND LOAD ---
  const loadAndRenderTable = (targetUserId) => {
    const championRoot = document.querySelector('.champion-pool-container');
    if (!championRoot) return;

    const tableBody = championRoot.querySelector('table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="11" style="text-align: center;">Loading champion pool...</td></tr>`;

    champBackend.fetchChampionPool(targetUserId)
      .then((championPool) => {
        // Cache the formatted data once, then render with our sorting pipeline
        champData = champBackend.formatChampionStats(championPool);
        setupHeaders();
        renderTable();
        console.log("[CHAMPION] ✓ Champion pool fetched and rendered successfully");
      })
      .catch((err) => {
          console.error("[CHAMPION] Error loading champion pool:", err);
          const root = document.querySelector('.champion-pool-container');
          const tBody = root?.querySelector('table tbody');
          if (tBody) tBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: #ff6b6b;">Failed to load champion pool.</td></tr>`;
      });
  };

  // --- DYNAMIC DROPDOWN OBSERVER ---
  if (!window.championObserverSetup) {
      const btn = document.getElementById("player-dropdown-btn");
      if (btn) {
          const observer = new MutationObserver((mutations) => {
              const championRoot = document.querySelector('.champion-pool-container');
              if (!championRoot) return;

              mutations.forEach((mutation) => {
                  if (mutation.type === "attributes" && mutation.attributeName === "data-player-id") {
                      const newPlayerId = btn.getAttribute("data-player-id");
                      if (newPlayerId) {
                          console.log("[CHAMPION] Dropdown changed. Reloading pool for:", newPlayerId);
                          currentSort = 'default'; // Reset sort for new player
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