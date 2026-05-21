const attendanceState = {
  events: [],
  filteredEvents: [],
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

  eventSelector.innerHTML = '<option value="">Select an event</option>';
  events.forEach((event) => {
    const option = document.createElement('option');
    option.value = event.eventId;
    option.textContent = formatEventLabel(event);
    eventSelector.appendChild(option);
  });
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
    attendanceBody.innerHTML = '<tr><td colspan="7" class="no-participants">Select an event to display participants.</td></tr>';
    return;
  }

  updateParticipantCount(participants.length);
  attendanceBody.innerHTML = participants
    .map((participant, index) => {
      const displayRole = participant.displayedRole || participant.position || 'Participant';
      const roleLabel = participant.displayedRole ? `<em>${participant.displayedRole}</em>` : '';
      const metaParts = [participant.position || 'Player'];
      if (participant.displayedRole) metaParts.push(roleLabel);

      const name = participant.name || 'Unnamed participant';
      const noteValue = participant.notes ? participant.notes.replace(/"/g, '&quot;') : '';
      const status = participant.attendance_status || '';
      const rsvpClass = status === 'Present' || status === 'Late' ? 'rsvp-yes' : 'rsvp-no';
      const rsvpIcon = status === 'Present' || status === 'Late' ? '👍' : '👎';
      const rsvpTitle = status === 'Present' || status === 'Late' ? 'Accepted' : 'Declined';

      return `
        <tr class="attendance-row">
          <td class="participant-cell">
            <span class="participant-name">${name}</span>
            <span class="participant-meta">${metaParts.join(', ')}</span>
          </td>
          <td><input type="radio" name="status_${index}" value="Present" class="att-radio present" ${status === 'Present' ? 'checked' : ''}></td>
          <td><input type="radio" name="status_${index}" value="Late" class="att-radio late" ${status === 'Late' ? 'checked' : ''}></td>
          <td><input type="radio" name="status_${index}" value="Absent" class="att-radio absent" ${status === 'Absent' ? 'checked' : ''}></td>
          <td><input type="radio" name="status_${index}" value="Excused" class="att-radio excused" ${status === 'Excused' ? 'checked' : ''}></td>
          <td><input type="text" class="note-input" placeholder="Enter note" value="${noteValue}"></td>
          <td><span class="rsvp-icon ${rsvpClass}" title="${rsvpTitle}">${rsvpIcon}</span></td>
        </tr>
      `;
    })
    .join('');
};

window.filterEvents = () => {
  const eventTypeFilter = document.getElementById('eventTypeFilter');
  if (!eventTypeFilter) return;

  const selectedType = eventTypeFilter.value;
  attendanceState.filteredEvents = selectedType
    ? attendanceState.events.filter((event) => (event.type || '').toLowerCase() === selectedType.toLowerCase())
    : attendanceState.events;

  updateEventSelector(attendanceState.filteredEvents);
};

window.loadEvent = async () => {
  const eventSelector = document.getElementById('eventSelector');
  if (!eventSelector) return;

  const selectedId = eventSelector.value;
  if (!selectedId) {
    renderAttendanceRows([]);
    return;
  }

  try {
    const response = await fetch(`/attendance/api/events/${selectedId}/participants`);
    if (!response.ok) throw new Error(`Failed to fetch participants: ${response.status}`);

    const participants = await response.json();
    renderAttendanceRows(Array.isArray(participants) ? participants : []);
  } catch (error) {
    console.error('Error loading event participants:', error);
    renderAttendanceRows([]);
  }
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
      return aDate - bDate;
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
});
