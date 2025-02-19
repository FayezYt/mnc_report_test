document.addEventListener('DOMContentLoaded', () => {
    fetchUsers(); // Fetch users when the page loads
});

// Fetch users from the backend
async function fetchUsers() {
    const response = await fetch('https://mnc-reports.onrender.com/users');
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
