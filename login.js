document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const username = usernameInput.value;
        const password = passwordInput.value;

        // Clear previous messages
        loginMessage.textContent = '';
        loginMessage.style.display = 'none';
        loginMessage.classList.remove('success', 'error');

        if (username === 'testuser' && password === 'password123') {
            loginMessage.textContent = 'Login successful! Welcome.';
            loginMessage.classList.add('success');
            loginMessage.style.display = 'block';
        } else {
            loginMessage.textContent = 'Invalid username or password.';
            loginMessage.classList.add('error');
            loginMessage.style.display = 'block';
        }
    });
});