document.addEventListener('DOMContentLoaded', async () => {
    const fallbackPhotoUrl = '/uploads/profile-photos/defaultusericon.png';
    const profileImages = document.querySelectorAll('.js-current-user-photo');

    if (!profileImages.length) return;

    profileImages.forEach((img) => {
        img.onerror = () => {
            if (img.getAttribute('src') !== fallbackPhotoUrl) {
                img.setAttribute('src', fallbackPhotoUrl);
            }
        };

        if (!img.getAttribute('src')) {
            img.setAttribute('src', fallbackPhotoUrl);
        }
    });

    try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) return;

        const profile = await response.json();
        const resolvedPhotoUrl = profile.profilePhotoUrl || fallbackPhotoUrl;

        profileImages.forEach((img) => {
            img.setAttribute('src', resolvedPhotoUrl);
        });
    } catch (error) {
        console.error('Unable to load current user profile photo:', error);
    }
});
