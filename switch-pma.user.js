// ==UserScript==
// @name         Abanca: Switcher España/Portugal
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.0.3
// @description  Botón flotante bidireccional para cambiar entre los entornos /es-ES/ y /pt-PT/ con banderas SVG
// @match        *://tcaplicaciones.abanca.com/*
// @match        *://tpaplicaciones.abanca.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/switch-pma.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/switch-pma.user.js
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = {
    COLOR_PRIMARIO: '#276466',
    COLOR_SECUNDARIO: '#1e4f51',
    BTN_POS_KEY: 'tm_env_switcher_btn_pos',
  };

  // =========================================================================
  // GESTOR UI UNIVERSAL (Arrastre y Límites)
  // =========================================================================
  const GestorUI = {
    configurarArrastre: function (elemento, zonaArrastre, claveStorage, esBoton = false, posDefecto = {bottom: '30px', right: '30px'}) {
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
  // LÓGICA DE CAMBIO DUAL DE ENTORNO (Subdominio + Idioma)
  // =========================================================================
  function switchEnvironment() {
    const currentUrl = window.location.href;
    let newUrl = currentUrl;

    if (currentUrl.includes('tcaplicaciones.abanca.com') || currentUrl.includes('/es-ES/')) {
      newUrl = newUrl.replace('tcaplicaciones.abanca.com', 'tpaplicaciones.abanca.com').replace('/es-ES/', '/pt-PT/');
    } else if (currentUrl.includes('tpaplicaciones.abanca.com') || currentUrl.includes('/pt-PT/')) {
      newUrl = newUrl.replace('tpaplicaciones.abanca.com', 'tcaplicaciones.abanca.com').replace('/pt-PT/', '/es-ES/');
    } else {
      alert('No se ha podido identificar el entorno actual en la URL.');
      return;
    }

    if (newUrl !== currentUrl) {
      window.location.href = newUrl;
    }
  }

  // =========================================================================
  // INICIALIZACIÓN DE LA UI
  // =========================================================================
  function initUI() {
    if (document.getElementById('tm-switcher-btn')) return;

    const currentUrl = window.location.href;
    const isSpain = currentUrl.includes('tcaplicaciones.abanca.com') || currentUrl.includes('/es-ES/');
    const isPortugal = currentUrl.includes('tpaplicaciones.abanca.com') || currentUrl.includes('/pt-PT/');

    if (!isSpain && !isPortugal) return;

    // Banderas SVG vectoriales
    const svgES = `<svg class="flag-icon" width="24" height="16" viewBox="0 0 750 500"><rect width="750" height="500" fill="#c60b1e"/><rect width="750" height="250" y="125" fill="#ffc400"/></svg>`;
    const svgPT = `<svg class="flag-icon" width="24" height="16" viewBox="0 0 600 400"><rect width="600" height="400" fill="#da291c"/><rect width="240" height="400" fill="#046a38"/></svg>`;

    // Transición visual: Bandera Origen > Bandera Destino
    const flowContent = isSpain ? `${svgES} <span class="arrow">&gt;</span> ${svgPT}` : `${svgPT} <span class="arrow">&gt;</span> ${svgES}`;

    const style = document.createElement('style');
    style.textContent = `
        #tm-switcher-btn {
            position: fixed;
            z-index: 9999999;
            padding: 10px 18px;
            background: ${CONFIG.COLOR_PRIMARIO};
            color: #ffffff;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 6px 18px rgba(0,0,0,0.35);
            user-select: none;
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 700;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: background 0.2s ease, transform 0.1s ease;
        }
        #tm-switcher-btn .flag-icon {
            display: inline-block;
            vertical-align: middle;
            border-radius: 2px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        #tm-switcher-btn .arrow {
            font-weight: 900;
            opacity: 0.9;
            margin: 0 2px;
        }
        #tm-switcher-btn:hover {
            background: ${CONFIG.COLOR_SECUNDARIO};
        }
        #tm-switcher-btn:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('div');
    btn.id = 'tm-switcher-btn';
    btn.innerHTML = flowContent;
    document.body.appendChild(btn);

    GestorUI.configurarArrastre(btn, btn, CONFIG.BTN_POS_KEY, true, {bottom: '30px', right: '30px', top: 'auto', left: 'auto'});

    btn.addEventListener('click', () => {
      if (btn.dataset.dragged === 'true') {
        btn.dataset.dragged = 'false';
        return;
      }
      switchEnvironment();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
})();
