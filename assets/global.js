// ===== HAMBURGER MENU =====
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  
  if (!hamburger) return;
  
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    if (mobileMenu) {
      mobileMenu.classList.toggle('open');
    }
  });
  
  // Close on nav link click (mobile)
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu?.contains(e.target)) {
      hamburger.classList.remove('active');
      if (mobileMenu) mobileMenu.classList.remove('open');
    }
  });
}

// ===== SEARCH AUTOCOMPLETE =====
function initSearchAutocomplete() {
  const input = document.querySelector('.search-wrap input');
  const autocomplete = document.querySelector('.autocomplete');
  if (!input || !autocomplete) return;
  
  const suggestions = [
    { icon: '🔧', text: 'Plumbing Repair', category: 'Home Repairs' },
    { icon: '⚡', text: 'Electrical Installation', category: 'Home Repairs' },
    { icon: '❄️', text: 'AC Repair & Maintenance', category: 'Home Repairs' },
    { icon: '🧹', text: 'Deep Cleaning', category: 'Cleaning' },
    { icon: '🏠', text: 'Home Movers & Packers', category: 'Logistics' },
    { icon: '💅', text: 'Makeup Artist', category: 'Beauty' },
    { icon: '🚗', text: 'Car Mechanic', category: 'Auto Services' },
    { icon: '👨‍🏫', text: 'Home Tutor', category: 'Education' }
  ];
  
  input.addEventListener('focus', () => {
    autocomplete.classList.add('show');
    populateAutocomplete('');
  });
  
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length === 0) {
      populateAutocomplete('');
    } else {
      const filtered = suggestions.filter(s => 
        s.text.toLowerCase().includes(query) || 
        s.category.toLowerCase().includes(query)
      );
      populateAutocomplete(filtered);
    }
  });
  
  input.addEventListener('blur', () => {
    setTimeout(() => autocomplete.classList.remove('show'), 150);
  });
  
  function populateAutocomplete(results) {
    const items = Array.isArray(results) ? results : suggestions;
    autocomplete.innerHTML = items.map(item => `
      <div class="auto-item">
        <span class="auto-item-icon">${item.icon}</span>
        <div>
          <div class="auto-item-text">${item.text}</div>
          <div class="auto-item-cat">${item.category}</div>
        </div>
        <span class="auto-arrow">→</span>
      </div>
    `).join('');
    
    autocomplete.querySelectorAll('.auto-item').forEach(item => {
      item.addEventListener('click', () => {
        const text = item.querySelector('.auto-item-text').textContent;
        input.value = text;
        autocomplete.classList.remove('show');
      });
    });
  }
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== COOKIE CONSENT =====
function initCookieConsent() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  
  if (localStorage.getItem('cookieAccepted')) {
    banner.style.display = 'none';
    return;
  }
  
  const acceptBtn = document.getElementById('acceptCookies');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieAccepted', 'true');
      banner.style.display = 'none';
    });
  }
}

// ===== LAZY LOADING =====
function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  images.forEach(img => observer.observe(img));
}

// ===== TOAST NOTIFICATION =====
function showToast(title, message, duration = 5000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.innerHTML = `
    <strong style="display:block;margin-bottom:4px">
      ${title}
    </strong>
    <span style="font-size:13px;color:#aaa">${message}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== FORM VALIDATION =====
function initFormValidation() {
  document.querySelectorAll('input, select, textarea')
    .forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) {
        validateField(field);
      }
    });
  });
}

function validateField(field) {
  const errorEl = field.parentNode
    .querySelector('.field-error');
  
  if (field.required && !field.value.trim()) {
    field.classList.add('invalid');
    field.classList.remove('valid');
    if (errorEl) errorEl.textContent = 'This field is required';
    return false;
  }
  
  if (field.type === 'email' && field.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      field.classList.add('invalid');
      if (errorEl) errorEl.textContent = 'Invalid email format';
      return false;
    }
  }
  
  field.classList.remove('invalid');
  field.classList.add('valid');
  if (errorEl) errorEl.textContent = '';
  return true;
}

// ===== COUNTER ANIMATION =====
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current)
            .toLocaleString() + suffix;
          if (current >= target) clearInterval(timer);
        }, 16);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  initSearchAutocomplete();
  initScrollTop();
  initCookieConsent();
  initLazyLoad();
  initFormValidation();
  initCounters();
});

