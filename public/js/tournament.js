(function () {
	const ROLE_ORDER = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
	const FILTER_ROLES = ['All', ...ROLE_ORDER];

	const state = {
		players: [],
		tournaments: [],
		filter: 'All',
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
	const modalOverlay = document.getElementById('modalOverlay');
	const closeModalBtn = document.getElementById('closeModalBtn');
	const cancelModalBtn = document.getElementById('cancelModalBtn');
	const confirmTournamentBtn = document.getElementById('confirmTournamentBtn');

	const tournamentNameInput = document.getElementById('tournamentNameInput');
	const tournamentDateInput = document.getElementById('tournamentDateInput');
	const tournamentResultSelect = document.getElementById('tournamentResultSelect');

	const team1Roster = document.getElementById('team1Roster');
	const subRoster = document.getElementById('subRoster');
	const roleFilterGroup = document.getElementById('roleFilterGroup');
	const playersGrid = document.getElementById('playersGrid');
	const tournamentList = document.getElementById('tournamentList');

	const openModal = () => {
		resetModalState();
		renderRosters();
		renderFilters();
		renderPlayers();
		modalOverlay.classList.remove('hidden');
		modalOverlay.setAttribute('aria-hidden', 'false');
	};

	const closeModal = () => {
		modalOverlay.classList.add('hidden');
		modalOverlay.setAttribute('aria-hidden', 'true');
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
			const response = await fetch('/tournament/api/create', {
				method: 'POST',
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
				alert(data.message || 'Failed to create tournament.');
				return;
			}

			closeModal();
			await loadTournaments();
		} catch (error) {
			console.error('Create tournament failed', error);
			alert('Failed to create tournament. Please try again.');
		}
	};

	const renderTournamentList = () => {
		tournamentList.innerHTML = '';

		if (!state.tournaments.length) {
			tournamentList.innerHTML = '<div class="empty-state">No tournaments yet.</div>';
			return;
		}

		state.tournaments.forEach((tournament) => {
			const card = document.createElement('article');
			card.className = 'tournament-card';

			const head = document.createElement('button');
			head.type = 'button';
			head.className = 'tournament-card-head';
			head.innerHTML = `
				<h3>${tournament.name}</h3>
				<span class="toggle-indicator">Show details</span>
			`;

			const body = document.createElement('div');
			body.className = 'tournament-card-body hidden';

			const rows = tournament.assignments
				.map(
					(item) => `
						<tr>
							<td>${item.playerName}</td>
							<td>${item.team}</td>
							<td>${item.role}</td>
						</tr>
					`
				)
				.join('');

			body.innerHTML = `
				<div class="meta-row">
					<span>Date: ${new Date(tournament.tournamentDate).toLocaleDateString()}</span>
					<span>Result: ${tournament.result}</span>
				</div>
				<table class="assignment-table">
					<thead>
						<tr>
							<th>Player</th>
							<th>Team</th>
							<th>Role</th>
						</tr>
					</thead>
					<tbody>${rows || '<tr><td colspan="3">No assignments</td></tr>'}</tbody>
				</table>
			`;

			head.addEventListener('click', () => {
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
	};

	const loadTournaments = async () => {
		const response = await fetch('/tournament/api/list');
		const data = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || 'Failed to load tournaments');
		}

		state.tournaments = data.data;
		renderTournamentList();
	};

	const init = async () => {
		createTournamentBtn.addEventListener('click', openModal);
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
			await loadPlayers();
			await loadTournaments();
		} catch (error) {
			console.error(error);
			tournamentList.innerHTML = '<div class="empty-state">Failed to load tournament data.</div>';
		}
	};

	init();
})();
