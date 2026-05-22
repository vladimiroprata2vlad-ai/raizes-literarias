/* ============================================
   RAÍZES LITERÁRIAS - Sistema de Autenticação
   ============================================ */

const AUTH_KEY = 'raizesUser';

// Get current user
function getCurrentUser() {
  const userData = localStorage.getItem(AUTH_KEY);
  return userData ? JSON.parse(userData) : null;
}

// Check if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Logout
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
}

// Require login for page
function requireLogin() {
  if (!isLoggedIn()) {
    const currentPage = window.location.pathname.split('/').pop();
    window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPage);
    return false;
  }
  return true;
}

// Update UI based on auth state
function updateAuthUI() {
  const user = getCurrentUser();
  const navActions = document.querySelector('.nav-actions');

  if (!navActions) return;

  // Find existing auth buttons
  let authBtn = document.getElementById('authBtn');
  let userMenu = document.getElementById('userMenu');

  if (user) {
    // User is logged in - show user menu
    if (!userMenu) {
      userMenu = document.createElement('div');
      userMenu.id = 'userMenu';
      userMenu.className = 'user-menu';
      const isWriter = user.role === 'escritor';
      const profileLink = isWriter ? 'perfil-escritor.html' : 'perfil-leitor.html';

      userMenu.innerHTML = `
        <button class="user-avatar-btn" onclick="toggleUserMenu()">
          <span class="user-avatar">${getInitials(user.name)}</span>
          <span class="user-name">${user.name.split(' ')[0]}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown-header">
            <span class="user-avatar-lg">${getInitials(user.name)}</span>
            <div>
              <strong>${user.name}</strong>
              <span>${user.email}</span>
              <span class="user-role-badge ${isWriter ? 'escritor' : 'leitor'}">
                <i class="fas fa-${isWriter ? 'pen-fancy' : 'book-reader'}"></i>
                ${isWriter ? 'Escritor' : 'Leitor'}
              </span>
            </div>
          </div>
          <div class="user-dropdown-links">
            <a href="${profileLink}"><i class="fas fa-user"></i> Meu Perfil</a>
            ${isWriter ? '<a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>' : ''}
            ${isWriter ? '<a href="dashboard.html#upload"><i class="fas fa-upload"></i> Publicar Livro</a>' : ''}
            <a href="biblioteca.html"><i class="fas fa-book-reader"></i> Minha Biblioteca</a>
            <a href="perfil-leitor.html"><i class="fas fa-heart"></i> Favoritos</a>
            <a href="comparar.html"><i class="fas fa-balance-scale"></i> Comparar</a>
            <a href="audiobooks.html"><i class="fas fa-headphones"></i> Audiobooks</a>
            <a href="#"><i class="fas fa-cog"></i> Configurações</a>
          </div>
          <div class="user-dropdown-footer">
            <button onclick="logout()"><i class="fas fa-sign-out-alt"></i> Sair</button>
          </div>
        </div>
      `;

      // Insert before theme toggle
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        navActions.insertBefore(userMenu, themeToggle);
      } else {
        navActions.appendChild(userMenu);
      }
    }

    // Hide login button if exists
    if (authBtn) authBtn.style.display = 'none';
  } else {
    // User not logged in - show login button
    if (!authBtn) {
      authBtn = document.createElement('a');
      authBtn.id = 'authBtn';
      authBtn.href = 'login.html';
      authBtn.className = 'btn btn-primary btn-sm';
      authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';

      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        navActions.insertBefore(authBtn, themeToggle);
      } else {
        navActions.appendChild(authBtn);
      }
    }

    // Hide user menu if exists
    if (userMenu) userMenu.style.display = 'none';
  }
}

// Get current user session
function getUserSession() {
  try {
    return JSON.parse(localStorage.getItem('raizesUser'));
  } catch {
    return null;
  }
}

// Get initials from name
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Toggle user dropdown
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const userMenu = document.getElementById('userMenu');
  const dropdown = document.getElementById('userDropdown');
  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.classList.remove('active');
  }
});

// Pages that require login because they expose personal account data
const protectedPages = [
  'dashboard.html',
  'perfil-leitor.html',
  'perfil-escritor.html'
];

// Check if current page requires login
function checkPageAccess() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isProtected = protectedPages.includes(currentPage);

  if (isProtected && !isLoggedIn()) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPage);
    return false;
  }
  return true;
}

// Init auth
function initAuth() {
  updateAuthUI();
  // Only check access on protected pages
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (protectedPages.includes(currentPage)) {
    checkPageAccess();
  }
}

// Run on load
document.addEventListener('DOMContentLoaded', initAuth);
