/* ============================================
   RAÍZES LITERÁRIAS - Dashboard System
   ============================================ */

// Dashboard initialization
function initDashboard() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html?redirect=dashboard.html';
    return;
  }

  // Update user info
  updateDashboardUser();

  // Initialize navigation
  initDashboardNav();

  // Initialize upload form
  initUploadForm();

  // Load sample data
  loadSampleBooks();
  loadSampleComments();

  // Render writer dashboard
  if (typeof renderWriterDashboard === 'function') renderWriterDashboard();
}

// Update dashboard user info
function updateDashboardUser() {
  const user = getCurrentUser();
  if (!user) return;

  const dashboardName = document.getElementById('dashboardName');
  const dashboardInitials = document.getElementById('dashboardInitials');

  if (dashboardName) dashboardName.textContent = user.name;
  if (dashboardInitials) dashboardInitials.textContent = getInitials(user.name);
}

// Dashboard navigation
function initDashboardNav() {
  const links = document.querySelectorAll('.dashboard-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      showSection(section);
    });
  });
}

// Show dashboard section
function showSection(sectionId) {
  // Update active link
  document.querySelectorAll('.dashboard-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === sectionId) {
      link.classList.add('active');
    }
  });

  // Show section content
  document.querySelectorAll('.dashboard-section-content').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`section-${sectionId}`).classList.add('active');
}

// Initialize upload form
function initUploadForm() {
  const uploadForm = document.getElementById('uploadForm');
  if (!uploadForm) return;

  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('bookTitle').value;
    const genre = document.getElementById('bookGenre').value;
    const description = document.getElementById('bookDescription').value;
    const pages = document.getElementById('bookPages').value;
    const price = document.getElementById('bookPrice').value;
    const isFree = document.getElementById('bookFree').checked;

    // Validate
    if (!title || !genre || !description) {
      showToast('Preenche todos os campos obrigatórios', 'error');
      return;
    }

    // Create book object
    const book = {
      id: Date.now().toString(),
      title,
      genre,
      description,
      pages: pages || 0,
      price: isFree ? 0 : (price || 0),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save to profile
    const user = getCurrentUser();
    if (user) {
      const profiles = getProfiles();
      if (!profiles[user.id]) {
        profiles[user.id] = { booksWritten: [] };
      }
      if (!profiles[user.id].booksWritten) {
        profiles[user.id].booksWritten = [];
      }
      profiles[user.id].booksWritten.push(book);
      saveProfiles(profiles);
    }

    showToast('Livro enviado para análise!');
    uploadForm.reset();

    // Reload books
    loadSampleBooks();
  });
}

// Load sample books for table
function loadSampleBooks() {
  const tableBody = document.getElementById('booksTableBody');
  if (!tableBody) return;

  const sampleBooks = [
    {
      title: 'Mayombe',
      genre: 'Romance',
      downloads: '2.345',
      rating: 4.8,
      status: 'published',
      cover: 'linear-gradient(135deg, #C75B39, #D4A843)'
    },
    {
      title: 'Yaka',
      genre: 'Romance',
      downloads: '1.823',
      rating: 4.7,
      status: 'published',
      cover: 'linear-gradient(135deg, #2D5A3D, #1E3D2A)'
    },
    {
      title: 'O Vendedor de Passados',
      genre: 'Ficção',
      downloads: '3.120',
      rating: 4.9,
      status: 'published',
      cover: 'linear-gradient(135deg, #4A0E0E, #8B0000)'
    },
    {
      title: 'A Guerra da Cabaça',
      genre: 'Teatro',
      downloads: '456',
      rating: 4.5,
      status: 'draft',
      cover: 'linear-gradient(135deg, #8B4513, #D2691E)'
    }
  ];

  tableBody.innerHTML = sampleBooks.map(book => `
    <tr>
      <td>
        <div class="book-title-cell">
          <div class="book-title-cover" style="background: ${book.cover};"></div>
          <div class="book-title-info">
            <strong>${book.title}</strong>
            <span>${book.genre}</span>
          </div>
        </div>
      </td>
      <td>${book.genre}</td>
      <td>${book.downloads}</td>
      <td>
        <span style="color: var(--dourado);">
          ${'★'.repeat(Math.floor(book.rating))}${'☆'.repeat(5 - Math.floor(book.rating))}
        </span>
        ${book.rating}
      </td>
      <td>
        <span class="status-badge ${book.status}">
          ${book.status === 'published' ? 'Publicado' : book.status === 'draft' ? 'Rascunho' : 'Pendente'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Load sample comments
function loadSampleComments() {
  const commentsList = document.getElementById('dashCommentsList');
  if (!commentsList) return;

  const sampleComments = [
    {
      user: 'Maria Silva',
      initials: 'MS',
      text: 'Obra prima absoluta! A linguagem de Pepetela é única.',
      book: 'Mayombe',
      time: 'Há 2 horas'
    },
    {
      user: 'João Santos',
      initials: 'JS',
      text: 'Recomendo a todos que amam literatura africana.',
      book: 'Terra Sonâmbula',
      time: 'Há 5 horas'
    },
    {
      user: 'Ana Costa',
      initials: 'AC',
      text: 'Quando sai o próximo livro? Estou ansiosa!',
      book: 'O Vendedor de Passados',
      time: 'Há 1 dia'
    }
  ];

  commentsList.innerHTML = sampleComments.map(comment => `
    <div class="comment-item">
      <div class="comment-header">
        <div class="comment-avatar">${comment.initials}</div>
        <div class="comment-user">
          <strong>${comment.user}</strong>
          <span>${comment.time}</span>
        </div>
      </div>
      <p class="comment-text">${comment.text}</p>
      <div class="comment-book">
        <i class="fas fa-book"></i> Sobre: ${comment.book}
      </div>
    </div>
  `).join('');
}

// Initialize settings form
function initSettingsForm() {
  const settingsForm = document.getElementById('settingsForm');
  if (!settingsForm) return;

  // Load saved settings
  const user = getCurrentUser();
  if (user) {
    const profile = getUserProfile();
    if (profile) {
      const nameInput = document.getElementById('settingsName');
      const bioInput = document.getElementById('settingsBio');
      const locationInput = document.getElementById('settingsLocation');
      if (nameInput) nameInput.value = profile.name || user.name;
      if (bioInput) bioInput.value = profile.bio || '';
      if (locationInput) locationInput.value = profile.location || '';
    }
  }

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    updateProfile(user.id, {
      name: document.getElementById('settingsName').value,
      bio: document.getElementById('settingsBio').value,
      location: document.getElementById('settingsLocation').value
    });

    updateDashboardUser();
    showToast('Configurações guardadas com sucesso!');
  });
}

// Initialize book table actions
function initBookTableActions() {
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      const title = editBtn.closest('tr')?.querySelector('strong')?.textContent;
      if (title) showToast(`Editando "${title}"...`);
    }

    if (deleteBtn) {
      const row = deleteBtn.closest('tr');
      const title = row?.querySelector('strong')?.textContent;
      if (title && confirm(`Excluir "${title}"?`)) {
        row.remove();
        showToast('Livro excluído');
      }
    }
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initSettingsForm();
  initBookTableActions();
});
