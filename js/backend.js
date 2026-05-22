/* ============================================
   RAÍZES LITERÁRIAS - Backend Interativo
   Filtros, Pesquisa, Rankings, Interações
   ============================================ */

// ============================================
// 1. FILTROS DA LOJA
// ============================================
function initShopFilters() {
  const filtroPais = document.getElementById('filtroPais');
  const filtroPreco = document.getElementById('filtroPreco');
  const filtroGenero = document.getElementById('filtroGenero');
  const ordenar = document.getElementById('ordenar');
  const grid = document.getElementById('lojaGrid');

  if (!grid) return;

  function applyFilters() {
    const pais = filtroPais?.value || 'todos';
    const preco = filtroPreco?.value || 'todos';
    const genero = filtroGenero?.value || 'todos';
    const ordem = ordenar?.value || 'relevancia';

    const cards = grid.querySelectorAll('.livro-card');
    let visibleCards = [];

    cards.forEach(card => {
      const cardPais = card.dataset.pais || '';
      const cardPreco = parseInt(card.dataset.preco) || 0;
      const cardGenero = card.dataset.genero || '';

      let showPais = pais === 'todos' || cardPais === pais;
      let showPreco = true;
      if (preco === 'ate1000') showPreco = cardPreco <= 1000;
      else if (preco === 'ate2000') showPreco = cardPreco <= 2000;
      else if (preco === 'acima2000') showPreco = cardPreco > 2000;
      let showGenero = genero === 'todos' || cardGenero === genero;

      if (showPais && showPreco && showGenero) {
        card.style.display = '';
        visibleCards.push(card);
      } else {
        card.style.display = 'none';
      }
    });

    // Ordenação
    if (ordem !== 'relevancia' && visibleCards.length > 0) {
      const parent = visibleCards[0].parentNode;
      visibleCards.sort((a, b) => {
        const priceA = parseInt(a.dataset.preco) || 0;
        const priceB = parseInt(b.dataset.preco) || 0;
        if (ordem === 'preco-menor') return priceA - priceB;
        if (ordem === 'preco-maior') return priceB - priceA;
        return 0;
      });
      visibleCards.forEach(card => parent.appendChild(card));
    }

    // Atualizar contador
    const counter = document.getElementById('lojaCounter');
    if (counter) counter.textContent = `${visibleCards.length} livro(s) encontrado(s)`;
  }

  [filtroPais, filtroPreco, filtroGenero, ordenar].forEach(el => {
    if (el) el.addEventListener('change', applyFilters);
  });

  // Contador inicial
  const totalCards = grid.querySelectorAll('.livro-card').length;
  const counter = document.getElementById('lojaCounter');
  if (counter) counter.textContent = `${totalCards} livro(s) encontrado(s)`;
}

// ============================================
// 2. PESQUISA GLOBAL (todas as páginas)
// ============================================
const ALL_BOOKS = [
  { name: 'Mayombe', author: 'Pepetela', country: 'Angola', price: 1500, genre: 'Romance', pages: 320, year: 1984 },
  { name: 'Terra Sonâmbula', author: 'Mia Couto', country: 'Moçambique', price: 1500, genre: 'Romance', pages: 280, year: 1992 },
  { name: 'Chiquinho', author: 'Baltasar Lopes', country: 'Cabo Verde', price: 1200, genre: 'Romance', pages: 250, year: 1947 },
  { name: 'O Vendedor de Passados', author: 'José Eduardo Agualusa', country: 'Angola', price: 2000, genre: 'Ficção', pages: 210, year: 2004 },
  { name: 'O Alquimista', author: 'Paulo Coelho', country: 'Internacional', price: 1800, genre: 'Ficção', pages: 200, year: 1988 },
  { name: 'Vozeria', author: 'José Craveirinha', country: 'Moçambique', price: 900, genre: 'Poesia', pages: 150, year: 1981 },
  { name: 'A Costa dos Murmúrios', author: 'Lília Momplé', country: 'São Tomé', price: 1200, genre: 'Romance', pages: 180, year: 1988 },
  { name: 'Yaka', author: 'Pepetela', country: 'Angola', price: 2500, genre: 'Romance', pages: 340, year: 1984 },
  { name: 'Jerusalém', author: 'Mia Couto', country: 'Moçambique', price: 1600, genre: 'Romance', pages: 240, year: 2009 },
  { name: 'O Testamento do Sr. Napumoceno', author: 'Germano Almeida', country: 'Cabo Verde', price: 1400, genre: 'Romance', pages: 280, year: 1989 },
  { name: 'A Viagem do Marujo', author: 'Luís Cardoso', country: 'Timor-Leste', price: 1100, genre: 'Romance', pages: 200, year: 1998 },
  { name: 'A Geração da Utopia', author: 'Pepetela', country: 'Angola', price: 1800, genre: 'Romance', pages: 300, year: 1992 },
  { name: 'Os Transparentes', author: 'Ondjaki', country: 'Angola', price: 1400, genre: 'Ficção', pages: 180, year: 2012 },
  { name: 'A Varanda do Frangipani', author: 'Mia Couto', country: 'Moçambique', price: 1500, genre: 'Ficção', pages: 200, year: 1996 },
  { name: 'Estórias de Mimoló', author: 'Paulina Chiziane', country: 'Moçambique', price: 1300, genre: 'Ficção', pages: 220, year: 2007 },
  { name: 'Os Lusíadas', author: 'Luís de Camões', country: 'Portugal', price: 2000, genre: 'Poesia', pages: 500, year: 1572 },
  { name: 'Livro do Desassossego', author: 'Fernando Pessoa', country: 'Portugal', price: 1800, genre: 'Ficção', pages: 400, year: 1982 },
  { name: 'Memorial do Convento', author: 'José Saramago', country: 'Portugal', price: 1600, genre: 'Romance', pages: 350, year: 1982 },
  { name: 'Mestre Tamoda', author: 'Uanhenga Xitu', country: 'Guiné-Bissau', price: 1000, genre: 'Conto', pages: 160, year: 1985 },
  { name: 'Uma Caderneta de Calombo', author: 'Amílcar Cabral', country: 'Guiné-Bissau', price: 1800, genre: 'Ensaio', pages: 120, year: 1976 },
];

function initGlobalSearch() {
  // Create global search overlay if not exists
  let overlay = document.getElementById('globalSearchOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'globalSearchOverlay';
    overlay.className = 'global-search-overlay';
    overlay.innerHTML = `
      <div class="global-search-box">
        <div class="global-search-header">
          <i class="fas fa-search"></i>
          <input type="text" id="globalSearchInput" placeholder="Pesquisar livros, autores, países..." autocomplete="off">
          <kbd>ESC</kbd>
        </div>
        <div id="globalSearchResults" class="global-search-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeGlobalSearch();
    });

    document.getElementById('globalSearchInput').addEventListener('input', (e) => {
      performGlobalSearch(e.target.value);
    });
  }

  // Keyboard shortcut Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openGlobalSearch();
    }
  });

  // Search button in navbar
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', openGlobalSearch);
  }
}

function openGlobalSearch() {
  const overlay = document.getElementById('globalSearchOverlay');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => document.getElementById('globalSearchInput')?.focus(), 100);
  }
}

function closeGlobalSearch() {
  const overlay = document.getElementById('globalSearchOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    const input = document.getElementById('globalSearchInput');
    if (input) input.value = '';
    const results = document.getElementById('globalSearchResults');
    if (results) results.innerHTML = '';
  }
}

function performGlobalSearch(query) {
  const results = document.getElementById('globalSearchResults');
  if (!results) return;

  if (!query || query.length < 2) {
    results.innerHTML = '<p class="search-hint">Escreve pelo menos 2 caracteres...</p>';
    return;
  }

  const q = query.toLowerCase();
  const matches = ALL_BOOKS.filter(book =>
    book.name.toLowerCase().includes(q) ||
    book.author.toLowerCase().includes(q) ||
    book.country.toLowerCase().includes(q) ||
    book.genre.toLowerCase().includes(q)
  ).slice(0, 10);

  if (matches.length === 0) {
    results.innerHTML = '<p class="search-hint">Nenhum resultado encontrado</p>';
    return;
  }

  results.innerHTML = matches.map(book => `
    <div class="search-result-item" onclick="handleSearchSelect('${escapeHtml(book.name)}', ${book.price})">
      <div class="search-result-cover" style="background: linear-gradient(135deg, var(--terracotta), var(--dourado));">
        <i class="fas fa-book"></i>
      </div>
      <div class="search-result-info">
        <strong>${highlightSearch(book.name, query)}</strong>
        <span>${highlightSearch(book.author, query)} • ${book.country}</span>
        <div class="search-result-meta">
          <span class="search-price">${book.price.toLocaleString()} Kz</span>
          <span>${book.genre} • ${book.pages}p</span>
        </div>
      </div>
      <div class="search-result-actions">
        <button onclick="event.stopPropagation();addToCart('${escapeHtml(book.name)}',${book.price},'${escapeHtml(book.author)}')" title="Comprar">
          <i class="fas fa-cart-plus"></i>
        </button>
        <button onclick="event.stopPropagation();toggleFavorite('${escapeHtml(book.name)}','${escapeHtml(book.author)}',${book.price})" title="Favoritar">
          <i class="far fa-heart"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function highlightSearch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function handleSearchSelect(bookName, price) {
  addToCart(bookName, price);
  closeGlobalSearch();
}

// ============================================
// 3. RANKING PAGE - renderLeaderboard
// ============================================
function initRankingPage() {
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

  // Current user highlight
  const user = getCurrentUser();
  if (user) {
    const userEntry = board.find(b => b.name === user.name);
    if (userEntry) {
      const userRank = board.indexOf(userEntry) + 1;
      const userRankEl = document.getElementById('userRank');
      if (userRankEl) userRankEl.textContent = `#${userRank}`;
      const userPointsEl = document.getElementById('userPoints');
      if (userPointsEl) userPointsEl.textContent = `${userEntry.points} pts`;
    }
  }
}

// ============================================
// 4. BIBLIOTECA PAGE
// ============================================
function initBibliotecaPage() {
  renderLibrary();
}

// ============================================
// 5. COMPARAR PAGE
// ============================================
function initCompararPage() {
  renderCompareTable();
  updateCompareBar();
}

// ============================================
// 6. DASHBOARD PAGE
// ============================================
function initDashboardPage() {
  renderWriterDashboard();
}

// ============================================
// 7. NAVBAR UNIFICADA - todas as páginas
// ============================================
function initNavbar() {
  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = next === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    });
  }

  // Scroll navbar
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // Back to top
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 300);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // Update cart badge
  updateCartBadge();
  updateFavoriteButtons();
}

// ============================================
// 8. COOKIES
// ============================================
function initCookies() {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) {
    const banner = document.getElementById('cookieConsent');
    if (banner) banner.style.display = 'block';
  }
}

function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  const banner = document.getElementById('cookieConsent');
  if (banner) banner.style.display = 'none';
}

function rejectCookies() {
  localStorage.setItem('cookieConsent', 'rejected');
  const banner = document.getElementById('cookieConsent');
  if (banner) banner.style.display = 'none';
}

// ============================================
// 9. NEWSLETTER
// ============================================
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value;
    if (email) {
      const subscribers = JSON.parse(localStorage.getItem('raizesNewsletter') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('raizesNewsletter', JSON.stringify(subscribers));
      }
      showToast('Inscrição realizada com sucesso!');
      form.reset();
    }
  });
}

// ============================================
// 10. BOOK CARDS - adicionar interações
// ============================================
function initBookCards() {
  // Adicionar data-attributes e botões de amostra
  document.querySelectorAll('.livro-card').forEach(card => {
    const bookName = card.querySelector('h4')?.textContent;
    const author = card.querySelector('.autor')?.textContent;
    const preco = card.querySelector('.preco')?.textContent;

    if (!bookName) return;

    // Parse price
    const price = parseInt(preco?.replace(/[^0-9]/g, '')) || 0;

    // Adicionar botão de amostra se não existir
    const precoSection = card.querySelector('.livro-preco');
    if (precoSection && !card.querySelector('.btn-compare')) {
      const sampleBtn = document.createElement('button');
      sampleBtn.className = 'btn-compare';
      sampleBtn.title = 'Ler Amostra';
      sampleBtn.innerHTML = '<i class="fas fa-eye"></i>';
      sampleBtn.onclick = () => openSampleReader(bookName);
      precoSection.appendChild(sampleBtn);
    }

    // Adicionar botão de comparar se não existir
    if (precoSection && !card.querySelector('[title="Comparar"]')) {
      const compareBtn = document.createElement('button');
      compareBtn.className = 'btn-compare';
      compareBtn.title = 'Comparar';
      compareBtn.innerHTML = '<i class="fas fa-balance-scale"></i>';
      compareBtn.onclick = () => addToCompare(bookName, author, price);
      precoSection.appendChild(compareBtn);
    }
  });
}

// ============================================
// 11. COMENTÁRIOS DA COMUNIDADE
// ============================================
function initCommunityInteractions() {
  // Like buttons
  document.querySelectorAll('.post-action').forEach(btn => {
    if (btn.querySelector('.fa-heart') && !btn.dataset.initialized) {
      btn.dataset.initialized = 'true';
      btn.addEventListener('click', () => {
        const icon = btn.querySelector('.fa-heart');
        const count = btn.querySelector('span');
        if (icon.classList.contains('far')) {
          icon.classList.replace('far', 'fas');
          icon.style.color = 'var(--terracotta)';
          if (count) count.textContent = parseInt(count.textContent || '0') + 1;
          addPoints(2);
        } else {
          icon.classList.replace('fas', 'far');
          icon.style.color = '';
          if (count) count.textContent = Math.max(0, parseInt(count.textContent || '0') - 1);
        }
      });
    }
  });
}

// ============================================
// 12. ESCRITORES - seguir/interagir
// ============================================
function initWriterInteractions() {
  document.querySelectorAll('.writer-card .btn-primary').forEach(btn => {
    if (!btn.dataset.initialized) {
      btn.dataset.initialized = 'true';
      const originalOnclick = btn.getAttribute('onclick');
      btn.addEventListener('click', () => {
        const writerName = btn.closest('.writer-card')?.querySelector('h3, h4')?.textContent;
        if (writerName) {
          toggleFollow(writerName);
          updateFollowButtons();
        }
      });
    }
  });
}

// ============================================
// 13. AUDIO PLAYER - progresso visual
// ============================================
function initAudioProgress() {
  const progressBar = document.getElementById('progressBar');
  const currentTimeEl = document.getElementById('currentTime');
  if (!progressBar || !currentTimeEl) return;

  let audioProgress = 0;
  let audioInterval = null;

  // Override playAudio to start progress
  const originalPlayAudio = window.playAudio;
  if (originalPlayAudio) {
    window.playAudio = function(title, autor, duracao) {
      originalPlayAudio(title, autor, duracao);
      audioProgress = 0;
      progressBar.value = 0;
      currentTimeEl.textContent = '0:00';

      if (audioInterval) clearInterval(audioInterval);
      audioInterval = setInterval(() => {
        if (window.isPlaying) {
          audioProgress += 1;
          progressBar.value = Math.min(100, audioProgress / 10);
          const mins = Math.floor(audioProgress / 60);
          const secs = audioProgress % 60;
          currentTimeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
      }, 1000);
    };
  }
}

// ============================================
// 14. COUNTDOWN TIMER
// ============================================
function initCountdown() {
  const container = document.getElementById('countdown');
  if (!container) return;

  // Next launch: 7 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 7);

  function update() {
    const now = new Date();
    const diff = launchDate - now;

    if (diff <= 0) {
      container.innerHTML = '<div class="countdown-item"><span>00</span><small>Lançado!</small></div>';
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const items = container.querySelectorAll('.countdown-item span');
    if (items.length >= 4) {
      items[0].textContent = String(days).padStart(2, '0');
      items[1].textContent = String(hours).padStart(2, '0');
      items[2].textContent = String(mins).padStart(2, '0');
      items[3].textContent = String(secs).padStart(2, '0');
    }
  }

  update();
  setInterval(update, 1000);
}

// ============================================
// 15. PAÍSES - cards clicáveis
// ============================================
function initCountryCards() {
  document.querySelectorAll('.pais-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const country = card.querySelector('h3')?.textContent;
      if (country) {
        window.location.href = `loja.html?pais=${encodeURIComponent(country)}`;
      }
    });
  });
}

// Apply URL filters on loja page
function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const pais = params.get('pais');
  const genero = params.get('genero');

  if (pais) {
    const filtroPais = document.getElementById('filtroPais');
    if (filtroPais) {
      // Find matching option
      const options = filtroPais.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].value.toLowerCase() === pais.toLowerCase() ||
            options[i].text.toLowerCase() === pais.toLowerCase()) {
          filtroPais.selectedIndex = i;
          break;
        }
      }
      filtroPais.dispatchEvent(new Event('change'));
    }
  }

  if (genero) {
    const filtroGenero = document.getElementById('filtroGenero');
    if (filtroGenero) {
      const options = filtroGenero.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].value.toLowerCase() === genero.toLowerCase()) {
          filtroGenero.selectedIndex = i;
          break;
        }
      }
      filtroGenero.dispatchEvent(new Event('change'));
    }
  }
}

// ============================================
// 15. ESCOLHER PERFIL - leitor ou escritor
// ============================================
function initProfileSwitch() {
  const user = getCurrentUser();
  if (!user) return;

  // Add profile links to user menu
  const userMenu = document.getElementById('userDropdown');
  if (userMenu && !userMenu.querySelector('.profile-link')) {
    const isWriter = user.role === 'escritor';
    const profileLink = document.createElement('a');
    profileLink.className = 'dropdown-item profile-link';
    profileLink.href = isWriter ? 'perfil-escritor.html' : 'perfil-leitor.html';
    profileLink.innerHTML = `<i class="fas fa-user"></i> Meu Perfil`;
    userMenu.insertBefore(profileLink, userMenu.firstChild);
  }
}

// ============================================
// INIT - Carregar tudo
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initGlobalSearch();
  initBookCards();
  initCommunityInteractions();
  initWriterInteractions();
  initCookies();
  initNewsletter();
  initProfileSwitch();

  // Page-specific inits
  if (document.getElementById('lojaGrid')) { initShopFilters(); applyUrlFilters(); }
  if (document.getElementById('leaderboardBody')) initRankingPage();
  if (document.querySelector('.pais-card')) initCountryCards();
  if (document.getElementById('libraryGrid')) initBibliotecaPage();
  if (document.getElementById('compareTable')) initCompararPage();
  if (document.getElementById('writerDashboard')) initDashboardPage();
  if (document.getElementById('audioPlayerBar')) initAudioProgress();
  if (document.getElementById('countdown')) initCountdown();

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
});
