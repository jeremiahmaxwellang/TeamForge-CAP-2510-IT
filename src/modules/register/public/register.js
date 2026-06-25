let registrationRequirements = {
    gpa: {
        comparator: '>',
        threshold: 1.0
    },
    cgpa: {
        comparator: '>',
        threshold: 1.0
    }
};

function formatRequirementLabel(label, requirement) {
    if (!requirement || requirement.threshold === null) {
        return `${label}: no rule set`;
    }

    return `${label} ${requirement.comparator} ${Number(requirement.threshold).toFixed(2)}`;
}

function satisfiesRequirement(value, requirement) {
    if (!requirement || requirement.threshold === null) {
        return true;
    }

    switch (requirement.comparator) {
        case '>':
            return value > requirement.threshold;
        case '<':
            return value < requirement.threshold;
        case '>=':
            return value >= requirement.threshold;
        case '<=':
            return value <= requirement.threshold;
        default:
            return true;
    }
}

async function loadAcademicRequirements() {
    const criteriaMessage = document.getElementById('registration-criteria-message');
    if (!criteriaMessage) {
        return;
    }

    criteriaMessage.textContent = 'Loading academic requirements...';

    try {
        const response = await fetch('/register/academic-requirements');
        const result = await response.json();

        if (!response.ok || !result.success) {
            criteriaMessage.textContent = 'Academic requirements are currently unavailable.';
            return;
        }

        registrationRequirements = result.requirements || registrationRequirements;
        criteriaMessage.textContent = `Academic requirements: ${formatRequirementLabel('GPA', registrationRequirements.gpa)}, ${formatRequirementLabel('CGPA', registrationRequirements.cgpa)}.`;
    } catch (error) {
        console.error('Failed to load academic requirements:', error);
        criteriaMessage.textContent = 'Academic requirements are currently unavailable.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAcademicRequirements();
});

// Function to submit the registration form
async function submitRegistration() {
    // Get signup form data from sessionStorage (saved from signup.html)
    const email = sessionStorage.getItem('email');
    const password = sessionStorage.getItem('password');
    
    // Get registration form data
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const riotId = document.getElementById('riotId')?.value || '';
    const discord = document.getElementById('discord')?.value || '';
    const photoInput = document.getElementById('profilePhoto');
    const photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;
    const gpa = document.getElementById('gpa')?.value || '';
    const cgpa = document.getElementById('cgpa')?.value || '';
    const yearLevel = document.getElementById('yearLevel')?.value || '';
    const currentRank = document.getElementById('currentRank')?.value || '';
    const peakRank = document.getElementById('peakRank')?.value || '';
    const primaryRole = document.getElementById('primaryRole')?.value || '';
    const secondaryRole = document.getElementById('secondaryRole')?.value || '';

    const currentPeriod = document.getElementById('currentPeriod')?.value || '';

    // Validation
    if (!email || !password) {
        alert('Session expired. Please sign up again.');
        window.location.href = '/signup';
        return;
    }

    if (!firstName || !lastName || !riotId || !discord || !gpa || !cgpa || !photoFile || !yearLevel) {
        alert('Please fill in all registration fields');
        console.log('Missing fields:', { firstName, lastName, riotId, discord, gpa, cgpa, hasPhoto: Boolean(photoFile), yearLevel });
        return;
    }

    if (!currentRank || !peakRank || !primaryRole || !secondaryRole) {
        alert('Please select all rank and role fields');
        console.log('Missing selections:', { currentRank, peakRank, primaryRole, secondaryRole });
        return;
    }

    const parsedGpa = Number.parseFloat(gpa);
    const parsedCgpa = Number.parseFloat(cgpa);

    if (!Number.isFinite(parsedGpa) || !Number.isFinite(parsedCgpa)) {
        alert('Please enter valid GPA and CGPA values.');
        return;
    }

    if (!satisfiesRequirement(parsedGpa, registrationRequirements.gpa)) {
        alert(`Registration requirement not met: ${formatRequirementLabel('GPA', registrationRequirements.gpa)}.`);
        return;
    }

    if (!satisfiesRequirement(parsedCgpa, registrationRequirements.cgpa)) {
        alert(`Registration requirement not met: ${formatRequirementLabel('CGPA', registrationRequirements.cgpa)}.`);
        return;
    }

    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('firstname', firstName);
        formData.append('lastname', lastName);
        formData.append('riotId', riotId);
        formData.append('discord', discord);
        formData.append('gpa', parsedGpa);
        formData.append('cgpa', parsedCgpa);
        formData.append('yearLevel', yearLevel);
        formData.append('currentRank', currentRank);
        formData.append('peakRank', peakRank);
        formData.append('primaryRole', parseInt(primaryRole, 10));
        formData.append('secondaryRole', parseInt(secondaryRole, 10));
        formData.append('profilePhoto', photoFile),
        formData.append('currentPeriod', parseInt(currentPeriod, 10));

        const response = await fetch('/register/createuser', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful!');
            // Clear session storage
            sessionStorage.removeItem('email');
            sessionStorage.removeItem('password');
            window.location.href = '/'; // Redirect to home or login page
        } else {
            alert('Registration failed: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
}

