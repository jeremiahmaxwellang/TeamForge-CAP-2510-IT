// Function to submit the registration form
async function submitRegistration() {
    // Get signup form data from sessionStorage (saved from signup.html)
    const email = sessionStorage.getItem('email');
    const password = sessionStorage.getItem('password');
    
    // Get registration form data
    const fullname = document.querySelector('input[placeholder="Enter your full name"]')?.value || '';
    const riotId = document.querySelector('input[placeholder="Enter your Riot ID"]')?.value || '';
    const gpa = document.querySelector('input[placeholder="Enter your GPA"]')?.value || '';
    const cgpa = document.querySelector('input[placeholder="Enter your CGPA"]')?.value || '';
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

    if (!fullname || !riotId || !gpa || !cgpa) {
        alert('Please fill in all registration fields');
        console.log('Missing fields:', { fullname, riotId, gpa, cgpa });
        return;
    }

    if (!currentRank || !peakRank || !primaryRole) {
        alert('Please select all rank and role fields');
        console.log('Missing selections:', { currentRank, peakRank, primaryRole });
        return;
    }

    try {
        const response = await fetch('/register/createuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                firstname: firstname,
                lastname: lastname,
                riotId,
                gpa: parseFloat(gpa),
                cgpa: parseFloat(cgpa),
                currentRank,
                peakRank,
                primaryRole: parseInt(primaryRole),
                secondaryRole: secondaryRole && secondaryRole !== '' ? parseInt(secondaryRole) : null
            })
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

