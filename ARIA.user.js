// ==UserScript==
// @name         ARIA (Asistente de Reviews IA)
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.1.0
// @description  Herramienta unificada ARIA en GitLab.
// @match        https://gitlab.abanca.io/*/-/merge_requests/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      gitlab.abanca.io
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/ARIA.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/ARIA.user.js
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) return;

  // Paleta de colores oficial: VSCode Dark + Identidad Abanca
  const COLOR_ABANCA = '#376466'; // Tu color corporativo original
  const COLOR_ABANCA_HOVER = '#284d4f'; // Tu color secundario original
  const VSCODE_BG_PANEL = '#1e1e1e'; // Fondo del editor principal
  const VSCODE_BG_BODY = '#252526'; // Fondo de los paneles laterales
  const VSCODE_HEADER = '#2d2d2d'; // Barra de actividad / Pestañas
  const VSCODE_TAB_ACTIVE = '#1e1e1e';
  const VSCODE_TAB_INACTIVE = '#2d2d2d';
  const VSCODE_TEXT = '#d4d4d4'; // Texto plano de código
  const VSCODE_TEXT_MUTED = '#858585'; // Texto secundario/comentarios de UI

  const BTN_POS_KEY = 'tm_gl_btn_pos';
  const PANEL_POS_KEY = 'tm_gl_panel_pos';
  const PANEL_SIZE_KEY = 'tm_gl_panel_size';
  const TOKEN_STORAGE_KEY = 'tm_gl_private_token';

  GM_addStyle(`
        #tm-gl-btn { position: fixed; z-index: 9999999; padding: 12px 18px; background: ${COLOR_ABANCA}; color: white; border-radius: 50px; cursor: pointer; font-family: system-ui, sans-serif; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); transition: background 0.2s ease; user-select: none; display: flex; align-items: center; gap: 8px; border: 1px solid #3c3c3c; }
        #tm-gl-btn:hover { background: ${COLOR_ABANCA_HOVER}; }

        #tm-gl-panel { position: fixed; width: 480px; height: 680px; min-width: 400px; min-height: 450px; max-width: 95vw; max-height: 95vh; background: ${VSCODE_BG_PANEL}; border-radius: 12px; z-index: 9999999; display: none; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.6); font-family: system-ui, sans-serif; font-size: 13px; color: ${VSCODE_TEXT}; overflow: hidden; border: 1px solid #3c3c3c; }

        #tm-gl-header { background: ${COLOR_ABANCA}; color: #ffffff; padding: 14px 18px; font-weight: 600; font-size: 15px; display: flex; justify-content: space-between; align-items: center; cursor: grab; user-select: none; flex-shrink: 0; border-bottom: 1px solid #3c3c3c; }
        #tm-gl-header:active { cursor: grabbing; }
        #tm-gl-close { cursor: pointer; opacity: 0.8; font-size: 16px; }
        #tm-gl-close:hover { opacity: 1; }

        .tm-gl-tab-nav { display: flex; background: ${VSCODE_TAB_INACTIVE}; border-bottom: 1px solid #3c3c3c; flex-shrink: 0; }
        .tm-gl-tab-btn { flex: 1; padding: 12px; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 12px; color: ${VSCODE_TEXT_MUTED}; text-align: center; transition: all 0.2s; border-right: 1px solid #252526; }
        .tm-gl-tab-btn.active { background: ${VSCODE_TAB_ACTIVE}; color: #ffffff; border-top: 2px solid ${COLOR_ABANCA}; border-right: 1px solid #3c3c3c; }

        #tm-gl-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; background: ${VSCODE_BG_BODY}; flex-grow: 1; overflow-y: auto; position: relative; }

        .tm-gl-section { display: flex; flex-direction: column; gap: 14px; height: 100%; }

        /* Formularios estilo VSCode */
        .tm-gl-field-group { display: flex; flex-direction: column; gap: 6px; }
        .tm-gl-field-group label { font-weight: 700; font-size: 11px; color: ${VSCODE_TEXT_MUTED}; text-transform: uppercase; letter-spacing: 0.5px; }
        .tm-gl-input { padding: 8px 12px; border: 1px solid #3c3c3c; border-radius: 4px; font-size: 13px; font-family: monospace; background: #3c3c3c; color: #ffffff; }
        .tm-gl-input:focus { border-color: ${COLOR_ABANCA}; outline: none; }

        /* Segmented Controls estilo VSCode Tabs */
        .tm-gl-segmented-control { display: flex; background: #2d2d2d; padding: 3px; border-radius: 6px; border: 1px solid #3c3c3c; }
        .tm-gl-segment-btn { flex: 1; border: none; background: transparent; padding: 8px; font-size: 12px; font-weight: 600; color: ${VSCODE_TEXT_MUTED}; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; text-align: center; }
        .tm-gl-segment-btn.active { background: #3c3c3c; color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.4); border-top: 1px solid ${COLOR_ABANCA}; }

        .tm-gl-help-box { background: #1e1e1e; border-left: 4px solid ${COLOR_ABANCA}; border-radius: 4px; padding: 10px 12px; color: #cccccc; font-size: 12px; line-height: 1.5; }
        .tm-gl-help-box a { color: #3794ff; font-weight: 700; text-decoration: none; }
        .tm-gl-help-box a:hover { text-decoration: underline; }

        /* Visor de Incidencias */
        .tm-gl-sticky-top { position: sticky; top: -18px; background: ${VSCODE_BG_BODY}; padding: 4px 0 12px 0; z-index: 100; border-bottom: 1px solid #3c3c3c; display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; flex-shrink: 0; }
        .tm-gl-nav { display: flex; justify-content: space-between; align-items: center; }
        .tm-gl-filters-bar { display: flex; gap: 4px; background: #2d2d2d; padding: 3px; border-radius: 6px; border: 1px solid #3c3c3c; }
        .tm-gl-filter-btn { flex: 1; padding: 6px 4px; border: none; background: transparent; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600; color: ${VSCODE_TEXT_MUTED}; transition: all 0.2s; text-align: center; white-space: nowrap; }
        .tm-gl-filter-btn.active { background: #3c3c3c; color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }

        .tm-gl-btn-action { background: ${COLOR_ABANCA}; color: white; border: none; padding: 12px 14px; cursor: pointer; border-radius: 4px; font-weight: 600; font-size: 13px; transition: background 0.15s; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .tm-gl-btn-action:hover { background: ${COLOR_ABANCA_HOVER}; }
        .tm-gl-btn-reset { background: #3c3c3c; color: ${VSCODE_TEXT}; padding: 6px 10px; border: 1px solid #555555; cursor: pointer; border-radius: 4px; font-weight: 600; font-size: 11px; transition: background 0.2s; }
        .tm-gl-btn-reset:hover { background: #4d4d4d; color: white; }
        .tm-gl-hidden { display: none !important; }

        .tm-gl-card { background: ${VSCODE_BG_PANEL}; border: 1px solid #3c3c3c; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.4); flex-grow: 1; margin-bottom: 8px; }
        .tm-gl-badge { align-self: flex-start; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; border: 1px solid transparent; }
        .tm-gl-badge.critical { background: #5a1d1d; color: #fca5a5; border-color: #991b1b; }
        .tm-gl-badge.warning { background: #5c3b00; color: #fde68a; border-color: #b45309; }
        .tm-gl-badge.minor { background: #1e3a1e; color: #a7f3d0; border-color: #166534; }
        .tm-gl-path { font-family: monospace; font-size: 11px; color: #569cd6; word-break: break-all; cursor: pointer; text-decoration: underline; margin-top: 2px; font-weight: 600; }
        .tm-gl-path:hover { color: #4fc1ff; }

        /* Editor de Código Estilo VSCode Dark+ */
        .tm-gl-code-container { width: 100%; overflow-x: auto; background: #1e1e1e; border-radius: 4px; margin-top: 4px; border: 1px solid #3c3c3c; display: flex; }
        .tm-gl-code { font-family: 'Consolas', 'Fira Code', monospace; color: #d4d4d4; padding: 12px; font-size: 11px; line-height: 1.6; display: block; white-space: pre; word-break: normal; word-wrap: normal; min-width: 100%; background: #1e1e1e; box-sizing: border-box; }

        /* Resaltado de Sintaxis VSCode Dark+ */
        .hl-keyword { color: #c586c0; font-weight: 500; }
        .hl-type { color: #4ec9b0; }
        .hl-string { color: #ce9178; }
        .hl-comment { color: #6a9955; font-style: italic; }
        .hl-number { color: #b5cea8; }

        .tm-gl-actions { display: flex; gap: 6px; margin-top: 8px; flex-shrink: 0; }
        .tm-gl-state-btn { flex: 1; padding: 8px 6px; border: 1px solid #3c3c3c; background: #2d2d2d; color: ${VSCODE_TEXT}; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s; text-align: center; }
        .tm-gl-state-btn:hover { background: #3c3c3c; border-color: #555555; color: white; }
        .tm-gl-state-btn.pending.active { background: #5c3b00; border-color: #b45309; color: #fde68a; }
        .tm-gl-state-btn.reviewed.active { background: #1e3a1e; border-color: #166534; color: #a7f3d0; }
        .tm-gl-state-btn.ignored.active { background: #3c3c3c; border-color: #555555; color: ${VSCODE_TEXT_MUTED}; }

        #tm-gl-resizer { position: absolute; bottom: 0; right: 0; width: 18px; height: 18px; cursor: se-resize; background: linear-gradient(135deg, transparent 50%, #555555 50%); border-bottom-right-radius: 12px; z-index: 100; }
        .tm-gl-status-text { font-size: 12px; font-weight: 600; text-align: center; margin-top: 4px; }
        a { color: #3794ff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    `);

  let suggestions = [];
  let filteredSuggestions = [];
  let currentIndex = 0;
  let currentFilter = 'all';

  let activeFormatMode = 'json';
  let activeDetailMode = 'basic';

  function highlightCode(code) {
    if (!code) return '';
    let escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const masterRegex =
      /(\/\/.*)|((['"`])(?:\\.|[^\\])*?\3)|\b(public|private|protected|const|let|var|return|function|class|interface|export|import|from|async|await|if|else|for|switch|case|new|of|in)\b|\b(string|number|boolean|any|void|unknown|never|Map|Set|Array|Observable|Answer|AnswerKey|QuestionKey|ProductCode)\b|(\b\d+\b)/g;

    return escaped.replace(masterRegex, (match, comment, string, quote, keyword, type, number) => {
      if (comment) return `<span class="hl-comment">${comment}</span>`;
      if (string) return `<span class="hl-string">${string}</span>`;
      if (keyword) {
        const isControlFlow = /\b(return|if|else|for|switch|case|async|await)\b/.test(keyword);
        const colorClass = isControlFlow ? 'hl-keyword' : 'hl-type';
        return `<span class="${colorClass}">${keyword}</span>`;
      }
      if (type) return `<span class="hl-type">${type}</span>`;
      if (number) return `<span class="hl-number">${number}</span>`;
      return match;
    });
  }

  function parseGitLabUrl() {
    const path = window.location.pathname;
    const parts = path.split('/-/merge_requests/');
    if (parts.length !== 2) return null;

    const projectPath = encodeURIComponent(parts[0].substring(1));
    const mrIid = parts[1].split('/')[0];
    return {projectPath, mrIid};
  }

  function initUI() {
    if (document.getElementById('tm-gl-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'tm-gl-btn';
    btn.innerHTML = '<span>🔍 ARIA</span>';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'tm-gl-panel';

    const savedSize = localStorage.getItem(PANEL_SIZE_KEY);
    if (savedSize) {
      try {
        const size = JSON.parse(savedSize);
        panel.style.width = size.width;
        panel.style.height = size.height;
      } catch (e) {}
    }

    const header = document.createElement('div');
    header.id = 'tm-gl-header';
    header.innerHTML = '<span>ARIA (Asistente de Reviews IA)</span><span id="tm-gl-close">✖</span>';

    const tabNav = document.createElement('div');
    tabNav.className = 'tm-gl-tab-nav';
    const tabBtnExport = document.createElement('button');
    tabBtnExport.className = 'tm-gl-tab-btn active';
    tabBtnExport.textContent = '1. CONFIGURAR / EXPORTAR';
    const tabBtnViewer = document.createElement('button');
    tabBtnViewer.className = 'tm-gl-tab-btn';
    tabBtnViewer.textContent = '2. VISOR INTERACTIVO';
    tabNav.appendChild(tabBtnExport);
    tabNav.appendChild(tabBtnViewer);

    const body = document.createElement('div');
    body.id = 'tm-gl-body';

    // ==========================================
    // PESTAÑA A: EXPORTADOR DE DIFF
    // ==========================================
    const sectionExport = document.createElement('div');
    sectionExport.className = 'tm-gl-section';

    const helpBox = document.createElement('div');
    helpBox.className = 'tm-gl-help-box';
    helpBox.innerHTML = `
            Para generar un token, ve a esta ruta (<a href="https://gitlab.abanca.io/-/user_settings/personal_access_tokens" target="_blank">Settings > Access Tokens</a>) y crea un nuevo token.<br><br>
            Asegúrate de darle los permisos necesarios (al menos <strong>'read_user'</strong>, <strong>'api'</strong> para todas las funcionalidades).
        `;
    sectionExport.appendChild(helpBox);

    const tokenGroup = document.createElement('div');
    tokenGroup.className = 'tm-gl-field-group';
    tokenGroup.innerHTML = '<label>GitLab Private Token:</label>';
    const tokenInput = document.createElement('input');
    tokenInput.type = 'password';
    tokenInput.className = 'tm-gl-input';
    tokenInput.placeholder = 'Introduce tu PRIVATE-TOKEN';
    tokenInput.value = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
    tokenGroup.appendChild(tokenInput);
    sectionExport.appendChild(tokenGroup);

    const formatGroup = document.createElement('div');
    formatGroup.className = 'tm-gl-field-group';
    formatGroup.innerHTML = '<label>Formato de Salida Gemini:</label>';
    const controlFormat = document.createElement('div');
    controlFormat.className = 'tm-gl-segmented-control';
    const btnFormatJson = document.createElement('button');
    btnFormatJson.className = 'tm-gl-segment-btn active';
    btnFormatJson.textContent = 'review --json';
    const btnFormatHuman = document.createElement('button');
    btnFormatHuman.className = 'tm-gl-segment-btn';
    btnFormatHuman.textContent = 'review --human';
    controlFormat.appendChild(btnFormatJson);
    controlFormat.appendChild(btnFormatHuman);
    formatGroup.appendChild(controlFormat);
    sectionExport.appendChild(formatGroup);

    const detailGroup = document.createElement('div');
    detailGroup.className = 'tm-gl-field-group';
    detailGroup.innerHTML = '<label>Estrategia de Análisis del Código:</label>';
    const controlDetail = document.createElement('div');
    controlDetail.className = 'tm-gl-segmented-control';
    const btnDetailBasic = document.createElement('button');
    btnDetailBasic.className = 'tm-gl-segment-btn active';
    btnDetailBasic.textContent = 'Diff Básico (Solo Cambios)';
    const btnDetailExhaustive = document.createElement('button');
    btnDetailExhaustive.className = 'tm-gl-segment-btn';
    btnDetailExhaustive.textContent = 'Diff Exhaustivo (Archivos Enteros)';
    controlDetail.appendChild(btnDetailBasic);
    controlDetail.appendChild(btnDetailExhaustive);
    detailGroup.appendChild(controlDetail);
    sectionExport.appendChild(detailGroup);

    const actionDownloadBtn = document.createElement('button');
    actionDownloadBtn.className = 'tm-gl-btn-action';
    actionDownloadBtn.innerHTML = '📥 Generar y Descargar mr-diff.txt';
    const statusText = document.createElement('div');
    statusText.className = 'tm-gl-status-text';
    sectionExport.appendChild(actionDownloadBtn);
    sectionExport.appendChild(statusText);

    const quickJumpToViewer = document.createElement('a');
    quickJumpToViewer.href = '#';
    quickJumpToViewer.style.textAlign = 'center';
    quickJumpToViewer.style.fontSize = '12px';
    quickJumpToViewer.style.fontWeight = '700';
    quickJumpToViewer.textContent = '👉 Saltar directo a importar / pegar la review';
    sectionExport.appendChild(quickJumpToViewer);

    body.appendChild(sectionExport);

    // ==========================================
    // PESTAÑA B: VISOR INTERACTIVO
    // ==========================================
    const sectionViewer = document.createElement('div');
    sectionViewer.className = 'tm-gl-section tm-gl-hidden';

    const importDiv = document.createElement('div');
    importDiv.style.display = 'flex';
    importDiv.style.flexDirection = 'column';
    importDiv.style.gap = '8px';
    const importBtn = document.createElement('button');
    importBtn.type = 'button';
    importBtn.className = 'tm-gl-btn-action';
    importBtn.textContent = '📋 Pegar e Importar Review de Gemini';
    const errorDiv = document.createElement('div');
    errorDiv.style.color = '#f87171';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.textAlign = 'center';
    errorDiv.className = 'tm-gl-hidden';
    importDiv.appendChild(importBtn);
    importDiv.appendChild(errorDiv);

    const quickJumpToExport = document.createElement('a');
    quickJumpToExport.href = '#';
    quickJumpToExport.style.textAlign = 'center';
    quickJumpToExport.style.fontSize = '12px';
    quickJumpToExport.style.fontWeight = '700';
    quickJumpToExport.textContent = '⬅ Volver a descargar o cambiar configuración del Diff';
    importDiv.appendChild(quickJumpToExport);

    sectionViewer.appendChild(importDiv);

    const viewerDiv = document.createElement('div');
    viewerDiv.className = 'tm-gl-hidden';
    viewerDiv.style.display = 'flex';
    viewerDiv.style.flexDirection = 'column';
    viewerDiv.style.gap = '10px';
    viewerDiv.style.height = '100%';

    const stickyTopDiv = document.createElement('div');
    stickyTopDiv.className = 'tm-gl-sticky-top';
    const navDiv = document.createElement('div');
    navDiv.className = 'tm-gl-nav';
    const prevBtn = document.createElement('button');
    prevBtn.className = 'tm-gl-btn-action';
    prevBtn.textContent = '◀ Ant';

    const centerControlDiv = document.createElement('div');
    centerControlDiv.style.display = 'flex';
    centerControlDiv.style.flexDirection = 'column';
    centerControlDiv.style.alignItems = 'center';
    centerControlDiv.style.gap = '4px';
    const counterSpan = document.createElement('span');
    counterSpan.style.fontWeight = '700';
    counterSpan.style.fontSize = '14px';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'tm-gl-btn-reset';
    resetBtn.textContent = '🔄 Cambiar JSON / Reiniciar';
    centerControlDiv.appendChild(counterSpan);
    centerControlDiv.appendChild(resetBtn);
    const nextBtn = document.createElement('button');
    nextBtn.className = 'tm-gl-btn-action';
    nextBtn.textContent = 'Sig ▶';
    navDiv.appendChild(prevBtn);
    navDiv.appendChild(centerControlDiv);
    navDiv.appendChild(nextBtn);

    const filtersBar = document.createElement('div');
    filtersBar.className = 'tm-gl-filters-bar';
    const filterAll = document.createElement('button');
    filterAll.className = 'tm-gl-filter-btn active';
    filterAll.textContent = 'Todos (0)';
    const filterPending = document.createElement('button');
    filterPending.className = 'tm-gl-filter-btn';
    filterPending.textContent = 'Pendientes (0)';
    const filterReviewed = document.createElement('button');
    filterReviewed.className = 'tm-gl-filter-btn';
    filterReviewed.textContent = 'Revisados (0)';
    const filterIgnored = document.createElement('button');
    filterIgnored.className = 'tm-gl-filter-btn';
    filterIgnored.textContent = 'Ignorados (0)';
    filtersBar.appendChild(filterAll);
    filtersBar.appendChild(filterPending);
    filtersBar.appendChild(filterReviewed);
    filtersBar.appendChild(filterIgnored);

    stickyTopDiv.appendChild(navDiv);
    stickyTopDiv.appendChild(filtersBar);
    viewerDiv.appendChild(stickyTopDiv);

    const card = document.createElement('div');
    card.className = 'tm-gl-card';
    const badge = document.createElement('span');
    const pathDiv = document.createElement('div');
    pathDiv.className = 'tm-gl-path';
    const msgDiv = document.createElement('div');
    msgDiv.style.fontWeight = '500';
    msgDiv.style.lineHeight = '1.4';
    const codeContainer = document.createElement('div');
    codeContainer.className = 'tm-gl-code-container';
    const codePre = document.createElement('code');
    codePre.className = 'tm-gl-code';
    codeContainer.appendChild(codePre);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'tm-gl-actions';
    const btnPending = document.createElement('button');
    btnPending.className = 'tm-gl-state-btn pending';
    btnPending.textContent = 'Pendiente';
    const btnReviewed = document.createElement('button');
    btnReviewed.className = 'tm-gl-state-btn reviewed';
    btnReviewed.textContent = 'Revisado';
    const btnIgnored = document.createElement('button');
    btnIgnored.className = 'tm-gl-state-btn ignored';
    btnIgnored.textContent = 'Ignorado';
    actionsDiv.appendChild(btnPending);
    actionsDiv.appendChild(btnReviewed);
    actionsDiv.appendChild(btnIgnored);

    card.appendChild(badge);
    card.appendChild(pathDiv);
    card.appendChild(msgDiv);
    card.appendChild(codeContainer);
    card.appendChild(actionsDiv);
    viewerDiv.appendChild(card);
    sectionViewer.appendChild(viewerDiv);

    body.appendChild(sectionViewer);

    const resizer = document.createElement('div');
    resizer.id = 'tm-gl-resizer';
    panel.appendChild(resizer);

    panel.appendChild(header);
    panel.appendChild(tabNav);
    panel.appendChild(body);
    document.body.appendChild(panel);

    // ==========================================
    // MANEJADORES DE CONFIGURACIÓN
    // ==========================================

    btnFormatJson.addEventListener('click', () => {
      btnFormatJson.classList.add('active');
      btnFormatHuman.classList.remove('active');
      activeFormatMode = 'json';
    });
    btnFormatHuman.addEventListener('click', () => {
      btnFormatHuman.classList.add('active');
      btnFormatJson.classList.remove('active');
      activeFormatMode = 'human';
    });

    btnDetailBasic.addEventListener('click', () => {
      btnDetailBasic.classList.add('active');
      btnDetailExhaustive.classList.remove('active');
      activeDetailMode = 'basic';
    });
    btnDetailExhaustive.addEventListener('click', () => {
      btnDetailExhaustive.classList.add('active');
      btnDetailBasic.classList.remove('active');
      activeDetailMode = 'exhaustive';
    });

    tokenInput.addEventListener('input', () => {
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenInput.value.trim());
    });

    function switchTab(target) {
      if (target === 'export') {
        tabBtnExport.classList.add('active');
        tabBtnViewer.classList.remove('active');
        sectionExport.classList.remove('tm-gl-hidden');
        sectionViewer.classList.add('tm-gl-hidden');
      } else {
        tabBtnExport.classList.remove('active');
        tabBtnViewer.classList.add('active');
        sectionExport.classList.add('tm-gl-hidden');
        sectionViewer.classList.remove('tm-gl-hidden');
      }
    }
    tabBtnExport.addEventListener('click', () => switchTab('export'));
    tabBtnViewer.addEventListener('click', () => switchTab('viewer'));
    quickJumpToViewer.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('viewer');
    });
    quickJumpToExport.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('export');
    });

    function fetchFileRawContent(baseUrl, token, projectPath, filePath) {
      return new Promise((resolve) => {
        const rawUrl = `${baseUrl}/api/v4/projects/${projectPath}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${window.gl?.mrWidgetData?.source_branch || 'develop'}`;
        GM_xmlhttpRequest({
          method: 'GET',
          url: rawUrl,
          headers: {'PRIVATE-TOKEN': token},
          onload: (res) => resolve(res.status === 200 ? res.responseText : null),
          onerror: () => resolve(null),
        });
      });
    }

    actionDownloadBtn.addEventListener('click', async () => {
      const token = tokenInput.value.trim();
      if (!token) {
        statusText.style.color = '#f87171';
        statusText.textContent = '❌ Error: Falta tu Private Token.';
        return;
      }

      const urlContext = parseGitLabUrl();
      if (!urlContext) {
        statusText.style.color = '#f87171';
        statusText.textContent = '❌ ID de MR ilegible.';
        return;
      }

      statusText.style.color = '#3794ff';
      statusText.textContent = `⏳ Conectando con GitLab (Estrategia: ${activeDetailMode === 'basic' ? 'Básica' : 'Exhaustiva'})...`;
      actionDownloadBtn.disabled = true;

      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/v4/projects/${urlContext.projectPath}/merge_requests/${urlContext.mrIid}/changes`;

      GM_xmlhttpRequest({
        method: 'GET',
        url: apiUrl,
        headers: {'PRIVATE-TOKEN': token},
        onload: async function (response) {
          if (response.status >= 200 && response.status < 300) {
            try {
              const mrData = JSON.parse(response.responseText);
              let fileContent = `review --${activeFormatMode}\n\n`;
              fileContent += `# Code Review: MR !${urlContext.mrIid}\n\n`;
              fileContent += `**Título:** ${mrData.title}\n`;
              fileContent += `**Descripción:**\n${mrData.description || 'Sin descripción'}\n\n`;
              fileContent += `---\n\n`;

              for (let i = 0; i < mrData.changes.length; i++) {
                const change = mrData.changes[i];
                statusText.textContent = `⏳ Procesando [${i + 1}/${mrData.changes.length}]: ${change.new_path}...`;

                fileContent += `### 📄 Archivo: \`${change.new_path}\`\n`;
                if (change.new_file) fileContent += `*(Nuevo archivo)*\n`;
                if (change.deleted_file) fileContent += `*(Archivo eliminado)*\n`;

                // 1. Excluir package-lock.json por tamaño para no saturar el prompt
                if (change.new_path.endsWith('package-lock.json')) {
                  fileContent += `*(Contenido omitido por tamaño)*\n\n\`\`\`diff\n${change.diff}\n\`\`\`\n\n`;
                  continue;
                }

                // 2. Incluir SIEMPRE el Diff unificado para aislar los cambios del MR actual
                fileContent += `#### 🛠️ Cambios Introducidos (Diff):\n\`\`\`diff\n${change.diff}\n\`\`\`\n\n`;

                // 3. Si es modo exhaustivo y el archivo no se ha borrado, adjuntar el código completo abajo como Contexto
                if (activeDetailMode === 'exhaustive' && !change.deleted_file) {
                  const rawCode = await fetchFileRawContent(baseUrl, token, urlContext.projectPath, change.new_path);
                  if (rawCode) {
                    fileContent += `#### 🔍 Contexto Completo del Archivo (Solo lectura):\n\`\`\`typescript\n${rawCode}\n\`\`\`\n\n`;
                  }
                }

                fileContent += `---\n\n`;
              }

              const blob = new Blob([fileContent], {type: 'text/plain;charset=utf-8'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mr-${urlContext.mrIid}-${activeDetailMode}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              statusText.style.color = '#4ade80';
              statusText.textContent = `✅ ¡Descargado con éxito en modo ${activeDetailMode}!`;
            } catch (err) {
              statusText.style.color = '#f87171';
              statusText.textContent = '❌ Error al parsear cambios.';
            }
          } else {
            statusText.style.color = '#f87171';
            statusText.textContent = `❌ Error API (${response.status})`;
          }
          actionDownloadBtn.disabled = false;
        },
        onerror: function () {
          actionDownloadBtn.disabled = false;
          statusText.style.color = '#f87171';
          statusText.textContent = '❌ Error crítico de conexión.';
        },
      });
    });

    // Importación del JSON en el visor interactivo
    importBtn.addEventListener('click', async () => {
      errorDiv.classList.add('tm-gl-hidden');
      try {
        let text = await navigator.clipboard.readText();
        text = text.trim().replace(/\u00A0/g, ' ');

        const firstOpenBrace = text.indexOf('{');
        const lastCloseBrace = text.lastIndexOf('}');
        if (firstOpenBrace === -1 || lastCloseBrace === -1 || lastCloseBrace < firstOpenBrace) throw new Error();

        const cleanJsonText = text.substring(firstOpenBrace, lastCloseBrace + 1);
        const data = JSON.parse(cleanJsonText);

        if (!data.suggestions || !Array.isArray(data.suggestions)) throw new Error();

        suggestions = data.suggestions.map((s) => ({...s, state: 'pending'}));
        if (suggestions.length === 0) {
          errorDiv.textContent = 'La revisión está vacía (0 sugerencias).';
          errorDiv.classList.remove('tm-gl-hidden');
          return;
        }

        importDiv.classList.add('tm-gl-hidden');
        viewerDiv.classList.remove('tm-gl-hidden');
        currentFilter = 'all';
        currentIndex = 0;
        applyFilterAndRender();
      } catch (err) {
        errorDiv.textContent = '❌ El portapapeles no tiene un objeto JSON válido. Asegúrate de copiar la respuesta estructurada completa de ARIA.';
        errorDiv.classList.remove('tm-gl-hidden');
      }
    });

    function updateCounters() {
      const total = suggestions.length;
      const pending = suggestions.filter((s) => s.state === 'pending').length;
      const reviewed = suggestions.filter((s) => s.state === 'reviewed').length;
      const ignored = suggestions.filter((s) => s.state === 'ignored').length;

      filterAll.textContent = `Todos (${total})`;
      filterPending.textContent = `Pendientes (${pending})`;
      filterReviewed.textContent = `Revisados (${reviewed})`;
      filterIgnored.textContent = `Ignorados (${ignored})`;
    }

    function applyFilterAndRender() {
      filteredSuggestions = currentFilter === 'all' ? [...suggestions] : suggestions.filter((s) => s.state === currentFilter);
      updateCounters();
      if (currentIndex >= filteredSuggestions.length) currentIndex = Math.max(0, filteredSuggestions.length - 1);
      renderSuggestion();
    }

    function renderSuggestion() {
      if (filteredSuggestions.length === 0) {
        counterSpan.textContent = '0 / 0';
        badge.className = 'tm-gl-hidden';
        pathDiv.textContent = '';
        msgDiv.textContent = 'No existen incidencias en este filtro.';
        codeContainer.classList.add('tm-gl-hidden');
        actionsDiv.classList.add('tm-gl-hidden');
        return;
      }

      actionsDiv.classList.remove('tm-gl-hidden');
      const item = filteredSuggestions[currentIndex];

      counterSpan.textContent = `${currentIndex + 1} / ${filteredSuggestions.length}`;
      badge.textContent = item.severity;
      badge.className = `tm-gl-badge ${item.severity.toLowerCase()}`;
      pathDiv.textContent = `📁 ${item.filePath} ${item.line ? '(Línea ' + item.line + ')' : ''}`;
      msgDiv.textContent = item.message;

      if (item.suggestion && item.suggestion.trim() !== '') {
        codePre.innerHTML = highlightCode(item.suggestion);
        codeContainer.classList.remove('tm-gl-hidden');
        codeContainer.scrollLeft = 0;
        codeContainer.scrollLeft = 0;
      } else {
        codeContainer.classList.add('tm-gl-hidden');
      }

      btnPending.classList.remove('active');
      btnReviewed.classList.remove('active');
      btnIgnored.classList.remove('active');
      if (item.state === 'pending') btnPending.classList.add('active');
      if (item.state === 'reviewed') btnReviewed.classList.add('active');
      if (item.state === 'ignored') btnIgnored.classList.add('active');
    }

    pathDiv.addEventListener('click', () => {
      if (filteredSuggestions.length === 0) return;
      const item = filteredSuggestions[currentIndex];
      let targetEl =
        document.querySelector(`[data-blob-diff-path*="${item.filePath}"]`) || document.querySelector(`[data-page-path*="${item.filePath}"]`);

      if (!targetEl) {
        const selectors = ['.file-title-name', '.diff-file .file-header', '.file-header', '.file-name'];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          for (let el of elements) {
            const cleanDomText = el.textContent.trim();
            if (cleanDomText && (cleanDomText.includes(item.filePath) || item.filePath.includes(cleanDomText))) {
              targetEl = el;
              break;
            }
          }
          if (targetEl) break;
        }
      }

      if (targetEl) targetEl.scrollIntoView({behavior: 'smooth', block: 'center'});
    });

    function updateState(newState) {
      if (filteredSuggestions.length === 0) return;
      filteredSuggestions[currentIndex].state = newState;
      applyFilterAndRender();
    }

    btnPending.addEventListener('click', () => updateState('pending'));
    btnReviewed.addEventListener('click', () => updateState('reviewed'));
    btnIgnored.addEventListener('click', () => updateState('ignored'));

    prevBtn.addEventListener('click', () => {
      if (filteredSuggestions.length > 0) {
        currentIndex = (currentIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length;
        renderSuggestion();
      }
    });
    nextBtn.addEventListener('click', () => {
      if (filteredSuggestions.length > 0) {
        currentIndex = (currentIndex + 1) % filteredSuggestions.length;
        renderSuggestion();
      }
    });

    function setFilter(filterType, activeBtn) {
      document.querySelectorAll('.tm-gl-filter-btn').forEach((b) => b.classList.remove('active'));
      activeBtn.classList.add('active');
      currentFilter = filterType;
      currentIndex = 0;
      applyFilterAndRender();
    }

    filterAll.addEventListener('click', () => setFilter('all', filterAll));
    filterPending.addEventListener('click', () => setFilter('pending', filterPending));
    filterReviewed.addEventListener('click', () => setFilter('reviewed', filterReviewed));
    filterIgnored.addEventListener('click', () => setFilter('ignored', filterIgnored));

    resetBtn.addEventListener('click', () => {
      if (confirm('¿Quieres resetear el visor para cargar un nuevo JSON de ARIA?')) {
        suggestions = [];
        filteredSuggestions = [];
        currentIndex = 0;
        currentFilter = 'all';
        viewerDiv.classList.add('tm-gl-hidden');
        importDiv.classList.remove('tm-gl-hidden');
        document.querySelectorAll('.tm-gl-filter-btn').forEach((b) => b.classList.remove('active'));
        filterAll.classList.add('active');
      }
    });

    setupDraggableAndResizable(panel, header, resizer, PANEL_POS_KEY, PANEL_SIZE_KEY);
    setupDraggableAndResizable(btn, btn, null, BTN_POS_KEY, null, true);

    btn.addEventListener('click', () => {
      if (btn.dataset.dragged === 'true') {
        btn.dataset.dragged = 'false';
        return;
      }
      panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    });
    document.getElementById('tm-gl-close').addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  function setupDraggableAndResizable(element, dragHandle, resizeHandle, posKey, sizeKey, isButton = false) {
    let isDragging = false,
      isResizing = false,
      hasMoved = false;
    let startX, startY, startWidth, startHeight;

    const savedPos = localStorage.getItem(posKey);
    if (savedPos) {
      try {
        const pos = JSON.parse(savedPos);
        if (parseInt(pos.left) >= 0 && parseInt(pos.top) >= 0 && parseInt(pos.left) < window.innerWidth && parseInt(pos.top) < window.innerHeight) {
          element.style.bottom = 'auto';
          element.style.right = 'auto';
          element.style.left = pos.left;
          element.style.top = pos.top;
        } else {
          resetPosition();
        }
      } catch (e) {
        resetPosition();
      }
    } else {
      resetPosition();
    }

    function resetPosition() {
      if (isButton) {
        element.style.bottom = '80px';
        element.style.right = '20px';
        element.style.top = 'auto';
        element.style.left = 'auto';
      } else {
        element.style.top = '120px';
        element.style.right = '20px';
        element.style.bottom = 'auto';
        element.style.left = 'auto';
      }
    }

    dragHandle.addEventListener('mousedown', (e) => {
      if (e.target.id === 'tm-gl-close' || e.target.classList.contains('tm-gl-tab-btn') || e.target.classList.contains('tm-gl-segment-btn')) return;
      isDragging = true;
      hasMoved = false;
      const rect = element.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      element.style.bottom = 'auto';
      element.style.right = 'auto';
      element.style.left = rect.left + 'px';
      element.style.top = rect.top + 'px';
    });

    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        startX = e.clientX;
        startY = e.clientY;
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        hasMoved = true;
        let x = Math.max(0, Math.min(e.clientX - startX, window.innerWidth - element.offsetWidth));
        let y = Math.max(0, Math.min(e.clientY - startY, window.innerHeight - element.offsetHeight));
        element.style.left = x + 'px';
        element.style.top = y + 'px';
      } else if (isResizing) {
        let w = Math.max(400, startWidth + (e.clientX - startX));
        let h = Math.max(400, startHeight + (e.clientY - startY));
        element.style.width = w + 'px';
        element.style.height = h + 'px';
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (hasMoved) {
          if (isButton) element.dataset.dragged = 'true';
          localStorage.setItem(posKey, JSON.stringify({left: element.style.left, top: element.style.top}));
        }
      }
      if (isResizing) {
        isResizing = false;
        if (sizeKey) localStorage.setItem(sizeKey, JSON.stringify({width: element.style.width, height: element.style.height}));
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI);
  else initUI();
})();
