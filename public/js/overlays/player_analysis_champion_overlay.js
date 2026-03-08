// player_analysis_champion_overlay.js
// ONLY: DOM wiring + rendering champion pool table.
// Requires ChampionPoolBackend loaded first.

// TODO: Update champ pool table when new player is selected from dropdown

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
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const normalizeChampionKey = (name) => {
    const base = String(name || "")
      .replace(/[^A-Za-z0-9]/g, "")
      .toLowerCase();

    // Handle names that do not match a simple punctuation-stripped pattern.
    const aliases = {
      wukong: "MonkeyKing",
      nunuandwillump: "Nunu",
      khazix: "Khazix",
      kogmaw: "KogMaw",
      reksai: "RekSai",
      leesin: "LeeSin",
      tahmkench: "TahmKench",
      jarvaniv: "JarvanIV",
      missfortune: "MissFortune",
      xinzhao: "XinZhao",
      aurelionsol: "AurelionSol",
      drmundo: "DrMundo",
      masteryi: "MasterYi",
      twistedfate: "TwistedFate",
      monkeyking: "MonkeyKing"
    };

    return aliases[base] || String(name || "").replace(/[^A-Za-z0-9]/g, "");
  };

  const getChampionIconUrl = (championName) => {
    const champKey = normalizeChampionKey(championName);
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champKey}.png`;
  };

  console.log("[CHAMPION] Tab logic initialized for user:", userId);

  const tableBody = document.querySelector("table tbody");
  if (!tableBody) {
    console.error("[CHAMPION] Table body not found in DOM.");
    return;
  }

  champBackend.fetchChampionPool(userId)
    .then((championPool) => {
      const formatted = champBackend.formatChampionStats(championPool);

      tableBody.innerHTML = "";
      formatted.forEach((champ, index) => {
        const championNameSafe = escapeHtml(champ.championName);
        const iconUrl = getChampionIconUrl(champ.championName);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>
            <div class="champion-cell">
              <img
                class="champion-pool-icon"
                src="${iconUrl}"
                alt="${championNameSafe}"
                loading="lazy"
                onerror="this.onerror=null;this.src='/images/sample_hero.png';"
              >
              <span class="champion-name">${championNameSafe}</span>
            </div>
          </td>
          <td>${champ.role}</td>
          <td>${champ.games}</td>
          <td>${champ.winrate}</td>
          <td>${champ.avgKills} / ${champ.avgDeaths} / ${champ.avgAssists}</td>
          <td>${champ.avgCsm}</td>
          <td>${champ.avgGoldDiff}</td>
          <td>${champ.avgDamageShare}</td>
          <td>${champ.avgKp}</td>
        `;
        tableBody.appendChild(row);
      });

      console.log("[CHAMPION] ✓ Champion pool rendered successfully");
    })
    .catch((err) => console.error("[CHAMPION] Error loading champion pool:", err));
};
