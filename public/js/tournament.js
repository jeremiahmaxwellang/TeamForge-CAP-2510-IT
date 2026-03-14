(function () {
	const ROLE_ORDER = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
	const FILTER_ROLES = ['All', ...ROLE_ORDER];
	const RESULT_FILTERS = ['All', 'W', 'L', 'N/A'];

	const state = {
		players: [],
		tournaments: [],
		roleById: {},
		filter: 'All',
		resultFilter: 'All',
		selectedTournamentId: null,
		editingTournamentId: null,
		team1: {
			Top: null,
			Jungle: null,
			Mid: null,
			ADC: null,
			Support: null
		},
		sub: {
			Top: null,
			Jungle: null,
			Mid: null,
			ADC: null,
			Support: null
		}
	};

	const createTournamentBtn = document.getElementById('createTournamentBtn');
	const editTournamentBtn = document.getElementById('editTournamentBtn');
	const modalOverlay = document.getElementById('modalOverlay');
	const closeModalBtn = document.getElementById('closeModalBtn');
	const cancelModalBtn = document.getElementById('cancelModalBtn');
	const confirmTournamentBtn = document.getElementById('confirmTournamentBtn');
	const modalTitle = document.getElementById('modalTitle');

	const tournamentNameInput = document.getElementById('tournamentNameInput');
	const tournamentDateInput = document.getElementById('tournamentDateInput');
	const tournamentResultSelect = document.getElementById('tournamentResultSelect');

	const team1Roster = document.getElementById('team1Roster');
	const subRoster = document.getElementById('subRoster');
	const roleFilterGroup = document.getElementById('roleFilterGroup');
	const resultFilterGroup = document.getElementById('resultFilterGroup');
	const playersGrid = document.getElementById('playersGrid');
	const tournamentList = document.getElementById('tournamentList');

	const syncSelectedTournamentUI = () => {
		document.querySelectorAll('.tournament-card').forEach((listCard) => {
			const cardTournamentId = Number.parseInt(listCard.dataset.tournamentId, 10);
			const isSelected = cardTournamentId === state.selectedTournamentId;

			listCard.classList.toggle('selected', isSelected);

			const checkbox = listCard.querySelector('.card-select-checkbox');
			if (checkbox) {
				checkbox.checked = isSelected;
			}
		});

		if (editTournamentBtn) {
			editTournamentBtn.disabled = !state.selectedTournamentId;
		}
	};

	const openCreateModal = () => {
		state.editingTournamentId = null;
		modalTitle.textContent = 'Create Tournament';
		confirmTournamentBtn.textContent = 'Confirm';
		resetModalState();
		renderRosters();
		renderFilters();
		renderPlayers();
		modalOverlay.classList.remove('hidden');
		modalOverlay.setAttribute('aria-hidden', 'false');
	};

	const getTournamentById = (tournamentId) =>
		state.tournaments.find((item) => item.tournamentId === tournamentId) || null;

	const buildEditablePlayer = (assignment) => {
		const playerId = Number.parseInt(assignment.playerId, 10);
		const roleId = Number.parseInt(assignment.roleId, 10);
		const matchingPlayer = state.players.find((player) => player.userId === playerId);

		if (matchingPlayer) {
			return matchingPlayer;
		}

		return {
			userId: playerId,
			name: assignment.playerName,
			primaryRole: assignment.role,
			secondaryRole: null,
			primaryRoleId: Number.isInteger(roleId) ? roleId : null,
			secondaryRoleId: null
		};
	};

	const resolveAssignmentRole = (assignment) => {
		if (ROLE_ORDER.includes(assignment.role)) {
			return assignment.role;
		}

		const parsedRoleId = Number.parseInt(assignment.roleId, 10);
		if (Number.isInteger(parsedRoleId) && state.roleById[parsedRoleId]) {
			return state.roleById[parsedRoleId];
		}

		return null;
	};

	const openEditModal = () => {
		if (!state.selectedTournamentId) {
			alert('Please select a tournament to edit.');
			return;
		}

		const tournament = getTournamentById(state.selectedTournamentId);
		if (!tournament) {
			alert('Selected tournament could not be found.');
			return;
		}

		state.editingTournamentId = tournament.tournamentId;
		modalTitle.textContent = 'Edit Tournament';
		confirmTournamentBtn.textContent = 'Save Changes';

		resetModalState();
		tournamentNameInput.value = tournament.name || '';

		const rawTournamentDate = String(tournament.tournamentDate || '').slice(0, 10);
		if (rawTournamentDate) {
			tournamentDateInput.value = rawTournamentDate;
		} else {
			const parsedDate = tournament.tournamentDate ? new Date(tournament.tournamentDate) : null;
			tournamentDateInput.value =
				parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString().slice(0, 10) : '';
		}

		const normalizedResult = (tournament.result || '').toUpperCase();
		tournamentResultSelect.value = RESULT_FILTERS.includes(normalizedResult) ? normalizedResult : 'N/A';

		tournament.assignments.forEach((assignment) => {
			const resolvedRole = resolveAssignmentRole(assignment);
			if (!resolvedRole) return;

			const player = buildEditablePlayer({
				...assignment,
				role: resolvedRole
			});
			if (assignment.team === 'Sub') {
				state.sub[resolvedRole] = player;
				return;
			}

			state.team1[resolvedRole] = player;
		});

		renderRosters();
		renderFilters();
		renderPlayers();
		modalOverlay.classList.remove('hidden');
		modalOverlay.setAttribute('aria-hidden', 'false');
	};

	const closeModal = () => {
		modalOverlay.classList.add('hidden');
		modalOverlay.setAttribute('aria-hidden', 'true');
		state.editingTournamentId = null;
	};

	const resetModalState = () => {
		tournamentNameInput.value = '';
		tournamentDateInput.value = '';
		tournamentResultSelect.value = 'N/A';
		state.filter = 'All';
		state.team1 = { Top: null, Jungle: null, Mid: null, ADC: null, Support: null };
		state.sub = { Top: null, Jungle: null, Mid: null, ADC: null, Support: null };
	};

	const getAssignedIds = () => {
		const team1Ids = Object.values(state.team1)
			.filter(Boolean)
			.map((player) => player.userId);
		const subIds = Object.values(state.sub)
			.filter(Boolean)
			.map((player) => player.userId);
		return new Set([...team1Ids, ...subIds]);
	};

	const createRoleSlotHTML = (team, role, player) => {
		if (!player) {
			return `
				<div class="role-label">${role}</div>
				<span class="slot-empty">Drop player here</span>
			`;
		}

		return `
			<div class="role-label">${role}</div>
			<div class="slot-player">
				<span>${player.name}</span>
				<button type="button" class="remove-assignment" data-team="${team}" data-role="${role}" aria-label="Remove">x</button>
			</div>
		`;
	};

	const renderRosters = () => {
		team1Roster.innerHTML = '';
		subRoster.innerHTML = '';

		ROLE_ORDER.forEach((role) => {
			const teamSlot = document.createElement('div');
			teamSlot.className = 'role-slot';
			teamSlot.dataset.team = 'Team 1';
			teamSlot.dataset.role = role;
			teamSlot.innerHTML = createRoleSlotHTML('Team 1', role, state.team1[role]);
			team1Roster.appendChild(teamSlot);

			const subSlot = document.createElement('div');
			subSlot.className = 'role-slot';
			subSlot.dataset.team = 'Sub';
			subSlot.dataset.role = role;
			subSlot.innerHTML = createRoleSlotHTML('Sub', role, state.sub[role]);
			subRoster.appendChild(subSlot);
		});

		attachRemoveHandlers();
		attachDropHandlers();
	};

	const renderFilters = () => {
		roleFilterGroup.innerHTML = '';

		FILTER_ROLES.forEach((filterValue) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = `filter-btn ${state.filter === filterValue ? 'active' : ''}`;
			button.textContent = filterValue;
			button.addEventListener('click', () => {
				state.filter = filterValue;
				renderFilters();
				renderPlayers();
			});
			roleFilterGroup.appendChild(button);
		});
	};

	const renderPlayers = () => {
		const assignedIds = getAssignedIds();
		playersGrid.innerHTML = '';

		const filtered = state.players.filter((player) => {
			if (state.filter === 'All') return true;
			return player.primaryRole === state.filter || player.secondaryRole === state.filter;
		});

		filtered.forEach((player) => {
			const isAssigned = assignedIds.has(player.userId);

			const card = document.createElement('div');
			card.className = `player-card ${isAssigned ? 'assigned' : ''}`;
			card.draggable = !isAssigned;
			card.dataset.userId = String(player.userId);
			card.dataset.name = player.name;
			card.dataset.primaryRole = player.primaryRole || '';
			card.dataset.secondaryRole = player.secondaryRole || '';

			const secondaryLabel = player.secondaryRole ? ` / ${player.secondaryRole}` : '';
			card.innerHTML = `
				<span>${player.name}</span>
				<span class="player-role-badge">${player.primaryRole || 'N/A'}${secondaryLabel}</span>
			`;

			if (!isAssigned) {
				card.addEventListener('dragstart', (event) => {
					event.dataTransfer.setData('application/json', JSON.stringify(player));
					event.dataTransfer.effectAllowed = 'move';
				});
			}

			playersGrid.appendChild(card);
		});
	};

	const renderResultFilters = () => {
		if (!resultFilterGroup) return;

		resultFilterGroup.innerHTML = '';

		RESULT_FILTERS.forEach((filterValue) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = `filter-btn ${state.resultFilter === filterValue ? 'active' : ''}`;
			button.textContent = filterValue;
			button.addEventListener('click', () => {
				state.resultFilter = filterValue;
				renderResultFilters();
				renderTournamentList();
			});
			resultFilterGroup.appendChild(button);
		});
	};

	const attachRemoveHandlers = () => {
		document.querySelectorAll('.remove-assignment').forEach((button) => {
			button.addEventListener('click', () => {
				const team = button.dataset.team;
				const role = button.dataset.role;

				if (team === 'Team 1') {
					state.team1[role] = null;
				} else {
					state.sub[role] = null;
				}

				renderRosters();
				renderPlayers();
			});
		});
	};

	const attachDropHandlers = () => {
		document.querySelectorAll('.role-slot').forEach((slot) => {
			slot.addEventListener('dragover', (event) => {
				event.preventDefault();
				slot.classList.add('over');
			});

			slot.addEventListener('dragleave', () => {
				slot.classList.remove('over');
			});

			slot.addEventListener('drop', (event) => {
				event.preventDefault();
				slot.classList.remove('over');

				const data = event.dataTransfer.getData('application/json');
				if (!data) return;

				const droppedPlayer = JSON.parse(data);
				const targetRole = slot.dataset.role;
				const targetTeam = slot.dataset.team;

				const roleMatches = droppedPlayer.primaryRole === targetRole || droppedPlayer.secondaryRole === targetRole;

				if (!roleMatches) {
					alert(`${droppedPlayer.name} cannot be assigned to ${targetRole}`);
					return;
				}

				const assignedIds = getAssignedIds();
				if (assignedIds.has(droppedPlayer.userId)) {
					alert('Player is already assigned to another role or team.');
					return;
				}

				if (targetTeam === 'Team 1') {
					state.team1[targetRole] = droppedPlayer;
				} else {
					state.sub[targetRole] = droppedPlayer;
				}

				renderRosters();
				renderPlayers();
			});
		});
	};

	const toAssignments = () => {
		const assignments = [];

		ROLE_ORDER.forEach((role) => {
			const teamPlayer = state.team1[role];
			if (teamPlayer) {
				assignments.push({
					playerId: teamPlayer.userId,
					role,
					roleId: teamPlayer.primaryRole === role ? teamPlayer.primaryRoleId : teamPlayer.secondaryRoleId,
					team: 'Team 1'
				});
			}

			const subPlayer = state.sub[role];
			if (subPlayer) {
				assignments.push({
					playerId: subPlayer.userId,
					role,
					roleId: subPlayer.primaryRole === role ? subPlayer.primaryRoleId : subPlayer.secondaryRoleId,
					team: 'Sub'
				});
			}
		});

		return assignments;
	};

	const confirmTournament = async () => {
		const name = tournamentNameInput.value.trim();
		const tournamentDate = tournamentDateInput.value;
		const result = tournamentResultSelect.value;
		const isEditMode = Number.isInteger(state.editingTournamentId) && state.editingTournamentId > 0;

		if (!name) {
			alert('Please enter a tournament name.');
			return;
		}

		if (!tournamentDate) {
			alert('Please select a tournament date.');
			return;
		}

		const teamOneFilled = ROLE_ORDER.every((role) => state.team1[role]);
		if (!teamOneFilled) {
			alert('Team 1 requires Top, Jungle, Mid, ADC, and Support.');
			return;
		}

		const assignments = toAssignments();

		try {
			const endpoint = isEditMode
				? `/tournament/api/${state.editingTournamentId}`
				: '/tournament/api/create';
			const method = isEditMode ? 'PUT' : 'POST';

			const response = await fetch(endpoint, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					tournamentDate,
					result,
					assignments
				})
			});

			const data = await response.json();
			if (!response.ok || !data.success) {
				alert(data.message || 'Failed to save tournament.');
				return;
			}

			if (data.tournamentId) {
				state.selectedTournamentId = Number.parseInt(data.tournamentId, 10);
			}

			closeModal();
			await loadTournaments();
		} catch (error) {
			console.error('Save tournament failed', error);
			alert('Failed to save tournament. Please try again.');
		}
	};

	const renderTournamentList = () => {
		tournamentList.innerHTML = '';

		if (
			state.selectedTournamentId &&
			!state.tournaments.some((tournament) => tournament.tournamentId === state.selectedTournamentId)
		) {
			state.selectedTournamentId = null;
		}

		if (editTournamentBtn) {
			editTournamentBtn.disabled = !state.selectedTournamentId;
		}

		const filteredTournaments = state.tournaments.filter((tournament) => {
			if (state.resultFilter === 'All') return true;
			return (tournament.result || '').toUpperCase() === state.resultFilter;
		});

		if (!filteredTournaments.length) {
			tournamentList.innerHTML = '<div class="empty-state">No tournaments yet.</div>';
			return;
		}

		filteredTournaments.forEach((tournament) => {
			const card = document.createElement('article');
			card.dataset.tournamentId = String(tournament.tournamentId);
			card.className = `tournament-card ${
				state.selectedTournamentId === tournament.tournamentId ? 'selected' : ''
			}`;

			const head = document.createElement('div');
			head.className = 'tournament-card-head';

			const isSelectedTournament = state.selectedTournamentId === tournament.tournamentId;
			head.innerHTML = `
				<div class="card-head-left">
					<input
						type="checkbox"
						class="card-select-checkbox"
						aria-label="Select ${tournament.name} for editing"
						${isSelectedTournament ? 'checked' : ''}
					/>
					<h3>${tournament.name}</h3>
				</div>
				<button type="button" class="details-toggle-btn">
					<span class="toggle-indicator">Show details</span>
				</button>
			`;

			const body = document.createElement('div');
			body.className = 'tournament-card-body hidden';

			const buildTeamRows = (teamName) => {
				const roleMap = new Map();
				tournament.assignments
					.filter((item) => item.team === teamName)
					.forEach((item) => {
						roleMap.set(item.role, item.playerName);
					});

				return ROLE_ORDER.map((role) => {
					const playerName = roleMap.get(role);
					return `
						<div class="detail-role-row">
							<span class="detail-role-name">${role}</span>
							${
								playerName
									? `<span class="detail-player-chip">${playerName}</span>`
									: '<span class="detail-empty">No player</span>'
							}
						</div>
					`;
				}).join('');
			};

			body.innerHTML = `
				<div class="meta-row">
					<span>Date: ${new Date(tournament.tournamentDate).toLocaleDateString()}</span>
					<span>Result: ${tournament.result}</span>
				</div>
				<div class="details-teams-layout">
					<section class="detail-team-column">
						<h4>Team 1</h4>
						${buildTeamRows('Team 1')}
					</section>
					<section class="detail-team-column">
						<h4>Sub</h4>
						${buildTeamRows('Sub')}
					</section>
				</div>
			`;

			const selectionCheckbox = head.querySelector('.card-select-checkbox');
			selectionCheckbox.addEventListener('change', () => {
				if (selectionCheckbox.checked) {
					state.selectedTournamentId = tournament.tournamentId;
				} else if (state.selectedTournamentId === tournament.tournamentId) {
					state.selectedTournamentId = null;
				}

				syncSelectedTournamentUI();
			});

			const detailsToggleBtn = head.querySelector('.details-toggle-btn');
			detailsToggleBtn.addEventListener('click', () => {

				const isHidden = body.classList.contains('hidden');
				body.classList.toggle('hidden');
				head.querySelector('.toggle-indicator').textContent = isHidden ? 'Hide details' : 'Show details';
			});

			card.appendChild(head);
			card.appendChild(body);
			tournamentList.appendChild(card);
		});
	};

	const loadPlayers = async () => {
		const response = await fetch('/tournament/api/players');
		const data = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || 'Failed to load players');
		}

		state.players = data.data.map((player) => ({
			...player,
			primaryRoleId: Number.parseInt(player.primaryRoleId, 10),
			secondaryRoleId: Number.parseInt(player.secondaryRoleId, 10)
		}));

		state.roleById = {};
		state.players.forEach((player) => {
			if (Number.isInteger(player.primaryRoleId) && player.primaryRole) {
				state.roleById[player.primaryRoleId] = player.primaryRole;
			}

			if (Number.isInteger(player.secondaryRoleId) && player.secondaryRole) {
				state.roleById[player.secondaryRoleId] = player.secondaryRole;
			}
		});
	};

	const loadTournaments = async () => {
		const response = await fetch('/tournament/api/list');
		const data = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || 'Failed to load tournaments');
		}

		state.tournaments = data.data.map((tournament) => ({
			...tournament,
			tournamentId: Number.parseInt(tournament.tournamentId, 10),
			assignments: (tournament.assignments || []).map((assignment) => ({
				...assignment,
				playerId: Number.parseInt(assignment.playerId, 10),
				roleId: Number.parseInt(assignment.roleId, 10)
			}))
		}));
		renderTournamentList();
	};

	const init = async () => {
		createTournamentBtn.addEventListener('click', openCreateModal);
		if (editTournamentBtn) {
			editTournamentBtn.addEventListener('click', openEditModal);
			editTournamentBtn.disabled = true;
		}
		closeModalBtn.addEventListener('click', closeModal);
		cancelModalBtn.addEventListener('click', closeModal);
		confirmTournamentBtn.addEventListener('click', confirmTournament);

		modalOverlay.addEventListener('click', (event) => {
			if (event.target === modalOverlay) {
				closeModal();
			}
		});

		document.body.addEventListener('dragover', (event) => event.preventDefault());

		try {
			renderResultFilters();
			await loadPlayers();
			await loadTournaments();
		} catch (error) {
			console.error(error);
			tournamentList.innerHTML = '<div class="empty-state">Failed to load tournament data.</div>';
		}
	};

	init();
})();
