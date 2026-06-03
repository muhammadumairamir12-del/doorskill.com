// ===== HAMBURGER MENU =====
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.getElementById('navOverlay');
  
  if (!hamburger || !navLinks) return;
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  });
  
  if (overlay) {
    overlay.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
  
  // Close on nav link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
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
  initScrollTop();
  initCookieConsent();
  initLazyLoad();
  initFormValidation();
  initCounters();
});
