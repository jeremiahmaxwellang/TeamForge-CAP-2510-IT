// ── STATE ────────────────────────────────────────────────
let currentDate = new Date(2026, 3, 1); // April 2026
let currentView = 'month';
let pendingDate = null;

// Static Colors for official Team Events
const TYPE_COLORS = {
  Scrim: '#f97316',      // Orange
  Tournament: '#facc15', // Yellow
  Meeting: '#22c55e',    // Green
  Other: '#d1d5db'       // Gray
};

// Palette for individual Player Schedules
const PLAYER_PALETTE = [
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#84cc16', // Lime
  '#a855f7', // Amethyst
  '#6366f1'  // Indigo
];

let playerColors = {};
let colorIndex = 0;

let events = [];

// ── UTILS ────────────────────────────────────────────────
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function dateStr(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
function today() { const t = new Date(); return dateStr(t.getFullYear(), t.getMonth(), t.getDate()); }
function eventsForDate(ds) { return events.filter(e => e.date === ds); }
function timeToMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function formatTime12(t) { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2, '0')}${ap}`; }
function getEventColor(type) { return TYPE_COLORS[type] || TYPE_COLORS.Default; }
function buildCreatorName(firstname, lastname, role) {
  const fullName = [firstname, lastname].filter(Boolean).join(' ').trim();
  if (!fullName) return role || 'Unknown creator';
  return role ? `${fullName} (${role})` : fullName;
}
function buildEventTitle(ev) {
  return ev.creatorName ? `${ev.title}\nCreated by: ${ev.creatorName}` : ev.title;
}

// ── DYNAMIC COLORING & LEGEND ────────────────────────────
function processEventColor(ev) {
  // Only catch the 3 official team events here
  if (['Scrim', 'Tournament', 'Meeting'].includes(ev.type)) {
    return TYPE_COLORS[ev.type];
  } else {
    // EVERYTHING ELSE (Type 'Other', Classes, Google Imports) gets grouped by the Player
    const name = ev.creatorName || 'Unknown Player';
    
    // Assign a unique color if they don't have one yet
    if (!playerColors[name]) {
      playerColors[name] = PLAYER_PALETTE[colorIndex % PLAYER_PALETTE.length];
      colorIndex++;
    }
    
    return playerColors[name];
  }
}
function updateColorsAndLegend() {
  // Reset color mapping so we don't keep orphaned players
  playerColors = {};
  colorIndex = 0;

  events.forEach(e => {
    e.color = processEventColor(e);
  });

  renderLegend();
}

function renderLegend() {
  const container = document.getElementById('dynamicLegend');
  if (!container) return;
  
  let html = '';
  
  // Team Events Legend
  html += `
    <div class="sidebar-section">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span class="sidebar-label" style="margin:0">Team Events</span>
      </div>
      <div class="calendar-list">
        <div class="cal-item"><div class="cal-dot checked" style="background:${TYPE_COLORS.Scrim};"></div>Scrim</div>
        <div class="cal-item"><div class="cal-dot checked" style="background:${TYPE_COLORS.Tournament};"></div>Tournament</div>
        <div class="cal-item"><div class="cal-dot checked" style="background:${TYPE_COLORS.Meeting};"></div>Meeting</div>
      </div>
    </div>
  `;
  
  // Player Schedules Legend
  const players = Object.keys(playerColors);
  if (players.length > 0) {
    html += `
      <div class="sidebar-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span class="sidebar-label" style="margin:0">Player Schedules</span>
        </div>
        <div class="calendar-list">
    `;
    players.forEach(player => {
      html += `<div class="cal-item"><div class="cal-dot checked" style="background:${playerColors[player]};"></div>${player}</div>`;
    });
    html += `</div></div>`;
  }
  
  container.innerHTML = html;
}

// ── NAVIGATION ───────────────────────────────────────────
function navigate(dir) {
  if (currentView === 'month') {
    currentDate.setMonth(currentDate.getMonth() + dir);
  } else {
    currentDate.setDate(currentDate.getDate() + (dir * 7));
  }
  render();
}

function setView(v) {
  currentView = v;
  document.getElementById('btnMonth').classList.toggle('active', v === 'month');
  document.getElementById('btnWeek').classList.toggle('active', v === 'week');
  document.getElementById('monthView').style.display = v === 'month' ? 'flex' : 'none';
  document.getElementById('weekView').style.display = v === 'week' ? 'flex' : 'none';
  render();
}

// ── RENDER ───────────────────────────────────────────────
function render() {
  updateTitle();
  if (currentView === 'month') renderMonth();
  else renderWeek();
  updateCount();
}

function updateTitle() {
  const el = document.getElementById('navTitle');
  if (currentView === 'month') {
    el.textContent = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  } else {
    const d = new Date(currentDate);
    const sun = new Date(d); sun.setDate(d.getDate() - d.getDay());
    el.textContent = `${MONTHS[sun.getMonth()]} ${sun.getFullYear()}`;
  }
}

function updateCount() {
  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  let count;
  if (currentView === 'month') {
    count = events.filter(e => { const d = new Date(e.date); return d.getFullYear() === y && d.getMonth() === m; }).length;
  } else {
    const d = new Date(currentDate);
    const sun = new Date(d); sun.setDate(d.getDate() - d.getDay());
    const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
    count = events.filter(e => { const dd = new Date(e.date); return dd >= sun && dd <= sat; }).length;
  }
  document.getElementById('eventsCount').textContent = `${count} events total`;
}

// ── MONTH VIEW ───────────────────────────────────────────
function renderMonth() {
  const hdr = document.getElementById('monthHeader');
  hdr.innerHTML = DAYS.map(d => `<div class="month-dow">${d}</div>`).join('');

  const grid = document.getElementById('monthGrid');
  grid.innerHTML = '';

  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  const first = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev = new Date(y, m, 0).getDate();
  const todayStr = today();

  const cells = [];
  for (let i = first - 1; i >= 0; i--)         cells.push({ day: daysInPrev - i, month: m - 1, year: m === 0 ? y - 1 : y, other: true });
  for (let d = 1; d <= daysInMonth; d++)        cells.push({ day: d, month: m, year: y, other: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - first - daysInMonth + 1, month: m + 1, year: m === 11 ? y + 1 : y, other: true });

  cells.forEach(c => {
    const ds = dateStr(c.year, c.month, c.day);
    const cell = document.createElement('div');
    cell.className = 'month-cell' + (c.other ? ' other-month' : '') + (ds === todayStr ? ' today' : '');
    cell.onclick = () => openCreateModal(ds);

    const dayEl = document.createElement('div');
    dayEl.className = 'day-num';
    dayEl.textContent = c.day;
    cell.appendChild(dayEl);

    const dayEvents = eventsForDate(ds);
    const max = 3;
    dayEvents.slice(0, max).forEach(ev => {
      const el = document.createElement('div');
      el.className = 'month-event';
      el.style.background = ev.color || getEventColor(ev.type);
      el.textContent = `${ev.start} ${ev.title}`;
      el.title = buildEventTitle(ev);
      el.onmouseenter = (e) => { e.stopPropagation(); showPopup(e, ev); };
      el.onmousemove = (e) => { e.stopPropagation(); showPopup(e, ev); };
      el.onmouseleave = hidePopup;
      el.onclick = (e) => { e.stopPropagation(); showPopup(e, ev); };
      cell.appendChild(el);
    });

    if (dayEvents.length > max) {
      const more = document.createElement('div');
      more.className = 'more-events';
      more.textContent = `+${dayEvents.length - max} more`;
      cell.appendChild(more);
    }

    grid.appendChild(cell);
  });
}

// ── WEEK VIEW ────────────────────────────────────────────
function renderWeek() {
  const d = new Date(currentDate);
  const sun = new Date(d); sun.setDate(d.getDate() - d.getDay());
  const todayStr = today();

  const hdr = document.getElementById('weekHeader');
  hdr.innerHTML = `<div class="week-tz">GMT+08</div>`;
  for (let i = 0; i < 7; i++) {
    const dd = new Date(sun); dd.setDate(sun.getDate() + i);
    const ds = dateStr(dd.getFullYear(), dd.getMonth(), dd.getDate());
    const isToday = ds === todayStr;
    hdr.innerHTML += `
      <div class="week-dow-cell${isToday ? ' today' : ''}">
        <div class="dow-name">${DAYS[i]}</div>
        <div class="dow-date">${dd.getDate()}</div>
      </div>`;
  }

  const body = document.getElementById('weekBody');
  body.innerHTML = '';

  const timeCol = document.createElement('div');
  timeCol.className = 'time-col';
  const hours = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM'];
  const startHour = 7;
  hours.forEach(h => {
    const slot = document.createElement('div');
    slot.className = 'time-slot-label';
    slot.textContent = h;
    timeCol.appendChild(slot);
  });
  body.appendChild(timeCol);

  for (let i = 0; i < 7; i++) {
    const dd = new Date(sun); dd.setDate(sun.getDate() + i);
    const ds = dateStr(dd.getFullYear(), dd.getMonth(), dd.getDate());
    const col = document.createElement('div');
    col.className = 'day-col';
    col.style.position = 'relative';
    col.onclick = () => openCreateModal(ds);

    hours.forEach(() => {
      const line = document.createElement('div');
      line.className = 'hour-line';
      col.appendChild(line);
    });

    eventsForDate(ds).forEach(ev => {
      const startMin = timeToMin(ev.start);
      const endMin = timeToMin(ev.end);
      const dayStartMin = startHour * 60;
      const topPx = ((startMin - dayStartMin) / 60) * 48;
      const heightPx = ((endMin - startMin) / 60) * 48;

      const el = document.createElement('div');
      el.className = 'week-event';
      el.style.cssText = `background:${ev.color || getEventColor(ev.type)};top:${topPx}px;height:${Math.max(heightPx, 20)}px;`;
      el.title = buildEventTitle(ev);
      el.innerHTML = `<div class="ev-title">${ev.title}</div><div class="ev-time">${ev.start} – ${ev.end}</div>`;
      el.onmouseenter = (e) => { e.stopPropagation(); showPopup(e, ev); };
      el.onmousemove = (e) => { e.stopPropagation(); showPopup(e, ev); };
      el.onmouseleave = hidePopup;
      el.onclick = (e) => { e.stopPropagation(); showPopup(e, ev); };
      col.appendChild(el);
    });

    body.appendChild(col);
  }
}

// ── MODAL ────────────────────────────────────────────────
function moveHiddenSlotCardsToPool(columnSelector) {
  document.querySelectorAll(`${columnSelector} .player-card`).forEach(card => {
    const slot = card.closest('.role-slot');
    if (slot) slot.querySelector('.placeholder-text').style.display = 'inline';
    document.getElementById('availablePlayers').appendChild(card);
  });
}

function updateOptionalLineups() {
  const subsCheckbox = document.getElementById('evEnableSubs');
  const team2Checkbox = document.getElementById('evEnableTeam2');

  if (subsCheckbox?.checked && team2Checkbox?.checked) {
    if (document.activeElement === team2Checkbox) {
      subsCheckbox.checked = false;
    } else {
      team2Checkbox.checked = false;
    }
  }

  const enableSubs = subsCheckbox?.checked;
  const enableTeam2 = team2Checkbox?.checked;
  const subCol = document.getElementById('subRoleColumn');
  const team2Col = document.getElementById('team2RoleColumn');

  if (subCol) subCol.style.display = enableSubs ? 'flex' : 'none';
  if (team2Col) team2Col.style.display = enableTeam2 ? 'flex' : 'none';

  if (!enableSubs) moveHiddenSlotCardsToPool('#subRoleColumn');
  if (!enableTeam2) moveHiddenSlotCardsToPool('#team2RoleColumn');
}

function openCreateModal(ds) {
  pendingDate = ds || today();
  document.getElementById('evDate').value = pendingDate;
  document.getElementById('evTitle').value = '';
  document.getElementById('evType').value = 'Scrim';
  document.getElementById('evStart').value = '10:00';
  document.getElementById('evEnd').value = '11:00';
  document.getElementById('evLocation').value = '';
  document.getElementById('evEnableSubs').checked = false;
  document.getElementById('evEnableTeam2').checked = false;
  document.getElementById('modalOverlay').classList.add('open');

  document.querySelectorAll('.role-slot .player-card').forEach(el => el.remove());
  document.querySelectorAll('.placeholder-text').forEach(el => el.style.display = 'inline');

  updateOptionalLineups();
  triggerLayoutToggle();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function saveEvent() {
  const title = document.getElementById('evTitle').value.trim();
  const type = document.getElementById('evType').value;
  if (!title) { alert('Please enter a title.'); return; }

  const date = document.getElementById('evDate').value;
  const start = document.getElementById('evStart').value;
  const end = document.getElementById('evEnd').value;
  const sendGcal = document.getElementById('evSendGcal').checked; // <-- Capture checkbox
  const participants = [];

  if (type !== 'Meeting') {
    document.querySelectorAll('.role-slot .player-card').forEach(card => {
      const slot = card.closest('.role-slot');
      participants.push({
        userId: card.dataset.userId,
        role: slot.dataset.role,
        isSub: slot.dataset.sub,
        team: slot.dataset.team || 'Team 1'
      });
    });
  }

  const payload = {
    title_summary: title,
    type,
    location: document.getElementById('evLocation').value,
    start_date: date,
    start_datetime: date && start ? `${date} ${start}:00` : null,
    end_date: date,
    end_datetime: date && end ? `${date} ${end}:00` : null,
    videoLink: document.getElementById('evVideo').value,
    win: document.getElementById('evWL').value,
    participants,
    sendGcal // <-- Add to payload
  };

  fetch('/calendar/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        closeModal();
        loadEvents(); // Reload everything fresh
      } else {
        alert(data.message || 'Failed to create event');
      }
    })
    .catch(err => { console.error(err); alert('Server error.'); });
}

// Initialize the events on the Calendar
async function loadEvents() {
  try {
    const res = await fetch('/calendar/api/events');
    const data = await res.json();
    if (data.success) {
      events = data.events.map(e => ({
        id: e.eventId,
        title: e.title_summary,
        type: e.type,
        date: e.start_date,
        start: e.start_time || '00:00',
        end: e.end_time || '23:59',
        location: e.location,
        videoLink: e.videoLink,
        win: e.win,
        creatorName: buildCreatorName(e.firstname, e.lastname, e.creatorRole),
        google_event_id: e.google_event_id || null, // ad 
        color: getEventColor(e.type)
      }));
      updateColorsAndLegend();
      render();
    }
  } catch (err) {
    console.error('Error loading events:', err);
  }
}

// ── INTERACTIVITY & DRAG-DROP ─────────────────────────────
function triggerLayoutToggle() {
  const evType = document.getElementById('evType').value;
  const modal = document.getElementById('eventModal');
  const grid = document.getElementById('eventModalGrid');
  const pCol = document.getElementById('eventParticipantsCol');
  const rCol = document.getElementById('eventRosterCol');

  if (evType === 'Meeting') {
    modal.classList.remove('expanded');
    grid.classList.remove('expanded');
    pCol.style.display = 'none';
    rCol.style.display = 'none';
  } else {
    modal.classList.add('expanded');
    grid.classList.add('expanded');
    pCol.style.display = 'block';
    rCol.style.display = 'block';
    updateOptionalLineups();
    fetchAvailability();
  }
}

document.getElementById('evType').addEventListener('change', triggerLayoutToggle);
document.getElementById('evEnableSubs').addEventListener('change', (e) => {
  if (e.target.checked) {
    const t2 = document.getElementById('evEnableTeam2');
    if (t2) t2.checked = false;
  }
  updateOptionalLineups();
});
document.getElementById('evEnableTeam2').addEventListener('change', (e) => {
  if (e.target.checked) {
    const subs = document.getElementById('evEnableSubs');
    if (subs) subs.checked = false;
  }
  updateOptionalLineups();
});
['evDate', 'evStart', 'evEnd'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    if (document.getElementById('evType').value !== 'Meeting') fetchAvailability();
  });
});

async function fetchAvailability() {
  const date = document.getElementById('evDate').value;
  const start = document.getElementById('evStart').value;
  const end = document.getElementById('evEnd').value;
  try {
    const query = new URLSearchParams({ date, start, end });
    const res = await fetch(`/calendar/api/availability?${query.toString()}`);
    const data = await res.json();
    if (data.success) renderPlayers(data.players);
  } catch (err) { console.error(err); }
}

function renderPlayers(players) {
  const assignedIds = Array.from(document.querySelectorAll('.role-slot .player-card')).map(c => c.dataset.userId);

  document.getElementById('availablePlayers').innerHTML = '';
  document.getElementById('semiAvailablePlayers').innerHTML = '';
  document.getElementById('unavailablePlayers').innerHTML = '';

  players.forEach(p => {
    const isUnavailable = p.availability === 'Unavailable';

    if (assignedIds.includes(String(p.userId))) {
      const slotCard = document.querySelector(`.role-slot .player-card[data-user-id="${p.userId}"]`);
      if (slotCard) {
        if (isUnavailable) slotCard.classList.add('unavailable');
        else slotCard.classList.remove('unavailable');
      }
      return;
    }

    const card = document.createElement('div');
    card.className = `player-card ${isUnavailable ? 'unavailable' : ''}`;
    card.setAttribute('draggable', !isUnavailable);
    card.dataset.userId = p.userId;
    card.innerHTML = `
      <span>${p.gameName || p.firstname}</span>
      <span style="color:#888;font-size:0.75rem;">${p.primaryRole || 'None'}/${p.secondaryRole || 'None'}</span>`;

    if (!isUnavailable) {
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragend', handleDragEnd);
    }

    if (p.availability === 'Available') document.getElementById('availablePlayers').appendChild(card);
    else if (p.availability === 'Semi') document.getElementById('semiAvailablePlayers').appendChild(card);
    else document.getElementById('unavailablePlayers').appendChild(card);
  });
}

let draggedCard = null;
function handleDragStart(e) {
  draggedCard = this;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => this.style.opacity = '0.5', 0);
}
function handleDragEnd(e) {
  this.style.opacity = '1';
  draggedCard = null;
}

function animateCardMove(card, targetParent) {
  const initialRect = card.getBoundingClientRect();
  targetParent.appendChild(card);
  const finalRect = card.getBoundingClientRect();
  const deltaX = initialRect.left - finalRect.left;
  const deltaY = initialRect.top - finalRect.top;

  if (deltaX === 0 && deltaY === 0) return;

  card.classList.add('moving');
  card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  card.style.opacity = '0.85';

  requestAnimationFrame(() => {
    card.style.transform = '';
    card.style.opacity = '1';
  });

  const cleanup = () => {
    card.classList.remove('moving');
    card.style.transform = '';
    card.style.opacity = '';
    card.removeEventListener('transitionend', cleanup);
  };
  card.addEventListener('transitionend', cleanup);
}

document.querySelectorAll('.role-slot').forEach(slot => {
  slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); });
  slot.addEventListener('dragleave', () => slot.classList.remove('over'));
  slot.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('over');
    if (draggedCard) {
      const existing = this.querySelector('.player-card');
      if (existing) {
        animateCardMove(existing, document.getElementById('availablePlayers'));
      }
      this.querySelector('.placeholder-text').style.display = 'none';
      animateCardMove(draggedCard, this);
      fetchAvailability();
    }
  });
});

document.querySelectorAll('.players-pool-grid').forEach(pool => {
  pool.addEventListener('dragover', e => e.preventDefault());
  pool.addEventListener('drop', function (e) {
    e.preventDefault();
    if (draggedCard) {
      const originSlot = draggedCard.closest('.role-slot');
      if (originSlot) originSlot.querySelector('.placeholder-text').style.display = 'inline';
      animateCardMove(draggedCard, this);
      fetchAvailability();
    }
  });
});

// ── EVENT POPUP ──────────────────────────────────────────
let popupTimeout;
function hidePopup() {
  clearTimeout(popupTimeout);
  const pop = document.getElementById('evPopup');
  if (pop) pop.classList.remove('visible');
}

function showPopup(e, ev) {
  clearTimeout(popupTimeout);
  const pop = document.getElementById('evPopup');
  document.getElementById('popupTitle').textContent = ev.title;
  const d = new Date(ev.date + 'T00:00:00');
  document.getElementById('popupDate').textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('popupTime').textContent = `${formatTime12(ev.start)} – ${formatTime12(ev.end)}`;
  document.getElementById('popupCreator').textContent = `Created by: ${ev.creatorName || 'Unknown creator'}`;
  const x = Math.min(e.clientX + 12, window.innerWidth - 240);
  const y = Math.min(e.clientY + 12, window.innerHeight - 120);
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
  pop.classList.add('visible');
  if (e.type === 'click') {
    popupTimeout = setTimeout(() => pop.classList.remove('visible'), 3000);
  }
}

(function () {
  const evPopupEl = document.getElementById('evPopup');
  document.addEventListener('click', () => { if (evPopupEl) hidePopup(); });
  if (evPopupEl) evPopupEl.addEventListener('click', e => e.stopPropagation());

  const modalOverlayEl = document.getElementById('modalOverlay');
  if (modalOverlayEl) {
    modalOverlayEl.addEventListener('click', e => { if (e.target === modalOverlayEl) closeModal(); });
  }
})();

// ── GOOGLE CALENDAR INTEGRATION ──────────────────────────
let gcalConnected = false;

(async function initGcal() {
  const params = new URLSearchParams(window.location.search);
  const gcalParam = params.get('gcal');

  if (gcalParam === 'connected') { showGcalToast('✅ Google Calendar connected!', 'success'); window.history.replaceState({}, '', '/calendar'); }
  else if (gcalParam === 'denied') { showGcalToast('Google Calendar access was denied.', 'error'); window.history.replaceState({}, '', '/calendar'); }
  else if (gcalParam === 'error') { showGcalToast('Something went wrong. Please try again.', 'error'); window.history.replaceState({}, '', '/calendar'); }

  await refreshGcalStatus();
  if (gcalConnected) await importGcalEvents();
})();

async function refreshGcalStatus() {
  try {
    const res = await fetch('/calendar/api/google-status');
    const data = await res.json();
    gcalConnected = !!data.connected;
  } catch { gcalConnected = false; }
  updateGcalUI();
}

function updateGcalUI() {
  const btn = document.getElementById('gcalBtn');
  const label = document.getElementById('gcalBtnLabel');
  const disconnect = document.getElementById('gcalDisconnect');
  const inviteWrapper = document.getElementById('gcalInviteWrapper'); // <-- The new UI wrapper
  
  if (!btn) return;
  if (gcalConnected) {
    btn.classList.add('connected');
    btn.classList.remove('loading');
    label.textContent = 'Google Calendar Linked';
    disconnect.style.display = 'inline';
    if(inviteWrapper) inviteWrapper.style.display = 'flex'; // Show checkbox in modal
  } else {
    btn.classList.remove('connected', 'loading');
    label.textContent = 'Connect Google Calendar';
    disconnect.style.display = 'none';
    if(inviteWrapper) inviteWrapper.style.display = 'none'; // Hide checkbox in modal
  }
}

async function handleGcalBtn() {
  if (!gcalConnected) {
    window.location.href = '/calendar/google/connect';
  } else {
    const btn = document.getElementById('gcalBtn');
    const label = document.getElementById('gcalBtnLabel');
    btn.classList.add('loading');
    label.textContent = 'Syncing…';
    await importGcalEvents();
    updateGcalUI();
    showGcalToast('✅ Google Calendar synced!', 'success');
  }
}

async function importGcalEvents() {
  try {
    const res = await fetch('/calendar/api/google-events');
    const data = await res.json();

    if (!data.success || !data.connected) { gcalConnected = false; updateGcalUI(); return; }

    events = events.filter(e => !e.google_event_id); 
    events = events.concat(data.events.map(e => ({
      id: e.eventId,
      title: e.title_summary,
      type: e.type,
      date: e.start_date,
      start: e.start_time || '00:00',
      end: e.end_time || '23:59',
      location: e.location,
      videoLink: e.videoLink,
      win: e.win,
      google_event_id: e.google_event_id,
      color: '#818cf8',
      source: 'google'
    })));
    updateColorsAndLegend();
    render();
    console.log(`[GCAL] ${data.events.length} Google events loaded (${data.imported} upserted to DB)`);
  } catch (err) {
    console.error('[GCAL] Import error:', err);
    showGcalToast('Could not load Google events.', 'error');
  }
}

async function disconnectGcal() {
  if (!confirm('Disconnect Google Calendar? Imported events will be removed from TeamForge.')) return;
  try {
    await fetch('/calendar/api/google-disconnect', { method: 'POST' });
    events = events.filter(e => !e.google_event_id);
    gcalConnected = false;
    updateGcalUI();
    render();
    showGcalToast('Google Calendar disconnected.', 'info');
  } catch (err) { console.error('[GCAL] Disconnect error:', err); }
}

function showGcalToast(message, type = 'info') {
  document.querySelectorAll('.gcal-toast').forEach(t => t.remove());
  const colors = { success: '#22c55e', error: '#ef4444', info: '#818cf8' };
  const toast = document.createElement('div');
  toast.className = 'gcal-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', right: '24px',
    background: colors[type] || colors.info, color: '#fff',
    padding: '10px 18px', borderRadius: '8px',
    fontFamily: "'Barlow', sans-serif", fontWeight: '600', fontSize: '14px',
    zIndex: '9999', boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
    opacity: '0', transition: 'opacity 0.25s'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ── INIT ─────────────────────────────────────────────────
loadEvents();
