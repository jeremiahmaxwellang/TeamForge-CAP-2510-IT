// player_analysis_overlay.js
// Only overlay/tab navigation and queue dropdown behavior lives here.

(function () {
  // Timer constants (1 minute in milliseconds)
  const FETCH_INTERVAL = 1 * 60 * 1000; // 1 minute
  let lastFetchTime = null;

  if (typeof window.logMissingOverviewItemIcon !== "function") {
    window.logMissingOverviewItemIcon = function (itemId, imageUrl, matchId) {
      if (!window.__overviewMissingItemIds) {
        window.__overviewMissingItemIds = new Set();
      }

      const missingKey = `${itemId}`;
      if (window.__overviewMissingItemIds.has(missingKey)) return;
      window.__overviewMissingItemIds.add(missingKey);

      console.error("[ITEM ICON] Missing item image", {
        itemId,
        matchId,
        imageUrl
      });
    };
  }

  if (typeof window.logMissingOverviewSpellIcon !== "function") {
    window.logMissingOverviewSpellIcon = function (spellId, spellName, imageUrl, matchId) {
      if (!window.__overviewMissingSpellIds) {
        window.__overviewMissingSpellIds = new Set();
      }

      const missingKey = `${spellId}`;
      if (window.__overviewMissingSpellIds.has(missingKey)) return;
      window.__overviewMissingSpellIds.add(missingKey);

      console.error("[SPELL ICON] Missing summoner spell image", {
        spellId,
        spellName,
        matchId,
        imageUrl
      });
    };
  }

  if (typeof window.logMissingOverviewPerkIcon !== "function") {
    window.logMissingOverviewPerkIcon = function (perkId, perkName, imageUrl, matchId) {
      if (!window.__overviewMissingPerkIds) {
        window.__overviewMissingPerkIds = new Set();
      }

      const missingKey = `${perkId}`;
      if (window.__overviewMissingPerkIds.has(missingKey)) return;
      window.__overviewMissingPerkIds.add(missingKey);

      console.error("[PERK ICON] Missing perk image", {
        perkId,
        perkName,
        matchId,
        imageUrl
      });
    };
  }

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

    // Auto-refresh match list whenever backend updates cached matches
    document.addEventListener("playeranalysis:matches-updated", (event) => {
      const matchListEl = overlayContainer?.querySelector("#match-list");
      const matches = event?.detail?.matches;
      const eventPuuid = event?.detail?.puuid;
      const currentPuuid = document.getElementById("player-dropdown-btn")?.getAttribute("data-puuid");
      const puuid = eventPuuid || currentPuuid;

      if (matchListEl && puuid && Array.isArray(matches)) {
        requestAnimationFrame(() => renderMatchHistory(matches, puuid));
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

    function timeAgo(timestamp) {
      const diff = Date.now() - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return `${Math.max(minutes, 1)} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    function renderMatchHistory(matches, puuid) {
      const container = document.getElementById('match-list');
      if (!container) return;
      container.innerHTML = '';
      if (!matches || matches.length === 0) {
        container.innerHTML = '<div class="no-matches">No match history found.</div>';
        return;
      }

      const SUMMONER_SPELL_MAP = {
        1: 'SummonerBoost', 3: 'SummonerExhaust', 4: 'SummonerFlash',
        6: 'SummonerHaste', 7: 'SummonerHeal', 11: 'SummonerSmite',
        12: 'SummonerTeleport', 13: 'SummonerMana', 14: 'SummonerDot',
        21: 'SummonerBarrier', 32: 'SummonerSnowball', 39: 'SummonerSnowURFSnowball_Mark'
      };

      const PERK_ICON_MAP = {
        8005: 'Styles/Precision/PressTheAttack/PressTheAttack.png',
        8008: 'Styles/Precision/LethalTempo/LethalTempoTemp.png',
        8021: 'Styles/Precision/FleetFootwork/FleetFootwork.png',
        8010: 'Styles/Precision/Conqueror/Conqueror.png',
        8112: 'Styles/Domination/Electrocute/Electrocute.png',
        8124: 'Styles/Domination/Predator/Predator.png',
        8128: 'Styles/Domination/DarkHarvest/DarkHarvest.png',
        9923: 'Styles/Domination/HailOfBlades/HailOfBlades.png',
        8229: 'Styles/Sorcery/ArcaneComet/ArcaneComet.png',
        8230: 'Styles/Sorcery/PhaseRush/PhaseRush.png',
        8214: 'Styles/Sorcery/SummonAery/SummonAery.png',
        8437: 'Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
        8439: 'Styles/Resolve/VeteranAftershock/VeteranAftershock.png',
        8465: 'Styles/Resolve/Guardian/Guardian.png',
        8351: 'Styles/Inspiration/GlacialAugment/GlacialAugment.png',
        8358: 'Styles/Inspiration/MasterKey/MasterKey.png',
        8360: 'Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
        8369: 'Styles/Inspiration/FirstStrike/FirstStrike.png'
      };

      const PERK_NAME_MAP = {
        8005: 'Press the Attack',
        8008: 'Lethal Tempo',
        8021: 'Fleet Footwork',
        8010: 'Conqueror',
        8112: 'Electrocute',
        8124: 'Predator',
        8128: 'Dark Harvest',
        9923: 'Hail of Blades',
        8229: 'Arcane Comet',
        8230: 'Phase Rush',
        8214: 'Summon Aery',
        8437: 'Grasp of the Undying',
        8439: 'Aftershock',
        8465: 'Guardian',
        8351: 'Glacial Augment',
        8358: 'Prototype: Omnistone',
        8360: 'Unsealed Spellbook',
        8369: 'First Strike'
      };

      const PERK_STYLE_ICON_MAP = {
        8000: 'Styles/7201_Precision.png',
        8100: 'Styles/7200_Domination.png',
        8200: 'Styles/7202_Sorcery.png',
        8300: 'Styles/7203_Whimsy.png',
        8400: 'Styles/7204_Resolve.png'
      };

      const PERK_STYLE_NAME_MAP = {
        8000: 'Precision',
        8100: 'Domination',
        8200: 'Sorcery',
        8300: 'Inspiration',
        8400: 'Resolve'
      };

      matches.forEach((match, index) => {
        if (!match?.info?.participants) return;
        const player = match.info.participants.find(p => p.puuid === puuid);
        if (!player) return;
        const isWin = player.win;
        const duration = match.info.gameDuration || 0;
        const matchId = match?.metadata?.matchId || 'unknown-match';
        const durationMin = Math.floor(duration / 60);
        const durationSec = duration % 60;
        const kdaRatio = ((player.kills + player.assists) / Math.max(1, player.deaths)).toFixed(2);
        const totalCs = Number(player.totalMinionsKilled ?? player.cs ?? 0);
        const visionScore = Number(player.visionScore ?? player.vision ?? 0);
        const csPerMin = durationMin > 0 ? (totalCs / durationMin).toFixed(1) : '0.0';
        const queueNames = { 420: 'Ranked Solo', 440: 'Ranked Flex', 450: 'ARAM', 430: 'Normal', 0: 'Custom' };
        const queueName = queueNames[match.info.queueId] || 'Normal';
        const gameDate = match.info.gameStartTimestamp ? timeAgo(match.info.gameStartTimestamp) : '';
        const participants = Array.isArray(match.info.participants) ? match.info.participants : [];
        let allies = participants.filter((p) => p.teamId === player.teamId && p.puuid !== puuid);
        let enemies = participants.filter((p) => p.teamId !== player.teamId);

        // Some stored payloads may have missing teamId values; fallback to a stable split.
        if ((!allies.length && !enemies.length) || player.teamId === undefined || player.teamId === null) {
          const others = participants.filter((p) => p.puuid !== puuid);
          allies = others.slice(0, 4);
          enemies = others.slice(4, 9);
        }

        const makeTeamCol = (players, maxRows = 4) => {
          const rows = (Array.isArray(players) ? players : []).slice(0, maxRows);
          if (rows.length === 0) {
            return `
              <div class="mc-teammate mc-teammate-empty">
                <span class="mc-teammate-name">No player data</span>
              </div>`;
          }

          return rows.map(p => `
          <div class="mc-teammate" data-tooltip="${p.championName || 'Unknown Champion'}" title="${p.championName || 'Unknown Champion'}">
            <img src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${p.championName}.png"
                 alt="${p.championName}" class="mc-teammate-icon" onerror="this.src='/images/sample_hero.png'">
            <span class="mc-teammate-name">${(p.riotIdGameName || p.summonerName || '').substring(0, 10)}</span>
          </div>`).join('');
        };
        // Items: always render 8 slots, but keep bought items first so empty slots stay on the right.
        const rawItemIds = [player.item0, player.item1, player.item2, player.item3, player.item4, player.item5, player.item6]
          .map((value) => Number(value) || 0);
        const boughtItemIds = rawItemIds.filter((value) => value > 0);
        const emptySlotCount = Math.max(0, 8 - boughtItemIds.length);
        const itemIds = [...boughtItemIds, ...Array(emptySlotCount).fill(0)].slice(0, 8);
        const makeItemSlot = (id) => {
          const itemId = Number(id);
          if (!itemId || itemId <= 0) return `<span class="mc-item-empty"></span>`;
          return `<img src="https://ddragon.leagueoflegends.com/cdn/16.5.1/img/item/${itemId}.png" class="mc-item-icon" data-tooltip="Item ${itemId}" onerror="window.logMissingOverviewItemIcon && window.logMissingOverviewItemIcon(${itemId}, this.src, '${matchId}');this.onerror=null;this.outerHTML='<span class=&quot;mc-item-empty&quot;></span>';">`;
        };
        const itemRow = itemIds.map(makeItemSlot).join('');
        const spellImg = (id) => {
          const name = SUMMONER_SPELL_MAP[id];
          const imageUrl = name
            ? `https://ddragon.leagueoflegends.com/cdn/16.5.1/img/spell/${name}.png`
            : null;

          if (name && imageUrl) {
            console.log("[SPELL ICON] Rendering summoner spell image", {
              spellId: id,
              spellName: name,
              matchId,
              imageUrl
            });
          }

          const SPELL_DISPLAY_NAMES = { SummonerDot: 'Ignite' };
          const displayName = SPELL_DISPLAY_NAMES[name] || name.replace('Summoner', '');
          return name
            ? `<img src="${imageUrl}" class="mc-spell-icon" title="${displayName}" onerror="window.logMissingOverviewSpellIcon && window.logMissingOverviewSpellIcon(${id}, '${name}', this.src, '${matchId}');this.style.display='none'">`
            : `<span class="mc-spell-empty"></span>`;
        };

        const primaryPerkId = Number(player.perks?.styles?.[0]?.selections?.[0]?.perk) || 0;
        const secondaryStyleId = Number(player.perks?.styles?.[1]?.style) || 0;

        const perkImg = (id, type) => {
          const perkId = Number(id) || 0;
          if (!perkId) return `<span class="mc-perk-empty"></span>`;

          const imagePath = type === 'keystone' ? PERK_ICON_MAP[perkId] : PERK_STYLE_ICON_MAP[perkId];
          const primaryUrl = imagePath
            ? `https://ddragon.leagueoflegends.com/cdn/img/perk-images/${imagePath}`
            : null;
          const fallbackUrl = imagePath
            ? `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/${imagePath.toLowerCase()}`
            : null;
            const perkLabel = type === 'keystone'
              ? (PERK_NAME_MAP[perkId] || `Keystone ${perkId}`)
              : (PERK_STYLE_NAME_MAP[perkId] || `Secondary ${perkId}`);

          return primaryUrl
            ? `<img src="${primaryUrl}" class="mc-perk-icon" title="${perkLabel}" data-fallback-src="${fallbackUrl || ''}" onerror="const fallback=this.getAttribute('data-fallback-src');if(fallback && this.src!==fallback){this.src=fallback;this.removeAttribute('data-fallback-src');return;}window.logMissingOverviewPerkIcon && window.logMissingOverviewPerkIcon(${perkId}, '${perkLabel}', this.src, '${matchId}');this.onerror=null;this.outerHTML='<span class=&quot;mc-perk-empty&quot;></span>'">`
            : `<span class="mc-perk-empty"></span>`;
        };

        const champLevel = player.champLevel || '';
        const card = document.createElement('div');
        card.className = `match-card ${isWin ? 'mc-win' : 'mc-loss'}`;
        card.innerHTML = `
          <div class="mc-meta">
            <div class="mc-queue" data-tooltip="Game Mode">${queueName}</div>
            <div class="mc-date" data-tooltip="Date played">${gameDate}</div>
            <div class="mc-result ${isWin ? 'mc-win-text' : 'mc-loss-text'}" data-tooltip="Result &amp; Duration">${isWin ? 'WIN' : 'LOSS'} ${durationMin}:${String(durationSec).padStart(2, '0')}</div>
          </div>
          <div class="mc-champ-col">
            <div class="mc-champ-wrapper">
              <img src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${player.championName}.png"
                   alt="${player.championName}" class="mc-champ-icon" data-tooltip="${player.championName}" onerror="this.src='/images/sample_hero.png'">
              ${champLevel ? `<span class="mc-champ-level">${champLevel}</span>` : ''}
            </div>
            <div class="mc-summoner-spells">
              ${spellImg(player.summoner1Id)}
              ${spellImg(player.summoner2Id)}
            </div>
            <div class="mc-perk-icons">
              ${perkImg(primaryPerkId, 'keystone')}
              ${perkImg(secondaryStyleId, 'style')}
            </div>
          </div>
          <div class="mc-items">
            <div class="mc-items-row">${itemRow}</div>
          </div>
          <div class="mc-kda">
            <div class="mc-kda-scores" data-tooltip="Kills / Deaths / Assists">${player.kills} / <span class="mc-deaths">${player.deaths}</span> / ${player.assists}</div>
            <div class="mc-kda-ratio" data-tooltip="KDA Ratio">${kdaRatio} KDA</div>
          </div>
          <div class="mc-cs-vision">
            <div class="mc-cs" data-tooltip="Creep Score (CS per Minute)">${totalCs} CS (${csPerMin})</div>
            <div class="mc-vision" data-tooltip="Vision Score">${visionScore} vision</div>
          </div>
          <div class="mc-teams">
            <div class="mc-team-col">${makeTeamCol(allies, 4)}</div>
            <div class="mc-team-col">${makeTeamCol(enemies, 5)}</div>
          </div>`;
        container.appendChild(card);
      });
    }

    function refreshOverviewStats(useRiotApi = false) {
      const btn = document.getElementById("player-dropdown-btn");
      const puuid = btn?.getAttribute("data-puuid");
      if (!puuid) return;

      const selectedTeamPosition = getSelectedTeamPosition();

      const matchFetch = useRiotApi ? api.fetchRecentMatches : api.fetchRecentMatchesFromDatabase;
      matchFetch(puuid, state.currentQueueId, selectedTeamPosition)
        .then(() => {
          renderMatchHistory(PA.cache.matches, puuid);
          return api.fetchWinrate(puuid, state.currentQueueId, selectedTeamPosition);
        })
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
              if (PA.cache.matches) {
                const cachedPuuid = document.getElementById("player-dropdown-btn")?.getAttribute("data-puuid");
                if (cachedPuuid) renderMatchHistory(PA.cache.matches, cachedPuuid);
              }
            }

          }) // End of "then" statement
          .catch((err) => console.log("Error loading overlay:", err));
      });
    });
  });
})();