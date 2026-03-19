// Function to submit the registration form
async function submitRegistration() {
    // Get signup form data from sessionStorage (saved from signup.html)
    const email = sessionStorage.getItem('email');
    const password = sessionStorage.getItem('password');
    
    // Get registration form data
    const fullname = document.getElementById('fullName')?.value || '';
    const riotId = document.getElementById('riotId')?.value || '';
    const discord = document.getElementById('discord')?.value || '';
    const photoInput = document.getElementById('profilePhoto');
    const photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;
    const gpa = document.getElementById('gpa')?.value || '';
    const cgpa = document.getElementById('cgpa')?.value || '';
    const currentRank = document.getElementById('currentRank')?.value || '';
    const peakRank = document.getElementById('peakRank')?.value || '';
    const primaryRole = document.getElementById('primaryRole')?.value || '';
    const secondaryRole = document.getElementById('secondaryRole')?.value || '';

    // Split full name into first and last name
    const nameParts = fullname.trim().split(/\s+/);
    const firstname = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullname.trim();
    const lastname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullname.trim();

    // Validation
    if (!email || !password) {
        alert('Session expired. Please sign up again.');
        window.location.href = '/signup';
        return;
    }

    if (!fullname || !riotId || !discord || !gpa || !cgpa || !photoFile) {
        alert('Please fill in all registration fields');
        console.log('Missing fields:', { fullname, riotId, discord, gpa, cgpa, hasPhoto: Boolean(photoFile) });
        return;
    }

    if (!currentRank || !peakRank || !primaryRole || !secondaryRole) {
        alert('Please select all rank and role fields');
        console.log('Missing selections:', { currentRank, peakRank, primaryRole, secondaryRole });
        return;
    }

    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        formData.append('riotId', riotId);
        formData.append('discord', discord);
        formData.append('gpa', parseFloat(gpa));
        formData.append('cgpa', parseFloat(cgpa));
        formData.append('currentRank', currentRank);
        formData.append('peakRank', peakRank);
        formData.append('primaryRole', parseInt(primaryRole, 10));
        formData.append('secondaryRole', parseInt(secondaryRole, 10));
        formData.append('profilePhoto', photoFile);

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

