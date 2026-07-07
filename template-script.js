// ==UserScript==
// @name         [TEMPLATE] Nuevo Script con Panel Flotante
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @version      1.0.1
// @description  Plantilla base estandarizada
// @match        *://tu-url-aqui.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = {
    COLOR_PRIMARIO: '#276466',
    BTN_POS_KEY: 'tm_tpl_btn_pos',
    PANEL_POS_KEY: 'tm_tpl_panel_pos',
  };

  // =========================================================================
  // LÓGICA UNIVERSAL DE INTERFAZ (ARRASTRE Y LÍMITES)
  // =========================================================================
  const GestorUI = {
    configurarArrastre: function (elemento, zonaArrastre, claveStorage, esBoton = false, posDefecto = {bottom: '20px', right: '20px'}) {
      let arrastrando = false,
        seMovio = false,
        offsetX,
        offsetY;

      // 1. Restaurar posición y evitar que quede fuera de la pantalla
      const posGuardada = localStorage.getItem(claveStorage);
      if (posGuardada) {
        try {
          const p = JSON.parse(posGuardada);
          const x = parseInt(p.left),
            y = parseInt(p.top);
          // Chequeo de límites (Bounds check)
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

      // 2. Eventos de ratón
      zonaArrastre.addEventListener('mousedown', (e) => {
        // Ignorar si se hace clic en botones de cerrar o acciones internas
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
        // Prevenir que se salga de la ventana
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

  function initUI() {
    if (document.getElementById('tm-tpl-btn')) return;

    // Inyección de CSS básica
    const style = document.createElement('style');
    style.textContent = `
            #tm-tpl-btn { position: fixed; z-index: 999999; padding: 10px 16px; background: ${CONFIG.COLOR_PRIMARIO}; color: white; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3); user-select: none; }
            #tm-tpl-panel { position: fixed; width: 400px; height: 300px; background: #fff; border-radius: 12px; z-index: 999999; display: none; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; resize: both; border: 1px solid #ccc; }
            #tm-tpl-header { background: ${CONFIG.COLOR_PRIMARIO}; color: white; padding: 12px; cursor: grab; display: flex; justify-content: space-between; }
            #tm-tpl-header:active { cursor: grabbing; }
            .no-drag { cursor: pointer; }
            .tm-is-dragging iframe { pointer-events: none !important; }
        `;
    document.head.appendChild(style);

    // Crear Botón
    const btn = document.createElement('div');
    btn.id = 'tm-tpl-btn';
    btn.innerHTML = '<span>🚀 Abrir Panel</span>';
    document.body.appendChild(btn);

    // Crear Panel
    const panel = document.createElement('div');
    panel.id = 'tm-tpl-panel';
    panel.innerHTML = `
            <div id="tm-tpl-header">
                <span>Título del Script</span>
                <span id="tm-tpl-close" class="no-drag">✖</span>
            </div>
            <div style="padding: 15px; flex-grow: 1; overflow-y: auto;">
                <p>Contenido del panel aquí...</p>
            </div>
        `;
    document.body.appendChild(panel);

    // =========================================================================
    // APLICAR GESTOR DE ARRASTRE
    // =========================================================================
    GestorUI.configurarArrastre(btn, btn, CONFIG.BTN_POS_KEY, true, {bottom: '20px', right: '20px', top: 'auto', left: 'auto'});
    GestorUI.configurarArrastre(panel, document.getElementById('tm-tpl-header'), CONFIG.PANEL_POS_KEY, false, {
      top: '50px',
      right: '50px',
      bottom: 'auto',
      left: 'auto',
    });

    // Eventos de apertura/cierre
    btn.addEventListener('click', () => {
      if (btn.dataset.dragged === 'true') {
        btn.dataset.dragged = 'false';
        return;
      }
      panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    });

    document.getElementById('tm-tpl-close').addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI);
  else initUI();
})();
