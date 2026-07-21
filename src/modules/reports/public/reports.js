document.addEventListener('DOMContentLoaded', async () => {

    /* ============================================================
        TEAM BRANDING
       ============================================================ */
    let teamName = 'My Team';
    let teamLogoUrl = '/uploads/team-logos/Team_Logo.png';
    let schoolName = 'My University';
    let schoolLogoUrl = '/uploads/school-logos/school_logo.png'; // fallback if DB has no schoolIcon set

    const loadTeamDetails = async () => {
        try {
            const res = await fetch('settings/api/all-team-details');
            const data = await res.json();
            if (data.success) {
                teamName = data.teamName || teamName;
                teamLogoUrl = data.teamLogoUrl || teamLogoUrl;
                schoolName = data.schoolName || schoolName;
                schoolLogoUrl = data.schoolIconUrl || schoolLogoUrl;
            }
        } catch (err) {
            console.warn('[Team Branding] Could not load team details:', err);
        }
    };

    await loadTeamDetails();


    /* ============================================================
        DOM REFS
       ============================================================ */
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
    const termSummaryElements = Array.from(document.querySelectorAll('.term-report-card [id^="termSummary"]'));
    const termResultDetailElements = Array.from(document.querySelectorAll('.term-report-card [id^="termResultDetails"]'));
    const termChartCanvasIds = Array.from(document.querySelectorAll('.term-chart-wrap canvas')).map((canvas) => canvas.id);
    const termSelectElements = Array.from(document.querySelectorAll('.term-select'));


    /* ============================================================
        CONSTANTS & TERM DATES
       ============================================================ */
    const tournamentResultColors = {
        Wins: '#128b0d',
        Losses: '#841a14'
    };

    // Default values until the database loads
    let termDateRanges = {
        'Term 1': { start: '2025-05-01', end: '2025-08-31' },
        'Term 2': { start: '2025-09-01', end: '2025-12-31' },
        'Term 3': { start: '2026-01-01', end: '2026-04-30' }
    };

    const getSelectedTournamentRange = () => {
        const startValue = tournamentStartDateInput ? tournamentStartDateInput.value : '';
        const endValue = tournamentEndDateInput ? tournamentEndDateInput.value : '';

        if (!startValue && !endValue) {
            return null;
        }

        const startDate = startValue ? normalizeDateOnly(`${startValue}T00:00:00`) : null;
        const endDate = endValue ? normalizeDateOnly(`${endValue}T00:00:00`) : null;

        if (startDate && endDate && startDate > endDate) {
            return null;
        }

        return { startDate, endDate };
    };

    const getVisibleTermNames = () => {
        const selectedRange = getSelectedTournamentRange();
        const terms = Object.keys(termDateRanges || {});

        if (!selectedRange) {
            return terms;
        }

        const { startDate, endDate } = selectedRange;

        return terms.filter((termName) => {
            const termRange = termDateRanges[termName];
            if (!termRange) return false;

            const termStart = normalizeDateOnly(`${termRange.start}T00:00:00`);
            const termEnd = normalizeDateOnly(`${termRange.end}T00:00:00`);
            if (!termStart || !termEnd) return false;

            if (startDate && termEnd < startDate) return false;
            if (endDate && termStart > endDate) return false;
            return true;
        });
    };

    const syncTermReportCards = () => {
        const visibleTerms = getVisibleTermNames();
        const cards = Array.from(document.querySelectorAll('.term-report-card'));

        cards.forEach((card, index) => {
            card.style.display = index < visibleTerms.length ? '' : 'none';
        });
    };

    // Dynamically fetch term dates from the database
    const loadTermDates = async () => {
        try {
            const res = await fetch('/reports/term_dates');
            const data = await res.json();
            if (data.success && data.termDateRanges) {
                termDateRanges = data.termDateRanges;
            }
        } catch (err) {
            console.warn('[Reports] Could not load term dates from database:', err);
        } finally {
            syncTermReportCards();
        }
    };

    await loadTermDates();

    /* ============================================================
        STATE VARIABLES 
       ============================================================ */
    let allTournamentRows = [];
    let tournamentResultChart = null;
    let termCharts = new Array(termChartCanvasIds.length).fill(null);


    /* ============================================================
        UTILITY HELPERS
       ============================================================ */
    const parseDateValue = (dateValue) => {
        if (!dateValue) return null;
        if (dateValue instanceof Date) {
            return Number.isNaN(dateValue.getTime()) ? null : dateValue;
        }

        const rawValue = String(dateValue).trim();
        if (!rawValue) return null;

        const normalized = rawValue.includes('T')
            ? rawValue
            : `${rawValue.slice(0, 10)}T00:00:00`;

        const parsed = new Date(normalized);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const formatDateLabel = (dateValue) => {
        const parsed = parseDateValue(dateValue);
        if (!parsed) return '';
        return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const normalizeDateOnly = (dateValue) => {
        const parsed = new Date(dateValue);
        if (Number.isNaN(parsed.getTime())) return null;
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const normalizeResultLabel = (resultValue) => {
        const normalized = String(resultValue || '').trim().toUpperCase();
        if (normalized === 'W') return 'Win';
        if (normalized === 'L') return 'Loss';
        return normalized || 'N/A';
    };

    const countWinLoss = (rows) => {
        let wins = 0;
        let losses = 0;
        rows.forEach((row) => {
            const v = String(row.result || '').trim().toUpperCase();
            if (v === 'W') wins += 1;
            if (v === 'L') losses += 1;
        });
        return { wins, losses };
    };

    const waitForNextPaint = () => new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

    const waitForImageLoad = (imgEl) => new Promise((resolve) => {
        if (!imgEl) { resolve(); return; }
        if (imgEl.complete && imgEl.naturalWidth > 0) { resolve(); return; }
        imgEl.addEventListener('load', resolve, { once: true });
        imgEl.addEventListener('error', resolve, { once: true });
    });

    /**
     * Converts an image URL to a base64 data URL via a canvas.
     * Resolves with null if the image fails to load.
     */
    const loadImageAsBase64 = (imageUrl) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            console.warn('[PDF] Image failed to load:', imageUrl);
            resolve(null);
        };
        img.src = imageUrl;
    });

    /**
 * Builds and returns a DOM header element for html2canvas-based PDF exports.
 * Mirrors the layout of drawPdfHeader for visual consistency.
 *
 * @param {string} subtitle - Report title shown below the team name
 * @returns {{ header: HTMLElement, footer: HTMLElement, imageEls: HTMLImageElement[] }}
 */
    const buildDomExportHeader = (subtitle) => {
        const header = document.createElement('div');
        header.className = 'report-export-header';
        Object.assign(header.style, {
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            gap: '12px', padding: '4px 0 16px'
        });

        const logoImg = document.createElement('img');
        logoImg.src = teamLogoUrl;
        logoImg.alt = 'Team Logo';
        Object.assign(logoImg.style, { width: '72px', height: '72px', objectFit: 'contain' });

        const textWrapper = document.createElement('div');
        Object.assign(textWrapper.style, { display: 'flex', flexDirection: 'column', justifyContent: 'center' });

        const teamHeading = document.createElement('h1');
        teamHeading.textContent = teamName;
        Object.assign(teamHeading.style, { margin: '0', fontSize: '20px', color: '#1f77b4' });

        const subtitleEl = document.createElement('p');
        subtitleEl.textContent = subtitle;
        Object.assign(subtitleEl.style, { margin: '4px 0 0', fontSize: '14px', color: '#323232' });

        textWrapper.append(teamHeading, subtitleEl);

        const rightLogos = document.createElement('div');
        Object.assign(rightLogos.style, { display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' });

        const makeLogo = (src, alt) => {
            const img = document.createElement('img');
            img.src = src; img.alt = alt;
            Object.assign(img.style, { width: '60px', height: '60px', objectFit: 'contain' });
            return img;
        };

        const dlsuImg = makeLogo(schoolLogoUrl, `${schoolName} Logo`);
        const teamforgeImg = makeLogo('/images/teamforge_logo_white.png', 'TeamForge Logo');
        rightLogos.append(dlsuImg, teamforgeImg);

        header.append(logoImg, textWrapper, rightLogos);

        const footer = document.createElement('p');
        footer.className = 'report-export-footer';
        footer.textContent = 'powered by TeamForge';
        Object.assign(footer.style, {
            margin: '18px 0 0', textAlign: 'center',
            fontSize: '14px', fontWeight: '600', color: '#1f2937'
        });

        return { header, footer, imageEls: [logoImg, dlsuImg, teamforgeImg] };
    };

    /* ============================================================
        OLD PDF HEADER BUILDER  (shared by both PDF generators)

        Draws the standard report header onto a jsPDF document:
          [team logo]  Team Name          [DLSU logo] [TeamForge logo]
                       Report Subtitle
          ─────────────────────────────────────────────────────────

        @param {jsPDF}  doc        - active jsPDF instance
        @param {object} logos      - { team, dlsu, teamforge } base64 strings (null = skip)
        @param {string} subtitle   - second line under the team name
        @returns {number}          - Y coordinate to start body content after the divider
       ============================================================ */
    const drawPdfHeader = (doc, { team, dlsu, teamforge }, subtitle) => {
        const LOGO_X = 14;
        const LOGO_Y = 10;
        const LOGO_SIZE = 18;
        const TEXT_INDENT = team ? LOGO_X + LOGO_SIZE + 4 : LOGO_X;
        const RIGHT_X = 160;
        const RIGHT_SIZE = 12;
        const DIVIDER_Y = 32;

        if (team) {
            try { doc.addImage(team, 'PNG', LOGO_X, LOGO_Y, LOGO_SIZE, LOGO_SIZE); }
            catch (e) { console.warn('[PDF] Could not add team logo:', e); }
        }

        doc.setFontSize(22);
        doc.setTextColor(31, 119, 180);
        doc.text(teamName, TEXT_INDENT, 20);

        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text(subtitle, TEXT_INDENT, 28);

        if (dlsu) {
            try { doc.addImage(dlsu, 'PNG', RIGHT_X, LOGO_Y, RIGHT_SIZE, RIGHT_SIZE); }
            catch (e) { console.warn('[PDF] Could not add DLSU logo:', e); }
        }

        if (teamforge) {
            try { doc.addImage(teamforge, 'PNG', RIGHT_X + RIGHT_SIZE + 3, LOGO_Y, RIGHT_SIZE, RIGHT_SIZE); }
            catch (e) { console.warn('[PDF] Could not add TeamForge logo:', e); }
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(14, DIVIDER_Y, 196, DIVIDER_Y);

        return DIVIDER_Y + 8; // caller starts body content here
    };

    /**
     * Loads all three standard logos in parallel and returns them as base64.
     * @returns {{ team: string|null, dlsu: string|null, teamforge: string|null }}
     */
    const loadStandardLogos = async () => {
        const [team, dlsu, teamforge] = await Promise.all([
            loadImageAsBase64(teamLogoUrl),
            loadImageAsBase64(schoolLogoUrl),
            loadImageAsBase64('/images/teamforge_logo_white.png')
        ]);
        return { team, dlsu, teamforge };
    };


    /* ============================================================
        TOURNAMENT — DATA HELPERS
       ============================================================ */
    const getRowsInDateRange = (startDate, endDate) => allTournamentRows.filter((row) => {
        const rowDate = normalizeDateOnly(row.tournamentDate);
        if (!rowDate) return false;
        if (startDate && rowDate < startDate) return false;
        if (endDate && rowDate > endDate) return false;
        return true;
    });

    const getRowsInTerm = (termName) => {
        const termRange = termDateRanges[termName];
        if (!termRange) return [];

        const startDate = normalizeDateOnly(`${termRange.start}T00:00:00`);
        const endDate = normalizeDateOnly(`${termRange.end}T00:00:00`);
        if (!startDate || !endDate) return [];

        const selectedRange = getSelectedTournamentRange();
        const effectiveStart = selectedRange?.startDate || startDate;
        const effectiveEnd = selectedRange?.endDate || endDate;

        const overlapStart = startDate > effectiveStart ? startDate : effectiveStart;
        const overlapEnd = endDate < effectiveEnd ? endDate : effectiveEnd;

        if (overlapStart && overlapEnd && overlapStart > overlapEnd) {
            return [];
        }

        return getRowsInDateRange(overlapStart, overlapEnd);
    };


    /* ============================================================
        TOURNAMENT — RENDER HELPERS
       ============================================================ */
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

        if (tournamentResultChart) tournamentResultChart.destroy();

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
                        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` }
                    }
                }
            }
        });
    };

    const renderTournamentDetailsList = (targetEl, rows, emptyMessage) => {
        if (!targetEl) return;

        if (!Array.isArray(rows) || rows.length === 0) {
            targetEl.innerHTML = `<p class="tournament-empty-msg">${escapeHtml(emptyMessage)}</p>`;
            return;
        }

        const sortedRows = [...rows].sort((a, b) => {
            const dateA = parseDateValue(a.tournamentDate);
            const dateB = parseDateValue(b.tournamentDate);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
        });

        targetEl.innerHTML = `
            <ul class="tournament-detail-list">
                ${sortedRows.map((row) => {
            const title = String(row.name || row.tournamentName || row.title || 'Untitled Tournament').trim() || 'Untitled Tournament';
            const dateLabel = formatDateLabel(row.tournamentDate) || 'Unknown date';
            const resultLabel = normalizeResultLabel(row.result);
            return `
                        <li class="tournament-detail-item">
                            <div class="tournament-detail-title">${escapeHtml(title)}</div>
                            <p class="tournament-detail-meta">Date: ${escapeHtml(dateLabel)}</p>
                            <p class="tournament-detail-meta">Result: ${escapeHtml(resultLabel)}</p>
                        </li>
                    `;
        }).join('')}
            </ul>
        `;
    };

    const updateTournamentSummary = (wins, losses, total, startDate, endDate) => {
        if (!tournamentRangeSummary) return;
        const rangeLabel = startDate && endDate
            ? `${formatDateLabel(startDate)} to ${formatDateLabel(endDate)}`
            : 'all tournaments';
        tournamentRangeSummary.textContent =
            `Range: ${rangeLabel}. Wins: ${wins}, Losses: ${losses}, Total tournaments: ${total}.`;
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
        const filteredRows = getRowsInDateRange(startDate, endDate);
        const { wins, losses } = countWinLoss(filteredRows);

        renderTournamentLegend();
        renderTournamentChart(wins, losses);
        updateTournamentSummary(wins, losses, filteredRows.length, startValue, endValue);
        renderAllTermCharts();
    };


    /* ============================================================
        TOURNAMENT — TERM CHARTS
       ============================================================ */
    const renderTermChart = (chartIndex, termName) => {
        const canvasEl = document.getElementById(termChartCanvasIds[chartIndex]);
        const summaryEl = termSummaryElements[chartIndex];
        if (!canvasEl || !summaryEl) return;

        const rowsInTerm = getRowsInTerm(termName);
        const { wins, losses } = countWinLoss(rowsInTerm);

        if (termCharts[chartIndex]) termCharts[chartIndex].destroy();

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
                    legend: { display: true, position: 'bottom' },
                    tooltip: {
                        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` }
                    }
                }
            }
        });

        summaryEl.textContent = `${termName}: Wins ${wins}, Losses ${losses}, Tournaments ${rowsInTerm.length}.`;
        renderTournamentDetailsList(
            termResultDetailElements[chartIndex],
            rowsInTerm,
            `No tournaments recorded for ${termName}.`
        );
    };

    const renderAllTermCharts = () => {
        syncTermReportCards();
        const visibleTerms = getVisibleTermNames();

        visibleTerms.forEach((termName, idx) => {
            renderTermChart(idx, termName);
        });

        const cards = Array.from(document.querySelectorAll('.term-report-card'));
        cards.forEach((card, idx) => {
            if (idx >= visibleTerms.length) {
                const summaryEl = termSummaryElements[idx];
                const detailEl = termResultDetailElements[idx];
                if (summaryEl) summaryEl.textContent = 'No matching tournament range.';
                if (detailEl) detailEl.innerHTML = '<p class="tournament-empty-msg">No matching tournament range.</p>';
            }
        });
    };


    /* ============================================================
        TOURNAMENT — FETCH
       ============================================================ */
    const loadTournamentReport = async () => {
        if (!applyTournamentRangeBtn || !resetTournamentRangeBtn) return;

        try {
            const response = await fetch('/reports/tournament_results');
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load tournament report');
            }

            allTournamentRows = Array.isArray(data.data) ? data.data : [];
            applyTournamentRange();
            renderAllTermCharts();
        } catch (err) {
            console.error('Error loading tournament report:', err);

            if (tournamentRangeSummary) {
                tournamentRangeSummary.textContent = 'Failed to load tournament report data.';
            }
            termSummaryElements.forEach((el) => {
                if (el) el.textContent = 'Failed to load tournament report data.';
            });
            termResultDetailElements.forEach((el) => {
                if (el) el.innerHTML = '<p class="tournament-empty-msg">Failed to load tournament report data.</p>';
            });
        }
    };


    /* ============================================================
        TERM MODAL
       ============================================================ */
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


    /* ============================================================
        SCREENSHOT — DASHBOARD
       ============================================================ */
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


    /* ============================================================
        PDF EXPORT — TERM TOURNAMENT REPORT
       ============================================================ */
    const saveTermReport = async () => {
        if (typeof html2canvas !== 'function') {
            alert('Screenshot tool is not available right now.');
            return;
        }
        if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
            alert('PDF export tool is not available right now.');
            return;
        }

        const target = document.querySelector('.term-modal-content');
        if (!target) return;

        const originalLabel = saveTermReportBtn.textContent;
        const originalSaveDisplay = saveTermReportBtn.style.display;
        const originalCloseDisplay = closeTermBreakdownBtn ? closeTermBreakdownBtn.style.display : '';
        const originalMaxHeight = target.style.maxHeight;
        const originalOverflow = target.style.overflow;
        const originalScrollTop = target.scrollTop;
        const termSelectDisplays = Array.isArray(termSelectElements)
            ? termSelectElements.map((el) => ({ element: el, display: el.style.display }))
            : [];

        let exportHeader = null;
        let exportFooter = null;

        const cleanupExportArtifacts = () => {
            if (!target) return;
            target.querySelectorAll('.report-export-header, .report-export-footer').forEach((el) => el.remove());
        };

        saveTermReportBtn.disabled = true;
        saveTermReportBtn.textContent = 'Saving...';

        try {
            // Hide UI controls from the capture
            saveTermReportBtn.style.display = 'none';
            if (closeTermBreakdownBtn) closeTermBreakdownBtn.style.display = 'none';
            termSelectDisplays.forEach(({ element }) => { element.style.display = 'none'; });

            cleanupExportArtifacts();

            const { header: exportHeader, footer: exportFooter, imageEls } = buildDomExportHeader('Team Tournament Breakdown Report');

            target.insertBefore(exportHeader, target.firstChild);
            target.appendChild(exportFooter);

            // Expand modal so html2canvas captures the full content
            target.style.maxHeight = 'none';
            target.style.overflow = 'visible';
            target.scrollTop = 0;

            // await Promise.all([
            //     waitForImageLoad(exportLogo),
            //     waitForImageLoad(dlsuLogoImg),
            //     waitForImageLoad(teamforgeLogoImg)
            // ]);
            await waitForNextPaint();

            const canvas = await html2canvas(target, {
                useCORS: true,
                backgroundColor: '#ffffff',
                width: target.scrollWidth,
                height: target.scrollHeight,
                windowWidth: target.scrollWidth,
                windowHeight: target.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                scale: 2,
                ignoreElements: (el) => {
                    if (!el) return false;
                    if (el.id === 'saveTermReportBtn') return true;
                    if (el.id === 'closeTermBreakdownBtn') return true;
                    if (el.classList && el.classList.contains('term-select')) return true;
                    return false;
                }
            });

            const imageData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidthMm = canvas.width * 0.264583;
            const imgHeightMm = canvas.height * 0.264583;
            const ratio = Math.min(pageWidth / imgWidthMm, pageHeight / imgHeightMm);

            pdf.addImage(
                imageData, 'PNG',
                (pageWidth - imgWidthMm * ratio) / 2,
                (pageHeight - imgHeightMm * ratio) / 2,
                imgWidthMm * ratio,
                imgHeightMm * ratio,
                undefined, 'FAST'
            );

            const safeTeamName = teamName.replace(/\s+/g, '_');
            pdf.save(`${safeTeamName}_Tournament_Results_Report.pdf`);

        } catch (error) {
            console.error('Failed to save term report screenshot:', error);
            alert('Failed to save report. Please try again.');
        } finally {
            cleanupExportArtifacts();

            saveTermReportBtn.style.display = originalSaveDisplay;
            if (closeTermBreakdownBtn) closeTermBreakdownBtn.style.display = originalCloseDisplay;

            target.style.maxHeight = originalMaxHeight;
            target.style.overflow = originalOverflow;
            target.scrollTop = originalScrollTop;

            termSelectDisplays.forEach(({ element, display }) => { element.style.display = display; });

            saveTermReportBtn.disabled = false;
            saveTermReportBtn.textContent = originalLabel;
        }
    };


    /* ============================================================
        PDF EXPORT — APPLICANT PERFORMANCE REPORT
       ============================================================ */
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

    const ROLE_NAMES = { 1: 'Top', 2: 'Jungle', 3: 'Mid', 4: 'ADC', 5: 'Support' };

    const generateApplicantPdf = async (printBtn) => {
        const originalText = printBtn.innerHTML;
        printBtn.innerHTML = 'Generating PDF...';
        printBtn.disabled = true;

        try {
            const res = await fetch('/applicant_list/report_data');
            const data = await res.json();
            if (!data.success) throw new Error('Failed to fetch report data');

            // --- NEW SAFETY CHECK: Prevent downloading blank PDFs ---
            if (!data.applicants || data.applicants.length === 0) {
                alert('No applicant data available. Please ensure applicants have been evaluated in the database first.');
                return;
            }

            // Group applicants by role
            const byRole = { 1: [], 2: [], 3: [], 4: [], 5: [] };
            let foundRoles = false;

            data.applicants.forEach((app) => {
                // Fallback in case the Railway DB column is mapped as primaryRoleId instead of roleId
                const rId = app.roleId || app.primaryRoleId || app.role_id;
                if (byRole[rId]) {
                    byRole[rId].push(app);
                    foundRoles = true;
                }
            });

            if (!foundRoles) {
                alert('Applicant data exists, but no valid roles were found to generate the tables.');
                return;
            }
            // --------------------------------------------------------

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Load all logos then draw
            const logos = await loadStandardLogos();
            let startY = drawPdfHeader(doc, logos, 'Applicant Performance Report');

            // One table per role
            for (let roleId = 1; roleId <= 5; roleId++) {
                const roleApps = byRole[roleId];
                if (!roleApps || roleApps.length === 0) continue;

                const metrics = ROLE_METRICS[roleId];

                // Sort by hierarchical metrics descending
                roleApps.sort((a, b) => {
                    for (const m of metrics) {
                        const statsA = a.stats || {};
                        const statsB = b.stats || {};
                        const diff = (Number(statsB[m.key]) || 0) - (Number(statsA[m.key]) || 0);
                        if (diff !== 0) return diff;
                    }
                    return 0;
                });

                const head = [['Rank', 'Riot ID', ...metrics.map((m) => m.label)]];
                const body = roleApps.map((app, idx) => {
                    const stats = app.stats || {}; // Extra safety against missing stats object
                    return [
                        `#${idx + 1}`,
                        app.riotId || 'Unknown',
                        ...metrics.map((m) => {
                            const val = Number(stats[m.key] || 0);
                            if (m.key.includes('Share') || m.key.includes('Participation')) return `${val.toFixed(1)}%`;
                            if (m.key === 'averageTotalDamageTaken') return val.toLocaleString();
                            return val.toFixed(2);
                        })
                    ];
                });

                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.setFont(undefined, 'bold');
                doc.text(`${ROLE_NAMES[roleId]} Lane Candidates`, 14, startY);

                doc.autoTable({
                    startY: startY + 4,
                    head,
                    body,
                    theme: 'grid',
                    headStyles: { fillColor: [42, 45, 51] },
                    margin: { left: 14, right: 14 },
                    styles: { fontSize: 10 }
                });

                startY = doc.lastAutoTable.finalY + 15;
                if (startY > 250) { doc.addPage(); startY = 20; }
            }

            const safeTeamName = teamName.replace(/\s+/g, '_');
            doc.save(`${safeTeamName}_Applicant_Report.pdf`);

        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('An error occurred while generating the report.');
        } finally {
            printBtn.innerHTML = originalText;
            printBtn.disabled = false;
        }
    };


    /* ============================================================
        APPLICANT TABLES — FETCH & RENDER
       ============================================================ */
    const loadBestPerformingApplicants = async () => {
        const tbody = document.getElementById('best-performing-table-body');
        if (!tbody) return;

        try {
            const res = await fetch('/reports/best_performing_applicants');
            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No applicant match data yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map((applicant, idx) => {
                const winrate = Number.parseFloat(applicant.winrate);
                const fmtWinrate = Number.isFinite(winrate) ? `${winrate.toFixed(1)}%` : '0.0%';
                const applicantName = applicant.applicantName || 'Applicant';
                const roleApplied = applicant.roleApplied || 'N/A';

                return `
                    <tr>
                        <td class="rank-num">${idx + 1}</td>
                        <td>${applicantName}</td>
                        <td><span class="wr-badge">${fmtWinrate}</span></td>
                        <td>${roleApplied}</td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            console.error('Error loading best-performing applicants:', err);
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Failed to load applicant performance report.</td></tr>`;
        }
    };

    const loadBestCommunicationApplicants = async () => {
        const tbody = document.getElementById('best-communication-table-body');
        if (!tbody) return;

        try {
            const res = await fetch('/reports/best_communication_applicants');
            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No communication evaluations yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map((applicant, idx) => {
                const comms = Number.parseFloat(applicant.communicationRating);
                const rounded = Number.isFinite(comms) ? Math.max(1, Math.min(5, Math.round(comms))) : 0;
                const commsClass = rounded >= 1 && rounded <= 5 ? `comms-${rounded}` : '';
                const ratingHtml = commsClass
                    ? `<span class="${commsClass}">${rounded}</span>`
                    : `<span>${rounded}</span>`;

                return `
                    <tr>
                        <td class="rank-num">${idx + 1}</td>
                        <td>${applicant.applicantName || 'Applicant'}</td>
                        <td>${ratingHtml}</td>
                        <td>${applicant.roleApplied || 'N/A'}</td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            console.error('Error loading best communication applicants:', err);
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Failed to load communication report.</td></tr>`;
        }
    };


    /* ============================================================
        PIE CHARTS — FETCH & RENDER
       ============================================================ */
    const buildLegendHtml = (labels, colorMap) =>
        labels.map((l) => `
            <div class="legend-item">
                <div class="legend-dot" style="background:${colorMap[l]}"></div>${l}
            </div>
        `).join('');

    const loadApplicantRolesChart = async () => {
        try {
            const res = await fetch('/reports/applicant_roles');
            const data = await res.json();

            const labels = data.map((p) => p.displayedRole);
            const percentages = data.map((p) => p.role_percentage);
            const roleColors = {
                Top: '#3b82f6',
                Mid: '#f59e0b',
                Jungle: '#9ca3af',
                'AD Carry': '#f97316',
                Support: '#128b0d'
            };

            new Chart(document.getElementById('roleChart'), {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{
                        data: percentages,
                        backgroundColor: labels.map((l) => roleColors[l]),
                        borderWidth: 2, borderColor: '#fff'
                    }]
                },
                options: {
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } }
                    }
                }
            });

            const legendEl = document.querySelector('#role-legend');
            if (legendEl) legendEl.innerHTML = buildLegendHtml(labels, roleColors);
        } catch (err) {
            console.error('Error loading applicant roles chart:', err);
        }
    };

    const loadApplicantStatusChart = async () => {
        try {
            const res = await fetch('/reports/applicant_statuses');
            const data = await res.json();

            const labels = data.map((a) => a.status);
            const percentages = data.map((a) => a.status_percentage);
            const statusColors = {
                Accepted: '#128b0d',
                Pending: '#f59e0b',
                Rejected: '#841a14'
            };

            new Chart(document.getElementById('acceptChart'), {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{
                        data: percentages,
                        backgroundColor: labels.map((l) => statusColors[l]),
                        borderWidth: 2, borderColor: '#fff'
                    }]
                },
                options: {
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } }
                    }
                }
            });

            const legendEl = document.querySelector('#status-legend');
            if (legendEl) legendEl.innerHTML = buildLegendHtml(labels, statusColors);
        } catch (err) {
            console.error('Error loading applicant status chart:', err);
        }
    };


    /* ============================================================
        CURRENT PLAYERS TABLE — FETCH & RENDER
       ============================================================ */
    const loadCurrentPlayers = async () => {
        try {
            const res = await fetch('/reports/current_players');
            const data = await res.json();

            const tbody = document.querySelector('.role-table tbody');
            if (tbody) {
                tbody.innerHTML = data.map((p) => `
                    <tr>
                        <td>${p.displayedRole}</td>
                        <td>${p.role_count}</td>
                        <td class="${p.is_leaving >= 1 ? 'players-left-zero' : ''}">${p.is_leaving}</td>
                        <td class="${p.players_left <= 1 ? 'players-left-zero' : ''}">${p.players_left}</td>
                    </tr>
                `).join('');
            }

            // Build recommendation text
            const allRoles = ['Top', 'Jungle', 'Mid', 'AD Carry', 'Support'];
            const criticalRoles = [];
            const lowRoles = [];
            const missingRoles = [];

            allRoles.forEach((role) => {
                const entry = data.find((p) => p.displayedRole === role);
                if (!entry) missingRoles.push(role);
                else if (Number(entry.players_left) === 0) criticalRoles.push(role);
                else if (Number(entry.players_left) === 1) lowRoles.push(role);
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

            recEl.textContent = parts.length > 0
                ? parts.join(' ')
                : 'All roles are sufficiently staffed for next semester. No immediate recruitment needed.';

        } catch (err) {
            console.error('Error loading current players:', err);
        }
    };


    /* ============================================================
        APPLICATIONS TABLE — FETCH & RENDER
       ============================================================ */
    const loadApplicationsTable = async () => {
        try {
            const res = await fetch('/reports/applications_total');
            const data = await res.json();

            const tbody = document.querySelector('#applications-table tbody');
            if (!tbody) return;

            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            tbody.innerHTML = data.map((a) => {
                const start = new Date(a.startDate).toLocaleDateString('en-US', options);
                const end = new Date(a.endDate).toLocaleDateString('en-US', options);
                return `
                    <tr>
                        <td>${start} - ${end}</td>
                        <td>${a.registrations}</td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            console.error('Error loading applications:', err);
        }
    };


    /* ============================================================
        ATTENDANCE SUMMARY — FETCH & RENDER
       ============================================================ */
    const loadAttendanceSummary = async (semester = 'current') => {
        try {
            const res = await fetch(`/reports/attendance_summary?semester=${semester}`);
            const json = await res.json();

            if (!json.success) {
                console.error('Attendance summary error:', json.message);
                return;
            }

            const { totalEvents, totalAbsences, top5 } = json.data;

            // Stat boxes
            const eventsEl = document.getElementById('totalEventsCount');
            const absencesEl = document.getElementById('totalAbsencesCount');
            if (eventsEl) eventsEl.textContent = totalEvents;
            if (absencesEl) absencesEl.textContent = totalAbsences;

            // Top-5 table
            const tbody = document.getElementById('absences-table-body');
            if (!tbody) return;

            if (!top5 || top5.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No absences recorded.</td></tr>`;
                return;
            }

            tbody.innerHTML = top5.map((row) => {
                const pct = Number(row.absencePercentage);
                const pctClass = pct >= 50 ? 'absence-pct-red' : '';
                const pctLabel = `${pct}% (${row.absences} out of ${row.invitedEvents} events)`;
                return `
                    <tr>
                        <td>${row.absences}</td>
                        <td>${row.lateCount}</td>
                        <td>${row.fullName}</td>
                        <td>${row.riotId}</td>
                        <td>${row.position ?? '—'}</td>
                        <td class="${pctClass}">${pctLabel}</td>
                    </tr>
                `;
            }).join('');

        } catch (err) {
            console.error('Error loading attendance summary:', err);
        }
    };

    // Wire up the semester dropdown
    const attendanceSemesterSelect = document.getElementById('attendanceSemesterSelect');
    if (attendanceSemesterSelect) {
        attendanceSemesterSelect.addEventListener('change', () => {
            loadAttendanceSummary(attendanceSemesterSelect.value);
        });
    }

    // DOWNLOAD ATTENDANCE REPORT
    const generateAttendancePdfBtn = document.getElementById('generateAttendancePdfBtn');
    if (generateAttendancePdfBtn) {
        generateAttendancePdfBtn.addEventListener('click', async () => {
            const originalText = generateAttendancePdfBtn.textContent;
            generateAttendancePdfBtn.textContent = 'Generating...';
            generateAttendancePdfBtn.disabled = true;

            try {
                if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
                    alert('PDF export tool is not available right now.');
                    return;
                }

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                // ── Shared branded header ──────────────────────────────
                const logos = await loadStandardLogos();
                const semesterLabel = attendanceSemesterSelect
                    ? attendanceSemesterSelect.options[attendanceSemesterSelect.selectedIndex].text
                    : 'Current Semester';
                let startY = drawPdfHeader(doc, logos, `Attendance Summary Report — ${semesterLabel}`);

                // ── Stat summary line ──────────────────────────────────
                const totalEventsVal = document.getElementById('totalEventsCount')?.textContent ?? '—';
                const totalAbsencesVal = document.getElementById('totalAbsencesCount')?.textContent ?? '—';

                doc.setFontSize(10);
                doc.setTextColor(50, 50, 50);
                doc.text(`Total Events: ${totalEventsVal}    Total Absences: ${totalAbsencesVal}`, 14, startY);
                startY += 8;

                // ── Top-5 absences table ───────────────────────────────
                const tbody = document.getElementById('absences-table-body');
                const rows = [];
                if (tbody) {
                    tbody.querySelectorAll('tr').forEach((tr) => {
                        rows.push(Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim()));
                    });
                }

                doc.autoTable({
                    startY,
                    head: [['Absences', 'Late', 'Full Name', 'Riot ID', 'Position', '% of Absences']],
                    body: rows,
                    theme: 'grid',
                    headStyles: { fillColor: [42, 45, 51] },   // matches applicant report
                    styles: { fontSize: 9 },
                    margin: { left: 14, right: 14 }
                });

                const safeTeamName = teamName.replace(/\s+/g, '_');
                doc.save(`${safeTeamName}_Attendance_Report.pdf`);

            } catch (err) {
                console.error('Attendance PDF error:', err);
                alert('Failed to generate attendance report.');
            } finally {
                generateAttendancePdfBtn.textContent = originalText;
                generateAttendancePdfBtn.disabled = false;
            }
        });
    }


    /* ============================================================
        EVENT LISTENERS
       ============================================================ */
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
            if (event.target.matches('[data-close-term-modal]')) closeTermModal();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && termBreakdownModal && termBreakdownModal.classList.contains('show')) {
            closeTermModal();
        }
    });

    if (saveTermReportBtn) {
        saveTermReportBtn.addEventListener('click', saveTermReport);
    }

    const printBtn = document.getElementById('generatePdfBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => generateApplicantPdf(printBtn));
    }


    /* ============================================================
        INIT — kick off all data fetches
       ============================================================ */
    loadTournamentReport();
    loadBestPerformingApplicants();
    loadBestCommunicationApplicants();
    loadApplicantRolesChart();
    loadApplicantStatusChart();
    loadCurrentPlayers();
    loadApplicationsTable();
    loadAttendanceSummary();
});