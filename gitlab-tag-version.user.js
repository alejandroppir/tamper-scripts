// ==UserScript==
// @name         GitLab: Inventario de Versión en Tags
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.2.1
// @description  Inyecta la versión del Inventario de Versión activo de forma ultra-optimizada.
// @match        https://gitlab.abanca.io/*/-/tags*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      gitlab.abanca.io
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/gitlab-tags-inventario.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/gitlab-tags-inventario.user.js
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) return;

  const COLOR_ABANCA = '#376466';
  const COLOR_ABANCA_HOVER = '#284d4f';
  const TOKEN_STORAGE_KEY = 'tm_gl_private_token';
  const DEFAULT_GROUP_PATH = 'ti/7773-inversion-seguros/7699-seguros-it/seguros/bgur';

  GM_addStyle(`
    .tm-inventario-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-left: 14px;
      padding: 5px 14px;
      background: ${COLOR_ABANCA};
      color: #ffffff !important;
      font-size: 13px;
      font-weight: 600;
      border-radius: 20px;
      text-decoration: none !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
      vertical-align: middle;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .tm-inventario-badge:hover {
      background: ${COLOR_ABANCA_HOVER};
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      color: #ffffff !important;
    }
    .tm-inventario-badge .tm-status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #4ade80;
    }
    .tm-inventario-badge .tm-status-dot.upcoming {
      background-color: #facc15;
    }
    .tm-inventario-badge .tm-dates {
      font-weight: 400;
      font-size: 12px;
      opacity: 0.9;
      background: rgba(0, 0, 0, 0.2);
      padding: 2px 8px;
      border-radius: 12px;
      margin-left: 2px;
    }
    .tm-inventario-badge.loading {
      background: #475569;
      opacity: 0.8;
    }
    .tm-inventario-badge.error {
      background: #991b1b;
    }
  `);

  function obtenerRutaGrupo() {
    const pathname = window.location.pathname;
    const bgurMatch = pathname.match(/^(\/.*?\/bgur)/);
    return bgurMatch ? bgurMatch[1].replace(/^\//, '') : DEFAULT_GROUP_PATH;
  }

  function formatearFecha(fechaIso) {
    if (!fechaIso) return null;
    const partes = fechaIso.split('T')[0].split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaIso;
  }

  function parseFechaObj(fechaIso) {
    if (!fechaIso) return null;
    const partes = fechaIso.split('T')[0].split('-');
    return partes.length === 3 ? new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10)) : null;
  }

  function obtenerUltimaVersion() {
    return new Promise((resolve) => {
      const groupPath = encodeURIComponent(obtenerRutaGrupo());
      const token = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
      const apiUrl = `${window.location.origin}/api/v4/groups/${groupPath}/issues?labels=Inventario%20de%20versi%C3%B3n&order_by=created_at&sort=desc&per_page=20`;

      const headers = {};
      if (token) headers['PRIVATE-TOKEN'] = token;

      GM_xmlhttpRequest({
        method: 'GET',
        url: apiUrl,
        headers: headers,
        onload: (res) => {
          if (res.status >= 200 && res.status < 300) {
            try {
              const issues = JSON.parse(res.responseText);
              const candidatas = [];

              for (const issue of issues) {
                const match = issue.title.match(/Inventario de versi[oó]n\s+v?([0-9\.]+)/i);
                if (match) {
                  const startDateRaw = issue.start_date || issue.milestone?.start_date || issue.iteration?.start_date || null;
                  const dueDateRaw = issue.due_date || issue.milestone?.due_date || issue.iteration?.due_date || null;

                  candidatas.push({
                    version: match[1],
                    fullTitle: issue.title,
                    webUrl: issue.web_url,
                    inicioStr: formatearFecha(startDateRaw),
                    finStr: formatearFecha(dueDateRaw),
                    fInicio: parseFechaObj(startDateRaw),
                    fFin: parseFechaObj(dueDateRaw),
                  });
                }
              }

              if (candidatas.length === 0) return resolve(null);

              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);

              let seleccionada = candidatas.find((item) =>
                item.fInicio && item.fFin ? item.fInicio <= hoy && hoy <= item.fFin : item.fInicio && item.fInicio <= hoy,
              );
              let enCurso = true;

              if (!seleccionada) {
                seleccionada = candidatas.find((item) => item.fInicio && item.fInicio <= hoy);
              }

              if (!seleccionada) {
                seleccionada = candidatas[0];
                if (seleccionada.fInicio && seleccionada.fInicio > hoy) enCurso = false;
              }

              seleccionada.enCurso = enCurso;
              resolve(seleccionada);
              return;
            } catch (e) {
              console.error('[Inventario-Script] Error parseando JSON:', e);
            }
          }
          resolve(null);
        },
        onerror: () => resolve(null),
      });
    });
  }

  async function inyectarInsignia() {
    if (document.getElementById('tm-inventario-badge')) return;

    const heading = document.querySelector('h1[data-testid="page-heading"], h1.gl-heading-1');
    if (!heading) return;

    const groupPath = obtenerRutaGrupo();
    const fallbackUrl = `${window.location.origin}/groups/${groupPath}/-/work_items?sort=created_date&state=all&label_name%5B%5D=Inventario%20de%20versi%C3%B3n`;

    const badge = document.createElement('a');
    badge.id = 'tm-inventario-badge';
    badge.className = 'tm-inventario-badge loading';
    badge.target = '_blank';
    badge.href = fallbackUrl;
    badge.innerHTML = '📦 <span>Cargando...</span>';
    heading.appendChild(badge);

    const data = await obtenerUltimaVersion();

    if (data && data.version) {
      badge.className = 'tm-inventario-badge';
      badge.href = data.webUrl || fallbackUrl;
      badge.title = `Ver tarea: ${data.fullTitle}`;

      let fechasHtml = '';
      if (data.inicioStr || data.finStr) {
        fechasHtml = `<span class="tm-dates">📅 ${data.inicioStr || '...'} - ${data.finStr || '...'}</span>`;
      }

      const dotClass = data.enCurso ? 'tm-status-dot' : 'tm-status-dot upcoming';
      badge.innerHTML = `<span class="${dotClass}" title="${data.enCurso ? 'Versión en curso' : 'Versión futura'}"></span> 📦 <span>v${data.version}</span>${fechasHtml}`;
    } else {
      badge.className = 'tm-inventario-badge error';
      badge.innerHTML = '📦 <span>Sin versión</span>';
    }
  }

  // --- CONTROL DE RENDIMIENTO (THROTTLING + OBSERVER LIMITADO) ---
  let timerId = null;
  function controlarInyeccion() {
    if (document.getElementById('tm-inventario-badge')) return;
    if (timerId) return;

    timerId = setTimeout(() => {
      timerId = null;
      if (window.location.pathname.includes('/-/tags')) {
        inyectarInsignia();
      }
    }, 400); // Solo evalúa como máximo cada 400ms
  }

  // Observador con Debouncing
  const observer = new MutationObserver(controlarInyeccion);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', controlarInyeccion);
  } else {
    controlarInyeccion();
  }

  // Escuchar únicamente la carga de elementos dentro de los contenedores principales
  const targetContainer = document.querySelector('main') || document.body;
  observer.observe(targetContainer, {childList: true, subtree: true});
})();
