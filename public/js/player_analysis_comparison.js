/**
 * PLAYER ANALYSIS COMPARISON MODULE
 * Wrapped in a global function to be called when the dynamic tab is loaded.
 */
window.initComparisonTab = function() {
    let players = [];
    let selectedPlayer1 = null;
    let selectedPlayer2 = null;
    let player1Data = null;
    let player2Data = null;

    console.log('[COMPARISON] Tab logic initialized.');

    // 1. Initialize benchmarks
    function initializeBenchmarks() {
        console.log('[COMPARISON] Starting benchmarks initialization...');
        return fetch('/player_analysis/benchmarks/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            return res.json();
        })
        .then(data => {
            console.log('[COMPARISON] Benchmarks initialized successfully:', data);
            return data;
        })
        .catch(err => {
            console.error('[COMPARISON] ERROR initializing benchmarks:', err);
            throw err;
        });
    }

    // 2. Load players list
    function loadPlayersList() {
        fetch('/player_analysis/players')
            .then(res => res.json())
            .then(data => {
                players = data;
                populateSelects();
            })
            .catch(err => console.error('[COMPARISON] Error loading players:', err));
    }

    // 3. Populate dropdown selects
    function populateSelects() {
        const select1 = document.getElementById('player1-select');
        const select2 = document.getElementById('player2-select');

        if (!select1 || !select2) {
            console.error('[COMPARISON] Required select elements not found in DOM.');
            return;
        }

        const playerOptions = players.map(p => 
            `<option value="${p.id}">${p.summonerName || `Player ${p.id}`}</option>`
        ).join('');

        select1.innerHTML = '<option value="">Select a player...</option>' + playerOptions;
        select2.innerHTML = '<option value="">Select a player...</option>' + playerOptions + '<option value="coach-benchmark">Coach Benchmark</option>';

        select1.addEventListener('change', (e) => {
            selectedPlayer1 = parseInt(e.target.value);
            if (selectedPlayer1) loadPlayerData(selectedPlayer1, 1);
        });

        select2.addEventListener('change', (e) => {
            selectedPlayer2 = e.target.value;
            if (selectedPlayer2 === 'coach-benchmark') {
                loadCoachBenchmark();
            } else if (selectedPlayer2) {
                selectedPlayer2 = parseInt(selectedPlayer2);
                loadPlayerData(selectedPlayer2, 2);
            }
        });
    }

    // 4. Load player data
    function loadPlayerData(playerId, playerNumber) {
        fetch(`/player_analysis/players/${playerId}`)
            .then(res => res.json())
            .then(player => {
                if (playerNumber === 1) {
                    player1Data = player;
                    updatePlayerCard(player, 1);
                } else {
                    player2Data = player;
                    updatePlayerCard(player, 2);
                }

                if (player.userId && player.primaryRoleId) {
                    calculateAndFetchStats(player.userId, player.primaryRoleId, playerNumber);
                }
            })
            .catch(err => console.error(`[COMPARISON] Error loading player ${playerId}:`, err));
    }

    // 4b. Load coach benchmark for Player 2
    function loadCoachBenchmark() {
        if (!player1Data || !player1Data.primaryRoleId) {
            console.error('[COMPARISON] Player 1 must be selected first to load coach benchmark.');
            return;
        }

        const roleId = player1Data.primaryRoleId;
        
        console.log('[COMPARISON] Loading coach benchmark for role:', roleId);

        fetch(`/player_analysis/benchmarks/role/${roleId}`)
            .then(res => res.json())
            .then(benchmarks => {
                // Format benchmarks into a coach benchmark object
                const coachBenchmarkData = {
                    id: 'coach-benchmark',
                    summonerName: 'Coach Benchmark',
                    tier: 'Benchmark',
                    rank: 'Standard',
                    userId: null,
                    primaryRoleId: roleId,
                    stats: formatBenchmarksAsStats(benchmarks)
                };

                player2Data = coachBenchmarkData;
                updatePlayerCard(coachBenchmarkData, 2);

                if (player1Data?.stats) {
                    updateComparison();
                }
            })
            .catch(err => console.error('[COMPARISON] Error loading coach benchmark:', err));
    }

    // Helper function to format benchmarks into a stats object
    function formatBenchmarksAsStats(benchmarks) {
        let formattedStats = {
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            kdaRatio: 0,
            avgDamage: 0,
            totalDamage: 0,
            totalDamageMitigated: 0,
            avgGold: 0,
            winrate: 0,
            benchmarkComparison: benchmarks
        };

        // Map benchmark metrics to stats
        benchmarks.forEach(benchmark => {
            const metricName = benchmark.metricName.toLowerCase();
            
            if (metricName.includes('kill') && metricName.includes('participation')) {
                formattedStats.avgKills = benchmark.benchmarkValue;
            } else if (metricName.includes('death')) {
                formattedStats.avgDeaths = benchmark.benchmarkValue;
            } else if (metricName.includes('assist')) {
                formattedStats.avgAssists = benchmark.benchmarkValue;
            } else if (metricName.includes('damage') && metricName.includes('share')) {
                formattedStats.totalDamage = benchmark.benchmarkValue * 400; // Estimate total damage
            } else if (metricName.includes('gold') && metricName.includes('minute')) {
                formattedStats.avgGold = benchmark.benchmarkValue;
            } else if (metricName.includes('vision')) {
                formattedStats.visionScore = benchmark.benchmarkValue;
            }
        });

        // Calculate KDA from benchmarks
        formattedStats.kdaRatio = ((formattedStats.avgKills + formattedStats.avgAssists) / (formattedStats.avgDeaths || 1)).toFixed(2);

        return formattedStats;
    }

    // 5. Update UI Card
    function updatePlayerCard(player, playerNumber) {
        const prefix = playerNumber === 1 ? 'player1' : 'player2';
        const nameEl = document.getElementById(`name-${prefix}`);
        const rankEl = document.getElementById(`rank-${prefix}`);
        
        if (nameEl) nameEl.textContent = player.summonerName || `Player ${player.userId}`;
        if (rankEl) rankEl.textContent = player.tier ? `${player.tier} ${player.rank}` : 'Unranked';
        
        const pfpEl = document.getElementById(`pfp-${prefix}`);
        if (pfpEl && player.profilePhoto) {
            pfpEl.src = player.profilePhoto;
        }
    }

    // 6. Fetch stats and trigger comparison
    function calculateAndFetchStats(playerId, roleId, playerNumber) {
        fetch('/player_analysis/stats/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, roleId })
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data || !data.success) return;
            
            const stats = data.playerStats;
            const formattedStats = {
                avgKills: stats['Kills'] || 0,
                avgDeaths: stats['Deaths'] || 0,
                avgAssists: stats['Assists'] || 0,
                kdaRatio: stats['KDA'] || 0,
                avgDamage: stats['Total Damage Dealt'] || 0,
                totalDamage: stats['Total Damage Dealt'] || 0,
                totalDamageMitigated: stats['Total Damage Taken'] || 0,
                avgGold: stats['Gold Per Minute'] || 0,
                winrate: 0,
                benchmarkComparison: data.benchmarkComparison,
                summary: data.summary
            };
            
            if (playerNumber === 1) {
                player1Data.stats = formattedStats;
            } else {
                player2Data.stats = formattedStats;
            }
            
            if (player1Data?.stats && player2Data?.stats) {
                updateComparison();
            }
        });
    }

    // 7. Radar Chart Logic
    function updateRadarChart() {
        const chartContainer = document.getElementById('chart-container');
        if (!chartContainer || !player1Data?.stats || !player2Data?.stats) return;

        const p1Skills = calculateSkillRatings(player1Data);
        const p2Skills = calculateSkillRatings(player2Data);

        const chartData = [
            {
                className: 'Player1',
                axes: [
                    { axis: "KDA", value: p1Skills.kdaScore },
                    { axis: "Damage", value: p1Skills.damageScore },
                    { axis: "Tanking", value: p1Skills.tankScore },
                    { axis: "Gold Efficiency", value: p1Skills.goldScore },
                    { axis: "Consistency", value: p1Skills.consistencyScore }
                ]
            },
            {
                className: 'Player2',
                axes: [
                    { axis: "KDA", value: p2Skills.kdaScore },
                    { axis: "Damage", value: p2Skills.damageScore },
                    { axis: "Tanking", value: p2Skills.tankScore },
                    { axis: "Gold Efficiency", value: p2Skills.goldScore },
                    { axis: "Consistency", value: p2Skills.consistencyScore }
                ]
            }
        ];

        chartContainer.innerHTML = '';
        RadarChart.defaultConfig.w = 400;
        RadarChart.defaultConfig.h = 400;
        RadarChart.defaultConfig.maxValue = 10;
        RadarChart.draw("#chart-container", chartData);
    }

    // Helper for Skill Ratings
    function calculateSkillRatings(playerData) {
        const stats = playerData.stats;
        return {
            kdaScore: Math.min(stats.kdaRatio * 1.5, 10),
            damageScore: Math.min((stats.avgDamage / 400) * 10, 10),
            tankScore: Math.min((stats.totalDamageMitigated / 100000) * 10, 10),
            goldScore: Math.min((stats.avgGold / 350) * 10, 10),
            consistencyScore: stats.winrate / 10
        };
    }

    function updateComparison() {
        updateRadarChart();
        // Assume updateStatsTable exists as per your original file
        if (typeof updateStatsTable === 'function') updateStatsTable();
    }

    // Execution entry point
    initializeBenchmarks()
        .then(() => loadPlayersList())
        .catch(() => loadPlayersList());
};