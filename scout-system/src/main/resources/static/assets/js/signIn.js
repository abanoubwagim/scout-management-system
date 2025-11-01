// Elements
const form = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const loginAlert = document.getElementById('loginAlert');
const togglePassword = document.getElementById('togglePassword');
const toggleIcon = document.getElementById('toggleIcon');

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    if (window.ScoutManagerAPI && window.ScoutManagerAPI.Auth.isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
});

// Password Toggle Functionality
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = password.type === 'password' ? 'text' : 'password';
        password.type = type;
        toggleIcon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        togglePassword.setAttribute('aria-label',
            type === 'password' ? 'Show password' : 'Hide password'
        );
    });
}


// Real-time Validation
username.addEventListener('input', () => {
    if (username.value.trim() !== '') {
        username.classList.remove('is-invalid');
        username.classList.add('is-valid');
        usernameError.style.display = 'none';
        username.style.border = '';
    } else {
        username.classList.remove('is-valid');
    }
});

password.addEventListener('input', () => {
    if (password.value.trim() !== '') {
        password.classList.remove('is-invalid');
        password.classList.add('is-valid');
        passwordError.style.display = 'none';
        password.style.border = '';
    } else {
        password.classList.remove('is-valid');
    }
});

// Form Submit Handler
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (loginBtn.disabled) return;
    loginAlert.classList.add('d-none');

    let valid = true;

    username.classList.remove('is-invalid', 'is-valid');
    password.classList.remove('is-invalid', 'is-valid');
    username.style.border = '';
    password.style.border = '';
    usernameError.style.display = 'none';
    passwordError.style.display = 'none';

    if (username.value.trim() === '') {
        username.classList.add('is-invalid');
        username.style.border = '2px solid #dc3545';
        usernameError.style.display = 'block';
        username.setAttribute('aria-invalid', 'true');
        valid = false;
    } else {
        username.classList.add('is-valid');
        username.setAttribute('aria-invalid', 'false');
    }

    if (password.value.trim() === '') {
        password.classList.add('is-invalid');
        password.style.border = '2px solid #dc3545';
        passwordError.style.display = 'block';
        password.setAttribute('aria-invalid', 'true');
        valid = false;
    } else {
        password.classList.add('is-valid');
        password.setAttribute('aria-invalid', 'false');
    }

    if (!valid) {
        if (username.value.trim() === '') {
            username.focus();
        } else if (password.value.trim() === '') {
            password.focus();
        }
        return;
    }

    await performLogin();
});

// API Service
window.ScoutManagerAPI = {
    Auth: {
        signIn: async (username, password) => {
            try {
                const response = await fetch("http://localhost:9090/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userName: username,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    return { success: true, data: data };
                } else {
                    return { 
                        success: false, 
                        error: data.error || "Login failed" 
                    };
                }
            } catch (error) {
                return { 
                    success: false, 
                    error: "Network error: " + error.message 
                };
            }
        },

        isAuthenticated: () => {
            return localStorage.getItem('loggedInUser') !== null;
        },
        
        getCurrentUser: () => {
            const user = localStorage.getItem('loggedInUser');
            return user ? { username: user } : null;
        },

        logout: () => {
            localStorage.removeItem('loggedInUser');
        }
    },

    Utils: {
        testConnection: async () => {
            try {
                const res = await fetch("http://localhost:9090/login", { 
                    method: "OPTIONS" 
                });
                return res.ok;
            } catch {
                return false;
            }
        }
    }
};

// Login Function with API Integration
async function performLogin() {
    loginBtn.disabled = true;
    username.disabled = true;
    password.disabled = true;

    btnText.textContent = 'Logging in...';
    spinner.style.display = 'inline-block';

    try {
        if (!window.ScoutManagerAPI) {
            throw new Error('API service not loaded. Please refresh the page.');
        }

        const result = await window.ScoutManagerAPI.Auth.signIn(
            username.value.trim(),
            password.value.trim()
        );

        if (result.success) {
            localStorage.setItem('loggedInUser', result.data.user.username);
            localStorage.setItem('userFullName', result.data.user.name || result.data.user.username);

            btnText.textContent = 'Success!';
            spinner.style.display = 'none';

            loginBtn.style.background = 'linear-gradient(135deg, #198754 0%, #157347 100%)';
            loginBtn.innerHTML = `
                <span class="material-symbols-outlined me-2">check_circle</span>
                <span>Login Successful!</span>
            `;

            showLoginSuccess('Welcome back! Redirecting to dashboard...');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } else {
            throw new Error(result.error || 'Invalid username or password');
        }

    } catch (error) {
        showLoginError(error.message || 'An error occurred during login. Please try again.');

        loginBtn.disabled = false;
        username.disabled = false;
        password.disabled = false;
        btnText.textContent = 'Login';
        spinner.style.display = 'none';
        loginBtn.style.background = '';

        password.value = '';
        password.focus();
    }
}

// Show Login Error
function showLoginError(message) {
    loginAlert.className = 'alert alert-danger mb-4';
    loginAlert.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="material-symbols-outlined me-2">error</span>
            <span>${message}</span>
        </div>
    `;
    loginAlert.classList.remove('d-none');
    loginAlert.style.animation = 'shake 0.5s';

    setTimeout(() => {
        loginAlert.classList.add('d-none');
        loginAlert.style.animation = '';
    }, 5000);
}

// Show Login Success
function showLoginSuccess(message) {
    loginAlert.className = 'alert alert-success mb-4';
    loginAlert.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="material-symbols-outlined me-2">check_circle</span>
            <span>${message}</span>
        </div>
    `;
    loginAlert.classList.remove('d-none');
}

// Enter Key Support
username.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        password.focus();
    }
});

password.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
    }
});

// Focus Effects
[username, password].forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.01)';
        input.parentElement.style.transition = 'transform 0.2s ease';
    });

    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// Add Shake Animation
if (!document.getElementById('loginAnimations')) {
    const style = document.createElement('style');
    style.id = 'loginAnimations';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .alert {
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Network Status Monitor
window.addEventListener('online', () => {
    if (loginAlert.textContent.includes('network') || loginAlert.textContent.includes('connection')) {
        loginAlert.classList.add('d-none');
    }
});

window.addEventListener('offline', () => {
    showLoginError('No internet connection. Please check your network and try again.');
    loginBtn.disabled = true;
    btnText.textContent = 'No Connection';
});


// Visual Feedback Enhancement
loginBtn.addEventListener('mousedown', () => {
    if (!loginBtn.disabled) {
        loginBtn.style.transform = 'scale(0.98)';
    }
});

loginBtn.addEventListener('mouseup', () => {
    loginBtn.style.transform = 'scale(1)';
});

loginBtn.addEventListener('mouseleave', () => {
    loginBtn.style.transform = 'scale(1)';
});