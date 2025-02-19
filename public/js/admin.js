document.addEventListener('DOMContentLoaded', () => {
    fetchUsers(); // Fetch users when the page loads
});

// Fetch users from the backend
async function fetchUsers() {
    const response = await fetch('http://localhost:4455/users');
    const users = await response.json();
    populateUserTable(users);
}

// Populate the user table with fetched users
function populateUserTable(users) {
    const tableBody = document.querySelector('#userTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td>${user.isAdmin ? 'Admin' : 'User'}</td>
            <td><button onclick="editUser('${user.username}')">Edit</button></td>
            <td><button onclick="deleteUser('${user.username}')">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Add a new user
async function addUser() {
    const newUser = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        name: document.getElementById('newName').value,
        isAdmin: document.getElementById('isAdmin').checked
    };

    const response = await fetch('http://localhost:4455/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    });

    if (response.ok) {
        fetchUsers(); // Reload users after adding a new one
    }
}

// Edit a user
async function editUser(username) {
    const newUsername = prompt("Enter new username:", username);
    const newPassword = prompt("Enter new password:");
    const newName = prompt("Enter new name:");
    const isAdmin = confirm("Is this user an admin?");

    const updatedUser = {
        username: newUsername,
        password: newPassword,
        name: newName,
        isAdmin: isAdmin
    };

    const response = await fetch(`http://localhost:4455/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
    });

    if (response.ok) {
        fetchUsers(); // Reload users after editing
    }
}

// Delete a user
async function deleteUser(username) {
    const response = await fetch(`http://localhost:4455/users/${username}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        fetchUsers(); // Reload users after deleting
    }
}
