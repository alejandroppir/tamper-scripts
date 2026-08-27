// ==UserScript==
// @name         Abanca: Dev Utils (Switcher & Error Manager)
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.2.0
// @description  Bubble Menu flotante adaptativo con cambio ES/PT y gestor de errores CDK.
// @match        *://tcaplicaciones.abanca.com/*
// @match        *://tpaplicaciones.abanca.com/*
// @match        *://tcaplicaciones/*
// @match        *://tpaplicaciones/*
// @match        *://localhost:*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/bgur-dev-utils.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/bgur-dev-utils.user.js
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = {
    COLOR_PRIMARIO: '#276466',
    COLOR_SECUNDARIO: '#1e4f51',
    BTN_POS_KEY: 'tm_devutils_btn_pos',
  };

  // =========================================================================
  // GESTOR UI UNIVERSAL (Arrastre y Límites)
  // =========================================================================
  const GestorUI = {
    configurarArrastre: function (elemento, zonaArrastre, claveStorage, esBoton = false, posDefecto = {top: '20px', left: '20px'}) {
      let arrastrando = false,
        seMovio = false,
        offsetX,
        offsetY;

      const posGuardada = localStorage.getItem(claveStorage);
      if (posGuardada) {
        try {
          const p = JSON.parse(posGuardada);
          const x = parseInt(p.left),
            y = parseInt(p.top);
          if (x >= 0 && y >= 0 && x < window.innerWidth - 50 && y < window.innerHeight - 50) {
            elemento.style.left = p.left;
            elemento.style.top = p.top;
            elemento.style.bottom = 'auto';
            elemento.style.right = 'auto';
          } else {
            aplicarPosicionDefecto();
          }
        } catch (e) {
          aplicarPosicionDefecto();
        }
      } else {
        aplicarPosicionDefecto();
      }

      function aplicarPosicionDefecto() {
        Object.assign(elemento.style, posDefecto);
      }

      zonaArrastre.addEventListener('mousedown', (e) => {
        if (e.target.closest('.no-drag') || ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'].includes(e.target.tagName)) return;

        e.preventDefault();
        document.body.classList.add('tm-is-dragging');

        // Cerrar menú al iniciar arrastre
        elemento.classList.remove('open');

        arrastrando = true;
        seMovio = false;
        const rect = elemento.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        elemento.style.bottom = 'auto';
        elemento.style.right = 'auto';
        elemento.style.left = rect.left + 'px';
        elemento.style.top = rect.top + 'px';
      });

      document.addEventListener('mousemove', (e) => {
        if (!arrastrando) return;
        seMovio = true;
        let newX = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - elemento.offsetWidth));
        let newY = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - elemento.offsetHeight));
        elemento.style.left = newX + 'px';
        elemento.style.top = newY + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (!arrastrando) return;
        arrastrando = false;

        document.body.classList.remove('tm-is-dragging');

        if (seMovio) {
          if (esBoton) elemento.dataset.dragged = 'true';
          localStorage.setItem(claveStorage, JSON.stringify({left: elemento.style.left, top: elemento.style.top}));
        }
      });
    },
  };

  // =========================================================================
  // LÓGICA DE NEGOCIO
  // =========================================================================
  function switchEnvironment() {
    const currentUrl = window.location.href;
    let newUrl = currentUrl;

    if (currentUrl.includes('tcaplicaciones') || currentUrl.includes('/es-ES/')) {
      newUrl = newUrl.replace('tcaplicaciones', 'tpaplicaciones').replace('/es-ES/', '/pt-PT/');
    } else if (currentUrl.includes('tpaplicaciones') || currentUrl.includes('/pt-PT/')) {
      newUrl = newUrl.replace('tpaplicaciones', 'tcaplicaciones').replace('/pt-PT/', '/es-ES/');
    } else {
      alert('No se ha podido identificar el entorno actual en la URL.');
      return;
    }

    if (newUrl !== currentUrl) {
      window.location.href = newUrl;
    }
  }

  function ocultarError() {
    const overlays = Array.from(document.querySelectorAll('div.cdk-overlay-container'));
    const target = overlays.find((el) => el.style.display !== 'none');

    if (target) {
      target.dataset.tmOriginalDisplay = target.style.display || '';
      target.dataset.tmHiddenByScript = 'true';
      target.style.display = 'none';
    } else {
      alert('No se encontró ningún cdk-overlay-container visible.');
    }
  }

  function mostrarError() {
    const hiddenByUs = document.querySelectorAll('div.cdk-overlay-container[data-tm-hidden-by-script="true"]');

    if (hiddenByUs.length === 0) {
      alert('No hay ventanas de error ocultadas previamente por el script.');
      return;
    }

    hiddenByUs.forEach((el) => {
      el.style.display = el.dataset.tmOriginalDisplay || '';
      delete el.dataset.tmHiddenByScript;
      delete el.dataset.tmOriginalDisplay;
    });
  }

  // =========================================================================
  // INICIALIZACIÓN DE LA UI
  // =========================================================================
  function initUI() {
    if (document.getElementById('tm-devutils-wrapper')) return;

    const currentUrl = window.location.href;
    const isSpain = currentUrl.includes('tcaplicaciones') || currentUrl.includes('/es-ES/');
    const isPortugal = currentUrl.includes('tpaplicaciones') || currentUrl.includes('/pt-PT/');

    const svgES = `<svg class="flag-icon" width="20" height="14" viewBox="0 0 750 500"><rect width="750" height="500" fill="#c60b1e"/><rect width="750" height="250" y="125" fill="#ffc400"/></svg>`;
    const svgPT = `<svg class="flag-icon" width="20" height="14" viewBox="0 0 600 400"><rect width="600" height="400" fill="#da291c"/><rect width="240" height="400" fill="#046a38"/></svg>`;

    const flowContent = isSpain ? `${svgES} <span class="arrow">&gt;</span> ${svgPT}` : `${svgPT} <span class="arrow">&gt;</span> ${svgES}`;

    const devIconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;

    const style = document.createElement('style');
    style.textContent = `
      #tm-devutils-wrapper {
        position: fixed;
        z-index: 9999999;
        width: 48px;
        height: 48px;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #tm-devutils-btn {
        width: 48px;
        height: 48px;
        background: ${CONFIG.COLOR_PRIMARIO};
        color: #ffffff;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: background 0.2s ease, transform 0.1s ease;
      }
      #tm-devutils-btn:hover {
        background: ${CONFIG.COLOR_SECUNDARIO};
      }
      #tm-devutils-btn:active {
        transform: scale(0.95);
      }
      #tm-devutils-menu {
        position: absolute;
        display: none;
        flex-direction: column;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        padding: 10px;
        min-width: 220px;
        gap: 6px;
        color: #333333;
        z-index: 10000000;
      }
      #tm-devutils-wrapper.open #tm-devutils-menu {
        display: flex;
      }
      .tm-menu-section-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #718096;
        padding: 4px 6px 0 6px;
        font-weight: 700;
      }
      .tm-menu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border-radius: 8px;
        background: #f7fafc;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        color: #2d3748;
        border: 1px solid transparent;
        transition: background 0.15s ease, border-color 0.15s ease;
      }
      .tm-menu-item:hover {
        background: #eef4f4;
        border-color: ${CONFIG.COLOR_PRIMARIO};
      }
      .tm-menu-item .flag-icon {
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      .tm-menu-item .arrow {
        font-weight: 900;
        margin: 0 4px;
        opacity: 0.7;
      }
      .tm-submenu-group {
        display: flex;
        gap: 6px;
      }
      .tm-submenu-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #2d3748;
        transition: all 0.15s ease;
      }
      .tm-submenu-btn.hide-btn:hover {
        background: #fff5f5;
        border-color: #feb2b2;
        color: #c53030;
      }
      .tm-submenu-btn.show-btn:hover {
        background: #f0fff4;
        border-color: #9ae6b4;
        color: #276749;
      }
    `;
    document.head.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.id = 'tm-devutils-wrapper';

    const menu = document.createElement('div');
    menu.id = 'tm-devutils-menu';
    menu.className = 'no-drag';

    menu.innerHTML = `
      <div class="tm-menu-section-title">Entorno</div>
      <div class="tm-menu-item" id="tm-item-switch">
        <span>Cambiar PMA</span>
        <div style="display: flex; align-items: center;">${flowContent}</div>
      </div>

      <div class="tm-menu-section-title">Ventanas de Error</div>
      <div class="tm-submenu-group">
        <button class="tm-submenu-btn hide-btn" id="tm-btn-hide-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          Ocultar
        </button>
        <button class="tm-submenu-btn show-btn" id="tm-btn-show-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Mostrar
        </button>
      </div>
    `;

    const btn = document.createElement('div');
    btn.id = 'tm-devutils-btn';
    btn.innerHTML = devIconSvg;
    btn.title = 'Dev Utils';

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    document.body.appendChild(wrapper);

    GestorUI.configurarArrastre(wrapper, btn, CONFIG.BTN_POS_KEY, true, {top: '30px', left: '30px', bottom: 'auto', right: 'auto'});

    // Ajusta la dirección de apertura del menú según los límites de la pantalla
    function actualizarPosicionMenu() {
      const rect = wrapper.getBoundingClientRect();
      const midY = window.innerHeight / 2;
      const midX = window.innerWidth / 2;

      // Orientación Vertical
      if (rect.top > midY) {
        menu.style.top = 'auto';
        menu.style.bottom = '56px'; // Despliega hacia ARRIBA
      } else {
        menu.style.bottom = 'auto';
        menu.style.top = '56px'; // Despliega hacia ABAJO
      }

      // Orientación Horizontal
      if (rect.left > midX) {
        menu.style.left = 'auto';
        menu.style.right = '0px'; // Alineado a la DERECHA del botón
      } else {
        menu.style.right = 'auto';
        menu.style.left = '0px'; // Alineado a la IZQUIERDA del botón
      }
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wrapper.dataset.dragged === 'true') {
        wrapper.dataset.dragged = 'false';
        return;
      }

      if (!wrapper.classList.contains('open')) {
        actualizarPosicionMenu();
        wrapper.classList.add('open');
      } else {
        wrapper.classList.remove('open');
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
      }
    });

    document.getElementById('tm-item-switch').addEventListener('click', () => {
      switchEnvironment();
    });

    document.getElementById('tm-btn-hide-error').addEventListener('click', () => {
      ocultarError();
      wrapper.classList.remove('open');
    });

    document.getElementById('tm-btn-show-error').addEventListener('click', () => {
      mostrarError();
      wrapper.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
})();
