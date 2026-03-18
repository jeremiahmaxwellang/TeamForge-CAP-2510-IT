document.addEventListener('DOMContentLoaded', async () => {
    
    // --- UI ELEMENTS ---
    const nameDisplayMode = document.getElementById('name-display-mode');
    const nameEditMode = document.getElementById('name-edit-mode');
    const nameText = document.getElementById('settings-name');
    
    const inputFirstname = document.getElementById('input-firstname');
    const inputLastname = document.getElementById('input-lastname');
    const roleText = document.getElementById('settings-role');
    
    // New Button Variables
    const editActionButtons = document.getElementById('edit-action-buttons');
    const btnSaveProfile = document.getElementById('btn-save-profile');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');

    // RESTORED BENCHMARK VARIABLES
    const benchmarkSection = document.getElementById('coach-benchmark-section');
    const roleSelect = document.getElementById('roleSelect');
    const container = document.getElementById('benchmark-rows-container');
    const saveBtn = document.getElementById('saveBenchmarksBtn');

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
            if (roleText) roleText.textContent = `Role: ${userRole || "Unassigned"}`;

            // Reveal the benchmark section ONLY if they are the Team Coach
            if (userRole === 'Team Coach' && benchmarkSection) {
                benchmarkSection.style.display = 'block'; 
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

    // --- CLICK TO EDIT LOGIC ---
    if (nameText) {
        nameText.addEventListener('click', () => {
            nameDisplayMode.style.display = 'none';
            nameEditMode.style.display = 'flex';
            editActionButtons.style.display = 'flex'; // Show the button container
            inputFirstname.focus(); // Automatically put their cursor in the first name box
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

    // --- CLICK TO EDIT LOGIC ---
    if (nameText) {
        nameText.addEventListener('click', () => {
            nameDisplayMode.style.display = 'none';
            nameEditMode.style.display = 'flex';
            btnSaveProfile.style.display = 'block';
            inputFirstname.focus(); // Automatically put their cursor in the first name box
        });
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
});