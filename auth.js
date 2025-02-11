// User management class
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    findUser(email) {
        return this.users.find(user => user.email === email);
    }

    createUser(username, email, password) {
        if (this.findUser(email)) {
            throw new Error('Email already exists');
        }

        const user = {
            id: Date.now(),
            username,
            email,
            password // In a real app, this should be hashed
        };

        this.users.push(user);
        this.saveUsers();
        return user;
    }

    validatePassword(password) {
        return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
    }
}

const userManager = new UserManager();

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Redirect if already logged in
    if (userManager.currentUser) {
        window.location.href = '/dashboard';
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = form.querySelector('button[type="submit"]');
    const spinner = submitBtn.querySelector('.spinner-border');

    try {
        submitBtn.disabled = true;
        spinner.classList.remove('d-none');
        errorDiv.classList.add('d-none');

        const user = userManager.findUser(email);
        if (!user || user.password !== password) {
            throw new Error('Invalid email or password');
        }

        userManager.setCurrentUser(user);
        window.location.href = '/dashboard';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    } finally {
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.querySelector('#username').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    const errorDiv = document.getElementById('signupError');
    const submitBtn = form.querySelector('button[type="submit"]');
    const spinner = submitBtn.querySelector('.spinner-border');

    try {
        submitBtn.disabled = true;
        spinner.classList.remove('d-none');
        errorDiv.classList.add('d-none');

        if (!userManager.validatePassword(password)) {
            throw new Error('Password must be at least 8 characters and contain numbers and letters');
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const user = userManager.createUser(username, email, password);
        userManager.setCurrentUser(user);
        window.location.href = '/dashboard';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    } finally {
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}
// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('body');
    const toggle = document.querySelector('.toggle-input');
    const part = document.getElementById('particles-js');

    // Set initial theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggle.checked = prefersDark;
    updateTheme(prefersDark);

    toggle.addEventListener('change', () => {
        updateTheme(toggle.checked);
    });

    function updateTheme(isDark) {
        if (isDark) {
            container.className = 'dark';
            part.style.backgroundColor = '#100b16';
            particlesJS('particles-js', {
                particles: {
                    number: { value: 100, density: { enable: true, value_area: 800 } },
                    color: { value: '#b392ac' },
                    shape: { type: 'polygon', polygon: { nb_sides: 6 } },
                    opacity: { value: 0.75 },
                    size: { value: 2, anim: { enable: true, speed: 5, size_min: 1, sync: true } },
                    line_linked: {
                        enable: true,
                        distance: 125,
                        color: '#ffffff',
                        opacity: 0.75,
                        width: 0.5
                    },
                    move: {
                        enable: true,
                        speed: 5,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                        attract: { enable: true, rotateX: 1500, rotateY: 900 }
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'grab' },
                        onclick: { enable: true, mode: 'bubble' },
                        resize: true
                    },
                    modes: {
                        grab: { distance: 300, line_linked: { opacity: 1 } },
                        bubble: { distance: 300, size: 5, duration: 0.75, opacity: 8, speed: 3 }
                    }
                },
                retina_detect: true
            });
        } else {
            container.className = 'light';
            part.style.backgroundColor = '#e8e1ef';
            particlesJS('particles-js', {
                particles: {
                    number: { value: 100, density: { enable: true, value_area: 800 } },
                    color: { value: '#7B2CBF' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.75 },
                    size: { value: 2, anim: { enable: true, speed: 5, size_min: 1, sync: true } },
                    line_linked: {
                        enable: true,
                        distance: 125,
                        color: '#7B2CBF',
                        opacity: 0.75,
                        width: 0.5
                    },
                    move: {
                        enable: true,
                        speed: 5,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                        attract: { enable: true, rotateX: 1500, rotateY: 900 }
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'grab' },
                        onclick: { enable: true, mode: 'bubble' },
                        resize: true
                    },
                    modes: {
                        grab: { distance: 300, line_linked: { opacity: 1 } },
                        bubble: { distance: 300, size: 5, duration: 0.75, opacity: 8, speed: 3 }
                    }
                },
                retina_detect: true
            });
        }
    }
});
