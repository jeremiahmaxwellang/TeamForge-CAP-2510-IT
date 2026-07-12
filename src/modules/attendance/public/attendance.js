const attendanceState = {
  events: [],
  filteredEvents: [],
  currentEventId: null,
};

const formatEventLabel = (event) => {
  const dateValue = event.start_datetime || event.start_date || null;
  const date = dateValue ? new Date(dateValue) : null;
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dateText = date ? formatter.format(date) : 'Unknown date';
  const type = event.type || 'Other';
  const title = event.title_summary || 'Untitled event';

  return `${dateText} – ${type}: ${title}`;
};

const updateEventSelector = (events) => {
  const eventSelector = document.getElementById('eventSelector');
  if (!eventSelector) return;
  const previousSelection = eventSelector.value;
  eventSelector.innerHTML = '<option value="">Select an event</option>';
  events.forEach((event) => {
    const option = document.createElement('option');
    option.value = event.eventId;
    option.textContent = formatEventLabel(event);
    eventSelector.appendChild(option);
  });

  // Try to preserve an existing selection when possible
  if (previousSelection && Array.from(eventSelector.options).some((o) => o.value === previousSelection)) {
    eventSelector.value = previousSelection;
  } else if (attendanceState.currentEventId && Array.from(eventSelector.options).some((o) => o.value === attendanceState.currentEventId)) {
    eventSelector.value = attendanceState.currentEventId;
  } else {
    // leave as default (no selection)
    eventSelector.value = '';
    attendanceState.currentEventId = null;
  }
  updateNavButtons();
};

const updateParticipantCount = (count) => {
  const participantCount = document.getElementById('participantCount');
  if (!participantCount) return;
  participantCount.textContent = `${count} Participant${count === 1 ? '' : 's'}`;
};

const renderAttendanceRows = (participants) => {
  const attendanceBody = document.getElementById('attendanceBody');
  if (!attendanceBody) return;

  if (!participants || participants.length === 0) {
    updateParticipantCount(0);
    attendanceBody.innerHTML = '<tr><td colspan="3" class="no-participants">Select an event to display participants.</td></tr>';
    return;
  }

  updateParticipantCount(participants.length);
  const teamMap = attendanceState.currentTeamMap || null;
  const groups = {};
  const groupOrder = [];

  if (teamMap) {
    participants.forEach((participant) => {
      const teamValue = participant.team || participant.teamName || '';
      const teamLabel = teamMap[teamValue] || 'No Team';
      if (!groups[teamLabel]) {
        groups[teamLabel] = [];
        groupOrder.push(teamLabel);
      }
      groups[teamLabel].push(participant);
    });
  } else {
    groups.All = participants;
    groupOrder.push('All');
  }

  attendanceBody.innerHTML = groupOrder
    .map((groupLabel) => {
      const rows = groups[groupLabel]
        .map((participant, index) => {
          const displayRole = participant.displayedRole || participant.position || 'Participant';
          const roleLabel = participant.displayedRole ? `<em>${participant.displayedRole}</em>` : '';
          const metaParts = [participant.position || 'Player'];
          if (teamMap && teamMap[participant.team || participant.teamName || '']) {
            metaParts.unshift(`<span class="team-label">${teamMap[participant.team || participant.teamName || '']}</span>`);
          }
          if (participant.displayedRole) metaParts.push(roleLabel);

          const name = participant.name || 'Unnamed participant';
          const noteValue = participant.notes ? participant.notes.replace(/"/g, '&quot;') : '';
          const status = participant.attendance_status || '';

          return `
            <tr class="attendance-row" data-user-id="${participant.userId}">
              <td class="participant-cell">
                <span class="participant-name">${name}</span>
                <span class="participant-meta">${metaParts.join(', ')}</span>
              </td>
              <td>
                <select name="status_${groupLabel}_${index}" class="attendance-status-select attendance-select">
                  <option value="" ${status === '' ? 'selected' : ''}>Select status</option>
                  <option value="Present" ${status === 'Present' ? 'selected' : ''}>Present</option>
                  <option value="Late" ${status === 'Late' ? 'selected' : ''}>Late</option>
                  <option value="Absent" ${status === 'Absent' ? 'selected' : ''}>Absent</option>
                  <option value="Excused" ${status === 'Excused' ? 'selected' : ''}>Excused</option>
                </select>
              </td>
              <td><input type="text" class="note-input" placeholder="Enter note" value="${noteValue}"></td>
            </tr>
          `;
        })
        .join('');

      if (teamMap) {
        return `
          <tr class="team-group-header">
            <td colspan="3">${groupLabel}</td>
          </tr>
          ${rows}
        `;
      }

      return rows;
    })
    .join('');
};

window.saveAttendance = async () => {
  const eventSelector = document.getElementById('eventSelector');
  if (!eventSelector) return;

  const selectedId = eventSelector.value;
  if (!selectedId) {
    alert('Please select an event before saving attendance.');
    return;
  }

  console.log('[ATTENDANCE] Saving attendance for event:', selectedId);

  const rows = Array.from(document.querySelectorAll('#attendanceBody tr[data-user-id]'));
  console.log('[ATTENDANCE] Found rows:', rows.length);

  const attendance = rows.map((row, index) => {
    const userId = row.dataset.userId;
    const selectedStatus = row.querySelector('select');
    const notesInput = row.querySelector('.note-input');

    const entry = {
      userId,
      attendance_status: selectedStatus ? selectedStatus.value : null,
      notes: notesInput ? notesInput.value.trim() : null,
    };
    console.log(`[ATTENDANCE] Row ${index}: userId=${userId}, status=${entry.attendance_status}, notes=${entry.notes}`);
    return entry;
  });

  console.log('[ATTENDANCE] Sending payload:', { attendance });

  try {
    const response = await fetch(`/attendance/api/events/${selectedId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance }),
    });

    console.log('[ATTENDANCE] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ATTENDANCE] HTTP error response:', errorText);
      throw new Error(`Failed to save attendance: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[ATTENDANCE] Response data:', result);

    if (result.success) {
      console.log('[ATTENDANCE] Attendance saved successfully');
      alert('Attendance saved successfully.');
    } else {
      throw new Error(result.message || 'Unable to save attendance.');
    }
  } catch (error) {
    console.error('[ATTENDANCE] Error saving attendance:', error);
    console.error('[ATTENDANCE] Error stack:', error.stack);
    alert('There was a problem saving attendance. Please check the console for details.');
  }
};

window.filterEvents = () => {
  const eventTypeFilter = document.getElementById('eventTypeFilter');
  if (!eventTypeFilter) return;

  const selectedType = eventTypeFilter.value;
  attendanceState.filteredEvents = selectedType
    ? attendanceState.events.filter((event) => (event.type || '').toLowerCase() === selectedType.toLowerCase())
    : attendanceState.events;
  updateEventSelector(attendanceState.filteredEvents);

  // Automatically load the latest scrim when Scrim is selected by default.
  if (selectedType.toLowerCase() === 'scrim' && attendanceState.filteredEvents.length > 0) {
    const latestScrimId = attendanceState.filteredEvents[0].eventId;
    const eventSelector = document.getElementById('eventSelector');
    if (eventSelector) {
      eventSelector.value = latestScrimId;
      attendanceState.currentEventId = String(latestScrimId);
      loadEvent();
    }
  }
};

window.loadEvent = async () => {
  const eventSelector = document.getElementById('eventSelector');
  if (!eventSelector) return;

  const selectedId = eventSelector.value;
  attendanceState.currentEventId = selectedId || null;
  updateNavButtons();
  if (!selectedId) {
    renderAttendanceRows([]);
    return;
  }

  try {
    const response = await fetch(`/attendance/api/events/${selectedId}/participants`);
    if (!response.ok) throw new Error(`Failed to fetch participants: ${response.status}`);

    const participants = await response.json();
    const list = Array.isArray(participants) ? participants : [];

    // Determine team mapping for scrims so we can label Team 1 / Team 2
    const eventObj = attendanceState.filteredEvents.find((e) => String(e.eventId) === String(selectedId)) || attendanceState.events.find((e) => String(e.eventId) === String(selectedId));
    attendanceState.currentTeamMap = null;
    if (eventObj && (eventObj.type || '').toLowerCase() === 'scrim' && list.length > 0) {
      const seen = [];
      list.forEach((p) => {
        const key = p.team || p.teamName || null;
        if (key && !seen.includes(key)) seen.push(key);
      });
      if (seen.length > 0) {
        // Map first two teams to Team 1 / Team 2, others to Team N
        attendanceState.currentTeamMap = {};
        seen.forEach((val, idx) => {
          attendanceState.currentTeamMap[val] = idx < 2 ? `Team ${idx + 1}` : `Team ${idx + 1}`;
        });
      }
    }

    renderAttendanceRows(list);
  } catch (error) {
    console.error('Error loading event participants:', error);
    renderAttendanceRows([]);
  }
};

// Navigation helpers: next / previous event based on filteredEvents order
const getFilteredIndexByEventId = (id) => {
  if (!id) return -1;
  return attendanceState.filteredEvents.findIndex((e) => String(e.eventId) === String(id));
};

const updateNavButtons = () => {
  const prevBtn = document.getElementById('prevEventBtn');
  const nextBtn = document.getElementById('nextEventBtn');
  const has = attendanceState.filteredEvents && attendanceState.filteredEvents.length > 0;
  if (prevBtn) prevBtn.disabled = !has;
  if (nextBtn) nextBtn.disabled = !has;
};

window.prevEvent = () => {
  const sel = document.getElementById('eventSelector');
  if (!sel || !attendanceState.filteredEvents || attendanceState.filteredEvents.length === 0) return;
  const currentId = sel.value;
  let idx = getFilteredIndexByEventId(currentId);
  if (idx === -1) idx = 0; // if none selected, start at first
  const prevIdx = (idx - 1 + attendanceState.filteredEvents.length) % attendanceState.filteredEvents.length;
  sel.value = attendanceState.filteredEvents[prevIdx].eventId;
  attendanceState.currentEventId = sel.value;
  loadEvent();
};

window.nextEvent = () => {
  const sel = document.getElementById('eventSelector');
  if (!sel || !attendanceState.filteredEvents || attendanceState.filteredEvents.length === 0) return;
  const currentId = sel.value;
  let idx = getFilteredIndexByEventId(currentId);
  if (idx === -1) idx = 0;
  const nextIdx = (idx + 1) % attendanceState.filteredEvents.length;
  sel.value = attendanceState.filteredEvents[nextIdx].eventId;
  attendanceState.currentEventId = sel.value;
  loadEvent();
};

const loadAttendanceEvents = async () => {
  try {
    const response = await fetch('/attendance/api/events');
    if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);

    const events = await response.json();
    attendanceState.events = Array.isArray(events) ? events : [];
    attendanceState.events.sort((a, b) => {
      const aDate = new Date(a.start_datetime || a.start_date || 0).getTime();
      const bDate = new Date(b.start_datetime || b.start_date || 0).getTime();
      return bDate - aDate;
    });

    filterEvents();
    renderAttendanceRows([]);
  } catch (error) {
    console.error('Error loading attendance events:', error);
    const eventSelector = document.getElementById('eventSelector');
    if (eventSelector) {
      eventSelector.innerHTML = '<option value="">Unable to load events</option>';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const attendanceRadios = document.querySelectorAll('.att-radio');

  attendanceRadios.forEach((radio) => {
    radio.addEventListener('pointerdown', function () {
      this.dataset.wasChecked = this.checked ? 'true' : 'false';
    });

    radio.addEventListener('click', function () {
      if (this.dataset.wasChecked === 'true') {
        this.checked = false;
        this.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  loadAttendanceEvents();
  // Wire nav button clicks
  const prevBtn = document.getElementById('prevEventBtn');
  const nextBtn = document.getElementById('nextEventBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => window.prevEvent());
  if (nextBtn) nextBtn.addEventListener('click', () => window.nextEvent());
});
