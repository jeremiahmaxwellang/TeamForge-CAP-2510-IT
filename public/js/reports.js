document.addEventListener('DOMContentLoaded', () => {
    const tournamentStartDateInput = document.getElementById('tournamentStartDate');
    const tournamentEndDateInput = document.getElementById('tournamentEndDate');
    const applyTournamentRangeBtn = document.getElementById('applyTournamentRange');
    const resetTournamentRangeBtn = document.getElementById('resetTournamentRange');
    const tournamentRangeSummary = document.getElementById('tournamentRangeSummary');
    const tournamentResultLegend = document.getElementById('tournament-result-legend');

    const tournamentResultColors = {
        Wins: '#128b0d',
        Losses: '#841a14'
    };

    let allTournamentRows = [];
    let tournamentResultChart = null;

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
            const response = await fetch('/tournament/api/list');
            const data = await response.json();

            if (!response.ok || !data.success || !Array.isArray(data.data)) {
                throw new Error(data.message || 'Failed to load tournament report');
            }

            allTournamentRows = data.data;
            applyTournamentRange();
        } catch (err) {
            console.error('Error loading tournament report:', err);
            if (tournamentRangeSummary) {
                tournamentRangeSummary.textContent = 'Failed to load tournament report data.';
            }
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



});