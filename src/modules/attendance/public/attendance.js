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

window.filterEvents = () => {
  const eventTypeFilter = document.getElementById('eventTypeFilter');
  if (!eventTypeFilter) return;

  const selectedType = eventTypeFilter.value;
  attendanceState.filteredEvents = selectedType
    ? attendanceState.events.filter((event) => (event.type || '').toLowerCase() === selectedType.toLowerCase())
    : attendanceState.events;

  updateEventSelector(attendanceState.filteredEvents);
};

window.loadEvent = () => {
  const eventSelector = document.getElementById('eventSelector');
  if (!eventSelector) return;

  const selectedId = eventSelector.value;
  if (!selectedId) return;

  const selectedEvent = attendanceState.events.find((event) => String(event.eventId) === String(selectedId));
  if (selectedEvent) {
    console.log('Loaded attendance event:', selectedEvent);
  }
};

const loadAttendanceEvents = async () => {
  try {
    const response = await fetch('/events');
    if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);

    const events = await response.json();
    attendanceState.events = Array.isArray(events) ? events : [];
    attendanceState.events.sort((a, b) => {
      const aDate = new Date(a.start_datetime || a.start_date || 0).getTime();
      const bDate = new Date(b.start_datetime || b.start_date || 0).getTime();
      return aDate - bDate;
    });

    filterEvents();
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
