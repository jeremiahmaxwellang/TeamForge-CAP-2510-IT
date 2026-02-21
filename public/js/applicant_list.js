// Mapping of role IDs to role names
const roleMap = {
    1: 'Top',
    2: 'Jungle',
    3: 'Mid',
    4: 'AD Carry',
    5: 'Support'
};

// Fetch and display applicants
async function loadApplicants() {
    try {
        const response = await fetch('/applicant_list/getall');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayApplicants(data.applicants);
        } else {
            showError(data.message || 'Failed to load applicants');
        }
    } catch (error) {
        console.error('Error loading applicants:', error);
        showError('An error occurred while loading applicants');
    }
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
        <tr>
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

// Load applicants when the page loads
document.addEventListener('DOMContentLoaded', loadApplicants);
