// ==UserScript==
// @name         Abanca Repositorio - Refrescador Multi-Nodo Metrópolis (CGT/PGT)
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.3.0
// @description  Inyecta botones de refresco en RPOS015 e invoca la recarga en servidores CGT (España) y PGT (Portugal).
// @match        http://exaplicaciones/rpos015/*
// @match        http://ecaplicaciones/rpos015/*
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) return;

  const CONFIG = {
    COLOR_PRIMARIO: '#276466',
    COLOR_SECUNDARIO: '#1e4f51',
    BTN_POS_KEY: 'tm_refresh_group_btn_pos',
    PORT: '9080',
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
  // GESTOR DE MODAL INTERACTIVO DE SERVIDORES
  // =========================================================================
  function crearModalRefresco() {
    if (document.getElementById('tm-refresh-modal')) return;

    const modal = document.createElement('div');
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

    document.body.appendChild(modal);

    const css = `
      #tm-refresh-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999999; display: flex; justify-content: center; align-items: center; font-family: system-ui, -apple-system, sans-serif; }
      #tm-refresh-modal.tm-modal-hidden { display: none !important; }
      .tm-modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(3px); }
      .tm-modal-card { position: relative; background: #ffffff; width: 580px; max-width: 92vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 20px 30px rgba(0,0,0,0.3); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #cbd5e1; z-index: 1; }
      .tm-modal-header { background: ${CONFIG.COLOR_PRIMARIO}; color: white; padding: 14px 18px; font-weight: 700; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
      .tm-modal-close-btn { cursor: pointer; opacity: 0.8; font-size: 16px; transition: opacity 0.2s; }
      .tm-modal-close-btn:hover { opacity: 1; }
      .tm-modal-body { padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; flex-grow: 1; }
      .tm-param-summary { background: #e2e8f0; padding: 10px 14px; border-radius: 6px; font-size: 12px; display: flex; flex-direction: column; gap: 4px; border-left: 4px solid ${CONFIG.COLOR_PRIMARIO}; color: #1e293b; }
      .tm-toolbar-nodes { display: flex; justify-content: space-between; align-items: center; margin-top: 2px; }
      .tm-node-subbtn { background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 600; color: #475569; }
      .tm-node-subbtn:hover { background: #f1f5f9; color: #0f172a; }
      .tm-nodes-container-scroll { max-height: 280px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #ffffff; display: flex; flex-direction: column; gap: 10px; }
      .tm-section-header { font-size: 11px; font-weight: 700; color: ${CONFIG.COLOR_PRIMARIO}; text-transform: uppercase; letter-spacing: 0.5px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; }
      .tm-section-divider { height: 1px; background: #e2e8f0; margin: 4px 0; }
      .tm-nodes-checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .tm-node-item { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-family: monospace; font-weight: 600; color: #334155; }
      .tm-node-item label { cursor: pointer; display: flex; align-items: center; gap: 6px; margin: 0; width: 100%; }
      .tm-node-badge { font-size: 10px; padding: 2px 5px; border-radius: 4px; font-weight: 700; white-space: nowrap; }
      .tm-node-badge.pending { background: #ffffff; color: #64748b; border: 1px solid #cbd5e1; }
      .tm-node-badge.loading { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
      .tm-node-badge.ok { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
      .tm-node-badge.error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
      .tm-status-summary-bar { padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 700; text-align: center; }
      .tm-status-summary-bar.success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
      .tm-status-summary-bar.partial { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
      .tm-modal-footer { padding: 12px 16px; background: #ffffff; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }
      .tm-btn-action-exec { background: ${CONFIG.COLOR_PRIMARIO}; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; transition: background 0.2s; }
      .tm-btn-action-exec:hover { background: ${CONFIG.COLOR_SECUNDARIO}; }
      .tm-btn-action-exec:disabled { opacity: 0.6; cursor: not-allowed; }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    document.getElementById('tm-modal-close').addEventListener('click', cerrarModal);
    modal.querySelector('.tm-modal-overlay').addEventListener('click', cerrarModal);

    document.getElementById('tm-btn-select-all').addEventListener('click', () => {
      document.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]').forEach((chk) => (chk.checked = true));
    });

    document.getElementById('tm-btn-deselect-all').addEventListener('click', () => {
      document.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]').forEach((chk) => (chk.checked = false));
    });
  }

  function cerrarModal() {
    const modal = document.getElementById('tm-refresh-modal');
    if (modal) modal.classList.add('tm-modal-hidden');
  }

  function renderizarServidores(lista, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    lista.forEach((servidor) => {
      const item = document.createElement('div');
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

  // =========================================================================
  // LÓGICA DE PROCESAMIENTO Y EJECUCIÓN MULTI-NODO
  // =========================================================================
  function procesarRefrescoParametro(nombreRaw, btnElemento) {
    // 1. Limpieza estricta de saltos de línea y espacios
    const cleanText = nombreRaw.replace(/\s+/g, '');
    const partes = cleanText.split('_');

    // VALIDACIÓN CRÍTICA: Romper y avisar si no hay al menos 3 partes
    if (partes.length < 3) {
      alert(
        `❌ Error de Formato:\n\nEl nombre del parámetro "${cleanText}" no contiene las 3 partes requeridas (Aplicación_Grupo_Parámetro).\n\nPartes detectadas: ${partes.length}.\nOperación cancelada.`,
      );
      return;
    }

    const aplicacion = partes[0].replace(/CFG$/i, ''); // Ej: BGURCFG -> BGUR
    const grupo = partes[1];
    const parametro = partes.slice(2).join('_');

    crearModalRefresco();

    document.getElementById('tm-summary-app').textContent = aplicacion;
    document.getElementById('tm-summary-grupo').textContent = grupo;
    document.getElementById('tm-summary-param').textContent = parametro;

    renderizarServidores(CONFIG.SERVIDORES_CGT, 'tm-nodes-cgt');
    renderizarServidores(CONFIG.SERVIDORES_PGT, 'tm-nodes-pgt');

    const statusBar = document.getElementById('tm-modal-status-bar');
    statusBar.className = 'tm-status-summary-bar tm-modal-hidden';
    statusBar.textContent = '';

    const btnExec = document.getElementById('tm-btn-execute-reload');
    btnExec.disabled = false;
    btnExec.onclick = () => ejecutarRefrescoMultiNodo(aplicacion, grupo, parametro, btnElemento);

    document.getElementById('tm-refresh-modal').classList.remove('tm-modal-hidden');
  }

  async function ejecutarRefrescoMultiNodo(aplicacion, grupo, parametro, btnTrigger) {
    const btnExec = document.getElementById('tm-btn-execute-reload');
    btnExec.disabled = true;

    const checkboxes = Array.from(document.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]:checked'));
    if (checkboxes.length === 0) {
      alert('Debes seleccionar al menos un servidor para ejecutar la recarga.');
      btnExec.disabled = false;
      return;
    }

    let okCount = 0;
    let errorCount = 0;

    // Deshabilitar todos los checkboxes durante la ejecución
    document.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]').forEach((chk) => (chk.disabled = true));

    for (const chk of checkboxes) {
      const servidor = chk.value;
      const badge = document.getElementById(`tm-badge-${servidor}`);
      if (badge) {
        badge.className = 'tm-node-badge loading';
        badge.textContent = '🔄 Enviando...';
      }

      // La URL se construye usando el Servidor específico en lugar de tpmetroo2kc
      const reloadUrl = `http://${servidor}:${CONFIG.PORT}/administracion/ParametrosConfiguracionReload/op?aplicacion=${encodeURIComponent(aplicacion)}&grupo=${encodeURIComponent(grupo)}&parametro=${encodeURIComponent(parametro)}`;

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

    // Rehabilitar checkboxes
    document.querySelectorAll('.tm-nodes-container-scroll input[type="checkbox"]').forEach((chk) => (chk.disabled = false));
    btnExec.disabled = false;

    // Actualizar barra de estado global del modal
    const statusBar = document.getElementById('tm-modal-status-bar');
    statusBar.classList.remove('tm-modal-hidden');

    if (errorCount === 0) {
      statusBar.className = 'tm-status-summary-bar success';
      statusBar.textContent = `🎉 ¡Refresco completado con éxito! Todos los ${okCount} servidores seleccionados respondieron <h1>OK</h1>.`;
      if (btnTrigger) btnTrigger.innerText = '✅';
    } else {
      statusBar.className = 'tm-status-summary-bar partial';
      statusBar.textContent = `⚠️ Proceso finalizado: ${okCount} OK, ${errorCount} Errores. Revisa la lista de servidores.`;
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
          Referer: `http://${servidor}:${CONFIG.PORT}/administracion/`,
        },
        onload: function (response) {
          const hasOkTag = /<h1>\s*OK\s*<\/h1>/i.test(response.responseText) || response.responseText.includes('<h1>OK</h1>');
          if (response.status === 200 && hasOkTag) {
            resolve(true);
          } else {
            console.error(`[RPOS015-Refrescador] Fallo en servidor ${servidor}: Status ${response.status}. Contenido HTML no contiene <h1>OK</h1>.`);
            resolve(false);
          }
        },
        onerror: function (err) {
          console.error(`[RPOS015-Refrescador] Error de red al conectar con ${servidor}:`, err);
          resolve(false);
        },
      });
    });
  }

  function inyectarIconosRefresco() {
    function escanearDocumento(doc) {
      if (!doc) return;

      const filas = doc.querySelectorAll('tr[id*="_trDatos"]');

      filas.forEach((tr) => {
        if (tr.hasAttribute('data-tm-refreshed')) return;

        const enlaceNombre = tr.querySelector('a[id*="_HlnkNombre"], a.RPOS015_Elementos_Nombre');
        if (!enlaceNombre) return;

        const nombreParametro = enlaceNombre.innerText;
        if (!nombreParametro) return;

        const primerTd = tr.querySelector('td');
        if (!primerTd) return;

        // Visualización horizontal en fila
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
          transition: all 0.15s ease !important;
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
          procesarRefrescoParametro(nombreParametro, btnRefresh);
        };

        primerTd.insertBefore(btnRefresh, primerTd.firstChild);
        tr.setAttribute('data-tm-refreshed', 'true');
      });

      doc.querySelectorAll('iframe, frame').forEach((iframe) => {
        try {
          const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
          escanearDocumento(innerDoc);
        } catch (e) {}
      });
    }

    escanearDocumento(document);
  }

  // =========================================================================
  // INICIALIZACIÓN DE LA UI FLOTANTE GLOBAL
  // =========================================================================
  function initUI() {
    if (document.getElementById('tm-btn-refresh-trigger')) return;

    const style = document.createElement('style');
    style.textContent = `
      #tm-btn-refresh-trigger {
        position: fixed;
        z-index: 9999998;
        padding: 10px 16px;
        background: ${CONFIG.COLOR_PRIMARIO};
        color: #ffffff;
        border-radius: 50px;
        cursor: pointer;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 600;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        user-select: none;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: background 0.2s ease, transform 0.1s ease;
      }
      #tm-btn-refresh-trigger:hover {
        background: ${CONFIG.COLOR_SECUNDARIO};
      }
      #tm-btn-refresh-trigger:active {
        transform: scale(0.95);
      }
      .tm-is-dragging iframe {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('div');
    btn.id = 'tm-btn-refresh-trigger';
    btn.innerHTML = '<span>🔄 Refrescar Parámetros</span>';
    document.body.appendChild(btn);

    GestorUI.configurarArrastre(btn, btn, CONFIG.BTN_POS_KEY, true, {bottom: '30px', right: '30px', top: 'auto', left: 'auto'});

    btn.addEventListener('click', (e) => {
      if (btn.dataset.dragged === 'true') {
        btn.dataset.dragged = 'false';
        return;
      }
      inyectarIconosRefresco();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
})();
