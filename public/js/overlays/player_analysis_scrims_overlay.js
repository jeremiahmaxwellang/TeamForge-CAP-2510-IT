window.initScrimsTab = function (userId) {
  const Backend = window.ScrimsBackend;
  if (!Backend) {
    console.error('[SCRIMS] Backend module not loaded.');
    return;
  }

  // ── DATE FORMATTER ────────────────────────────────────
  function formatEventDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const dateLine = date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
    });
    const timeLine = date.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC'
    });
    return `${dateLine}<br>${timeLine}`;
  }

  function normalizeStatus(value) {
    return String(value || 'unevaluated').toLowerCase();
  }

  console.log('[SCRIMS] Tab initialized for userId:', userId);

  // ── DOM REFS ──────────────────────────────────────────
  const tableBody  = document.querySelector('.scrim-table tbody');
  const timesBody  = document.querySelector('.times-played-table tbody');
  const statusFilter = document.getElementById('scrimStatusFilter');

  let allEvents = [];

  // ── RENDER SCRIM TABLE ROWS ───────────────────────────
  function renderScrimRows(filterValue) {
    const selected = filterValue || 'all';
    const filtered = selected === 'all'
      ? allEvents
      : allEvents.filter(e => normalizeStatus(e.status) === selected);

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr class="scrim-empty-row">
          <td colspan="7">${selected === 'all' ? 'No scrims yet.' : `No ${selected} scrims found.`}</td>
        </tr>`;
      return;
    }

    filtered.forEach((event, index) => {
      const eventId    = event.eventId;
      const evalRowId  = `eval-row-${eventId}`;
      const btnId      = `eval-btn-${eventId}`;

      // Team display from event_attendees joined data
      const teamNames = event.teamDisplay || event.playerDisplay || '—';

      const wl = event.win || '—';
      const vodLink = event.videoLink
        ? `<a href="${event.videoLink}" target="_blank">Link</a>`
        : '—';

      // ── SCRIM ROW ──
      const scrimRow = document.createElement('tr');
      scrimRow.classList.add('scrim-row');
      scrimRow.setAttribute('data-event-id', eventId);
      if (event.win === 'W') scrimRow.classList.add('scrim-win');
      if (event.win === 'L') scrimRow.classList.add('scrim-loss');

      scrimRow.innerHTML = `
        <td>${index + 1}</td>
        <td>${event.title_summary || '—'}</td>
        <td>${formatEventDate(event.start_datetime)}</td>
        <td>${teamNames}</td>          <!-- shows all attendees -->
        <td>${wl}</td>
        <td>${vodLink}</td>
        <td>
          <button class="eval-toggle-btn" id="${btnId}">v</button>
        </td>
      `;

      // ── INLINE EVAL ROW ──
      const evalRow = document.createElement('tr');
      evalRow.classList.add('eval-inline-row', 'hidden');
      evalRow.id = evalRowId;
      evalRow.innerHTML = `
        <td colspan="7">
          <div class="eval-inline-content">

            <div class="eval-inline-left">
              <div class="eval-player-title" id="eval-title-${eventId}">
                Evaluation:
              </div>
              <div class="eval-range-hint">
                <span>1 lowest</span>
                <span>5 highest</span>
              </div>
              <div class="inline-col-labels">
                <div></div>
                ${[1,2,3,4,5].map(n => `<div class="inline-col-label">${n}</div>`).join('')}
              </div>
              <div class="inline-rating-grid">
                <div class="rating-label">Game Sense</div>
                ${[1,2,3,4,5].map(n => `
                  <div class="radio-group">
                    <input type="radio" name="gameSense_${eventId}" value="${n}">
                  </div>`).join('')}

                <div class="rating-label">Comms</div>
                ${[1,2,3,4,5].map(n => `
                  <div class="radio-group">
                    <input type="radio" name="communication_${eventId}" value="${n}">
                  </div>`).join('')}

                <div class="rating-label">Champ Pool</div>
                ${[1,2,3,4,5].map(n => `
                  <div class="radio-group">
                    <input type="radio" name="champPool_${eventId}" value="${n}">
                  </div>`).join('')}
              </div>
            </div>

            <div class="eval-inline-right">
              <label>Comments from the Coach:</label>
              <textarea class="eval-inline-comment"
                id="comment_${eventId}"
                placeholder="Enter a comment here"></textarea>
              <button class="eval-inline-confirm"
                id="confirm-btn-${eventId}">
                Confirm
              </button>
            </div>

          </div>
        </td>
      `;

      tableBody.appendChild(scrimRow);
      tableBody.appendChild(evalRow);

      // ── V BUTTON: toggle + load eval ──
      const toggleBtn = scrimRow.querySelector(`#${btnId}`);
      toggleBtn.addEventListener('click', () => {
        const isHidden = evalRow.classList.toggle('hidden');
        toggleBtn.classList.toggle('active', !isHidden);

        // Close all other open eval rows
        document.querySelectorAll('.eval-inline-row:not(.hidden)').forEach(row => {
          if (row.id !== evalRowId) {
            row.classList.add('hidden');
            const otherId = row.id.replace('eval-row-', '');
            const otherBtn = document.getElementById(`eval-btn-${otherId}`);
            if (otherBtn) otherBtn.classList.remove('active');
          }
        });

        // Load eval data when opening
        if (!isHidden) {
          loadEvaluation(eventId);
        }
      });

      // ── CONFIRM BUTTON: submit eval ──
      const confirmBtn = evalRow.querySelector(`#confirm-btn-${eventId}`);
      confirmBtn.addEventListener('click', () => submitEval(eventId));
    });
  }

  // ── LOAD EXISTING EVALUATION ──────────────────────────
  function loadEvaluation(eventId) {
    Backend.fetchEvaluation(userId, eventId)
      .then((evalData) => {
        // Update title with player name if returned
        const titleEl = document.getElementById(`eval-title-${eventId}`);
        if (titleEl && evalData.playerName) {
          titleEl.textContent = `Evaluation: ${evalData.playerName}`;
        }

        // Pre-fill ratings
        ['gameSense', 'communication', 'champPool'].forEach(field => {
          // Map field name to evalData key
          const keyMap = {
            gameSense:     'ratingGameSense',
            communication: 'ratingCommunication',
            champPool:     'ratingChampionPool'
          };
          const val = evalData[keyMap[field]];
          if (val) {
            const radio = document.querySelector(
              `input[name="${field}_${eventId}"][value="${val}"]`
            );
            if (radio) radio.checked = true;
          }
        });

        // Pre-fill comment
        const commentEl = document.getElementById(`comment_${eventId}`);
        if (commentEl) commentEl.value = evalData.comment || '';

        console.log(`[EVAL] ✓ Pre-filled evaluation for eventId ${eventId}`);
      })
      .catch(err => {
        console.warn(`[EVAL] No existing evaluation for eventId ${eventId}:`, err);
      });
  }

  // ── SUBMIT EVALUATION ─────────────────────────────────
  async function submitEval(eventId) {
    const gameSense     = document.querySelector(`input[name="gameSense_${eventId}"]:checked`)?.value;
    const communication = document.querySelector(`input[name="communication_${eventId}"]:checked`)?.value;
    const champPool     = document.querySelector(`input[name="champPool_${eventId}"]:checked`)?.value;
    const comment       = document.getElementById(`comment_${eventId}`)?.value;

    if (!gameSense || !communication || !champPool) {
      alert('Please fill in all ratings before confirming.');
      return;
    }

    const data = {
      comment,
      ratingGameSense:     parseInt(gameSense, 10),
      ratingCommunication: parseInt(communication, 10),
      ratingChampionPool:  parseInt(champPool, 10),
      coachId: 2 // TODO: replace with logged-in coach ID from cookies/session
    };

    try {
      const result = await Backend.saveEvaluation(userId, eventId, data);

      if (result.success) {
        alert('Evaluation saved!');

        // Mark event as evaluated in local state and re-render
        const target = allEvents.find(e => Number(e.eventId) === Number(eventId));
        if (target) {
          target.status = 'evaluated';
          renderScrimRows(statusFilter?.value || 'all');
        }
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      console.error('[EVAL] ✗ Submit failed:', err);
      alert('Failed to save evaluation.');
    }
  }

  // ── LOAD SCRIMS (EVENTS) ──────────────────────────────
  function loadScrimsForPlayer(playerId) {
    Backend.fetchScrims(playerId)
      .then((events) => {
        allEvents = events;
        renderScrimRows(statusFilter?.value || 'all');
        console.log('[SCRIMS] ✓ Events loaded:', events.length);
      })
      .catch(err => {
        console.error('[SCRIMS] ✗ Error loading events:', err);
        allEvents = [];
        renderScrimRows('all');
      });
  }

  function loadTimesPlayedForPlayer(playerId) {
    Backend.fetchTimesPlayed(playerId)
      .then((timesPlayed) => {
        if (!timesBody) {
          console.warn('[SCRIMS] Times played table body not found.');
          return;
        }

        timesBody.innerHTML = '';

        if (!timesPlayed.length) {
          timesBody.innerHTML = `
            <tr class="times-played-row">
              <td colspan="3">No scrims yet.</td>
            </tr>`;
          return;
        }

        timesPlayed.forEach(item => {
          const row = document.createElement('tr');
          row.classList.add('times-played-row');

          const comms = parseFloat(item.averageComms);
          const commsColor = comms >= 3 ? '#22c55e' : '#ef4444';

          row.innerHTML = `
            <td>${item.gameName}</td>
            <td style="text-align:center">${item.timesPlayed}</td>
            <td style="text-align:center; color:${commsColor}; font-weight:700">
              ${comms.toFixed(1)}
            </td>
          `;
          timesBody.appendChild(row);
        });

        console.log('[SCRIMS] ✓ Times played loaded');
      })
      .catch(err => {
        console.error('[SCRIMS] ✗ Error loading times played:', err);
        if (timesBody) {
          timesBody.innerHTML = `
            <tr class="times-played-row">
              <td colspan="3">No scrims yet.</td>
            </tr>`;
        }
      });
  }

  // Initial load
  loadScrimsForPlayer(userId);
  loadTimesPlayedForPlayer(userId);

  // ── LISTEN FOR PLAYER CHANGES ─────────────────────
  document.addEventListener('playeranalysis:player-changed', (event) => {
    const newPlayerId = event.detail?.userId;
    if (newPlayerId) {
      console.log('[SCRIMS] Player changed, reloading scrims and times played for player:', newPlayerId);
      loadScrimsForPlayer(newPlayerId);
      loadTimesPlayedForPlayer(newPlayerId);
    }
  });

  // ── FILTER CHANGE ─────────────────────────────────────
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      renderScrimRows(statusFilter.value);
    });
  }
};