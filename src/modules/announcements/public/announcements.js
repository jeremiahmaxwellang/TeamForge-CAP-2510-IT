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
                    `;
                    listContainer.appendChild(div);
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

            if (!title || !content) {
                alert("Please fill in both the title and the message.");
                return;
            }

            try {
                const payload = { title: title, content: content };
                
                const response = await fetch('/announcements/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    modal.style.display = 'none';
                    document.getElementById('new-ann-title').value = '';
                    document.getElementById('new-ann-content').value = '';
                    
                    fetchAnnouncements(); 
                } else {
                    alert("Failed to post announcement: " + data.message);
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
});