// Auth Module - Handle registration, login, token management
// Auth Module - Handle registration, login, token management
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://YOUR_BACKEND_APP_NAME.onrender.com/api'; // user must update this after deployment
console.log('auth.js loaded');

class AuthManager {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Store token and user in localStorage
  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear authentication
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get authorization header
  getAuthHeader() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // Register new student
  async register(name, email, password, confirmPassword, studentId, department) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          studentId,
          department,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      this.setAuth(data.token, data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Login student
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.setAuth(data.token, data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Admin login
  async adminLogin(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      this.setAuth(data.token, data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Global auth manager instance
const auth = new AuthManager();

// Expose to window for other scripts
window.auth = auth;
window.API_URL = API_URL;

// Show/hide alert messages
function showAlert(message, type = 'info', duration = 5000) {
  const alertId = 'alert-' + Date.now();
  const alertHTML = `<div id="${alertId}" class="alert alert-${type} show">${message}</div>`;

  // Append directly to body to ensure it's on top of everything
  const container = document.body;

  // Remove existing alerts to prevent stacking
  const existingAlert = document.querySelectorAll('.alert');
  existingAlert.forEach(alert => alert.remove());

  container.insertAdjacentHTML('afterbegin', alertHTML);

  if (duration) {
    setTimeout(() => {
      const alert = document.getElementById(alertId);
      if (alert) alert.remove();
    }, duration);
  }
}

// Handle registration form
function handleRegister(event) {
  console.log('handleRegister called');
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const studentId = document.getElementById('studentId').value.trim();
  const department = document.getElementById('department').value.trim();

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showAlert('Please fill in all required fields', 'danger');
    return;
  }

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters', 'danger');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'danger');
    return;
  }

  // Call API
  auth.register(name, email, password, confirmPassword, studentId, department)
    .then(result => {
      if (result.success) {
        showAlert('Registration successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        showAlert(result.error, 'danger');
      }
    });
}

// Handle login form
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAlert('Please fill in all fields', 'danger');
    return;
  }

  auth.login(email, password)
    .then(result => {
      if (result.success) {
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        showAlert(result.error, 'danger');
      }
    });
}

// Handle admin login form
function handleAdminLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAlert('Please fill in all fields', 'danger');
    return;
  }

  auth.adminLogin(email, password)
    .then(result => {
      if (result.success) {
        showAlert('Admin login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'admin_dashboard.html';
        }, 1500);
      } else {
        showAlert(result.error, 'danger');
      }
    });
}

// Logout function
function logout() {
  auth.logout();
  window.location.href = 'index.html';
}

// Check if user is authenticated (redirect if not)
function requireAuth() {
  if (!auth.isAuthenticated()) {
    window.location.href = 'login.html';
  }
}

// Check if admin is authenticated (redirect if not)
function requireAdminAuth() {
  if (!auth.isAuthenticated() || auth.user.role !== 'admin') {
    window.location.href = 'admin_login.html';
  }
}

// Display user info in navbar
function updateNavBar() {
  const navRight = document.querySelector('.nav-right');
  if (!navRight) return;

  if (auth.isAuthenticated()) {
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
      userInfo.innerHTML = `${auth.user.name} (${auth.user.role})`;
    }
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
    }
  } else {
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
      userInfo.innerHTML = '';
    }
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavBar();

  // Provide global access for debugging
  window.auth = auth;
  window.handleRegister = handleRegister;
  window.handleLogin = handleLogin;
  window.handleAdminLogin = handleAdminLogin;

  // Attach if available by ID
  const registerFormAlt = document.querySelector('#registerForm');
  if (registerFormAlt) registerFormAlt.addEventListener('submit', handleRegister);

  const loginFormAlt = document.querySelector('#loginForm');
  if (loginFormAlt) loginFormAlt.addEventListener('submit', handleLogin);

  const adminFormAlt = document.querySelector('#adminLoginForm');
  if (adminFormAlt) adminFormAlt.addEventListener('submit', handleAdminLogin);

});
