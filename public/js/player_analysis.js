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