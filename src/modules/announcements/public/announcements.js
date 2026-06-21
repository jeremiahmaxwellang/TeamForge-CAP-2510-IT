document.addEventListener("DOMContentLoaded", async function () {
    const listContainer = document.getElementById('announcement-list');
    const modal = document.getElementById('announcement-modal');
    const btnAddNew = document.querySelector('.btn-add-new');
    const btnCancel = document.getElementById('btn-cancel-ann');
    const btnSubmit = document.getElementById('btn-submit-ann');
    let canCreateAnnouncements = false;

    async function loadPermissions() {
        try {
            const response = await fetch('/api/current-role');
            const data = await response.json();
            canCreateAnnouncements = data.success && ['Team Manager', 'Team Coach'].includes(data.role);
        } catch (error) {
            console.error('Error loading announcement permissions:', error);
            canCreateAnnouncements = false;
        }

        if (btnAddNew) {
            btnAddNew.style.display = canCreateAnnouncements ? 'inline-block' : 'none';
        }
    }

    async function fetchAnnouncements() {
        try {
            listContainer.innerHTML = '<div>Loading announcements...</div>';
            
            const response = await fetch('/announcements/api/getall');
            const data = await response.json();

            if (data.success && data.announcements.length > 0) {
                listContainer.innerHTML = ''; // Clear loading text
                
                data.announcements.forEach((ann, index) => {
                    // Format the date nicely
                    const dateObj = new Date(ann.dateCreated);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                    const div = document.createElement('div');
                    div.className = 'announcement-item';
                    div.innerHTML = `
                        <h3 class="announcement-title" 
                            data-title="${ann.title.replace(/"/g, '&quot;')}" 
                            data-meta="Posted by ${ann.firstname} ${ann.lastname} on ${formattedDate}" 
                                    data-content="${ann.content.replace(/"/g, '&quot;')}">${ann.title}</h3>
                                    <small style="color: #666;">Posted by ${ann.firstname} ${ann.lastname} on ${formattedDate}</small>
                                    <p class="announcement-body" style="margin-top: 5px;">${ann.content}</p>
                                    ${ann.isAuthor ? `
                                        <div class="ann-actions" style="margin-top:8px; position: relative;">
                                            <button class="ann-menu-btn" data-id="${ann.announcementId}" aria-haspopup="true" aria-expanded="false">⋯</button>
                                            <div class="ann-menu" data-id="${ann.announcementId}" style="display:none; position: absolute; right: 0; top: 28px;">
                                                <button class="ann-menu-item btn-edit-ann" data-id="${ann.announcementId}">Edit</button>
                                                <button class="ann-menu-item btn-delete-ann" data-id="${ann.announcementId}">Delete</button>
                                            </div>
                                        </div>
                                    ` : ''}
                    `;
                    listContainer.appendChild(div);

                                // Attach edit/delete listeners for this item if the current user is the author
                                if (ann.isAuthor) {
                                    const menuBtn = div.querySelector('.ann-menu-btn');
                                    const menu = div.querySelector('.ann-menu');
                                    const editBtn = div.querySelector('.btn-edit-ann');
                                    const delBtn = div.querySelector('.btn-delete-ann');

                                    if (menuBtn && menu) {
                                        menuBtn.addEventListener('click', (ev) => {
                                            ev.stopPropagation();
                                            const isOpen = menu.style.display === 'block';
                                            // Close any other open menus first
                                            document.querySelectorAll('.ann-menu').forEach(m => { if (m !== menu) m.style.display = 'none'; });
                                            menu.style.display = isOpen ? 'none' : 'block';
                                        });
                                    }

                                    if (editBtn) {
                                        editBtn.addEventListener('click', (ev) => {
                                            ev.stopPropagation();
                                            const id = editBtn.getAttribute('data-id');
                                            document.getElementById('editing-ann-id').value = id;
                                            document.getElementById('new-ann-title').value = ann.title;
                                            document.getElementById('new-ann-content').value = ann.content;
                                            document.getElementById('ann-modal-title').textContent = 'Edit Announcement';
                                            btnSubmit.textContent = 'Save Changes';
                                            modal.style.display = 'flex';
                                            // close menu
                                            if (menu) menu.style.display = 'none';
                                        });
                                    }

                                    if (delBtn) {
                                        delBtn.addEventListener('click', async (ev) => {
                                            ev.stopPropagation();
                                            const id = delBtn.getAttribute('data-id');
                                            if (!confirm('Are you sure you want to delete this announcement?')) return;
                                            try {
                                                const resp = await fetch(`/announcements/api/delete/${id}`, { method: 'DELETE' });
                                                    let resData;
                                                    const contentType = resp.headers.get('Content-Type') || '';
                                                    if (contentType.includes('application/json')) {
                                                        resData = await resp.json();
                                                    } else {
                                                        throw new Error('Server did not return JSON for delete response.');
                                                    }
                                                if (resData.success) {
                                                    fetchAnnouncements();
                                                } else {
                                                    alert('Failed to delete announcement: ' + resData.message);
                                                }
                                            } catch (err) {
                                                console.error('Error deleting announcement:', err);
                                                alert('Failed to delete announcement. See console.');
                                            }
                                        });
                                    }
                                }
                });
                
                // Attach click listeners to the new titles
                document.querySelectorAll('.announcement-title').forEach(titleEl => {
                    titleEl.addEventListener('click', (e) => {
                        document.getElementById('view-ann-title').textContent = e.target.getAttribute('data-title');
                        document.getElementById('view-ann-meta').textContent = e.target.getAttribute('data-meta');
                        document.getElementById('view-ann-content').textContent = e.target.getAttribute('data-content');
                        document.getElementById('view-announcement-modal').style.display = 'flex';
                    });
                });
            } else {
                listContainer.innerHTML = '<div>No announcements posted yet.</div>';
            }
        } catch (error) {
            console.error("Error loading announcements:", error);
            listContainer.innerHTML = '<div style="color: red;">Failed to load announcements.</div>';
        }
    }

    await loadPermissions();
    fetchAnnouncements();

    // Open Modal
    if(btnAddNew) {
        btnAddNew.addEventListener('click', () => {
            if (!canCreateAnnouncements) {
                return;
            }

            modal.style.display = 'flex';
        });
    }

    // Close Modal & Clear Inputs
    if(btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.style.display = 'none';
            document.getElementById('new-ann-title').value = '';
            document.getElementById('new-ann-content').value = '';
        });
    }

    // Submit Data
    if(btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            if (!canCreateAnnouncements) {
                alert('You do not have permission to post announcements.');
                return;
            }

            const title = document.getElementById('new-ann-title').value.trim();
            const content = document.getElementById('new-ann-content').value.trim();
            const editingId = document.getElementById('editing-ann-id').value;

            if (!title || !content) {
                alert("Please fill in both the title and the message.");
                return;
            }

            try {
                const payload = { title: title, content: content };

                let response, data;
                if (editingId) {
                    // Update existing announcement
                    response = await fetch(`/announcements/api/update/${editingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Create new announcement
                    response = await fetch('/announcements/api/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                data = await response.json();

                if (data.success) {
                    modal.style.display = 'none';
                    document.getElementById('new-ann-title').value = '';
                    document.getElementById('new-ann-content').value = '';
                    document.getElementById('editing-ann-id').value = '';
                    document.getElementById('ann-modal-title').textContent = 'Create New Announcement';
                    btnSubmit.textContent = 'Post Announcement';
                    fetchAnnouncements(); 
                } else {
                    alert("Failed to save announcement: " + data.message);
                }
            } catch (error) {
                console.error("Error saving announcement:", error);
                alert("Database connection error. Check your console.");
            }
        });
    }

    // View Announcement Modal Close Logic
    const btnCloseView = document.getElementById('btn-close-view');
    if(btnCloseView) {
        btnCloseView.addEventListener('click', () => {
            document.getElementById('view-announcement-modal').style.display = 'none';
        });
    }

    // Close any open action menus when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.ann-menu').forEach(menu => menu.style.display = 'none');
    });
});