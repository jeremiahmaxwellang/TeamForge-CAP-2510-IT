// Mapping of role IDs to role names
const roleMap = {
    1: 'Top',
    2: 'Jungle',
    3: 'Mid',
    4: 'AD Carry',
    5: 'Support'
};

// Mapping of role IDs to image filenames (used in player analysis)
const roleImgMap = {
    1: '/images/top_lane.png',
    2: '/images/jungle.png',
    3: '/images/mid_lane.png',
    4: '/images/bottom_lane.png',
    5: '/images/support.png'
};

// Helper to get rank image path from CommunityDragon CDN (ignore division numbers/roman numerals)
function getRankImg(rank) {
    if (!rank) return '';
    // Remove roman numerals and numbers (e.g., 'Diamond III' -> 'diamond')
    const mainRank = String(rank).toLowerCase().replace(/\s*(i{1,3}|iv|v|vi{0,3}|\d+)$/i, '').trim();
    return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${mainRank}.png`;
}

// Global variables to hold our data and current view
let allApplicantsData = [];
let currentStatusView = 'Pending';

document.addEventListener("DOMContentLoaded", async () => {
    await fetchAndStoreApplicants();
    setupTabListeners();
});

// 1. Fetch data ONCE and store it
async function fetchAndStoreApplicants() {
    try {
        const res = await fetch('/applicant_list/getall'); // Update to your actual GET route
        const data = await res.json();

        if (data.success) {
            allApplicantsData = data.applicants;
            renderApplicantList(); // Draw the initial "Pending" list
        }
    } catch (error) {
        console.error("Failed to fetch applicants:", error);
    }
}

// 2. Render the list based on the active tab
function renderApplicantList() {
    // UPDATED: These IDs now perfectly match your HTML!
    const applicantsBody = document.getElementById('applicantsBody'); 
    const applicantsTable = document.getElementById('applicantsTable');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    
    if (!applicantsBody || !loadingDiv) return;

    // Filter the global array based on the active tab
    const filteredApplicants = allApplicantsData.filter(app => {
        const status = app.applicationStatus || 'Pending';
        return status === currentStatusView;
    });

    if (filteredApplicants.length === 0 && currentStatusView != 'ApplicationPeriod') {
        // Hide table and show a friendly empty message
        if (applicantsTable) applicantsTable.style.display = 'none';
        loadingDiv.textContent = `No applicants found in the ${currentStatusView} tab.`;
        loadingDiv.style.display = 'block';
        return;
    }

    // Hide loading text and show the table
    loadingDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
    if (applicantsTable) applicantsTable.style.display = 'table';

    if(currentStatusView === 'ApplicationPeriod') applicantsTable.style.display = 'none';

    // Map data to your exact table rows
    applicantsBody.innerHTML = filteredApplicants.map(applicant => {
        // Role logos
        const primaryRoleLogo = roleImgMap[applicant.primaryRoleId] ? `<img src="${roleImgMap[applicant.primaryRoleId]}" alt="${roleMap[applicant.primaryRoleId]}" class="role-logo">` : '';
        const secondaryRoleLogo = roleImgMap[applicant.secondaryRoleId] ? `<img src="${roleImgMap[applicant.secondaryRoleId]}" alt="${roleMap[applicant.secondaryRoleId]}" class="role-logo">` : '';
        // Rank logos
        const peakRankLogo = applicant.peakRank ? `<img src="${getRankImg(applicant.peakRank)}" alt="${escapeHtml(applicant.peakRank)}" class="rank-logo">` : '';
        const currentRankLogo = applicant.currentRank ? `<img src="${getRankImg(applicant.currentRank)}" alt="${escapeHtml(applicant.currentRank)}" class="rank-logo">` : '';
        return `
        <tr class="clickable-row" data-user-id="${applicant.userId}">
            <td>${escapeHtml(applicant.firstname)}</td>
            <td>${escapeHtml(applicant.lastname === 'undefined' ? '-' : applicant.lastname || '-')}</td>
            <td>${escapeHtml(applicant.gameName)}#${escapeHtml(applicant.tagLine)}</td>
            <td>${primaryRoleLogo}<span class="role-label">${roleMap[applicant.primaryRoleId] || 'Unknown'}</span></td>
            <td>${secondaryRoleLogo}<span class="role-label">${applicant.secondaryRoleId ? roleMap[applicant.secondaryRoleId] || 'Unknown' : '-'}</span></td>
            <td>${peakRankLogo}<span class="rank-label">${escapeHtml(applicant.peakRank)}</span></td>
            <td>${currentRankLogo}<span class="rank-label">${escapeHtml(applicant.currentRank)}</span></td>
            <td>${applicant.lastGPA ? parseFloat(applicant.lastGPA).toFixed(2) : '-'}</td>
            <td>${applicant.CGPA ? parseFloat(applicant.CGPA).toFixed(2) : '-'}</td>
            <td><span class="status ${(applicant.applicationStatus || 'Pending').toLowerCase()}">${escapeHtml(applicant.applicationStatus || 'Pending')}</span></td>
        </tr>
        `;
    }).join('');

    // Reattach the profile click listeners to the new rows
    applicantsBody.querySelectorAll('.clickable-row').forEach((row) => {
        row.addEventListener('click', () => {
            const userId = row.getAttribute('data-user-id');
            if (!userId) return;
            window.location.href = `/applicant_list/profile?id=${encodeURIComponent(userId)}`;
        });
    });
}

// 3. Make the tabs clickable
function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active styling from all tabs
            tabButtons.forEach(b => {
                b.style.color = '#888';
                b.style.borderColor = 'transparent';
                b.classList.remove('active');
            });

            // Add active styling to the clicked tab
            e.target.style.color = '#00f2c3';
            e.target.style.borderColor = '#00f2c3';
            e.target.classList.add('active');

            // Update the current view and redraw the list!
            currentStatusView = e.target.getAttribute('data-status');
            renderApplicantList();
        });
    });
}

// Display applicants in the table
function displayApplicants(applicants) {
    const loadingDiv = document.getElementById('loading');
    const applicantsTable = document.getElementById('applicantsTable');
    const applicantsBody = document.getElementById('applicantsBody');
    
    loadingDiv.style.display = 'none';
    
    if (applicants.length === 0) {
        showError('No applicants found');
        return;
    }
    
    applicantsBody.innerHTML = applicants.map(applicant => `
        <tr class="clickable-row" data-user-id="${applicant.userId}">
            <td>${escapeHtml(applicant.firstname)}</td>
            <td>${escapeHtml(applicant.lastname)}</td>
            <td>${escapeHtml(applicant.gameName)}#${escapeHtml(applicant.tagLine)}</td>
            <td>${roleMap[applicant.primaryRoleId] || 'Unknown'}</td>
            <td>${applicant.secondaryRoleId ? roleMap[applicant.secondaryRoleId] || 'Unknown' : '-'}</td>
            <td>${escapeHtml(applicant.peakRank)}</td>
            <td>${escapeHtml(applicant.currentRank)}</td>
            <td>${applicant.lastGPA ? parseFloat(applicant.lastGPA).toFixed(2) : '-'}</td>
            <td>${applicant.CGPA ? parseFloat(applicant.CGPA).toFixed(2) : '-'}</td>
            <td><span class="status ${(applicant.applicationStatus || 'Pending').toLowerCase()}">${escapeHtml(applicant.applicationStatus || 'Pending')}</span></td>
        </tr>
    `).join('');

    applicantsBody.querySelectorAll('.clickable-row').forEach((row) => {
        row.addEventListener('click', () => {
            const userId = row.getAttribute('data-user-id');
            if (!userId) return;
            window.location.href = `/applicant_list/profile?id=${encodeURIComponent(userId)}`;
        });
    });
    
    applicantsTable.style.display = 'table';
}

// Show error message
function showError(message) {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    
    loadingDiv.style.display = 'none';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Application Period Tab Logic ---

const applicationPeriodPanel = document.getElementById('applicationPeriodPanel');
const applicantsTable = document.getElementById('applicantsTable');

// Extend your existing tab click handler to show/hide the panel
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.style.color = '#888';
            b.style.borderBottom = '3px solid transparent';
        });
        btn.style.color = '#00f2c3';
        btn.style.borderBottom = '3px solid #00f2c3';

        if (btn.dataset.status === 'ApplicationPeriod') {
            applicantsTable.style.display = 'none';
            applicationPeriodPanel.style.display = 'block';
            loadCurrentPeriod();
        } else {
            applicationPeriodPanel.style.display = 'none';
        }
    });
});

// Load and display the current active application period
async function loadCurrentPeriod() {
    const msg = document.getElementById('periodStatusMsg');
    msg.textContent = '';
    try {
        const res = await fetch('/applicant_list/period/current');
        const data = await res.json();
        const span = document.getElementById('currentPeriodDates');

        if (data.success && data.period) {
            const start = new Date(data.period.startDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            const end   = new Date(data.period.endDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            span.textContent = `${start} - ${end}`;

            // Pre-fill edit fields
            document.getElementById('editStartDate').value = data.period.startDate.substring(0, 10);
            document.getElementById('editEndDate').value   = data.period.endDate.substring(0, 10);
        } else {
            span.textContent = 'No active period.';
        }
    } catch (e) {
        console.error(e);
    }
}

// Toggle Edit Dates form
document.getElementById('editDatesBtn').addEventListener('click', () => {
    const form = document.getElementById('editDatesForm');
    form.style.display = form.style.display === 'flex' ? 'none' : 'flex';
});
document.getElementById('cancelEditDatesBtn').addEventListener('click', () => {
    document.getElementById('editDatesForm').style.display = 'none';
});

// Save edited dates
document.getElementById('saveEditDatesBtn').addEventListener('click', async () => {
    const msg = document.getElementById('periodStatusMsg');
    const startDate = document.getElementById('editStartDate').value;
    const endDate   = document.getElementById('editEndDate').value;
    if (!startDate || !endDate) return (msg.textContent = 'Both dates are required.');

    const res = await fetch('/applicant_list/period/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
    });
    const data = await res.json();
    msg.textContent = data.message || (data.success ? 'Dates updated!' : 'Error updating dates.');
    if (data.success) {
        document.getElementById('editDatesForm').style.display = 'none';
        loadCurrentPeriod();
    }
});

// End Application Period
document.getElementById('endApplicationBtn').addEventListener('click', async () => {
    const msg = document.getElementById('periodStatusMsg');
    if (!confirm('Are you sure you want to end the current application period?')) return;

    const res = await fetch('/applicant_list/period/end', { method: 'PUT' });
    const data = await res.json();
    msg.textContent = data.message || (data.success ? 'Period ended.' : 'Error ending period.');
    if (data.success) loadCurrentPeriod();
});

// Start New Application Period
document.getElementById('startNewPeriodBtn').addEventListener('click', async () => {
    const msg = document.getElementById('periodStatusMsg');
    const startDate = document.getElementById('newStartDate').value;
    const endDate   = document.getElementById('newEndDate').value;
    if (!startDate || !endDate) return (msg.textContent = 'Please fill in both dates.');

    const res = await fetch('/applicant_list/period/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
    });
    const data = await res.json();
    msg.textContent = data.message || (data.success ? 'New period started!' : 'Error starting period.');
    if (data.success) {
        document.getElementById('newStartDate').value = '';
        document.getElementById('newEndDate').value   = '';
        loadCurrentPeriod();
    }
});

// Load applicants when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    await fetchAndStoreApplicants();
    setupTabListeners();
});
