/* =============================================================
   HanseMerkur Tierversicherung — Multi-step Form Controller
   ============================================================= */

(function () {
  'use strict';

  const form = document.getElementById('hmForm');
  if (!form) return;

  const steps      = Array.from(form.querySelectorAll('.form-step'));
  const stepFill   = document.getElementById('stepFill');
  const stepLabels = document.querySelectorAll('.step-label');
  const total      = steps.length;
  let current      = 0;

  /* ── Show a step ──────────────────────────────────────────── */
  function showStep(idx) {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    updateBar(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateBar(idx) {
    const pct = ((idx + 1) / total) * 100;
    if (stepFill) stepFill.style.width = pct + '%';
    stepLabels.forEach((el, i) => {
      el.classList.toggle('is-active', i === idx);
      el.classList.toggle('is-done',   i < idx);
    });
  }

  /* ── Pill toggle (single-select) ─────────────────────────── */
  form.querySelectorAll('.pill-group[data-group]').forEach(group => {
    group.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        group.dataset.value = btn.dataset.value;
        onGroupChange(group.dataset.group, btn.dataset.value);
        clearErr(group.closest('.form-field'));
      });
    });
  });

  /* ── Conditional logic (/angebot only) ───────────────────── */
  function onGroupChange(groupName, value) {
    /* Animal type toggle on /angebot */
    if (groupName === 'tier') {
      const haftCard  = document.getElementById('haftpflicht-card');
      const dogFields = document.getElementById('fields-hund');
      const catFields = document.getElementById('fields-katze');

      if (haftCard)  haftCard.classList.toggle('is-hidden', value !== 'hund');
      if (haftCard && value !== 'hund') haftCard.classList.remove('is-checked');

      if (dogFields) dogFields.classList.toggle('is-hidden', value !== 'hund');
      if (catFields) catFields.classList.toggle('is-hidden', value !== 'katze');

      /* toggle required on hidden/shown fields */
      toggleRequired(dogFields, value === 'hund');
      toggleRequired(catFields, value === 'katze');
    }
  }

  function toggleRequired(container, on) {
    if (!container) return;
    container.querySelectorAll('.form-input').forEach(el => {
      if (on) el.setAttribute('required', '');
      else    el.removeAttribute('required');
    });
  }

  /* ── Check cards (multi-select) ──────────────────────────── */
  form.querySelectorAll('.check-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-checked');
      clearErr(card.closest('.form-field'));
    });
  });

  /* ── Privacy checkbox ────────────────────────────────────── */
  form.querySelectorAll('.privacy-wrap').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('is-checked');
      clearErr(el.closest('.form-field'));
    });
  });

  /* ── Validation ──────────────────────────────────────────── */
  function validateStep(idx) {
    const step  = steps[idx];
    let   valid = true;

    /* Text / email / tel / date inputs */
    step.querySelectorAll('.form-input').forEach(input => {
      /* Skip inputs inside hidden containers */
      if (input.closest('.is-hidden')) return;
      if (!input.hasAttribute('required')) return;

      const field = input.closest('.form-field');
      const err   = field?.querySelector('.field-error');

      if (!input.value.trim()) {
        input.classList.add('is-invalid');
        show(err);
        valid = false;
      } else {
        input.classList.remove('is-invalid');
        hide(err);
      }
    });

    /* Email format */
    step.querySelectorAll('input[type="email"]').forEach(input => {
      if (!input.value.trim()) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        input.classList.add('is-invalid');
        const err = input.closest('.form-field')?.querySelector('.field-error');
        if (err) { err.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.'; show(err); }
        valid = false;
      }
    });

    /* Pill groups (single-select, required) */
    step.querySelectorAll('.pill-group[data-required]').forEach(group => {
      if (group.closest('.is-hidden')) return;
      const err = group.closest('.form-field')?.querySelector('.field-error');
      if (!group.dataset.value) { show(err); valid = false; }
      else hide(err);
    });

    /* Check grids (multi-select, required — at least 1) */
    step.querySelectorAll('.check-grid[data-required]').forEach(grid => {
      const err     = grid.closest('.form-field')?.querySelector('.field-error');
      const checked = grid.querySelectorAll('.check-card:not(.is-hidden).is-checked').length;
      if (checked === 0) { show(err); valid = false; }
      else hide(err);
    });

    /* Privacy */
    step.querySelectorAll('.privacy-wrap[data-required]').forEach(el => {
      const err = el.closest('.form-field')?.querySelector('.field-error');
      if (!el.classList.contains('is-checked')) { show(err); valid = false; }
      else hide(err);
    });

    return valid;
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  function show(el) { if (el) el.classList.add('is-visible'); }
  function hide(el) { if (el) el.classList.remove('is-visible'); }
  function clearErr(field) {
    if (!field) return;
    field.querySelector('.field-error')?.classList.remove('is-visible');
    field.querySelectorAll('.form-input').forEach(i => i.classList.remove('is-invalid'));
  }

  /* ── Button wiring ───────────────────────────────────────── */
  form.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validateStep(current)) return;
      if (current < total - 1) { current++; showStep(current); }
    });
  });

  form.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (current > 0) { current--; showStep(current); }
    });
  });

  /* ── UTM hidden fields ───────────────────────────────────── */
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];

  function populateUtmFields() {
    const params = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(key => {
      const val = sessionStorage.getItem(key) || params.get(key) || '';
      const el = document.getElementById(key);
      if (el) el.value = val;
    });
  }

  /* ── Collect all form data for webhook ───────────────────── */
  function collectFormData() {
    const data = {};

    // Hidden UTM fields
    UTM_KEYS.forEach(key => {
      const el = document.getElementById(key);
      if (el && el.value) data[key] = el.value;
    });

    // Text / email / tel / date inputs → label as key
    form.querySelectorAll('input.form-input').forEach(input => {
      if (input.closest('.is-hidden')) return;
      const field = input.closest('.form-field');
      let key = (field?.querySelector('label, .form-label, .pill-group-label')
        ?.textContent.trim().replace(/\s*\*\s*$/, '').trim()
        .toLowerCase().replace(/[^a-z0-9]+/gi, '_'))
        || input.placeholder.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
        || input.type;
      if (key in data) key += '_2';
      data[key] = input.value;
    });

    // Pill groups
    form.querySelectorAll('.pill-group[data-group]').forEach(group => {
      if (group.closest('.is-hidden')) return;
      if (group.dataset.value) data[group.dataset.group] = group.dataset.value;
    });

    // Check cards (multi-select)
    const checked = [];
    form.querySelectorAll('.check-card.is-checked').forEach(card => {
      if (card.classList.contains('is-hidden')) return;
      const txt = card.querySelector('.check-card__text')?.textContent.trim();
      if (txt) checked.push(txt);
    });
    if (checked.length) data.versicherung = checked.join(', ');

    // gclid direkt aus URL als Fallback
    if (!data.gclid) {
      const gclid = new URLSearchParams(window.location.search).get('gclid') || sessionStorage.getItem('gclid') || '';
      if (gclid) data.gclid = gclid;
    }

    // Meta
    const page = window.location.pathname.split('/').pop() || '';
    data.formular = page.includes('katze') ? 'Katze' : page.includes('hund') ? 'Hund' : 'Allgemein';
    data.seite = page;
    data.zeitstempel = new Date().toISOString();

    return data;
  }

  /* ── Submit ──────────────────────────────────────────────── */
  const WEBHOOK = 'https://hooks.zapier.com/hooks/catch/26752793/unc3vyb/';

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep(current)) return;

    const btn = form.querySelector('.btn-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Wird gesendet …'; }

    const payload = collectFormData();

    fetch(WEBHOOK, {
      method: 'POST',
      keepalive: true,
      body: new URLSearchParams(payload)
    }).catch(() => {});
    window.location.href = 'danke.html';
  });

  /* ── Init ────────────────────────────────────────────────── */
  populateUtmFields();
  showStep(0);

})();
