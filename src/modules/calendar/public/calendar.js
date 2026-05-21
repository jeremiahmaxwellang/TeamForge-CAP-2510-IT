// ── STATE ────────────────────────────────────────────────
let currentDate = new Date(2026, 3, 1); // April 2026
let currentView = 'month';
let pendingDate = null;

const TYPE_COLORS = {
  Scrim: '#f97316',
  Tournament: '#facc15',
  Meeting: '#22c55e',
  Other: '#a78bfa',
  Class: '#ef4444',
  Default: '#38bdf8'
};

let events = [];

// ── UTILS ────────────────────────────────────────────────
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function dateStr(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
function today() { const t = new Date(); return dateStr(t.getFullYear(), t.getMonth(), t.getDate()); }
function eventsForDate(ds) { return events.filter(e => e.date === ds); }
function timeToMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function formatTime12(t) { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2, '0')}${ap}`; }

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
      el.style.background = ev.color || TYPE_COLORS[ev.type] || TYPE_COLORS.Default;
      el.textContent = `${ev.start} ${ev.title}`;
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
      el.style.cssText = `background:${ev.color || TYPE_COLORS[ev.type] || TYPE_COLORS.Default};top:${topPx}px;height:${Math.max(heightPx, 20)}px;`;
      el.innerHTML = `<div class="ev-title">${ev.title}</div><div class="ev-time">${ev.start} – ${ev.end}</div>`;
      el.onclick = (e) => { e.stopPropagation(); showPopup(e, ev); };
      col.appendChild(el);
    });

    body.appendChild(col);
  }

  renderHeatmap(sun);
}

// ── HEATMAP ──────────────────────────────────────────────
function renderHeatmap(weekStart) {
  const panel = document.getElementById('heatmapPanel');
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const pcts = [88, 92, 54, 92, 96];
  const dotColors = [
    ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
    ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
    ['#ef4444', '#ef4444', '#facc15', '#facc15', '#facc15', '#facc15', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
    ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
    ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
  ];
  const barColor = (p) => p >= 80 ? '#22c55e' : p >= 60 ? '#facc15' : '#ef4444';

  let html = `
    <div class="heatmap-header">
      <div class="heatmap-title">Availability Heatmap</div>
      <div class="heatmap-pct-label">% of players FREE</div>
    </div>
    <div class="heatmap-days">`;

  dayNames.forEach((day, i) => {
    html += `
      <div class="hday">
        <div class="hday-row">
          <div class="hday-name">${day}</div>
          <div class="hday-bar-wrap">
            <div class="hday-bar" style="width:${pcts[i]}%;background:${barColor(pcts[i])}">${pcts[i]}%</div>
          </div>
          <div class="hday-pct">${pcts[i]}% free</div>
        </div>
        <div class="hday-dots">
          ${dotColors[i].map(c => `<div class="hdot" style="background:${c}"></div>`).join('')}
        </div>
      </div>`;
  });

  html += `</div>
    <div class="free-slots">
      <div class="free-slots-title">ALL PLAYERS FREE — Day &amp; Time <small style="color:var(--muted);font-weight:400;margin-left:4px;">Selected players</small></div>
      ${[
      ['Monday', '1:00 PM – 1:30 PM'],
      ['Monday', '1:30 PM – 2:00 PM'],
      ['Monday', '2:00 PM – 2:30 PM'],
      ['Monday', '2:30 PM – 3:00 PM'],
      ['Monday', '3:00 PM – 3:30 PM'],
      ['Monday', '3:30 PM – 4:00 PM'],
    ].map(([day, time]) => `
        <div class="free-slot-item">
          <span class="fsi-day">${day}</span>
          <span class="fsi-time">🕐 ${time}</span>
          <span class="fsi-note">All players free</span>
        </div>`).join('')}
    </div>
    <div class="free-days-section">
      <div class="free-days-title">Completely Free Days (100% all day)</div>
      <div class="no-free">No fully free days</div>
    </div>`;

  panel.innerHTML = html;
}

// ── MODAL ────────────────────────────────────────────────
function openCreateModal(ds) {
  pendingDate = ds || today();
  document.getElementById('evDate').value = pendingDate;
  document.getElementById('evTitle').value = '';
  document.getElementById('evType').value = 'Scrim';
  document.getElementById('evStart').value = '10:00';
  document.getElementById('evEnd').value = '11:00';
  document.getElementById('evLocation').value = '';
  document.getElementById('evVideo').value = '';
  document.getElementById('evWL').value = 'N/A';
  document.getElementById('modalOverlay').classList.add('open');

  document.querySelectorAll('.role-slot .player-card').forEach(el => el.remove());
  document.querySelectorAll('.placeholder-text').forEach(el => el.style.display = 'inline');

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
  const participants = [];

  if (type !== 'Meeting') {
    document.querySelectorAll('.role-slot .player-card').forEach(card => {
      const slot = card.closest('.role-slot');
      participants.push({ userId: card.dataset.userId, role: slot.dataset.role, isSub: slot.dataset.sub });
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
    participants
  };

  fetch('/calendar/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        events.push({ id: data.eventId || Date.now(), title, type, date, start, end, color: TYPE_COLORS[type] || TYPE_COLORS.Default });
        closeModal();
        render();
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
        google_event_id: e.google_event_id || null, // ad 
        color: TYPE_COLORS[e.type] || TYPE_COLORS.Default
      }));
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
    fetchAvailability();
  }
}

document.getElementById('evType').addEventListener('change', triggerLayoutToggle);
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
function handleDragStart(e) { draggedCard = this; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => this.style.opacity = '0.5', 0); }
function handleDragEnd(e) { this.style.opacity = '1'; draggedCard = null; }

document.querySelectorAll('.role-slot').forEach(slot => {
  slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); });
  slot.addEventListener('dragleave', () => slot.classList.remove('over'));
  slot.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('over');
    if (draggedCard) {
      const existing = this.querySelector('.player-card');
      if (existing) document.getElementById('availablePlayers').appendChild(existing);
      this.querySelector('.placeholder-text').style.display = 'none';
      this.appendChild(draggedCard);
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
      this.appendChild(draggedCard);
      fetchAvailability();
    }
  });
});

// ── EVENT POPUP ──────────────────────────────────────────
let popupTimeout;
function showPopup(e, ev) {
  clearTimeout(popupTimeout);
  const pop = document.getElementById('evPopup');
  document.getElementById('popupTitle').textContent = ev.title;
  const d = new Date(ev.date + 'T00:00:00');
  document.getElementById('popupDate').textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('popupTime').textContent = `${formatTime12(ev.start)} – ${formatTime12(ev.end)}`;
  const x = Math.min(e.clientX + 12, window.innerWidth - 240);
  const y = Math.min(e.clientY + 12, window.innerHeight - 120);
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
  pop.classList.add('visible');
  popupTimeout = setTimeout(() => pop.classList.remove('visible'), 3000);
}

(function () {
  const evPopupEl = document.getElementById('evPopup');
  document.addEventListener('click', () => { if (evPopupEl) evPopupEl.classList.remove('visible'); });
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
  if (!btn) return;
  if (gcalConnected) {
    btn.classList.add('connected');
    btn.classList.remove('loading');
    label.textContent = 'Google Calendar Linked';
    disconnect.style.display = 'inline';
  } else {
    btn.classList.remove('connected', 'loading');
    label.textContent = 'Connect Google Calendar';
    disconnect.style.display = 'none';
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
