/* ============================================
   RAÍZES LITERÁRIAS - Profile System
   ============================================ */

const PROFILES_STORE_KEY = 'raizesProfiles';
const PROFILE_FAVORITES_STORE_KEY = 'raizesFavorites';
const PROFILE_LIBRARY_STORE_KEY = 'raizesLibrary';

// Get all profiles
function getProfiles() {
  return JSON.parse(localStorage.getItem(PROFILES_STORE_KEY) || '{}');
}

// Save profiles
function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_STORE_KEY, JSON.stringify(profiles));
}

// Get current user profile data
function getUserProfile() {
  const user = getCurrentUser();
  if (!user) return null;
  const profiles = getProfiles();
  return profiles[user.id] || null;
}

// Create or update profile
function updateProfile(userId, profileData) {
  const profiles = getProfiles();
  profiles[userId] = {
    ...profiles[userId],
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  saveProfiles(profiles);
}

// Get favorites
function getFavorites() {
  return JSON.parse(localStorage.getItem(PROFILE_FAVORITES_STORE_KEY) || '[]');
}

// Get library
function getLibrary() {
  return JSON.parse(localStorage.getItem(PROFILE_LIBRARY_STORE_KEY) || '[]');
}

// Initialize profile page
function initProfile() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const profile = getUserProfile();
  if (!profile) {
    const defaultProfile = {
      type: user.role || 'leitor',
      name: user.name,
      email: user.email,
      bio: 'Amante da literatura',
      location: 'Angola',
      joinDate: new Date().toISOString(),
      verified: false,
      booksRead: 0,
      booksWritten: [],
      followers: 0,
      following: [],
      genres: ['Romance', 'Ficção', 'Poesia']
    };
    updateProfile(user.id, defaultProfile);
  }

  // Detect which profile page we're on
  const isWriter = document.querySelector('.profile-type-badge.escritor') !== null;
  updateProfileUI(isWriter);

  if (isWriter) {
    loadWriterBooks();
    loadComments();
    loadCommunityPosts();
  } else {
    loadReaderBooks();
    loadWantToRead();
    loadReviews();
    loadFavoritesGrid();
  }
}

// Update profile UI
function updateProfileUI(isWriter) {
  const profile = getUserProfile();
  if (!profile) return;

  const user = getCurrentUser();

  // Update header
  setText('profileName', profile.name);
  setText('profileBio', profile.bio);
  setText('profileLocation', profile.location);
  setText('profileInitials', getInitials(profile.name));

  // Update join date
  const joinDate = profile.joinDate ? new Date(profile.joinDate).getFullYear() : new Date().getFullYear();
  setText('profileJoinDate', joinDate);

  // Update verified badge
  if (profile.verified) {
    show('verifiedBadge');
    show('verifiedText');
  }

  // Check if viewing own profile
  const isOwnProfile = user && user.id === (profile.id || user.id);

  // Writer stats
  if (isWriter) {
    setText('profileBookCount', profile.booksWritten?.length || 12);
    setText('profileFollowers', formatNumber(profile.followers || 1200));
    setText('totalBooks', profile.booksWritten?.length || 12);
    setText('totalReaders', formatNumber(profile.followers || 5400));
    setText('totalReviews', profile.reviews || 234);
    setText('avgRating', profile.avgRating || '4.8');
  } else {
    // Reader stats
    const library = getLibrary();
    const favorites = getFavorites();
    setText('profileBooksRead', library.length || 0);
    setText('booksRead', library.length || 0);
    setText('booksReading', 3);
    setText('booksWant', 12);
    setText('profileReviews', favorites.length || 0);
    setText('reviewsWritten', favorites.length || 0);
  }

  // Update buttons based on own/other profile
  const actionsDiv = document.querySelector('.profile-actions');
  if (actionsDiv && isOwnProfile) {
    // Hide follow button, show edit
    const followBtn = actionsDiv.querySelector('.btn-primary');
    if (followBtn) followBtn.style.display = 'none';
  }
}

// --- Helper functions ---
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// --- Tab switching ---
function initProfileTabs() {
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const content = document.getElementById(`tab-${target}`);
      if (content) content.classList.add('active');

      // Load data when tab opens
      if (target === 'favoritos') loadFavoritesGrid();
      if (target === 'quero-ler') loadWantToRead();
      if (target === 'avaliacoes') loadReviews();
      if (target === 'livros') loadWriterBooks();
      if (target === 'comentarios') loadComments();
      if (target === 'comunidade') loadCommunityPosts();
    });
  });
}

// --- Reader Profile: Books Read ---
function loadReaderBooks() {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  const library = getLibrary();
  const sampleBooks = library.length > 0 ? library : [
    { name: 'Terra Sonâmbula', author: 'Mia Couto', price: 3500 },
    { name: 'Mayombe', author: 'Pepetela', price: 2800 },
    { name: 'O Vendedor de Passados', author: 'José Eduardo Agualusa', price: 3200 },
    { name: 'Chiquinho', author: 'Baltasar Lopes', price: 2500 },
    { name: 'A Varanda do Jambeiro', author: 'Mia Couto', price: 3000 }
  ];

  grid.innerHTML = sampleBooks.map((book, i) => `
    <div class="livro-card" style="animation: fadeIn 0.3s ease ${i * 0.1}s both">
      <div class="livro-cover">
        <div class="livro-cover-img" style="background: linear-gradient(135deg, ${getGradient(i)}); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white;">
          <i class="fas fa-book"></i>
        </div>
      </div>
      <div class="livro-info">
        <h4>${book.name || book.title}</h4>
        <p class="autor">${book.author || 'Desconhecido'}</p>
      </div>
    </div>
  `).join('');
}

// --- Reader Profile: Want to Read ---
function loadWantToRead() {
  const grid = document.getElementById('wantToReadGrid');
  if (!grid) return;

  const wantToRead = [
    { name: 'A Confissão da Leoa', author: 'Mia Couto' },
    { name: 'Predadores', author: 'Pepetela' },
    { name: 'Estação das Chuvas', author: 'Eliana Cardoso' },
    { name: 'O Outro Pé da Sereia', author: 'Mia Couto' }
  ];

  grid.innerHTML = wantToRead.map((book, i) => `
    <div class="livro-card" style="animation: fadeIn 0.3s ease ${i * 0.1}s both">
      <div class="livro-cover">
        <div class="livro-cover-img" style="background: linear-gradient(135deg, ${getGradient(i + 5)}); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white;">
          <i class="fas fa-bookmark"></i>
        </div>
      </div>
      <div class="livro-info">
        <h4>${book.name}</h4>
        <p class="autor">${book.author}</p>
        <button class="btn btn-primary btn-sm" onclick="addToCart('${book.name}', 0)" style="margin-top: 8px; font-size: 0.8rem;">
          <i class="fas fa-shopping-cart"></i> Comprar
        </button>
      </div>
    </div>
  `).join('');
}

// --- Reader Profile: Reviews ---
function loadReviews() {
  const list = document.getElementById('reviewsList');
  if (!list) return;

  const reviews = [
    {
      user: getCurrentUser()?.name || 'Tu',
      initials: getInitials(getCurrentUser()?.name || 'U'),
      rating: 5,
      text: 'Uma obra prima da literatura moçambicana. Mia Couto consegue transportar-nos para um mundo mágico onde a realidade e a ficção se misturam de forma brilhante.',
      book: 'Terra Sonâmbula',
      time: 'Há 3 dias'
    },
    {
      user: getCurrentUser()?.name || 'Tu',
      initials: getInitials(getCurrentUser()?.name || 'U'),
      rating: 4,
      text: 'Pepetela retrata a guerra civil angolana de forma crua e poética. Uma leitura obrigatória para quem quer entender a história de Angola.',
      book: 'Mayombe',
      time: 'Há 1 semana'
    },
    {
      user: getCurrentUser()?.name || 'Tu',
      initials: getInitials(getCurrentUser()?.name || 'U'),
      rating: 5,
      text: 'Agualusa é um dos melhores escritores contemporâneos. Este livro é uma viagem fascinante pela identidade e memória.',
      book: 'O Vendedor de Passados',
      time: 'Há 2 semanas'
    }
  ];

  list.innerHTML = reviews.map(review => `
    <div class="comment-item">
      <div class="comment-header">
        <div class="comment-avatar">${review.initials}</div>
        <div class="comment-user">
          <strong>${review.user}</strong>
          <span>${review.time}</span>
        </div>
        <div class="rating-stars" style="margin-left: auto;">
          ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
        </div>
      </div>
      <p class="comment-text">${review.text}</p>
      <div class="comment-book">
        <i class="fas fa-book"></i> Sobre: ${review.book}
      </div>
    </div>
  `).join('');
}

// --- Reader Profile: Favorites ---
function loadFavoritesGrid() {
  const grid = document.getElementById('favoritesGrid');
  if (!grid) return;

  const favorites = getFavorites();
  const sampleFavorites = favorites.length > 0 ? favorites : [
    { name: 'Terra Sonâmbula', author: 'Mia Couto', price: 3500 },
    { name: 'Mayombe', author: 'Pepetela', price: 2800 },
    { name: 'O Vendedor de Passados', author: 'José Eduardo Agualusa', price: 3200 }
  ];

  grid.innerHTML = sampleFavorites.map((book, i) => `
    <div class="livro-card" style="animation: fadeIn 0.3s ease ${i * 0.1}s both">
      <div class="livro-cover">
        <div class="livro-cover-img" style="background: linear-gradient(135deg, ${getGradient(i + 10)}); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white;">
          <i class="fas fa-heart"></i>
        </div>
      </div>
      <div class="livro-info">
        <h4>${book.name || book.title}</h4>
        <p class="autor">${book.author || 'Desconhecido'}</p>
        <div style="display: flex; gap: 5px; margin-top: 8px;">
          <button class="btn btn-primary btn-sm" onclick="addToCart('${book.name || book.title}', ${book.price || 0})" style="font-size: 0.8rem; flex: 1;">
            <i class="fas fa-shopping-cart"></i>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="removeFavorite('${book.name || book.title}')" style="font-size: 0.8rem; color: var(--terracotta);">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Remove from favorites
function removeFavorite(bookName) {
  let favorites = getFavorites();
  favorites = favorites.filter(f => f.name !== bookName);
  localStorage.setItem(PROFILE_FAVORITES_STORE_KEY, JSON.stringify(favorites));
  loadFavoritesGrid();
  showToast('Removido dos favoritos');
}

// --- Writer Profile: Books ---
function loadWriterBooks() {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  const sampleBooks = [
    { title: 'Mayombe', genre: 'Romance', downloads: '2.3K', rating: 4.8 },
    { title: 'Yaka', genre: 'Romance', downloads: '1.8K', rating: 4.7 },
    { title: 'O Vendedor de Passados', genre: 'Ficção', downloads: '3.1K', rating: 4.9 },
    { title: 'A Geração da Utopia', genre: 'Romance', downloads: '1.5K', rating: 4.6 },
    { title: 'Parábolo do Cágado Velho', genre: 'Ficção', downloads: '980', rating: 4.5 }
  ];

  grid.innerHTML = sampleBooks.map((book, i) => `
    <div class="livro-card" style="animation: fadeIn 0.3s ease ${i * 0.1}s both">
      <div class="livro-cover">
        <div class="livro-cover-img" style="background: linear-gradient(135deg, ${getGradient(i + 3)}); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white;">
          <i class="fas fa-book"></i>
        </div>
      </div>
      <div class="livro-info">
        <h4>${book.title}</h4>
        <p class="autor">${book.genre}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span style="font-size: 0.8rem; color: var(--cinza);"><i class="fas fa-download"></i> ${book.downloads}</span>
          <span style="font-size: 0.8rem; color: var(--dourado);"><i class="fas fa-star"></i> ${book.rating}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Writer Profile: Comments ---
function loadComments() {
  const list = document.getElementById('commentsList');
  if (!list) return;

  const sampleComments = [
    {
      user: 'Maria Silva',
      initials: 'MS',
      text: 'Uma obra prima! A forma como descreve a floresta é simplesmente mágica.',
      book: 'Mayombe',
      time: 'Há 2 horas',
      rating: 5
    },
    {
      user: 'João Santos',
      initials: 'JS',
      text: 'Este livro mudou a minha perspectiva sobre a literatura angolana.',
      book: 'Terra Sonâmbula',
      time: 'Há 5 horas',
      rating: 5
    },
    {
      user: 'Ana Costa',
      initials: 'AC',
      text: 'Recomendo a todos que querem conhecer a realidade angolana através da ficção.',
      book: 'Yaka',
      time: 'Há 1 dia',
      rating: 4
    },
    {
      user: 'Pedro Neto',
      initials: 'PN',
      text: 'A escrita é envolvente e os personagens são muito bem construídos.',
      book: 'O Vendedor de Passados',
      time: 'Há 2 dias',
      rating: 5
    }
  ];

  list.innerHTML = sampleComments.map(comment => `
    <div class="comment-item">
      <div class="comment-header">
        <div class="comment-avatar">${comment.initials}</div>
        <div class="comment-user">
          <strong>${comment.user}</strong>
          <span>${comment.time}</span>
        </div>
        <div class="rating-stars" style="margin-left: auto;">
          ${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}
        </div>
      </div>
      <p class="comment-text">${comment.text}</p>
      <div class="comment-book">
        <i class="fas fa-book"></i> Sobre: ${comment.book}
      </div>
    </div>
  `).join('');
}

// --- Writer Profile: Community Posts ---
function loadCommunityPosts() {
  const container = document.getElementById('communityPosts');
  if (!container) return;

  const posts = [
    {
      content: 'A literatura é a memória de um povo. Sem ela, não somos nada. Escrever é resistir, é lembrar, é sonhar.',
      likes: 234,
      comments: 45,
      time: 'Há 2 horas'
    },
    {
      content: 'Acabei de terminar o rascunho do meu próximo romance. Uma história sobre a diáspora africana em Lisboa.',
      likes: 189,
      comments: 38,
      time: 'Há 1 dia'
    },
    {
      content: 'Obrigado a todos os leitores pelas mensagens de apoio. A vossa energia inspira-me a continuar a escrever.',
      likes: 156,
      comments: 22,
      time: 'Há 3 dias'
    }
  ];

  container.innerHTML = posts.map(post => `
    <div class="feed-post" style="margin-bottom: 15px;">
      <div class="post-content" style="padding: 20px;">
        <p>${post.content}</p>
      </div>
      <div class="post-stats">
        <span><i class="fas fa-heart" style="color: var(--terracotta);"></i> ${post.likes}</span>
        <span><i class="fas fa-comment"></i> ${post.comments}</span>
        <span>${post.time}</span>
      </div>
    </div>
  `).join('');
}

// --- Gradient helper ---
function getGradient(index) {
  const gradients = [
    '#C75B39, #D4A843',
    '#2D5A3D, #1E3D2A',
    '#8B4513, #D2691E',
    '#1a1a2e, #16213e',
    '#6B4226, #A0522D',
    '#2E4057, #048A81',
    '#5C4033, #8B6914',
    '#3D5A80, #98C1D9',
    '#BC6C25, #DDA15E',
    '#606C38, #283618',
    '#9B2335, #D4A843',
    '#264653, #2A9D8F',
    '#E76F51, #F4A261',
    '#6D597A, #B56576',
    '#355070, #6D597A'
  ];
  return gradients[index % gradients.length];
}

// --- Actions ---
function followWriter() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  showToast('Agora estás a seguir este escritor!');
  addActivity('follow', 'Começou a seguir um escritor');
  addPoints(5);
}

function followUser() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  showToast('Agora estás a seguir este leitor!');
}

function sendMessage() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  showToast('Mensagem enviada!');
}

function editProfile() {
  const profile = getUserProfile();
  if (!profile) return;

  // Create modal if not exists
  let modal = document.getElementById('editProfileModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editProfileModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box">
        <button class="modal-close" onclick="closeEditProfile()">&times;</button>
        <h2><i class="fas fa-edit"></i> Editar Perfil</h2>
        <form id="editProfileForm">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" id="editName" value="${profile.name}" required>
          </div>
          <div class="form-group">
            <label>Bio</label>
            <textarea id="editBio" rows="3">${profile.bio || ''}</textarea>
          </div>
          <div class="form-group">
            <label>Localização</label>
            <input type="text" id="editLocation" value="${profile.location || ''}">
          </div>
          <div class="form-group">
            <label>Géneros Favoritos</label>
            <input type="text" id="editGenres" value="${(profile.genres || []).join(', ')}" placeholder="Romance, Poesia, Ficção">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            <i class="fas fa-save"></i> Guardar
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeEditProfile();
    });

    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const user = getCurrentUser();
      if (!user) return;

      updateProfile(user.id, {
        name: document.getElementById('editName').value,
        bio: document.getElementById('editBio').value,
        location: document.getElementById('editLocation').value,
        genres: document.getElementById('editGenres').value.split(',').map(g => g.trim()).filter(Boolean)
      });

      closeEditProfile();
      updateProfileUI(document.querySelector('.profile-type-badge.escritor') !== null);
      showToast('Perfil atualizado com sucesso!');
    });
  }
  modal.classList.add('active');
}

function closeEditProfile() {
  const modal = document.getElementById('editProfileModal');
  if (modal) modal.classList.remove('active');
}

// Share profile
function shareProfile() {
  if (navigator.share) {
    navigator.share({
      title: document.getElementById('profileName')?.textContent || 'Perfil',
      url: window.location.href
    });
  } else {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link copiado!');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initProfile();
  initProfileTabs();
});

// CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .rating-stars {
    color: var(--dourado);
    font-size: 0.9rem;
    letter-spacing: 2px;
  }
`;
document.head.appendChild(style);
