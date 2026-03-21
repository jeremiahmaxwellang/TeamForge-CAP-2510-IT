document.addEventListener('DOMContentLoaded', function() {
// NOTE: player_analysis.js no longer being called in player_analysis.html

// ===================  OVERLAY BACKEND  ============================
    const overviewButton = document.getElementById('overviewButton');
    const comparisonButton = document.getElementById('comparisonButton');
    const vodsButton = document.getElementById('vodsButton');
    const championButton = document.getElementById('championButton');
    const evaluationButton = document.getElementById('evaluationButton');
    const overlayContainer = document.getElementById('overlay-container');
    const tabButtons = [overviewButton, comparisonButton, vodsButton, championButton, evaluationButton];
    const favoriteBtn = document.getElementById('candidateFavoriteBtn');
    const favoriteMessage = document.getElementById('candidateFavoriteMessage');
    const candidateFavoriteWrap = document.querySelector('.candidate-favorite-wrap');
    let candidateControlsEnabled = false;
    let favoriteRequestInFlight = false;

    async function initializeCandidateControlsVisibility() {
        if (!candidateFavoriteWrap) return;

        try {
            const response = await fetch('/api/user/profile');
            const payload = await response.json();

            if (!response.ok) {
                candidateFavoriteWrap.style.display = 'none';
                candidateControlsEnabled = false;
                return;
            }

            const role = String(payload.role || payload.position || '').trim();
            if (role === 'Team Coach') {
                candidateFavoriteWrap.style.display = '';
                candidateControlsEnabled = true;
                await updateFavoriteButtonState();
                return;
            }

            candidateFavoriteWrap.style.display = 'none';
            candidateControlsEnabled = false;
        } catch (err) {
            console.error('[CANDIDATE FAVORITES] Failed to resolve current user role:', err);
            candidateFavoriteWrap.style.display = 'none';
            candidateControlsEnabled = false;
        }
    }

    function getSelectedPlayerMeta() {
        const selectedBtn = document.getElementById('player-dropdown-btn');
        if (!selectedBtn) return null;

        const userId = Number.parseInt(selectedBtn.getAttribute('data-player-id'), 10);
        const primaryRole = (selectedBtn.getAttribute('data-primary-role-name') || '').trim();
        const primaryRoleId = Number.parseInt(selectedBtn.getAttribute('data-primary-role-id'), 10);

        if (!Number.isInteger(userId) || !primaryRole || !Number.isInteger(primaryRoleId)) {
            return null;
        }

        return {
            userId,
            primaryRoleId,
            primaryRole,
            name: selectedBtn.textContent ? selectedBtn.textContent.trim() : `Player ${userId}`
        };
    }

    async function fetchRoleFavorites(roleId) {
        const response = await fetch(`/player_analysis/candidate-favorites/${roleId}`);
        const payload = await response.json();

        if (!response.ok) {
            throw new Error(payload.error || 'Failed to fetch candidate favorites');
        }

        return payload;
    }

    async function updateFavoriteButtonState() {
        if (!favoriteBtn || !favoriteMessage || !candidateControlsEnabled) return;

        const selected = getSelectedPlayerMeta();
        if (!selected) {
            favoriteBtn.textContent = '☆';
            favoriteBtn.setAttribute('aria-pressed', 'false');
            favoriteBtn.style.color = '#6b7280';
            favoriteBtn.style.borderColor = '#d3d6dc';
            favoriteBtn.disabled = true;
            favoriteBtn.style.opacity = '0.65';
            favoriteBtn.style.cursor = 'not-allowed';
            favoriteMessage.textContent = 'Select a player to mark as a candidate.';
            favoriteMessage.style.color = '#5f6673';
            return;
        }

        try {
            const favoritesPayload = await fetchRoleFavorites(selected.primaryRoleId);
            const roleFavorites = Array.isArray(favoritesPayload.favorites) ? favoritesPayload.favorites : [];
            const isFavorite = roleFavorites.some((entry) => Number(entry.userId) === selected.userId);
        const limitReached = roleFavorites.length >= 2;

        favoriteBtn.textContent = isFavorite ? '★' : '☆';
        favoriteBtn.setAttribute('aria-pressed', String(isFavorite));
        favoriteBtn.style.color = isFavorite ? '#f59e0b' : '#6b7280';
        favoriteBtn.style.borderColor = isFavorite ? '#f59e0b' : '#d3d6dc';
        favoriteBtn.disabled = favoriteRequestInFlight || (!isFavorite && limitReached);
        favoriteBtn.style.opacity = favoriteBtn.disabled ? '0.65' : '1';
        favoriteBtn.style.cursor = favoriteBtn.disabled ? 'not-allowed' : 'pointer';

        if (!isFavorite && limitReached) {
            favoriteMessage.textContent = `${selected.primaryRole}: 2/2 candidates selected. Remove one to add another candidate.`;
            favoriteMessage.style.color = '#b45309';
            return;
        }

        favoriteMessage.style.color = '#5f6673';
        favoriteMessage.textContent = `${selected.primaryRole}: ${roleFavorites.length}/2 candidates selected.`;
        } catch (err) {
            console.error('[CANDIDATE FAVORITES] Failed to update favorite button state:', err);
            favoriteBtn.textContent = '☆';
            favoriteBtn.setAttribute('aria-pressed', 'false');
            favoriteBtn.style.color = '#6b7280';
            favoriteBtn.style.borderColor = '#d3d6dc';
            favoriteBtn.disabled = true;
            favoriteBtn.style.opacity = '0.65';
            favoriteBtn.style.cursor = 'not-allowed';
            favoriteMessage.style.color = '#b91c1c';
            favoriteMessage.textContent = 'Unable to load candidate favorites right now.';
        }
    }

    async function toggleCandidateFavorite() {
        if (!candidateControlsEnabled) {
            return;
        }

        const selected = getSelectedPlayerMeta();
        if (!selected) {
            alert('Please select a player first.');
            return;
        }

        if (favoriteRequestInFlight) {
            return;
        }

        favoriteRequestInFlight = true;
        favoriteBtn.disabled = true;
        favoriteBtn.style.opacity = '0.65';
        favoriteBtn.style.cursor = 'not-allowed';

        try {
            const response = await fetch('/player_analysis/candidate-favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateUserId: selected.userId,
                    roleId: selected.primaryRoleId
                })
            });

            const payload = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    favoriteMessage.style.color = '#b45309';
                    favoriteMessage.textContent = `${selected.primaryRole}: 2/2 candidates selected. Remove one to add another candidate.`;
                    return;
                }
                throw new Error(payload.error || 'Failed to update candidate.');
            }
        } catch (err) {
            console.error('[CANDIDATE FAVORITES] Failed to toggle candidate favorite:', err);
            favoriteMessage.style.color = '#b91c1c';
            favoriteMessage.textContent = 'Unable to update candidate favorite right now.';
            return;
        } finally {
            favoriteRequestInFlight = false;
        }

        await updateFavoriteButtonState();
    }

    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleCandidateFavorite);
    }

    document.addEventListener('playeranalysis:player-changed', () => {
        if (!candidateControlsEnabled) return;
        updateFavoriteButtonState();
    });
    initializeCandidateControlsVisibility();

    function closeOverlay() {
        const overlay = overlayContainer.querySelector('.overlay');
        if (overlay) overlay.style.display = 'none';
    }

    function setActiveTab(activeButton) {
        // Remove active class from all tabs
        tabButtons.forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        // Add active class to the clicked tab
        activeButton.classList.add('active');
    }

    // Set up queue dropdown functionality
    function setupQueueDropdown() {
        const queueDropdownBtn = overlayContainer.querySelector('#queueDropdownBtn');
        const queueDropdownContent = overlayContainer.querySelector('#queueDropdownContent');
        const queueOptions = overlayContainer.querySelectorAll('#queueDropdownContent a');

        if (!queueDropdownBtn || !queueDropdownContent) {
            console.log('[QUEUE DROPDOWN] ✗ Queue dropdown button or content not found');
            return;
        }

        console.log('[QUEUE DROPDOWN] ✓ Queue dropdown elements found, setting up listeners');

        // Toggle dropdown visibility on button click
        queueDropdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            queueDropdownContent.style.display = 
                queueDropdownContent.style.display === 'block' ? 'none' : 'block';
            console.log('[QUEUE DROPDOWN] Toggled dropdown visibility');
        });

        // Handle queue option selection
        queueOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const queueId = this.getAttribute('data-queue');
                const queueName = this.textContent;

                console.log(`[QUEUE DROPDOWN] Selected: ${queueName} (Queue ID: ${queueId})`);

                // Update button text
                queueDropdownBtn.textContent = queueName;

                // Hide dropdown
                queueDropdownContent.style.display = 'none';

                // Update current queue ID
                currentQueueId = parseInt(queueId);

                // Refetch matches with new queue ID
                const btn = document.getElementById("player-dropdown-btn");
                const puuid = btn.getAttribute("data-puuid");
                if (puuid) {
                    console.log(`[QUEUE DROPDOWN] Refetching matches and winrate for PUUID: ${puuid} with queue: ${currentQueueId}`);
                    fetchWinrate(puuid, currentQueueId);
                    fetchRecentMatches(puuid, currentQueueId);
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                queueDropdownContent.style.display = 'none';
            }
        });
    }

    // NOTE: Tab Navigation moved to player_analysis_overview_overlay.js (Feb 21)
    // Attach click handlers to all tab buttons
    if (overlayContainer) {
        tabButtons.forEach(button => {
            if (button) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    setActiveTab(this);

                    // Map buttons to their overlay URLs
                    const urlMap = {
                        'overviewButton': '/player_analysis/overview',
                        'comparisonButton': '/player_analysis/comparison',
                        'vodsButton': '/player_analysis/vods',
                        'championButton': '/player_analysis/champion',
                        'evaluationButton': '/player_analysis/evaluation'
                    };

                    const url = urlMap[this.id];
                    if (url) {
                        fetch(url)
                            .then(response => {
                                if (!response.ok) throw new Error('Network response was not ok');
                                return response.text();
                            })
                            .then(html => {
                                overlayContainer.innerHTML = html;
                                
                                // Set up queue dropdown functionality
                                setupQueueDropdown();

                                const overlay = overlayContainer.querySelector('.overlay');
                                if (overlay) {
                                    overlay.style.display = 'block';

                                    overlay.addEventListener('click', function(event) {
                                        if (event.target === this) closeOverlay();
                                    });

                                    const closeButton = overlayContainer.querySelector('.close-button');
                                    if (closeButton) closeButton.addEventListener('click', closeOverlay);
                                    
                                    // Refetch winrate and KDA for the Overview tab after overlay is loaded
                                    if (this.id === 'overviewButton') {
                                        const btn = document.getElementById("player-dropdown-btn");
                                        const puuid = btn.getAttribute("data-puuid");
                                        if (puuid) {
                                            console.log(`[OVERVIEW TAB] Fetching winrate and KDA after overlay load with queue: ${currentQueueId}`);
                                            fetchWinrate(puuid, currentQueueId);
                                            fetchRecentMatches(puuid, currentQueueId);
                                        }
                                    }

                                    // Champion Pool
                                    if(this.id === 'championButton') {
                                        const btn = document.getElementById("player-dropdown-btn");
                                        const userId = btn.getAttribute("data-player-id");

                                        if(userId) {
                                            OverlayChampion.init(userId);
                                        }
                                    }
                                }
                            })
                            .catch(err => console.log('Error loading overlay:', err));
                    }
                });
            }
        });
    }
});