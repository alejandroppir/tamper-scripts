// ==UserScript==
// @name         Abanca Repositorio - CGDN Tools Suite
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      3.5.0
// @description  Suite unificada CGDN Tools: Gestor de Contextos, Creador Masivo y Refrescador Multi-Nodo Metrópolis (CGT/PGT).
// @match        http://exaplicaciones/rpos015/*
// @match        http://ecaplicaciones/rpos015/*
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // Solo ejecutar la UI principal en el frame superior para evitar botones flotantes duplicados
  if (window.top !== window.self) return;

  // =========================================================================
  // CONFIGURACIÓN GLOBAL DE LA SUITE
  // =========================================================================
  const CONFIG = {
    COLOR_PRIMARIO: '#276466',
    COLOR_SECUNDARIO: '#1e4f51',
    MAIN_BTN_POS_KEY: 'tm_cgdn_tools_main_btn_pos',
    CTX_PANEL_POS_KEY: 'tm_ctx_panel_position',
    PARAM_PANEL_POS_KEY: 'tm_param_panel_pos',
    TABS_STATE_KEY: 'tm_ctx_tabs_persistent_state',
    QUEUE_DELAY: 1000,
    DELAY_ENTRE_PETICIONES: 1000,
    DELAY_PASOS: 300,
    METROPOLIS_PORT: '9080',
    SERVIDORES_CGT: [
      'CGTJBOSSBATXS01',
      'CGTJBOSSXXXXS01',
      'CGTJBOSSXXXXS02',
      'CGTJBOSSXXXXS03',
      'CGTJBOSSXXXXS04',
      'CGTJBOSSXXXXS05',
      'CGTJBOSSXXXXS06',
    ],
    SERVIDORES_PGT: ['PGTJBOSSBATXS01', 'PGTJBOSSBATXS02', 'PGTJBOSSXXXXS01', 'PGTJBOSSXXXXS02', 'PGTJBOSSXXXXS03'],
  };

  // SVG Icons
  const SVG_TOOLKIT = {
    TOOLS: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    PLUS: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    TRASH: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    PANEL: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
    PARAM: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  };

  // =========================================================================
  // GESTOR UI UNIVERSAL (Física y Persistencia de Arrastre)
  // =========================================================================
  const GestorUI = {
    configurarArrastre: function (elemento, zonaArrastre, claveStorage, esBoton = false, posDefecto = {bottom: '20px', right: '20px'}) {
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
  // MÓDULO 1: GESTOR DE CONTEXTOS (Visor Multitarea & Inyección)
  // =========================================================================
  function initContextsModule() {
    if (window.top.document.getElementById('tm-ctx-panel')) return;

    const panel = window.top.document.createElement('div');
    panel.id = 'tm-ctx-panel';
    panel.innerHTML = `
      <div id="tm-ctx-header">
        <div class="tm-header-title">${SVG_TOOLKIT.PANEL} Visor de Campos Multitarea</div>
        <div class="tm-header-actions">
          <button type="button" id="tm-refresh-current" class="tm-panel-btn" title="Recargar pestaña activa">🔄 Recargar</button>
          <button type="button" id="tm-download-csv-all" class="tm-panel-btn" title="Descargar CSVs">📥 Descargar CSVs</button>
          <button type="button" id="tm-close-all" class="tm-panel-btn">Cerrar Todo</button>
          <span id="tm-ctx-close" title="Cerrar Panel" class="no-drag">✕</span>
        </div>
      </div>
      <div id="tm-tab-bar"></div>
      <div id="tm-content-area">
        <div id="tm-ctx-placeholder">Ningún contexto cargado. Usa los controles de la tabla de resultados.</div>
      </div>
    `;
    window.top.document.body.appendChild(panel);

    GestorUI.configurarArrastre(panel, window.top.document.getElementById('tm-ctx-header'), CONFIG.CTX_PANEL_POS_KEY, false, {
      top: '40px',
      right: '40px',
    });

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
          window.top.document.getElementById('tm-ctx-placeholder').style.display = 'none';
        }

        const existing = this.tabs.find((t) => t.url === url);
        if (existing) {
          if (openPanel) this.setActiveTab(existing.id);
          return;
        }

        const id = 'tab-' + Date.now() + Math.random().toString(36).substr(2, 5);
        this.tabs.push({id, title, url, type, loaded: false});

        const tabBar = window.top.document.getElementById('tm-tab-bar');
        const tabItem = window.top.document.createElement('div');
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

        const contentArea = window.top.document.getElementById('tm-content-area');
        const container = window.top.document.createElement('div');
        container.id = `container-${id}`;
        container.className = 'tm-tab-view-container';
        container.innerHTML = `
          <div id="placeholder-${id}" class="tm-tab-placeholder">
            <div style="font-size: 16px;">⏳</div>
            <div>En cola de espera...</div>
          </div>
          <iframe id="frame-${id}" class="tm-iframe-view" src="about:blank"></iframe>
        `;
        contentArea.appendChild(container);

        if (openPanel || !this.activeTabId) this.setActiveTab(id);
        if (autoSave) this.saveState();
      },

      async procesarColaDeCarga() {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;

        for (let i = 0; i < this.tabs.length; i++) {
          let tab = this.tabs[i];
          if (tab.loaded) continue;

          const iframe = window.top.document.getElementById(`frame-${tab.id}`);
          const placeholder = window.top.document.getElementById(`placeholder-${tab.id}`);
          if (iframe) {
            if (placeholder) placeholder.innerHTML = `<div style="font-size: 16px;">🔄</div><div>Consultando datos...</div>`;
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
        window.top.document.querySelectorAll('.tm-tab-item').forEach((el) => el.classList.remove('active'));
        window.top.document.querySelectorAll('.tm-tab-view-container').forEach((el) => (el.style.display = 'none'));

        const activeItem = window.top.document.getElementById(`item-${id}`);
        const activeContainer = window.top.document.getElementById(`container-${id}`);
        if (activeItem) activeItem.classList.add('active');
        if (activeContainer) activeContainer.style.display = 'block';
      },

      closeTab(id) {
        this.tabs = this.tabs.filter((t) => t.id !== id);
        window.top.document.getElementById(`item-${id}`)?.remove();
        window.top.document.getElementById(`container-${id}`)?.remove();

        if (this.activeTabId === id && this.tabs.length > 0) {
          this.setActiveTab(this.tabs[this.tabs.length - 1].id);
        } else if (this.tabs.length === 0) {
          window.top.document.getElementById('tm-ctx-placeholder').style.display = 'block';
        }
        this.saveState();
      },

      closeAll() {
        this.tabs = [];
        window.top.document.getElementById('tm-tab-bar').innerHTML = '';
        window.top.document.getElementById('tm-content-area').innerHTML =
          '<div id="tm-ctx-placeholder">Ningún contexto cargado. Usa los controles de la tabla de resultados.</div>';
        panel.style.display = 'none';
        this.saveState();
      },
    };

    window.top.document.getElementById('tm-ctx-close').onclick = () => (panel.style.display = 'none');
    window.top.document.getElementById('tm-close-all').onclick = () => window.customTabManager.closeAll();
    window.top.document.getElementById('tm-refresh-current').onclick = () => {
      const currentId = window.customTabManager.activeTabId;
      if (!currentId) return;
      const tab = window.customTabManager.tabs.find((t) => t.id === currentId);
      const frame = window.top.document.getElementById(`frame-${currentId}`);
      if (tab && frame) frame.src = tab.url;
    };

    window.top.document.getElementById('tm-download-csv-all').onclick = async () => {
      if (window.customTabManager.tabs.length === 0) return alert('No hay contextos cargados.');
      for (let tab of window.customTabManager.tabs) {
        let match = tab.url.match(/[Ii]t=(\d+)/);
        if (match) {
          try {
            const csvUrl = `http://exaplicaciones/RPOS401/DataService${tab.type || 'CX'}.asmx/GenerarCSV?codigoItem=${match[1]}`;
            const res = await fetch(csvUrl);
            const xmlText = await res.text();
            const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
            const csvContent = xmlDoc.getElementsByTagName('string')[0]?.textContent || '';
            if (csvContent.trim()) {
              const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${tab.title}.csv`;
              link.click();
              URL.revokeObjectURL(link.href);
            }
          } catch (e) {}
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    };

    window.top.document.getElementById('tm-tab-bar').addEventListener('click', (e) => {
      if (e.target.classList.contains('tm-tab-close')) window.customTabManager.closeTab(e.target.getAttribute('data-id'));
    });

    const storedTabs = localStorage.getItem(CONFIG.TABS_STATE_KEY);
    if (storedTabs) {
      try {
        const savedList = JSON.parse(storedTabs);
        if (Array.isArray(savedList) && savedList.length > 0) {
          savedList.forEach((t) => window.customTabManager.addTab(t.title, t.url, t.type || 'CX', false, false));
          window.customTabManager.procesarColaDeCarga();
        }
      } catch (e) {}
    }
  }

  function ejecutarInyeccionContextos() {
    function escanearDoc(doc) {
      if (!doc) return;
      try {
        const checkboxes = doc.querySelectorAll('input[id*="chkboxUno"], input[name*="chkboxUno"]');

        checkboxes.forEach((chk) => {
          if (chk.hasAttribute('data-tm-controlled')) return;
          chk.setAttribute('data-tm-controlled', 'true');

          const row = chk.closest('tr');
          if (!row) return;

          const linkAsociado = row.querySelector('a[href*="It="], a[href*="it="]');
          if (!linkAsociado) return;

          let match = decodeURIComponent(linkAsociado.href).match(/[Ii]t=(\d+)/);
          if (!match) return;
          let itId = match[1];

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
            const c5 = contextName.charAt(4);
            if (c5 === '_') pageType = 'CO';
            else if (c5.toUpperCase() === 'N') pageType = 'CX';
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
            'background: #eef7f7; border: 1px solid #b2d3d4; color: #276466; padding: 2px 5px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;';
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
            'background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 2px 5px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;';
          btnEx.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(urlCamposFinal, '_blank');
          };

          wrapper.appendChild(btnIn);
          wrapper.appendChild(btnEx);
          parentTd.insertBefore(wrapper, chk);
        });
      } catch (e) {}

      doc.querySelectorAll('iframe, frame').forEach((f) => {
        try {
          if (f.closest && f.closest('#tm-ctx-panel')) return;
          escanearDoc(f.contentDocument || f.contentWindow.document);
        } catch (e) {}
      });
    }

    escanearDoc(document);
  }

  function ejecutarEliminacionContextos() {
    function limpiarDoc(doc) {
      if (!doc) return;
      try {
        doc.querySelectorAll('.tm-ctx-wrapper').forEach((w) => w.remove());
        doc.querySelectorAll('input[data-tm-controlled]').forEach((chk) => chk.removeAttribute('data-tm-controlled'));
      } catch (e) {}

      doc.querySelectorAll('iframe, frame').forEach((iframe) => {
        try {
          limpiarDoc(iframe.contentDocument || iframe.contentWindow.document);
        } catch (e) {}
      });
    }
    limpiarDoc(document);
  }

  // =========================================================================
  // MÓDULO 2: CREADOR MASIVO DE PARÁMETROS
  // =========================================================================
  let diccGrupos = {};
  let paramStateData = [];

  function initParamCreatorModule() {
    if (window.top.document.getElementById('tm-param-panel')) return;

    const panel = window.top.document.createElement('div');
    panel.id = 'tm-param-panel';
    panel.innerHTML = `
      <div id="tm-param-header">
        <div style="display:flex; align-items:center; gap:8px; pointer-events:none;">${SVG_TOOLKIT.PARAM} Creador Masivo de Parámetros</div>
        <span id="tm-param-close" class="no-drag" style="font-size: 16px;">✖</span>
      </div>
      <div id="tm-param-body">
        <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <span style="font-size: 12px; color: #475569;"><b>1.</b> Escanea el árbol para mapear nombres de grupos con IDs internos.</span>
          <button type="button" id="tm-scan-btn" class="tm-btn no-drag">🔎 Escanear Grupos</button>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <label style="font-size: 11px; font-weight: bold; color: #475569;">2. Pega CSV (Grupo;Proyecto;Parametro;Descripcion;Analista;Motivo)</label>
            <label style="font-size: 11px; cursor: pointer; color: #0369a1; font-weight: bold;">
              <input type="checkbox" id="tm-debug-mode" class="no-drag"> 🐛 Ver Iframe de Trabajo (Debug)
            </label>
          </div>
          <textarea id="tm-csv-input" class="tm-textarea no-drag" placeholder="Ej: BGURCFG_ACTIVACIONES_PRUEBAS;67582;NUEVO_PARAM;Desc;V366723;Motivo"></textarea>
        </div>
        <div class="tm-actions-bar">
          <button type="button" id="tm-load-btn" class="tm-btn no-drag">Cargar CSV</button>
          <button type="button" id="tm-clear-btn" class="tm-btn tm-btn-secondary no-drag">Limpiar</button>
          <div style="flex-grow: 1;"></div>
          <button type="button" id="tm-process-all-btn" class="tm-btn tm-btn-action no-drag" disabled>🚀 Iniciar Creación Masiva</button>
        </div>
        <div class="tm-table-container">
          <table class="tm-table">
            <thead>
              <tr>
                <th style="width:15%">Grupo</th>
                <th style="width:10%">Proyecto</th>
                <th style="width:25%">Parámetro</th>
                <th style="width:15%">Estado</th>
                <th style="width:35%">Info / Error</th>
              </tr>
            </thead>
            <tbody id="tm-param-table-body">
              <tr><td colspan="5" style="text-align:center; padding: 20px; color:#94a3b8;">Sin datos. Carga un CSV.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    window.top.document.body.appendChild(panel);

    GestorUI.configurarArrastre(panel, window.top.document.getElementById('tm-param-header'), CONFIG.PARAM_PANEL_POS_KEY, false, {
      top: '50px',
      right: '50px',
    });

    window.top.document.getElementById('tm-param-close').onclick = () => (panel.style.display = 'none');
    window.top.document.getElementById('tm-clear-btn').onclick = () => {
      paramStateData = [];
      renderParamTable();
    };

    window.top.document.getElementById('tm-scan-btn').onclick = () => {
      let countNuevos = 0;
      function buscarEnDoc(doc) {
        try {
          doc.querySelectorAll('a').forEach((a) => {
            const href = a.getAttribute('href');
            if (href && (href.includes('TI=GRUPO_CONF') || href.includes('TI=AREA'))) {
              const matchIt = href.match(/[Ii][tp]=(\d+)/);
              const matchNi = href.match(/NI=([^&]+)/);
              if (matchIt) {
                const id = matchIt[1];
                const nombre = matchNi ? decodeURIComponent(matchNi[1]).trim() : a.innerText.trim();
                if (nombre && !diccGrupos[nombre]) {
                  diccGrupos[nombre] = id;
                  countNuevos++;
                }
              }
            }
          });
          doc.querySelectorAll('iframe, frame').forEach((f) => {
            try {
              buscarEnDoc(f.contentDocument || f.contentWindow.document);
            } catch (e) {}
          });
        } catch (e) {}
      }
      buscarEnDoc(window.top.document);
      alert(`Escaneo completado.\nNuevos grupos encontrados: ${countNuevos}.\nTotal en memoria: ${Object.keys(diccGrupos).length}.`);
    };

    window.top.document.getElementById('tm-load-btn').onclick = () => {
      const csvText = window.top.document.getElementById('tm-csv-input').value.trim();
      if (!csvText) return;

      csvText.split('\n').forEach((linea) => {
        const cols = linea.split(';');
        if (cols.length >= 6) {
          const grupoRaw = cols[0].trim();
          const isNumeric = /^\d+$/.test(grupoRaw);
          const idGrupoEncontrado = isNumeric ? grupoRaw : diccGrupos[grupoRaw];

          paramStateData.push({
            grupoNom: grupoRaw,
            idGrupo: idGrupoEncontrado,
            proyecto: cols[1].trim(),
            nombreParam: cols[2].trim(),
            desc: cols[3].trim(),
            analista: cols[4].trim(),
            motivo: cols[5].trim(),
            status: idGrupoEncontrado ? 'pending' : 'error',
            info: idGrupoEncontrado ? '-' : 'Grupo no encontrado. Escanea el árbol.',
          });
        }
      });
      window.top.document.getElementById('tm-csv-input').value = '';
      renderParamTable();
    };

    window.top.document.getElementById('tm-process-all-btn').onclick = async () => {
      const btnProcesar = window.top.document.getElementById('tm-process-all-btn');
      btnProcesar.disabled = true;
      btnProcesar.innerText = '⏳ Procesando...';

      for (let i = 0; i < paramStateData.length; i++) {
        if (paramStateData[i].status === 'pending') {
          await ejecutarAltaParametro(i);
          await new Promise((r) => setTimeout(r, CONFIG.DELAY_ENTRE_PETICIONES));
        }
      }

      btnProcesar.disabled = false;
      btnProcesar.innerText = '🚀 Iniciar Creación Masiva';
    };
  }

  function renderParamTable() {
    const tbody = window.top.document.getElementById('tm-param-table-body');
    const btnProcesar = window.top.document.getElementById('tm-process-all-btn');

    if (!tbody) return;

    if (paramStateData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#94a3b8;">Sin datos. Carga un CSV.</td></tr>';
      if (btnProcesar) btnProcesar.disabled = true;
      return;
    }

    let html = '';
    let hayPendientes = false;

    paramStateData.forEach((row) => {
      let badge = '';
      if (row.status === 'pending') {
        badge = '<span class="tm-badge tm-bg-pending">Pendiente</span>';
        hayPendientes = true;
      } else if (row.status === 'loading') badge = '<span class="tm-badge tm-bg-loading">Ejecutando</span>';
      else if (row.status === 'ok') badge = '<span class="tm-badge tm-bg-ok">OK</span>';
      else if (row.status === 'error') badge = '<span class="tm-badge tm-bg-error">Error</span>';

      html += `<tr>
        <td title="${row.grupoNom}">${row.grupoNom}</td>
        <td title="${row.proyecto}">${row.proyecto}</td>
        <td title="${row.nombreParam}"><b>${row.nombreParam}</b></td>
        <td>${badge}</td>
        <td title="${row.info}" style="color: ${row.status === 'error' ? '#991b1b' : '#475569'}; font-weight: ${row.status === 'error' ? 'bold' : 'normal'}">${row.info}</td>
      </tr>`;
    });

    tbody.innerHTML = html;
    if (btnProcesar) btnProcesar.disabled = !hayPendientes;
  }

  function getWorkerIframe() {
    let oldIframe = window.top.document.getElementById('tm-param-worker');
    if (oldIframe) oldIframe.remove();

    const workerIframe = window.top.document.createElement('iframe');
    workerIframe.id = 'tm-param-worker';
    workerIframe.name = 'tm-param-worker';
    workerIframe.sandbox = 'allow-scripts allow-forms allow-same-origin';

    const isDebug = window.top.document.getElementById('tm-debug-mode') && window.top.document.getElementById('tm-debug-mode').checked;
    if (isDebug) {
      workerIframe.style.cssText =
        'display:block; position:fixed; bottom:10px; left:10px; width:750px; height:500px; z-index:9999999; border:4px solid #0369a1; background:#fff;';
    } else {
      workerIframe.style.display = 'none';
    }

    window.top.document.body.appendChild(workerIframe);
    return workerIframe;
  }

  async function ejecutarAltaParametro(index) {
    const row = paramStateData[index];
    row.status = 'loading';
    renderParamTable();

    return new Promise((resolve) => {
      const iframe = getWorkerIframe();
      let etapa = 0;
      let baseUrl = window.location.origin;

      const elementosUrl = `${baseUrl}/RPOS015/RPOS015M_Elementos.aspx?TI=PARAMETRO_CONF&Ip=${row.idGrupo}&Rl=249&_t=${Date.now()}`;
      iframe.src = elementosUrl;

      let timerSeguridad = setTimeout(() => {
        clearInterval(intervalo);
        row.status = 'error';
        row.info = 'Timeout excedido (45s).';
        renderParamTable();
        resolve();
      }, 45000);

      let intervalo = setInterval(() => {
        try {
          const win = iframe.contentWindow;
          const doc = iframe.contentDocument || win.document;

          if (!doc || doc.URL.includes('about:blank')) return;

          const divRes = doc.getElementById('dvAccionesResultado');
          if (divRes && etapa >= 2) {
            clearTimeout(timerSeguridad);
            clearInterval(intervalo);

            const textoRes = divRes.innerText || '';
            if (textoRes.includes('éxito') || textoRes.includes('creado') || textoRes.includes('ADVERTENCIA')) {
              row.status = 'ok';
              row.info = 'Parámetro creado exitosamente.';
            } else {
              row.status = 'error';
              let errorCorto = textoRes.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
              row.info = errorCorto.length > 70 ? errorCorto.substring(0, 70) + '...' : errorCorto;
            }

            renderParamTable();
            return resolve();
          }

          if (doc.readyState !== 'complete') return;

          if (etapa === 0) {
            const vsInput = doc.getElementById('__VIEWSTATE');
            const vsgInput = doc.getElementById('__VIEWSTATEGENERATOR');
            if (!vsInput || !vsgInput) return;

            row.info = '1/4: Extrayendo VIEWSTATE...';
            renderParamTable();

            const form = doc.createElement('form');
            form.method = 'POST';
            form.action = 'RPOS015M_FormularioAccion.aspx';

            const inputs = {
              __VIEWSTATE: vsInput.value,
              __VIEWSTATEGENERATOR: vsgInput.value,
              __VIEWSTATEENCRYPTED: '',
              sUrl: `?Ac=A - Alta de Item (Programador)&NombreAccion=ALTA_SUBC_PC&TI=PARAMETRO_CONF&Ip=${row.idGrupo}&Rl=249`,
              sPagina: 'RPOS015M_FormularioAccion.aspx',
            };

            for (const key in inputs) {
              const hidden = doc.createElement('input');
              hidden.type = 'hidden';
              hidden.name = key;
              hidden.value = inputs[key];
              form.appendChild(hidden);
            }

            doc.__tm_old = true;
            etapa = 1;
            doc.__tm_timer = Date.now();
            doc.body.appendChild(form);
            form.submit();
          } else if (etapa === 1) {
            if (doc.__tm_old) return;
            const selProyecto = doc.getElementById('RPOS015M_CUListaProyectos1_ddProyectos');
            const btnAceptar = doc.getElementById('btnAceptar');
            if (!selProyecto || !btnAceptar) return;

            row.info = '2/4: Asignando Proyecto...';
            renderParamTable();

            const opciones = Array.from(selProyecto.options);
            const optValida = opciones.find((o) => o.value === row.proyecto || o.text.includes(row.proyecto));

            if (optValida) {
              optValida.selected = true;
              selProyecto.value = optValida.value;
              if (win.jQuery) win.jQuery(selProyecto).trigger('change');
              else selProyecto.dispatchEvent(new Event('change', {bubbles: true}));
            } else {
              clearTimeout(timerSeguridad);
              clearInterval(intervalo);
              row.status = 'error';
              row.info = `El proyecto '${row.proyecto}' no existe.`;
              renderParamTable();
              return resolve();
            }

            doc.__tm_timer = Date.now();
            etapa = 2;
          } else if (etapa === 2) {
            if (Date.now() - doc.__tm_timer < CONFIG.DELAY_PASOS) return;

            row.info = '3/4: Rellenando campos de texto...';
            renderParamTable();

            const setValor = (id, valor) => {
              const elem = doc.getElementById(id);
              if (elem) {
                elem.value = valor;
                elem.dispatchEvent(new Event('input', {bubbles: true}));
                elem.dispatchEvent(new Event('change', {bubbles: true}));
              }
            };

            setValor('NombreItem ALTA_SUBC_PC', row.nombreParam);
            setValor('Descripcion ALTA_SUBC_PC', row.desc);
            setValor('Analista ALTA_SUBC_PC', row.analista);
            setValor('Motivo ALTA_SUBC_PC', row.motivo);

            doc.__tm_timer = Date.now();
            etapa = 3;
          } else if (etapa === 3) {
            if (Date.now() - doc.__tm_timer < CONFIG.DELAY_PASOS) return;

            row.info = '4/4: Confirmando alta...';
            renderParamTable();

            if (typeof win.btnAceptar_Click === 'function') win.btnAceptar_Click = () => true;
            if (typeof win.Page_ClientValidate === 'function') win.Page_ClientValidate = () => true;

            doc.__tm_old = true;
            etapa = 4;
            const btnAceptar = doc.getElementById('btnAceptar');
            if (btnAceptar) btnAceptar.click();
          }
        } catch (e) {}
      }, 500);
    });
  }

  // =========================================================================
  // MÓDULO 3: REFRESCADOR MULTI-NODO METRÓPOLIS (CGT / PGT)
  // =========================================================================
  function initMetropolisRefresherModule() {
    const topDoc = window.top.document;
    if (topDoc.getElementById('tm-refresh-modal')) return;

    const modal = topDoc.createElement('div');
    modal.id = 'tm-refresh-modal';
    modal.className = 'tm-modal-hidden';
    modal.innerHTML = `
      <div class="tm-modal-overlay"></div>
      <div class="tm-modal-card">
        <div class="tm-modal-header">
          <span class="tm-modal-title">🔄 Refrescar Parámetro en Nodos Metrópolis</span>
          <span id="tm-modal-close" class="tm-modal-close-btn">✖</span>
        </div>
        <div class="tm-modal-body">
          <div class="tm-param-summary">
            <div><strong>Aplicación:</strong> <span id="tm-summary-app">-</span></div>
            <div><strong>Grupo:</strong> <span id="tm-summary-grupo">-</span></div>
            <div><strong>Parámetro:</strong> <span id="tm-summary-param">-</span></div>
          </div>
          <div class="tm-toolbar-nodes">
            <span style="font-weight:700; font-size:12px; color:#475569;">Selección de Servidores JBoss:</span>
            <div>
              <button type="button" id="tm-btn-select-all" class="tm-node-subbtn">Todos</button>
              <button type="button" id="tm-btn-deselect-all" class="tm-node-subbtn">Ninguno</button>
            </div>
          </div>

          <div class="tm-nodes-container-scroll">
            <div class="tm-section-header">🇪🇸 España (CGT)</div>
            <div class="tm-nodes-checklist" id="tm-nodes-cgt"></div>
            <div class="tm-section-divider"></div>
            <div class="tm-section-header">🇵🇹 Portugal (PGT)</div>
            <div class="tm-nodes-checklist" id="tm-nodes-pgt"></div>
          </div>

          <div id="tm-modal-status-bar" class="tm-status-summary-bar tm-modal-hidden"></div>
        </div>
        <div class="tm-modal-footer">
          <button type="button" id="tm-btn-execute-reload" class="tm-btn-action-exec">🚀 Ejecutar Refresco</button>
        </div>
      </div>
    `;
    topDoc.body.appendChild(modal);

    topDoc.getElementById('tm-modal-close').onclick = cerrarModalRefresco;
    modal.querySelector('.tm-modal-overlay').onclick = cerrarModalRefresco;

    topDoc.getElementById('tm-btn-select-all').onclick = () => {
      topDoc.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]').forEach((chk) => (chk.checked = true));
    };
    topDoc.getElementById('tm-btn-deselect-all').onclick = () => {
      topDoc.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]').forEach((chk) => (chk.checked = false));
    };
  }

  function cerrarModalRefresco() {
    const modal = window.top.document.getElementById('tm-refresh-modal');
    if (modal) modal.classList.add('tm-modal-hidden');
  }

  function renderizarServidores(lista, containerId) {
    const container = window.top.document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    lista.forEach((servidor) => {
      const item = window.top.document.createElement('div');
      item.className = 'tm-node-item';
      item.innerHTML = `
        <label>
          <input type="checkbox" value="${servidor}" checked>
          <span>${servidor}</span>
        </label>
        <span class="tm-node-badge pending" id="tm-badge-${servidor}">⏳ En espera</span>
      `;
      container.appendChild(item);
    });
  }

  // RESOLUCIÓN INTELIGENTE DE NOMBRE COMPLETO
  function resolverPartesParametro(nombreRaw, doc) {
    let cleanText = nombreRaw.replace(/\s+/g, '');
    let partes = cleanText.split('_');

    if (partes.length >= 3) {
      return {
        aplicacion: partes[0].replace(/CFG$/i, ''),
        grupo: partes[1],
        parametro: partes.slice(2).join('_'),
        cleanText: cleanText,
      };
    }

    let grupoPadre = '';

    try {
      let searchParams = new URLSearchParams(window.location.search);
      let ni = searchParams.get('NI') || searchParams.get('ni');
      if (ni && ni.includes('_')) grupoPadre = ni;
    } catch (e) {}

    if (!grupoPadre && doc) {
      try {
        let searchParams = new URLSearchParams(doc.location.search);
        let ni = searchParams.get('NI') || searchParams.get('ni');
        if (ni && ni.includes('_')) grupoPadre = ni;
      } catch (e) {}
    }

    if (!grupoPadre && doc) {
      let elems = doc.querySelectorAll('.RPOS015_Elementos_Nombre, [id*="lblNombre"], [id*="LiteralNombre"], h1, h2, span');
      for (let el of elems) {
        let txt = el.innerText.trim();
        if (/^[A-Z0-9]+CFG_[A-Za-z0-9_]+$/i.test(txt)) {
          grupoPadre = txt;
          break;
        }
      }
    }

    if (grupoPadre) {
      let fullText = grupoPadre + '_' + cleanText;
      let fullPartes = fullText.split('_');
      if (fullPartes.length >= 3) {
        return {
          aplicacion: fullPartes[0].replace(/CFG$/i, ''),
          grupo: fullPartes[1],
          parametro: fullPartes.slice(2).join('_'),
          cleanText: fullText,
        };
      }
    }

    return null;
  }

  function procesarRefrescoParametro(nombreRaw, btnElemento, docOrigen) {
    const res = resolverPartesParametro(nombreRaw, docOrigen);

    if (!res) {
      const cleanText = nombreRaw.replace(/\s+/g, '');
      alert(
        `❌ Error de Formato:\n\nEl nombre del parámetro "${cleanText}" no contiene las 3 partes requeridas (Aplicación_Grupo_Parámetro) y no se pudo determinar el Grupo Padre automáticamente.\n\nOperación cancelada.`,
      );
      return;
    }

    initMetropolisRefresherModule();
    const topDoc = window.top.document;

    topDoc.getElementById('tm-summary-app').textContent = res.aplicacion;
    topDoc.getElementById('tm-summary-grupo').textContent = res.grupo;
    topDoc.getElementById('tm-summary-param').textContent = res.parametro;

    renderizarServidores(CONFIG.SERVIDORES_CGT, 'tm-nodes-cgt');
    renderizarServidores(CONFIG.SERVIDORES_PGT, 'tm-nodes-pgt');

    const statusBar = topDoc.getElementById('tm-modal-status-bar');
    statusBar.className = 'tm-status-summary-bar tm-modal-hidden';

    const btnExec = topDoc.getElementById('tm-btn-execute-reload');
    btnExec.disabled = false;
    btnExec.onclick = () => ejecutarRefrescoMultiNodo(res.aplicacion, res.grupo, res.parametro, btnElemento);

    topDoc.getElementById('tm-refresh-modal').classList.remove('tm-modal-hidden');
  }

  async function ejecutarRefrescoMultiNodo(aplicacion, grupo, parametro, btnTrigger) {
    const topDoc = window.top.document;
    const btnExec = topDoc.getElementById('tm-btn-execute-reload');
    btnExec.disabled = true;

    const checkboxes = Array.from(topDoc.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]:checked'));
    if (checkboxes.length === 0) {
      alert('Debes seleccionar al menos un servidor para ejecutar la recarga.');
      btnExec.disabled = false;
      return;
    }

    let okCount = 0;
    let errorCount = 0;

    topDoc.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]').forEach((chk) => (chk.disabled = true));

    for (const chk of checkboxes) {
      const servidor = chk.value;
      const badge = topDoc.getElementById(`tm-badge-${servidor}`);
      if (badge) {
        badge.className = 'tm-node-badge loading';
        badge.textContent = '🔄 Enviando...';
      }

      const reloadUrl = `http://${servidor}:${CONFIG.METROPOLIS_PORT}/administracion/ParametrosConfiguracionReload/op?aplicacion=${encodeURIComponent(aplicacion)}&grupo=${encodeURIComponent(grupo)}&parametro=${encodeURIComponent(parametro)}`;
      const exito = await enviarPeticionNodo(reloadUrl, servidor);

      if (exito) {
        okCount++;
        if (badge) {
          badge.className = 'tm-node-badge ok';
          badge.textContent = '✅ OK';
        }
      } else {
        errorCount++;
        if (badge) {
          badge.className = 'tm-node-badge error';
          badge.textContent = '❌ Error';
        }
      }
    }

    topDoc.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]').forEach((chk) => (chk.disabled = false));
    btnExec.disabled = false;

    const statusBar = topDoc.getElementById('tm-modal-status-bar');
    statusBar.classList.remove('tm-modal-hidden');

    if (errorCount === 0) {
      statusBar.className = 'tm-status-summary-bar success';
      statusBar.textContent = `🎉 ¡Refresco completado con éxito! Todos los ${okCount} servidores respondieron OK.`;
      if (btnTrigger) btnTrigger.innerText = '✅';
    } else {
      statusBar.className = 'tm-status-summary-bar partial';
      statusBar.textContent = `⚠️ Proceso finalizado: ${okCount} OK, ${errorCount} Errores. Revisa la lista.`;
      if (btnTrigger) btnTrigger.innerText = '⚠️';
    }

    setTimeout(() => {
      if (btnTrigger) btnTrigger.innerText = '🔄';
    }, 3000);
  }

  function enviarPeticionNodo(url, servidor) {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Referer: `http://${servidor}:${CONFIG.METROPOLIS_PORT}/administracion/`,
        },
        onload: function (response) {
          const hasOkTag = /<h1>\s*OK\s*<\/h1>/i.test(response.responseText) || response.responseText.includes('<h1>OK</h1>');
          if (response.status === 200 && hasOkTag) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        onerror: function () {
          resolve(false);
        },
      });
    });
  }

  // FILTRADO INTELIGENTE DE INYECCIÓN
  function inyectarIconosRefresco() {
    function escanearDoc(doc) {
      if (!doc) return;
      try {
        const tablas = doc.querySelectorAll('table');

        tablas.forEach((tabla) => {
          let esSeccionParametros = false;
          const filas = tabla.querySelectorAll('tr');

          filas.forEach((tr) => {
            const tdTipo = tr.querySelector('.RPOS015_Elementos_TipoItem, td[class*="TipoItem"]');
            if (tdTipo) {
              const textoTipo = tdTipo.innerText.trim();
              esSeccionParametros = /par[aá]m/i.test(textoTipo) && !/grupo/i.test(textoTipo);
            }

            if (tr.id && tr.id.includes('_trDatos')) {
              if (tr.hasAttribute('data-tm-refreshed')) return;

              const inputTipo = tr.querySelector('input[id*="CodigoTipoItem"]');
              const valTipo = inputTipo ? inputTipo.value.toUpperCase() : '';
              const esTipoParam = ['PARAMETRO_CONF', 'PARAM_CONF'].includes(valTipo);

              if (!esSeccionParametros && !esTipoParam) return;

              const enlaceNombre = tr.querySelector('a[id*="_HlnkNombre"], a.RPOS015_Elementos_Nombre');
              if (!enlaceNombre) return;

              const nombreParametro = enlaceNombre.innerText;
              if (!nombreParametro) return;

              const primerTd = tr.querySelector('td');
              if (!primerTd) return;

              primerTd.style.whiteSpace = 'nowrap';
              primerTd.style.verticalAlign = 'middle';

              const btnRefresh = doc.createElement('button');
              btnRefresh.type = 'button';
              btnRefresh.className = 'tm-btn-refresh-param no-drag';
              btnRefresh.title = `Abrir gestor de refresco para: ${nombreParametro.replace(/\s+/g, '')}`;
              btnRefresh.innerHTML = '🔄';
              btnRefresh.style.cssText = `
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: #eef7f7 !important;
                border: 1px solid #276466 !important;
                color: #276466 !important;
                padding: 2px 5px !important;
                margin-right: 6px !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-size: 11px !important;
                vertical-align: middle !important;
                line-height: 1 !important;
              `;

              btnRefresh.onmouseover = () => {
                btnRefresh.style.background = '#276466';
                btnRefresh.style.color = '#ffffff';
              };
              btnRefresh.onmouseout = () => {
                btnRefresh.style.background = '#eef7f7';
                btnRefresh.style.color = '#276466';
              };

              btnRefresh.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                procesarRefrescoParametro(nombreParametro, btnRefresh, doc);
              };

              primerTd.insertBefore(btnRefresh, primerTd.firstChild);
              tr.setAttribute('data-tm-refreshed', 'true');
            }
          });
        });
      } catch (e) {}

      doc.querySelectorAll('iframe, frame').forEach((iframe) => {
        try {
          escanearDoc(iframe.contentDocument || iframe.contentWindow.document);
        } catch (e) {}
      });
    }

    escanearDoc(document);
  }

  function ejecutarEliminacionRefrescos() {
    function limpiarDoc(doc) {
      if (!doc) return;
      try {
        doc.querySelectorAll('.tm-btn-refresh-param').forEach((b) => b.remove());
        doc.querySelectorAll('tr[data-tm-refreshed]').forEach((tr) => tr.removeAttribute('data-tm-refreshed'));
      } catch (e) {}

      doc.querySelectorAll('iframe, frame').forEach((iframe) => {
        try {
          limpiarDoc(iframe.contentDocument || iframe.contentWindow.document);
        } catch (e) {}
      });
    }
    limpiarDoc(document);
  }

  // =========================================================================
  // BUBBLE MASTER UI: CGDN TOOLS (BOTÓN Y SUBMENÚ UNIFICADO)
  // =========================================================================
  function initMasterUI() {
    if (window.top.document.getElementById('tm-cgdn-master-wrapper')) return;

    const style = window.top.document.createElement('style');
    style.textContent = `
      #tm-cgdn-master-wrapper { position: fixed; z-index: 9999998; font-family: system-ui, -apple-system, sans-serif; }
      #tm-cgdn-main-btn {
        padding: 10px 16px;
        background: ${CONFIG.COLOR_PRIMARIO};
        color: #ffffff;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        user-select: none;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: background 0.2s ease, transform 0.1s ease;
      }
      #tm-cgdn-main-btn:hover { background: ${CONFIG.COLOR_SECUNDARIO}; }
      #tm-cgdn-main-btn:active { transform: scale(0.95); }

      #tm-cgdn-menu {
        position: absolute;
        display: none;
        flex-direction: column;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        padding: 10px;
        min-width: 240px;
        gap: 6px;
        color: #1e293b;
        z-index: 9999999;
      }
      #tm-cgdn-master-wrapper.open #tm-cgdn-menu { display: flex; }

      .tm-menu-group-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; font-weight: 800; padding: 4px 6px 2px 6px; }
      .tm-menu-subgroup { display: flex; gap: 4px; }
      .tm-menu-btn-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 6px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        transition: all 0.15s ease;
      }
      .tm-menu-btn-item:hover { background: #eef7f7; border-color: ${CONFIG.COLOR_PRIMARIO}; color: ${CONFIG.COLOR_PRIMARIO}; }

      /* Modales y Paneles Globales */
      #tm-ctx-panel, #tm-param-panel { position: fixed; width: 850px; height: 620px; background: #ffffff; border-radius: 12px; z-index: 999999; display: none; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; resize: both; border: 1px solid #cbd5e1; font-size: 13px; }
      #tm-ctx-header, #tm-param-header { background: linear-gradient(135deg, ${CONFIG.COLOR_PRIMARIO} 0%, ${CONFIG.COLOR_SECUNDARIO} 100%); color: white; padding: 12px 18px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; cursor: grab; user-select: none; }
      .tm-header-title { display: flex; align-items: center; gap: 8px; }
      .tm-header-actions { display: flex; gap: 6px; }
      .tm-panel-btn { background: rgba(255,255,255,0.15); border: none; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 600; }
      .tm-panel-btn:hover { background: rgba(255,255,255,0.3); }
      #tm-tab-bar { display: flex; background: #e2e8f0; padding: 6px 6px 0 6px; gap: 4px; overflow-x: auto; }
      .tm-tab-item { background: #cbd5e1; padding: 6px 12px; border-radius: 6px 6px 0 0; cursor: pointer; font-size: 11px; font-weight: 600; color: #475569; display: flex; align-items: center; max-width: 140px; }
      .tm-tab-item.active { background: #ffffff; color: ${CONFIG.COLOR_PRIMARIO}; border-top: 3px solid ${CONFIG.COLOR_PRIMARIO}; font-weight: 700; }
      .tm-tab-close { margin-left: 6px; border-radius: 50%; width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
      .tm-tab-close:hover { background: #ef4444; color: white; }
      #tm-content-area { flex-grow: 1; position: relative; background: #ffffff; }
      .tm-tab-view-container { width: 100%; height: 100%; position: absolute; top:0; left:0; display:none; }
      .tm-iframe-view { width: 100%; height: 100%; border: none; }
      .tm-tab-placeholder, #tm-ctx-placeholder { position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:13px; }

      /* Creador de Parámetros */
      #tm-param-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; flex-grow: 1; overflow: hidden; background: #f8fafc; }
      .tm-textarea { width: 100%; height: 60px; font-family: monospace; font-size: 11px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; resize: vertical; box-sizing: border-box; }
      .tm-actions-bar { display: flex; gap: 8px; align-items: center; }
      .tm-btn { background: ${CONFIG.COLOR_PRIMARIO}; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
      .tm-btn:hover { background: ${CONFIG.COLOR_SECUNDARIO}; }
      .tm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .tm-btn-secondary { background: #e2e8f0; color: #475569; }
      .tm-btn-action { background: #059669; }
      .tm-table-container { flex-grow: 1; overflow-y: auto; background: white; border: 1px solid #e2e8f0; border-radius: 8px; }
      .tm-table { width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; }
      .tm-table th { background: #f1f5f9; padding: 8px; position: sticky; top: 0; color: #475569; border-bottom: 1px solid #cbd5e1; z-index: 10; }
      .tm-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; max-width: 250px; overflow: hidden; text-overflow: ellipsis; }
      .tm-badge { padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
      .tm-bg-pending { background: #fef3c7; color: #92400e; }
      .tm-bg-loading { background: #e0f2fe; color: #0369a1; }
      .tm-bg-ok { background: #dcfce7; color: #166534; }
      .tm-bg-error { background: #fee2e2; color: #991b1b; }
      .no-drag { cursor: pointer; }

      /* Estilos del Modal de Refresco Metrópolis */
      #tm-refresh-modal { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important; display: flex !important; justify-content: center !important; align-items: center !important; font-family: system-ui, -apple-system, sans-serif !important; }
      #tm-refresh-modal.tm-modal-hidden { display: none !important; }
      .tm-modal-overlay { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: rgba(15, 23, 42, 0.6) !important; backdrop-filter: blur(3px) !important; }
      .tm-modal-card { position: relative !important; background: #ffffff !important; width: 580px !important; max-width: 92vw !important; max-height: 90vh !important; border-radius: 12px !important; box-shadow: 0 20px 30px rgba(0,0,0,0.4) !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; border: 1px solid #cbd5e1 !important; z-index: 1 !important; }
      .tm-modal-header { background: ${CONFIG.COLOR_PRIMARIO} !important; color: white !important; padding: 14px 18px !important; font-weight: 700 !important; font-size: 14px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
      .tm-modal-close-btn { cursor: pointer !important; opacity: 0.8 !important; font-size: 16px !important; transition: opacity 0.2s !important; }
      .tm-modal-close-btn:hover { opacity: 1 !important; }
      .tm-modal-body { padding: 16px !important; overflow-y: auto !important; display: flex !important; flex-direction: column !important; gap: 12px !important; background: #f8fafc !important; flex-grow: 1 !important; }
      .tm-param-summary { background: #e2e8f0 !important; padding: 10px 14px !important; border-radius: 6px !important; font-size: 12px !important; display: flex !important; flex-direction: column !important; gap: 4px !important; border-left: 4px solid ${CONFIG.COLOR_PRIMARIO} !important; color: #1e293b !important; }
      .tm-toolbar-nodes { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-top: 2px !important; }
      .tm-node-subbtn { background: #ffffff !important; border: 1px solid #cbd5e1 !important; padding: 4px 8px !important; border-radius: 4px !important; font-size: 11px !important; cursor: pointer !important; font-weight: 600 !important; color: #475569 !important; }
      .tm-node-subbtn:hover { background: #f1f5f9 !important; color: #0f172a !important; }
      .tm-nodes-container-scroll { max-height: 280px !important; overflow-y: auto !important; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; padding: 10px !important; background: #ffffff !important; display: flex !important; flex-direction: column !important; gap: 10px !important; }
      .tm-section-header { font-size: 11px !important; font-weight: 700 !important; color: ${CONFIG.COLOR_PRIMARIO} !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; background: #f1f5f9 !important; padding: 4px 8px !important; border-radius: 4px !important; }
      .tm-section-divider { height: 1px !important; background: #e2e8f0 !important; margin: 4px 0 !important; }
      .tm-nodes-checklist { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 6px !important; }
      .tm-node-item { background: #f8fafc !important; border: 1px solid #cbd5e1 !important; border-radius: 6px !important; padding: 6px 10px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; font-size: 11px !important; font-family: monospace !important; font-weight: 600 !important; color: #334155 !important; }
      .tm-node-item label { cursor: pointer !important; display: flex !important; align-items: center !important; gap: 6px !important; margin: 0 !important; width: 100% !important; }
      .tm-node-badge { font-size: 10px !important; padding: 2px 5px !important; border-radius: 4px !important; font-weight: 700 !important; white-space: nowrap !important; }
      .tm-node-badge.pending { background: #ffffff !important; color: #64748b !important; border: 1px solid #cbd5e1 !important; }
      .tm-node-badge.loading { background: #fef9c3 !important; color: #854d0e !important; border: 1px solid #fde047 !important; }
      .tm-node-badge.ok { background: #dcfce7 !important; color: #15803d !important; border: 1px solid #86efac !important; }
      .tm-node-badge.error { background: #fee2e2 !important; color: #991b1b !important; border: 1px solid #fca5a5 !important; }
      .tm-status-summary-bar { padding: 10px !important; border-radius: 6px !important; font-size: 12px !important; font-weight: 700 !important; text-align: center !important; }
      .tm-status-summary-bar.success { background: #dcfce7 !important; color: #166534 !important; border: 1px solid #86efac !important; }
      .tm-status-summary-bar.partial { background: #fef9c3 !important; color: #854d0e !important; border: 1px solid #fde047 !important; }
      .tm-modal-footer { padding: 12px 16px !important; background: #ffffff !important; border-top: 1px solid #e2e8f0 !important; display: flex !important; justify-content: flex-end !important; }
      .tm-btn-action-exec { background: ${CONFIG.COLOR_PRIMARIO} !important; color: white !important; border: none !important; padding: 10px 18px !important; border-radius: 6px !important; font-weight: 700 !important; font-size: 13px !important; cursor: pointer !important; transition: background 0.2s !important; }
      .tm-btn-action-exec:hover { background: ${CONFIG.COLOR_SECUNDARIO} !important; }
      .tm-btn-action-exec:disabled { opacity: 0.6 !important; cursor: not-allowed !important; }
    `;
    window.top.document.head.appendChild(style);

    initContextsModule();
    initParamCreatorModule();
    initMetropolisRefresherModule();

    const wrapper = window.top.document.createElement('div');
    wrapper.id = 'tm-cgdn-master-wrapper';

    const menu = window.top.document.createElement('div');
    menu.id = 'tm-cgdn-menu';
    menu.className = 'no-drag';
    menu.innerHTML = `
      <div class="tm-menu-group-title">📁 Gestor de Contextos</div>
      <div class="tm-menu-subgroup">
        <button class="tm-menu-btn-item" id="tm-act-ctx-inject" title="Inyectar botones de apertura en la tabla de contextos">
          ${SVG_TOOLKIT.PLUS} Inyectar
        </button>
        <button class="tm-menu-btn-item" id="tm-act-ctx-remove" title="Quitar botones inyectados de la tabla">
          ${SVG_TOOLKIT.TRASH} Quitar
        </button>
      </div>
      <button class="tm-menu-btn-item" id="tm-act-ctx-panel" style="width:100%; margin-top:2px;">
        ${SVG_TOOLKIT.PANEL} Abrir Visor Multitarea
      </button>

      <div class="tm-menu-group-title" style="margin-top: 4px;">➕ Alta de Parámetros</div>
      <button class="tm-menu-btn-item" id="tm-act-param-panel" style="width:100%;">
        ${SVG_TOOLKIT.PARAM} Creador Masivo
      </button>

      <div class="tm-menu-group-title" style="margin-top: 4px;">🔄 Refresco Metrópolis</div>
      <div class="tm-menu-subgroup">
        <button class="tm-menu-btn-item" id="tm-act-refresh-inject" title="Inyectar botones de recarga en cada parámetro">
          🔄 Inyectar 🔄
        </button>
        <button class="tm-menu-btn-item" id="tm-act-refresh-remove" title="Quitar botones de recarga de la tabla">
          ${SVG_TOOLKIT.TRASH} Quitar
        </button>
      </div>
    `;

    const mainBtn = window.top.document.createElement('div');
    mainBtn.id = 'tm-cgdn-main-btn';
    mainBtn.innerHTML = `${SVG_TOOLKIT.TOOLS} <span>CGDN Tools</span>`;

    wrapper.appendChild(mainBtn);
    wrapper.appendChild(menu);
    window.top.document.body.appendChild(wrapper);

    GestorUI.configurarArrastre(wrapper, mainBtn, CONFIG.MAIN_BTN_POS_KEY, true, {bottom: '30px', right: '30px'});

    function actualizarPosicionMenu() {
      const rect = wrapper.getBoundingClientRect();
      const midY = window.innerHeight / 2;
      const midX = window.innerWidth / 2;

      menu.style.top = rect.top > midY ? 'auto' : '50px';
      menu.style.bottom = rect.top > midY ? '50px' : 'auto';
      menu.style.left = rect.left > midX ? 'auto' : '0px';
      menu.style.right = rect.left > midX ? '0px' : 'auto';
    }

    mainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wrapper.dataset.dragged === 'true') {
        wrapper.dataset.dragged = 'false';
        return;
      }
      const isOpen = wrapper.classList.contains('open');
      if (!isOpen) {
        actualizarPosicionMenu();
        wrapper.classList.add('open');
      } else {
        wrapper.classList.remove('open');
      }
    });

    window.top.document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });

    window.top.document.getElementById('tm-act-ctx-inject').addEventListener('click', () => {
      ejecutarInyeccionContextos();
      wrapper.classList.remove('open');
    });

    window.top.document.getElementById('tm-act-ctx-remove').addEventListener('click', () => {
      ejecutarEliminacionContextos();
      wrapper.classList.remove('open');
    });

    window.top.document.getElementById('tm-act-ctx-panel').addEventListener('click', () => {
      const p = window.top.document.getElementById('tm-ctx-panel');
      if (p) p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
      wrapper.classList.remove('open');
    });

    window.top.document.getElementById('tm-act-param-panel').addEventListener('click', () => {
      const p = window.top.document.getElementById('tm-param-panel');
      if (p) p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
      wrapper.classList.remove('open');
    });

    window.top.document.getElementById('tm-act-refresh-inject').addEventListener('click', () => {
      inyectarIconosRefresco();
      wrapper.classList.remove('open');
    });

    window.top.document.getElementById('tm-act-refresh-remove').addEventListener('click', () => {
      ejecutarEliminacionRefrescos();
      wrapper.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMasterUI);
  } else {
    initMasterUI();
  }
})();
