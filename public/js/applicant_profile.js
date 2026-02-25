/**
 * Applicant Profile Manager
 * Handles: Navigation, Stats, Comparison (Radar), and Evaluation
 */
document.addEventListener("DOMContentLoaded", async function () {
  
  // State Management
  const state = {
    allApplicants: [],
    currentIndex: 0,
    currentApplicant: null,
    benchmarkData: null
  };

  // DOM Elements Map (Matches your Design Image)
  const UI = {
    // Header
    name: document.getElementById('app-name'),
    ign: document.getElementById('app-ign'),
    rolePrimary: document.getElementById('app-role-primary'),
    roleSecondary: document.getElementById('app-role-secondary'),
    email: document.getElementById('app-email'),
    discord: document.getElementById('app-discord'),
    
    // Ranks & School
    currentRankImg: document.getElementById('img-current-rank'),
    currentRankText: document.getElementById('text-current-rank'),
    peakRankImg: document.getElementById('img-peak-rank'),
    peakRankText: document.getElementById('text-peak-rank'),
    studentYear: document.getElementById('student-year'),
    studentCourse: document.getElementById('student-course'),
    studentGpa: document.getElementById('student-gpa'),
    studentCgpa: document.getElementById('student-cgpa'),

    // Stats Bar
    winrate: document.getElementById('stat-winrate'),
    kda: document.getElementById('stat-kda'),
    topChamps: document.getElementById('top-champs-container'),

    // Navigation
    btnPrev: document.getElementById('btn-prev-applicant'),
    btnNext: document.getElementById('btn-next-applicant'),
    
    // Comparison
    chartContainer: document.getElementById('radar-chart'),
    comparisonSelect: document.getElementById('comparison-select'), // Dropdown for "Expected Stats" vs "Other Jungler"
    
    // Evaluation
    btnConfirmEval: document.getElementById('btn-confirm-eval'),
    commentBox: document.getElementById('eval-comment')
  };

  // Initialize
  await init();

  async function init() {
    console.log("[APPLICANT] Initializing Profile...");
    
    // 1. Fetch List of All Applicants for Navigation
    try {
      const resp = await fetch('/applicant_list/getall');
      const data = await resp.json();
      if(data.success) {
        state.allApplicants = data.applicants;
        
        // Check URL for ?id=123, otherwise default to first
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');
        
        if (urlId) {
          state.currentIndex = state.allApplicants.findIndex(a => a.userId == urlId);
          if (state.currentIndex === -1) state.currentIndex = 0;
        }
        
        loadProfile(state.currentIndex);
      }
    } catch (e) {
      console.error("Failed to load applicant list", e);
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

    // update URL without reload
    const newUrl = `${window.location.pathname}?id=${applicant.userId}`;
    window.history.pushState({path: newUrl}, '', newUrl);

    // 1. Fill Text Data
    UI.name.textContent = `${applicant.firstname} ${applicant.lastname}`;
    UI.ign.textContent = `${applicant.gameName} #${applicant.tagLine}`;
    UI.rolePrimary.textContent = `Primary Role: ${getRoleName(applicant.primaryRoleId)}`;
    UI.roleSecondary.textContent = `Secondary Role: ${getRoleName(applicant.secondaryRoleId) || 'None'}`;
    UI.email.textContent = applicant.email || 'N/A';
    UI.discord.textContent = applicant.discord || 'N/A';
    
    UI.currentRankText.textContent = applicant.currentRank || 'Unranked';
    UI.peakRankText.textContent = applicant.peakRank || 'Unranked';
    // Update Rank Images 
    if(UI.currentRankImg) UI.currentRankImg.src = `/images/ranks/rank_${(applicant.currentRank || 'unranked').split(' ')[0].toLowerCase()}.png`;

    UI.studentYear.textContent = `Year Level: ${applicant.yearLevel || 'N/A'}`;
    UI.studentCourse.textContent = `Course: ${applicant.course || 'N/A'}`;
    UI.studentGpa.textContent = `GPA Last Term: ${applicant.lastGPA || '-'}`;
    UI.studentCgpa.textContent = `CGPA: ${applicant.CGPA || '-'}`;

    // 2. Fetch & Calc Stats 
    fetchStats(applicant.userId, applicant.primaryRoleId);

    // 3. Load Comparison Benchmarks
    loadComparisonTools(applicant.userId, applicant.primaryRoleId);
  }

  // ==========================================
  // STATS & VISUALIZATION
  // ==========================================
  async function fetchStats(userId, roleId) {
    UI.winrate.textContent = "Loading...";
    
    try {
      // Use the calculation route we fixed earlier
      const resp = await fetch('/player_analysis/calculate-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: userId, roleId: roleId || 1 })
      });
      
      const data = await resp.json();
      
      if (data.success && data.playerStats) {
        // Display Winrate
        const wr = data.playerStats.winrate || 50; // default if missing
        UI.winrate.textContent = `${wr}% WR`;
        UI.kda.textContent = `${data.playerStats.KDA || '0.00'} KDA`;

        // Draw Radar Chart (Applicant vs Benchmark)
        drawComparisonChart(data.playerStats, data.benchmarkComparison);
      } else {
        UI.winrate.textContent = "N/A";
        UI.chartContainer.innerHTML = "<p>No match data found.</p>";
      }

    } catch (e) {
      console.error("Stats Error:", e);
      UI.winrate.textContent = "Err";
    }
  }

  // ==========================================
  // COMPARISON TOOL (Radar Chart)
  // ==========================================
  function drawComparisonChart(playerStats, benchmarks) {
    // 1. Convert Benchmarks to Radar Axes
    const axes = [
      { axis: "KDA", value: Math.min(playerStats.KDA || 0, 10) },
      { axis: "CS/M", value: Math.min(playerStats['CS Per Minute'] || 0, 10) },
      { axis: "Gold/M", value: Math.min((playerStats['Gold Per Minute'] || 0) / 100, 10) }, // Scale down gold
      { axis: "KP%", value: Math.min((playerStats['Kill Participation'] || 0) / 10, 10) },
      { axis: "Dmg%", value: Math.min((playerStats['Damage Share'] || 0) / 5, 10) }
    ];

    // Create Dummy Benchmark Data (Target)
    const benchmarkAxes = axes.map(a => ({ axis: a.axis, value: 7 })); // Target value of 7/10

    const chartData = [
      { className: "Applicant", axes: axes },
      { className: "Benchmark", axes: benchmarkAxes } 
    ];

    // Draw using your existing library
    UI.chartContainer.innerHTML = ""; 
    RadarChart.defaultConfig.w = 300;
    RadarChart.defaultConfig.h = 300;
    RadarChart.draw("#radar-chart", chartData);
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  function setupEventListeners() {
    UI.btnPrev.addEventListener('click', () => {
      const newIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.allApplicants.length - 1;
      loadProfile(newIndex);
    });

    UI.btnNext.addEventListener('click', () => {
      const newIndex = state.currentIndex < state.allApplicants.length - 1 ? state.currentIndex + 1 : 0;
      loadProfile(newIndex);
    });

    // Evaluation Form Logic
    if (UI.btnConfirmEval) {
      UI.btnConfirmEval.addEventListener('click', async () => {
        const comment = UI.commentBox.value;
        // Collect radio button values (pseudo-code, depends on your HTML)
        // const gameSense = document.querySelector('input[name="gamesense"]:checked').value;
        
        alert(`Evaluation Saved for ${state.currentApplicant.gameName}! \n(Note: Connect this to /api/evaluations/save)`);
      });
    }
    
    // Comparison Dropdown Logic
    if (UI.comparisonSelect) {
        UI.comparisonSelect.addEventListener('change', (e) => {
            const mode = e.target.value; // "benchmark" or "applicant-id"
            if (mode === 'benchmark') {
                // Redraw with benchmark
            } else {
                // Fetch other applicant stats and redraw radar with 2 players
            }
        });
    }
  }

  // Helper
  function getRoleName(id) {
    const roles = {1:'Top', 2:'Jungle', 3:'Mid', 4:'ADC', 5:'Support'};
    return roles[id] || 'Flex';
  }

});