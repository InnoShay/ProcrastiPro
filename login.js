document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // In a real application, you would validate credentials against a server
    // For this example, we'll use a simple check
    if (username && password) {
        localStorage.setItem('username', username);
        window.location.href = 'dashboard.html';
    } else {
        alert('Please enter both username and password');
    }
});