const DASHBOARD_EVENT_COLORS = {
    Scrim: '#f97316',
    Tournament: '#facc15',
    Meeting: '#22c55e',
    Other: '#d1d5db'
};

const DASHBOARD_EVENT_TYPES = Object.keys(DASHBOARD_EVENT_COLORS);

// --- DASHBOARD LOADER ---
document.addEventListener("DOMContentLoaded", async () => {
    await loadPlayerList();
    await loadAnnouncements();
    await loadDraft();
    await loadCalendar();

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
function formatTournamentDate(dateValue) {
    if (!dateValue) return 'Date unavailable';

    const dateParts = String(dateValue)
        .slice(0, 10)
        .split('-')
        .map(Number);

    const [year, month, day] = dateParts;

    if (!year || !month || !day) {
        return 'Date unavailable';
    }

    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

// --- UPCOMING TOURNAMENT DRAFT LOGIC ---
async function loadDraft() {
    const container = document.getElementById('draft-list-container');
    if (!container) return;

    try {
        const response = await fetch('/manager_dashboard/api/draft', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Unable to load tournament draft.');
        }

        if (!data.tournament) {
            container.innerHTML = `
                <p style="color: #666;">
                    No upcoming tournament scheduled.
                </p>
            `;
            return;
        }

        const tournamentName =
            data.tournament.tournamentName || 'Upcoming Tournament';

        const tournamentDate =
            formatTournamentDate(data.tournament.tournamentDate);

        let html = `
            <div style="
                margin-bottom: 14px;
                padding-bottom: 10px;
                border-bottom: 1px solid #ddd;
            ">
                <div style="
                    color: #111;
                    font-size: 17px;
                    font-weight: 700;
                    margin-bottom: 4px;
                ">
                    ${tournamentName}
                </div>

                <div style="
                    color: #555;
                    font-size: 13px;
                    font-weight: 500;
                ">
                    Tournament Date: ${tournamentDate}
                </div>
            </div>
        `;

        if (!Array.isArray(data.draft) || data.draft.length === 0) {
            html += `
                <p style="color: #666;">
                    No players have been assigned to this tournament yet.
                </p>
            `;

            container.innerHTML = html;
            return;
        }

        html += `
            <table style="
                width: 100%;
                border-collapse: collapse;
                text-align: left;
            ">
                <thead>
                    <tr style="
                        border-bottom: 2px solid #ddd;
                        color: #333;
                    ">
                        <th style="padding: 10px;">Player IGN</th>
                        <th style="padding: 10px;">Real Name</th>
                        <th style="padding: 10px; text-align: right;">
                            Role Played
                        </th>
                    </tr>
                </thead>

                <tbody>
        `;

        data.draft.forEach(player => {
            html += `
                <tr style="
                    border-bottom: 1px solid #eee;
                    transition: background-color 0.2s;
                "
                onmouseover="this.style.backgroundColor='#f8f9fa'"
                onmouseout="this.style.backgroundColor='transparent'">
                    <td style="
                        padding: 12px 10px;
                        font-weight: bold;
                        color: #111;
                    ">
                        ${player.gameName}
                    </td>

                    <td style="padding: 12px 10px; color: #555;">
                        ${player.firstname} ${player.lastname}
                    </td>

                    <td style="
                        padding: 12px 10px;
                        text-align: right;
                        font-weight: 500;
                    ">
                        ${player.displayedRole}
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    } catch (error) {
        console.error('Failed to load upcoming tournament draft:', error);

        container.innerHTML = `
            <p style="color: red;">
                Error loading upcoming tournament draft.
            </p>
        `;
    }
}

// --- 4. DASHBOARD CALENDAR LOGIC ---
async function loadCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;

    container.innerHTML = `
        <div class="calendar-controls">
            <select id="cal-month"></select>
            <select id="cal-year"></select>
        </div>

        <div id="cal-grid" class="calendar-grid"></div>

        <div class="calendar-legend">
            <span>
                <i
                    class="calendar-legend-dot"
                    style="background-color: ${DASHBOARD_EVENT_COLORS.Scrim};"
                ></i>
                Scrim
            </span>

            <span>
                <i
                    class="calendar-legend-dot"
                    style="background-color: ${DASHBOARD_EVENT_COLORS.Tournament};"
                ></i>
                Tournament
            </span>

            <span>
                <i
                    class="calendar-legend-dot"
                    style="background-color: ${DASHBOARD_EVENT_COLORS.Meeting};"
                ></i>
                Meeting
            </span>
        </div>
    `;

    const monthSelect = document.getElementById('cal-month');
    const yearSelect = document.getElementById('cal-year');
    const calGrid = document.getElementById('cal-grid');

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let dashboardEvents = [];

    try {
        const response = await fetch('/calendar/api/events');

        if (!response.ok) {
            throw new Error(`Calendar request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.events)) {
            /*
             * Only retain Scrim, Tournament, and Meeting events.
             * All other event types are ignored.
             */
            dashboardEvents = data.events.filter(event =>
                DASHBOARD_EVENT_TYPES.includes(event.type)
            );
        }
    } catch (error) {
        console.error('Failed to load dashboard calendar events:', error);
    }

    /*
     * Group the filtered events by their starting date.
     */
    const eventsByDate = dashboardEvents.reduce((groupedEvents, event) => {
        if (!event.start_date) {
            return groupedEvents;
        }

        const dateKey = String(event.start_date).slice(0, 10);

        if (!groupedEvents[dateKey]) {
            groupedEvents[dateKey] = [];
        }

        groupedEvents[dateKey].push(event);

        return groupedEvents;
    }, {});

    months.forEach((month, index) => {
        const option = document.createElement('option');

        option.value = index;
        option.textContent = month;
        option.selected = index === currentMonth;

        monthSelect.appendChild(option);
    });

    for (
        let year = currentYear - 5;
        year <= currentYear + 5;
        year++
    ) {
        const option = document.createElement('option');

        option.value = year;
        option.textContent = year;
        option.selected = year === currentYear;

        yearSelect.appendChild(option);
    }

    function createDateKey(year, month, day) {
        const paddedMonth = String(month + 1).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');

        return `${year}-${paddedMonth}-${paddedDay}`;
    }

    function renderGrid(month, year) {
        calGrid.innerHTML = '';

        days.forEach((day, index) => {
            const header = document.createElement('div');

            header.className =
                `calendar-cell calendar-header-cell ${
                    index === 0
                        ? 'color-sunday'
                        : 'color-weekday'
                }`;

            header.textContent = day;
            calGrid.appendChild(header);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let index = 0; index < firstDay; index++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell';

            calGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            const cellDate = new Date(year, month, day);
            const isSunday = cellDate.getDay() === 0;

            const dateKey = createDateKey(year, month, day);
            const eventsForDay = eventsByDate[dateKey] || [];

            cell.className =
                `calendar-cell calendar-day ${
                    isSunday
                        ? 'color-sunday'
                        : 'color-weekday'
                }`;

            const dayNumber = document.createElement('span');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = day;

            cell.appendChild(dayNumber);

            if (eventsForDay.length > 0) {
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'calendar-event-dots';

                /*
                 * Only show one circle for each event type found on the day.
                 *
                 * Two Scrims on the same date still produce one orange circle.
                 * A Scrim and Tournament produce two separate circles.
                 */
                const eventTypes = [
                    ...new Set(
                        eventsForDay
                            .map(event => event.type)
                            .filter(type =>
                                DASHBOARD_EVENT_TYPES.includes(type)
                            )
                    )
                ];

                eventTypes.forEach(type => {
                    const dot = document.createElement('span');

                    dot.className = 'calendar-event-dot';
                    dot.style.backgroundColor =
                        DASHBOARD_EVENT_COLORS[type];

                    dot.setAttribute('aria-label', type);
                    dot.setAttribute('title', type);

                    dotsContainer.appendChild(dot);
                });

                cell.appendChild(dotsContainer);

                cell.title = eventsForDay
                    .map(event => {
                        const title =
                            event.title_summary ||
                            event.title ||
                            'Untitled event';

                        return `${event.type}: ${title}`;
                    })
                    .join('\n');
            }

            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

            if (isToday) {
                cell.classList.add('calendar-today');
            }

            cell.addEventListener('click', () => {
                window.location.href = '/calendar';
            });

            calGrid.appendChild(cell);
        }
    }

    monthSelect.addEventListener('change', event => {
        currentMonth = Number.parseInt(event.target.value, 10);
        renderGrid(currentMonth, currentYear);
    });

    yearSelect.addEventListener('change', event => {
        currentYear = Number.parseInt(event.target.value, 10);
        renderGrid(currentMonth, currentYear);
    });

    renderGrid(currentMonth, currentYear);
}

/*
 * Refresh when the user returns from Roster Management
 * or switches back to the dashboard tab.
 */
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        loadDraft();
    }
});

window.addEventListener('focus', () => {
    loadDraft();
});

/*
 * Also check periodically in case another user or device
 * changes the tournament roster.
 */
setInterval(() => {
    if (document.visibilityState === 'visible') {
        loadDraft();
    }
}, 30000);