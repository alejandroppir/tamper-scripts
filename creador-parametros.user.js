// ==UserScript==
// @name         Creador Masivo de Parámetros
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @version      2.5.1
// @description  Automatización de altas. Recreación de iframe por iteración para evitar bloqueos de caché.
// @match        http://exaplicaciones/rpos015/*
// @match        http://ecaplicaciones/rpos015/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) return;

  const CONFIG = {
    COLOR_PRIMARIO: '#276466',
    COLOR_SECUNDARIO: '#1e4f51',
    BTN_POS_KEY: 'tm_param_btn_pos',
    PANEL_POS_KEY: 'tm_param_panel_pos',
    DELAY_ENTRE_PETICIONES: 1000,
    DELAY_PASOS: 300,
  };

  let diccGrupos = {};
  let stateData = [];

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

  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

  function getWorkerIframe() {
    let oldIframe = document.getElementById('tm-param-worker');
    if (oldIframe) {
      oldIframe.remove();
    }

    const workerIframe = document.createElement('iframe');
    workerIframe.id = 'tm-param-worker';
    workerIframe.name = 'tm-param-worker';
    workerIframe.sandbox = 'allow-scripts allow-forms allow-same-origin';

    const isDebug = document.getElementById('tm-debug-mode') && document.getElementById('tm-debug-mode').checked;
    if (isDebug) {
      workerIframe.style.display = 'block';
      workerIframe.style.position = 'fixed';
      workerIframe.style.bottom = '10px';
      workerIframe.style.left = '10px';
      workerIframe.style.width = '750px';
      workerIframe.style.height = '500px';
      workerIframe.style.zIndex = '9999999';
      workerIframe.style.border = '4px solid #0369a1';
      workerIframe.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
      workerIframe.style.backgroundColor = '#fff';
    } else {
      workerIframe.style.display = 'none';
    }

    document.body.appendChild(workerIframe);
    return workerIframe;
  }

  function initUI() {
    if (document.getElementById('tm-param-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
            #tm-param-panel, #tm-param-btn { font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; }
            #tm-param-btn { display: flex; align-items: center; gap: 8px; position: fixed; z-index: 999999; padding: 10px 16px; background: ${CONFIG.COLOR_PRIMARIO}; color: white; border-radius: 100px; cursor: pointer; font-weight: 600; font-size: 13px; box-shadow: 0 4px 6px rgba(39,100,102,0.3); user-select: none; }
            #tm-param-btn:hover { background: ${CONFIG.COLOR_SECUNDARIO}; }
            #tm-param-panel { position: fixed; width: 900px; height: 600px; min-width: 500px; min-height: 400px; background: #f8fafb; border-radius: 12px; z-index: 999998; display: none; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; resize: both; border: 1px solid #e2e8f0; }
            #tm-param-header { background: linear-gradient(135deg, ${CONFIG.COLOR_PRIMARIO} 0%, ${CONFIG.COLOR_SECUNDARIO} 100%); color: white; padding: 14px 20px; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between; align-items: center; cursor: grab; flex-shrink: 0; }
            #tm-param-header:active { cursor: grabbing; }
            #tm-param-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; flex-grow: 1; overflow: hidden; }
            .tm-textarea { width: 100%; height: 60px; font-family: monospace; font-size: 11px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; resize: vertical; }
            .tm-textarea:focus { border-color: ${CONFIG.COLOR_PRIMARIO}; outline: none; }
            .tm-actions-bar { display: flex; gap: 10px; align-items: center; }
            .tm-btn { background: ${CONFIG.COLOR_PRIMARIO}; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 12px; white-space: nowrap; }
            .tm-btn:hover { background: ${CONFIG.COLOR_SECUNDARIO}; }
            .tm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            .tm-btn-secondary { background: #e2e8f0; color: #475569; }
            .tm-btn-secondary:hover { background: #cbd5e1; }
            .tm-btn-action { background: #059669; }
            .tm-btn-action:hover { background: #047857; }
            .tm-table-container { flex-grow: 1; overflow-y: auto; background: white; border: 1px solid #e2e8f0; border-radius: 8px; }
            .tm-table { width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; }
            .tm-table th { background: #f1f5f9; padding: 8px; position: sticky; top: 0; color: #475569; border-bottom: 1px solid #cbd5e1; z-index: 10; }
            .tm-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: 250px; }
            .tm-badge { padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            .tm-bg-pending { background: #fef3c7; color: #92400e; }
            .tm-bg-loading { background: #e0f2fe; color: #0369a1; }
            .tm-bg-ok { background: #dcfce7; color: #166534; }
            .tm-bg-error { background: #fee2e2; color: #991b1b; }
            .no-drag { cursor: pointer; }

            .tm-is-dragging iframe { pointer-events: none !important; }
        `;
    document.head.appendChild(style);

    const btn = document.createElement('div');
    btn.id = 'tm-param-btn';
    btn.innerHTML = `${logoSvg} <span>Creador Parámetros</span>`;
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'tm-param-panel';
    panel.innerHTML = `
            <div id="tm-param-header">
                <div style="display:flex; align-items:center; gap:8px; pointer-events:none;">${logoSvg} Creador Masivo de Parámetros</div>
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
                            <input type="checkbox" id="tm-debug-mode" class="no-drag" checked> 🐛 Ver Iframe de Trabajo (Debug)
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
                        <tbody id="tm-table-body">
                            <tr><td colspan="5" style="text-align:center; padding: 20px; color:#94a3b8;">Sin datos. Carga un CSV.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    document.body.appendChild(panel);

    getWorkerIframe(); // Inicializar estado del iframe oculto

    document.getElementById('tm-debug-mode').addEventListener('change', (e) => {
      const workerIframe = document.getElementById('tm-param-worker');
      if (workerIframe) {
        if (e.target.checked) {
          workerIframe.style.display = 'block';
          workerIframe.style.position = 'fixed';
          workerIframe.style.bottom = '10px';
          workerIframe.style.left = '10px';
          workerIframe.style.width = '750px';
          workerIframe.style.height = '500px';
          workerIframe.style.zIndex = '9999999';
          workerIframe.style.border = '4px solid #0369a1';
          workerIframe.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
          workerIframe.style.backgroundColor = '#fff';
        } else {
          workerIframe.style.display = 'none';
        }
      }
    });

    GestorUI.configurarArrastre(btn, btn, CONFIG.BTN_POS_KEY, true, {bottom: '80px', right: '20px', top: 'auto', left: 'auto'});
    GestorUI.configurarArrastre(panel, document.getElementById('tm-param-header'), CONFIG.PANEL_POS_KEY, false, {
      top: '50px',
      right: '50px',
      bottom: 'auto',
      left: 'auto',
    });

    btn.addEventListener('click', (e) => {
      if (btn.dataset.dragged === 'true') {
        btn.dataset.dragged = 'false';
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    });

    document.getElementById('tm-param-close').addEventListener('click', () => (panel.style.display = 'none'));
    document.getElementById('tm-clear-btn').addEventListener('click', () => {
      stateData = [];
      renderTable();
    });

    document.getElementById('tm-scan-btn').addEventListener('click', () => {
      let countNuevos = 0;
      function buscarEnDocumento(doc) {
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
              buscarEnDocumento(f.contentDocument || f.contentWindow.document);
            } catch (e) {}
          });
        } catch (e) {}
      }
      buscarEnDocumento(window.top.document);
      alert(`Escaneo completado.\nNuevos grupos encontrados: ${countNuevos}.\nTotal en memoria: ${Object.keys(diccGrupos).length}.`);
      console.log('Diccionario de grupos actualizado:', diccGrupos);
    });

    document.getElementById('tm-load-btn').addEventListener('click', () => {
      const csvText = document.getElementById('tm-csv-input').value.trim();
      if (!csvText) return;

      const lineas = csvText.split('\n');
      lineas.forEach((linea) => {
        const cols = linea.split(';');
        if (cols.length >= 6) {
          const grupoRaw = cols[0].trim();
          const isNumeric = /^\d+$/.test(grupoRaw);
          const idGrupoEncontrado = isNumeric ? grupoRaw : diccGrupos[grupoRaw];

          stateData.push({
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
      document.getElementById('tm-csv-input').value = '';
      renderTable();
    });

    document.getElementById('tm-process-all-btn').addEventListener('click', async () => {
      const btnProcesar = document.getElementById('tm-process-all-btn');
      btnProcesar.disabled = true;
      btnProcesar.innerText = '⏳ Procesando...';

      for (let i = 0; i < stateData.length; i++) {
        if (stateData[i].status === 'pending') {
          await ejecutarAlta(i);
          console.log(`Pausa de ${CONFIG.DELAY_ENTRE_PETICIONES}ms entre peticiones...`);
          await new Promise((r) => setTimeout(r, CONFIG.DELAY_ENTRE_PETICIONES));
        }
      }

      btnProcesar.disabled = false;
      btnProcesar.innerText = '🚀 Iniciar Creación Masiva';
    });

    function renderTable() {
      const tbody = document.getElementById('tm-table-body');
      const btnProcesar = document.getElementById('tm-process-all-btn');

      if (stateData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#94a3b8;">Sin datos. Carga un CSV.</td></tr>';
        btnProcesar.disabled = true;
        return;
      }

      let html = '';
      let hayPendientes = false;

      stateData.forEach((row) => {
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
      btnProcesar.disabled = !hayPendientes;
    }

    async function ejecutarAlta(index) {
      const row = stateData[index];
      row.status = 'loading';
      renderTable();

      console.log(`\n=== INICIANDO ÍTEM [${index}]: ${row.nombreParam} ===`);

      return new Promise((resolve) => {
        const iframe = getWorkerIframe();
        let etapa = 0;
        let baseUrl = window.location.origin;

        const elementosUrl = `${baseUrl}/RPOS015/RPOS015M_Elementos.aspx?TI=PARAMETRO_CONF&Ip=${row.idGrupo}&Rl=249&_t=${Date.now()}`;
        console.log(`Fase 0: GET a Elementos.aspx para extraer VIEWSTATE -> ${elementosUrl}`);
        iframe.src = elementosUrl;

        let timerSeguridad = setTimeout(() => {
          clearInterval(intervalo);
          row.status = 'error';
          row.info = 'Timeout excedido (45s).';
          renderTable();
          console.error(`Timeout en el procesamiento del ítem [${index}].`);
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
                console.log('Resultado: OK. Parámetro creado.');
              } else {
                row.status = 'error';
                let errorCorto = textoRes.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                row.info = errorCorto.length > 70 ? errorCorto.substring(0, 70) + '...' : errorCorto;
                console.log('Resultado: Error del servidor ->', errorCorto);
              }

              renderTable();
              console.log(`=== FIN ÍTEM [${index}] ===\n`);
              return resolve();
            }

            if (doc.readyState !== 'complete') return;

            if (etapa === 0) {
              const vsInput = doc.getElementById('__VIEWSTATE');
              const vsgInput = doc.getElementById('__VIEWSTATEGENERATOR');

              if (!vsInput || !vsgInput) return;

              row.info = '1/4: Extrayendo VIEWSTATE. Lanzando POST directo...';
              renderTable();
              console.log('Fase 1: VIEWSTATE obtenido. Construyendo formulario POST a FormularioAccion.aspx');

              const viewState = vsInput.value;
              const viewStateGen = vsgInput.value;

              const form = doc.createElement('form');
              form.method = 'POST';
              form.action = 'RPOS015M_FormularioAccion.aspx';

              const sUrlVal = `?Ac=A - Alta de Item (Programador)&NombreAccion=ALTA_SUBC_PC&TI=PARAMETRO_CONF&Ip=${row.idGrupo}&Rl=249`;

              const inputs = {
                __VIEWSTATE: viewState,
                __VIEWSTATEGENERATOR: viewStateGen,
                __VIEWSTATEENCRYPTED: '',
                sUrl: sUrlVal,
                sPagina: 'RPOS015M_FormularioAccion.aspx',
              };

              for (const key in inputs) {
                const hiddenField = doc.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = key;
                hiddenField.value = inputs[key];
                form.appendChild(hiddenField);
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

              row.info = `2/4: Formulario cargado. Asignando Proyecto (pausa ${CONFIG.DELAY_PASOS}ms)...`;
              renderTable();
              console.log(`Fase 2: FormularioAccion cargado. Asignando proyecto ${row.proyecto}.`);

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
                renderTable();
                console.error(`Error: Proyecto no encontrado.`);
                return resolve();
              }

              doc.__tm_timer = Date.now();
              etapa = 2;
            } else if (etapa === 2) {
              if (Date.now() - doc.__tm_timer < CONFIG.DELAY_PASOS) return;

              row.info = `3/4: Rellenando textos (pausa ${CONFIG.DELAY_PASOS}ms)...`;
              renderTable();
              console.log('Fase 3: Rellenando campos de texto.');

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

              row.info = '4/4: Click en Aceptar...';
              renderTable();
              console.log('Fase 4: Ejecutando click en btnAceptar.');

              if (typeof win.btnAceptar_Click === 'function')
                win.btnAceptar_Click = function () {
                  return true;
                };
              if (typeof win.Page_ClientValidate === 'function')
                win.Page_ClientValidate = function () {
                  return true;
                };

              doc.__tm_old = true;
              etapa = 4;

              const btnAceptar = doc.getElementById('btnAceptar');
              if (btnAceptar) btnAceptar.click();
            } else if (etapa === 4) {
              if (doc.__tm_old) {
                const valSummary = doc.querySelector('.validation-summary');
                if (
                  valSummary &&
                  valSummary.innerText.trim() !== '' &&
                  valSummary.style.display !== 'none' &&
                  valSummary.style.visibility !== 'hidden'
                ) {
                  clearTimeout(timerSeguridad);
                  clearInterval(intervalo);
                  row.status = 'error';
                  row.info = 'Validación local: ' + valSummary.innerText.trim().replace(/\n/g, ' ');
                  console.error(`Error de validación: ${valSummary.innerText.trim()}`);
                  renderTable();
                  return resolve();
                }
              }
            }
          } catch (e) {}
        }, 500);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI);
  else initUI();
})();
