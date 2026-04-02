document.addEventListener('DOMContentLoaded', async () => {
    const defaultTeamName = 'Viridis Arcus';
    const fallbackLogoUrl = '/uploads/team-logos/VA_logo.png';

    const teamNameSelectors = [
        '.manager-team-name',
        '.coach-team-name',
        '.team-name'
    ];

    const teamNameElements = document.querySelectorAll(teamNameSelectors.join(','));

    if (!teamNameElements.length) {
        return;
    }

    const ensureTeamNameLayout = (element) => {
        element.classList.add('js-team-identity');

        const existingDisplayName = element.textContent.trim() || defaultTeamName;

        // Reset legacy inline text so the name is rendered exactly once.
        if (!element.querySelector('.js-team-logo-inline') && !element.querySelector('.js-team-name-text')) {
            element.textContent = '';
        }

        let logoEl = element.querySelector('.js-team-logo-inline');
        if (!logoEl) {
            logoEl = document.createElement('img');
            logoEl.className = 'js-team-logo-inline';
            logoEl.alt = 'Team Logo';
            element.prepend(logoEl);
        }

        let textEl = element.querySelector('.js-team-name-text');
        if (!textEl) {
            textEl = document.createElement('span');
            textEl.className = 'js-team-name-text';
            textEl.textContent = existingDisplayName;
            element.appendChild(textEl);
        }

        return { logoEl, textEl };
    };

    const applyBranding = ({ teamName, teamLogoUrl }) => {
        const resolvedTeamName = (teamName || '').trim() || defaultTeamName;
        const resolvedTeamLogoUrl = (teamLogoUrl || '').trim() || fallbackLogoUrl;

        teamNameElements.forEach((element) => {
            const { logoEl, textEl } = ensureTeamNameLayout(element);
            textEl.textContent = resolvedTeamName;
            logoEl.onerror = () => {
                if (logoEl.getAttribute('src') !== fallbackLogoUrl) {
                    logoEl.setAttribute('src', fallbackLogoUrl);
                }
            };
            logoEl.setAttribute('src', resolvedTeamLogoUrl);
        });
    };

    applyBranding({
        teamName: defaultTeamName,
        teamLogoUrl: fallbackLogoUrl
    });

    try {
        const response = await fetch('/settings/api/team-details');
        if (!response.ok) return;

        const result = await response.json();
        if (!result.success) return;

        applyBranding({
            teamName: result.teamName,
            teamLogoUrl: result.teamLogoUrl
        });
    } catch (error) {
        console.error('Unable to load team branding:', error);
    }
});
