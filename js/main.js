/* ============================================
   RAÍZES LITERÁRIAS - JavaScript Principal
   ============================================ */

// --- Loading Screen ---
window.addEventListener('load', () => {
  const loading = document.getElementById('loading');
  if (loading) {
    setTimeout(() => loading.classList.add('hidden'), 1800);
  }
});

// --- Dark Mode Toggle ---
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Carregar tema salvo
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// --- Mobile Menu (Hamburger) ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });

  // Fechar ao clicar em link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });
}

// --- Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// --- Search Modal ---
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchModal) {
  searchBtn.addEventListener('click', () => {
    searchModal.classList.add('active');
    if (searchInput) searchInput.focus();
  });
}

if (searchClose && searchModal) {
  searchClose.addEventListener('click', () => {
    searchModal.classList.remove('active');
  });
}

if (searchModal) {
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) {
      searchModal.classList.remove('active');
    }
  });
}

// Fechar com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (searchModal) searchModal.classList.remove('active');
    closeBookModal();
  }
});

// --- Back to Top ---
const backToTop = document.getElementById('backToTop');

if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 300);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- Language Selector Bottom ---
function toggleLangMenuBottom() {
  const menu = document.getElementById('langMenuBottom');
  if (menu) {
    menu.classList.toggle('active');
  }
}

function setLangBottom(lang) {
  const langMap = {
    'pt': 'PT',
    'en': 'EN',
    'es': 'ES',
    'fr': 'FR',
    'ar': 'AR',
    'zh': 'ZH',
    'ja': 'JA'
  };

  const currentLang = document.getElementById('currentLangBottom');
  if (currentLang) {
    currentLang.textContent = langMap[lang] || lang.toUpperCase();
  }

  // Update active state
  document.querySelectorAll('.lang-menu-bottom a').forEach(a => {
    a.classList.remove('active');
    if (a.textContent.includes(langMap[lang])) {
      a.classList.add('active');
    }
  });

  // Close menu
  const menu = document.getElementById('langMenuBottom');
  if (menu) {
    menu.classList.remove('active');
  }

  // Save language preference
  localStorage.setItem('raizesLang', lang);

  showToast(`Idioma alterado para ${langMap[lang]}`);
}

// Close lang menu on click outside
document.addEventListener('click', (e) => {
  const langSelector = document.getElementById('langSelectorBottom');
  const langMenu = document.getElementById('langMenuBottom');
  if (langSelector && langMenu && !langSelector.contains(e.target)) {
    langMenu.classList.remove('active');
  }
});

// Load saved language
const savedLang = localStorage.getItem('raizesLang');
if (savedLang) {
  setLangBottom(savedLang);
}

// --- Scroll Animation ---
const animateElements = document.querySelectorAll('.animate-on-scroll');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

animateElements.forEach(el => observer.observe(el));

// --- Countdown Timer ---
function updateCountdown() {
  // Próximo evento: 25 de Maio de 2026
  const eventDate = new Date('2026-05-25T00:00:00');
  const now = new Date();
  const diff = eventDate - now;

  if (diff <= 0) {
    // Evento já passou, definir próximo evento
    const nextEvent = new Date();
    nextEvent.setDate(nextEvent.getDate() + 7);
    const newDiff = nextEvent - now;
    updateCountdownDisplay(newDiff);
  } else {
    updateCountdownDisplay(diff);
  }
}

function updateCountdownDisplay(diff) {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

// Atualizar a cada segundo
setInterval(updateCountdown, 1000);
updateCountdown();

// --- Book Filters ---
const filterBtns = document.querySelectorAll('.filter-btn');
const livroCards = document.querySelectorAll('.livro-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Atualizar botão ativo
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    livroCards.forEach(card => {
      const pais = card.getAttribute('data-pais');
      const preco = card.getAttribute('data-preco');

      let show = false;

      if (filter === 'todos') {
        show = true;
      } else if (filter === 'gratis') {
        show = preco === 'gratis' || preco === '0';
      } else if (filter === pais) {
        show = true;
      }

      if (show) {
        card.classList.remove('book-hidden');
      } else {
        card.classList.add('book-hidden');
      }
    });
  });
});

// --- Toast (showToast from features.js) ---

// --- Check Login ---
function checkLogin(action) {
  const user = localStorage.getItem('raizesUser');
  if (!user) {
    showLoginRequired(action);
    return false;
  }
  return true;
}

function showLoginRequired(action) {
  // Create modal if not exists
  let modal = document.getElementById('loginRequiredModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'loginRequiredModal';
    modal.className = 'login-required-modal';
    modal.innerHTML = `
      <div class="login-required-content">
        <i class="fas fa-lock"></i>
        <h3>Login Necessário</h3>
        <p>Para ${action === 'buy' ? 'comprar livros' : 'acessar esta funcionalidade'}, precisas estar ligado.</p>
        <div class="login-required-actions">
          <a href="login.html" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i> Entrar
          </a>
          <button class="btn btn-secondary" style="border-color: var(--cinza-light); color: var(--preto);" onclick="closeLoginModal()">
            Cancelar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.querySelector('p').textContent = `Para ${action === 'download' ? 'baixar livros' : action === 'buy' ? 'comprar livros' : 'acessar esta funcionalidade'}, precisas estar ligado.`;
  }
  modal.classList.add('active');
}

function closeLoginModal() {
  const modal = document.getElementById('loginRequiredModal');
  if (modal) modal.classList.remove('active');
}

// Close modal on click outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('loginRequiredModal');
  if (modal && e.target === modal) {
    closeLoginModal();
  }
});

// --- Buy Book ---
function buyBook(bookName, price) {
  if (!checkLogin('buy')) return;
  addToCart(bookName, price || 0);
}

// --- Cart (uses features.js functions: addToCart, openCart, getCartCount) ---

// --- YouTube Video Placeholder ---
function playVideo(element, videoId) {
  // Em produção, substituir pelo ID real do vídeo
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;

  const parent = element.parentElement;
  parent.innerHTML = '';
  parent.appendChild(iframe);
}

// --- Book Modal ---
const bookModal = document.getElementById('bookModal');

function openBookModal(book) {
  if (!bookModal) return;

  document.getElementById('modalTitle').textContent = book.title;
  document.getElementById('modalAutor').textContent = book.author;
  document.getElementById('modalDesc').textContent = book.description;
  document.getElementById('modalPais').textContent = book.country;
  document.getElementById('modalPag').textContent = book.pages;

  const actionBtn = document.getElementById('modalAction');
  if (book.price === 0) {
    actionBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho';
    actionBtn.onclick = () => addToCart(book.title, 0);
  } else {
    actionBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Comprar - ${book.price} Kz`;
    actionBtn.onclick = () => addToCart(book.title, book.price);
  }

  bookModal.classList.add('active');
}

function closeBookModal() {
  if (bookModal) {
    bookModal.classList.remove('active');
  }
}

// Fechar modal ao clicar fora
if (bookModal) {
  bookModal.addEventListener('click', (e) => {
    if (e.target === bookModal) {
      closeBookModal();
    }
  });
}

// --- Chat (Comunidade) ---
function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  if (!chatInput || !chatMessages) return;

  const message = chatInput.value.trim();
  if (!message) return;

  // Adicionar mensagem do usuário
  const userMsg = document.createElement('div');
  userMsg.className = 'message sent';
  userMsg.innerHTML = `
    <div class="msg-avatar">EU</div>
    <div class="msg-content">
      <p>${escapeHtml(message)}</p>
      <span class="time">${getCurrentTime()}</span>
    </div>
  `;
  chatMessages.appendChild(userMsg);

  // Limpar input
  chatInput.value = '';

  // Scroll para baixo
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Simular resposta (em produção, conectar com backend)
  setTimeout(() => {
    const responses = [
      'Obrigado pela pergunta! A literatura é uma ponte entre os povos.',
      'Excelente reflexão! A cultura lusófona é rica e diversa.',
      'Concordo plenamente. Os PALOP têm muito a oferecer ao mundo.',
      'Que interessante! Continua a explorar a nossa literatura.',
      'A leitura transforma vidas. Obrigado por fazer parte desta comunidade!'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const botMsg = document.createElement('div');
    botMsg.className = 'message';
    botMsg.innerHTML = `
      <div class="msg-avatar">PE</div>
      <div class="msg-content">
        <p>${randomResponse}</p>
        <span class="time">${getCurrentTime()}</span>
      </div>
    `;
    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1500);
}

// Enter para enviar
const chatInput = document.getElementById('chatInput');
if (chatInput) {
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// --- Newsletter ---
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    if (email) {
      showToast('Inscrição realizada com sucesso! Obrigado!');
      newsletterForm.reset();
    }
  });
}

// --- Utility Functions (escapeHtml, getCurrentTime from features.js) ---

// --- Smooth Scroll for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// --- Active Nav Link ---
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
  }
});

// --- Custom Cursor ---
function initCustomCursor() {
  if (window.innerWidth <= 768) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX - 4 + 'px';
    dot.style.top = mouseY - 4 + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX - 20 + 'px';
    ring.style.top = ringY - 20 + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverElements = document.querySelectorAll('a, button, .btn, .livro-card, .feature-card, .pais-card, .filter-btn');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}
initCustomCursor();

console.log('Raízes Literárias - Site carregado com sucesso!');
