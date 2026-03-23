// --- COMMUNITY DRAGON HELPER ---
const RANK_ICON_BASE_URL = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/";

function getRankIconUrl(rankString) {
    if (!rankString) return `${RANK_ICON_BASE_URL}unranked.png`;
    const tier = rankString.split(' ')[0].toLowerCase();
    const validTiers = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master', 'grandmaster', 'challenger'];
    if (validTiers.includes(tier)) return `${RANK_ICON_BASE_URL}${tier}.png`;
    return `${RANK_ICON_BASE_URL}unranked.png`;
}

function getRankDisplayText(rankString) {
    return rankString || 'Unranked';
}

// --- DASHBOARD LOADER ---
document.addEventListener("DOMContentLoaded", async () => {
    await loadPlayerList();
    await loadAnnouncements();
    await loadTeamStats();
    await loadDraft();
    await loadScrims();
    loadCalendar();
    await promptRiotApiKeyOnFirstLoginToday();

    // Modal Close Logic
    const closeBtn = document.getElementById('btn-close-view');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('view-announcement-modal').style.display = 'none';
        });
    }
});

async function promptRiotApiKeyOnFirstLoginToday() {
    // Prompt whenever no Riot API key is configured.
    // This avoids stale client-side suppression after DB resets/uploads.
    try {
        const res = await fetch('/settings/api/riot-api-key');
        if (!res.ok) return;

        const data = await res.json();

        if (data.hasKey) {
            return;
        }

        const shouldOpenSettings = window.confirm(
            'No Riot API key is configured.\nWould you like to add one now?\n\nSelect OK for Yes or Cancel for No.'
        );

        if (shouldOpenSettings) {
            window.location.href = '/settings';
        }
    } catch (error) {
        console.error('Unable to check Riot API key status:', error);
    }
}

// --- 1. PLAYER LIST LOGIC ---
async function loadPlayerList() {
    const container = document.getElementById('player-list-container');
    try {
        const res = await fetch('/coach_dashboard/api/players');
        const data = await res.json();

        if (data.success && data.players.length > 0) {
            let html = `
                <div class="scrollable-table-container">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="color: #fff;">
                                <th style="padding: 10px;">Player IGN</th>
                                <th style="padding: 10px;">Real Name</th>
                                <th style="padding: 10px; text-align: center;">Rank</th>
                                <th style="padding: 10px; text-align: right;">Main Role</th>
                                <th style="padding: 10px; text-align: right;">Sub Role</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            data.players.forEach(p => {
                const currentRankImg = getRankIconUrl(p.currentRank);
                const peakRankImg = getRankIconUrl(p.peakRank);
                const currentRankText = getRankDisplayText(p.currentRank);
                const peakRankText = getRankDisplayText(p.peakRank);

                html += `
                    <tr style="border-bottom: 1px solid #333; cursor: pointer; transition: background-color 0.2s;" 
                        onmouseover="this.style.backgroundColor='#181818'" 
                        onmouseout="this.style.backgroundColor='transparent'"
                        onclick="window.location.href='/player_analysis?id=${p.userId}'">
                        
                        <td style="padding: 12px 10px; font-weight: bold; color: #fff;">${p.gameName}</td>
                        <td style="padding: 12px 10px; color: #fff;">${p.firstname} ${p.lastname}</td>
                        <td style="padding: 12px 10px; text-align: left;">
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div title="Peak: ${peakRankText}" style="display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #fff; font-size: 13px;">Peak rank: ${peakRankText}</span>
                                    <img src="${peakRankImg}" alt="Peak Rank" style="width: 35px; height: 35px; object-fit: contain; opacity: 0.85;">
                                </div>
                                <div title="Current: ${currentRankText}" style="display: flex; align-items: center; gap: 8px;">
                                    <span style="color: #fff; font-size: 13px;">Current rank: ${currentRankText}</span>
                                    <img src="${currentRankImg}" alt="Current Rank" style="width: 35px; height: 35px; object-fit: contain;">
                                </div>
                            </div>
                        </td>
                        <td style="padding: 12px 10px; text-align: right; font-weight: 500;">${p.primaryRole || 'None'}</td>
                        <td style="padding: 12px 10px; text-align: right; color: #fff;">${p.secondaryRole || 'None'}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = "<p>No active players found.</p>";
        }
    } catch (error) {
        console.error("Failed to load players", error);
        container.innerHTML = "<p style='color:red;'>Error loading player list.</p>";
    }
}

// --- 2. ANNOUNCEMENTS LOGIC ---
async function loadAnnouncements() {
    const container = document.getElementById('announcement-list-container');
    try {
        const res = await fetch('/coach_dashboard/api/announcements');
        const data = await res.json();

        if (data.success && data.announcements.length > 0) {
            let html = '<div class="dash-announcement-list">';
            
            data.announcements.forEach((ann, index) => {
                html += `
                    <div class="dash-announcement-item" 
                         data-title="${ann.title.replace(/"/g, '&quot;')}" 
                         data-meta="Posted by ${ann.firstname} ${ann.lastname}" 
                         data-content="${ann.content.replace(/"/g, '&quot;')}">
                        <h4>${index + 1}. ${ann.title}</h4>
                        <p>${ann.content}</p>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;

            document.querySelectorAll('.dash-announcement-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const target = e.currentTarget;
                    document.getElementById('view-ann-title').textContent = target.getAttribute('data-title');
                    document.getElementById('view-ann-meta').textContent = target.getAttribute('data-meta');
                    document.getElementById('view-ann-content').textContent = target.getAttribute('data-content');
                    document.getElementById('view-announcement-modal').style.display = 'flex';
                });
            });

        } else {
            container.innerHTML = "<p style='color: #fff;'>No announcements posted yet.</p>";
        }
    } catch (error) {
        console.error("Failed to load announcements", error);
        container.innerHTML = "<p style='color:red;'>Error loading announcements.</p>";
    }
}

// --- 3. TEAM STATS CAROUSEL LOGIC ---
let currentSlide = 0;
const totalSlides = 3;
let carouselInterval;

async function loadTeamStats() {
    const container = document.getElementById('team-stats-carousel');
    try {
        const res = await fetch('/coach_dashboard/api/stats');
        const data = await res.json();

        if (data.success) {
            const winrate = parseFloat(data.winrate) || 0;
            const totalGames = data.totalGames || 0;
            const avgKDA = data.avgKDA || 0;
            const scrimsThisMonth = data.scrimsThisMonth || 0;
            const degrees = (winrate / 100) * 360;

            // For KDA, map 0-5 KDA to 0-360deg (clamp if higher)
            const maxKDA = 5;
            const kdaAngle = Math.min((parseFloat(avgKDA) / maxKDA) * 360, 360);

            const html = `
                <div class="carousel-container">
                    <button class="carousel-btn prev" onclick="moveCarousel(-1)">&#9664;</button>
                    <div class="carousel-window">
                        <div class="carousel-track" id="stats-track">
                            <div class="carousel-slide">
                                <div class="carousel-winrate" style="--winrate-angle: ${degrees}deg; --ring-fill: #28b5ff; --ring-empty: #444;">
                                    <div class="carousel-winrate-pct">${winrate.toFixed(1)}% WR</div>
                                    <div class="carousel-winrate-sub">Last ${totalGames} Games</div>
                                </div>
                            </div>
                            <div class="carousel-slide">
                                <div class="carousel-winrate" style="--winrate-angle: ${kdaAngle}deg; --ring-fill: #f72585; --ring-empty: #444;">
                                    <div class="carousel-winrate-pct">${avgKDA} KDA</div>
                                    <div class="carousel-winrate-sub">Team Average</div>
                                </div>
                            </div>
                            <div class="carousel-slide">
                                <div class="carousel-winrate" style="--winrate-angle: 180deg; --ring-fill: #00f2c3; --ring-empty: #444;">
                                    <div class="carousel-winrate-pct">${scrimsThisMonth} Scrims</div>
                                    <div class="carousel-winrate-sub">Played this Month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="carousel-btn next" onclick="moveCarousel(1)">&#9654;</button>
                </div>
            `;
            
            container.innerHTML = html;
            startCarousel();
        } else {
            container.innerHTML = "<p style='color: #fff;'>No stats available yet.</p>";
        }
    } catch (error) {
        console.error("Failed to load stats", error);
        container.innerHTML = "<p style='color:red;'>Error loading team stats.</p>";
    }
}

window.moveCarousel = function(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    const track = document.getElementById('stats-track');
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    resetCarouselInterval();
};

function startCarousel() {
    carouselInterval = setInterval(() => { moveCarousel(1); }, 5000);
}

function resetCarouselInterval() {
    clearInterval(carouselInterval);
    startCarousel();
}

// --- 4. UPCOMING TOURNAMENT DRAFT LOGIC ---
async function loadDraft() {
    const container = document.getElementById('draft-list-container');
    try {
        const res = await fetch('/coach_dashboard/api/draft');
        const data = await res.json();

        if (data.success && data.draft.length > 0) {
            let html = `
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 2px solid #333; color: #fff;">
                            <th style="padding: 10px;">Player IGN</th>
                            <th style="padding: 10px;">Real Name</th>
                            <th style="padding: 10px; text-align: right;">Role Played</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.draft.forEach(p => {
                html += `
                    <tr style="border-bottom: 1px solid #333; cursor: pointer; transition: background-color 0.2s;" 
                        onmouseover="this.style.backgroundColor='#181818'" 
                        onmouseout="this.style.backgroundColor='transparent'"
                        onclick="window.location.href='/player_analysis?id=${p.userId}'">
                        
                        <td style="padding: 12px 10px; font-weight: bold; color: #fff;">${p.gameName}</td>
                        <td style="padding: 12px 10px; color: #fff;">${p.firstname} ${p.lastname}</td>
                        <td style="padding: 12px 10px; text-align: right; font-weight: 500;">${p.displayedRole}</td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = "<p style='color: #fff;'>No draft roster available.</p>";
        }
    } catch (error) {
        console.error("Failed to load draft", error);
        container.innerHTML = "<p style='color:red;'>Error loading draft.</p>";
    }
}

// --- 5. LATEST SCRIMS LOGIC ---
async function loadScrims() {
    const container = document.getElementById('scrim-list-container');
    try {
        const res = await fetch('/coach_dashboard/api/scrims');
        const data = await res.json();

        if (data.success && data.scrims.length > 0) {
            let html = `
                <div class="scrollable-table-container" style="max-height: none; overflow: visible;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #333; color: #fff;">
                                <th style="padding: 10px;">#</th>
                                <th style="padding: 10px;">NAME</th>
                                <th style="padding: 10px;">DATE</th>
                                <th style="padding: 10px;">TIME</th>
                                <th style="padding: 10px;">TEAMS (Players)</th>
                                <th style="padding: 10px; text-align: center;">W/L</th>
                                <th style="padding: 10px; text-align: center;">VOD Link</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            data.scrims.forEach((s, index) => {
                // Clean up the date format (e.g., "Feb 23, 2026")
                const scrimDate = new Date(s.date).toLocaleDateString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric' 
                });
                
                // Determine if it was a Win or Loss for the badge styling
                const isWin = s.result === 'W';
                const badgeClass = isWin ? 'badge-w' : 'badge-l';
                const badgeText = isWin ? 'W' : 'L';
                
                html += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 12px 10px; font-weight: bold; color: #fff;">${index + 1}</td>
                        <td style="padding: 12px 10px; font-weight: 600; color: #fff;">${s.name}</td>
                        <td style="padding: 12px 10px; color: #fff;">${scrimDate}</td>
                        <td style="padding: 12px 10px; color: #fff;">${s.length || 'N/A'}</td>
                        <td style="padding: 12px 10px; color: #fff; font-size: 13px;">${s.teamMembers || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center;">
                            <span class="scrim-badge ${badgeClass}">${badgeText}</span>
                        </td>
                        <td style="padding: 12px 10px; text-align: center;">
                            ${s.videoLink ? `<a href="${s.videoLink}" target="_blank" class="vod-link">Watch VOD</a>` : '<span style="color:#fff;">No VOD</span>'}
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = "<p style='color: #fff;'>No recent scrims found.</p>";
        }
    } catch (error) {
        console.error("Failed to load scrims", error);
        container.innerHTML = "<p style='color:red;'>Error loading scrims.</p>";
    }
}

// --- 6. CALENDAR LOGIC ---
function loadCalendar() {
    const container = document.getElementById('calendar-container');
    
    // Inject the Dropdowns and Grid Container
    container.innerHTML = `
        <div class="calendar-controls">
            <select id="cal-month"></select>
            <select id="cal-year"></select>
        </div>
        <div id="cal-grid" class="calendar-grid"></div>
    `;

    const monthSelect = document.getElementById('cal-month');
    const yearSelect = document.getElementById('cal-year');
    const calGrid = document.getElementById('cal-grid');

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    
    // Setup current date
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // Populate Month Dropdown
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        if (index === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    });

    // Populate Year Dropdown (Current year +/- 5 years)
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }

    // Render the grid based on selected month/year
    function renderGrid(month, year) {
        calGrid.innerHTML = ''; // Clear previous grid

        // Add Day Headers (Su, Mo, Tu...)
        days.forEach((day, index) => {
            const header = document.createElement('div');
            header.className = `calendar-cell calendar-header-cell ${index === 0 ? 'color-sunday' : 'color-weekday'}`;
            header.textContent = day;
            calGrid.appendChild(header);
        });

        // Get the first day of the month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for the days before the 1st of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell';
            calGrid.appendChild(emptyCell);
        }

        // Add the actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            const cellDate = new Date(year, month, day);
            const isSunday = cellDate.getDay() === 0;
            
            cell.className = `calendar-cell calendar-day ${isSunday ? 'color-sunday' : 'color-weekday'}`;
            cell.textContent = day;

            // Highlight today
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('calendar-today');
            }

            calGrid.appendChild(cell);
        }
    }

    // Listen for dropdown changes to redraw the calendar
    monthSelect.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        renderGrid(currentMonth, currentYear);
    });

    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        renderGrid(currentMonth, currentYear);
    });

    // Initial render
    renderGrid(currentMonth, currentYear);
}