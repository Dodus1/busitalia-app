(() => {
  const STORAGE_KEY = 'busitalia_custom_settings_v1';

  const defaults = {
    firstName: 'VALERIO',
    lastName: 'DOTTORI',
    age: '',
    fiscalCode: 'DTTVLR98P01E388W',
    cardNumber: 'TT9821',
    cardExpiry: '2028-09-30',
    ticketName: 'MENS. URB. TU2 STU',
    validFrom: '2026-06-18',
    validTo: '2026-07-17',
    issuedAt: '2026-06-18T13:40',
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

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value !== undefined && value !== null && value !== '') el.textContent = value;
  }

  function setImage(selector, dataUrl, options = {}) {
    const el = document.querySelector(selector);
    if (!el || !dataUrl) return;
    el.src = dataUrl;
    if (options.round) {
      el.style.borderRadius = '50%';
      el.style.objectFit = 'cover';
    }
  }

  function applyNavigationPhoto(s) {
    const navImg = document.querySelector('.bottom-nav .nav-item:last-child img');
    if (!navImg || !s.navPhoto) return;
    navImg.src = s.navPhoto;
    navImg.style.borderRadius = '50%';
    navImg.style.objectFit = 'cover';
  }

  function applyTicketList(s) {
    setText('.ticket-name', s.ticketName);
    setText('.ticket-card .info-row strong', formatDate(s.validTo));
    setText('.ticket-card .price-value', s.price);
  }

  function applyActiveTicket(s) {
    setText('.ticket-main-title', s.ticketName);
    setText('.ticket-sub-title', s.ticketName);
    setText('.tessera-nome', `${s.firstName} ${s.lastName}`.trim().toUpperCase());
    setText('.tessera-cf', s.fiscalCode.toUpperCase());

    const values = document.querySelectorAll('.tessera-valore');
    if (values[0]) values[0].textContent = s.cardNumber;
    const expiry = document.querySelector('.tessera-valore.scadenza');
    if (expiry) expiry.textContent = formatDate(s.cardExpiry);

    setImage('.tessera-foto', s.cardPhoto);

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
    if (!secondPromo || secondPromo.querySelector('.secret-settings-hotspot')) return;

    secondPromo.style.position = 'relative';
    const hotspot = document.createElement('button');
    hotspot.type = 'button';
    hotspot.className = 'secret-settings-hotspot';
    hotspot.setAttribute('aria-label', '');
    Object.assign(hotspot.style, {
      position: 'absolute',
      right: '0',
      bottom: '0',
      width: '58px',
      height: '58px',
      border: '0',
      padding: '0',
      margin: '0',
      opacity: '0',
      background: 'transparent',
      zIndex: '8',
      cursor: 'default'
    });
    hotspot.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      location.href = 'settings.html';
    });
    secondPromo.appendChild(hotspot);
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