// ─────────────────────────────────────────────
//  register.js  –  Registration page logic
// ─────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────

function formatRequirementLabel(label, requirement) {
    if (!requirement || requirement.threshold === null) {
        return `${label}: no rule set`;
    }
    return `${label} ${requirement.comparator} ${Number(requirement.threshold).toFixed(2)}`;
}

function satisfiesRequirement(value, requirement) {
    if (!requirement || requirement.threshold === null) return true;
    switch (requirement.comparator) {
        case '>':  return value > requirement.threshold;
        case '<':  return value < requirement.threshold;
        case '>=': return value >= requirement.threshold;
        case '<=': return value <= requirement.threshold;
        default:   return true;
    }
}

// ── Academic Requirements ─────────────────────

async function loadAcademicRequirements() {
    const criteriaMessage = document.getElementById('registration-criteria-message');
    if (!criteriaMessage) return;

    criteriaMessage.textContent = 'Loading academic requirements...';

    try {
        const response = await fetch('/register/academic-requirements');
        const result = await response.json();

        if (!response.ok || !result.success) {
            criteriaMessage.textContent = 'Academic requirements are currently unavailable.';
            return;
        }

        registrationRequirements = result.requirements || registrationRequirements;
        criteriaMessage.textContent =
            `Academic requirements: ` +
            `${formatRequirementLabel('GPA', registrationRequirements.gpa)}, ` +
            `${formatRequirementLabel('CGPA', registrationRequirements.cgpa)}.`;
    } catch (error) {
        console.error('Failed to load academic requirements:', error);
        criteriaMessage.textContent = 'Academic requirements are currently unavailable.';
    }
}

// ── CSV Template Download ─────────────────────

function downloadGradesTemplate() {
    const csvContent = 'GPA,CGPA\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'grades_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── CSV Parsing ───────────────────────────────

/**
 * Parses the grades CSV file and populates the hidden #gpa / #cgpa fields.
 * Expects a CSV with a header row containing "GPA" and "CGPA" columns
 * and exactly one data row.
 */
function parseGradesCSV(file) {
    const previewEl  = document.getElementById('csv-preview');
    const gpaChip    = document.getElementById('csv-preview-gpa');
    const cgpaChip   = document.getElementById('csv-preview-cgpa');
    const errorEl    = document.getElementById('csv-error');
    const hiddenGpa  = document.getElementById('gpa');
    const hiddenCgpa = document.getElementById('cgpa');

    // Reset state
    previewEl.style.display  = 'none';
    errorEl.style.display    = 'none';
    errorEl.textContent      = '';
    hiddenGpa.value          = '';
    hiddenCgpa.value         = '';

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text  = e.target.result.trim();
            const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');

            if (lines.length < 2) {
                showCsvError('CSV must have a header row and at least one data row.');
                return;
            }

            // Parse header – normalise to lowercase, trim whitespace
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const gpaIdx  = headers.indexOf('gpa');
            const cgpaIdx = headers.indexOf('cgpa');

            if (gpaIdx === -1 || cgpaIdx === -1) {
                showCsvError('CSV must contain "GPA" and "CGPA" columns.');
                return;
            }

            // Parse first data row
            const values  = lines[1].split(',').map(v => v.trim());
            const rawGpa  = values[gpaIdx];
            const rawCgpa = values[cgpaIdx];

            const parsedGpa  = Number.parseFloat(rawGpa);
            const parsedCgpa = Number.parseFloat(rawCgpa);

            if (!Number.isFinite(parsedGpa) || !Number.isFinite(parsedCgpa)) {
                showCsvError('GPA and CGPA values in the CSV must be valid numbers.');
                return;
            }

            if (parsedGpa < 0 || parsedGpa > 9999.99) {
                showCsvError('GPA must be between 0 and 9999.99.');
                return;
            }

            if (parsedCgpa < 0 || parsedCgpa > 9999.99) {
                showCsvError('CGPA must be between 0 and 9999.99.');
                return;
            }

            // Populate hidden fields
            hiddenGpa.value  = parsedGpa;
            hiddenCgpa.value = parsedCgpa;

            // Show preview chips
            gpaChip.textContent  = `GPA: ${parsedGpa.toFixed(2)}`;
            cgpaChip.textContent = `CGPA: ${parsedCgpa.toFixed(2)}`;
            previewEl.style.display = 'flex';

        } catch (err) {
            console.error('Error parsing CSV:', err);
            showCsvError('Failed to read the CSV file. Please check the format and try again.');
        }
    };

    reader.onerror = () => {
        showCsvError('Could not read the file. Please try again.');
    };

    reader.readAsText(file);
}

function showCsvError(message) {
    const errorEl    = document.getElementById('csv-error');
    const previewEl  = document.getElementById('csv-preview');
    const hiddenGpa  = document.getElementById('gpa');
    const hiddenCgpa = document.getElementById('cgpa');

    previewEl.style.display = 'none';
    hiddenGpa.value         = '';
    hiddenCgpa.value        = '';

    errorEl.textContent    = message;
    errorEl.style.display  = 'block';
}

// ── Form Submission ───────────────────────────

async function submitRegistration() {
    // Retrieve signup credentials from sessionStorage
    const email    = sessionStorage.getItem('email');
    const password = sessionStorage.getItem('password');

    // Form fields
    const firstName    = document.getElementById('firstName')?.value    || '';
    const lastName     = document.getElementById('lastName')?.value     || '';
    const riotId       = document.getElementById('riotId')?.value       || '';
    const discord      = document.getElementById('discord')?.value      || '';
    const photoInput   = document.getElementById('profilePhoto');
    const photoFile    = photoInput && photoInput.files ? photoInput.files[0] : null;
    const csvInput     = document.getElementById('gradesCSV');
    const csvFile      = csvInput && csvInput.files ? csvInput.files[0] : null;
    const gpa          = document.getElementById('gpa')?.value          || '';
    const cgpa         = document.getElementById('cgpa')?.value         || '';
    const yearLevel    = document.getElementById('yearLevel')?.value    || '';
    const currentRank  = document.getElementById('currentRank')?.value  || '';
    const peakRank     = document.getElementById('peakRank')?.value     || '';
    const primaryRole  = document.getElementById('primaryRole')?.value  || '';
    const secondaryRole= document.getElementById('secondaryRole')?.value|| '';
    const currentPeriod= document.getElementById('currentPeriod')?.value|| '';

    // ── Validation ────────────────────────────

    if (!email || !password) {
        alert('Session expired. Please sign up again.');
        window.location.href = '/signup';
        return;
    }

    if (!firstName || !lastName || !riotId || !discord || !photoFile || !yearLevel) {
        alert('Please fill in all registration fields.');
        return;
    }

    if (!csvFile) {
        alert('Please upload your grades CSV file.');
        return;
    }

    if (!gpa || !cgpa) {
        alert('Could not read GPA/CGPA from the CSV. Please fix any errors shown and try again.');
        return;
    }

    if (!currentRank || !peakRank || !primaryRole || !secondaryRole) {
        alert('Please select all rank and role fields.');
        return;
    }

    // Riot ID format
    const riotIdParts = riotId.split('#');
    if (riotIdParts.length !== 2) {
        alert('Invalid Riot ID format. Please use format: gameName#tagLine');
        return;
    }
    const tagLine = riotIdParts[1].trim();
    if (tagLine.length === 0) {
        alert('Tagline cannot be empty.');
        return;
    }
    if (tagLine.length > 5) {
        alert('Tagline cannot exceed 5 characters.');
        return;
    }

    const parsedGpa  = Number.parseFloat(gpa);
    const parsedCgpa = Number.parseFloat(cgpa);

    if (!Number.isFinite(parsedGpa) || !Number.isFinite(parsedCgpa)) {
        alert('Please upload a valid grades CSV with numeric GPA and CGPA values.');
        return;
    }

    if (parsedGpa < 0 || parsedGpa > 9999.99) {
        alert('GPA must be between 0 and 9999.99.');
        return;
    }
    if (parsedCgpa < 0 || parsedCgpa > 9999.99) {
        alert('CGPA must be between 0 and 9999.99.');
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

    // ── Submit ────────────────────────────────

    try {
        const formData = new FormData();
        formData.append('email',         email);
        formData.append('password',      password);
        formData.append('firstname',     firstName);
        formData.append('lastname',      lastName);
        formData.append('riotId',        riotId);
        formData.append('discord',       discord);
        formData.append('gpa',           parsedGpa);
        formData.append('cgpa',          parsedCgpa);
        formData.append('yearLevel',     yearLevel);
        formData.append('currentRank',   currentRank);
        formData.append('peakRank',      peakRank);
        formData.append('primaryRole',   parseInt(primaryRole, 10));
        formData.append('secondaryRole', parseInt(secondaryRole, 10));
        formData.append('profilePhoto',  photoFile);
        formData.append('gradesCSV',     csvFile);
        formData.append('currentPeriod', parseInt(currentPeriod, 10));

        const response = await fetch('/register/createuser', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text || 'Unknown error occurred' };
        }

        if (response.ok) {
            alert('Registration successful!');
            sessionStorage.removeItem('email');
            sessionStorage.removeItem('password');
            window.location.href = '/';
        } else {
            alert('Registration failed: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration: ' + (error.message || 'Please try again'));
    }
}

// ── Event Listeners ───────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadAcademicRequirements();

    const csvInput = document.getElementById('gradesCSV');
    if (csvInput) {
        csvInput.addEventListener('change', (e) => {
            parseGradesCSV(e.target.files[0] || null);
        });
    }
});