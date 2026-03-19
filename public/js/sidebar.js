document.addEventListener("DOMContentLoaded", async () => {
    // Find the sidebar container on whatever page we are on
    const sidebarContainer = document.querySelector('.sidebar') || 
                             document.querySelector('.coach-sidebar') || 
                             document.querySelector('.manager-sidebar');
                             
    if (!sidebarContainer) return;

    // Helper function to build a list item. It checks the current URL to highlight the active tab!
    const currentPath = window.location.pathname;
    const buildLink = (href, icon, text) => {
        const isActive = currentPath.includes(href) && href !== '#' ? 'active' : '';
        return `
            <li>
                <a href="${href}" class="${isActive}">
                    <img src="/images/${icon}" alt="${text} Icon">
                    ${text}
                </a>
            </li>
        `;
    };

    try {
        // Ask the server who is logged in
        const res = await fetch('/api/current-role');
        const data = await res.json();
        const role = data.role; // Will be 'Team Manager', 'Team Coach', or 'Player'

        let links = '';

        // 1. UNIVERSAL LINKS (Everyone gets these)
        links += buildLink('/announcements', 'announcement_logo.png', 'Announcements');
        links += buildLink('#', 'scheduling_logo.png', 'Scheduling');
        links += buildLink('#', 'attendance_logo.png', 'Attendance');

        // 2. MANAGER SPECIFIC
        if (role === 'Team Manager') {
            links += buildLink('/team_management', 'recruitment_evaluation_logo.png', 'Team Management');
        }
        
        // 3. COACH SPECIFIC
        else if (role === 'Team Coach') {
            links += buildLink('/player_analysis', 'player_analysis_logo.png', 'Player Performance<br>Analysis');
            links += buildLink('/applicant_list', 'recruitment_evaluation_logo.png', 'Applicant List');
            links += buildLink('/tournament', 'player_analysis_logo.png', 'Tournament Management');
        }
        
        // 4. PLAYER SPECIFIC
        else if (role === 'Player') {
            links += buildLink('/player_analysis', 'player_analysis_logo.png', 'Player Performance<br>Analysis');
        }

        // Inject the HTML into the sidebar
        sidebarContainer.innerHTML = `<ul>${links}</ul>`;

    } catch (error) {
        console.error("Failed to load dynamic sidebar:", error);
    }
});