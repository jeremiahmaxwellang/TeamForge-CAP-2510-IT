// matchhistory.js

async function getMatchHistory() {
    const container = document.getElementById('match-list');
    const rawContainer = document.getElementById('raw-data');

    // Show loading state
    container.innerHTML = '<div style="text-align:center; padding:20px;">Loading live data from Riot...</div>';

    try {
        // CALL YOUR LOCAL SERVER
        // Note: URL encoding handles spaces in names automatically
        const response = await fetch('http://localhost:3000/api/matches/Kialos/akali');
        const matches = await response.json();

        // Clear loading message
        container.innerHTML = '';

        // Display Raw Data
        rawContainer.textContent = JSON.stringify(matches, null, 2);

        // Render Cards (Reusing the logic from before)
        renderMatches(matches);

    } catch (err) {
        container.innerHTML = '<div style="color:red; text-align:center;">Error loading data. Is the server running?</div>';
        console.error(err);
    }
}

function renderMatches(matches) {
    const container = document.getElementById('match-list');

    matches.forEach(match => {
        // 1. Calculate Helpers
        const durationMin = Math.floor(match.gameDuration / 60);
        const durationSec = match.gameDuration % 60;
        const kdaRatio = ((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(2);
        const resultClass = match.win ? "win" : "loss";
        const resultText = match.win ? "Victory" : "Defeat";

        // 2. Create Card
        const card = document.createElement('div');
        card.className = `match-card ${resultClass}`;

        card.innerHTML = `
        <div class="game-info">
            <div class="queue-type">${match.queueType}</div>
            <div class="game-result">${resultText}</div>
            <div class="duration">${durationMin}m ${durationSec}s</div>
        </div>

        <div class="champ-info">
            <img src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${match.championName}.png" class="champ-icon" onerror="this.src='https://via.placeholder.com/50'">
            <div class="champ-name">${match.championName}</div>
        </div>

        <div class="kda-info">
            <div class="kda-score">${match.kills} / <span style="color:#e84057">${match.deaths}</span> / ${match.assists}</div>
            <div class="kda-ratio"><span>${kdaRatio}:1</span> KDA</div>
        </div>

        <div class="stats-info">
            <div class="stat-row">CS ${match.cs} (${(match.cs/durationMin).toFixed(1)})</div>
            <div class="stat-row">Gold ${match.gold.toLocaleString()}</div>
        </div>

        <div class="items-info">
            ${match.items.map(itemId => `
            <div class="item-box">
                ${itemId !== 0 ? `<img src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${itemId}.png">` : ''}
            </div>
            `).join('')}
        </div>
        `;

        container.appendChild(card);
    });
}

// Start the fetch!
getMatchHistory();