/* ============================================
   RAÍZES LITERÁRIAS - Novas Funcionalidades 2
   Seguidores, Clubes, Leaderboard, Escritores,
   Resenhas, Biblioteca, Doações, Painel,
   Comparador, Amostras
   ============================================ */

// ============================================
// 1. SISTEMA DE SEGUIDORES
// ============================================
const FOLLOWERS_KEY = 'raizesFollowers';

function getFollowers() {
  return JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '{}');
}

function saveFollowers(data) {
  localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(data));
}

function toggleFollow(userId) {
  const user = getCurrentUser();
  if (!user) { showToast('Faz login para seguir', 'error'); return; }

  const followers = getFollowers();
  const myId = user.id || user.name;

  if (!followers[userId]) followers[userId] = [];
  const index = followers[userId].indexOf(myId);

  if (index > -1) {
    followers[userId].splice(index, 1);
    showToast('Deixou de seguir');
  } else {
    followers[userId].push(myId);
    showToast('Agora está a seguir!');
    addActivity('follow', `Começou a seguir ${userId}`);
  }

  saveFollowers(followers);
  updateFollowButtons();
}

function getFollowerCount(userId) {
  const followers = getFollowers();
  return (followers[userId] || []).length;
}

function isFollowing(userId) {
  const user = getCurrentUser();
  if (!user) return false;
  const followers = getFollowers();
  return (followers[userId] || []).includes(user.id || user.name);
}

function updateFollowButtons() {
  document.querySelectorAll('.btn-follow').forEach(btn => {
    const userId = btn.dataset.user;
    if (isFollowing(userId)) {
      btn.classList.add('following');
      btn.innerHTML = '<i class="fas fa-user-check"></i> Seguindo';
    } else {
      btn.classList.remove('following');
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Seguir';
    }
  });
}

// Activity Feed
const ACTIVITY_KEY = 'raizesActivity';

function getActivities() {
  return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
}

function addActivity(type, text) {
  const user = getCurrentUser();
  if (!user) return;

  const activities = getActivities();
  activities.unshift({
    id: Date.now().toString(),
    user: user.name,
    initials: getInitials(user.name),
    type: type,
    text: text,
    time: new Date().toISOString()
  });

  if (activities.length > 50) activities.length = 50;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
}

function renderActivityFeed(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const activities = getActivities();
  if (activities.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhuma actividade ainda</p>';
    return;
  }

  const icons = { follow: 'user-plus', review: 'star', purchase: 'shopping-cart', club: 'users', read: 'book-open' };

  container.innerHTML = activities.slice(0, 20).map(a => `
    <div class="activity-item">
      <div class="activity-avatar">${a.initials}</div>
      <div class="activity-content">
        <p><strong>${escapeHtml(a.user)}</strong> ${escapeHtml(a.text)}</p>
        <span class="activity-time">${getTimeAgo(a.time)}</span>
      </div>
    </div>
  `).join('');
}


// ============================================
// 2. CLUBES DE LEITURA
// ============================================
const CLUBS_KEY = 'raizesClubs';

const DEFAULT_CLUBS = [
  { id: 'mayombe', name: 'Clube Mayombe', book: 'Mayombe', author: 'Pepetela', members: 45, description: 'Discussão sobre a obra-prima de Pepetela', color: '#C75B39', icon: 'fire' },
  { id: 'terra-sonambula', name: 'Leitores de Mia Couto', book: 'Terra Sonâmbula', author: 'Mia Couto', members: 62, description: 'Explorando o universo literário de Mia Couto', color: '#2D5A3D', icon: 'leaf' },
  { id: 'classicos-cv', name: 'Clássicos de Cabo Verde', book: 'Chiquinho', author: 'Baltasar Lopes', members: 28, description: 'Literatura cabo-verdiana clássica', color: '#D4A843', icon: 'sun' },
  { id: 'poesia-africana', name: 'Poesia Africana', book: 'Vozeria', author: 'José Craveirinha', members: 35, description: 'Celebrando a poesia do continente', color: '#8B4513', icon: 'feather' },
  { id: 'ficcao-cientifica', name: 'Ficção Científica Lusófona', book: 'O Vendedor de Passados', author: 'Agualusa', members: 19, description: 'Ficção especulativa em português', color: '#1a1a2e', icon: 'rocket' },
];

function getClubs() {
  const stored = localStorage.getItem(CLUBS_KEY);
  if (!stored) {
    localStorage.setItem(CLUBS_KEY, JSON.stringify(DEFAULT_CLUBS));
    return DEFAULT_CLUBS;
  }
  return JSON.parse(stored);
}

function getClubMembers(clubId) {
  const key = 'raizesClubMembers_' + clubId;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function joinClub(clubId) {
  const user = getCurrentUser();
  if (!user) { showToast('Faz login para participar', 'error'); return; }

  const key = 'raizesClubMembers_' + clubId;
  const members = JSON.parse(localStorage.getItem(key) || '[]');
  const userId = user.id || user.name;
  const index = members.indexOf(userId);

  if (index > -1) {
    members.splice(index, 1);
    showToast('Saiu do clube');
  } else {
    members.push(userId);
    showToast('Entrou no clube!');
    addActivity('club', `Entrou no clube ${clubId}`);
  }

  localStorage.setItem(key, JSON.stringify(members));
  renderClubs();
}

function isClubMember(clubId) {
  const user = getCurrentUser();
  if (!user) return false;
  const members = getClubMembers(clubId);
  return members.includes(user.id || user.name);
}

function renderClubs() {
  const grid = document.getElementById('clubsGrid');
  if (!grid) return;

  const clubs = getClubs();

  grid.innerHTML = clubs.map(club => {
    const memberCount = club.members + getClubMembers(club.id).length;
    const isMember = isClubMember(club.id);

    return `
      <div class="club-card" style="border-left: 4px solid ${club.color}">
        <div class="club-icon" style="background: ${club.color}20; color: ${club.color}">
          <i class="fas fa-${club.icon}"></i>
        </div>
        <div class="club-info">
          <h3>${escapeHtml(club.name)}</h3>
          <p class="club-book"><i class="fas fa-book"></i> ${escapeHtml(club.book)} — ${escapeHtml(club.author)}</p>
          <p class="club-desc">${escapeHtml(club.description)}</p>
          <div class="club-meta">
            <span><i class="fas fa-users"></i> ${memberCount} membros</span>
          </div>
        </div>
        <button class="btn ${isMember ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="joinClub('${club.id}')">
          ${isMember ? 'Sair' : 'Participar'}
        </button>
      </div>
    `;
  }).join('');
}

// Club Discussions
const DISCUSSIONS_KEY = 'raizesDiscussions';

function getDiscussions(clubId) {
  const all = JSON.parse(localStorage.getItem(DISCUSSIONS_KEY) || '{}');
  return all[clubId] || [];
}

function addDiscussion(clubId, text) {
  const user = getCurrentUser();
  if (!user) return;

  const all = JSON.parse(localStorage.getItem(DISCUSSIONS_KEY) || '{}');
  if (!all[clubId]) all[clubId] = [];

  all[clubId].push({
    id: Date.now().toString(),
    user: user.name,
    initials: getInitials(user.name),
    text: text,
    time: new Date().toISOString(),
    replies: []
  });

  localStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(all));
}


// ============================================
// 3. LEADERBOARD / RANKING
// ============================================
const LEADERBOARD_KEY = 'raizesLeaderboard';

function getLeaderboard() {
  const stored = localStorage.getItem(LEADERBOARD_KEY);
  if (stored) return JSON.parse(stored);

  const defaultBoard = [
    { name: 'Maria Silva', initials: 'MS', points: 1250, books: 23, reviews: 15, country: 'Angola' },
    { name: 'João Santos', initials: 'JS', points: 980, books: 18, reviews: 12, country: 'Moçambique' },
    { name: 'Ana Oliveira', initials: 'AO', points: 870, books: 15, reviews: 10, country: 'Brasil' },
    { name: 'Carlos Mendes', initials: 'CM', points: 750, books: 12, reviews: 8, country: 'Cabo Verde' },
    { name: 'Sofia Neto', initials: 'SN', points: 620, books: 10, reviews: 7, country: 'Portugal' },
    { name: 'Pedro Lucas', initials: 'PL', points: 540, books: 9, reviews: 5, country: 'Angola' },
    { name: 'Teresa Costa', initials: 'TC', points: 480, books: 8, reviews: 6, country: 'Guiné-Bissau' },
    { name: 'Miguel Torres', initials: 'MT', points: 410, books: 7, reviews: 4, country: 'São Tomé' },
  ];

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(defaultBoard));
  return defaultBoard;
}

function addPoints(points) {
  const user = getCurrentUser();
  if (!user) return;

  const board = getLeaderboard();
  const existing = board.find(b => b.name === user.name);

  if (existing) {
    existing.points += points;
  } else {
    board.push({
      name: user.name,
      initials: getInitials(user.name),
      points: points,
      books: 0,
      reviews: 0,
      country: 'Angola'
    });
  }

  board.sort((a, b) => b.points - a.points);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboardBody');
  if (!container) return;

  const board = getLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];

  container.innerHTML = board.slice(0, 20).map((entry, i) => `
    <div class="lb-row ${i < 3 ? 'lb-top' : ''}">
      <div class="lb-rank">${i < 3 ? medals[i] : i + 1}</div>
      <div class="lb-user">
        <div class="lb-avatar">${entry.initials}</div>
        <div>
          <strong>${escapeHtml(entry.name)}</strong>
          <span>${entry.country}</span>
        </div>
      </div>
      <div class="lb-stats">
        <span><i class="fas fa-book"></i> ${entry.books}</span>
        <span><i class="fas fa-star"></i> ${entry.reviews}</span>
      </div>
      <div class="lb-points">${entry.points} pts</div>
    </div>
  `).join('');
}


// ============================================
// 4. ESCRITORES EM DESTAQUE
// ============================================
const FEATURED_WRITERS = [
  { name: 'Pepetela', country: 'Angola', bio: 'Prémio Camões 1997. Autor de Mayombe, Yaka e A Geração da Utopia.', books: 12, followers: 2300, verified: true, genre: 'Romance, Ficção Histórica', color: '#C75B39' },
  { name: 'Mia Couto', country: 'Moçambique', bio: 'Prémio Camões 2013. Mestre do realismo mágico africano.', books: 18, followers: 3100, verified: true, genre: 'Romance, Poesia', color: '#2D5A3D' },
  { name: 'José Eduardo Agualusa', country: 'Angola', bio: 'Prémio Internacional Man Booker 2017. Autor de O Vendedor de Passados.', books: 15, followers: 1800, verified: true, genre: 'Ficção, Romance', color: '#D4A843' },
  { name: 'Paulina Chiziane', country: 'Moçambique', bio: 'Primeira mulher moçambicana a publicar um romance. Voz feminina da literatura africana.', books: 8, followers: 1200, verified: true, genre: 'Romance, Ficção', color: '#8B4513' },
  { name: 'Germano Almeida', country: 'Cabo Verde', bio: 'O mais lido dos escritores cabo-verdianos. Autor de O Testamento do Sr. Napumoceno.', books: 10, followers: 950, verified: true, genre: 'Romance, Humor', color: '#1a1a2e' },
  { name: 'Ondjaki', country: 'Angola', bio: 'Prémio Jabuti 2019. Uma das vozes mais originais da nova geração.', books: 14, followers: 1500, verified: true, genre: 'Infantil, Romance', color: '#4A0E0E' },
];

function renderFeaturedWriters() {
  const grid = document.getElementById('writersGrid');
  if (!grid) return;

  grid.innerHTML = FEATURED_WRITERS.map(w => `
    <div class="writer-card">
      <div class="writer-header" style="background: linear-gradient(135deg, ${w.color}, ${w.color}cc)">
        <div class="writer-avatar-lg">${w.name.split(' ').map(n => n[0]).join('')}</div>
        ${w.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i></span>' : ''}
      </div>
      <div class="writer-body">
        <h3>${escapeHtml(w.name)}</h3>
        <span class="writer-country"><i class="fas fa-map-marker-alt"></i> ${w.country}</span>
        <p class="writer-bio">${escapeHtml(w.bio)}</p>
        <span class="writer-genre"><i class="fas fa-theater-masks"></i> ${w.genre}</span>
        <div class="writer-stats">
          <div><strong>${w.books}</strong><span>Livros</span></div>
          <div><strong>${w.followers}</strong><span>Seguidores</span></div>
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%" onclick="toggleFollow('${w.name}')">
          <i class="fas fa-user-plus"></i> Seguir
        </button>
      </div>
    </div>
  `).join('');
}


// ============================================
// 5. RESSENHAS LONGAS
// ============================================
const LONG_REVIEWS_KEY = 'raizesLongReviews';

function getLongReviews() {
  return JSON.parse(localStorage.getItem(LONG_REVIEWS_KEY) || '[]');
}

function saveLongReviews(reviews) {
  localStorage.setItem(LONG_REVIEWS_KEY, JSON.stringify(reviews));
}

function submitLongReview(bookName, title, content, rating) {
  const user = getCurrentUser();
  if (!user) { showToast('Faz login para escrever', 'error'); return; }

  const reviews = getLongReviews();
  reviews.unshift({
    id: Date.now().toString(),
    book: bookName,
    title: title,
    content: content,
    rating: rating,
    user: user.name,
    initials: getInitials(user.name),
    likes: 0,
    time: new Date().toISOString()
  });

  saveLongReviews(reviews);
  addActivity('review', `Escreveu uma resenha sobre "${bookName}"`);
  addPoints(20);
  showToast('Resenha publicada!');
}

function likeReview(reviewId) {
  const reviews = getLongReviews();
  const review = reviews.find(r => r.id === reviewId);
  if (review) {
    review.likes++;
    saveLongReviews(reviews);
    renderLongReviews();
  }
}

function renderLongReviews() {
  const container = document.getElementById('longReviewsList');
  if (!container) return;

  const reviews = getLongReviews();
  if (reviews.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhuma resenha ainda. Sê o primeiro a escrever!</p>';
    return;
  }

  container.innerHTML = reviews.slice(0, 10).map(r => `
    <div class="long-review-card">
      <div class="long-review-header">
        <div class="review-user">
          <div class="review-avatar">${r.initials}</div>
          <div>
            <strong>${escapeHtml(r.user)}</strong>
            <div class="review-stars-small">${renderStars(r.rating)}</div>
          </div>
        </div>
        <span class="review-time">${getTimeAgo(r.time)}</span>
      </div>
      <h3 class="long-review-title">${escapeHtml(r.title)}</h3>
      <p class="long-review-book"><i class="fas fa-book"></i> ${escapeHtml(r.book)}</p>
      <div class="long-review-content">${escapeHtml(r.content).replace(/\n/g, '<br>')}</div>
      <div class="long-review-actions">
        <button onclick="likeReview('${r.id}')"><i class="fas fa-thumbs-up"></i> ${r.likes}</button>
        <button><i class="fas fa-share"></i> Partilhar</button>
      </div>
    </div>
  `).join('');
}

function openLongReviewModal(bookName) {
  const user = getCurrentUser();
  if (!user) { showToast('Faz login para escrever', 'error'); return; }

  let modal = document.getElementById('longReviewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'longReviewModal';
    modal.className = 'long-review-modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="long-review-modal">
      <div class="long-review-modal-header">
        <h2><i class="fas fa-pen-fancy"></i> Escrever Resenha</h2>
        <button onclick="closeLongReviewModal()">&times;</button>
      </div>
      <div class="long-review-modal-body">
        <div class="form-group">
          <label>Livro</label>
          <input type="text" id="lrBook" value="${escapeHtml(bookName || '')}" placeholder="Nome do livro">
        </div>
        <div class="form-group">
          <label>Título da Resenha</label>
          <input type="text" id="lrTitle" placeholder="Ex: Uma obra-prima da literatura africana">
        </div>
        <div class="form-group">
          <label>Nota</label>
          <div class="review-stars" id="lrStars">
            ${[1,2,3,4,5].map(i => `<button class="review-star" data-rating="${i}" onclick="selectLRating(${i})"><i class="fas fa-star"></i></button>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Resenha</label>
          <textarea id="lrContent" rows="8" placeholder="Escreve a tua resenha completa..."></textarea>
        </div>
        <button class="btn btn-primary" style="width:100%" onclick="submitLongReviewFromModal()">
          <i class="fas fa-paper-plane"></i> Publicar Resenha
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeLongReviewModal() {
  const modal = document.getElementById('longReviewModal');
  if (modal) modal.classList.remove('active');
}

function selectLRating(rating) {
  document.querySelectorAll('#lrStars .review-star').forEach((star, i) => {
    star.classList.toggle('active', i < rating);
  });
}

function submitLongReviewFromModal() {
  const book = document.getElementById('lrBook').value;
  const title = document.getElementById('lrTitle').value;
  const content = document.getElementById('lrContent').value;
  const rating = document.querySelectorAll('#lrStars .review-star.active').length;

  if (!book || !title || !content || rating === 0) {
    showToast('Preenche todos os campos', 'error');
    return;
  }

  submitLongReview(book, title, content, rating);
  closeLongReviewModal();
  renderLongReviews();
}


// ============================================
// 6. BIBLIOTECA PESSOAL
// ============================================
const LIBRARY_KEY = 'raizesLibrary';

function getLibrary() {
  return JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
}

function addToLibrary(bookName, author, price) {
  const lib = getLibrary();
  if (lib.some(b => b.name === bookName)) return;

  lib.push({
    name: bookName,
    author: author,
    price: price,
    progress: 0,
    purchasedAt: new Date().toISOString(),
    lastRead: null
  });

  localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
}

function updateReadingProgress(bookName, progress) {
  const lib = getLibrary();
  const book = lib.find(b => b.name === bookName);
  if (book) {
    book.progress = Math.min(100, progress);
    book.lastRead = new Date().toISOString();
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
    renderLibrary();
    addActivity('read', `Atualizou a leitura de "${bookName}" para ${book.progress}%`);
    if (book.progress >= 100) addPoints(15);
  }
}

function renderLibrary() {
  const grid = document.getElementById('libraryGrid');
  if (!grid) return;

  const lib = getLibrary();
  if (lib.length === 0) {
    grid.innerHTML = '<p class="empty-msg">Sua biblioteca está vazia. <a href="loja.html" style="color:var(--terracotta)">Compre livros</a> para começar!</p>';
    return;
  }

  grid.innerHTML = lib.map(book => `
    <div class="library-card">
      <div class="library-cover" style="background: linear-gradient(135deg, var(--terracotta), var(--dourado))">
        <i class="fas fa-book"></i>
        ${book.progress >= 100 ? '<span class="library-badge-done"><i class="fas fa-check"></i></span>' : ''}
      </div>
      <div class="library-info">
        <h4>${escapeHtml(book.name)}</h4>
        <p>${escapeHtml(book.author)}</p>
        <div class="library-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${book.progress}%"></div>
          </div>
          <span>${book.progress}%</span>
        </div>
        <div class="library-actions">
          <button class="btn btn-sm btn-primary" onclick="openSampleReader(${escapeJs(book.name)})">>
            <i class="fas fa-book-open"></i> ${book.progress > 0 ? 'Continuar' : 'Ler'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="updateReadingProgress(${escapeJs(book.name)}, ${Math.min(100, book.progress + 10)})">
            <i class="fas fa-forward"></i> +10%
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Update stats
  const totalBooks = lib.length;
  const completed = lib.filter(b => b.progress >= 100).length;
  const reading = lib.filter(b => b.progress > 0 && b.progress < 100).length;

  const statsEl = document.getElementById('libraryStats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="lib-stat"><strong>${totalBooks}</strong><span>Total</span></div>
      <div class="lib-stat"><strong>${reading}</strong><span>Lendo</span></div>
      <div class="lib-stat"><strong>${completed}</strong><span>Concluídos</span></div>
    `;
  }
}


// ============================================
// 7. SISTEMA DE DOAÇÕES/TIPS
// ============================================
function openTipModal(writerName) {
  const user = getCurrentUser();
  if (!user) { showToast('Faz login para doar', 'error'); return; }

  let modal = document.getElementById('tipModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'tipModal';
    modal.className = 'tip-modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="tip-modal">
      <div class="tip-header">
        <h2><i class="fas fa-heart"></i> Apoiar ${escapeHtml(writerName)}</h2>
        <button onclick="closeTipModal()">&times;</button>
      </div>
      <div class="tip-body">
        <p>Mostre o seu apoio ao escritor com uma contribuição</p>
        <div class="tip-amounts">
          <button class="tip-amount" onclick="selectTip(500, this)">500 Kz</button>
          <button class="tip-amount selected" onclick="selectTip(1000, this)">1.000 Kz</button>
          <button class="tip-amount" onclick="selectTip(2500, this)">2.500 Kz</button>
          <button class="tip-amount" onclick="selectTip(5000, this)">5.000 Kz</button>
        </div>
        <div class="form-group">
          <label>Valor personalizado (Kz)</label>
          <input type="number" id="tipCustom" placeholder="Ou digite um valor">
        </div>
        <div class="form-group">
          <label>Mensagem (opcional)</label>
          <input type="text" id="tipMessage" placeholder="Deixe uma mensagem para o escritor">
        </div>
        <button class="btn btn-primary" style="width:100%" onclick="processTip(${escapeJs(writerName)})">
          <i class="fas fa-hand-holding-heart"></i> Enviar Doação
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeTipModal() {
  const modal = document.getElementById('tipModal');
  if (modal) modal.classList.remove('active');
}

function selectTip(amount, el) {
  document.querySelectorAll('.tip-amount').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');
  document.getElementById('tipCustom').value = '';
}

function processTip(writerName) {
  const custom = document.getElementById('tipCustom').value;
  const selected = document.querySelector('.tip-amount.selected');
  const raw = custom || (selected ? selected.textContent : '1000');
  const amount = parseInt(raw.replace(/[^\d]/g, '')) || 0;

  if (amount < 100) {
    showToast('Valor mínimo: 100 Kz', 'error');
    return;
  }

  addNotification('Doação enviada!', `Você enviou ${amount.toLocaleString()} Kz para ${writerName}`, 'system');
  addActivity('tip', `Apoiou ${writerName} com ${amount.toLocaleString()} Kz`);
  showToast(`Doação de ${amount.toLocaleString()} Kz enviada!`);
  closeTipModal();
}


// ============================================
// 8. PAINEL DO ESCRITOR (analytics)
// ============================================
function renderWriterDashboard() {
  const container = document.getElementById('writerDashboard');
  if (!container) return;

  const stats = {
    totalSales: 47,
    totalRevenue: 78500,
    totalReaders: 312,
    avgRating: 4.7,
    monthlyViews: 1240,
    newFollowers: 23
  };

  const recentSales = [
    { book: 'Mayombe', buyer: 'Maria S.', amount: 1500, date: '2026-05-20' },
    { book: 'Yaka', buyer: 'João P.', amount: 2500, date: '2026-05-19' },
    { book: 'Mayombe', buyer: 'Ana O.', amount: 1500, date: '2026-05-18' },
  ];

  container.innerHTML = `
    <div class="dash-stats-grid">
      <div class="dash-stat-card">
        <div class="dash-stat-icon" style="background: rgba(45,90,61,0.1); color: var(--verde)">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="dash-stat-info">
          <span>${stats.totalSales}</span>
          <p>Vendas</p>
        </div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-icon" style="background: rgba(199,91,57,0.1); color: var(--terracotta)">
          <i class="fas fa-coins"></i>
        </div>
        <div class="dash-stat-info">
          <span>${stats.totalRevenue.toLocaleString()} Kz</span>
          <p>Receita</p>
        </div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-icon" style="background: rgba(212,168,67,0.1); color: var(--dourado)">
          <i class="fas fa-users"></i>
        </div>
        <div class="dash-stat-info">
          <span>${stats.totalReaders}</span>
          <p>Leitores</p>
        </div>
      </div>
      <div class="dash-stat-card">
        <div class="dash-stat-icon" style="background: rgba(139,69,19,0.1); color: #8B4513">
          <i class="fas fa-star"></i>
        </div>
        <div class="dash-stat-info">
          <span>${stats.avgRating}</span>
          <p>Avaliação Média</p>
        </div>
      </div>
    </div>

    <div class="dash-section">
      <h3><i class="fas fa-chart-line"></i> Vendas Recentes</h3>
      <div class="dash-table">
        <div class="dash-table-header">
          <span>Livro</span><span>Comprador</span><span>Valor</span><span>Data</span>
        </div>
        ${recentSales.map(s => `
          <div class="dash-table-row">
            <span>${s.book}</span>
            <span>${s.buyer}</span>
            <span>${s.amount.toLocaleString()} Kz</span>
            <span>${s.date}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="dash-section">
      <h3><i class="fas fa-book"></i> Meus Livros</h3>
      <div class="dash-books-grid">
        <div class="dash-book-card">
          <div class="dash-book-cover" style="background: linear-gradient(135deg, #C75B39, #D4A843)">
            <i class="fas fa-book"></i>
          </div>
          <div class="dash-book-info">
            <strong>Mayombe</strong>
            <span>32 vendas • 4.8 ★</span>
          </div>
        </div>
        <div class="dash-book-card">
          <div class="dash-book-cover" style="background: linear-gradient(135deg, #2D5A3D, #1E3D2A)">
            <i class="fas fa-book"></i>
          </div>
          <div class="dash-book-info">
            <strong>Yaka</strong>
            <span>15 vendas • 4.7 ★</span>
          </div>
        </div>
      </div>
    </div>
  `;
}


// ============================================
// 9. COMPARADOR DE LIVROS
// ============================================
let compareList = JSON.parse(localStorage.getItem('raizesCompare') || '[]');

function saveCompareList() {
  localStorage.setItem('raizesCompare', JSON.stringify(compareList));
}

function addToCompare(bookName, author, price) {
  if (compareList.length >= 3) {
    showToast('Máximo 3 livros para comparar', 'error');
    return;
  }
  if (compareList.some(b => b.name === bookName)) {
    showToast('Livro já está na comparação', 'error');
    return;
  }

  compareList.push({ name: bookName, author: author, price: price });
  saveCompareList();
  showToast(`"${bookName}" adicionado à comparação`);
  updateCompareBar();
}

function removeFromCompare(bookName) {
  compareList = compareList.filter(b => b.name !== bookName);
  saveCompareList();
  updateCompareBar();
  renderCompareTable();
}

function updateCompareBar() {
  let bar = document.getElementById('compareBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'compareBar';
    bar.className = 'compare-bar';
    document.body.appendChild(bar);
  }

  if (compareList.length === 0) {
    bar.classList.remove('active');
    return;
  }

  bar.classList.add('active');
  bar.innerHTML = `
    <div class="compare-bar-content">
      <span><i class="fas fa-balance-scale"></i> ${compareList.length} livro(s) selecionado(s)</span>
      <div class="compare-bar-items">
        ${compareList.map(b => `<span class="compare-tag">${escapeHtml(b.name)} <button onclick="removeFromCompare(${escapeJs(b.name)})">&times;</button></span>`).join('')}
      </div>
      <a href="comparar.html" class="btn btn-primary btn-sm">Comparar</a>
    </div>
  `;
}

function renderCompareTable() {
  const container = document.getElementById('compareTable');
  if (!container) return;

  if (compareList.length < 2) {
    container.innerHTML = '<p class="empty-msg">Selecciona pelo menos 2 livros para comparar.</p>';
    return;
  }

  const sampleData = {
    'Mayombe': { genre: 'Romance', pages: 320, year: 1984, rating: 4.8, reviews: 156 },
    'Terra Sonâmbula': { genre: 'Romance', pages: 280, year: 1992, rating: 4.9, reviews: 203 },
    'Chiquinho': { genre: 'Romance', pages: 250, year: 1947, rating: 4.6, reviews: 89 },
    'O Vendedor de Passados': { genre: 'Ficção', pages: 210, year: 2004, rating: 4.7, reviews: 178 },
    'O Alquimista': { genre: 'Ficção', pages: 200, year: 1988, rating: 4.5, reviews: 312 },
    'Vozeria': { genre: 'Poesia', pages: 150, year: 1981, rating: 4.4, reviews: 67 },
    'A Costa dos Murmúrios': { genre: 'Romance', pages: 180, year: 1988, rating: 4.6, reviews: 94 },
    'Yaka': { genre: 'Romance', pages: 340, year: 1984, rating: 4.7, reviews: 128 },
  };

  const rows = ['Preço', 'Género', 'Páginas', 'Ano', 'Avaliação', 'Reviews'];

  container.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th></th>
          ${compareList.map(b => `<th>${escapeHtml(b.name)}<br><small>${escapeHtml(b.author)}</small></th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            <td><strong>${row}</strong></td>
            ${compareList.map(b => {
              const data = sampleData[b.name] || {};
              switch(row) {
                case 'Preço': return `<td>${b.price > 0 ? b.price.toLocaleString() + ' Kz' : 'N/A'}</td>`;
                case 'Género': return `<td>${data.genre || 'N/A'}</td>`;
                case 'Páginas': return `<td>${data.pages || 'N/A'}</td>`;
                case 'Ano': return `<td>${data.year || 'N/A'}</td>`;
                case 'Avaliação': return `<td>${data.rating ? renderStars(Math.round(data.rating)) + ' ' + data.rating : 'N/A'}</td>`;
                case 'Reviews': return `<td>${data.reviews || 0}</td>`;
                default: return '<td>-</td>';
              }
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}


// ============================================
// 10. LEITOR DE AMOSTRAS
// ============================================
const SAMPLE_CONTENT = {
  'Mayombe': `CAPÍTULO 1 — A FLORESTA

A floresta era um universo à parte. O sargento comandava o pelotão que se embrenhava no Mayombe, a floresta sagrada dos Bakongo.

O verde era tão denso que parecia engolir a luz do sol. Os homens avançavam em fila indiana, cortando a vegetação com facões, abrindo caminho onde não havia caminho.

— Avante! — gritou o comandante.

Mas a floresta não se rendia facilmente. Era como se cada árvore, cada folha, cada raiz tentasse deter aqueles homens armados que ousavam perturbar o seu silêncio milenar.

O soldado que escrevia o diário olhou para trás. Atrás dele, a fileira de homens parecia uma serpente verde, perdida na imensidão do Mayombe.

"Escrevo porque preciso entender. Escrevo porque as palavras são a minha única arma contra o esquecimento."`,

  'Terra Sonâmbula': `CAPÍTULO 1 — O RAPAZ DA FACA

Muidinga acordou com o cheiro de fumo. O autocarro em que viajava tinha-se incendiado e os passageiros dispersaram pela savana.

Tinha um caderno nas mãos. Não sabia como lá tinha chegado. Abriu-o e começou a ler:

"Querido pai, escrevo-te estas linhas de um lugar onde a terra sonha..."

As palavras flutuavam como pássaros. Muidinga sentou-se na areia da estrada e leu enquanto o sol descia lentamente no horizonte.

A savana estendia-se até onde a vista alcançava, seca e dourada. Mas nas páginas do caderno, tudo era verde e úmido. Era como se o caderno contivesse outro mundo.`,

  'Chiquinho': `CAPÍTULO 1 — A INFÂNCIA

Chiquinho cresceu na ilha de São Vicente, entre o mar e o vento. A sua infância foi feita de dias quentes e noites estreladas.

A mãe lavava roupa no ribeiro enquanto ele corria descalço pelas ruas de terra batida. A vida era simples, mas tinha uma beleza que só se percebe quando se perde.

— Chiquinho! — chamava a mãe. — Vem jantar!

Mas ele já estava longe, a explorar os recantos da ilha, a descobrir segredos que o mar trazia nas conchas.`,
};

function openSampleReader(bookName) {
  let modal = document.getElementById('sampleReaderModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sampleReaderModal';
    modal.className = 'sample-reader-overlay';
    document.body.appendChild(modal);
  }

  const content = SAMPLE_CONTENT[bookName] || `Amostra de "${bookName}"\n\nEsta é uma pré-visualização do livro. O conteúdo completo está disponível na versão completa.\n\nAdquire já na nossa loja!`;

  modal.innerHTML = `
    <div class="sample-reader">
      <div class="sample-reader-header">
        <div>
          <h2>${escapeHtml(bookName)}</h2>
          <span>Amostra Gratuita</span>
        </div>
        <button onclick="closeSampleReader()">&times;</button>
      </div>
      <div class="sample-reader-body" id="sampleReaderBody">
        <div class="sample-content">${escapeHtml(content).replace(/\n/g, '<br>')}</div>
      </div>
      <div class="sample-reader-footer">
        <button class="btn btn-secondary" onclick="closeSampleReader()">Fechar</button>
        <a href="loja.html" class="btn btn-primary"><i class="fas fa-shopping-cart"></i> Completo</a>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeSampleReader() {
  const modal = document.getElementById('sampleReaderModal');
  if (modal) modal.classList.remove('active');
}


// ============================================
// INIT - Carregar novas funcionalidades
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  updateFollowButtons();

  // Add compare button to book cards
  document.querySelectorAll('.livro-card').forEach(card => {
    const bookName = card.querySelector('h4')?.textContent;
    const author = card.querySelector('.autor')?.textContent;
    const preco = card.querySelector('.preco')?.textContent;

    if (bookName && !card.querySelector('.btn-compare')) {
      const precoSection = card.querySelector('.livro-preco');
      if (precoSection) {
        const price = parseInt(preco?.replace(/[^0-9]/g, '')) || 0;
        const compareBtn = document.createElement('button');
        compareBtn.className = 'btn-compare';
        compareBtn.title = 'Comparar';
        compareBtn.innerHTML = '<i class="fas fa-balance-scale"></i>';
        compareBtn.onclick = () => addToCompare(bookName, author, price);
        precoSection.appendChild(compareBtn);
      }
    }
  });

  renderCompareTable();
  renderLibrary();
  renderWriterDashboard();
  renderLongReviews();
  updateCompareBar();
});
