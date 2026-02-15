document.addEventListener('DOMContentLoaded', function() {
    let players = [];
    let selectedPlayer1 = null;
    let selectedPlayer2 = null;
    let player1Data = null;
    let player2Data = null;

    console.log('[COMPARISON] Benchmarks initialized successfully:', data);
    console.log(`[COMPARISON] Benchmarks inserted: ${data.insertedCount} metrics inserted`);


    // Initialize benchmarks when overlay loads
    function initializeBenchmarks() {
        console.log('[COMPARISON] Starting benchmarks initialization...');
        return fetch('/player_analysis/benchmarks/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            console.log('[COMPARISON] Benchmarks response status:', res.status);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('[COMPARISON] Benchmarks initialized successfully:', data);
            if (data.success) {
                console.log(`[COMPARISON] Benchmarks seeded: ${data.insertedCount} metrics inserted`);
            }
            return data;
        })
        .catch(err => {
            console.error('[COMPARISON] ERROR initializing benchmarks:', err);
            console.error('[COMPARISON] Error details:', err.message);
            throw err;
        });
    }

    // Load players list
    function loadPlayersList() {
        fetch('/player_analysis/players')
            .then(res => res.json())
            .then(data => {
                players = data;
                populateSelects();
            })
            .catch(err => console.error('[COMPARISON] Error loading players:', err));
    }

    // Populate dropdown selects with players
    function populateSelects() {
        const select1 = document.getElementById('player1-select');
        const select2 = document.getElementById('player2-select');

        const playerOptions = players.map(p => 
            `<option value="${p.id}">${p.summonerName || `Player ${p.id}`}</option>`
        ).join('');

        select1.innerHTML = '<option value="">Select a player...</option>' + playerOptions;
        select2.innerHTML = '<option value="">Select a player...</option>' + playerOptions;

        // Add event listeners
        select1.addEventListener('change', (e) => {
            selectedPlayer1 = parseInt(e.target.value);
            if (selectedPlayer1) loadPlayerData(selectedPlayer1, 1);
        });

        select2.addEventListener('change', (e) => {
            selectedPlayer2 = parseInt(e.target.value);
            if (selectedPlayer2) loadPlayerData(selectedPlayer2, 2);
        });
    }

    // Load player data including matches
    function loadPlayerData(playerId, playerNumber) {
        fetch(`/player_analysis/players/${playerId}`)
            .then(res => res.json())
            .then(player => {
                const playerRef = playerNumber === 1 ? 'player1Data' : 'player2Data';
                
                if (playerNumber === 1) {
                    player1Data = player;
                    updatePlayerCard(player, 1);
                } else {
                    player2Data = player;
                    updatePlayerCard(player, 2);
                }

                // Calculate stats from matchParticipants and compare against benchmarks
                if (player.userId && player.primaryRoleId) {
                    calculateAndFetchStats(player.userId, player.primaryRoleId, playerNumber);
                }
            })
            .catch(err => console.error(`[COMPARISON] Error loading player ${playerId}:`, err));
    }

    // Update player card with player info
    function updatePlayerCard(player, playerNumber) {
        const prefix = playerNumber === 1 ? 'player1' : 'player2';
        document.getElementById(`name-${prefix}`).textContent = player.summonerName || `Player ${player.userId}`;
        document.getElementById(`rank-${prefix}`).textContent = player.tier ? `${player.tier} ${player.rank}` : 'Unranked';
        
        // Update profile picture if available
        const pfpEl = document.getElementById(`pfp-${prefix}`);
        if (player.profilePhoto) {
            pfpEl.src = player.profilePhoto;
        }
    }

    // Calculate stats from matchParticipants and fetch benchmarks
    function calculateAndFetchStats(playerId, roleId, playerNumber) {
        fetch('/player_analysis/stats/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerId: playerId,
                roleId: roleId
            })
        })
        .then(res => {
            if (!res.ok) {
                console.error(`[COMPARISON] Error status: ${res.status}`);
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (!data || !data.success) {
                console.error(`[COMPARISON] Error: ${data?.error || 'Unknown error'}`);
                return;
            }
            
            // Format stats for display (convert object values to match expected format)
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
                winrate: 0, // Not available from matchParticipants
                wins: 0,
                losses: 0,
                benchmarkComparison: data.benchmarkComparison,
                summary: data.summary
            };
            
            if (playerNumber === 1) {
                player1Data.stats = formattedStats;
                player1Data.matchCount = data.matchCount;
            } else {
                player2Data.stats = formattedStats;
                player2Data.matchCount = data.matchCount;
            }
            
            // Update comparison when both players have data
            if (player1Data && player2Data && player1Data.stats && player2Data.stats) {
                updateComparison();
            }
        })
        .catch(err => console.error(`[COMPARISON] Error calculating stats for player ${playerNumber}:`, err));
    }

    // Calculate stats from matches (legacy function - kept for compatibility)
    function calculatePlayerStats(matches, playerNumber) {
        // This function is no longer used as stats are fetched from backend
        console.log('[COMPARISON] Legacy calculatePlayerStats called');
    }

    // Calculate skill ratings (1-10 scale)
    function calculateSkillRatings(playerData) {
        if (!playerData || !playerData.stats) return null;

        const stats = playerData.stats;
        
        // Normalize KDA (higher is better)
        const kdaScore = Math.min(stats.kdaRatio * 1.5, 10);
        
        // Normalize damage (compare to average)
        const damageScore = Math.min((stats.avgDamage / 400) * 10, 10);
        
        // Normalize tank stats (damage mitigated)
        const tankScore = Math.min((stats.totalDamageMitigated / 100000) * 10, 10);
        
        // Gold efficiency
        const goldScore = Math.min((stats.avgGold / 350) * 10, 10);
        
        // Consistency (winrate)
        const consistencyScore = stats.winrate / 10;

        return {
            kdaScore: parseFloat(kdaScore.toFixed(2)),
            damageScore: parseFloat(damageScore.toFixed(2)),
            tankScore: parseFloat(tankScore.toFixed(2)),
            goldScore: parseFloat(goldScore.toFixed(2)),
            consistencyScore: parseFloat(consistencyScore.toFixed(2))
        };
    }

    // Update the radar chart
    function updateRadarChart() {
        if (!player1Data || !player2Data || !player1Data.stats || !player2Data.stats) {
            return;
        }

        const p1Skills = calculateSkillRatings(player1Data);
        const p2Skills = calculateSkillRatings(player2Data);

        if (!p1Skills || !p2Skills) return;

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

        // Clear existing chart
        document.getElementById('chart-container').innerHTML = '';

        // Configure and draw radar chart
        RadarChart.defaultConfig.w = 400;
        RadarChart.defaultConfig.h = 400;
        RadarChart.defaultConfig.radius = 5;
        RadarChart.defaultConfig.maxValue = 10;
        RadarChart.draw("#chart-container", chartData);
    }

    // Update stats table
    function updateStatsTable() {
        if (!player1Data || !player2Data || !player1Data.stats || !player2Data.stats) {
            document.getElementById('stats-list').innerHTML = '<div class="no-data">Select both players to view detailed statistics</div>';
            return;
        }

        const stats = player1Data.stats;
        const stats2 = player2Data.stats;

        // Check if benchmark comparison is available
        if (stats.benchmarkComparison && stats2.benchmarkComparison) {
            displayBenchmarkComparison(stats, stats2);
        } else {
            // Fall back to basic stats table if benchmarks not available
            displayBasicStatsTable(stats, stats2);
        }
    }

    // Display benchmark comparison
    function displayBenchmarkComparison(stats, stats2) {
        const benchmarks = stats.benchmarkComparison;
        const benchmarks2 = stats2.benchmarkComparison;

        let html = '<div class="benchmark-comparison">';
        
        // Add summary section
        if (stats.summary && stats2.summary) {
            html += `
                <div class="benchmark-summary">
                    <div class="player1-summary">
                        <h4>Player 1 Performance</h4>
                        <p>Meeting: ${stats.summary.metGuidelines}/${stats.summary.totalGuidelines}</p>
                        <p>Score: ${stats.summary.performancePercentage}</p>
                    </div>
                    <div class="player2-summary">
                        <h4>Player 2 Performance</h4>
                        <p>Meeting: ${stats2.summary.metGuidelines}/${stats2.summary.totalGuidelines}</p>
                        <p>Score: ${stats2.summary.performancePercentage}</p>
                    </div>
                </div>
            `;
        }

        // Add detailed metrics comparison
        html += '<div class="benchmark-details">';
        benchmarks.forEach((benchmark, idx) => {
            const benchmark2 = benchmarks2[idx];
            const player1Status = benchmark.status;
            const player2Status = benchmark2?.status || '—';

            html += `
                <div class="benchmark-row">
                    <div class="metric-name">${benchmark.metricName}</div>
                    <div class="player-value">
                        <span class="status">${player1Status}</span>
                        <span class="value">${benchmark.playerValue}</span>
                    </div>
                    <div class="benchmark-value">${benchmark.benchmarkValue} ${benchmark.comparator}</div>
                    <div class="player-value">
                        <span class="value">${benchmark2?.playerValue || 'N/A'}</span>
                        <span class="status">${player2Status}</span>
                    </div>
                </div>
            `;
        });
        html += '</div></div>';

        document.getElementById('stats-list').innerHTML = html;
    }

    // Display basic stats table (fallback)
    function displayBasicStatsTable(stats, stats2) {
        const statRows = [
            { label: "Avg KDA", p1: `${stats.avgKills}/${stats.avgDeaths}/${stats.avgAssists}`, p2: `${stats2.avgKills}/${stats2.avgDeaths}/${stats2.avgAssists}` },
            { label: "KDA Ratio", p1: stats.kdaRatio, p2: stats2.kdaRatio },
            { label: "Avg Damage", p1: parseInt(stats.avgDamage).toLocaleString(), p2: parseInt(stats2.avgDamage).toLocaleString() },
            { label: "Total Damage", p1: stats.totalDamage.toLocaleString(), p2: stats2.totalDamage.toLocaleString() },
            { label: "Avg Gold", p1: parseInt(stats.avgGold).toLocaleString(), p2: parseInt(stats2.avgGold).toLocaleString() },
            { label: "Damage Mitigated", p1: stats.totalDamageMitigated.toLocaleString(), p2: stats2.totalDamageMitigated.toLocaleString() }
        ];

        const statsList = document.getElementById('stats-list');
        statsList.innerHTML = statRows.map(stat => `
            <div class="stat-row">
                <span>${stat.p1}</span>
                <span>${stat.label}</span>
                <span>${stat.p2}</span>
            </div>
        `).join('');
    }

    // Update comparison view
    function updateComparison() {
        updateRadarChart();
        updateStatsTable();
    }

    // Initialize - wait for benchmarks before loading players
    initializeBenchmarks()
        .then(() => {
            console.log('[COMPARISON] Benchmarks ready, loading players...');
            loadPlayersList();
        })
        .catch(err => {
            console.error('[COMPARISON] Failed to initialize benchmarks, attempting to load players anyway:', err);
            loadPlayersList();
        });
});
