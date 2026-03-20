// --- DASHBOARD LOADER ---
document.addEventListener("DOMContentLoaded", async () => {
    await loadPlayerList();
    await loadAnnouncements();
    await loadDraft();
    loadCalendar();

    // Modal Close Logic
    const closeBtn = document.getElementById('btn-close-view');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('view-announcement-modal').style.display = 'none';
        });
    }
});

// --- 1. PLACEHOLDER MANAGER PLAYER LIST ---
async function loadPlayerList() {
    const container = document.getElementById('player-list-container');
    if (!container) return;

    try {
        const res = await fetch('/manager_dashboard/api/players');
        const data = await res.json();

        if (data.success && data.players.length > 0) {
            let html = `
                <div class="scrollable-table-container">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="color: #333; border-bottom: 2px solid #eee;">
                                <th style="padding: 10px;">Player IGN</th>
                                <th style="padding: 10px;">Real Name</th>
                                <th style="padding: 10px; text-align: right;">Primary Role</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            data.players.forEach(p => {
                html += `
                    <tr style="border-bottom: 1px solid #eee; transition: background-color 0.2s;" 
                        onmouseover="this.style.backgroundColor='#f8f9fa'" 
                        onmouseout="this.style.backgroundColor='transparent'">
                        
                        <td style="padding: 12px 10px; font-weight: bold; color: #111;">${p.gameName}</td>
                        <td style="padding: 12px 10px; color: #555;">${p.firstname} ${p.lastname}</td>
                        <td style="padding: 12px 10px; text-align: right; font-weight: 500;">${p.primaryRole}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = "<p style='color: #666;'>No active players found on the roster.</p>";
        }
    } catch (error) {
        console.error("Failed to load players", error);
        container.innerHTML = "<p style='color:red;'>Error loading player list.</p>";
    }
}

// --- 2. ANNOUNCEMENTS LOGIC ---
async function loadAnnouncements() {
    const container = document.getElementById('announcement-list-container');
    if (!container) return;

    try {
        const res = await fetch('/manager_dashboard/api/announcements');
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
            container.innerHTML = "<p style='color: #666;'>No announcements posted yet.</p>";
        }
    } catch (error) {
        console.error("Failed to load announcements", error);
        container.innerHTML = "<p style='color:red;'>Error loading announcements.</p>";
    }
}

// --- 3. UPCOMING TOURNAMENT DRAFT LOGIC ---
async function loadDraft() {
    const container = document.getElementById('draft-list-container');
    if (!container) return;

    try {
        const res = await fetch('/manager_dashboard/api/draft');
        const data = await res.json();

        if (data.success && data.draft.length > 0) {
            let html = `
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 2px solid #ddd; color: #333;">
                            <th style="padding: 10px;">Player IGN</th>
                            <th style="padding: 10px;">Real Name</th>
                            <th style="padding: 10px; text-align: right;">Role Played</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.draft.forEach(p => {
                html += `
                    <tr style="border-bottom: 1px solid #eee; transition: background-color 0.2s;" 
                        onmouseover="this.style.backgroundColor='#f8f9fa'" 
                        onmouseout="this.style.backgroundColor='transparent'">
                        
                        <td style="padding: 12px 10px; font-weight: bold; color: #111;">${p.gameName}</td>
                        <td style="padding: 12px 10px; color: #555;">${p.firstname} ${p.lastname}</td>
                        <td style="padding: 12px 10px; text-align: right; font-weight: 500;">${p.displayedRole}</td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = "<p style='color: #666;'>No draft roster available.</p>";
        }
    } catch (error) {
        console.error("Failed to load draft", error);
        container.innerHTML = "<p style='color:red;'>Error loading draft.</p>";
    }
}

// --- 4. CALENDAR LOGIC ---
function loadCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    
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
    
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        if (index === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    });

    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }

    function renderGrid(month, year) {
        calGrid.innerHTML = ''; 
        days.forEach((day, index) => {
            const header = document.createElement('div');
            header.className = `calendar-cell calendar-header-cell ${index === 0 ? 'color-sunday' : 'color-weekday'}`;
            header.textContent = day;
            calGrid.appendChild(header);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell';
            calGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            const cellDate = new Date(year, month, day);
            const isSunday = cellDate.getDay() === 0;
            
            cell.className = `calendar-cell calendar-day ${isSunday ? 'color-sunday' : 'color-weekday'}`;
            cell.textContent = day;

            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('calendar-today');
            }
            calGrid.appendChild(cell);
        }
    }

    monthSelect.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        renderGrid(currentMonth, currentYear);
    });

    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        renderGrid(currentMonth, currentYear);
    });

    renderGrid(currentMonth, currentYear);
}

