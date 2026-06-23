// ==UserScript==
// @name         Abanca Repositorio - Gestor de Contextos Avanzado
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.0.1
// @description  Descarga masiva de CSVs mapeando respuestas XML de ASMX a archivos descargables reales nombrados por pestaña.
// @match        http://exaplicaciones/rpos015/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/CGDN-contexts.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/CGDN-contexts.user.js
// ==/UserScript==

(function () {
  'use strict';

  // =========================================================================
  // 1. CONFIGURACIÓN GLOBAL (Heredando el Estilo Visual de tu Suite)
  // =========================================================================
  const CONFIG = {
    COLOR_PRIMARIO: '#276466',
    COLOR_SECUNDARIO: '#1e4f51',
    BTN_POS_KEY: 'tm_ctx_btn_position',
    PANEL_POS_KEY: 'tm_ctx_panel_position',
    TABS_STATE_KEY: 'tm_ctx_tabs_persistent_state',
    QUEUE_DELAY: 1000, // 1 segundo completo de tregua al servidor IIS entre pestañas
    ROW_SELECTOR: 'tr',
  };

  // =========================================================================
  // 2. ARRANQUE SEGURO (Solo en la ventana principal para evitar duplicados)
  // =========================================================================
  function inicializarScript() {
    if (window !== window.top) return;

    if (!document.body) {
      setTimeout(inicializarScript, 100);
      return;
    }

    if (document.getElementById('tm-floating-btn')) return;

    const plusSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    const trashSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    const logoPanelSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;

    const style = document.createElement('style');
    style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            * { box-sizing: border-box; }

            #tm-panel, #tm-floating-btn {
                font-family: 'Inter', system-ui, -apple-system, "Segoe UI", sans-serif;
            }

            /* ---- BOTÓN ACCIÓN FLOTANTE SEGMENTADO ---- */
            #tm-floating-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                position: fixed;
                z-index: 999999;
                padding: 6px 12px;
                background: ${CONFIG.COLOR_PRIMARIO};
                color: white;
                border-radius: 100px;
                box-shadow: 0 4px 6px -1px rgba(39,100,102,0.35), 0 2px 4px -1px rgba(39,100,102,0.2);
                transition: box-shadow 0.2s;
                user-select: none;
                cursor: grab;
            }
            #tm-floating-btn:hover {
                box-shadow: 0 8px 15px -3px rgba(39,100,102,0.4), 0 4px 6px -2px rgba(39,100,102,0.2);
            }

            .tm-floating-subbtn {
                background: rgba(255, 255, 255, 0.15);
                border: none;
                color: white;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.15s, transform 0.1s;
            }
            .tm-floating-subbtn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }
            .tm-floating-subbtn:active { transform: scale(0.95); }

            .tm-btn-text {
                font-weight: 600;
                font-size: 13px;
                letter-spacing: 0.2px;
                padding: 0 4px;
                cursor: pointer;
            }

            /* ---- PANEL POPUP REDIMENSIONABLE ---- */
            #tm-panel {
                position: fixed;
                top: 40px;
                right: 40px;
                width: 850px;
                height: 650px;
                min-width: 450px;
                min-height: 350px;
                background: #f8fafb;
                border: 1px solid rgba(0,0,0,0.07);
                border-radius: 16px;
                z-index: 999998;
                display: none;
                flex-direction: column;
                box-shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 25px 50px -12px rgba(0,0,0,0.18);
                overflow: hidden;
                resize: both;
            }

            #tm-header {
                background: linear-gradient(135deg, ${CONFIG.COLOR_PRIMARIO} 0%, ${CONFIG.COLOR_SECUNDARIO} 100%);
                color: white;
                padding: 14px 20px;
                font-weight: 600;
                font-size: 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: grab;
                user-select: none;
                flex-shrink: 0;
            }
            #tm-header:active { cursor: grabbing; }

            .tm-header-title { display: flex; align-items: center; gap: 10px; pointer-events: none; }
            .tm-header-actions { display: flex; align-items: center; gap: 6px; }

            .tm-panel-btn {
                background: rgba(255,255,255,0.12); border: none; color: white;
                padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
                cursor: pointer; transition: background 0.15s; display: inline-flex; align-items: center; gap: 4px;
            }
            .tm-panel-btn:hover { background: rgba(255,255,255,0.25); }

            #tm-close {
                cursor: pointer; width: 28px; height: 28px; display: flex;
                align-items: center; justify-content: center; border-radius: 6px;
                opacity: 0.7; transition: all 0.15s ease; font-size: 14px;
            }
            #tm-close:hover { opacity: 1; background: rgba(255,255,255,0.15); }

            /* ---- PESTAÑAS ---- */
            #tm-tab-bar {
                display: flex; background: #eef2f5; border-bottom: 1px solid #e2e8f0;
                padding: 8px 8px 0 8px; gap: 4px; overflow-x: auto; flex-shrink: 0;
            }
            .tm-tab-item {
                display: flex; align-items: center; background: #cbd5e1;
                color: #475569; padding: 6px 12px; border-radius: 8px 8px 0 0;
                cursor: grab; font-size: 11px; font-weight: 600; transition: background 0.15s, border-top 0.15s;
                max-width: 140px; border: 1px solid #cbd5e1; border-bottom: none;
            }
            .tm-tab-item:hover { background: #94a3b8; color: #1e293b; }
            .tm-tab-item.active {
                background: #ffffff; color: ${CONFIG.COLOR_PRIMARIO}; font-weight: 700;
                border-top: 3px solid ${CONFIG.COLOR_PRIMARIO}; padding-top: 4px; cursor: grab;
            }
            .tm-tab-item.tm-dragging {
                opacity: 0.4; background: #94a3b8; border: 1px dashed #475569;
            }
            .tm-tab-close {
                margin-left: 8px; font-size: 10px; color: #94a3b8; border-radius: 50%;
                width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center;
                cursor: pointer;
            }
            .tm-tab-close:hover { background: #ef4444; color: white; }

            /* ---- ÁREA DE VISUALIZACIÓN ---- */
            #tm-content-area { flex-grow: 1; position: relative; background: #ffffff; }
            .tm-tab-view-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: none; }
            .tm-iframe-view { width: 100%; height: 100%; border: none; }

            .tm-tab-placeholder {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: #f1f5f9; color: #64748b; font-size: 13px; font-weight: 500;
                display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
                z-index: 5;
            }

            #tm-placeholder {
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                color: #94a3b8; text-align: center; font-size: 13px; font-weight: 500;
            }
        `;
    document.head.appendChild(style);

    // Estructuración de la interfaz
    const floatBtn = document.createElement('div');
    floatBtn.id = 'tm-floating-btn';
    floatBtn.innerHTML = `
            <button id="tm-btn-inject" class="tm-floating-subbtn" title="Inyectar controles alternativos">${plusSvg}</button>
            <span class="tm-btn-text">Controles</span>
            <button id="tm-btn-remove" class="tm-floating-subbtn" title="Quitar controles de la página">${trashSvg}</button>
        `;
    document.body.appendChild(floatBtn);

    const panel = document.createElement('div');
    panel.id = 'tm-panel';
    panel.innerHTML = `
            <div id="tm-header">
                <div class="tm-header-title">${logoPanelSvg} Visor de Campos Multitarea</div>
                <div class="tm-header-actions">
                    <button type="button" id="tm-refresh-current" class="tm-panel-btn" title="Recargar la pestaña activa en pantalla">🔄 Recargar Pestaña</button>
                    <button type="button" id="tm-download-csv-all" class="tm-panel-btn" title="Descargar todos los CSVs abiertos">📥 Descargar CSVs</button>
                    <button type="button" id="tm-close-all" class="tm-panel-btn">Cerrar Todo</button>
                    <span id="tm-close" title="Cerrar Panel">✕</span>
                </div>
            </div>
            <div id="tm-tab-bar"></div>
            <div id="tm-content-area">
                <div id="tm-placeholder">Ningún contexto cargado. Usa los controles de la tabla de resultados.</div>
            </div>
        `;
    document.body.appendChild(panel);

    // =========================================================================
    // 3. GESTOR DE PESTAÑAS INTERNAS MULTITAREA CON MOTOR DE PERSISTENCIA LAZY
    // =========================================================================
    window.customTabManager = {
      tabs: [],
      activeTabId: null,
      isProcessingQueue: false,

      saveState() {
        localStorage.setItem(CONFIG.TABS_STATE_KEY, JSON.stringify(this.tabs.map((t) => ({title: t.title, url: t.url, type: t.type}))));
      },

      addTab(title, url, type, autoSave = true, openPanel = true) {
        if (openPanel) {
          panel.style.display = 'flex';
          document.getElementById('tm-placeholder').style.display = 'none';
        }

        const existing = this.tabs.find((t) => t.url === url);
        if (existing) {
          if (openPanel) this.setActiveTab(existing.id);
          return;
        }

        const id = 'tab-' + Date.now() + Math.random().toString(36).substr(2, 5);
        this.tabs.push({id, title, url, type, loaded: false});

        const tabBar = document.getElementById('tm-tab-bar');
        const tabItem = document.createElement('div');
        tabItem.className = 'tm-tab-item';
        tabItem.id = `item-${id}`;
        tabItem.setAttribute('draggable', 'true');
        tabItem.innerHTML = `
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; pointer-events:none;">${title}</span>
                    <span class="tm-tab-close" data-id="${id}">✕</span>
                `;
        tabItem.onclick = (e) => {
          if (e.target.classList.contains('tm-tab-close')) return;
          this.setActiveTab(id);
        };

        tabItem.addEventListener('dragstart', () => tabItem.classList.add('tm-dragging'));
        tabItem.addEventListener('dragend', () => tabItem.classList.remove('tm-dragging'));
        tabBar.appendChild(tabItem);

        const contentArea = document.getElementById('tm-content-area');
        const container = document.createElement('div');
        container.id = `container-${id}`;
        container.className = 'tm-tab-view-container';
        container.innerHTML = `
                    <div id="placeholder-${id}" class="tm-tab-placeholder">
                        <div style="font-size: 16px;">⏳</div>
                        <div>En cola de espera (Respetando servidor)...</div>
                    </div>
                    <iframe id="frame-${id}" class="tm-iframe-view" src="about:blank"></iframe>
                `;
        contentArea.appendChild(container);

        if (openPanel || !this.activeTabId) {
          this.setActiveTab(id);
        }
        if (autoSave) this.saveState();
      },

      async procesarColaDeCarga() {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;

        for (let i = 0; i < this.tabs.length; i++) {
          let tab = this.tabs[i];
          if (tab.loaded) continue;

          const iframe = document.getElementById(`frame-${tab.id}`);
          const placeholder = document.getElementById(`placeholder-${tab.id}`);

          if (iframe) {
            if (placeholder) {
              placeholder.innerHTML = `<div style="font-size: 16px;">🔄</div><div>Consultando datos en servidor corporativo...</div>`;
            }

            iframe.src = tab.url;
            await new Promise((resolve) => setTimeout(resolve, CONFIG.QUEUE_DELAY));

            tab.loaded = true;
            if (placeholder) placeholder.style.display = 'none';
          }
        }
        this.isProcessingQueue = false;
      },

      setActiveTab(id) {
        this.activeTabId = id;
        document.querySelectorAll('.tm-tab-item').forEach((el) => el.classList.remove('active'));
        document.querySelectorAll('.tm-tab-view-container').forEach((el) => (el.style.display = 'none'));

        const activeItem = document.getElementById(`item-${id}`);
        const activeContainer = document.getElementById(`container-${id}`);
        if (activeItem) activeItem.classList.add('active');
        if (activeContainer) activeContainer.style.display = 'block';
      },

      closeTab(id) {
        this.tabs = this.tabs.filter((t) => t.id !== id);
        document.getElementById(`item-${id}`)?.remove();
        document.getElementById(`container-${id}`)?.remove();

        if (this.activeTabId === id && this.tabs.length > 0) {
          this.setActiveTab(this.tabs[this.tabs.length - 1].id);
        } else if (this.tabs.length === 0) {
          document.getElementById('tm-placeholder').style.display = 'block';
        }
        this.saveState();
      },

      closeAll() {
        this.tabs = [];
        document.getElementById('tm-tab-bar').innerHTML = '';
        document.getElementById('tm-content-area').innerHTML =
          '<div id="tm-placeholder">Ningún contexto cargado. Usa los controles de la tabla de resultados.</div>';
        panel.style.display = 'none';
        this.saveState();
      },
    };

    // Escuchadores Drag & Drop Nativo Horizontal
    const tabBar = document.getElementById('tm-tab-bar');
    tabBar.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingEl = tabBar.querySelector('.tm-dragging');
      if (!draggingEl) return;
      const siblings = [...tabBar.querySelectorAll('.tm-tab-item:not(.tm-dragging)')];
      const nextSibling = siblings.find((sibling) => {
        const rect = sibling.getBoundingClientRect();
        return e.clientX <= rect.left + rect.width / 2;
      });
      tabBar.insertBefore(draggingEl, nextSibling);
    });

    tabBar.addEventListener('drop', (e) => {
      e.preventDefault();
      const domIds = [...tabBar.querySelectorAll('.tm-tab-item')].map((el) => el.id.replace('item-', ''));
      const reorderedTabs = [];
      domIds.forEach((id) => {
        const tabObj = window.customTabManager.tabs.find((t) => t.id === id);
        if (tabObj) reorderedTabs.push(tabObj);
      });
      window.customTabManager.tabs = reorderedTabs;
      window.customTabManager.saveState();
    });

    // =========================================================================
    // 4. ACCIONES DE LA TOOLBAR DEL POPUP (Mapeador de XML a CSV Descargable Nativo)
    // =========================================================================
    document.getElementById('tm-refresh-current').onclick = () => {
      const currentId = window.customTabManager.activeTabId;
      if (!currentId) return;

      const tab = window.customTabManager.tabs.find((t) => t.id === currentId);
      const frame = document.getElementById(`frame-${currentId}`);
      const placeholder = document.getElementById(`placeholder-${currentId}`);

      if (tab && frame) {
        if (placeholder) {
          placeholder.style.display = 'flex';
          placeholder.innerHTML = `<div style="font-size: 16px;">🔄</div><div>Recargando datos...</div>`;
        }
        frame.src = tab.url;
        setTimeout(() => {
          if (placeholder) placeholder.style.display = 'none';
        }, 400);
      }
    };

    // MEJORA: Descargador asíncrono secuencial con mapeo XML a Blob para forzar ventana de Windows
    document.getElementById('tm-download-csv-all').onclick = async () => {
      if (window.customTabManager.tabs.length === 0) {
        alert('No hay contextos cargados en el visor para procesar descargas.');
        return;
      }

      const downloadBtn = document.getElementById('tm-download-csv-all');
      const originalText = downloadBtn.innerText;
      downloadBtn.disabled = true;
      downloadBtn.innerText = '⏳ Descargando...';

      // Recorrer las pestañas secuencialmente con un bucle asíncrono puro para respetar el IIS de Abanca
      for (let i = 0; i < window.customTabManager.tabs.length; i++) {
        const tab = window.customTabManager.tabs[i];
        let itId = null;
        try {
          const urlObj = new URL(tab.url);
          itId = urlObj.searchParams.get('It') || urlObj.searchParams.get('it');
        } catch (e) {}

        if (!itId) {
          const match = tab.url.match(/[Ii]t=(\d+)/);
          if (match) itId = match[1];
        }

        if (itId) {
          try {
            const serviceType = tab.type || 'CX';
            const csvUrl = `http://exaplicaciones/RPOS401/DataService${serviceType}.asmx/GenerarCSV?codigoItem=${itId}`;

            // Hacer la petición asíncrona en segundo plano
            const response = await fetch(csvUrl);
            const xmlText = await response.text();

            // Parsear el árbol XML de respuesta
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const csvContent = xmlDoc.getElementsByTagName('string')[0]?.textContent || '';

            if (csvContent.trim()) {
              // Crear un Blob de texto plano con juego de caracteres UTF-8
              const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${tab.title}.csv`; // Asignar el nombre exacto de la pestaña
              link.style.display = 'none';

              document.body.appendChild(link);
              link.click(); // Disparar diálogo nativo de Windows (Guardar como / Sobrescribir)

              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }
          } catch (err) {
            console.error(`Error procesando descarga binaria para ${tab.title}:`, err);
          }

          // Pequeña tregua de 300ms entre descargas para no encabalgar peticiones en el pool
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      downloadBtn.disabled = false;
      downloadBtn.innerText = originalText;
    };

    document.getElementById('tm-close').onclick = () => (panel.style.display = 'none');
    document.getElementById('tm-close-all').onclick = () => window.customTabManager.closeAll();
    document.getElementById('tm-tab-bar').addEventListener('click', (e) => {
      if (e.target.classList.contains('tm-tab-close')) {
        window.customTabManager.closeTab(e.target.getAttribute('data-id'));
      }
    });

    // =========================================================================
    // 5. ENRUTADOR DRAG & DROP Y ACCIÓN CLICK EN TEXTO "CONTROLES"
    // =========================================================================
    let isBtnDragging = false,
      btnDragHasMoved = false,
      btnOffsetX,
      btnOffsetY;
    let isPanelDragging = false,
      panelOffsetX,
      panelOffsetY;

    floatBtn.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('tm-floating-subbtn')) return;
      isBtnDragging = true;
      btnDragHasMoved = false;
      const rect = floatBtn.getBoundingClientRect();
      btnOffsetX = e.clientX - rect.left;
      btnOffsetY = e.clientY - rect.top;
      floatBtn.style.bottom = 'auto';
      floatBtn.style.right = 'auto';
      floatBtn.style.left = rect.left + 'px';
      floatBtn.style.top = rect.top + 'px';
    });

    document.getElementById('tm-header').addEventListener('mousedown', (e) => {
      if (e.target.id === 'tm-close' || e.target.id === 'tm-close-all' || e.target.classList.contains('tm-panel-btn')) return;
      isPanelDragging = true;
      const rect = panel.getBoundingClientRect();
      panelOffsetX = e.clientX - rect.left;
      panelOffsetY = e.clientY - rect.top;
      panel.style.right = 'auto';
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
    });

    document.addEventListener('mousemove', (e) => {
      if (isBtnDragging) {
        btnDragHasMoved = true;
        let newX = Math.max(0, Math.min(e.clientX - btnOffsetX, window.innerWidth - floatBtn.offsetWidth));
        let newY = Math.max(0, Math.min(e.clientY - btnOffsetY, window.innerHeight - floatBtn.offsetHeight));
        floatBtn.style.left = newX + 'px';
        floatBtn.style.top = newY + 'px';
      }
      if (isPanelDragging) {
        let newX = Math.max(0, Math.min(e.clientX - panelOffsetX, window.innerWidth - panel.offsetWidth));
        let newY = Math.max(0, Math.min(e.clientY - panelOffsetY, window.innerHeight - panel.offsetHeight));
        panel.style.left = newX + 'px';
        panel.style.top = newY + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      if (isBtnDragging) {
        isBtnDragging = false;
        if (btnDragHasMoved) {
          localStorage.setItem(CONFIG.BTN_POS_KEY, JSON.stringify({left: floatBtn.style.left, top: floatBtn.style.top}));
        }
      }
      if (isPanelDragging) {
        isPanelDragging = false;
        localStorage.setItem(CONFIG.PANEL_POS_KEY, JSON.stringify({left: panel.style.left, top: panel.style.top}));
      }
    });

    floatBtn.addEventListener('click', (e) => {
      if (btnDragHasMoved) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.target.id === 'tm-floating-btn' || e.target.classList.contains('tm-btn-text')) {
        const isOpening = panel.style.display !== 'flex';
        panel.style.display = isOpening ? 'flex' : 'none';

        if (isOpening && window.customTabManager.tabs.length > 0) {
          document.getElementById('tm-placeholder').style.display = 'none';
        }
      }
    });

    document.getElementById('tm-btn-inject').addEventListener('click', (e) => {
      if (btnDragHasMoved) return;
      e.stopPropagation();
      ejecutarInyeccionTransversal();
    });

    document.getElementById('tm-btn-remove').addEventListener('click', (e) => {
      if (btnDragHasMoved) return;
      e.stopPropagation();
      ejecutarEliminacionTransversal();
    });

    // Restauración persistente de geometrías e historial tras F5
    (function restaurarEstadoLocal() {
      const posBtn = localStorage.getItem(CONFIG.BTN_POS_KEY);
      if (posBtn) {
        const p = JSON.parse(posBtn);
        floatBtn.style.left = p.left;
        floatBtn.style.top = p.top;
      } else {
        floatBtn.style.bottom = '30px';
        floatBtn.style.right = '30px';
      }
      const posPanel = localStorage.getItem(CONFIG.PANEL_POS_KEY);
      if (posPanel) {
        const p = JSON.parse(posPanel);
        panel.style.left = p.left;
        panel.style.top = p.top;
      }

      const storedTabs = localStorage.getItem(CONFIG.TABS_STATE_KEY);
      if (storedTabs) {
        try {
          const savedList = JSON.parse(storedTabs);
          if (Array.isArray(savedList) && savedList.length > 0) {
            savedList.forEach((t) => window.customTabManager.addTab(t.title, t.url, t.type || 'CX', false, false));
            window.customTabManager.procesarColaDeCarga();
          }
        } catch (err) {
          console.error('Error reconstruyendo árbol:', err);
        }
      }
    })();
  }

  // =========================================================================
  // 6. MOTOR DE INYECCIÓN DE CONTROLES EXCLUSIVO (CON COMPROBACIÓN DE REGLA)
  // =========================================================================
  function ejecutarInyeccionTransversal() {
    let inyectadosCount = 0;

    const frmAbajo = document.getElementById('ctl00_contentabajo_frmabajo') || document.getElementsByName('frmabajo')[0];
    if (!frmAbajo) return;

    try {
      const docAnidado = frmAbajo.contentDocument || frmAbajo.contentWindow.document;
      escanearArbolDocumentos(docAnidado);
    } catch (e) {}

    function escanearArbolDocumentos(doc) {
      if (!doc) return;

      const checkboxes = doc.querySelectorAll('input[id*="chkboxUno"], input[name*="chkboxUno"]');

      checkboxes.forEach((chk) => {
        if (chk.hasAttribute('data-tm-controlled')) return;
        chk.setAttribute('data-tm-controlled', 'true');

        const row = chk.closest(CONFIG.ROW_SELECTOR);
        if (!row) return;

        const linkAsociado = row.querySelector('a[href*="It="], a[href*="it="]');
        if (!linkAsociado) return;

        let itId = null;
        try {
          const urlObj = new URL(linkAsociado.href);
          itId = urlObj.searchParams.get('It') || urlObj.searchParams.get('it');
        } catch (e) {}

        if (!itId) {
          const match = decodeURIComponent(linkAsociado.href).match(/[Ii]t=(\d+)/);
          if (match) itId = match[1];
        }

        if (!itId) return;

        let contextName = 'Contexto';
        for (let cell of row.cells) {
          let txt = cell.innerText.trim();
          if (txt && txt !== 'Consultar' && txt !== 'Modificar' && !cell.querySelector('input')) {
            contextName = txt.split('\n')[0].substring(0, 14);
            break;
          }
        }

        let pageType = 'CX';
        if (contextName && contextName.length >= 5) {
          const quintoCaracter = contextName.charAt(4);
          if (quintoCaracter === '_') {
            pageType = 'CO';
          } else if (quintoCaracter.toUpperCase() === 'N') {
            pageType = 'CX';
          }
        }

        const urlCamposFinal = `http://exaplicaciones/RPOS401/RPOS401M_Campos${pageType}.aspx?It=${itId}`;

        const parentTd = chk.parentElement;
        const wrapper = doc.createElement('span');
        wrapper.className = 'tm-ctx-wrapper';
        wrapper.style.cssText = 'display: inline-flex; align-items: center; gap: 3px; margin-right: 6px; vertical-align: middle;';

        const btnIn = doc.createElement('button');
        btnIn.type = 'button';
        btnIn.title = `Abrir campos de ${contextName} en pestaña interna`;
        btnIn.innerHTML = '🗔';
        btnIn.style.cssText =
          'background: #eef7f7; border: 1px solid #b2d3d4; color: #276466; padding: 2px 5px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; transition: all 0.15s;';
        btnIn.onmouseover = () => {
          btnIn.style.background = '#276466';
          btnIn.style.color = '#ffffff';
        };
        btnIn.onmouseout = () => {
          btnIn.style.background = '#eef7f7';
          btnIn.style.color = '#276466';
        };
        btnIn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.top.customTabManager.addTab(contextName, urlCamposFinal, pageType);
        };

        const btnEx = doc.createElement('button');
        btnEx.type = 'button';
        btnEx.title = `Abrir campos de ${contextName} en nueva pestaña del navegador`;
        btnEx.innerHTML = '↗';
        btnEx.style.cssText =
          'background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 2px 5px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; transition: all 0.15s;';
        btnEx.onmouseover = () => {
          btnEx.style.background = '#475569';
          btnEx.style.color = '#ffffff';
        };
        btnEx.onmouseout = () => {
          btnEx.style.background = '#f1f5f9';
          btnEx.style.color = '#475569';
        };
        btnEx.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(urlCamposFinal, '_blank');
        };

        wrapper.appendChild(btnIn);
        wrapper.appendChild(btnEx);
        parentTd.insertBefore(wrapper, chk);
        inyectadosCount++;
      });

      doc.querySelectorAll('iframe, frameset, frame').forEach((iframe) => {
        try {
          if (iframe.closest && iframe.closest('#tm-panel')) return;
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
          escanearArbolDocumentos(innerDoc);
        } catch (err) {}
      });
    }
  }

  function ejecutarEliminacionTransversal() {
    let eliminadosCount = 0;
    const frmAbajo = document.getElementById('ctl00_contentabajo_frmabajo') || document.getElementsByName('frmabajo')[0];
    if (!frmAbajo) return;

    try {
      const docAnidado = frmAbajo.contentDocument || frmAbajo.contentWindow.document;
      limpiarArbolDocumentos(docAnidado);
    } catch (e) {}

    function limpiarArbolDocumentos(doc) {
      if (!doc) return;
      const wrappers = doc.querySelectorAll('.tm-ctx-wrapper');
      wrappers.forEach((w) => {
        w.remove();
        eliminadosCount++;
      });

      const checkboxes = doc.querySelectorAll('input[data-tm-controlled]');
      checkboxes.forEach((chk) => chk.removeAttribute('data-tm-controlled'));

      doc.querySelectorAll('iframe, frameset, frame').forEach((iframe) => {
        try {
          if (iframe.closest && iframe.closest('#tm-panel')) return;
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
          limpiarArbolDocumentos(innerDoc);
        } catch (err) {}
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarScript);
  } else {
    inicializarScript();
  }
})();
