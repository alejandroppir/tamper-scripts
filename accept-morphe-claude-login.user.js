// ==UserScript==
// @name         GCloud SDK: Auto Login & Consent
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.2.0
// @description  Automatiza la selección de cuenta y consentimiento de 'gcloud auth login --update-adc'
// @match        https://accounts.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // =========================================================================
  // CONFIGURACIÓN GLOBAL
  // =========================================================================
  const CONFIG = {
    MI_CORREO: 'tu_mail@externos.abanca.com',
    CLIENT_ID_GCLOUD: '32555940559.apps.googleusercontent.com',
    LOCALHOST_PREFIX: 'http://localhost:',
    STORAGE_KEY: 'tm_gcloud_auth_origin',

    RETRY_INTERVAL_MS: 800,
    MAX_WAIT_TIME_MS: 15000,
    MAX_SESSION_AGE_MS: 120000,
  };

  const log = (...args) => console.log('☁️ [GCloud-AutoAuth]', ...args);

  // =========================================================================
  // HELPER: DISPARO COMPLETO DE EVENTOS (Google Wiz / jsaction)
  // =========================================================================
  function dispararClickNativo(elemento) {
    if (!elemento) return;

    elemento.focus?.();
    const eventParams = {bubbles: true, cancelable: true, composed: true, view: window};

    try {
      elemento.dispatchEvent(new PointerEvent('pointerdown', eventParams));
      elemento.dispatchEvent(new MouseEvent('mousedown', eventParams));
      elemento.dispatchEvent(new PointerEvent('pointerup', eventParams));
      elemento.dispatchEvent(new MouseEvent('mouseup', eventParams));
      elemento.dispatchEvent(new MouseEvent('click', eventParams));
    } catch (e) {
      elemento.click();
    }

    if (typeof elemento.click === 'function') {
      elemento.click();
    }
  }

  // =========================================================================
  // VALIDACIÓN DE PETICIÓN
  // =========================================================================
  const currentUrl = new URL(window.location.href);
  const searchParams = currentUrl.searchParams;

  const urlClientId = searchParams.get('client_id');
  const urlRedirect = searchParams.get('redirect_uri') || searchParams.get('app_domain') || '';
  const pathname = currentUrl.pathname;

  const esAccountChooser = pathname.includes('accountchooser') || pathname.includes('identifier');
  const esConsent = pathname.includes('/consent') || pathname.includes('/auth');

  // =========================================================================
  // 1. SELECCIÓN DE CUENTA (Account Chooser)
  // =========================================================================
  if (esAccountChooser) {
    const esGcloudValido =
      urlClientId === CONFIG.CLIENT_ID_GCLOUD && (urlRedirect.startsWith(CONFIG.LOCALHOST_PREFIX) || currentUrl.href.includes('localhost'));

    if (!esGcloudValido) return;

    log('Petición verificada de GCloud SDK. Iniciando proceso de selección...');

    sessionStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({ts: Date.now(), client_id: urlClientId}));

    const emailBuscado = CONFIG.MI_CORREO.trim().toLowerCase();
    const startTime = Date.now();
    let clickCount = 0;

    const intervalCuenta = setInterval(() => {
      if (Date.now() - startTime > CONFIG.MAX_WAIT_TIME_MS) {
        clearInterval(intervalCuenta);
        log('Tiempo de espera agotado en la selección de cuenta.');
        return;
      }

      // Localizar el nodo de texto o atributo que contiene el correo
      const nodosTexto = Array.from(document.querySelectorAll('*')).filter((el) => {
        return el.children.length === 0 && el.textContent && el.textContent.trim().toLowerCase() === emailBuscado;
      });

      const nodoAttr = document.querySelector(
        `[data-email*="${emailBuscado}" i], [data-identifier*="${emailBuscado}" i], [aria-label*="${emailBuscado}" i]`,
      );

      const targetRef = nodosTexto[0] || nodoAttr;

      if (targetRef) {
        // En Google v3 el handler suele estar en el elemento con role="link", role="button" o [jsaction]
        const interactuable =
          targetRef.closest('[role="link"], [role="button"], [jsaction*="click"], a, button') || targetRef.closest('li') || targetRef;

        clickCount++;
        log(`Intento de selección #${clickCount} sobre:`, interactuable);
        dispararClickNativo(interactuable);
      }
    }, CONFIG.RETRY_INTERVAL_MS);
  }

  // =========================================================================
  // 2. APROBACIÓN DE CONSENTIMIENTO
  // =========================================================================
  if (esConsent) {
    const sessionRaw = sessionStorage.getItem(CONFIG.STORAGE_KEY);
    let sessionValida = false;

    if (sessionRaw) {
      try {
        const sess = JSON.parse(sessionRaw);
        if (Date.now() - sess.ts < CONFIG.MAX_SESSION_AGE_MS && sess.client_id === CONFIG.CLIENT_ID_GCLOUD) {
          sessionValida = true;
        }
      } catch (e) {}
    }

    const esClientIdValido = urlClientId === CONFIG.CLIENT_ID_GCLOUD;
    if (!esClientIdValido && !sessionValida) return;

    log('Pantalla de consentimiento identificada. Localizando botón de confirmación...');

    const startTime = Date.now();
    const intervalConsent = setInterval(() => {
      if (Date.now() - startTime > CONFIG.MAX_WAIT_TIME_MS) {
        clearInterval(intervalConsent);
        log('Tiempo de espera agotado buscando el botón de consentimiento.');
        return;
      }

      const botones = Array.from(document.querySelectorAll('button, div[role="button"]'));
      const textosAceptacion = ['continuar', 'permitir', 'continue', 'allow'];

      for (const btn of botones) {
        const txt = btn.innerText.trim().toLowerCase();
        const deshabilitado = btn.disabled === true || btn.getAttribute('aria-disabled') === 'true' || btn.offsetParent === null;

        if (textosAceptacion.includes(txt) && !deshabilitado) {
          log(`Confirmando permisos ("${btn.innerText.trim()}")...`);
          clearInterval(intervalConsent);
          sessionStorage.removeItem(CONFIG.STORAGE_KEY);
          dispararClickNativo(btn);
          break;
        }
      }
    }, CONFIG.RETRY_INTERVAL_MS);
  }
})();
