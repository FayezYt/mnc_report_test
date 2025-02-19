// Create floating particles
const particles = document.getElementById('particles');
for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    particle.style.opacity = Math.random().toFixed(2);
    particles.appendChild(particle);
}

// User authentication logic
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the username and password from the form
    const username = document.getElementById("username").value.trim(); // Ensure the username is treated as a string
    const password = document.getElementById("password").value;

    fetch('https://mnc-reports.onrender.com/get-users')
    .then(response => response.json())
    .then(users => {
        // Ensure all properties are strings
        const usersAsString = users.map(user => {
            return {
                ...user,
                username: user.username.toString(),
                password: user.password.toString(),
                name: user.name.toString(),
                // Add other fields you expect that need conversion
            };
        });

        // Find the user by comparing both the username and password
        const user = usersAsString.find(u => {
            const excelUsername = u.username.trim();  // Excel username as string
            const inputUsername = username.trim();    // Input username as string

            return excelUsername === inputUsername && u.password === password;
        });

        if (!user) {
            loginError.classList.remove("hidden");
            loginError.classList.add("shake");
            document.querySelector('.welcome-container').classList.add('shake');

            setTimeout(() => {
                loginError.classList.remove("shake");
                document.querySelector('.welcome-container').classList.remove('shake');
            }, 500);
        } else {
            document.querySelector('.welcome-container').classList.add('success');
            setTimeout(() => {
                localStorage.setItem("last_username", user.name);

                if (user.isAdmin) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "welcome.html";
                }
            }, 300);
        }
    })
    .catch(error => {
        console.error("Error fetching users:", error);
        loginError.classList.remove("hidden");
        loginError.classList.add("shake");
        document.querySelector('.welcome-container').classList.add('shake');
        setTimeout(() => {
            loginError.classList.remove("shake");
            document.querySelector('.welcome-container').classList.remove('shake');
        }, 500);
    });

});
