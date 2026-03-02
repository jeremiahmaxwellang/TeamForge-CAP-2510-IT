// Team Management Frontend
// Handles user listing, filtering, and selection

let allUsers = [];
let currentFilter = 'all';
let selectedUsers = new Set();

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadUsers('all');
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');

    filterBtn.addEventListener('click', () => {
        filterDropdown.style.display = filterDropdown.style.display === 'none' ? 'block' : 'none';
    });

    // Filter options
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            filterBtn.textContent = `Filter: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
            filterDropdown.style.display = 'none';
            currentFilter = filter;
            selectedUsers.clear();
            document.getElementById('selectAllCheckbox').checked = false;
            loadUsers(filter);
        });
    });

    // Select All Checkbox
    document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
            const userId = checkbox.dataset.userId;
            if (isChecked) {
                selectedUsers.add(userId);
            } else {
                selectedUsers.delete(userId);
            }
        });
    });

    // Action buttons
    document.getElementById('editUserBtn').addEventListener('click', () => {
        if (selectedUsers.size === 0) {
            alert('Please select a user to edit');
            return;
        }
        console.log('Edit user clicked. Selected users:', Array.from(selectedUsers));
        // Implementation coming soon
    });

    document.getElementById('deactivateBtn').addEventListener('click', () => {
        if (selectedUsers.size === 0) {
            alert('Please select at least one user to deactivate');
            return;
        }
        deactivateSelectedUsers();
    });

    document.getElementById('addUserBtn').addEventListener('click', () => {
        console.log('Add user clicked');
        // Implementation coming soon
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const filterDropdown = document.getElementById('filterDropdown');
        const filterBtn = document.getElementById('filterBtn');
        if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
            filterDropdown.style.display = 'none';
        }
    });
}

// Load users from API
async function loadUsers(status) {
    try {
        let url;
        if (status === 'all') {
            url = '/team_management/api/users';
        } else {
            url = `/team_management/api/users/status/${status}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.success || result.data) {
            allUsers = result.data;
            renderUsersTable(allUsers);
        } else {
            allUsers = [];
            renderUsersTable([]);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error loading users. Please try again.');
    }
}

// Render users in table
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    const noUsersMessage = document.getElementById('noUsersMessage');

    tbody.innerHTML = '';

    if (users.length === 0) {
        noUsersMessage.style.display = 'block';
        return;
    }

    noUsersMessage.style.display = 'none';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="checkbox-col">
                <input type="checkbox" class="user-checkbox" data-userId="${user.userId}">
            </td>
            <td>${user.firstname} ${user.lastname}</td>
            <td>${user.riotId}</td>
            <td>${user.position}</td>
            <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${user.email}</td>
            <td>${user.teamId}</td>
        `;

        tbody.appendChild(row);

        // Add checkbox event listener
        row.querySelector('.user-checkbox').addEventListener('change', (e) => {
            const userId = e.target.dataset.userId;
            if (e.target.checked) {
                selectedUsers.add(userId);
            } else {
                selectedUsers.delete(userId);
                document.getElementById('selectAllCheckbox').checked = false;
            }
        });
    });
}

// Deactivate selected users
async function deactivateSelectedUsers() {
    const userIds = Array.from(selectedUsers);

    if (userIds.length === 0) {
        alert('Please select at least one user');
        return;
    }

    if (!confirm(`Are you sure you want to deactivate ${userIds.length} user(s)?`)) {
        return;
    }

    try {
        const response = await fetch('/team_management/api/deactivate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userIds: userIds })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            selectedUsers.clear();
            document.getElementById('selectAllCheckbox').checked = false;
            loadUsers(currentFilter);
        } else {
            alert('Error deactivating users');
        }
    } catch (error) {
        console.error('Error deactivating users:', error);
        alert('Error deactivating users. Please try again.');
    }
}
