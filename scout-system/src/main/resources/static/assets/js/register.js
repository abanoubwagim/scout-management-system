// Elements
const form = document.getElementById('registerForm');
const fullName = document.getElementById('fullName');
const username = document.getElementById('username');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const profileImage = document.getElementById('profileImage');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImage');

const fullNameError = document.getElementById('fullNameError');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const imageError = document.getElementById('imageError');

const registerBtn = document.getElementById('registerBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const registerAlert = document.getElementById('registerAlert');

const togglePassword = document.getElementById('togglePassword');
const toggleIcon = document.getElementById('toggleIcon');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const toggleConfirmIcon = document.getElementById('toggleConfirmIcon');

let selectedImageBase64 = null;

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('loggedInUser')) {
        window.location.href = 'dashboard.html';
    }
});

// Click on image preview to open file selector
imagePreview.addEventListener('click', () => {
    profileImage.click();
});

// Keyboard accessibility for image preview
imagePreview.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        profileImage.click();
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

if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPassword.type === 'password' ? 'text' : 'password';
        confirmPassword.type = type;
        toggleConfirmIcon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        toggleConfirmPassword.setAttribute('aria-label',
            type === 'password' ? 'Show password' : 'Hide password'
        );
    });
}

// Image Upload Handler
profileImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError(imageError, 'Please select a valid image file');
            imagePreview.classList.add('invalid');
            imagePreview.classList.remove('has-image');
            profileImage.value = '';
            selectedImageBase64 = null;
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError(imageError, 'Image size must be less than 5MB');
            imagePreview.classList.add('invalid');
            imagePreview.classList.remove('has-image');
            profileImage.value = '';
            selectedImageBase64 = null;
            return;
        }
        
        // Read and preview image
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedImageBase64 = event.target.result;
            imagePreview.innerHTML = `<img src="${event.target.result}" alt="Profile Preview">`;
            imagePreview.classList.remove('invalid', 'clickable');
            imagePreview.classList.add('has-image');
            removeImageBtn.style.display = 'inline-block';
            hideError(imageError);
        };
        reader.readAsDataURL(file);
    }
});

// Remove Image Handler
removeImageBtn.addEventListener('click', () => {
    profileImage.value = '';
    selectedImageBase64 = null;
    imagePreview.innerHTML = `
        <span class="material-symbols-outlined">add_a_photo</span>
        <p class="upload-text">Click to Upload</p>
    `;
    imagePreview.classList.remove('has-image', 'invalid');
    imagePreview.classList.add('clickable');
    removeImageBtn.style.display = 'none';
});

// Real-time Validation
fullName.addEventListener('input', () => {
    if (fullName.value.trim() !== '') {
        fullName.classList.remove('is-invalid');
        fullName.classList.add('is-valid');
        hideError(fullNameError);
    } else {
        fullName.classList.remove('is-valid');
    }
});

username.addEventListener('input', () => {
    if (username.value.trim() !== '') {
        username.classList.remove('is-invalid');
        username.classList.add('is-valid');
        hideError(usernameError);
    } else {
        username.classList.remove('is-valid');
    }
});

password.addEventListener('input', () => {
    if (password.value.length >= 6) {
        password.classList.remove('is-invalid');
        password.classList.add('is-valid');
        hideError(passwordError);
    } else {
        password.classList.remove('is-valid');
    }
    
    // Also validate confirm password if it has a value
    if (confirmPassword.value) {
        validatePasswordMatch();
    }
});

confirmPassword.addEventListener('input', () => {
    validatePasswordMatch();
});

function validatePasswordMatch() {
    if (confirmPassword.value === password.value && password.value.length >= 6) {
        confirmPassword.classList.remove('is-invalid');
        confirmPassword.classList.add('is-valid');
        hideError(confirmPasswordError);
        return true;
    } else if (confirmPassword.value !== '') {
        confirmPassword.classList.remove('is-valid');
        confirmPassword.classList.add('is-invalid');
        showError(confirmPasswordError, 'Passwords do not match');
        return false;
    }
    return false;
}

// Form Submit Handler
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (registerBtn.disabled) return;
    registerAlert.classList.add('d-none');

    let valid = true;

    // Reset all validations
    [fullName, username, password, confirmPassword].forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
        input.style.border = '';
    });
    
    [fullNameError, usernameError, passwordError, confirmPasswordError, imageError].forEach(error => {
        error.style.display = 'none';
    });
    
    imagePreview.classList.remove('invalid');

    // Validate Profile Image (Required)
    if (!selectedImageBase64) {
        showError(imageError, 'Profile image is required');
        imagePreview.classList.add('invalid');
        valid = false;
    }

    // Validate Full Name
    if (fullName.value.trim() === '') {
        showInputError(fullName, fullNameError, 'Full name is required');
        valid = false;
    } else {
        fullName.classList.add('is-valid');
    }

    // Validate Username
    if (username.value.trim() === '') {
        showInputError(username, usernameError, 'Username is required');
        valid = false;
    } else if (username.value.trim().length < 3) {
        showInputError(username, usernameError, 'Username must be at least 3 characters');
        valid = false;
    } else {
        username.classList.add('is-valid');
    }

    // Validate Password
    if (password.value.trim() === '') {
        showInputError(password, passwordError, 'Password is required');
        valid = false;
    } else if (password.value.length < 6) {
        showInputError(password, passwordError, 'Password must be at least 6 characters');
        valid = false;
    } else {
        password.classList.add('is-valid');
    }

    // Validate Confirm Password
    if (confirmPassword.value.trim() === '') {
        showInputError(confirmPassword, confirmPasswordError, 'Please confirm your password');
        valid = false;
    } else if (confirmPassword.value !== password.value) {
        showInputError(confirmPassword, confirmPasswordError, 'Passwords do not match');
        valid = false;
    } else {
        confirmPassword.classList.add('is-valid');
    }

    if (!valid) {
        // Focus first invalid field
        if (!selectedImageBase64) {
            imagePreview.focus();
        } else {
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) firstInvalid.focus();
        }
        return;
    }

    await performRegistration();
});

// Registration Function with API Integration
async function performRegistration() {
    registerBtn.disabled = true;
    [fullName, username, password, confirmPassword, profileImage].forEach(el => el.disabled = true);
    imagePreview.style.pointerEvents = 'none';

    btnText.textContent = 'Creating Account...';
    spinner.style.display = 'inline-block';

    try {
        // Prepare request body
        const requestBody = {
            fullName: fullName.value.trim(),
            userName: username.value.trim(),
            password: password.value.trim()
        };

        // Add profile image (as base64 without data:image prefix)
        if (selectedImageBase64) {
            requestBody.profileImage = selectedImageBase64.split(',')[1];
        }

        const response = await fetch("http://localhost:9090/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok && !data.error) {
            btnText.textContent = 'Success!';
            spinner.style.display = 'none';

            registerBtn.style.background = 'linear-gradient(135deg, #198754 0%, #157347 100%)';
            registerBtn.innerHTML = `
                <span class="material-symbols-outlined me-2">check_circle</span>
                <span>Account Created!</span>
            `;

            showRegisterSuccess('Registration successful! Redirecting to login...');

            setTimeout(() => {
                window.location.href = 'signIn.html';
            }, 2000);

        } else {
            throw new Error(data.error || 'Registration failed');
        }

    } catch (error) {
        showRegisterError(error.message || 'An error occurred during registration. Please try again.');

        registerBtn.disabled = false;
        [fullName, username, password, confirmPassword, profileImage].forEach(el => el.disabled = false);
        imagePreview.style.pointerEvents = 'auto';
        btnText.textContent = 'Create Account';
        spinner.style.display = 'none';
        registerBtn.style.background = '';

        password.value = '';
        confirmPassword.value = '';
    }
}

// Helper Functions
function showInputError(input, errorElement, message) {
    input.classList.add('is-invalid');
    input.style.border = '2px solid #dc3545';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    input.setAttribute('aria-invalid', 'true');
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(errorElement) {
    errorElement.style.display = 'none';
}

function showRegisterError(message) {
    registerAlert.className = 'alert alert-danger mb-4';
    registerAlert.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="material-symbols-outlined me-2">error</span>
            <span>${message}</span>
        </div>
    `;
    registerAlert.classList.remove('d-none');
    registerAlert.style.animation = 'shake 0.5s';

    setTimeout(() => {
        registerAlert.classList.add('d-none');
        registerAlert.style.animation = '';
    }, 5000);
}

function showRegisterSuccess(message) {
    registerAlert.className = 'alert alert-success mb-4';
    registerAlert.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="material-symbols-outlined me-2">check_circle</span>
            <span>${message}</span>
        </div>
    `;
    registerAlert.classList.remove('d-none');
}

// Focus Effects
[fullName, username, password, confirmPassword].forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.01)';
        input.parentElement.style.transition = 'transform 0.2s ease';
    });

    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// Add Animations
if (!document.getElementById('registerAnimations')) {
    const style = document.createElement('style');
    style.id = 'registerAnimations';
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
    if (registerAlert.textContent.includes('network') || registerAlert.textContent.includes('connection')) {
        registerAlert.classList.add('d-none');
    }
});

window.addEventListener('offline', () => {
    showRegisterError('No internet connection. Please check your network and try again.');
    registerBtn.disabled = true;
    btnText.textContent = 'No Connection';
});

// Visual Feedback Enhancement
registerBtn.addEventListener('mousedown', () => {
    if (!registerBtn.disabled) {
        registerBtn.style.transform = 'scale(0.98)';
    }
});

registerBtn.addEventListener('mouseup', () => {
    registerBtn.style.transform = 'scale(1)';
});

registerBtn.addEventListener('mouseleave', () => {
    registerBtn.style.transform = 'scale(1)';
});