document.addEventListener("DOMContentLoaded", async () => {
    // Find the sidebar container on whatever page we are on
    const sidebarContainer = document.querySelector('.sidebar') || 
                             document.querySelector('.coach-sidebar') || 
                             document.querySelector('.manager-sidebar');
    const scope = sidebarContainer ? (sidebarContainer.dataset.roleScope || '') : '';

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
        links += buildLink('/calendar', 'calendar_icon.png', 'Calendar');
        links += buildLink('/attendance', 'attendance_icon.png', 'Attendance');

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

    const normalizeRole = (rawRole) => {
        const role = (rawRole || '').toString().trim().toLowerCase();

        if (role === 'team manager' || role === 'manager') {
            return 'Team Manager';
        }

        if (role === 'team coach' || role === 'coach') {
            return 'Team Coach';
        }

        if (role === 'player') {
            return 'Player';
        }

        return 'Guest';
    };

    const getCookieValue = (name) => {
        const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`));

        return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
    };

    const getDashboardPathForRole = (role) => {
        const normalizedRole = normalizeRole(role);

        if (normalizedRole === 'Team Manager') {
            return '/manager_dashboard.html';
        }

        if (normalizedRole === 'Team Coach') {
            return '/coach_dashboard.html';
        }

        if (normalizedRole === 'Player') {
            return '/player_dashboard.html';
        }

        const rawRole = (role || '').toString().trim().toLowerCase();
        if (rawRole === 'applicant') {
            return '/applicant_dashboard';
        }

        return '/';
    };

    const wireBrandRedirect = (role) => {
        const dashboardPath = getDashboardPathForRole(role);
        const brandElements = document.querySelectorAll('.logo, .manager-brand');

        brandElements.forEach((brand) => {
            if (brand.tagName.toLowerCase() === 'a') {
                brand.setAttribute('href', dashboardPath);
                return;
            }

            brand.style.cursor = 'pointer';
            brand.addEventListener('click', () => {
                window.location.href = dashboardPath;
            });
        });
    };

    const renderSidebar = (role) => {
        if (!sidebarContainer) return;
        const links = getLinksForRole(normalizeRole(role));
        sidebarContainer.innerHTML = `<ul>${links}</ul>`;
    };

    // Fast path: some pages explicitly state which role sidebar to render.
    if (scope === 'coach-only' || sidebarContainer.classList.contains('coach-sidebar')) {
        wireBrandRedirect('Team Coach');
        renderSidebar('Team Coach');
        return;
    }

    if (scope === 'manager-only' || sidebarContainer.classList.contains('manager-sidebar')) {
        wireBrandRedirect('Team Manager');
        renderSidebar('Team Manager');
        return;
    }

    try {
        // Ask the server who is logged in
        const res = await fetch('/api/current-role');
        const data = await res.json();
        const role = data.role;
        wireBrandRedirect(role);
        renderSidebar(role);
    } catch (error) {
        // Keep sidebar visible even when role endpoint is unavailable.
        const roleFromCookie = getCookieValue('userRole');
        wireBrandRedirect(roleFromCookie || 'Guest');
        renderSidebar(roleFromCookie || 'Guest');
        console.error("Failed to load dynamic sidebar:", error);
    }
});