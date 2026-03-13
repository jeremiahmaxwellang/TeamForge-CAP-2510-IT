/**
 * Applicant Profile Manager
 * Handles: Navigation, Stats, Comparison (Radar), and Evaluation
 */
document.addEventListener("DOMContentLoaded", async function () {

  const RANK_ICON_BASE_URL = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests';
  
  // function to extract rank tier from rank string (e.g. "Gold IV" -> "gold")
  const validRankTiers = new Set([
    'iron',
    'bronze',
    'silver',
    'gold',
    'platinum',
    'emerald',
    'diamond',
    'master',
    'grandmaster',
    'challenger',
    'unranked'
  ]);

  // Extracts the rank tier (e.g. "Gold IV" -> "gold") for icon mapping
  function getRankTier(rankValue) {
    if (!rankValue || typeof rankValue !== 'string') return 'unranked';

    const firstWord = rankValue.trim().split(/\s+/)[0].toLowerCase();
    return validRankTiers.has(firstWord) ? firstWord : 'unranked';
  }

  // Maps rank string to corresponding icon URL
  function getRankIconUrl(rankValue) {
    const tier = getRankTier(rankValue);
    const filename = tier === 'emerald' ? 'emerald_tft.svg' : `${tier}.png`;
    return `${RANK_ICON_BASE_URL}/${filename}`;
  }
  
  // State Management
  const state = {
    allApplicants: [],
    rosterPlayers: [], // ADDED: Holds current team members
    currentIndex: 0,
    currentApplicant: null,
    benchmarkData: null,
    selectedRoleId: null,
    comparisonTarget: 'benchmark' // ADDED
  };

  // DOM Elements Map (Fixed IDs to match HTML)
  const UI = {
    name: document.getElementById('app-name'),
    ign: document.getElementById('applicant-dropdown'),
    rolePrimary: document.getElementById('text-primary-role'), // FIXED ID
    roleSecondary: document.getElementById('text-secondary-role'), // FIXED ID
    email: document.getElementById('app-email'),
    discord: document.getElementById('app-discord'),
    
    currentRankImg: document.getElementById('img-current-rank'),
    currentRankText: document.getElementById('text-current-rank'),
    peakRankImg: document.getElementById('img-peak-rank'),
    peakRankText: document.getElementById('text-peak-rank'),
    studentYear: document.getElementById('student-year'),
    studentCourse: document.getElementById('student-course'),
    studentGpa: document.getElementById('student-gpa'),
    studentCgpa: document.getElementById('student-cgpa'),

    winrate: document.getElementById('stat-winrate'),
    kda: document.getElementById('stat-kda'),
    topChamps: document.getElementById('top-champs-container'),

    btnPrev: document.getElementById('btn-prev-applicant'),
    btnNext: document.getElementById('btn-next-applicant'),
    
    chartContainer: document.getElementById('radar-chart'),
    statsContainer: document.getElementById('stats-list'), // New Table Container
    comparisonSelect: document.getElementById('comparison-select'), // ADDED
    
    btnConfirmEval: document.getElementById('btn-confirm-eval'),
    commentBox: document.getElementById('eval-comment')
  };

  await init();

  async function init() {
    console.log("[APPLICANT] Initializing Profile...");
    
    // 1. Fetch Applicants
    try {
      const appResp = await fetch('/applicant_list/getall');
      if (appResp.ok) {
          const appData = await appResp.json();
          if (appData.success) state.allApplicants = appData.applicants || [];
      }
    } catch (e) {
      console.error("[APPLICANT] Failed to load applicants:", e);
    }

    // 2. Fetch Roster (Using the verified URL!)
    try {
      const rosterResp = await fetch('/player_analysis/players'); 
      if (rosterResp.ok) {
          const rosterData = await rosterResp.json();
          state.rosterPlayers = Array.isArray(rosterData) ? rosterData : (rosterData.players || rosterData.data || []);
      } else {
          console.warn(`[APPLICANT] Roster fetch returned status ${rosterResp.status}.`);
      }
    } catch (e) {
      console.warn("[APPLICANT] Failed to load roster:", e);
    }

    // 3. Load UI safely
    try {
        if (state.allApplicants.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlId = urlParams.get('id');
            
            if (urlId) {
              state.currentIndex = state.allApplicants.findIndex(a => a.userId == urlId);
              if (state.currentIndex === -1) state.currentIndex = 0;
            }
            loadProfile(state.currentIndex);
        } else {
            console.warn("[APPLICANT] No applicants found in database.");
            if(UI.name) UI.name.textContent = "No applicants found";
        }
    } catch (e) {
        console.error("[APPLICANT] Error loading profile UI:", e);
    }
    
    setupEventListeners();
  }

  // ==========================================
  // CORE PROFILE LOADING
  // ==========================================
  async function loadProfile(index) {
    if (index < 0 || index >= state.allApplicants.length) return;
    
    const applicant = state.allApplicants[index];
    state.currentApplicant = applicant;
    state.currentIndex = index;

    const newUrl = `${window.location.pathname}?id=${applicant.userId}`;
    window.history.pushState({path: newUrl}, '', newUrl);

    // Header & Contact
    UI.name.innerHTML = `${applicant.firstname} ${applicant.lastname} <span style="color: #00f2c3; font-weight: bold; margin-left: 8px;">(${getRoleName(applicant.primaryRoleId)})</span>`;
    
    if (UI.ign.options.length <= 1 || UI.ign.options[0].text === 'Loading...') {
        UI.ign.innerHTML = '';
        state.allApplicants.forEach((app, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `${app.gameName} #${app.tagLine}`;
            UI.ign.appendChild(opt);
        });
        UI.ign.addEventListener('change', (e) => loadProfile(parseInt(e.target.value)));
    }
    UI.ign.value = state.currentIndex;

    UI.email.textContent = applicant.email || 'N/A';
    UI.discord.textContent = applicant.discord || 'N/A';
    
    // Ranks & Images (With Fallbacks for broken links)
    UI.currentRankText.textContent = applicant.currentRank || 'Unranked';
    UI.peakRankText.textContent = applicant.peakRank || 'Unranked';
    
    // Use the Community Dragon helper functions to load the images
    if (UI.currentRankImg) {
        UI.currentRankImg.src = getRankIconUrl(applicant.currentRank);
        UI.currentRankImg.onerror = function() {
            this.onerror = null; // Prevent loop
            this.src = getRankIconUrl('unranked'); // Fallback to Community Dragon unranked icon
        };
    }
    
    if (UI.peakRankImg) {
        UI.peakRankImg.src = getRankIconUrl(applicant.peakRank);
        UI.peakRankImg.onerror = function() {
            this.onerror = null; // Prevent loop
            this.src = getRankIconUrl('unranked'); // Fallback to Community Dragon unranked icon
        };
    }

    // Student Info (Removed repetitive text labels)
    UI.studentYear.textContent = applicant.yearLevel || 'N/A';
    UI.studentCourse.textContent = applicant.course || 'N/A';
    UI.studentGpa.textContent = applicant.lastGPA || '-';
    UI.studentCgpa.textContent = applicant.CGPA || '-';

    // Roles
    if (UI.rolePrimary) UI.rolePrimary.textContent = getRoleName(applicant.primaryRoleId);
    if (UI.roleSecondary) UI.roleSecondary.textContent = applicant.secondaryRoleId ? getRoleName(applicant.secondaryRoleId) : 'None';

    state.selectedRoleId = applicant.primaryRoleId;
    const btnPrimary = document.getElementById('btn-primary-role');
    const btnSecondary = document.getElementById('btn-secondary-role');

    if (btnPrimary && btnSecondary) {
        btnPrimary.classList.add('active');
        btnSecondary.classList.remove('active');

        if (!applicant.secondaryRoleId) {
            btnSecondary.disabled = true;
            btnSecondary.style.opacity = '0.5';
            btnSecondary.style.cursor = 'not-allowed';
        } else {
            btnSecondary.disabled = false;
            btnSecondary.style.opacity = '1';
            btnSecondary.style.cursor = 'pointer';
        }
    }

    populateComparisonDropdown(); // ADDED: Refresh dropdown to exclude the current applicant
    // Fetch Stats
    fetchStats(applicant.userId, state.selectedRoleId);
  }

function populateComparisonDropdown() {
    if (!UI.comparisonSelect) return;
    
    const currentSelection = UI.comparisonSelect.value || 'benchmark';
    UI.comparisonSelect.innerHTML = '<option value="benchmark">🏆 Coach Benchmark (Target)</option>';
    
    // --- 1. CURRENT TEAM ROSTER ---
    if (state.rosterPlayers && state.rosterPlayers.length > 0) {
        const rosterGroup = document.createElement('optgroup');
        rosterGroup.label = "Current Team Roster";
        
        state.rosterPlayers.forEach(player => {
            const opt = document.createElement('option');
            opt.value = player.userId || player.id; // Handles different DB column names
            // Fallback for names in case they use summonerName instead of gameName
            const nameStr = player.gameName ? `${player.gameName}#${player.tagLine}` : (player.summonerName || `Player`);
            opt.textContent = `${nameStr} (${getRoleName(player.primaryRoleId)})`;
            rosterGroup.appendChild(opt);
        });
        UI.comparisonSelect.appendChild(rosterGroup);
    }

    // --- 2. OTHER APPLICANTS ---
    if (state.allApplicants && state.allApplicants.length > 0) {
        const appGroup = document.createElement('optgroup');
        appGroup.label = "Other Applicants";
        
        state.allApplicants.forEach(app => {
          if (app.userId == state.currentApplicant.userId) return; 
          const opt = document.createElement('option');
          opt.value = app.userId;
          opt.textContent = `${app.gameName}#${app.tagLine} (${getRoleName(app.primaryRoleId)})`;
          appGroup.appendChild(opt);
        });
        UI.comparisonSelect.appendChild(appGroup);
    }
    
    // Restore selection safely
    if (Array.from(UI.comparisonSelect.options).some(o => o.value == currentSelection)) {
        UI.comparisonSelect.value = currentSelection;
        state.comparisonTarget = currentSelection;
    } else {
        UI.comparisonSelect.value = 'benchmark';
        state.comparisonTarget = 'benchmark';
    }
  }

  // ==========================================
  // STATS, RADAR CHART, AND TABLE
  // ==========================================
  
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
    "Total Wards Placed": 45, "Total Wards Destroyed": 15, "Kills": 8, "Assists": 12, "Deaths": 5
  };

  async function fetchStats(userId, roleId) {
    UI.winrate.textContent = "Loading...";
    UI.kda.textContent = "Loading...";
    if (UI.topChamps) UI.topChamps.innerHTML = "<span>Loading...</span>";

    try {
      const target = state.comparisonTarget || 'benchmark';
      
      const fetches = [
         fetch('/player_analysis/calculate-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId: userId, roleId: roleId || 1 })
         }).catch(() => null),
         fetch(`/player_analysis/api/benchmarks/${roleId || 1}`).catch(() => null)
      ];

      // If comparing to another player, FORCE them to be evaluated on the currently toggled role
      if (target !== 'benchmark') {
         fetches.push(
             fetch('/player_analysis/calculate-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: target, roleId: roleId || 1 }) 
             }).catch(() => null)
         );
      }

      const responses = await Promise.all(fetches);
      const data = responses[0] ? await responses[0].json() : null;
      const benchData = responses[1] ? await responses[1].json() : null;
      const targetData = responses[2] ? await responses[2].json() : null;
      
      const pStats = data && data.playerStats ? data.playerStats : null;
      const benchmarks = Array.isArray(benchData) ? benchData : (benchData && benchData.benchmarks ? benchData.benchmarks : []);

      if (data && data.success && pStats) {
        UI.winrate.textContent = `${pStats.winrate || 50}% WR`;
        UI.kda.textContent = `${pStats.KDA || pStats.kda || '0.00'} KDA`;

        if(pStats.topChampions && pStats.topChampions.length > 0) {
            UI.topChamps.innerHTML = pStats.topChampions.map(c => `<span style="background:#444; padding:3px 10px; border-radius:6px;">${c}</span>`).join('');
        } else {
            UI.topChamps.innerHTML = "<span>No Champ Data</span>";
        }

        let p2Stats = null;
        let p2Name = "Expected Stats";
        let p2Role = "Coach";
        let isBenchmark = true;

        if (target !== 'benchmark') {
            p2Stats = targetData && targetData.playerStats ? targetData.playerStats : null;
            isBenchmark = false;
            
            // Search both lists combined to find the target player
            const allPlayers = [...state.allApplicants, ...state.rosterPlayers];
            const targetApp = allPlayers.find(a => (a.userId || a.id) == target);
            
            if (targetApp) {
                const nameStr = targetApp.gameName ? `${targetApp.gameName}#${targetApp.tagLine}` : (targetApp.summonerName || "Player");
                p2Name = nameStr;
                p2Role = `Compared as ${getRoleName(roleId || 1)}`; 
            } else {
                p2Name = "Other Player";
                p2Role = getRoleName(roleId || 1);
            }
        } else {
            p2Stats = benchmarks;
            p2Role = `Expected ${getRoleName(roleId || 1)}`; 
        }

        drawComparisonChart(pStats, p2Stats, benchmarks, isBenchmark);
        drawStatsTable(pStats, p2Stats, benchmarks, roleId, isBenchmark, p2Name, p2Role);
      } else {
        throw new Error("No match data returned.");
      }
    } catch (e) {
      console.warn("[APPLICANT] Stats fallback triggered due to missing data:", e);
      UI.winrate.textContent = "--% WR";
      UI.kda.textContent = "-- KDA";
      if(UI.topChamps) UI.topChamps.innerHTML = "<span>No Data</span>";
      UI.chartContainer.innerHTML = "<div style='text-align:center; padding: 40px; color:#888; font-weight:bold;'>No recent match data available for this role.</div>";
      if(UI.statsContainer) UI.statsContainer.innerHTML = "";
    }
  }

  function calculateRadarScore(playerValue, statId, benchmarks) {
    const normalizedId = statId.toLowerCase().replace(/\s/g, '');
    const dbMatch = benchmarks.find(b => b.metricName && b.metricName.toLowerCase().replace(/\s/g, '') === normalizedId);
    let maxScale = (dbMatch && Number(dbMatch.benchmarkValue) > 0) ? Number(dbMatch.benchmarkValue) * 1.25 : (FALLBACK_SCALES[statId] || 10);
    return Math.min((Number(playerValue) / maxScale) * 10, 10);
  }

function drawComparisonChart(p1Stats, p2Stats, benchmarks, isBenchmark) {
    const roleId = state.selectedRoleId || 1;
    const config = ROLE_CONFIGS[roleId] || ROLE_CONFIGS.default;

    const p1Axes = config.axes.map(a => {
      const val = Number(p1Stats[a.id]) || Number(p1Stats[a.id.replace(/\s/g, '')]) || 0;
      return { axis: a.label, value: calculateRadarScore(val, a.id, benchmarks) };
    });

    const p2Axes = config.axes.map(a => {
      let val;
      if (isBenchmark) {
          const normalizedId = a.id.toLowerCase().replace(/\s/g, '');
          const dbMatch = benchmarks.find(b => b.metricName && b.metricName.toLowerCase().replace(/\s/g, '') === normalizedId);
          val = dbMatch ? Number(dbMatch.benchmarkValue) : (FALLBACK_SCALES[a.id] * 0.8);
      } else {
          val = p2Stats ? (Number(p2Stats[a.id]) || Number(p2Stats[a.id.replace(/\s/g, '')]) || 0) : 0;
      }
      return { axis: a.label, value: calculateRadarScore(val, a.id, benchmarks) };
    });

    UI.chartContainer.innerHTML = ""; 
    RadarChart.defaultConfig.w = 280;
    RadarChart.defaultConfig.h = 280;
    RadarChart.defaultConfig.maxValue = 10;
    RadarChart.draw("#radar-chart", [
      { className: "Applicant", axes: p1Axes },
      { className: "Benchmark", axes: p2Axes } 
    ]);
  }

  function drawStatsTable(p1Stats, p2Stats, benchmarks, roleId, isBenchmark, p2Name, p2Role) {
    if (!UI.statsContainer) return;

    const config = ROLE_CONFIGS[roleId] || ROLE_CONFIGS.default;
    const p1Name = state.currentApplicant.gameName ? `${state.currentApplicant.gameName}#${state.currentApplicant.tagLine}` : 'Applicant';
    
    // Ensure Player 1's table column also clearly shows the currently toggled role
    const p1RoleStr = getRoleName(roleId || state.selectedRoleId);
    
    const coreGood = [
        { id: "Kills", label: "Kills" }, { id: "Assists", label: "Assists" },
        { id: "KDA", label: "KDA" }, { id: "CS Per Minute", label: "CS/Min" }, { id: "Gold Per Minute", label: "Gold/Min" }
    ];
    config.axes.forEach(a => { if (!coreGood.find(g => g.id === a.id) && a.id !== "Deaths") coreGood.push(a); });
    
    const coreBad = [{ id: "Deaths", label: "Deaths" }];

    const getStat = (statsObj, id) => {
        if (!statsObj) return 0;
        const cleanId = id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        for (let key in statsObj) {
            const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (cleanKey === cleanId || cleanKey === "average" + cleanId) return Number(statsObj[key]);
        }
        return 0;
    };

    const getBench = (benchmarksList, id) => {
        const cleanId = id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const found = benchmarksList.find(b => b.metricName && b.metricName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') === cleanId);
        return found ? Number(found.benchmarkValue) : (FALLBACK_SCALES[id] * 0.8 || 0);
    };

    const formatNum = (num) => Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });

    let html = `
      <table class="comparison-table" style="width: 100%; text-align: center; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="border-bottom: 2px solid #ddd;">
            <th style="padding: 10px; width: 33%; font-size: 14px; color:#333;">${p1Name} <br><span style="font-size:11px; color:#00f2c3;">(${p1RoleStr})</span></th>
            <th style="padding: 10px; width: 34%; color:#333;">Metric</th>
            <th style="padding: 10px; width: 33%; font-size: 14px; color:#00f2c3;">${p2Name} <br><span style="font-size:11px; color:#888;">(${p2Role})</span></th>
          </tr>
        </thead>
        <tbody>
    `;

    html += `<tr><td colspan="3" style="padding: 6px; background: rgba(76, 175, 80, 0.1); color: #4CAF50; font-weight: bold; font-size: 12px; text-transform: uppercase;">Positive Indicators (Higher is Better)</td></tr>`;
    coreGood.forEach(m => {
      const val1 = getStat(p1Stats, m.id);
      const val2 = isBenchmark ? getBench(benchmarks, m.id) : getStat(p2Stats, m.id);
      
      let p1Style = "padding: 8px;", p2Style = "padding: 8px;";
      if (val1 > val2) { p1Style += " color: #4CAF50; font-weight: bold;"; p2Style += " color: #f44336; font-weight: bold;"; }
      else if (val2 > val1) { p2Style += " color: #4CAF50; font-weight: bold;"; p1Style += " color: #f44336; font-weight: bold;"; }

      html += `<tr style="border-bottom: 1px solid #eee;">
        <td style="${p1Style}">${formatNum(val1)}</td>
        <td style="padding: 8px; font-weight: bold; background-color: #f9f9f9; color: #333;">${m.label}</td>
        <td style="${p2Style}">${formatNum(val2)}</td>
      </tr>`;
    });

    html += `<tr><td colspan="3" style="padding: 6px; background: rgba(244, 67, 54, 0.1); color: #f44336; font-weight: bold; font-size: 12px; text-transform: uppercase; border-top: 2px solid #ddd;">Negative Indicators (Lower is Better)</td></tr>`;
    coreBad.forEach(m => {
      const val1 = getStat(p1Stats, m.id);
      const val2 = isBenchmark ? (getBench(benchmarks, m.id) > 0 ? getBench(benchmarks, m.id) : 5) : getStat(p2Stats, m.id);
      
      let p1Style = "padding: 8px;", p2Style = "padding: 8px;";
      if (val1 < val2) { p1Style += " color: #4CAF50; font-weight: bold;"; p2Style += " color: #f44336; font-weight: bold;"; }
      else if (val2 < val1) { p2Style += " color: #4CAF50; font-weight: bold;"; p1Style += " color: #f44336; font-weight: bold;"; }

      html += `<tr style="border-bottom: 1px solid #eee;">
        <td style="${p1Style}">${formatNum(val1)}</td>
        <td style="padding: 8px; font-weight: bold; background-color: #f9f9f9; color: #333;">${m.label}</td>
        <td style="${p2Style}">${formatNum(val2)}</td>
      </tr>`;
    });

    html += `</tbody></table>`;
    UI.statsContainer.innerHTML = html;
  }

  // ==========================================
  // EVENT LISTENERS & HELPERS
  // ==========================================
  function setupEventListeners() {
    const btnPrimary = document.getElementById('btn-primary-role');
    const btnSecondary = document.getElementById('btn-secondary-role');

    if (UI.comparisonSelect) {
        UI.comparisonSelect.addEventListener('change', (e) => {
            state.comparisonTarget = e.target.value;
            fetchStats(state.currentApplicant.userId, state.selectedRoleId);
        });
    }

    if (btnPrimary) {
        btnPrimary.addEventListener('click', () => {
            if (!state.currentApplicant) return;
            state.selectedRoleId = state.currentApplicant.primaryRoleId;
            btnPrimary.classList.add('active');
            if(btnSecondary) btnSecondary.classList.remove('active');
            fetchStats(state.currentApplicant.userId, state.selectedRoleId);
        });
    }

    if (btnSecondary) {
        btnSecondary.addEventListener('click', () => {
            if (!state.currentApplicant || !state.currentApplicant.secondaryRoleId) return;
            state.selectedRoleId = state.currentApplicant.secondaryRoleId;
            btnSecondary.classList.add('active');
            if(btnPrimary) btnPrimary.classList.remove('active');
            fetchStats(state.currentApplicant.userId, state.selectedRoleId);
        });
    }
    
    UI.btnPrev.addEventListener('click', () => loadProfile(state.currentIndex > 0 ? state.currentIndex - 1 : state.allApplicants.length - 1));
    UI.btnNext.addEventListener('click', () => loadProfile(state.currentIndex < state.allApplicants.length - 1 ? state.currentIndex + 1 : 0));

    // --- EVALUATION & FINAL DECISION ---
    const btnAccept = document.querySelector('.btn-accept');
    const btnReject = document.querySelector('.btn-reject');
    const btnConfirm = document.getElementById('btn-confirm-eval');

    async function submitEvaluation(finalStatus) {
        if (!state.currentApplicant || !state.currentApplicant.userId) return alert("No applicant loaded yet!");

        const gameSenseEl = document.querySelector('input[name="gameSense"]:checked');
        const commsEl = document.querySelector('input[name="communication"]:checked');
        const champPoolEl = document.querySelector('input[name="champPool"]:checked');

        const evaluationData = {
            userId: state.currentApplicant.userId,
            coachId: 1, 
            notes: UI.commentBox ? UI.commentBox.value : "",
            gameSense: gameSenseEl ? parseInt(gameSenseEl.value, 10) : 0,
            communication: commsEl ? parseInt(commsEl.value, 10) : 0,
            champPool: champPoolEl ? parseInt(champPoolEl.value, 10) : 0,
            status: finalStatus
        };

        try {
            const resp = await fetch('/applicant_list/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(evaluationData)
            });
            const result = await resp.json();
            if (result.success) {
                alert(`Evaluation saved! Applicant status is now: ${finalStatus}`);
                if (finalStatus === 'Accepted' || finalStatus === 'Rejected') window.location.href = '/applicant_list';
            } else alert("Failed to save: " + result.message);
        } catch (error) {
            console.error("Error:", error);
            alert("Database connection error. Check console.");
        }
    }

    if (btnConfirm) btnConfirm.addEventListener('click', () => submitEvaluation('Evaluated'));
    if (btnAccept) btnAccept.addEventListener('click', () => { if (confirm("Are you sure you want to ACCEPT this applicant?")) submitEvaluation('Accepted'); });
    if (btnReject) btnReject.addEventListener('click', () => { if (confirm("Are you sure you want to REJECT this applicant?")) submitEvaluation('Rejected'); });
  }

  function getRoleName(id) {
    const roles = {1:'Top', 2:'Jungle', 3:'Mid', 4:'ADC', 5:'Support'};
    return roles[id] || 'Flex';
  }

});