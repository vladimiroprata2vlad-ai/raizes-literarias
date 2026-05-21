/* ============================================
   RAÍZES LITERÁRIAS - Novas Funcionalidades
   Favoritos, Carrinho, Avaliações, Notificações,
   Busca Global, Chat
   ============================================ */

// ============================================
// UTILITY
// ============================================

// Toast notification system
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle'
  };

  toast.innerHTML = `<i class="${icons[type] || icons.success}"></i> ${message}`;
  toast.className = `toast show ${type}`;

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function getCurrentTime() {
  const now = new Date();
  return now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
}

// ============================================
// 1. SISTEMA DE FAVORITOS
// ============================================
const FAVORITES_KEY = 'raizesFavorites';

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function toggleFavorite(bookName, bookAuthor, bookPrice) {
  const favs = getFavorites();
  const index = favs.findIndex(f => f.name === bookName);

  if (index > -1) {
    favs.splice(index, 1);
    showToast('Removido dos favoritos');
  } else {
    favs.push({
      name: bookName,
      author: bookAuthor || 'Desconhecido',
      price: bookPrice || 0,
      addedAt: new Date().toISOString()
    });
    showToast('Adicionado aos favoritos!');
  }

  saveFavorites(favs);
  updateFavoriteButtons();
  return index === -1;
}

function isFavorite(bookName) {
  return getFavorites().some(f => f.name === bookName);
}

function updateFavoriteButtons() {
  document.querySelectorAll('.btn-favorite').forEach(btn => {
    const bookName = btn.dataset.book;
    if (isFavorite(bookName)) {
      btn.classList.add('favorited');
      btn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
      btn.classList.remove('favorited');
      btn.innerHTML = '<i class="far fa-heart"></i>';
    }
  });
}

function renderFavoritesGrid() {
  const grid = document.getElementById('favoritesGrid');
  if (!grid) return;

  const favs = getFavorites();
  if (favs.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--cinza);padding:40px;">Nenhum favorito ainda. Explore a <a href="loja.html" style="color:var(--terracotta);">loja</a> e adicione livros!</p>';
    return;
  }

  grid.innerHTML = favs.map(fav => `
    <div class="livro-card">
      <div class="livro-cover">
        <div class="livro-cover-img" style="background: linear-gradient(135deg, var(--terracotta), var(--dourado)); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white;">
          <i class="fas fa-book"></i>
        </div>
      </div>
      <div class="livro-info">
        <h4>${escapeHtml(fav.name)}</h4>
        <p class="autor">${escapeHtml(fav.author)}</p>
      </div>
      <div class="livro-preco">
        <span class="preco">${fav.price > 0 ? fav.price.toLocaleString() + ' Kz' : 'Grátis'}</span>
        <button class="btn-comprar" onclick="addToCart('${escapeHtml(fav.name)}', ${fav.price})">
          <i class="fas fa-cart-plus"></i>
        </button>
      </div>
    </div>
  `).join('');
}


// ============================================
// 2. CARRINHO DE COMPRAS FUNCIONAL
// ============================================
const CART_KEY = 'raizesCart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(bookName, price) {
  if (typeof checkLogin === 'function' && !checkLogin('buy')) return;
  const cart = getCart();
  const existing = cart.find(item => item.name === bookName);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      name: bookName,
      price: price,
      quantity: 1
    });
  }

  saveCart(cart);
  showToast(`"${bookName}" adicionado ao carrinho!`);
}

function removeFromCart(bookName) {
  let cart = getCart();
  cart = cart.filter(item => item.name !== bookName);
  saveCart(cart);
  renderCartModal();
  showToast('Item removido do carrinho');
}

function updateCartQuantity(bookName, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === bookName);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(bookName);
      return;
    }
    saveCart(cart);
    renderCartModal();
  }
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = getCartCount();
  }
}

function openCart() {
  let modal = document.getElementById('cartModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.className = 'cart-modal-overlay';
    document.body.appendChild(modal);
  }
  renderCartModal();
  modal.classList.add('active');
}

function closeCart() {
  const modal = document.getElementById('cartModal');
  if (modal) modal.classList.remove('active');
}

function renderCartModal() {
  const modal = document.getElementById('cartModal');
  if (!modal) return;

  const cart = getCart();
  const total = getCartTotal();

  modal.innerHTML = `
    <div class="cart-modal">
      <div class="cart-header">
        <h2><i class="fas fa-shopping-cart"></i> Carrinho</h2>
        <button class="cart-close" onclick="closeCart()">&times;</button>
      </div>
      <div class="cart-body">
        ${cart.length === 0 ? `
          <div class="cart-empty">
            <i class="fas fa-shopping-basket"></i>
            <p>O carrinho está vazio</p>
            <a href="loja.html" class="btn btn-primary btn-sm">Explorar Loja</a>
          </div>
        ` : cart.map(item => `
          <div class="cart-item">
            <div class="cart-item-cover" style="background: linear-gradient(135deg, var(--terracotta), var(--dourado));">
              <i class="fas fa-book"></i>
            </div>
            <div class="cart-item-info">
              <strong>${escapeHtml(item.name)}</strong>
              <span class="cart-item-price">${item.price > 0 ? item.price.toLocaleString() + ' Kz' : 'Grátis'}</span>
            </div>
            <div class="cart-item-qty">
              <button onclick="updateCartQuantity('${escapeHtml(item.name)}', -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="updateCartQuantity('${escapeHtml(item.name)}', 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${escapeHtml(item.name)}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `).join('')}
      </div>
      ${cart.length > 0 ? `
        <div class="cart-footer">
          <div class="cart-total">
            <span>Total:</span>
            <strong>${total.toLocaleString()} Kz</strong>
          </div>
          <a href="checkout.html" class="btn btn-primary" style="width:100%;">
            <i class="fas fa-credit-card"></i> Finalizar Compra
          </a>
        </div>
      ` : ''}
    </div>
  `;
}


// ============================================
// 3. SISTEMA DE AVALIAÇÕES / COMENTÁRIOS
// ============================================
const REVIEWS_KEY = 'raizesReviews';

function getReviews() {
  return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
}

function saveReviews(reviews) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

function getBookReviews(bookName) {
  return getReviews().filter(r => r.book === bookName);
}

function getBookRating(bookName) {
  const reviews = getBookReviews(bookName);
  if (reviews.length === 0) return 0;
  return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
}

function addReview(bookName, rating, comment) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Faz login para avaliar', 'error');
    return false;
  }

  const reviews = getReviews();
  const existing = reviews.findIndex(r => r.book === bookName && r.user === user.name);

  if (existing > -1) {
    reviews[existing].rating = rating;
    reviews[existing].comment = comment;
    reviews[existing].updatedAt = new Date().toISOString();
  } else {
    reviews.push({
      id: Date.now().toString(),
      book: bookName,
      user: user.name,
      initials: getInitials(user.name),
      rating: rating,
      comment: comment,
      createdAt: new Date().toISOString()
    });
  }

  saveReviews(reviews);
  showToast('Avaliação salva!');
  return true;
}

function openReviewModal(bookName) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Faz login para avaliar', 'error');
    return;
  }

  let modal = document.getElementById('reviewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reviewModal';
    modal.className = 'review-modal-overlay';
    document.body.appendChild(modal);
  }

  const existing = getReviews().find(r => r.book === bookName && r.user === user.name);
  const currentRating = existing ? existing.rating : 0;
  const currentComment = existing ? existing.comment : '';

  modal.innerHTML = `
    <div class="review-modal">
      <div class="review-header">
        <h2><i class="fas fa-star"></i> Avaliar "${escapeHtml(bookName)}"</h2>
        <button class="review-close" onclick="closeReviewModal()">&times;</button>
      </div>
      <div class="review-body">
        <div class="review-stars" id="reviewStars">
          ${[1,2,3,4,5].map(i => `
            <button class="review-star ${i <= currentRating ? 'active' : ''}" data-rating="${i}" onclick="selectRating(${i})">
              <i class="fas fa-star"></i>
            </button>
          `).join('')}
        </div>
        <textarea id="reviewComment" rows="4" placeholder="Escreve a tua avaliação...">${escapeHtml(currentComment)}</textarea>
        <button class="btn btn-primary" style="width:100%;" onclick="submitReview('${escapeHtml(bookName)}')">
          <i class="fas fa-paper-plane"></i> Enviar Avaliação
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) modal.classList.remove('active');
}

function selectRating(rating) {
  document.querySelectorAll('#reviewStars .review-star').forEach((star, i) => {
    star.classList.toggle('active', i < rating);
  });
}

function submitReview(bookName) {
  const rating = document.querySelectorAll('#reviewStars .review-star.active').length;
  const comment = document.getElementById('reviewComment').value;

  if (rating === 0) {
    showToast('Selecciona uma nota', 'error');
    return;
  }

  addReview(bookName, rating, comment);
  closeReviewModal();
}

function renderBookReviews(bookName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const reviews = getBookReviews(bookName);
  const avgRating = getBookRating(bookName);

  container.innerHTML = `
    <div class="reviews-summary">
      <div class="reviews-avg">
        <span class="avg-number">${avgRating}</span>
        <div class="avg-stars">
          ${renderStars(Math.round(avgRating))}
        </div>
        <span class="avg-count">${reviews.length} avaliação(ões)</span>
      </div>
    </div>
    <div class="reviews-list">
      ${reviews.map(r => `
        <div class="review-item">
          <div class="review-user">
            <div class="review-avatar">${r.initials}</div>
            <div>
              <strong>${escapeHtml(r.user)}</strong>
              <div class="review-stars-small">${renderStars(r.rating)}</div>
            </div>
          </div>
          <p class="review-text">${escapeHtml(r.comment)}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStars(count) {
  return [1,2,3,4,5].map(i =>
    `<i class="fa${i <= count ? 's' : 'r'} fa-star"></i>`
  ).join('');
}


// ============================================
// 4. SISTEMA DE NOTIFICAÇÕES
// ============================================
const NOTIF_KEY = 'raizesNotifications';

function getNotifications() {
  return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
}

function saveNotifications(notifs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  updateNotifBadge();
}

function addNotification(title, message, type) {
  const notifs = getNotifications();
  notifs.unshift({
    id: Date.now().toString(),
    title,
    message,
    type, // 'book', 'message', 'system'
    read: false,
    time: new Date().toISOString()
  });
  saveNotifications(notifs);
}

function markNotifRead(id) {
  const notifs = getNotifications();
  const notif = notifs.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveNotifications(notifs);
  }
}

function markAllRead() {
  const notifs = getNotifications();
  notifs.forEach(n => n.read = true);
  saveNotifications(notifs);
  renderNotifPanel();
}

function getUnreadCount() {
  return getNotifications().filter(n => !n.read).length;
}

function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (badge) {
    const count = getUnreadCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel) {
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
      renderNotifPanel();
    }
  }
}

function renderNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;

  const notifs = getNotifications();

  panel.innerHTML = `
    <div class="notif-header">
      <h3><i class="fas fa-bell"></i> Notificações</h3>
      ${notifs.length > 0 ? '<button onclick="markAllRead()">Marcar todas como lidas</button>' : ''}
    </div>
    <div class="notif-list">
      ${notifs.length === 0 ? `
        <div class="notif-empty">
          <i class="fas fa-bell-slash"></i>
          <p>Sem notificações</p>
        </div>
      ` : notifs.slice(0, 20).map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
          <div class="notif-icon ${n.type}">
            <i class="fas fa-${n.type === 'book' ? 'book' : n.type === 'message' ? 'envelope' : 'info-circle'}"></i>
          </div>
          <div class="notif-content">
            <strong>${escapeHtml(n.title)}</strong>
            <p>${escapeHtml(n.message)}</p>
            <span class="notif-time">${getTimeAgo(n.time)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Agora';
  if (diff < 3600) return `Há ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Há ${Math.floor(diff/3600)}h`;
  return `Há ${Math.floor(diff/86400)} dias`;
}

// Add default notifications on first load
function initNotifications() {
  const notifs = getNotifications();
  if (notifs.length === 0) {
    addNotification('Bem-vindo!', 'Bem-vindo ao Raízes Literárias. Explora a nossa colecção!', 'system');
    addNotification('Novo livro', 'Terra Sonâmbula de Mia Couto foi adicionado à loja', 'book');
    addNotification('Clube de Leitura', 'O clube Mayombe está a aceitar novos membros', 'message');
  }
  updateNotifBadge();
}


// ============================================
// 5. BUSCA GLOBAL
// ============================================

const SEARCH_DATA = [
  // Livros
  { type: 'livro', name: 'Mayombe', author: 'Pepetela', page: 'loja.html', country: 'Angola' },
  { type: 'livro', name: 'Terra Sonâmbula', author: 'Mia Couto', page: 'loja.html', country: 'Moçambique' },
  { type: 'livro', name: 'Chiquinho', author: 'Baltasar Lopes', page: 'loja.html', country: 'Cabo Verde' },
  { type: 'livro', name: 'O Vendedor de Passados', author: 'José Eduardo Agualusa', page: 'loja.html', country: 'Angola' },
  { type: 'livro', name: 'O Alquimista', author: 'Paulo Coelho', page: 'loja.html', country: 'Internacional' },
  { type: 'livro', name: 'Uma Caderneta de Calombo', author: 'Amílcar Cabral', page: 'loja.html', country: 'Guiné-Bissau' },
  { type: 'livro', name: 'A Costa dos Murmúrios', author: 'Lília Momplé', page: 'loja.html', country: 'São Tomé' },
  { type: 'livro', name: 'Yaka', author: 'Pepetela', page: 'loja.html', country: 'Angola' },
  { type: 'livro', name: 'Vozeria', author: 'José Craveirinha', page: 'loja.html', country: 'Moçambique' },

  // Autores
  { type: 'autor', name: 'Pepetela', page: 'perfil-escritor.html', country: 'Angola' },
  { type: 'autor', name: 'Mia Couto', page: 'perfil-escritor.html', country: 'Moçambique' },
  { type: 'autor', name: 'Baltasar Lopes', page: 'perfil-escritor.html', country: 'Cabo Verde' },
  { type: 'autor', name: 'José Eduardo Agualusa', page: 'perfil-escritor.html', country: 'Angola' },
  { type: 'autor', name: 'Paulo Coelho', page: 'perfil-escritor.html', country: 'Brasil' },
  { type: 'autor', name: 'Amílcar Cabral', page: 'perfil-escritor.html', country: 'Guiné-Bissau' },
  { type: 'autor', name: 'José Craveirinha', page: 'perfil-escritor.html', country: 'Moçambique' },
  { type: 'autor', name: 'Manuel Rui', page: 'perfil-escritor.html', country: 'Angola' },

  // Páginas
  { type: 'pagina', name: 'Livrarias', page: 'loja.html' },
  { type: 'pagina', name: 'Comunidade', page: 'comunidade.html' },
  { type: 'pagina', name: 'Audiobooks', page: 'audiobooks.html' },
  { type: 'pagina', name: 'Entrevistas', page: 'entrevistas.html' },
  { type: 'pagina', name: 'Países', page: 'paises.html' },
  { type: 'pagina', name: 'Contato', page: 'contato.html' },

  // Géneros
  { type: 'genero', name: 'Romance', page: 'loja.html' },
  { type: 'genero', name: 'Poesia', page: 'loja.html' },
  { type: 'genero', name: 'Ficção', page: 'loja.html' },
  { type: 'genero', name: 'Fantasia', page: 'loja.html' },
  { type: 'genero', name: 'Terror', page: 'loja.html' },
  { type: 'genero', name: 'Ficção Científica', page: 'loja.html' },
  { type: 'genero', name: 'Biografia', page: 'loja.html' },
  { type: 'genero', name: 'Ensaio', page: 'loja.html' },
];

function performSearch(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return SEARCH_DATA.filter(item =>
    item.name.toLowerCase().includes(q) ||
    (item.author && item.author.toLowerCase().includes(q)) ||
    (item.country && item.country.toLowerCase().includes(q))
  ).slice(0, 10);
}

function openGlobalSearch() {
  let modal = document.getElementById('globalSearchModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'globalSearchModal';
    modal.className = 'global-search-overlay';
    modal.innerHTML = `
      <div class="global-search-box">
        <div class="global-search-input-wrap">
          <i class="fas fa-search"></i>
          <input type="text" id="globalSearchInput" placeholder="Pesquisar livros, autores, países..." autocomplete="off">
          <button onclick="closeGlobalSearch()">&times;</button>
        </div>
        <div class="global-search-results" id="globalSearchResults"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGlobalSearch();
    });

    document.getElementById('globalSearchInput').addEventListener('input', (e) => {
      const results = performSearch(e.target.value);
      renderSearchResults(results, e.target.value);
    });
  }

  modal.classList.add('active');
  setTimeout(() => document.getElementById('globalSearchInput').focus(), 100);
}

function closeGlobalSearch() {
  const modal = document.getElementById('globalSearchModal');
  if (modal) modal.classList.remove('active');
}

function renderSearchResults(results, query) {
  const container = document.getElementById('globalSearchResults');
  if (!container) return;

  if (!query || query.length < 2) {
    container.innerHTML = '<p class="search-hint">Digite pelo menos 2 caracteres...</p>';
    return;
  }

  if (results.length === 0) {
    container.innerHTML = '<p class="search-hint">Nenhum resultado encontrado</p>';
    return;
  }

  const icons = { livro: 'book', autor: 'pen-fancy', pagina: 'file-alt', genero: 'theater-masks' };
  const labels = { livro: 'Livro', autor: 'Autor', pagina: 'Página', genero: 'Género' };

  container.innerHTML = results.map(r => `
    <a href="${r.page}" class="search-result-item">
      <div class="search-result-icon">
        <i class="fas fa-${icons[r.type]}"></i>
      </div>
      <div class="search-result-info">
        <strong>${highlightMatch(r.name, query)}</strong>
        <span>${labels[r.type]}${r.author ? ' — ' + r.author : ''}${r.country ? ' • ' + r.country : ''}</span>
      </div>
    </a>
  `).join('');
}

function highlightMatch(text, query) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Keyboard shortcut for search
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openGlobalSearch();
  }
  if (e.key === 'Escape') {
    closeGlobalSearch();
    closeCart();
    closeReviewModal();
    closeChat();
  }
});


// ============================================
// 6. CHAT ENTRE MEMBROS
// ============================================
const CHAT_KEY = 'raizesChatMessages';

function getChatMessages() {
  return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
}

function saveChatMessages(msgs) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));
}

function openChat() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Faz login para usar o chat', 'error');
    return;
  }

  let chatPanel = document.getElementById('chatPanel');
  if (!chatPanel) {
    chatPanel = document.createElement('div');
    chatPanel.id = 'chatPanel';
    chatPanel.className = 'chat-panel';
    document.body.appendChild(chatPanel);
  }

  renderChatPanel();
  chatPanel.classList.toggle('active');
}

function closeChat() {
  const chatPanel = document.getElementById('chatPanel');
  if (chatPanel) chatPanel.classList.remove('active');
}

function renderChatPanel() {
  const chatPanel = document.getElementById('chatPanel');
  if (!chatPanel) return;

  const user = getCurrentUser();
  const messages = getChatMessages();

  chatPanel.innerHTML = `
    <div class="chat-header">
      <h3><i class="fas fa-comments"></i> Chat da Comunidade</h3>
      <button onclick="closeChat()">&times;</button>
    </div>
    <div class="chat-messages" id="chatMessagesList">
      ${messages.length === 0 ? `
        <div class="chat-empty">
          <i class="fas fa-comment-dots"></i>
          <p>Seja o primeiro a enviar uma mensagem!</p>
        </div>
      ` : messages.map(m => `
        <div class="chat-msg ${m.user === user.name ? 'sent' : 'received'}">
          <div class="chat-msg-avatar">${getInitials(m.user)}</div>
          <div class="chat-msg-content">
            <strong>${escapeHtml(m.user)}</strong>
            <p>${escapeHtml(m.text)}</p>
            <span>${getTimeAgo(m.time)}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="chat-input-wrap">
      <input type="text" id="chatInputField" placeholder="Escrever mensagem..." onkeypress="if(event.key==='Enter')sendChatMessage()">
      <button onclick="sendChatMessage()"><i class="fas fa-paper-plane"></i></button>
    </div>
  `;

  const msgList = document.getElementById('chatMessagesList');
  if (msgList) msgList.scrollTop = msgList.scrollHeight;
}

function sendChatMessage() {
  const user = getCurrentUser();
  if (!user) return;

  const input = document.getElementById('chatInputField');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const messages = getChatMessages();
  messages.push({
    id: Date.now().toString(),
    user: user.name,
    text: text,
    time: new Date().toISOString()
  });
  saveChatMessages(messages);

  input.value = '';
  renderChatPanel();

  // Simulate response
  setTimeout(() => {
    const responses = [
      'Que interessante! Concordo plenamente.',
      'Ótima reflexão sobre literatura!',
      'A cultura lusófona é realmente rica.',
      'Obrigado por compartilhar!',
      'Vamos continuar esta discussão no clube de leitura.'
    ];
    const msgs = getChatMessages();
    msgs.push({
      id: Date.now().toString(),
      user: 'Comunidade',
      text: responses[Math.floor(Math.random() * responses.length)],
      time: new Date().toISOString()
    });
    saveChatMessages(msgs);
    renderChatPanel();
  }, 2000);
}


// ============================================
// INIT - Carregar todas as funcionalidades
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNotifications();
  updateCartBadge();
  updateFavoriteButtons();

  // Add search button to navbar
  const navActions = document.querySelector('.nav-actions');
  if (navActions && !document.getElementById('globalSearchBtn')) {
    const searchBtn = document.createElement('button');
    searchBtn.id = 'globalSearchBtn';
    searchBtn.className = 'search-btn';
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    searchBtn.onclick = openGlobalSearch;
    searchBtn.title = 'Pesquisar (Ctrl+K)';
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      navActions.insertBefore(searchBtn, themeToggle);
    }
  }

  // Add notification bell to navbar
  if (navActions && !document.getElementById('notifBell')) {
    const bell = document.createElement('div');
    bell.id = 'notifBell';
    bell.className = 'notif-bell-wrap';
    bell.innerHTML = `
      <button class="notif-bell-btn" onclick="toggleNotifPanel()">
        <i class="fas fa-bell"></i>
        <span class="notif-badge" id="notifBadge" style="display:none">0</span>
      </button>
      <div class="notif-panel" id="notifPanel"></div>
    `;
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      navActions.insertBefore(bell, themeToggle);
    }
  }

  // Add chat FAB
  if (!document.getElementById('chatFab')) {
    const fab = document.createElement('button');
    fab.id = 'chatFab';
    fab.className = 'chat-fab';
    fab.innerHTML = '<i class="fas fa-comments"></i>';
    fab.onclick = openChat;
    fab.title = 'Chat da Comunidade';
    document.body.appendChild(fab);
  }

  updateNotifBadge();
});
