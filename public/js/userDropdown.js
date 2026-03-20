// public/js/navbar.js
document.addEventListener("DOMContentLoaded", () => {
    const profileBtn = document.getElementById('profileDropdownBtn');
    const profileMenu = document.getElementById('profileDropdownMenu');

    if (profileBtn && profileMenu) {
        // Toggle menu when clicking the picture
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const isShowing = profileMenu.style.display === 'block';
            profileMenu.style.display = isShowing ? 'none' : 'block';
            profileBtn.style.borderColor = isShowing ? 'transparent' : '#00f2c3'; 
        });

        // Close menu when clicking anywhere else on the page
        document.addEventListener('click', () => {
            if (profileMenu.style.display === 'block') {
                profileMenu.style.display = 'none';
                profileBtn.style.borderColor = 'transparent';
            }
        });
    }
});