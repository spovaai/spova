document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen for 2 seconds then fade out
    setTimeout(() => {
        document.querySelector('.loading-screen').style.opacity = '0';
        document.querySelector('.loading-screen').style.transition = 'opacity 0.5s ease';
        document.querySelector('.auth-card').style.display = 'block';
        setTimeout(() => {
            document.querySelector('.loading-screen').style.display = 'none';
        }, 500);
    }, 2000);

    // Social login handler
    window.handleSocialLogin = (provider) => {
        showNotification(`Logging in with ${provider}... (Demo)`, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    };

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toast = new bootstrap.Toast(document.getElementById('authToast'));

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.closest('.password-field').querySelector('input');
            const icon = button.querySelector('i');

            input.type = input.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    });

    // Check password strength
    const checkPasswordStrength = (password) => {
        const strengthIndicator = document.querySelector('.password-strength');
        if (!password) {
            strengthIndicator.removeAttribute('data-strength');
            return;
        }

        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);
        const length = password.length;

        const score = [hasLower, hasUpper, hasNumber, hasSpecial]
            .filter(Boolean).length;

        if (length < 8 || score < 2) {
            strengthIndicator.setAttribute('data-strength', 'weak');
        } else if (length >= 8 && score === 2) {
            strengthIndicator.setAttribute('data-strength', 'medium');
        } else {
            strengthIndicator.setAttribute('data-strength', 'strong');
        }
    };

    document.getElementById('signupPassword').addEventListener('input', (e) => {
        checkPasswordStrength(e.target.value);
    });

    // Show notification
    const showNotification = (message, type = 'success') => {
        const toastEl = document.getElementById('authToast');
        toastEl.querySelector('.toast-body').textContent = message;
        toastEl.classList.remove('success', 'error');
        toastEl.classList.add(type);
        toast.show();
    };

    // Set loading state for forms
    const setLoading = (form, isLoading) => {
        const button = form.querySelector('button[type="submit"]');
        button.classList.toggle('loading', isLoading);
        button.disabled = isLoading;
    };

    // Form validation
    const validateForm = (form) => {
        let isValid = true;
        form.querySelectorAll('input').forEach(input => {
            if (!input.checkValidity()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        return isValid;
    };

    // Login Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm(loginForm)) {
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
            return;
        }

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        setLoading(loginForm, true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        setLoading(loginForm, false);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            showNotification('Login successful! Redirecting...');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        } else {
            showNotification('Invalid email or password', 'error');
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        }
    });

    // Signup Form Submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm(signupForm)) {
            signupForm.classList.add('shake');
            setTimeout(() => signupForm.classList.remove('shake'), 500);
            return;
        }

        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            document.getElementById('confirmPassword').classList.add('is-invalid');
            showNotification('Passwords do not match', 'error');
            return;
        }

        setLoading(signupForm, true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(u => u.email === email)) {
            setLoading(signupForm, false);
            showNotification('User already exists', 'error');
            return;
        }

        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify({ email, password }));

        setLoading(signupForm, false);
        showNotification('Account created successfully! Redirecting...');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
    });

    // Logout functionality
    document.getElementById('logoutButton')?.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        showNotification('Logged out successfully');
        setTimeout(() => window.location.href = 'login.html', 1000);
    });

    // Real-time input validation
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            if (input.checkValidity()) {
                input.classList.remove('is-invalid');
            }
        });
    });
});
