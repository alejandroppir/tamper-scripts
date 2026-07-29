// ==UserScript==
// @name         Gemini: Nav & Enter Customizer
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.2.0
// @description  Navegación por mensajes propios (arriba/abajo/final) + Enter = salto de línea, Ctrl+Enter = enviar.
// @match        https://gemini.google.com/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/gemini-enter.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/gemini-enter.user.js
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = {
    COLOR_PRIMARIO: '#1a73e8',
    BTN_POS_KEY: 'tm_gemini_nav_pos_v4',
  };

  // =========================================================================
  // 1. LÓGICA DE TECLAS (Enter = Salto de línea / Ctrl+Enter = Enviar)
  // =========================================================================
  document.addEventListener(
    'keydown',
    function (e) {
      if (e.key !== 'Enter' || e.isComposing) return;

      const editor = e.target.closest('[contenteditable="true"]');
      if (!editor || e.isSimulatedEvent) return;

      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Enter -> ENVIAR
        e.preventDefault();
        e.stopPropagation();

        const enviarEvt = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        });

        Object.defineProperty(enviarEvt, 'isSimulatedEvent', {value: true});
        e.target.dispatchEvent(enviarEvt);
      } else if (!e.shiftKey && !e.altKey) {
        // Enter a secas -> SALTO DE LÍNEA
        e.preventDefault();
        e.stopPropagation();

        const saltoEvt = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });

        Object.defineProperty(saltoEvt, 'isSimulatedEvent', {value: true});
        e.target.dispatchEvent(saltoEvt);
      }
    },
    true,
  );

  // =========================================================================
  // 2. GESTOR DE ARRASTRE
  // =========================================================================
  const GestorUI = {
    configurarArrastre: function (elemento, zonaArrastre, claveStorage, posDefecto = {bottom: '120px', right: '30px'}) {
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
          if (x >= 0 && y >= 0 && x < window.innerWidth - 40 && y < window.innerHeight - 40) {
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
        if (e.target.closest('.no-drag') || ['BUTTON', 'INPUT'].includes(e.target.tagName)) return;

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
          localStorage.setItem(claveStorage, JSON.stringify({left: elemento.style.left, top: elemento.style.top}));
        }
      });
    },
  };

  // =========================================================================
  // 3. NAVEGACIÓN Y SCROLL DE GEMINI
  // =========================================================================

  // Encuentra el contenedor interno con scroll de Gemini
  function obtenerContenedorScroll() {
    const msj = document.querySelector('user-query');
    if (msj) {
      let p = msj.parentElement;
      while (p && p !== document.body) {
        const style = window.getComputedStyle(p);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return p;
        }
        p = p.parentElement;
      }
    }
    return document.scrollingElement || document.documentElement || document.body;
  }

  // Captura exactamente 1 nodo raíz por cada mensaje enviado por el usuario
  function ObtenerMensajesUsuario() {
    let nodos = Array.from(document.querySelectorAll('user-query'));

    if (!nodos.length) {
      nodos = Array.from(document.querySelectorAll('[data-test-id="user-query"], .user-query-container'));
    }

    // Filtrar elementos duplicados o anidados dentro de otros nodos capturados
    const unicos = nodos.filter((el, index, self) => {
      const rect = el.getBoundingClientRect();
      const esVisible = rect.width > 0 && rect.height > 0;
      const esAnidado = self.some((other, otherIdx) => otherIdx !== index && other.contains(el));
      return esVisible && !esAnidado;
    });

    return unicos.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  }

  function irAMensajeAnterior() {
    const mensajes = ObtenerMensajesUsuario();
    if (!mensajes.length) return;

    // Busca el mensaje por encima de la vista actual (offset -20px)
    const anteriores = mensajes.filter((el) => el.getBoundingClientRect().top < -20);

    if (anteriores.length > 0) {
      anteriores[anteriores.length - 1].scrollIntoView({behavior: 'smooth', block: 'start'});
    } else {
      mensajes[0].scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }

  function irAMensajeSiguiente() {
    const mensajes = ObtenerMensajesUsuario();
    if (!mensajes.length) {
      irAlFinal();
      return;
    }

    // Busca el mensaje que esté claramente por debajo del mensaje visible actual (>100px)
    const siguientes = mensajes.filter((el) => el.getBoundingClientRect().top > 100);

    if (siguientes.length > 0) {
      siguientes[0].scrollIntoView({behavior: 'smooth', block: 'start'});
    } else {
      irAlFinal();
    }
  }

  function irAlFinal() {
    // 1. Scroll al final del contenedor con scroll activo
    const container = obtenerContenedorScroll();
    container.scrollTo({top: container.scrollHeight, behavior: 'smooth'});

    // 2. Apoyo visual: Scroll al último turno de la conversación
    const turnos = document.querySelectorAll('conversation-turn, model-response, user-query');
    if (turnos.length > 0) {
      turnos[turnos.length - 1].scrollIntoView({behavior: 'smooth', block: 'end'});
    }
  }

  // =========================================================================
  // 4. CREACIÓN SEGURA DE LA INTERFAZ (DOM APIs)
  // =========================================================================
  function initUI() {
    if (!document.body || document.getElementById('tm-gemini-nav-bar')) return;

    if (!document.getElementById('tm-gemini-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'tm-gemini-nav-styles';
      style.textContent = `
        #tm-gemini-nav-bar {
          position: fixed !important;
          z-index: 2147483647 !important;
          display: flex !important;
          flex-direction: column !important;
          background: rgba(30, 31, 32, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 28px !important;
          padding: 6px !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4) !important;
          user-select: none !important;
          gap: 4px !important;
        }
        .tm-nav-btn {
          width: 38px !important;
          height: 38px !important;
          border-radius: 50% !important;
          border: none !important;
          background: transparent !important;
          color: #ffffff !important;
          font-size: 18px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: background 0.2s, transform 0.1s !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .tm-nav-btn:hover {
          background: rgba(255, 255, 255, 0.25) !important;
        }
        .tm-nav-btn:active {
          transform: scale(0.9) !important;
        }
        .tm-drag-handle {
          cursor: grab !important;
          height: 14px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: rgba(255, 255, 255, 0.5) !important;
          font-size: 11px !important;
        }
        .tm-drag-handle:active {
          cursor: grabbing !important;
        }
      `;
      document.head.appendChild(style);
    }

    const navBar = document.createElement('div');
    navBar.id = 'tm-gemini-nav-bar';

    const handle = document.createElement('div');
    handle.className = 'tm-drag-handle';
    handle.title = 'Arrastrar';
    handle.textContent = '⋮⋮';

    const btnUp = document.createElement('button');
    btnUp.id = 'tm-btn-up';
    btnUp.className = 'tm-nav-btn no-drag';
    btnUp.title = 'Mensaje anterior';
    btnUp.textContent = '⬆';

    const btnDown = document.createElement('button');
    btnDown.id = 'tm-btn-down';
    btnDown.className = 'tm-nav-btn no-drag';
    btnDown.title = 'Mensaje siguiente';
    btnDown.textContent = '⬇';

    const btnBottom = document.createElement('button');
    btnBottom.id = 'tm-btn-bottom';
    btnBottom.className = 'tm-nav-btn no-drag';
    btnBottom.title = 'Ir al final de la conversación';
    btnBottom.textContent = '⤓';

    navBar.appendChild(handle);
    navBar.appendChild(btnUp);
    navBar.appendChild(btnDown);
    navBar.appendChild(btnBottom);

    document.body.appendChild(navBar);

    btnUp.addEventListener('click', irAMensajeAnterior);
    btnDown.addEventListener('click', irAMensajeSiguiente);
    btnBottom.addEventListener('click', irAlFinal);

    GestorUI.configurarArrastre(navBar, navBar, CONFIG.BTN_POS_KEY, {bottom: '120px', right: '30px', top: 'auto', left: 'auto'});
  }

  setInterval(initUI, 1000);
})();
