/* ============================================
   RAÍZES LITERÁRIAS - Conteúdo e Interações
   ============================================ */

const CONTENT_KEY = 'raizesContent';
const EMPTY_CONTENT = { books: [], hqs: [], authors: [], posts: [] };

function getContentStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(CONTENT_KEY) || '{}');
    return {
      books: Array.isArray(stored.books) ? stored.books : [],
      hqs: Array.isArray(stored.hqs) ? stored.hqs : [],
      authors: Array.isArray(stored.authors) ? stored.authors : [],
      posts: Array.isArray(stored.posts) ? stored.posts : []
    };
  } catch {
    return { books: [], hqs: [], authors: [], posts: [] };
  }
}

function saveContentStore(store) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify({ ...EMPTY_CONTENT, ...store }));
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeSlug(value) {
  return normalizeText(value).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';
}

function getSearchableItems() {
  const content = getContentStore();
  return [...content.books, ...content.hqs].filter(item => item.status !== 'draft');
}

function getPublishedBooks() {
  return getContentStore().books.filter(item => item.status !== 'draft');
}

function getPublishedHqs() {
  return getContentStore().hqs.filter(item => item.status !== 'draft');
}

function contentItemFromForm() {
  const title = normalizeText(document.getElementById('bookTitle')?.value);
  const type = document.getElementById('bookType')?.value || 'book';
  const author = normalizeText(document.getElementById('bookAuthor')?.value) || getCurrentUser()?.name || 'Autor não informado';
  const country = normalizeText(document.getElementById('bookCountry')?.value) || 'Internacional';
  const genre = normalizeText(document.getElementById('bookGenre')?.value) || 'Outro';
  const description = normalizeText(document.getElementById('bookDescription')?.value);
  const pages = parseInt(document.getElementById('bookPages')?.value, 10) || 0;
  const price = parseInt(document.getElementById('bookPrice')?.value, 10) || 0;

  if (!title) return null;

  return {
    id: `${Date.now()}-${normalizeSlug(title)}`,
    title,
    name: title,
    type,
    author,
    country,
    pais: normalizeSlug(country),
    genre,
    genero: normalizeSlug(genre),
    description,
    pages,
    price,
    preco: price,
    status: 'published',
    createdAt: new Date().toISOString()
  };
}

function registerContentFromDashboard(status = 'published') {
  const item = contentItemFromForm();
  if (!item) {
    showToast('Preenche pelo menos o título.', 'error');
    return null;
  }
  item.status = status;

  const store = getContentStore();
  const target = item.type === 'hq' ? store.hqs : store.books;
  target.unshift(item);
  saveContentStore(store);

  const form = document.getElementById('uploadForm');
  if (form && status === 'published') form.reset();
  renderDynamicShop();
  renderDynamicHq();
  if (typeof loadSampleBooks === 'function') loadSampleBooks();
  showToast(`${item.type === 'hq' ? 'HQ' : 'Livro'} ${status === 'draft' ? 'guardado' : 'publicado'} com sucesso!`);
  return item;
}

function renderBookCard(item, icon = 'fa-book') {
  const title = item.title || item.name || 'Sem título';
  const author = item.author || 'Autor não informado';
  const country = item.country || item.pais || 'Internacional';
  const genre = item.genre || item.genero || 'Outro';
  const price = parseInt(item.price || item.preco || 0, 10);

  return `
    <div class="livro-card animate-on-scroll" data-pais="${escapeHtml(normalizeSlug(country))}" data-preco="${price}" data-genero="${escapeHtml(normalizeSlug(genre))}">
      <div class="livro-cover">
        <div class="livro-cover-img" style="background: linear-gradient(135deg, #2D5A3D, #D4A843); display:flex; align-items:center; justify-content:center; font-size:4rem; color:white;">
          <i class="fas ${icon}"></i>
        </div>
        <span class="livro-badge badge-novo">Cadastrado</span>
      </div>
      <div class="livro-info">
        <h4>${escapeHtml(title)}</h4>
        <p class="autor">${escapeHtml(author)}</p>
        <span class="pais">${escapeHtml(country)}</span>
        ${item.description ? `<p style="font-size:.85rem;color:var(--cinza);margin-top:8px;">${escapeHtml(item.description)}</p>` : ''}
      </div>
      <div class="livro-preco">
        <span class="preco">${price.toLocaleString()} Kz</span>
        <button class="btn-comprar" onclick="addToCart(${escapeJs(title)}, ${price}, ${escapeJs(author)})">Comprar</button>
        <button class="btn-favorite" data-book="${escapeHtml(title)}" onclick="toggleFavorite(${escapeJs(title)}, ${escapeJs(author)}, ${price})"><i class="far fa-heart"></i></button>
        <button class="btn-compare" title="Ler Amostra" onclick="openSampleReader(${escapeJs(title)})"><i class="fas fa-eye"></i></button>
      </div>
    </div>
  `;
}

function renderEmptyState(target, label) {
  target.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;background:var(--branco);border-radius:var(--radius-lg);box-shadow:var(--shadow);">
      <i class="fas fa-folder-open" style="font-size:3rem;color:var(--dourado);margin-bottom:20px;"></i>
      <h3>Nenhum ${label} cadastrado</h3>
      <p style="color:var(--cinza);margin:10px 0 20px;">Use o Dashboard para cadastrar conteúdo real.</p>
      <a class="btn btn-primary" href="dashboard.html"><i class="fas fa-plus"></i> Cadastrar agora</a>
    </div>
  `;
}

function renderDynamicShop() {
  const grid = document.getElementById('lojaGrid');
  if (!grid) return;
  const books = getPublishedBooks();
  if (books.length === 0) renderEmptyState(grid, 'livro');
  else grid.innerHTML = books.map(item => renderBookCard(item, 'fa-book')).join('');
}

function renderDynamicHq() {
  const grid = document.getElementById('hqGrid');
  if (!grid) return;
  const hqs = getPublishedHqs();
  if (hqs.length === 0) renderEmptyState(grid, 'HQ');
  else grid.innerHTML = hqs.map(item => renderBookCard(item, 'fa-mask')).join('');
  const counter = document.getElementById('hqCounter');
  if (counter) counter.textContent = `${hqs.length} HQ(s) cadastrado(s)`;
}

function initShopFilters() {
  const grid = document.getElementById('lojaGrid');
  if (!grid) return;
  const filtroPais = document.getElementById('filtroPais');
  const filtroPreco = document.getElementById('filtroPreco');
  const filtroGenero = document.getElementById('filtroGenero');
  const ordenar = document.getElementById('ordenar');

  function applyFilters() {
    const pais = filtroPais?.value || 'todos';
    const preco = filtroPreco?.value || 'todos';
    const genero = filtroGenero?.value || 'todos';
    const ordem = ordenar?.value || 'relevancia';
    const cards = [...grid.querySelectorAll('.livro-card')];
    let visibleCards = [];

    cards.forEach(card => {
      const cardPais = card.dataset.pais || '';
      const cardPreco = parseInt(card.dataset.preco) || 0;
      const cardGenero = card.dataset.genero || '';
      const showPais = pais === 'todos' || cardPais === pais;
      const showGenero = genero === 'todos' || cardGenero === genero;
      const showPreco = preco === 'todos' ||
        (preco === 'ate1000' && cardPreco <= 1000) ||
        (preco === 'ate2000' && cardPreco <= 2000) ||
        (preco === 'acima2000' && cardPreco > 2000);

      if (showPais && showGenero && showPreco) {
        card.style.display = '';
        visibleCards.push(card);
      } else {
        card.style.display = 'none';
      }
    });

    if (ordem !== 'relevancia' && visibleCards.length > 0) {
      visibleCards.sort((a, b) => {
        const priceA = parseInt(a.dataset.preco) || 0;
        const priceB = parseInt(b.dataset.preco) || 0;
        if (ordem === 'preco-menor') return priceA - priceB;
        if (ordem === 'preco-maior') return priceB - priceA;
        return 0;
      }).forEach(card => grid.appendChild(card));
    }

    const counter = document.getElementById('lojaCounter');
    if (counter) counter.textContent = `${visibleCards.length} livro(s) encontrado(s)`;
  }

  [filtroPais, filtroPreco, filtroGenero, ordenar].forEach(el => el?.addEventListener('change', applyFilters));
  applyFilters();
}

function initGlobalSearch() {
  let overlay = document.getElementById('globalSearchOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'globalSearchOverlay';
    overlay.className = 'global-search-overlay';
    overlay.innerHTML = `
      <div class="global-search-box">
        <div class="global-search-header">
          <i class="fas fa-search"></i>
          <input type="text" id="globalSearchInput" placeholder="Pesquisar livros, HQs, autores..." autocomplete="off">
          <kbd>ESC</kbd>
        </div>
        <div id="globalSearchResults" class="global-search-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeGlobalSearch(); });
    document.getElementById('globalSearchInput').addEventListener('input', event => performGlobalSearch(event.target.value));
  }

  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      openGlobalSearch();
    }
    if (event.key === 'Escape') closeGlobalSearch();
  });

  document.getElementById('searchBtn')?.addEventListener('click', openGlobalSearch);
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
  if (!overlay) return;
  overlay.classList.remove('active');
  const input = document.getElementById('globalSearchInput');
  if (input) input.value = '';
  const results = document.getElementById('globalSearchResults');
  if (results) results.innerHTML = '';
}

function performGlobalSearch(query) {
  const results = document.getElementById('globalSearchResults');
  if (!results) return;
  if (!query || query.length < 2) {
    results.innerHTML = '<p class="search-hint">Escreve pelo menos 2 caracteres...</p>';
    return;
  }

  const q = query.toLowerCase();
  const matches = getSearchableItems().filter(item =>
    (item.title || item.name || '').toLowerCase().includes(q) ||
    (item.author || '').toLowerCase().includes(q) ||
    (item.country || '').toLowerCase().includes(q) ||
    (item.genre || '').toLowerCase().includes(q)
  ).slice(0, 10);

  if (matches.length === 0) {
    results.innerHTML = '<p class="search-hint">Nenhum resultado encontrado</p>';
    return;
  }

  results.innerHTML = matches.map(item => {
    const title = item.title || item.name;
    const author = item.author || 'Autor não informado';
    const price = parseInt(item.price || 0, 10);
    return `
      <div class="search-result-item" onclick="handleSearchSelect(${escapeJs(title)}, ${price})">
        <div class="search-result-cover" style="background:linear-gradient(135deg,var(--terracotta),var(--dourado));"><i class="fas ${item.type === 'hq' ? 'fa-mask' : 'fa-book'}"></i></div>
        <div class="search-result-info">
          <strong>${highlightSearch(escapeHtml(title), query)}</strong>
          <span>${highlightSearch(escapeHtml(author), query)} • ${escapeHtml(item.country || '')}</span>
          <div class="search-result-meta"><span class="search-price">${price.toLocaleString()} Kz</span><span>${escapeHtml(item.genre || '')}</span></div>
        </div>
        <div class="search-result-actions">
          <button onclick="event.stopPropagation();addToCart(${escapeJs(title)},${price},${escapeJs(author)})" title="Comprar"><i class="fas fa-cart-plus"></i></button>
          <button onclick="event.stopPropagation();toggleFavorite(${escapeJs(title)},${escapeJs(author)},${price})" title="Favoritar"><i class="far fa-heart"></i></button>
        </div>
      </div>
    `;
  }).join('');
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

function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const genero = params.get('genero');
  const pais = params.get('pais');
  if (genero && document.getElementById('filtroGenero')) document.getElementById('filtroGenero').value = genero;
  if (pais && document.getElementById('filtroPais')) document.getElementById('filtroPais').value = pais;
  document.getElementById('filtroGenero')?.dispatchEvent(new Event('change'));
}

function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = next === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    });
  }

  updateCartBadge?.();
  updateFavoriteButtons?.();
}

function initBookCards() {}
function initCommunityInteractions() {}
function initWriterInteractions() {}
function initCookies() {}
function initNewsletter() {}
function initProfileSwitch() {}
function initRankingPage() { const el = document.getElementById('leaderboardBody'); if (el) el.innerHTML = '<div class="empty-state">Ranking será preenchido com atividade real dos leitores.</div>'; }
function initCountryCards() { document.querySelectorAll('.pais-card').forEach(card => card.addEventListener('click', () => { window.location.href = `loja.html?pais=${card.dataset.pais || ''}`; })); }
function initBibliotecaPage() { renderLibrary?.(); }
function initCompararPage() { renderCompareTable?.(); updateCompareBar?.(); }
function initDashboardPage() { renderWriterDashboard?.(); }
function initAudioProgress() {}
function initCountdown() {}
function acceptCookies() { localStorage.setItem('cookieConsent', 'accepted'); document.getElementById('cookieConsent')?.remove(); }
function declineCookies() { localStorage.setItem('cookieConsent', 'declined'); document.getElementById('cookieConsent')?.remove(); }
function toggleLangMenuBottom() { document.getElementById('langMenuBottom')?.classList.toggle('active'); }
function setLangBottom(lang) { localStorage.setItem('language', lang); const el = document.getElementById('currentLangBottom'); if (el) el.textContent = lang.toUpperCase(); }

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  renderDynamicShop();
  renderDynamicHq();
  initGlobalSearch();
  initBookCards();
  initCommunityInteractions();
  initWriterInteractions();
  initCookies();
  initNewsletter();
  initProfileSwitch();

  if (document.getElementById('lojaGrid')) { initShopFilters(); applyUrlFilters(); }
  if (document.getElementById('leaderboardBody')) initRankingPage();
  if (document.querySelector('.pais-card')) initCountryCards();
  if (document.getElementById('libraryGrid')) initBibliotecaPage();
  if (document.getElementById('compareTable')) initCompararPage();
  if (document.getElementById('writerDashboard')) initDashboardPage();
  if (document.getElementById('audioPlayerBar')) initAudioProgress();
  if (document.getElementById('countdown')) initCountdown();

  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const icon = document.getElementById('themeToggle')?.querySelector('i');
  if (icon) icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
});
