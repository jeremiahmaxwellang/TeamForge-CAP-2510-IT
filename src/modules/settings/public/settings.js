document.addEventListener('DOMContentLoaded', async () => {

    // --- UI ELEMENTS ---
    const nameDisplayMode = document.getElementById('name-display-mode');
    const nameEditMode = document.getElementById('name-edit-mode');
    const nameText = document.getElementById('settings-name');

    // --- Making the Academic Terms Dynamic ---
    const academicTermsSection = document.getElementById('academic-terms-section');
    const academicTermCadenceSelect = document.getElementById('academic-term-cadence-select');
    const term1StartInput = document.getElementById('term-1-start');
    const term1EndInput = document.getElementById('term-1-end');
    const term2StartInput = document.getElementById('term-2-start');
    const term2EndInput = document.getElementById('term-2-end');
    const term3StartInput = document.getElementById('term-3-start');
    const term3EndInput = document.getElementById('term-3-end');
    const term4StartInput = document.getElementById('term-4-start');
    const term4EndInput = document.getElementById('term-4-end');
    const btnSaveAcademicTerms = document.getElementById('btn-save-academic-terms');
    const academicTermsStatus = document.getElementById('academic-terms-status');

    const inputFirstname = document.getElementById('input-firstname');
    const inputLastname = document.getElementById('input-lastname');
    const roleText = document.getElementById('settings-role');
    const topbarProfilePhoto = document.getElementById('profileDropdownBtn');
    const settingsProfilePhoto = document.getElementById('settings-profile-photo');
    const profilePhotoInput = document.getElementById('profile-photo-input');
    const btnSavePhoto = document.getElementById('btn-save-photo');
    const photoStatus = document.getElementById('photo-status');
    const oldPasswordInput = document.getElementById('old-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const btnChangePassword = document.getElementById('btn-change-password');
    const passwordStatus = document.getElementById('password-status');
    const riotApiKeySection = document.getElementById('riot-api-key-section');
    const currentRiotApiKey = document.getElementById('current-riot-api-key');
    const riotApiKeyInput = document.getElementById('riot-api-key-input');
    const btnUpdateRiotApiKey = document.getElementById('btn-update-riot-api-key');
    const riotApiKeyStatus = document.getElementById('riot-api-key-status');
    const academicRequirementsSection = document.getElementById('academic-requirements-section');
    const gpaComparatorSelect = document.getElementById('gpa-comparator');
    const gpaThresholdInput = document.getElementById('gpa-threshold');
    const cgpaComparatorSelect = document.getElementById('cgpa-comparator');
    const cgpaThresholdInput = document.getElementById('cgpa-threshold');
    const btnSaveAcademicRequirements = document.getElementById('btn-save-academic-requirements');
    const academicRequirementsStatus = document.getElementById('academic-requirements-status');
    const teamSettingsSection = document.getElementById('team-settings-section');
    const teamNameInput = document.getElementById('team-name-input');
    const teamLogoInput = document.getElementById('team-logo-input');
    const teamLogoPreview = document.getElementById('team-logo-preview');
    const btnSaveTeamSettings = document.getElementById('btn-save-team-settings');
    const teamSettingsStatus = document.getElementById('team-settings-status');

    const schoolSettingsSection = document.getElementById('school-settings-section');
    const schoolNameInput       = document.getElementById('school-name-input');
    const schoolNameStatus      = document.getElementById('school-name-status');
    const schoolLogoInput       = document.getElementById('school-logo-input');
    const schoolLogoPreview     = document.getElementById('school-logo-preview');
    const schoolLogoStatus      = document.getElementById('school-logo-status');
    const btnSaveSchoolName     = document.getElementById('btn-save-school-name');
    const btnSaveSchoolLogo     = document.getElementById('btn-save-school-logo');

    // New Button Variables
    const editActionButtons = document.getElementById('edit-action-buttons');
    const btnSaveProfile = document.getElementById('btn-save-profile');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');

    // BENCHMARK VARIABLES
    const benchmarkSection = document.getElementById('coach-benchmark-section');
    const roleSelect = document.getElementById('roleSelect');
    const container = document.getElementById('benchmark-rows-container');
    const saveBtn = document.getElementById('saveBenchmarksBtn');
    let localPhotoPreviewUrl = '';

    function setStatus(el, message, isSuccess) {
        if (!el) return;
        el.textContent = message;
        el.classList.remove('success', 'error');
        el.classList.add(isSuccess ? 'success' : 'error');
    }

    function applyProfilePhoto(photoUrl) {
        if (!photoUrl) return;
        if (topbarProfilePhoto) topbarProfilePhoto.src = photoUrl;
        if (settingsProfilePhoto) settingsProfilePhoto.src = photoUrl;
    }

    function clearLocalPhotoPreview() {
        if (localPhotoPreviewUrl) {
            URL.revokeObjectURL(localPhotoPreviewUrl);
            localPhotoPreviewUrl = '';
        }
    }

    function applyTeamBranding(teamName, teamLogoUrl) {
        const resolvedTeamName = (teamName || '').trim() || 'Viridis Arcus';
        const resolvedTeamLogoUrl = (teamLogoUrl || '').trim() || '/uploads/team-logos/Team_Logo.png';

        document.querySelectorAll('.manager-team-name, .coach-team-name, .team-name').forEach((el) => {
            el.classList.add('js-team-identity');

            const existingDisplayName = el.textContent.trim() || 'Viridis Arcus';

            if (!el.querySelector('.js-team-logo-inline') && !el.querySelector('.js-team-name-text')) {
                el.textContent = '';
            }

            let logoEl = el.querySelector('.js-team-logo-inline');
            if (!logoEl) {
                logoEl = document.createElement('img');
                logoEl.className = 'js-team-logo-inline';
                logoEl.alt = 'Team Logo';
                el.prepend(logoEl);
            }

            let textEl = el.querySelector('.js-team-name-text');
            if (!textEl) {
                textEl = document.createElement('span');
                textEl.className = 'js-team-name-text';
                textEl.textContent = existingDisplayName;
                el.appendChild(textEl);
            }

            textEl.textContent = resolvedTeamName;
            logoEl.onerror = () => {
                logoEl.src = '/uploads/team-logos/Team_Logo.png';
            };
            logoEl.src = resolvedTeamLogoUrl;
        });
    }

    // Team Settings
    async function loadTeamSettings() {
        if (!teamSettingsSection) return;

        setStatus(teamSettingsStatus, 'Loading team settings...', true);

        try {
            const response = await fetch('/settings/api/team-details');
            const result = await response.json();

            if (!response.ok || !result.success) {
                setStatus(teamSettingsStatus, result.message || 'Failed to load team settings.', false);
                return;
            }

            if (teamNameInput) teamNameInput.value = result.teamName || 'Viridis Arcus';
            if (teamLogoPreview) teamLogoPreview.src = result.teamLogoUrl || '/uploads/team-logos/Team_Logo.png';
            applyTeamBranding(result.teamName, result.teamLogoUrl);

            setStatus(teamSettingsStatus, 'Team settings loaded.', true);
        } catch (error) {
            console.error('Failed to load team settings:', error);
            setStatus(teamSettingsStatus, 'Network error while loading team settings.', false);
        }
    }

    // School Settings
    async function loadSchoolSettings() {
        if (!schoolSettingsSection) return;
        try {
            const response = await fetch('/settings/api/all-team-details');
            const result   = await response.json();
            if (!result.success) return;

            if (schoolNameInput && result.schoolName) {
                schoolNameInput.value = result.schoolName;
            }
            if (schoolLogoPreview && result.schoolIconUrl) {
                schoolLogoPreview.src          = result.schoolIconUrl;
                schoolLogoPreview.style.display = 'block';
            }
        } catch (err) {
            console.error('Failed to load school settings:', err);
        }
    }

    function populateAcademicRequirements(requirements) {
        const gpaRequirement = requirements && requirements.gpa;
        const cgpaRequirement = requirements && requirements.cgpa;

        if (gpaComparatorSelect) {
            gpaComparatorSelect.value = (gpaRequirement && gpaRequirement.comparator) || '>=';
        }

        if (gpaThresholdInput) {
            gpaThresholdInput.value = gpaRequirement && gpaRequirement.threshold !== null
                ? Number(gpaRequirement.threshold).toFixed(2)
                : '';
        }

        if (cgpaComparatorSelect) {
            cgpaComparatorSelect.value = (cgpaRequirement && cgpaRequirement.comparator) || '>=';
        }

        if (cgpaThresholdInput) {
            cgpaThresholdInput.value = cgpaRequirement && cgpaRequirement.threshold !== null
                ? Number(cgpaRequirement.threshold).toFixed(2)
                : '';
        }
    }

    async function loadAcademicRequirements() {
        if (!academicRequirementsSection) return;

        setStatus(academicRequirementsStatus, 'Loading academic requirements...', true);

        try {
            const response = await fetch('/settings/api/academic-requirements');
            const result = await response.json();

            if (!response.ok || !result.success) {
                setStatus(academicRequirementsStatus, result.message || 'Failed to load academic requirements.', false);
                return;
            }

            populateAcademicRequirements(result.requirements);
            setStatus(academicRequirementsStatus, 'Academic requirements loaded.', true);
        } catch (error) {
            console.error('Failed to load academic requirements:', error);
            setStatus(academicRequirementsStatus, 'Network error while loading academic requirements.', false);
        }
    }

    async function loadRiotApiKeyStatus() {
        if (!currentRiotApiKey) return;

        currentRiotApiKey.textContent = 'Most recent Riot API key: Loading...';

        try {
            const response = await fetch('/settings/api/riot-api-key');
            const result = await response.json();

            if (!response.ok || !result.success) {
                currentRiotApiKey.textContent = 'Most recent Riot API key: Unavailable';
                setStatus(riotApiKeyStatus, result.message || 'Failed to load Riot API key status.', false);
                return;
            }

            currentRiotApiKey.textContent = `Most recent Riot API key: ${result.maskedKey}`;
            setStatus(riotApiKeyStatus, '', false);
        } catch (error) {
            console.error('Failed to load Riot API key status:', error);
            currentRiotApiKey.textContent = 'Most recent Riot API key: Unavailable';
            setStatus(riotApiKeyStatus, 'Network error while loading Riot API key status.', false);
        }
    }

    // --- DYNAMIC ACADEMIC TERMS ---
    function getAcademicTermCount(cadence) {
        if (cadence === 'semestral') return 2;
        if (cadence === 'quarterly') return 4;
        return 3;
    }

    function updateAcademicTermRows(cadence) {
        const termCount = getAcademicTermCount(cadence);
        const rowIds = ['term-1-row', 'term-2-row', 'term-3-row', 'term-4-row'];

        rowIds.forEach((rowId, index) => {
            const rowEl = document.getElementById(rowId);
            if (rowEl) {
                rowEl.style.display = index < termCount ? '' : 'none';
            }
        });
    }

    function populateAcademicTerms(terms, cadence = 'trisem') {
        const termMap = {};

        (terms || []).forEach((term) => {
            termMap[term.termName] = term;
        });

        if (academicTermCadenceSelect) {
            academicTermCadenceSelect.value = cadence || 'trisem';
        }

        updateAcademicTermRows(academicTermCadenceSelect?.value || cadence);

        if (term1StartInput) term1StartInput.value = termMap['Term 1']?.startDate || '';
        if (term1EndInput) term1EndInput.value = termMap['Term 1']?.endDate || '';

        if (term2StartInput) term2StartInput.value = termMap['Term 2']?.startDate || '';
        if (term2EndInput) term2EndInput.value = termMap['Term 2']?.endDate || '';

        if (term3StartInput) term3StartInput.value = termMap['Term 3']?.startDate || '';
        if (term3EndInput) term3EndInput.value = termMap['Term 3']?.endDate || '';

        if (term4StartInput) term4StartInput.value = termMap['Term 4']?.startDate || '';
        if (term4EndInput) term4EndInput.value = termMap['Term 4']?.endDate || '';
    }

    async function loadAcademicTerms() {
        if (!academicTermsSection) return;

        setStatus(academicTermsStatus, 'Loading academic terms...', true);

        try {
            const response = await fetch('/settings/api/academic-terms');
            const result = await response.json();

            if (!response.ok || !result.success) {
                setStatus(academicTermsStatus, result.message || 'Failed to load academic terms.', false);
                return;
            }

            const cadence = result.cadence || (result.terms?.length <= 2 ? 'semestral' : result.terms?.length >= 4 ? 'quarterly' : 'trisem');
            populateAcademicTerms(result.terms, cadence);
            setStatus(academicTermsStatus, 'Academic terms loaded.', true);
        } catch (error) {
            console.error('Failed to load academic terms:', error);
            setStatus(academicTermsStatus, 'Network error while loading academic terms.', false);
        }
    }

    // --- FETCH USER PROFILE ---
    try {
        const profileRes = await fetch('/api/user/profile');

        if (profileRes.ok) {
            const userData = await profileRes.json();

            // Populate BOTH the display text and the hidden inputs
            if (userData.firstname && userData.lastname) {
                nameText.textContent = `${userData.firstname} ${userData.lastname}`;
                inputFirstname.value = userData.firstname;
                inputLastname.value = userData.lastname;
            } else if (userData.name) {
                nameText.textContent = userData.name;
            }

            const userRole = userData.position || userData.role;

            if (userRole === 'Team Manager' && teamSettingsSection) {
                teamSettingsSection.style.display = 'block';
                loadTeamSettings();

                // School settings (also manager-only)
                if (schoolSettingsSection) {
                    schoolSettingsSection.style.display = 'block';
                    loadSchoolSettings(); // defined below
                }
            }

            if (roleText) roleText.textContent = `Role: ${userRole || "Unassigned"}`;
            applyProfilePhoto(userData.profilePhotoUrl || '/uploads/profile-photos/defaultusericon.png');

            if ((userRole === 'Team Manager' || userRole === 'Team Coach') && riotApiKeySection) {
                riotApiKeySection.style.display = 'block';
                loadRiotApiKeyStatus();
            }

            if ((userRole === 'Team Manager' || userRole === 'Team Coach') && academicTermsSection) {
                academicTermsSection.style.display = 'block';
                loadAcademicTerms();
            }

            if (userRole === 'Team Manager' && teamSettingsSection) {
                teamSettingsSection.style.display = 'block';
                loadTeamSettings();
            }

            // Reveal the benchmark section ONLY if they are the Team Coach
            if (userRole === 'Team Coach' && benchmarkSection) {
                benchmarkSection.style.display = 'block';
                if (academicRequirementsSection) {
                    academicRequirementsSection.style.display = 'block';
                    loadAcademicRequirements();
                }
                if (roleSelect) {
                    loadBenchmarksForRole(roleSelect.value); // Load default immediately
                }
            }
        } else {
            console.error("Failed to load profile status:", profileRes.status);
            if (roleText) roleText.textContent = "Role: ---";
        }
    } catch (error) {
        console.error("Network error fetching profile:", error);
    }

    if (academicTermCadenceSelect) {
        academicTermCadenceSelect.addEventListener('change', () => {
            updateAcademicTermRows(academicTermCadenceSelect.value);
        });
    }

    if (btnSaveAcademicTerms) {
        btnSaveAcademicTerms.addEventListener('click', async () => {
            const cadence = academicTermCadenceSelect?.value || 'trisem';
            const termCount = getAcademicTermCount(cadence);
            const terms = [];

            for (let index = 1; index <= termCount; index += 1) {
                const startInput = document.getElementById(`term-${index}-start`);
                const endInput = document.getElementById(`term-${index}-end`);

                if (!startInput || !endInput) continue;
                if (!startInput.value || !endInput.value) {
                    setStatus(academicTermsStatus, `Please complete the dates for Term ${index}.`, false);
                    return;
                }

                terms.push({
                    termName: `Term ${index}`,
                    startDate: startInput.value,
                    endDate: endInput.value
                });
            }

            btnSaveAcademicTerms.disabled = true;
            btnSaveAcademicTerms.textContent = 'Saving...';
            setStatus(academicTermsStatus, 'Saving academic terms...', true);

            try {
                const response = await fetch('/settings/api/academic-terms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cadence, terms })
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Failed to save academic terms.');
                }

                populateAcademicTerms(result.terms, result.cadence || cadence);
                setStatus(academicTermsStatus, 'Academic terms updated successfully.', true);
            } catch (error) {
                console.error('Failed to save academic terms:', error);
                setStatus(academicTermsStatus, error.message || 'Network error while saving academic terms.', false);
            } finally {
                btnSaveAcademicTerms.disabled = false;
                btnSaveAcademicTerms.textContent = 'Save Academic Terms';
            }
        });
    }

    // --- CLICK TO EDIT LOGIC ---
    if (nameText) {
        nameText.addEventListener('click', () => {
            nameDisplayMode.style.display = 'none';
            nameEditMode.style.display = 'flex';
            editActionButtons.style.display = 'flex';
            inputFirstname.focus();
        });
    }

    // --- CANCEL EDIT LOGIC ---
    if (btnCancelEdit) {
        btnCancelEdit.addEventListener('click', () => {
            // Revert the input boxes back to whatever the current saved name is
            const currentNames = nameText.textContent.split(' ');
            if (currentNames.length >= 2) {
                inputFirstname.value = currentNames[0];
                inputLastname.value = currentNames.slice(1).join(' '); // Handles multi-word last names
            }

            // Swap back to Display Mode
            nameEditMode.style.display = 'none';
            editActionButtons.style.display = 'none';
            nameDisplayMode.style.display = 'block';
        });
    }

    // --- DROPDOWN LISTENER ---
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            loadBenchmarksForRole(e.target.value);
        });
    }

    // --- FETCH & RENDER DATA ---
    async function loadBenchmarksForRole(roleId) {
        if (!container) return;

        container.innerHTML = '<p style="grid-column: span 3; color: #666;">Loading metrics...</p>';
        try {
            const res = await fetch(`/settings/api/benchmarks/${roleId}`);
            const data = await res.json();

            if (data.success && data.benchmarks.length > 0) {
                let html = '';

                const compOptions = [
                    { val: '>=', text: '≥ (greater than or equal to)' },
                    { val: '<=', text: '≤ (lesser than or equal to)' },
                    { val: '>', text: '> (greater than)' },
                    { val: '<', text: '< (lesser than)' }
                ];

                data.benchmarks.forEach(b => {
                    let selectHtml = `<select class="comparator-select" data-metric="${b.metricId}">`;
                    compOptions.forEach(opt => {
                        const isSelected = (b.comparator === opt.val) ? 'selected' : '';
                        selectHtml += `<option value="${opt.val}" ${isSelected}>${opt.text}</option>`;
                    });
                    selectHtml += `</select>`;

                    html += `
                        <div class="metric-row">
                            <div class="metric-name" title="${b.metricDescription || ''}">${b.metricName}</div>
                            <div>${selectHtml}</div>
                            <div>
                                <input type="number" step="0.01" class="value-input" 
                                       data-metric="${b.metricId}" 
                                       value="${b.benchmarkValue !== null ? b.benchmarkValue : ''}" 
                                       placeholder="0.00">
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = html;
            } else {
                container.innerHTML = '<p style="grid-column: span 3; color: #666;">No metrics assigned to this role yet.</p>';
            }
        } catch (error) {
            console.error('Error loading benchmarks:', error);
            container.innerHTML = '<p style="grid-column: span 3; color: red;">Failed to load metrics.</p>';
        }
    }

    // --- SAVE CHANGES ---
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const roleId = roleSelect.value;
            const rows = document.querySelectorAll('.metric-row');
            const updates = [];

            rows.forEach(row => {
                const select = row.querySelector('.comparator-select');
                const input = row.querySelector('.value-input');

                if (select && input && input.value !== '') {
                    updates.push({
                        metricId: select.getAttribute('data-metric'),
                        comparator: select.value,
                        value: parseFloat(input.value)
                    });
                }
            });

            if (updates.length === 0) {
                alert("No values to save!");
                return;
            }

            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            try {
                const res = await fetch('/settings/api/benchmarks/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roleId, updates })
                });

                const data = await res.json();
                if (data.success) {
                    saveBtn.textContent = 'Saved!';
                    saveBtn.style.background = '#28a745';
                    setTimeout(() => {
                        saveBtn.textContent = 'Confirm Changes';
                        saveBtn.style.background = '#111';
                        saveBtn.disabled = false;
                    }, 2000);
                } else {
                    alert('Error saving benchmarks: ' + data.message);
                    saveBtn.textContent = 'Confirm Changes';
                    saveBtn.disabled = false;
                }
            } catch (error) {
                console.error('Save failed:', error);
                alert('Network error while saving.');
                saveBtn.textContent = 'Confirm Changes';
                saveBtn.disabled = false;
            }
        });
    }

    // --- SAVE PROFILE (NAME UPDATE) ---
    if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', async () => {
            const firstname = inputFirstname ? inputFirstname.value.trim() : '';
            const lastname = inputLastname ? inputLastname.value.trim() : '';

            if (!firstname || !lastname) {
                return alert("Please fill out both your first and last name.");
            }

            btnSaveProfile.textContent = "Saving...";
            btnSaveProfile.disabled = true;

            try {
                const response = await fetch('/api/v1/users/update-name', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstname, lastname })
                });

                const result = await response.json();

                if (result.success) {
                    // Instantly update the display text with the new names
                    nameText.textContent = `${firstname} ${lastname}`;

                    // Swap back to Display Mode
                    nameEditMode.style.display = 'none';
                    editActionButtons.style.display = 'none';
                    nameDisplayMode.style.display = 'block';

                    // Show a quick success message on the button before hiding it
                    alert("Profile updated successfully!");
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error("Failed to update name:", error);
                alert("A server error occurred while saving.");
            } finally {
                btnSaveProfile.textContent = "Save Profile";
                btnSaveProfile.disabled = false;
            }
        });
    }

    // --- CHANGE PROFILE PHOTO ---
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', () => {
            const hasFile = profilePhotoInput.files && profilePhotoInput.files.length;
            if (!hasFile) {
                clearLocalPhotoPreview();
                return;
            }

            const file = profilePhotoInput.files[0];
            const allowedMimeTypes = ['image/png', 'image/jpeg'];
            if (!allowedMimeTypes.includes(file.type)) {
                setStatus(photoStatus, 'Only PNG and JPEG files are allowed.', false);
                profilePhotoInput.value = '';
                clearLocalPhotoPreview();
                return;
            }

            clearLocalPhotoPreview();
            localPhotoPreviewUrl = URL.createObjectURL(file);

            if (settingsProfilePhoto) {
                settingsProfilePhoto.src = localPhotoPreviewUrl;
            }

            setStatus(photoStatus, 'Preview ready. Click "Change Profile Photo" to save.', true);
        });
    }

    if (btnSavePhoto) {
        btnSavePhoto.addEventListener('click', async () => {
            if (!profilePhotoInput || !profilePhotoInput.files || !profilePhotoInput.files.length) {
                setStatus(photoStatus, 'Please select a PNG or JPEG file.', false);
                return;
            }

            const file = profilePhotoInput.files[0];
            const formData = new FormData();
            formData.append('profilePhoto', file);

            btnSavePhoto.disabled = true;
            btnSavePhoto.textContent = 'Uploading...';
            setStatus(photoStatus, '', false);

            try {
                const response = await fetch('/settings/api/profile/photo', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    setStatus(photoStatus, result.message || 'Failed to update profile photo.', false);
                    return;
                }

                applyProfilePhoto(result.profilePhotoUrl);
                profilePhotoInput.value = '';
                clearLocalPhotoPreview();
                setStatus(photoStatus, 'Profile photo updated successfully.', true);
            } catch (error) {
                console.error('Failed to upload profile photo:', error);
                setStatus(photoStatus, 'Network error while uploading profile photo.', false);
            } finally {
                btnSavePhoto.disabled = false;
                btnSavePhoto.textContent = 'Change Profile Photo';
            }
        });
    }

    // --- CHANGE PASSWORD ---
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', async () => {
            const oldPassword = oldPasswordInput ? oldPasswordInput.value : '';
            const newPassword = newPasswordInput ? newPasswordInput.value : '';
            const confirmNewPassword = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';

            if (!oldPassword || !newPassword || !confirmNewPassword) {
                setStatus(passwordStatus, 'Please complete all password fields.', false);
                return;
            }

            btnChangePassword.disabled = true;
            btnChangePassword.textContent = 'Updating...';
            setStatus(passwordStatus, '', false);

            try {
                const response = await fetch('/settings/api/profile/password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword, newPassword, confirmNewPassword })
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    setStatus(passwordStatus, result.message || 'Failed to update password.', false);
                    return;
                }

                oldPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
                setStatus(passwordStatus, 'Password updated successfully.', true);
            } catch (error) {
                console.error('Failed to update password:', error);
                setStatus(passwordStatus, 'Network error while updating password.', false);
            } finally {
                btnChangePassword.disabled = false;
                btnChangePassword.textContent = 'Update Password';
            }
        });
    }

    if (btnUpdateRiotApiKey) {
        btnUpdateRiotApiKey.addEventListener('click', async () => {
            const apiKey = riotApiKeyInput ? riotApiKeyInput.value.trim() : '';

            if (!apiKey) {
                setStatus(riotApiKeyStatus, 'Please enter a Riot API key.', false);
                return;
            }

            btnUpdateRiotApiKey.disabled = true;
            btnUpdateRiotApiKey.textContent = 'Updating...';
            setStatus(riotApiKeyStatus, '', false);

            try {
                const response = await fetch('/settings/api/riot-api-key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey })
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    setStatus(riotApiKeyStatus, result.message || 'Failed to update Riot API key.', false);
                    return;
                }

                if (currentRiotApiKey) {
                    currentRiotApiKey.textContent = `Most recent Riot API key: ${result.maskedKey}`;
                }

                if (riotApiKeyInput) {
                    riotApiKeyInput.value = '';
                }

                setStatus(riotApiKeyStatus, 'Riot API key updated successfully.', true);
            } catch (error) {
                console.error('Failed to update Riot API key:', error);
                setStatus(riotApiKeyStatus, 'Network error while updating Riot API key.', false);
            } finally {
                btnUpdateRiotApiKey.disabled = false;
                btnUpdateRiotApiKey.textContent = 'Confirm';
            }
        });
    }

    if (btnSaveTeamSettings) {
        btnSaveTeamSettings.addEventListener('click', async () => {
            const requestedTeamName = teamNameInput ? teamNameInput.value.trim() : '';
            const selectedLogo = teamLogoInput && teamLogoInput.files && teamLogoInput.files.length
                ? teamLogoInput.files[0]
                : null;

            if (!requestedTeamName && !selectedLogo) {
                setStatus(teamSettingsStatus, 'Update the team name or select a logo before saving.', false);
                return;
            }

            const formData = new FormData();
            if (requestedTeamName) {
                formData.append('teamName', requestedTeamName);
            }
            if (selectedLogo) {
                formData.append('teamLogo', selectedLogo);
            }

            btnSaveTeamSettings.disabled = true;
            btnSaveTeamSettings.textContent = 'Saving...';
            setStatus(teamSettingsStatus, '', false);

            try {
                const response = await fetch('/settings/api/team-details', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    setStatus(teamSettingsStatus, result.message || 'Failed to update team settings.', false);
                    return;
                }

                if (teamNameInput) teamNameInput.value = result.teamName || 'Viridis Arcus';
                if (teamLogoPreview) teamLogoPreview.src = result.teamLogoUrl || '/uploads/team-logos/Team_Logo.png';
                if (teamLogoInput) teamLogoInput.value = '';

                applyTeamBranding(result.teamName, result.teamLogoUrl);
                setStatus(teamSettingsStatus, 'Team settings updated successfully.', true);
            } catch (error) {
                console.error('Failed to update team settings:', error);
                setStatus(teamSettingsStatus, 'Network error while saving team settings.', false);
            } finally {
                btnSaveTeamSettings.disabled = false;
                btnSaveTeamSettings.textContent = 'Save Team Settings';
            }
        });
    }

    if (btnSaveAcademicRequirements) {
        btnSaveAcademicRequirements.addEventListener('click', async () => {
            const requirements = {
                gpa: {
                    comparator: gpaComparatorSelect ? gpaComparatorSelect.value : '>=',
                    threshold: gpaThresholdInput ? gpaThresholdInput.value.trim() : ''
                },
                cgpa: {
                    comparator: cgpaComparatorSelect ? cgpaComparatorSelect.value : '>=',
                    threshold: cgpaThresholdInput ? cgpaThresholdInput.value.trim() : ''
                }
            };

            btnSaveAcademicRequirements.disabled = true;
            btnSaveAcademicRequirements.textContent = 'Saving...';
            setStatus(academicRequirementsStatus, '', false);

            try {
                const response = await fetch('/settings/api/academic-requirements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requirements })
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    setStatus(academicRequirementsStatus, result.message || 'Failed to save academic requirements.', false);
                    return;
                }

                populateAcademicRequirements(result.requirements);
                setStatus(academicRequirementsStatus, 'Academic requirements updated successfully.', true);
            } catch (error) {
                console.error('Failed to update academic requirements:', error);
                setStatus(academicRequirementsStatus, 'Network error while saving academic requirements.', false);
            } finally {
                btnSaveAcademicRequirements.disabled = false;
                btnSaveAcademicRequirements.textContent = 'Save Academic Requirements';
            }
        });
    }

    // Save School Settings
    if (btnSaveSchoolName) {
        btnSaveSchoolName.addEventListener('click', async () => {
            const schoolName = schoolNameInput ? schoolNameInput.value.trim() : '';
            if (!schoolName) {
                setStatus(schoolNameStatus, 'Please enter a school name.', false);
                return;
            }

            btnSaveSchoolName.disabled     = true;
            btnSaveSchoolName.textContent  = 'Saving...';
            setStatus(schoolNameStatus, '', false);

            try {
                const response = await fetch('/settings/api/school/name', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ schoolName })
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    setStatus(schoolNameStatus, result.message || 'Failed to update school name.', false);
                    return;
                }
                setStatus(schoolNameStatus, 'School name updated successfully.', true);
            } catch (err) {
                console.error('Failed to update school name:', err);
                setStatus(schoolNameStatus, 'Network error while saving school name.', false);
            } finally {
                btnSaveSchoolName.disabled    = false;
                btnSaveSchoolName.textContent = 'Save School Name';
            }
        });
    }

    if (btnSaveSchoolLogo) {
        btnSaveSchoolLogo.addEventListener('click', async () => {
            const file = schoolLogoInput && schoolLogoInput.files && schoolLogoInput.files[0];
            if (!file) {
                setStatus(schoolLogoStatus, 'Please select an image file.', false);
                return;
            }

            const formData = new FormData();
            formData.append('schoolIcon', file);

            btnSaveSchoolLogo.disabled    = true;
            btnSaveSchoolLogo.textContent = 'Uploading...';
            setStatus(schoolLogoStatus, '', false);

            try {
                const response = await fetch('/settings/api/school/icon', {
                    method: 'POST',
                    body:   formData
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    setStatus(schoolLogoStatus, result.message || 'Failed to update school logo.', false);
                    return;
                }

                if (schoolLogoPreview && result.schoolIconUrl) {
                    schoolLogoPreview.src          = result.schoolIconUrl;
                    schoolLogoPreview.style.display = 'block';
                }
                if (schoolLogoInput) schoolLogoInput.value = '';
                setStatus(schoolLogoStatus, 'School logo updated successfully.', true);
            } catch (err) {
                console.error('Failed to update school logo:', err);
                setStatus(schoolLogoStatus, 'Network error while uploading school logo.', false);
            } finally {
                btnSaveSchoolLogo.disabled    = false;
                btnSaveSchoolLogo.textContent = 'Save School Logo';
            }
        });
    }

    // --- STAT DISPLAY PREFERENCES ---
    const btnSaveStatsToggles = document.getElementById('btn-save-stats-toggles');
    const statsToggleStatus = document.getElementById('stats-toggle-status');

    // 1. Load preferences on page load
    async function loadStatPreferences() {
        try {
            const response = await fetch('/settings/api/display-preferences');
            const result = await response.json();
            
            if (result.success && result.preferences) {
                document.getElementById('toggle-kda').checked = result.preferences.show_kda ?? true;
                document.getElementById('toggle-farm').checked = result.preferences.show_farm ?? true;
                document.getElementById('toggle-vision').checked = result.preferences.show_vision ?? true;
                document.getElementById('toggle-damage').checked = result.preferences.show_damage ?? true;
            }
        } catch (error) {
            console.error('Failed to load stat preferences:', error);
        }
    }
    
    // Call this immediately to populate the checkboxes
    loadStatPreferences();

    // 2. Save preferences on click
    if (btnSaveStatsToggles) {
        btnSaveStatsToggles.addEventListener('click', async () => {
            const preferences = {
                show_kda: document.getElementById('toggle-kda').checked,
                show_farm: document.getElementById('toggle-farm').checked,
                show_vision: document.getElementById('toggle-vision').checked,
                show_damage: document.getElementById('toggle-damage').checked
            };

            btnSaveStatsToggles.disabled = true;
            btnSaveStatsToggles.textContent = 'Saving...';
            setStatus(statsToggleStatus, '', false);

            try {
                const response = await fetch('/settings/api/display-preferences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ preferences })
                });

                const result = await response.json();
                if (result.success) {
                    setStatus(statsToggleStatus, 'Preferences saved successfully.', true);
                } else {
                    setStatus(statsToggleStatus, result.message || 'Failed to save preferences.', false);
                }
            } catch (error) {
                setStatus(statsToggleStatus, 'Network error while saving.', false);
            } finally {
                btnSaveStatsToggles.disabled = false;
                btnSaveStatsToggles.textContent = 'Save Preferences';
            }
        });
    }

});