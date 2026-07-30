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

  let activePlayerId = userId;

  console.log('[SCRIMS] Tab initialized for userId:', activePlayerId);

  // ── DOM REFS ──────────────────────────────────────────
  const tableBody  = document.querySelector('.scrim-table tbody');
  const timesBody  = document.querySelector('.times-played-table tbody');
  const statusFilter = document.getElementById('scrimStatusFilter');
  const subtabButtons = document.querySelectorAll('[data-scrims-view]');
  const detailsPanel = document.getElementById('scrims-details-panel');
  const comparisonPanel = document.getElementById('scrims-comparison-panel');
  const roleFilter = document.getElementById('scrimRoleFilter');
  const comparisonStatus = document.getElementById('scrimComparisonStatus');
  const comparisonContent = document.getElementById('scrimComparisonContent');
  const ratingBreakdown = document.getElementById('scrimRatingBreakdown');
  const overallRanking = document.getElementById('scrimOverallRanking');
  const comparisonTableBody = document.getElementById('scrimComparisonTableBody');
  const comparisonPlayerCount = document.getElementById('comparisonPlayerCount');
  const comparisonTopPlayer = document.getElementById('comparisonTopPlayer');
  const comparisonSelectedRank = document.getElementById('comparisonSelectedRank');

  let allEvents = [];
  let comparisonRows = [];
  let comparisonLoaded = false;
  let comparisonLoading = false;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toRating(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.max(0, Math.min(5, numeric)) : 0;
  }

  function ratingBar(metricClass, label, value) {
    const rating = toRating(value);
    const width = (rating / 5) * 100;
    return `
      <div class="rating-series">
        <span class="rating-series-name">${label}</span>
        <div class="rating-bar-track" aria-hidden="true">
          <div class="rating-bar-fill ${metricClass}" style="--rating-width:${width}%"></div>
        </div>
        <span class="rating-bar-value">${rating.toFixed(2)}</span>
      </div>`;
  }

  function getFilteredComparisonRows() {
    const selectedRole = roleFilter?.value || 'all';
    return selectedRole === 'all'
      ? [...comparisonRows]
      : comparisonRows.filter(row => row.role === selectedRole);
  }

  function populateRoleFilter() {
    if (!roleFilter) return;

    const selectedValue = roleFilter.value || 'all';
    const roles = [...new Set(comparisonRows.map(row => row.role).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    roleFilter.innerHTML = '<option value="all">All roles</option>' + roles
      .map(role => `<option value="${escapeHtml(role)}">${escapeHtml(role)}</option>`)
      .join('');

    roleFilter.value = roles.includes(selectedValue) ? selectedValue : 'all';
  }

  function renderComparisonViews() {
    const rows = getFilteredComparisonRows()
      .sort((a, b) => Number(b.overallAverage) - Number(a.overallAverage));

    if (comparisonPlayerCount) comparisonPlayerCount.textContent = String(rows.length);

    if (rows.length === 0) {
      if (comparisonStatus) {
        comparisonStatus.textContent = 'No evaluated scrim ratings match this filter.';
        comparisonStatus.classList.remove('hidden');
      }
      comparisonContent?.classList.add('hidden');
      return;
    }

    if (comparisonStatus) comparisonStatus.classList.add('hidden');
    comparisonContent?.classList.remove('hidden');

    const top = rows[0];
    if (comparisonTopPlayer) {
      comparisonTopPlayer.textContent = `${top.gameName} (${toRating(top.overallAverage).toFixed(2)})`;
    }

    const selectedIndex = rows.findIndex(
      row => Number(row.playerId) === Number(activePlayerId)
    );
    if (comparisonSelectedRank) {
      comparisonSelectedRank.textContent = selectedIndex >= 0
        ? `#${selectedIndex + 1} of ${rows.length}`
        : 'Not in filter';
    }

    if (ratingBreakdown) {
      ratingBreakdown.innerHTML = rows.map(row => {
        const selected = Number(row.playerId) === Number(activePlayerId);
        return `
          <div class="rating-comparison-row ${selected ? 'is-selected' : ''}">
            <div class="rating-player-label">
              <strong>${escapeHtml(row.gameName)}</strong>
              <span>${escapeHtml(row.role)} · ${Number(row.evaluatedScrims)} evaluated scrims</span>
            </div>
            <div class="rating-series-list">
              ${ratingBar('game-sense', 'Game Sense', row.averageGameSense)}
              ${ratingBar('communication', 'Communication', row.averageCommunication)}
              ${ratingBar('champion-pool', 'Champion Pool', row.averageChampionPool)}
            </div>
          </div>`;
      }).join('');
    }

    if (overallRanking) {
      overallRanking.innerHTML = rows.map((row, index) => {
        const overall = toRating(row.overallAverage);
        const selected = Number(row.playerId) === Number(activePlayerId);
        return `
          <div class="overall-ranking-row ${selected ? 'is-selected' : ''}">
            <div class="ranking-player-label">
              <strong>#${index + 1} ${escapeHtml(row.gameName)}</strong>
              <span>${escapeHtml(row.role)}</span>
            </div>
            <div class="ranking-series">
              <span class="rating-series-name">Overall</span>
              <div class="rating-bar-track" aria-hidden="true">
                <div class="rating-bar-fill overall" style="--rating-width:${(overall / 5) * 100}%"></div>
              </div>
              <span class="rating-bar-value">${overall.toFixed(2)}</span>
            </div>
          </div>`;
      }).join('');
    }

    if (comparisonTableBody) {
      comparisonTableBody.innerHTML = rows.map((row, index) => {
        const selected = Number(row.playerId) === Number(activePlayerId);
        return `
          <tr class="${selected ? 'is-selected' : ''}">
            <td>${index + 1}</td>
            <td>${escapeHtml(row.gameName)}</td>
            <td>${escapeHtml(row.role)}</td>
            <td>${Number(row.evaluatedScrims)}</td>
            <td>${toRating(row.averageGameSense).toFixed(2)}</td>
            <td>${toRating(row.averageCommunication).toFixed(2)}</td>
            <td>${toRating(row.averageChampionPool).toFixed(2)}</td>
            <td><strong>${toRating(row.overallAverage).toFixed(2)}</strong></td>
          </tr>`;
      }).join('');
    }
  }

  function loadRatingComparison(forceReload = false) {
    if (comparisonLoading || (comparisonLoaded && !forceReload)) {
      renderComparisonViews();
      return;
    }

    comparisonLoading = true;
    if (comparisonStatus) {
      comparisonStatus.textContent = 'Loading player rating comparison…';
      comparisonStatus.classList.remove('hidden');
    }
    comparisonContent?.classList.add('hidden');

    Backend.fetchRatingComparison()
      .then((rows) => {
        comparisonRows = Array.isArray(rows) ? rows : [];
        comparisonLoaded = true;
        populateRoleFilter();
        renderComparisonViews();
      })
      .catch((err) => {
        comparisonRows = [];
        comparisonLoaded = false;
        console.error('[SCRIMS] ✗ Error loading rating comparison:', err);
        if (comparisonStatus) {
          comparisonStatus.textContent = 'Failed to load the scrim rating comparison.';
          comparisonStatus.classList.remove('hidden');
        }
        comparisonContent?.classList.add('hidden');
      })
      .finally(() => {
        comparisonLoading = false;
      });
  }

  function setScrimsView(view) {
    const showComparison = view === 'comparison';

    subtabButtons.forEach(button => {
      const isActive = button.dataset.scrimsView === view;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    detailsPanel?.classList.toggle('hidden', showComparison);
    comparisonPanel?.classList.toggle('hidden', !showComparison);

    if (showComparison) loadRatingComparison();
  }

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
              <div class="inline-col-labels" style="align-items: flex-end;">
                <div></div>
                ${[1,2,3,4,5].map(n => {
                  let subLabel = '';
                  if (n === 1) subLabel = '<div style="font-size: 10px; font-weight: normal; color: #8892a0; margin-top: 2px;">Low</div>';
                  if (n === 5) subLabel = '<div style="font-size: 10px; font-weight: normal; color: #8892a0; margin-top: 2px;">High</div>';
                  
                  return `<div class="inline-col-label" style="text-align: center; line-height: 1.1;">
                            <div>${n}</div>
                            ${subLabel}
                          </div>`;
                }).join('')}
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
    Backend.fetchEvaluation(activePlayerId, eventId)
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
      const result = await Backend.saveEvaluation(activePlayerId, eventId, data);

      if (result.success) {
        alert('Evaluation saved!');

        // Mark event as evaluated in local state and re-render
        const target = allEvents.find(e => Number(e.eventId) === Number(eventId));
        if (target) {
          target.status = 'evaluated';
          renderScrimRows(statusFilter?.value || 'all');
          comparisonLoaded = false;
          if (!comparisonPanel?.classList.contains('hidden')) {
            loadRatingComparison(true);
          }
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

  // ── INTERNAL TAB CONTROLS ─────────────────────────────
  subtabButtons.forEach(button => {
    button.addEventListener('click', () => {
      setScrimsView(button.dataset.scrimsView);
    });
  });

  if (roleFilter) {
    roleFilter.addEventListener('change', renderComparisonViews);
  }

  // Initial load
  loadScrimsForPlayer(activePlayerId);
  loadTimesPlayedForPlayer(activePlayerId);
  setScrimsView('details');

  // ── LISTEN FOR PLAYER CHANGES ─────────────────────
  if (window.__scrimsPlayerChangeHandler) {
    document.removeEventListener(
      'playeranalysis:player-changed',
      window.__scrimsPlayerChangeHandler
    );
  }

  window.__scrimsPlayerChangeHandler = (event) => {
    const newPlayerId = event.detail?.userId;
    if (newPlayerId) {
      activePlayerId = newPlayerId;
      console.log('[SCRIMS] Player changed, reloading scrims and times played for player:', activePlayerId);
      loadScrimsForPlayer(activePlayerId);
      loadTimesPlayedForPlayer(activePlayerId);
      renderComparisonViews();
    }
  };

  document.addEventListener(
    'playeranalysis:player-changed',
    window.__scrimsPlayerChangeHandler
  );

  // ── FILTER CHANGE ─────────────────────────────────────
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      renderScrimRows(statusFilter.value);
    });
  }
};
