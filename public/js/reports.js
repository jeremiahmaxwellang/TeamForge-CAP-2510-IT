document.addEventListener('DOMContentLoaded', () => {
    const tournamentStartDateInput = document.getElementById('tournamentStartDate');
    const tournamentEndDateInput = document.getElementById('tournamentEndDate');
    const applyTournamentRangeBtn = document.getElementById('applyTournamentRange');
    const resetTournamentRangeBtn = document.getElementById('resetTournamentRange');
    const tournamentRangeSummary = document.getElementById('tournamentRangeSummary');
    const tournamentResultLegend = document.getElementById('tournament-result-legend');
    const printReportBtn = document.getElementById('printReportBtn');
    const openTermBreakdownBtn = document.getElementById('openTermBreakdownBtn');
    const termBreakdownModal = document.getElementById('termBreakdownModal');
    const closeTermBreakdownBtn = document.getElementById('closeTermBreakdownBtn');
    const saveTermReportBtn = document.getElementById('saveTermReportBtn');
    const termSelectElements = Array.from(document.querySelectorAll('.term-select'));
    const termSummaryElements = [
        document.getElementById('termSummary1'),
        document.getElementById('termSummary2'),
        document.getElementById('termSummary3')
    ];
    const termChartCanvasIds = ['termPieChart1', 'termPieChart2', 'termPieChart3'];

    const tournamentResultColors = {
        Wins: '#128b0d',
        Losses: '#841a14'
    };

    let allTournamentRows = [];
    let tournamentResultChart = null;
    const termCharts = [null, null, null];

    const termDateRanges = {
        'Term 3': { start: '2025-05-01', end: '2025-08-31' },
        'Term 1': { start: '2025-09-01', end: '2025-12-31' },
        'Term 2': { start: '2026-01-01', end: '2026-04-30' }
    };

    const formatDateLabel = (dateValue) => {
        if (!dateValue) return '';
        const parsed = new Date(`${dateValue}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) return '';
        return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const normalizeDateOnly = (dateValue) => {
        const parsed = new Date(dateValue);
        if (Number.isNaN(parsed.getTime())) return null;
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };

    const renderTournamentLegend = () => {
        if (!tournamentResultLegend) return;

        tournamentResultLegend.innerHTML = ['Wins', 'Losses'].map((label) => `
            <div class="legend-item">
                <div class="legend-dot" style="background:${tournamentResultColors[label]}"></div>${label}
            </div>
        `).join('');
    };

    const renderTournamentChart = (wins, losses) => {
        const chartEl = document.getElementById('tournamentResultChart');
        if (!chartEl) return;

        if (tournamentResultChart) {
            tournamentResultChart.destroy();
        }

        tournamentResultChart = new Chart(chartEl, {
            type: 'pie',
            data: {
                labels: ['Wins', 'Losses'],
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: [tournamentResultColors.Wins, tournamentResultColors.Losses],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`
                        }
                    }
                }
            }
        });
    };

    const getTermStats = (termName) => {
        const termRange = termDateRanges[termName];
        if (!termRange) {
            return { wins: 0, losses: 0, total: 0 };
        }

        const startDate = normalizeDateOnly(`${termRange.start}T00:00:00`);
        const endDate = normalizeDateOnly(`${termRange.end}T00:00:00`);
        if (!startDate || !endDate) {
            return { wins: 0, losses: 0, total: 0 };
        }

        const rowsInTerm = allTournamentRows.filter((row) => {
            const rowDate = normalizeDateOnly(row.tournamentDate);
            if (!rowDate) return false;
            return rowDate >= startDate && rowDate <= endDate;
        });

        let wins = 0;
        let losses = 0;

        rowsInTerm.forEach((row) => {
            const normalized = String(row.result || '').trim().toUpperCase();
            if (normalized === 'W') wins += 1;
            if (normalized === 'L') losses += 1;
        });

        return { wins, losses, total: rowsInTerm.length };
    };

    const renderTermChart = (chartIndex, termName) => {
        const canvasId = termChartCanvasIds[chartIndex];
        const canvasEl = document.getElementById(canvasId);
        const summaryEl = termSummaryElements[chartIndex];

        if (!canvasEl || !summaryEl) return;

        const { wins, losses, total } = getTermStats(termName);

        if (termCharts[chartIndex]) {
            termCharts[chartIndex].destroy();
        }

        termCharts[chartIndex] = new Chart(canvasEl, {
            type: 'pie',
            data: {
                labels: ['Wins', 'Losses'],
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: [tournamentResultColors.Wins, tournamentResultColors.Losses],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`
                        }
                    }
                }
            }
        });

        summaryEl.textContent = `${termName}: Wins ${wins}, Losses ${losses}, Tournaments ${total}.`;
    };

    const renderAllTermCharts = () => {
        termSelectElements.forEach((selectEl, idx) => {
            renderTermChart(idx, selectEl.value || 'Term 1');
        });
    };

    const openTermModal = () => {
        if (!termBreakdownModal) return;
        termBreakdownModal.classList.add('show');
        termBreakdownModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('term-modal-open');
        renderAllTermCharts();
    };

    const closeTermModal = () => {
        if (!termBreakdownModal) return;
        termBreakdownModal.classList.remove('show');
        termBreakdownModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('term-modal-open');
    };

    const updateTournamentSummary = (wins, losses, total, startDate, endDate) => {
        if (!tournamentRangeSummary) return;

        const rangeLabel = startDate && endDate
            ? `${formatDateLabel(startDate)} to ${formatDateLabel(endDate)}`
            : 'all tournaments';

        tournamentRangeSummary.textContent = `Range: ${rangeLabel}. Wins: ${wins}, Losses: ${losses}, Total tournaments: ${total}.`;
    };

    const applyTournamentRange = () => {
        const startValue = tournamentStartDateInput ? tournamentStartDateInput.value : '';
        const endValue = tournamentEndDateInput ? tournamentEndDateInput.value : '';

        if ((startValue && !endValue) || (!startValue && endValue)) {
            alert('Please select both start and end dates.');
            return;
        }

        if (startValue && endValue && startValue > endValue) {
            alert('Start date must be before or equal to end date.');
            return;
        }

        const startDate = startValue ? normalizeDateOnly(`${startValue}T00:00:00`) : null;
        const endDate = endValue ? normalizeDateOnly(`${endValue}T00:00:00`) : null;

        const filteredRows = allTournamentRows.filter((row) => {
            const rowDate = normalizeDateOnly(row.tournamentDate);
            if (!rowDate) return false;

            if (startDate && rowDate < startDate) return false;
            if (endDate && rowDate > endDate) return false;
            return true;
        });

        let wins = 0;
        let losses = 0;

        filteredRows.forEach((row) => {
            const normalized = String(row.result || '').trim().toUpperCase();
            if (normalized === 'W') wins += 1;
            if (normalized === 'L') losses += 1;
        });

        renderTournamentLegend();
        renderTournamentChart(wins, losses);
        updateTournamentSummary(wins, losses, filteredRows.length, startValue, endValue);
    };

    const loadTournamentReport = async () => {
        if (!applyTournamentRangeBtn || !resetTournamentRangeBtn) return;

        try {
            const response = await fetch('/reports/tournament_results');
            const data = await response.json();

            if (!response.ok || !data.success || !Array.isArray(data.data)) {
                throw new Error(data.message || 'Failed to load tournament report');
            }

            allTournamentRows = data.data;
            applyTournamentRange();
            renderAllTermCharts();
        } catch (err) {
            console.error('Error loading tournament report:', err);
            if (tournamentRangeSummary) {
                tournamentRangeSummary.textContent = 'Failed to load tournament report data.';
            }

            termSummaryElements.forEach((summaryEl) => {
                if (!summaryEl) return;
                summaryEl.textContent = 'Failed to load tournament report data.';
            });
        }
    };

    if (applyTournamentRangeBtn) {
        applyTournamentRangeBtn.addEventListener('click', applyTournamentRange);
    }

    if (resetTournamentRangeBtn) {
        resetTournamentRangeBtn.addEventListener('click', () => {
            if (tournamentStartDateInput) tournamentStartDateInput.value = '';
            if (tournamentEndDateInput) tournamentEndDateInput.value = '';
            applyTournamentRange();
        });
    }

    const downloadCurrentViewScreenshot = async () => {
        if (typeof html2canvas !== 'function') {
            alert('Screenshot tool is not available right now.');
            return;
        }

        if (!printReportBtn) return;

        const originalLabel = printReportBtn.textContent;
        printReportBtn.disabled = true;
        printReportBtn.textContent = 'Preparing...';

        try {
            const target = document.querySelector('.reports-shell') || document.body;
            const originalDisplay = printReportBtn.style.display;

            // Hide floating button so it does not appear in the exported report image.
            printReportBtn.style.display = 'none';

            const canvas = await html2canvas(target, {
                useCORS: true,
                backgroundColor: '#ffffff',
                width: target.scrollWidth,
                height: target.scrollHeight,
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: target.scrollWidth,
                windowHeight: target.scrollHeight,
                scale: 2
            });

            printReportBtn.style.display = originalDisplay;

            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `reports-screenshot-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to capture screenshot:', error);
            alert('Failed to capture screenshot. Please try again.');
        } finally {
            printReportBtn.style.display = '';
            printReportBtn.disabled = false;
            printReportBtn.textContent = originalLabel;
        }
    };

    if (printReportBtn) {
        printReportBtn.addEventListener('click', downloadCurrentViewScreenshot);
    }

    if (openTermBreakdownBtn) {
        openTermBreakdownBtn.addEventListener('click', openTermModal);
    }

    if (closeTermBreakdownBtn) {
        closeTermBreakdownBtn.addEventListener('click', closeTermModal);
    }

    if (termBreakdownModal) {
        termBreakdownModal.addEventListener('click', (event) => {
            if (event.target.matches('[data-close-term-modal]')) {
                closeTermModal();
            }
        });
    }

    termSelectElements.forEach((selectEl, idx) => {
        selectEl.addEventListener('change', () => {
            renderTermChart(idx, selectEl.value || 'Term 1');
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && termBreakdownModal && termBreakdownModal.classList.contains('show')) {
            closeTermModal();
        }
    });

    if (saveTermReportBtn) {
        saveTermReportBtn.addEventListener('click', async () => {
            if (typeof html2canvas !== 'function') {
                alert('Screenshot tool is not available right now.');
                return;
            }

            const target = document.querySelector('.term-modal-content');
            if (!target) return;

            const originalLabel = saveTermReportBtn.textContent;
            const originalSaveDisplay = saveTermReportBtn.style.display;
            const originalCloseDisplay = closeTermBreakdownBtn ? closeTermBreakdownBtn.style.display : '';
            saveTermReportBtn.disabled = true;
            saveTermReportBtn.textContent = 'Saving...';

            try {
                // Hide controls so they do not appear in the saved screenshot.
                saveTermReportBtn.style.display = 'none';
                if (closeTermBreakdownBtn) {
                    closeTermBreakdownBtn.style.display = 'none';
                }

                const canvas = await html2canvas(target, {
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    scale: 2
                });

                const link = document.createElement('a');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                link.download = `term-report-${timestamp}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Failed to save term report screenshot:', error);
                alert('Failed to save report. Please try again.');
            } finally {
                saveTermReportBtn.style.display = originalSaveDisplay;
                if (closeTermBreakdownBtn) {
                    closeTermBreakdownBtn.style.display = originalCloseDisplay;
                }
                saveTermReportBtn.disabled = false;
                saveTermReportBtn.textContent = originalLabel;
            }
        });
    }

    loadTournamentReport();

    fetch('/reports/best_performing_applicants')
        .then(r => r.json())
        .then(data => {
            const tbody = document.getElementById('best-performing-table-body');
            if (!tbody) return;

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align:center;">No applicant match data yet.</td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = data.map((applicant, idx) => {
                const winrate = Number.parseFloat(applicant.winrate);
                const formattedWinrate = Number.isFinite(winrate) ? `${winrate.toFixed(1)}%` : '0.0%';
                const applicantName = applicant.applicantName || 'Applicant';
                const roleApplied = applicant.roleApplied || 'N/A';

                return `
                    <tr>
                        <td class="rank-num">${idx + 1}</td>
                        <td>${applicantName}</td>
                        <td><span class="wr-badge">${formattedWinrate}</span></td>
                        <td>${roleApplied}</td>
                    </tr>
                `;
            }).join('');
        })
        .catch(err => {
            console.error('Error loading best-performing applicants:', err);
            const tbody = document.getElementById('best-performing-table-body');
            if (!tbody) return;
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">Failed to load applicant performance report.</td>
                </tr>
            `;
        });

    fetch('/reports/best_communication_applicants')
        .then(r => r.json())
        .then(data => {
            const tbody = document.getElementById('best-communication-table-body');
            if (!tbody) return;

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align:center;">No communication evaluations yet.</td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = data.map((applicant, idx) => {
                const comms = Number.parseFloat(applicant.communicationRating);
                const roundedComms = Number.isFinite(comms)
                    ? Math.max(1, Math.min(5, Math.round(comms)))
                    : 0;
                const applicantName = applicant.applicantName || 'Applicant';
                const roleApplied = applicant.roleApplied || 'N/A';

                const commsClass = roundedComms >= 1 && roundedComms <= 5
                    ? `comms-${roundedComms}`
                    : '';

                const ratingHtml = commsClass
                    ? `<span class="${commsClass}">${roundedComms}</span>`
                    : `<span>${roundedComms}</span>`;

                return `
                    <tr>
                        <td class="rank-num">${idx + 1}</td>
                        <td>${applicantName}</td>
                        <td>${ratingHtml}</td>
                        <td>${roleApplied}</td>
                    </tr>
                `;
            }).join('');
        })
        .catch(err => {
            console.error('Error loading best communication applicants:', err);
            const tbody = document.getElementById('best-communication-table-body');
            if (!tbody) return;
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">Failed to load communication report.</td>
                </tr>
            `;
        });

    fetch('/reports/applicant_roles')
        .then(r => r.json())
        .then(data => {
            const labels = data.map(p => p.displayedRole);
            const percentages = data.map(p => p.role_percentage);
            const roleColors = {
                Top: '#3b82f6',
                Mid: '#f59e0b',
                Jungle: '#9ca3af',
                "AD Carry": '#f97316',
                Support: '#128b0d'
            };

            // Role pie chart
            new Chart(document.getElementById('roleChart'), {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: percentages,
                        backgroundColor: labels.map(l => roleColors[l]),
                        borderWidth: 2, borderColor: '#fff'
                    }]
                },
                options: {
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` }
                        }
                    }
                }
            });

            // Dynamically build legend
            const legendContainer = document.querySelector('#role-legend');
            legendContainer.innerHTML = labels.map(l => `
                <div class="legend-item">
                <div class="legend-dot" style="background:${roleColors[l]}"></div>${l}
                </div>
            `).join('');

        });

    // Applicant Status pie chart
    fetch('/reports/applicant_statuses')
        .then(r => r.json())
        .then(data => {
            const labels = data.map(a => a.status);
            const percentages = data.map(a => a.status_percentage);
            const statusColors = {
                Accepted: '#128b0d',
                Pending: '#f59e0b',
                Rejected: '#841a14'
            };

            // pie chart
            new Chart(document.getElementById('acceptChart'), {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: percentages,
                        backgroundColor: labels.map(l => statusColors[l]),
                        borderWidth: 2, borderColor: '#fff'
                    }]
                },
                options: {
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` }
                        }
                    }
                }
            });

             // Dynamically build legend
            const legendContainer = document.querySelector('#status-legend');
            legendContainer.innerHTML = labels.map(l => `
                <div class="legend-item">
                <div class="legend-dot" style="background:${statusColors[l]}"></div>${l}
                </div>
            `).join('');
        });

    fetch('/reports/current_players')
        .then(r => r.json())
        .then(data => {
            const tbody = document.querySelector('.role-table tbody');

            tbody.innerHTML = data.map(p => `
        <tr>
          <td>${p.displayedRole}</td>
          <td>${p.role_count}</td>
           <td class="${p.is_leaving >= 1 ? 'players-left-zero' : ''}">${p.is_leaving}</td>
          <td class="${p.players_left <= 1 ? 'players-left-zero' : ''}">${p.players_left}</td>
        </tr>
      `).join('');

            // Build recommendation based on player count after semester losses
            const allRoles = ['Top', 'Jungle', 'Mid', 'AD Carry', 'Support'];
            const criticalRoles = [];   // 0 players left
            const lowRoles = [];        // 1 player left
            const missingRoles = [];    // role has no players at all (not in data)

            allRoles.forEach(role => {
                const entry = data.find(p => p.displayedRole === role);
                if (!entry) {
                    missingRoles.push(role);
                } else if (Number(entry.players_left) === 0) {
                    criticalRoles.push(role);
                } else if (Number(entry.players_left) === 1) {
                    lowRoles.push(role);
                }
            });

            const recEl = document.getElementById('recommended-action-text');
            if (!recEl) return;

            const urgentRoles = [...new Set([...missingRoles, ...criticalRoles])];
            const parts = [];

            if (urgentRoles.length > 0) {
                parts.push(`Urgently recruit ${urgentRoles.join(', ')} player${urgentRoles.length > 1 ? 's' : ''} — no remaining players after this semester.`);
            }
            if (lowRoles.length > 0) {
                parts.push(`Consider recruiting backup ${lowRoles.join(', ')} player${lowRoles.length > 1 ? 's' : ''} — only 1 player remaining per role.`);
            }
            if (parts.length === 0) {
                recEl.textContent = 'All roles are sufficiently staffed for next semester. No immediate recruitment needed.';
            } else {
                recEl.textContent = parts.join(' ');
            }
        })
        .catch(err => console.error('Error loading current players:', err));

    // Number of Applications
    fetch('/reports/applications_total')
        .then(r => r.json())
        .then(data => {
            const tbody = document.querySelector('#applications-table tbody');

            tbody.innerHTML = data.map(a => {
                // Convert to JS Date objects
                const startDateObj = new Date(a.startDate);
                const endDateObj = new Date(a.endDate);

                // Format to human readable
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                const readableStart = startDateObj.toLocaleDateString('en-US', options);
                const readableEnd = endDateObj.toLocaleDateString('en-US', options);

                return `
                    <tr>
                    <td>${readableStart} - ${readableEnd}</td>
                    <td>${a.registrations}</td>
                    </tr>
                `;
            }).join('');
        })
        .catch(err => console.error('Error loading applications:', err));


    const printBtn = document.getElementById('generatePdfBtn');
    
    if (printBtn) {
        printBtn.addEventListener('click', async () => {
            // Change button text while processing
            const originalText = printBtn.innerHTML;
            printBtn.innerHTML = "Generating PDF...";
            printBtn.disabled = true;

            try {
                // 1. Fetch data from our new endpoint
                const res = await fetch('/applicant_list/report_data'); // Make sure this matches your route!
                const data = await res.json();
                
                if (!data.success) throw new Error("Failed to fetch report data");

                // 2. Define the Hierarchical Priorities per Role
                const ROLE_METRICS = {
                    1: [ // Top
                        { key: 'averageTotalDamageTaken', label: 'Tanking' },
                        { key: 'averageDamageShare', label: 'Dmg Share' },
                        { key: 'averageKDA', label: 'KDA' },
                        { key: 'averageCsPerMinute', label: 'CS/Min' }
                    ],
                    2: [ // Jungle
                        { key: 'averageKillParticipation', label: 'KP' },
                        { key: 'averageVisionScorePerMinute', label: 'Vision/Min' },
                        { key: 'averageKDA', label: 'KDA' },
                        { key: 'averageDragonKills', label: 'Dragons' }
                    ],
                    3: [ // Mid
                        { key: 'averageDamageShare', label: 'Dmg Share' },
                        { key: 'averageKillParticipation', label: 'KP' },
                        { key: 'averageKDA', label: 'KDA' },
                        { key: 'averageCsPerMinute', label: 'CS/Min' }
                    ],
                    4: [ // ADC
                        { key: 'averageDamageShare', label: 'Dmg Share' },
                        { key: 'averageGoldPerMinute', label: 'Gold/Min' },
                        { key: 'averageKDA', label: 'KDA' },
                        { key: 'averageCsPerMinute', label: 'CS/Min' }
                    ],
                    5: [ // Support
                        { key: 'averageVisionScoreShare', label: 'Vision Share' },
                        { key: 'averageKillParticipation', label: 'KP' },
                        { key: 'averageAssists', label: 'Assists' },
                        { key: 'averageWardsPlaced', label: 'Wards Placed' }
                    ]
                };

                const roleNames = { 1: 'Top', 2: 'Jungle', 3: 'Mid', 4: 'ADC', 5: 'Support' };
                const byRole = { 1: [], 2: [], 3: [], 4: [], 5: [] };
                
                // Group applicants by role
                data.applicants.forEach(app => {
                    if(byRole[app.roleId]) byRole[app.roleId].push(app);
                });

                // 3. Initialize jsPDF
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Draw Header
                doc.setFontSize(22);
                doc.setTextColor(31, 119, 180); // TeamForge Blue
                doc.text("Viridis Arcus", 14, 20);
                
                doc.setFontSize(14);
                doc.setTextColor(50, 50, 50);
                doc.text("Hierarchical Applicant Evaluation Report", 14, 28);
                
                let startY = 38;

                // 4. Generate a sorted table for each role
                for (let roleId = 1; roleId <= 5; roleId++) {
                    let roleApps = byRole[roleId];
                    if (!roleApps || roleApps.length === 0) continue;

                    const metrics = ROLE_METRICS[roleId];

                    // THE HIERARCHICAL SORTING ENGINE
                    roleApps.sort((a, b) => {
                        for (let m of metrics) {
                            const valA = Number(a.stats[m.key]) || 0;
                            const valB = Number(b.stats[m.key]) || 0;
                            if (valA !== valB) return valB - valA; // Sort Descending
                        }
                        return 0;
                    });

                    // Format Table Headers
                    const head = [['Rank', 'Riot ID', ...metrics.map(m => m.label)]];
                    
                    // Format Table Rows
                    const body = roleApps.map((app, index) => {
                        return [
                            `#${index + 1}`,
                            app.riotId,
                            ...metrics.map(m => {
                                let val = Number(app.stats[m.key] || 0);
                                if (m.key.includes('Share') || m.key.includes('Participation')) return val.toFixed(1) + '%';
                                if (m.key === 'averageTotalDamageTaken') return val.toLocaleString(); // Add commas for big numbers
                                return val.toFixed(2);
                            })
                        ];
                    });

                    // Print Role Title
                    doc.setFontSize(12);
                    doc.setTextColor(0, 0, 0);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${roleNames[roleId]} Lane Candidates`, 14, startY);

                    // Draw Table
                    doc.autoTable({
                        startY: startY + 4,
                        head: head,
                        body: body,
                        theme: 'grid',
                        headStyles: { fillColor: [42, 45, 51] }, // Dark grey header to match your UI
                        margin: { left: 14, right: 14 },
                        styles: { fontSize: 10 }
                    });

                    // Push the next table down
                    startY = doc.lastAutoTable.finalY + 15;
                    
                    // Add a new page if we are running out of room
                    if (startY > 250) {
                        doc.addPage();
                        startY = 20;
                    }
                }

                // 5. Download the PDF
                doc.save("Viridis_Arcus_Applicant_Report.pdf");

            } catch (error) {
                console.error("PDF Generation Error:", error);
                alert("An error occurred while generating the report.");
            } finally {
                // Reset button
                printBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF Report';
                printBtn.disabled = false;
            }
        });
    }
});