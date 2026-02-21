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
        const response = await fetch(`/applicant_list/getbyemail?email=${encodeURIComponent(userInfo.email)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
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

// Load dashboard when the page loads
document.addEventListener('DOMContentLoaded', loadApplicantDashboard);
