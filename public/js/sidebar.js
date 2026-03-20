document.addEventListener("DOMContentLoaded", async () => {
    // Find the sidebar container on whatever page we are on
    const sidebarContainer = document.querySelector('.sidebar') || 
                             document.querySelector('.coach-sidebar') || 
                             document.querySelector('.manager-sidebar');
                             
    if (!sidebarContainer) return;

    const scope = sidebarContainer.dataset.roleScope || '';

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

    const getLinksForRole = (role) => {
        let links = '';

        // 1. UNIVERSAL LINKS (Everyone gets these)
        links += buildLink('/announcements', 'announcement_logo.png', 'Announcements');
        links += buildLink('#', 'scheduling_logo.png', 'Scheduling');
        links += buildLink('#', 'attendance_logo.png', 'Attendance');

        // 2. MANAGER SPECIFIC
        if (role === 'Team Manager') {
            links += buildLink('/team_management', 'recruitment_evaluation_logo.png', 'Team Management');
            links += buildLink('/reports', 'report_icon.png', 'Reports');
        }

        // 3. COACH SPECIFIC
        if (role === 'Team Coach') {
            links += buildLink('/player_analysis', 'player_analysis_logo.png', 'Player Performance<br>Analysis');
            links += buildLink('/applicant_list', 'applicant_list_icon.png', 'Applicant List');
            links += buildLink('/tournament', 'tournament_icon.png', 'Tournament Management');
            links += buildLink('/reports', 'report_icon.png', 'Reports');
        }

        // 4. PLAYER SPECIFIC
        if (role === 'Player') {
            links += buildLink('/player_analysis', 'player_analysis_logo.png', 'Player Performance<br>Analysis');
        }

        return links;
    };

    const renderSidebar = (role) => {
        const links = getLinksForRole(role);
        sidebarContainer.innerHTML = `<ul>${links}</ul>`;
    };

    // Fast path: some pages explicitly state which role sidebar to render.
    if (scope === 'coach-only' || sidebarContainer.classList.contains('coach-sidebar')) {
        renderSidebar('Team Coach');
        return;
    }

    if (scope === 'manager-only' || sidebarContainer.classList.contains('manager-sidebar')) {
        renderSidebar('Team Manager');
        return;
    }

    try {
        // Ask the server who is logged in
        const res = await fetch('/api/current-role');
        const data = await res.json();
        const role = data.role; // Will be 'Team Manager', 'Team Coach', or 'Player'
        renderSidebar(role);
    } catch (error) {
        // Keep sidebar visible even when role endpoint is unavailable.
        renderSidebar('Player');
        console.error("Failed to load dynamic sidebar:", error);
    }
});