/**
 * HanseMerkur Tierversicherung — main.js
 * Handles: FAQ accordion · Mobile menu · Sticky header · Callback form
 */

'use strict';

/* ---------------------------------------------------------------
   Helpers
--------------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ---------------------------------------------------------------
   1. FAQ ACCORDION
   One-open-at-a-time behaviour with ARIA state management.
--------------------------------------------------------------- */
(function initFaq() {
  const items = $$('.faq__item');

  items.forEach(item => {
    const btn = $('.faq__btn', item);
    const answer = $('.faq__answer', item);
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close every other item first
      items.forEach(other => {
        const otherBtn = $('.faq__btn', other);
        const otherAns = $('.faq__answer', other);
        if (otherBtn && otherAns && otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAns.hidden = true;
        }
      });

      // Toggle the clicked item
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();


/* ---------------------------------------------------------------
   2. MOBILE MENU
--------------------------------------------------------------- */
(function initMobileMenu() {
  const burger = $('#navBurger');
  const menu   = $('#mobileMenu');
  if (!burger || !menu) return;

  function open() {
    menu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Menü schließen');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    burger.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  // Close when a link inside the menu is clicked
  $$('a', menu).forEach(link => link.addEventListener('click', close));

  // Close on outside click
  document.addEventListener('click', e => {
    if (menu.classList.contains('is-open') && !e.target.closest('.header')) {
      close();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) close();
  }, { passive: true });
})();


/* ---------------------------------------------------------------
   3. STICKY HEADER — add shadow on scroll
--------------------------------------------------------------- */
(function initStickyHeader() {
  const header = $('.header');
  if (!header) return;

  const observer = new IntersectionObserver(
    ([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting),
    { threshold: 0, rootMargin: `-${header.offsetHeight}px 0px 0px 0px` }
  );

  // Watch a tiny sentinel placed right after the header
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
  document.body.prepend(sentinel);
  observer.observe(sentinel);
})();


/* ---------------------------------------------------------------
   4. CALLBACK FORM
   Simple client-side validation + success feedback.
--------------------------------------------------------------- */
(function initForm() {
  const form = $('#callbackForm');
  if (!form) return;

  const nameInput  = $('#f-name',  form);
  const phoneInput = $('#f-phone', form);
  const submitBtn  = form.querySelector('[type="submit"]');

  function setInvalid(input, msg) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');

    let err = input.nextElementSibling;
    if (!err || !err.classList.contains('field__error')) {
      err = document.createElement('p');
      err.className = 'field__error';
      err.style.cssText = 'font-size:.75rem;color:#e40014;margin-top:.25rem';
      input.insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
  }

  function clearInvalid(input) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    const err = input.nextElementSibling;
    if (err?.classList.contains('field__error')) err.remove();
  }

  [nameInput, phoneInput].forEach(input => {
    input?.addEventListener('input', () => clearInvalid(input));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;

    if (!nameInput?.value.trim()) {
      setInvalid(nameInput, 'Bitte gib deinen Namen ein.');
      valid = false;
    } else {
      clearInvalid(nameInput);
    }

    if (!phoneInput?.value.trim()) {
      setInvalid(phoneInput, 'Bitte gib deine Telefonnummer ein.');
      valid = false;
    } else {
      clearInvalid(phoneInput);
    }

    if (!valid) {
      // Focus first invalid field
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    // Simulate submission
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet …';

    setTimeout(() => {
      submitBtn.textContent = '✓ Rückruf erfolgreich angefragt!';
      submitBtn.style.background = 'var(--c-green-dark)';
      form.reset();

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
      }, 4000);
    }, 1200);
  });
})();


/* ---------------------------------------------------------------
   5. COMPARISON TABLE — collapsible section rows
--------------------------------------------------------------- */
(function initComparisonTable() {
  $$('.comp-section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const target = btn.dataset.target;

      btn.setAttribute('aria-expanded', String(!isExpanded));

      $$(`tr[data-group="${target}"]`).forEach(row => {
        row.hidden = isExpanded;
      });
    });
  });
})();


/* ---------------------------------------------------------------
   6. COOKIE BANNER
   Shows on first visit, dismissed via localStorage.
--------------------------------------------------------------- */
(function initCookieBanner() {
  if (localStorage.getItem('cookieConsent')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie-Einstellungen');
  banner.innerHTML = `
    <div class="cookie-banner__inner">
      <p class="cookie-banner__text">
        Wir verwenden Cookies, um Ihnen das beste Nutzungserlebnis auf unserer Website zu bieten und unseren Datenverkehr zu analysieren.
        Weitere Informationen finden Sie in unserer <a href="datenschutz.html">Datenschutzerklärung</a>.
      </p>
      <div class="cookie-banner__actions">
        <button class="cookie-banner__btn--accept" id="cookieAccept">Alle akzeptieren</button>
        <button class="cookie-banner__btn--decline" id="cookieDecline">Nur notwendige</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  function dismiss() {
    banner.remove();
    localStorage.setItem('cookieConsent', 'true');
  }

  document.getElementById('cookieAccept').addEventListener('click', dismiss);
  document.getElementById('cookieDecline').addEventListener('click', dismiss);
})();


/* ---------------------------------------------------------------
   8. UTM PARAMETER CAPTURE
   Reads UTM params + gclid from URL and stores in sessionStorage
   so form pages can pick them up as hidden fields.
--------------------------------------------------------------- */
(function initUtmCapture() {
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];
  const params = new URLSearchParams(window.location.search);

  // Store in localStorage so gclid survives redirects and tab restores
  UTM_KEYS.forEach(key => {
    const val = params.get(key);
    if (val) localStorage.setItem(key, val);
  });

  // Append UTMs to all internal links on the page
  const utmString = UTM_KEYS
    .map(key => ({ key, val: params.get(key) || localStorage.getItem(key) || '' }))
    .filter(({ val }) => val)
    .map(({ key, val }) => `${key}=${encodeURIComponent(val)}`)
    .join('&');

  if (utmString) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('#')) return;
      const sep = href.includes('?') ? '&' : '?';
      link.setAttribute('href', href + sep + utmString);
    });
  }

  // Fire webhook on every page with UTM data
  const payload = { seite: window.location.href, zeitstempel: new Date().toISOString() };
  UTM_KEYS.forEach(key => {
    const val = params.get(key) || localStorage.getItem(key) || '';
    if (val) payload[key] = val;
  });

  fetch('https://hooks.zapier.com/hooks/catch/26752793/unc3vyb/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
})();


/* ---------------------------------------------------------------
   7. SMOOTH SCROLL for same-page anchor links
   Accounts for sticky nav height.
--------------------------------------------------------------- */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const navH = document.querySelector('.header')?.offsetHeight ?? 0;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();
