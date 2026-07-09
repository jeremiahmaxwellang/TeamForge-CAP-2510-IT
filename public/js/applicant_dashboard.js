// Mapping of role IDs to role names
const roleMap = {
    1: 'Top',
    2: 'Jungle',
    3: 'Mid',
    4: 'AD Carry',
    5: 'Support'
};

// Load applicant's own application details
async function loadApplicantDashboard() {
    try {
        // Get user info from localStorage/sessionStorage if available
        const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));

        if (!userInfo || !userInfo.email) {
            showError('User information not found. Please login again.');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        // Display user info
        document.getElementById('userName').textContent = `${userInfo.firstname} ${userInfo.lastname}`;
        document.getElementById('userEmail').textContent = userInfo.email;
        document.getElementById('userInfo').style.display = 'block';

        // Fetch applicant's details
        const response = await fetch(`/get-my-application?email=${encodeURIComponent(userInfo.email)}`);


        const text = await response.text();
        // console.log('Raw response:', text);  // See what the server actually returned

        const data = JSON.parse(text); // Then parse manually

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // const data = await response.json();

        if (data.success && data.applicant) {
            displayApplicantDetails(data.applicant);
        } else {
            showError(data.message || 'Failed to load application details');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('An error occurred while loading your application');
    }
}

// Display applicant's details
function displayApplicantDetails(applicant) {
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('content');
    const detailsBody = document.getElementById('applicantDetailsBody');

    loadingDiv.style.display = 'none';

    // Update the top status badge 
    const topBadge = document.getElementById('statusBadge');
    if (topBadge) {
        const currentStatus = applicant.applicationStatus || 'Pending';
        topBadge.textContent = currentStatus;

        // Reset base styles
        topBadge.style.backgroundColor = '';
        topBadge.style.color = '';

        // Apply colors based on status
        if (currentStatus === 'Accepted') {
            topBadge.style.backgroundColor = '#4CAF50'; // Green
            topBadge.style.color = 'white';
            // Unhide the Action Button 
            const actionContainer = document.getElementById('actionContainer');
            if (actionContainer) actionContainer.style.display = 'block';
        } else if (currentStatus === 'Rejected') {
            topBadge.style.backgroundColor = '#f44336'; // Red
            topBadge.style.color = 'white';
        } else {
            topBadge.style.backgroundColor = '#fff3cd'; // Yellow 
            topBadge.style.color = '#856404';
        }
    }

    const details = [
        { field: 'First Name', value: escapeHtml(applicant.firstname) },
        { field: 'Last Name', value: escapeHtml(applicant.lastname) },
        { field: 'Riot ID', value: `${escapeHtml(applicant.gameName)}#${escapeHtml(applicant.tagLine)}` },
        { field: 'Primary Role', value: roleMap[applicant.primaryRoleId] || 'Unknown' },
        { field: 'Secondary Role', value: applicant.secondaryRoleId ? roleMap[applicant.secondaryRoleId] || 'Unknown' : '-' },
        { field: 'Peak Rank', value: escapeHtml(applicant.peakRank) },
        { field: 'Current Rank', value: escapeHtml(applicant.currentRank) },
        { field: 'GPA', value: applicant.lastGPA ? parseFloat(applicant.lastGPA).toFixed(2) : '-' },
        { field: 'CGPA', value: applicant.CGPA ? parseFloat(applicant.CGPA).toFixed(2) : '-' },
        { field: 'Year Level', value: escapeHtml(applicant.yearLevel) },
        { field: 'Application Status', value: `<strong>${escapeHtml(applicant.applicationStatus || 'Pending')}</strong>` }
    ];

    detailsBody.innerHTML = details.map(detail => `
        <tr>
            <td><strong>${detail.field}</strong></td>
            <td>${detail.value}</td>
        </tr>
    `).join('');

    contentDiv.style.display = 'block';
}

// Load and display the single most recent announcement
async function loadLatestAnnouncement() {
    const announcementCard = document.getElementById('announcementCard');
    const announcementContent = document.getElementById('announcementContent');
    const announcementMeta = document.getElementById('announcementMeta');

    try {
        const response = await fetch('/get-latest-announcement');
        const text = await response.text();
        const data = JSON.parse(text);

        if (!response.ok || !data.success || !data.announcement) {
            // Fail quietly - just don't show the card if there's nothing to show
            announcementCard.style.display = 'none';
            return;
        }

        const announcement = data.announcement;

        // Title is optional depending on your schema usage
        const titleHtml = announcement.title
            ? `<p style="color: var(--text-primary); font-weight: bold; margin-bottom: 8px;">${escapeHtml(announcement.title)}</p>`
            : '';

        announcementContent.innerHTML = `${titleHtml}<p>${escapeHtml(announcement.content)}</p>`;

        const fullName = [announcement.firstname, announcement.lastname].filter(Boolean).join(' ');
        const postedBy = fullName ? escapeHtml(fullName) : 'Coach';
        const dateStr = announcement.dateCreated
            ? new Date(announcement.dateCreated).toLocaleString('en-US', {
                month: 'numeric', day: 'numeric', year: '2-digit',
                hour: 'numeric', minute: '2-digit'
            })
            : '';

        announcementMeta.textContent = `Posted by ${postedBy}${dateStr ? ' | ' + dateStr : ''}`;

        announcementCard.style.display = 'block';
    } catch (error) {
        console.error('Error loading announcement:', error);
        announcementCard.style.display = 'none';
    }
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

// Logout function
function logout() {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    window.location.href = '/';
}

// Handle the "Claim Spot" button click
const btnClaimSpot = document.getElementById('btnClaimSpot');
if (btnClaimSpot) {
    btnClaimSpot.addEventListener('click', async () => {
        btnClaimSpot.textContent = "Processing...";
        btnClaimSpot.disabled = true;

        try {
            const response = await fetch('/claim_spot', { method: 'POST' });
            const result = await response.json();

            if (result.success) {
                // Success! Redirect them to their new player profile
                window.location.href = result.redirect;
            } else {
                alert("Error: " + result.message);
                btnClaimSpot.textContent = "Claim Roster Spot & View Player Profile";
                btnClaimSpot.disabled = false;
            }
        } catch (error) {
            console.error(error);
            alert("A server error occurred.");
        }
    });
}

// Load dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadApplicantDashboard();
    loadLatestAnnouncement();
});
