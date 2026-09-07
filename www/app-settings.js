(() => {
  const STORAGE_KEY = 'busitalia_custom_settings_v2';

  const defaults = {
    firstName: '',
    lastName: '',
    fiscalCode: '',
    cardNumber: '',
    cardExpiry: '',
    ticketName: 'MENS. URB. TU2 STU',
    validFrom: '',
    validTo: '',
    issuedAt: '',
    price: '52,80 €',
    ticketCode: '7406/360937',
    lockCode: '934',
    cardPhoto: '',
    navPhoto: '',
    qrPhoto: ''
  };

  function loadSettings() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch (_) {
      return { ...defaults };
    }
  }

  function formatDate(value) {
    if (!value) return '';
    const parts = value.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
  }

  function formatDateTime(value) {
    if (!value) return '';
    const [date, time = ''] = value.split('T');
    return `${formatDate(date)}${time ? ` - ${time.slice(0, 5)}` : ''}`;
  }

  function setText(selector, value, clearWhenEmpty = false) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (value !== undefined && value !== null && value !== '') {
      el.textContent = value;
    } else if (clearWhenEmpty) {
      el.textContent = '';
    }
  }

  function applyNavigationPhoto(s) {
    const navImg = document.querySelector('.bottom-nav .nav-item:last-child img');
    if (!navImg) return;
    if (s.navPhoto) {
      navImg.src = s.navPhoto;
      navImg.style.borderRadius = '50%';
      navImg.style.objectFit = 'cover';
      navImg.style.visibility = 'visible';
    } else {
      navImg.removeAttribute('src');
      navImg.style.visibility = 'hidden';
    }
  }

  function applyTicketList(s) {
    setText('.ticket-name', s.ticketName);
    setText('.ticket-card .info-row strong', formatDate(s.validTo), true);
    setText('.ticket-card .price-value', s.price);
  }

  function applyActiveTicket(s) {
    setText('.ticket-main-title', s.ticketName);
    setText('.ticket-sub-title', s.ticketName);
    setText('.tessera-nome', `${s.firstName} ${s.lastName}`.trim().toUpperCase(), true);
    setText('.tessera-cf', (s.fiscalCode || '').toUpperCase(), true);

    const values = document.querySelectorAll('.tessera-valore');
    if (values[0]) values[0].textContent = s.cardNumber || '';
    const expiry = document.querySelector('.tessera-valore.scadenza');
    if (expiry) expiry.textContent = formatDate(s.cardExpiry);

    const cardPhoto = document.querySelector('.tessera-foto');
    if (cardPhoto) {
      if (s.cardPhoto) {
        cardPhoto.src = s.cardPhoto;
        cardPhoto.style.display = 'block';
      } else {
        cardPhoto.removeAttribute('src');
        cardPhoto.style.display = 'none';
      }
    }

    if (s.qrPhoto) {
      document.querySelectorAll('.qr-code, .qr-overlay-img').forEach(img => { img.src = s.qrPhoto; });
    }

    const validityDates = document.querySelectorAll('.validity-banner strong');
    if (validityDates[0]) validityDates[0].textContent = formatDate(s.validFrom);
    if (validityDates[1]) validityDates[1].textContent = formatDate(s.validTo);

    const metaValues = document.querySelectorAll('.bottom-details .meta-value');
    if (metaValues[0]) metaValues[0].textContent = formatDateTime(s.issuedAt);
    setText('.bottom-details .price-value', s.price);
    setText('.ticket-code-value', s.ticketCode);
    setText('.live-code span', s.lockCode);
  }

  function installSecretButton() {
    if (!/index\.html$|\/$/.test(location.pathname)) return;
    const secondPromo = document.querySelector('#promoCarousel .promo-banner:nth-child(2)');
    if (!secondPromo || secondPromo.dataset.secretSettingsInstalled === '1') return;

    secondPromo.dataset.secretSettingsInstalled = '1';

    let tapCount = 0;
    let firstTapAt = 0;
    const TAP_WINDOW_MS = 2200;
    const REQUIRED_TAPS = 5;

    secondPromo.addEventListener('click', () => {
      const now = Date.now();

      if (!firstTapAt || now - firstTapAt > TAP_WINDOW_MS) {
        tapCount = 1;
        firstTapAt = now;
      } else {
        tapCount += 1;
      }

      if (tapCount >= REQUIRED_TAPS) {
        tapCount = 0;
        firstTapAt = 0;
        location.href = 'settings.html';
      }
    });
  }

  function apply() {
    const s = loadSettings();
    applyNavigationPhoto(s);

    if (/ticket\.html$/.test(location.pathname) && !/biglietto\.html$/.test(location.pathname)) {
      applyTicketList(s);
    }
    if (/biglietto\.html$/.test(location.pathname)) {
      applyActiveTicket(s);
    }
    installSecretButton();
  }

  window.BusitaliaSettings = { STORAGE_KEY, defaults, loadSettings, formatDate, formatDateTime, apply };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();