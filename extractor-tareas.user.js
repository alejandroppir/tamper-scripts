// ==UserScript==
// @name         Extractor de Tareas de Proyectos ODEENE
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.0
// @description  Consulta asíncrona de datos de proyectos para ODEENE
// @match        *://ecaplicaciones/RPOSAA0311/*
// @match        file:///*
// @include      *ecaplicaciones/RPOSAA0311*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/extractor-tareas.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/extractor-tareas.user.js
// ==/UserScript==

(function () {
  'use strict';

  // =========================================================================
  // 1. CONFIGURACIÓN GLOBAL
  // =========================================================================
  const CONFIG = {
    DELAY_MS: 800,
    COLOR_PRIMARIO: '#376466',
    COLOR_SECUNDARIO: '#284d4f',
    STORAGE_KEY: 'tm_extractor_state',
    BTN_POS_KEY: 'tm_ext_btn_position',
    PANEL_POS_KEY: 'tm_ext_panel_position',

    ENABLE_WEBHOOK: false,
    GOOGLE_CHAT_WEBHOOK:
      'https://chat.googleapis.com/v1/spaces/AAQAA70Cbeo/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=6-fn-GZNSeECQH1QpjAOSLLfBRnA-RZxmfiBxq_-4QY',
  };

  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 492.6 430.7"><g><circle fill="currentColor" cx="117" cy="233.4" r="9.3"/><circle fill="currentColor" cx="141.1" cy="233.4" r="9.3"/><circle fill="currentColor" cx="165.2" cy="233.4" r="9.3"/><circle fill="currentColor" cx="189.4" cy="233.4" r="9.3"/><circle fill="currentColor" cx="92.9" cy="233.4" r="9.3"/><circle fill="currentColor" cx="68.8" cy="233.4" r="9.3"/><circle fill="currentColor" cx="354.5" cy="233.4" r="9.3"/><circle fill="currentColor" cx="378.6" cy="233.4" r="9.3"/><circle fill="currentColor" cx="402.8" cy="233.4" r="9.3"/><circle fill="currentColor" cx="426.9" cy="233.4" r="9.3"/><circle fill="currentColor" cx="330.4" cy="233.4" r="9.3"/><circle fill="currentColor" cx="306.3" cy="233.4" r="9.3"/><circle fill="currentColor" cx="345.2" cy="255.1" r="9.3"/><circle fill="currentColor" cx="371.4" cy="255.1" r="9.3"/><circle fill="currentColor" cx="396.2" cy="255.3" r="9.3"/><circle fill="currentColor" cx="421.5" cy="255.5" r="9.3"/><circle fill="currentColor" cx="319.5" cy="255.1" r="9.3"/><circle fill="currentColor" cx="293.5" cy="255.1" r="9.3"/><circle fill="currentColor" cx="304.5" cy="273.5" r="9.3"/><circle fill="currentColor" cx="317.2" cy="295.2" r="9.3"/><circle fill="currentColor" cx="333.8" cy="277.8" r="9.3"/><circle fill="currentColor" cx="360.4" cy="278.9" r="9.3"/><circle fill="currentColor" cx="387.3" cy="279.8" r="9.3"/><circle fill="currentColor" cx="375" cy="300.3" r="9.3"/><circle fill="currentColor" cx="402.4" cy="300.6" r="9.3"/><circle fill="currentColor" cx="347.3" cy="299.2" r="9.3"/><circle fill="currentColor" cx="431.2" cy="313.8" r="9.3"/><circle fill="currentColor" cx="128" cy="255.1" r="9.3"/><circle fill="currentColor" cx="152.1" cy="255.1" r="9.3"/><circle fill="currentColor" cx="176.2" cy="255.1" r="9.3"/><circle fill="currentColor" cx="200.3" cy="255.1" r="9.3"/><circle fill="currentColor" cx="103.8" cy="255.1" r="9.3"/><circle fill="currentColor" cx="79.7" cy="255.1" r="9.3"/><circle fill="currentColor" cx="481.2" cy="277.8" r="9.3"/><circle fill="currentColor" cx="459" cy="233.4" r="9.3"/><circle fill="currentColor" cx="455.1" cy="357" r="9.3"/><circle fill="currentColor" cx="387" cy="379.2" r="9.3"/><circle fill="currentColor" cx="387" cy="322" r="9.3"/><circle fill="currentColor" cx="370" cy="337.6" r="9.3"/><circle fill="currentColor" cx="352.3" cy="355.7" r="9.3"/><circle fill="currentColor" cx="339.7" cy="334.2" r="9.3"/><circle fill="currentColor" cx="307" cy="327.1" r="9.3"/><circle fill="currentColor" cx="296.9" cy="308.2" r="9.3"/><circle fill="currentColor" cx="284.1" cy="289.2" r="9.3"/><circle fill="currentColor" cx="271.4" cy="268" r="9.3"/><circle fill="currentColor" cx="248.2" cy="275" r="9.3"/><circle fill="currentColor" cx="222.4" cy="268.6" r="9.3"/><circle fill="currentColor" cx="234.6" cy="293.7" r="9.3"/><circle fill="currentColor" cx="259.5" cy="292.3" r="9.3"/><circle fill="currentColor" cx="211.5" cy="288.6" r="9.3"/><circle fill="currentColor" cx="189.7" cy="273.5" r="9.3"/><circle fill="currentColor" cx="160.8" cy="276.6" r="9.3"/><circle fill="currentColor" cx="133.9" cy="277.9" r="9.3"/><circle fill="currentColor" cx="81.4" cy="277.9" r="9.3"/><circle fill="currentColor" cx="45" cy="238" r="9.3"/><circle fill="currentColor" cx="22.9" cy="270.4" r="9.3"/><circle fill="currentColor" cx="41.7" cy="311.2" r="9.3"/><circle fill="currentColor" cx="121.4" cy="299.7" r="9.3"/><circle fill="currentColor" cx="147.9" cy="299.7" r="9.3"/><circle fill="currentColor" cx="178.4" cy="295.2" r="9.3"/><circle fill="currentColor" cx="166.2" cy="315.2" r="9.3"/><circle fill="currentColor" cx="137.3" cy="319" r="9.3"/><circle fill="currentColor" cx="107.6" cy="320.6" r="9.3"/><circle fill="currentColor" cx="81.9" cy="323.1" r="9.3"/><circle fill="currentColor" cx="82.2" cy="351.5" r="9.3"/><circle fill="currentColor" cx="108.2" cy="359.2" r="9.3"/><circle fill="currentColor" cx="121.6" cy="339.8" r="9.3"/><circle fill="currentColor" cx="154.4" cy="335.1" r="9.3"/><circle fill="currentColor" cx="143.3" cy="355.2" r="9.3"/><circle fill="currentColor" cx="188.4" cy="327.9" r="9.3"/><circle fill="currentColor" cx="176.3" cy="348.4" r="9.3"/><circle fill="currentColor" cx="164.4" cy="367.9" r="9.3"/><circle fill="currentColor" cx="186.3" cy="377.2" r="9.3"/><circle fill="currentColor" cx="198.4" cy="355.7" r="9.3"/><circle fill="currentColor" cx="210.4" cy="337.2" r="9.3"/><circle fill="currentColor" cx="223" cy="315.8" r="9.3"/><circle fill="currentColor" cx="246.6" cy="319.4" r="9.3"/><circle fill="currentColor" cx="272.3" cy="315.8" r="9.3"/><circle fill="currentColor" cx="283.4" cy="337.6" r="9.3"/><circle fill="currentColor" cx="296.5" cy="357" r="9.3"/><circle fill="currentColor" cx="307.6" cy="379.2" r="9.3"/><circle fill="currentColor" cx="335.5" cy="406.1" r="9.3"/><circle fill="currentColor" cx="329.1" cy="367" r="9.3"/><circle fill="currentColor" cx="319.5" cy="348.1" r="9.3"/><circle fill="currentColor" cx="272.3" cy="362.5" r="9.3"/><circle fill="currentColor" cx="259.5" cy="339.8" r="9.3"/><circle fill="currentColor" cx="234.6" cy="340" r="9.3"/><circle fill="currentColor" cx="223" cy="362.5" r="9.3"/><circle fill="currentColor" cx="248.2" cy="363.8" r="9.3"/><circle fill="currentColor" cx="234.6" cy="388.6" r="9.3"/><circle fill="currentColor" cx="284.1" cy="384.4" r="9.3"/><circle fill="currentColor" cx="294.4" cy="408.1" r="9.3"/><circle fill="currentColor" cx="255.3" cy="416.2" r="9.3"/><circle fill="currentColor" cx="220.8" cy="408.1" r="9.3"/><circle fill="currentColor" cx="359.2" cy="317.8" r="9.3"/><circle fill="currentColor" cx="384.4" cy="420.4" r="9.3"/><circle fill="currentColor" cx="107.1" cy="278.6" r="9.3"/><circle fill="currentColor" cx="376.1" cy="185" r="9.3"/><circle fill="currentColor" cx="352" cy="185" r="9.3"/><circle fill="currentColor" cx="327.9" cy="185" r="9.3"/><circle fill="currentColor" cx="303.8" cy="185" r="9.3"/><circle fill="currentColor" cx="400.3" cy="185" r="9.3"/><circle fill="currentColor" cx="424.4" cy="185" r="9.3"/><circle fill="currentColor" cx="138.6" cy="185" r="9.3"/><circle fill="currentColor" cx="114.5" cy="185" r="9.3"/><circle fill="currentColor" cx="90.4" cy="185" r="9.3"/><circle fill="currentColor" cx="66.3" cy="185" r="9.3"/><circle fill="currentColor" cx="162.7" cy="185" r="9.3"/><circle fill="currentColor" cx="186.9" cy="185" r="9.3"/><circle fill="currentColor" cx="148" cy="163.4" r="9.3"/><circle fill="currentColor" cx="121.7" cy="163.4" r="9.3"/><circle fill="currentColor" cx="97" cy="163.1" r="9.3"/><circle fill="currentColor" cx="71.7" cy="162.9" r="9.3"/><circle fill="currentColor" cx="173.7" cy="163.4" r="9.3"/><circle fill="currentColor" cx="199.6" cy="163.4" r="9.3"/><circle fill="currentColor" cx="188.6" cy="144.9" r="9.3"/><circle fill="currentColor" cx="175.9" cy="123.2" r="9.3"/><circle fill="currentColor" cx="164.8" cy="103.3" r="9.3"/><circle fill="currentColor" cx="159.4" cy="140.7" r="9.3"/><circle fill="currentColor" cx="132.7" cy="139.5" r="9.3"/><circle fill="currentColor" cx="105.8" cy="138.6" r="9.3"/><circle fill="currentColor" cx="118.1" cy="118.1" r="9.3"/><circle fill="currentColor" cx="90.7" cy="117.8" r="9.3"/><circle fill="currentColor" cx="145.8" cy="119.2" r="9.3"/><circle fill="currentColor" cx="61.9" cy="104.6" r="9.3"/><circle fill="currentColor" cx="365.2" cy="163.4" r="9.3"/><circle fill="currentColor" cx="341.1" cy="163.4" r="9.3"/><circle fill="currentColor" cx="316.9" cy="163.4" r="9.3"/><circle fill="currentColor" cx="292.8" cy="163.4" r="9.3"/><circle fill="currentColor" cx="389.3" cy="163.4" r="9.3"/><circle fill="currentColor" cx="413.4" cy="163.4" r="9.3"/><circle fill="currentColor" cx="11.9" cy="140.7" r="9.3"/><circle fill="currentColor" cx="34.1" cy="185" r="9.3"/><circle fill="currentColor" cx="38" cy="61.5" r="9.3"/><circle fill="currentColor" cx="133.9" cy="99" r="9.3"/><circle fill="currentColor" cx="106.1" cy="96.4" r="9.3"/><circle fill="currentColor" cx="123.1" cy="80.8" r="9.3"/><circle fill="currentColor" cx="140.9" cy="62.7" r="9.3"/><circle fill="currentColor" cx="153.4" cy="84.2" r="9.3"/><circle fill="currentColor" cx="186.1" cy="91.3" r="9.3"/><circle fill="currentColor" cx="196.2" cy="110.2" r="9.3"/><circle fill="currentColor" cx="209" cy="129.2" r="9.3"/><circle fill="currentColor" cx="221.7" cy="150.4" r="9.3"/><circle fill="currentColor" cx="246.8" cy="145.2" r="9.3"/><circle fill="currentColor" cx="270.7" cy="149.8" r="9.3"/><circle fill="currentColor" cx="258.5" cy="124.7" r="9.3"/><circle fill="currentColor" cx="233.7" cy="126.2" r="9.3"/><circle fill="currentColor" cx="281.6" cy="129.8" r="9.3"/><circle fill="currentColor" cx="303.4" cy="144.9" r="9.3"/><circle fill="currentColor" cx="332.4" cy="141.8" r="9.3"/><circle fill="currentColor" cx="359.2" cy="140.5" r="9.3"/><circle fill="currentColor" cx="411.8" cy="140.5" r="9.3"/><circle fill="currentColor" cx="448.1" cy="180.4" r="9.3"/><circle fill="currentColor" cx="470.3" cy="148" r="9.3"/><circle fill="currentColor" cx="329.4" cy="313.8" r="9.3"/><circle fill="currentColor" cx="371.7" cy="118.8" r="9.3"/><circle fill="currentColor" cx="345.3" cy="118.8" r="9.3"/><circle fill="currentColor" cx="314.7" cy="123.2" r="9.3"/><circle fill="currentColor" cx="326.9" cy="103.3" r="9.3"/><circle fill="currentColor" cx="355.8" cy="99.5" r="9.3"/><circle fill="currentColor" cx="385.5" cy="97.8" r="9.3"/><circle fill="currentColor" cx="411.2" cy="95.3" r="9.3"/><circle fill="currentColor" cx="199.6" cy="306.5" r="9.3"/><circle fill="currentColor" cx="293.5" cy="109.8" r="9.3"/><circle fill="currentColor" cx="371.5" cy="78.6" r="9.3"/><circle fill="currentColor" cx="338.8" cy="83.3" r="9.3"/><circle fill="currentColor" cx="349.9" cy="63.2" r="9.3"/><circle fill="currentColor" cx="304.8" cy="90.5" r="9.3"/><circle fill="currentColor" cx="316.8" cy="70" r="9.3"/><circle fill="currentColor" cx="328.8" cy="50.5" r="9.3"/><circle fill="currentColor" cx="306.8" cy="41.2" r="9.3"/><circle fill="currentColor" cx="294.8" cy="62.7" r="9.3"/><circle fill="currentColor" cx="282.7" cy="81.2" r="9.3"/><circle fill="currentColor" cx="270.1" cy="102.6" r="9.3"/><circle fill="currentColor" cx="246.5" cy="99" r="9.3"/><circle fill="currentColor" cx="220.8" cy="102.6" r="9.3"/><circle fill="currentColor" cx="209.8" cy="80.8" r="9.3"/><circle fill="currentColor" cx="196.6" cy="61.5" r="9.3"/><circle fill="currentColor" cx="185.6" cy="39.2" r="9.3"/><circle fill="currentColor" cx="398.6" cy="118.8" r="9.3"/><circle fill="currentColor" cx="164.1" cy="51.4" r="9.3"/><circle fill="currentColor" cx="173.7" cy="70.3" r="9.3"/><circle fill="currentColor" cx="220.8" cy="55.9" r="9.3"/><circle fill="currentColor" cx="233.7" cy="78.6" r="9.3"/><circle fill="currentColor" cx="258.5" cy="78.4" r="9.3"/><circle fill="currentColor" cx="270.1" cy="55.9" r="9.3"/><circle fill="currentColor" cx="245" cy="54.7" r="9.3"/><circle fill="currentColor" cx="258.5" cy="29.9" r="9.3"/><circle fill="currentColor" cx="209" cy="34" r="9.3"/><circle fill="currentColor" cx="198.8" cy="10.3" r="9.3"/><circle fill="currentColor" cx="233.7" cy="31.8" r="9.3"/><circle fill="currentColor" cx="272.3" cy="10.3" r="9.3"/><circle fill="currentColor" cx="81" cy="138.5" r="9.3"/><circle fill="currentColor" cx="281.6" cy="34" r="9.3"/><circle fill="currentColor" cx="386.1" cy="139.8" r="9.3"/><circle fill="currentColor" cx="385.3" cy="208.7" r="9.3"/><circle fill="currentColor" cx="361.2" cy="208.7" r="9.3"/><circle fill="currentColor" cx="337" cy="208.7" r="9.3"/><circle fill="currentColor" cx="312.9" cy="208.7" r="9.3"/><circle fill="currentColor" cx="409.4" cy="208.7" r="9.3"/><circle fill="currentColor" cx="433.5" cy="208.7" r="9.3"/><circle fill="currentColor" cx="131.3" cy="208.7" r="9.3"/><circle fill="currentColor" cx="107.2" cy="208.7" r="9.3"/><circle fill="currentColor" cx="78.5" cy="208.7" r="9.3"/><circle fill="currentColor" cx="155.4" cy="208.7" r="9.3"/><circle fill="currentColor" cx="179.5" cy="208.7" r="9.3"/><circle fill="currentColor" cx="23.2" cy="210.6" r="9.3"/></g></svg>`;

  // =========================================================================
  // INYECCIÓN DE ESTILOS CSS Y ARRANQUE SEGURO
  // =========================================================================
  function inicializarScript() {
    if (!document.body) {
      setTimeout(inicializarScript, 100);
      return;
    }

    if (document.getElementById('tm-ext-floating-btn')) return;

    const style = document.createElement('style');
    style.textContent = `
            #tm-ext-panel, #tm-ext-floating-btn { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

            #tm-ext-floating-btn { display: flex; align-items: center; gap: 8px; position: fixed; z-index: 999999; padding: 12px 18px; background: ${CONFIG.COLOR_PRIMARIO}; color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: background 0.2s ease; user-select: none; }
            #tm-ext-floating-btn:hover { background: ${CONFIG.COLOR_SECUNDARIO}; }
            #tm-ext-floating-btn:active { cursor: grabbing; }
            #tm-ext-floating-btn svg { fill: white; pointer-events: none; }
            #tm-ext-floating-btn span { pointer-events: none; }

            #tm-ext-panel { position: fixed; top: 20px; right: 20px; width: 950px; max-height: calc(100vh - 40px); background: #ffffff; border: none; border-radius: 12px; z-index: 999999; display: none; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.15); font-size: 13px; color: #334155; overflow: hidden; resize: both; }

            #tm-ext-header { background: ${CONFIG.COLOR_PRIMARIO}; color: white; padding: 14px 18px; font-weight: 600; font-size: 15px; display: flex; justify-content: space-between; align-items: center; cursor: grab; user-select: none; }
            #tm-ext-header:active { cursor: grabbing; }
            .tm-ext-header-title { display: flex; align-items: center; gap: 10px; pointer-events: none; }
            #tm-ext-close { cursor: pointer; opacity: 0.8; transition: opacity 0.2s; font-size: 16px; }
            #tm-ext-close:hover { opacity: 1; }

            #tm-ext-body { padding: 18px; overflow-y: auto; flex-grow: 1; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; }

            .tm-ext-textarea { width: 100%; height: 80px; resize: vertical; box-sizing: border-box; font-family: ui-monospace, monospace; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; transition: border-color 0.2s; }
            .tm-ext-textarea:focus { border-color: ${CONFIG.COLOR_PRIMARIO}; }

            .tm-ext-actions-top { display: flex; gap: 10px; }

            .tm-ext-btn { flex: 1; background: ${CONFIG.COLOR_PRIMARIO}; color: white; border: none; padding: 10px 14px; cursor: pointer; border-radius: 6px; font-weight: 600; transition: background 0.2s; text-align: center; }
            .tm-ext-btn:hover { background: ${CONFIG.COLOR_SECUNDARIO}; }
            .tm-ext-btn:disabled { opacity: 0.7; cursor: not-allowed; }

            .tm-ext-btn-clear { background: #e2e8f0; color: #475569; }
            .tm-ext-btn-clear:hover { background: #cbd5e1; }

            .tm-ext-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; gap: 15px; }
            .tm-ext-btn-consult { background: #10b981; flex: 0 0 auto; white-space: nowrap; }
            .tm-ext-btn-consult:hover { background: #059669; }
            .tm-ext-btn-download { background: #3b82f6; flex: 0 0 auto; white-space: nowrap; }
            .tm-ext-btn-download:hover { background: #2563eb; }

            .tm-ext-btn-icon { background: transparent; color: #64748b; border: 1px solid #cbd5e1; padding: 4px 8px; cursor: pointer; border-radius: 4px; font-size: 13px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; width: 32px;}
            .tm-ext-btn-icon:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
            .tm-ext-btn-icon-delete { background: #ffe4e6; border-color: #fecdd3; color: #e11d48; }
            .tm-ext-btn-icon-delete:hover { background: #fecdd3; color: #be123c; border-color: #fda4af; }

            .tm-ext-filters { display: flex; gap: 15px; padding: 10px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; align-items: center; flex: 1; flex-wrap: wrap; }
            .tm-ext-filters label { cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500; color: #475569; margin: 0;}

            .tm-ext-table-wrapper { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; flex-grow: 1; overflow-y: auto; position: relative; }
            .tm-ext-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
            .tm-ext-table th { background: #f8fafc; font-weight: 600; color: #64748b; padding: 10px 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 0 #e2e8f0; }
            .tm-ext-table td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: nowrap; }
            .tm-ext-table tbody tr:hover { background: #f8fafc; }
            .tm-ext-table tbody tr:last-child td { border-bottom: none; }

            .tm-ext-col-proj { padding-left: 12px !important; font-weight: bold; }
            .tm-ext-actions-cell { display: flex; gap: 6px; justify-content: center; padding-right: 12px !important; }

            .tm-ext-badge-pending { background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; white-space: nowrap; border: 1px solid transparent; }
            .tm-ext-badge-loading { background: #fef9c3; color: #a16207; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; white-space: nowrap; border: 1px solid transparent; }
            .tm-ext-badge-ok { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; white-space: nowrap; border: 1px solid transparent; }
            .tm-ext-badge-error { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; white-space: nowrap; border: 1px solid transparent; }

            .tm-ext-badge-alert-red { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; white-space: nowrap; border: 1px solid #fca5a5; margin-left: 4px; }
            .tm-ext-badge-alert-yellow { background: #fef9c3; color: #854d0e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; white-space: nowrap; border: 1px solid #fde047; margin-left: 4px;}

            .tm-ext-hidden { display: none !important; }

            #tm-success-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999999; display: flex; justify-content: center; align-items: center; }
            .tm-modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(2px); }
            .tm-modal-content { position: relative; background: #ffffff; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); width: 320px; z-index: 1; animation: tm-pop 0.3s ease-out; font-family: system-ui, -apple-system, sans-serif; }
            @keyframes tm-pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        `;
    document.head.appendChild(style);

    // =========================================================================
    // CREACIÓN DE LA INTERFAZ HTML
    // =========================================================================
    const floatBtn = document.createElement('div');
    floatBtn.id = 'tm-ext-floating-btn';
    floatBtn.innerHTML = `${logoSvg} <span>Extractor ODEENE</span>`;
    document.body.appendChild(floatBtn);

    const panel = document.createElement('div');
    panel.id = 'tm-ext-panel';
    panel.innerHTML = `
            <div id="tm-ext-header">
                <div class="tm-ext-header-title">${logoSvg} Extractor de Tareas ODEENE</div>
                <span id="tm-ext-close" title="Cerrar">✖</span>
            </div>
            <div id="tm-ext-body">
                <textarea id="tm-ext-csv-input" class="tm-ext-textarea" placeholder="Pega aquí los IDs de los proyectos (separados por saltos de línea o espacios. Ej: 60905 60906)"></textarea>
                <div class="tm-ext-actions-top">
                    <button type="button" id="tm-ext-load-btn" class="tm-ext-btn">Cargar Proyectos</button>
                    <button type="button" id="tm-ext-clear-btn" class="tm-ext-btn tm-ext-btn-clear">Limpiar</button>
                </div>

                <div id="tm-ext-workspace" class="tm-ext-hidden" style="display:flex; flex-direction:column; flex:1;">
                    <div class="tm-ext-toolbar">
                        <div class="tm-ext-filters">
                            <label><input type="radio" name="tm-ext-filter" value="all" checked> Todos</label>
                            <label><input type="radio" name="tm-ext-filter" value="pending"> Pendientes</label>
                            <label><input type="radio" name="tm-ext-filter" value="ok"> Completados</label>
                            <label><input type="radio" name="tm-ext-filter" value="error"> Errores</label>
                            <span style="color:#cbd5e1; margin: 0 5px;">|</span>
                            <label><input type="radio" name="tm-ext-filter" value="warning-rojo"> 🔴 Excedidos (&ge;100%)</label>
                            <label><input type="radio" name="tm-ext-filter" value="warning-amarillo"> 🟡 Alerta (80-99%)</label>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button type="button" id="tm-ext-download-btn" class="tm-ext-btn tm-ext-btn-download tm-ext-hidden">📥 Descargar CSV</button>
                            <button type="button" id="tm-ext-consult-all-btn" class="tm-ext-btn tm-ext-btn-consult">🚀 Consultar Todo</button>
                        </div>
                    </div>
                    <div class="tm-ext-table-wrapper" id="tm-ext-table-container"></div>
                </div>
            </div>
        `;
    document.body.appendChild(panel);

    const successModal = document.createElement('div');
    successModal.id = 'tm-success-modal';
    successModal.className = 'tm-ext-hidden';
    successModal.innerHTML = `
            <div class="tm-modal-overlay"></div>
            <div class="tm-modal-content">
                <div style="font-size:48px; margin-bottom:10px;">✅</div>
                <h3 style="margin:0 0 10px 0; color:#1e293b; font-size: 18px;">Proceso Completado</h3>
                <p style="color:#64748b; margin:0 0 20px 0; font-size:14px;" id="tm-success-message">La consulta masiva ha finalizado.</p>
                <button type="button" id="tm-close-modal-btn" class="tm-ext-btn" style="width:100%;">Aceptar</button>
            </div>
        `;
    document.body.appendChild(successModal);

    // =========================================================================
    // ESTADO GLOBAL Y HELPERS
    // =========================================================================
    let stateData = [];

    function saveState() {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(stateData));
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Helper para extraer un número puro de un texto complejo (ej "1.600,5 h (200 d)" -> 1600.5)
    function parseHours(str) {
      if (!str || str.trim() === '-' || str.trim() === '') return 0;
      const match = str.match(/[\d,.]+/);
      if (!match) return 0;
      let numStr = match[0].replace(/\./g, '').replace(',', '.');
      let val = parseFloat(numStr);
      return isNaN(val) ? 0 : val;
    }

    function loadState() {
      const storedBtnPos = localStorage.getItem(CONFIG.BTN_POS_KEY);
      if (storedBtnPos) {
        try {
          const posBtn = JSON.parse(storedBtnPos);
          floatBtn.style.bottom = 'auto';
          floatBtn.style.right = 'auto';
          floatBtn.style.left = posBtn.left;
          floatBtn.style.top = posBtn.top;
        } catch (e) {}
      } else {
        floatBtn.style.bottom = '20px';
        floatBtn.style.right = '20px';
      }

      const storedPanelPos = localStorage.getItem(CONFIG.PANEL_POS_KEY);
      if (storedPanelPos) {
        try {
          const posPanel = JSON.parse(storedPanelPos);
          panel.style.right = 'auto';
          panel.style.left = posPanel.left;
          panel.style.top = posPanel.top;
        } catch (e) {}
      } else {
        panel.style.top = '20px';
        panel.style.right = '20px';
      }

      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (stored) {
        try {
          let parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            stateData = parsed;
            document.getElementById('tm-ext-workspace').classList.remove('tm-ext-hidden');
            renderList();
          }
        } catch (e) {
          console.error('Error recuperando estado local:', e);
        }
      }
    }

    // =========================================================================
    // LÓGICA DE DRAG & DROP
    // =========================================================================
    let isBtnDragging = false;
    let btnDragHasMoved = false;
    let btnOffsetX, btnOffsetY;

    floatBtn.addEventListener('mousedown', (e) => {
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
      panel.style.display = panel.style.display !== 'flex' ? 'flex' : 'none';
    });

    let isPanelDragging = false;
    let panelOffsetX, panelOffsetY;
    const tmHeader = document.getElementById('tm-ext-header');

    tmHeader.addEventListener('mousedown', (e) => {
      if (e.target.id === 'tm-ext-close') return;
      isPanelDragging = true;
      const rect = panel.getBoundingClientRect();
      panelOffsetX = e.clientX - rect.left;
      panelOffsetY = e.clientY - rect.top;
      panel.style.right = 'auto';
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
    });

    document.getElementById('tm-ext-close').addEventListener('click', () => (panel.style.display = 'none'));

    // =========================================================================
    // ACCIONES DE BOTONES
    // =========================================================================
    document.getElementById('tm-ext-clear-btn').addEventListener('click', () => {
      if (confirm('¿Seguro que deseas limpiar la lista de proyectos?')) {
        stateData = [];
        saveState();
        document.getElementById('tm-ext-csv-input').value = '';
        document.getElementById('tm-ext-workspace').classList.add('tm-ext-hidden');
        renderList();
      }
    });

    document.getElementById('tm-ext-load-btn').addEventListener('click', () => {
      const text = document.getElementById('tm-ext-csv-input').value.trim();
      if (!text) return;

      const matches = text.match(/\b\d+\b/g);
      if (matches) {
        const uniqueIds = [...new Set(matches)];
        uniqueIds.forEach((id) => {
          if (!stateData.find((p) => p.id === id)) {
            stateData.push({
              id: id,
              status: 'pending',
              errorMsg: '',
              analysisWarning: 'ninguno',
              data: {
                inicioPlan: '-',
                finPlan: '-',
                horasPlan: '-',
                inicioReal: '-',
                finReal: '-',
                incurrido: '-',
                restante: '-',
                calcConsumo: '-',
                avance: '-',
              },
            });
          }
        });

        document.getElementById('tm-ext-csv-input').value = '';
        document.getElementById('tm-ext-workspace').classList.remove('tm-ext-hidden');
        saveState();
        renderList();
      }
    });

    document.querySelectorAll('input[name="tm-ext-filter"]').forEach((radio) => {
      radio.addEventListener('change', renderList);
    });

    document.getElementById('tm-ext-consult-all-btn').addEventListener('click', async () => {
      const btn = document.getElementById('tm-ext-consult-all-btn');
      if (btn.disabled) return;

      btn.disabled = true;
      btn.innerText = '⏳ Consultando...';

      try {
        for (let i = 0; i < stateData.length; i++) {
          if (stateData[i].status !== 'ok') {
            await fetchProjectData(i);
          }
        }
      } catch (err) {
        console.error('El bucle principal se interrumpió:', err);
      } finally {
        btn.disabled = false;
        btn.innerText = '🚀 Consultar Todo';

        let msg = 'La consulta masiva ha finalizado.';
        if (CONFIG.ENABLE_WEBHOOK && CONFIG.GOOGLE_CHAT_WEBHOOK && CONFIG.GOOGLE_CHAT_WEBHOOK.trim() !== '') {
          const fecha = new Date().toLocaleString('es-ES', {dateStyle: 'short', timeStyle: 'short'});
          fetch(CONFIG.GOOGLE_CHAT_WEBHOOK, {
            method: 'POST',
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: JSON.stringify({text: `✅ *Extracción de ODEENE Finalizada*\n📅 Fecha: ${fecha}\nProyectos procesados: ${stateData.length}`}),
          }).catch((e) => console.error('Error enviando webhook:', e));

          msg += '<br><br><b>Se ha enviado mensaje al chat.</b>';
        }

        msg += '<br><br><b>Puedes descargar los resultados en CSV desde el botón superior.</b>';

        document.getElementById('tm-success-message').innerHTML = msg;
        document.getElementById('tm-success-modal').classList.remove('tm-ext-hidden');
      }
    });

    document.getElementById('tm-ext-download-btn').addEventListener('click', () => {
      downloadCSV();
    });

    document.getElementById('tm-close-modal-btn').addEventListener('click', () => {
      document.getElementById('tm-success-modal').classList.add('tm-ext-hidden');
    });

    // =========================================================================
    // FUNCIONES DE EXTRACCIÓN Y ACTUALIZACIÓN UI (QUIRÚRGICA)
    // =========================================================================

    function updateRowUI(pIndex) {
      const project = stateData[pIndex];
      const row = document.getElementById(`tm-ext-row-${pIndex}`);
      if (!row) return;

      let badgeHtml = '';
      if (project.status === 'pending') badgeHtml = `<span class="tm-ext-badge-pending">Pendiente</span>`;
      else if (project.status === 'loading') badgeHtml = `<span class="tm-ext-badge-loading">⏳ Consultando...</span>`;
      else if (project.status === 'ok') badgeHtml = `<span class="tm-ext-badge-ok">✓ Extraído</span>`;
      else if (project.status === 'error') badgeHtml = `<span class="tm-ext-badge-error">⚠ ${project.errorMsg}</span>`;

      if (project.status === 'ok') {
        if (project.analysisWarning === 'rojo') {
          badgeHtml += ` <br><span class="tm-ext-badge-alert-red" title="Horas incurridas superan o igualan a las planificadas" style="margin-top:4px;">🔴 Excedido</span>`;
        } else if (project.analysisWarning === 'amarillo') {
          badgeHtml += ` <br><span class="tm-ext-badge-alert-yellow" title="Horas incurridas entre el 80% y el 99% de lo planificado" style="margin-top:4px;">🟡 Alerta &ge;80%</span>`;
        }
      }

      row.children[1].innerHTML = badgeHtml;
      row.children[2].textContent = project.data.inicioPlan;
      row.children[3].textContent = project.data.finPlan;
      row.children[4].textContent = project.data.horasPlan;
      row.children[5].textContent = project.data.inicioReal;
      row.children[6].textContent = project.data.finReal;
      row.children[7].textContent = project.data.incurrido;
      row.children[8].textContent = project.data.restante;
      row.children[9].textContent = project.data.calcConsumo || '-';
      row.children[10].textContent = project.data.avance;

      const btn = row.querySelector('.tm-ext-consult-row');
      if (btn) {
        btn.disabled = project.status === 'loading';
        btn.innerText = project.status === 'loading' ? '⏳' : '↻';
      }

      const downloadBtn = document.getElementById('tm-ext-download-btn');
      if (stateData.some((p) => p.status === 'ok')) downloadBtn.classList.remove('tm-ext-hidden');
    }

    async function fetchProjectData(index) {
      try {
        const project = stateData[index];
        if (!project) return;

        project.status = 'loading';
        updateRowUI(index);

        try {
          const url = `/RPOS323/RPOS323M_TareasProyecto.aspx?CodProyecto=${project.id}`;
          const response = await fetch(url, {cache: 'no-store'});
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const html = await response.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');

          const filas = doc.querySelectorAll('tr[class*="celda"]');
          let targetRow = null;

          for (let fila of filas) {
            if (fila.textContent.includes('ODEENE')) {
              if (fila.querySelector('input[type="checkbox"]') && fila.querySelector('[id*="lblTrabajoPlanificado"]')) {
                targetRow = fila;
                break;
              }
            }
          }

          if (!targetRow) {
            project.status = 'error';
            project.errorMsg = 'Fila ODEENE no encontrada';
            project.analysisWarning = 'ninguno';
          } else {
            const getVal = (selector) => {
              let el = targetRow.querySelector(selector);
              if (el)
                return (el.value !== undefined ? el.value : el.textContent)
                  .replace(/&nbsp;/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
              return '-';
            };

            let inicioPlan = targetRow.children[4]
              ? targetRow.children[4].textContent
                  .replace(/&nbsp;/g, '')
                  .replace(/\s+/g, ' ')
                  .trim()
              : '-';
            let finPlan = targetRow.children[5]
              ? targetRow.children[5].textContent
                  .replace(/&nbsp;/g, '')
                  .replace(/\s+/g, ' ')
                  .trim()
              : '-';

            inicioPlan = inicioPlan.replace('Inicio:', '').trim();
            finPlan = finPlan.replace('Fin:', '').trim();

            project.data = {
              inicioPlan: inicioPlan,
              finPlan: finPlan,
              horasPlan: getVal('[id*="lblTrabajoPlanificado"]'),
              inicioReal: getVal('[id*="txtFechaInicio"]'),
              finReal: getVal('[id*="txtFechaFin"]'),
              incurrido: getVal('[id*="txtHorasIncurridas"]'),
              restante: getVal('[id*="txtHorasRestantes"]'),
              calcConsumo: '-',
              avance: getVal('[id*="lblAvance"]'),
            };

            // ANÁLISIS MATEMÁTICO (Alertas) -> P - I
            let plan = parseHours(project.data.horasPlan);
            let inc = parseHours(project.data.incurrido);

            let calcConsumo = plan - inc;
            project.data.calcConsumo = isNaN(calcConsumo) ? '-' : calcConsumo.toString().replace('.', ',');

            project.analysisWarning = 'ninguno';

            if (plan > 0) {
              if (inc >= plan) {
                project.analysisWarning = 'rojo';
              } else if (inc >= plan * 0.8) {
                project.analysisWarning = 'amarillo';
              }
            }

            project.status = 'ok';
            project.errorMsg = '';
          }
        } catch (error) {
          project.status = 'error';
          project.errorMsg = 'Fallo de conexión HTTP';
          project.analysisWarning = 'ninguno';
        }

        saveState();
        updateRowUI(index);
        await sleep(CONFIG.DELAY_MS);
      } catch (fatalError) {
        console.error('Error crítico procesando índice', index, fatalError);
        if (stateData[index]) {
          stateData[index].status = 'error';
          stateData[index].errorMsg = 'Error interno del script';
          stateData[index].analysisWarning = 'ninguno';
          saveState();
          updateRowUI(index);
        }
      }
    }

    function renderList() {
      const filterRadio = document.querySelector('input[name="tm-ext-filter"]:checked');
      const filter = filterRadio ? filterRadio.value : 'all';
      const container = document.getElementById('tm-ext-table-container');
      const downloadBtn = document.getElementById('tm-ext-download-btn');

      const hasData = stateData.some((p) => p.status === 'ok');
      if (hasData) downloadBtn.classList.remove('tm-ext-hidden');
      else downloadBtn.classList.add('tm-ext-hidden');

      let html = `<table class="tm-ext-table">
                <thead>
                    <tr>
                        <th class="tm-ext-col-proj">Proyecto</th>
                        <th>Estado</th>
                        <th>Inicio Plan.</th>
                        <th>Fin Plan.</th>
                        <th>Horas Plan.</th>
                        <th>Inicio Real</th>
                        <th>Fin Real</th>
                        <th>Incurrido</th>
                        <th>Restante</th>
                        <th style="background-color: #f3e8ff; color: #6b21a8;">Dif. (P-I)</th>
                        <th>Avance</th>
                        <th class="tm-ext-actions-th">Acciones</th>
                    </tr>
                </thead>
                <tbody>`;

      stateData.forEach((project, pIndex) => {
        if (filter !== 'all') {
          if (filter === 'pending' && project.status !== 'pending') return;
          if (filter === 'ok' && project.status !== 'ok') return;
          if (filter === 'error' && project.status !== 'error') return;
          if (filter === 'warning-rojo' && project.analysisWarning !== 'rojo') return;
          if (filter === 'warning-amarillo' && project.analysisWarning !== 'amarillo') return;
        }

        let badgeHtml = '';
        if (project.status === 'pending') badgeHtml = `<span class="tm-ext-badge-pending">Pendiente</span>`;
        else if (project.status === 'loading') badgeHtml = `<span class="tm-ext-badge-loading">⏳ Consultando...</span>`;
        else if (project.status === 'ok') badgeHtml = `<span class="tm-ext-badge-ok">✓ Extraído</span>`;
        else if (project.status === 'error') badgeHtml = `<span class="tm-ext-badge-error">⚠ ${project.errorMsg}</span>`;

        if (project.status === 'ok') {
          if (project.analysisWarning === 'rojo') {
            badgeHtml += ` <br><span class="tm-ext-badge-alert-red" title="Horas incurridas superan o igualan a las planificadas" style="margin-top:4px;">🔴 Excedido</span>`;
          } else if (project.analysisWarning === 'amarillo') {
            badgeHtml += ` <br><span class="tm-ext-badge-alert-yellow" title="Horas incurridas entre el 80% y el 99% de lo planificado" style="margin-top:4px;">🟡 Alerta &ge;80%</span>`;
          }
        }

        html += `<tr id="tm-ext-row-${pIndex}">
                    <td class="tm-ext-col-proj">${project.id}</td>
                    <td>${badgeHtml}</td>
                    <td>${project.data.inicioPlan}</td>
                    <td>${project.data.finPlan}</td>
                    <td>${project.data.horasPlan}</td>
                    <td>${project.data.inicioReal}</td>
                    <td>${project.data.finReal}</td>
                    <td>${project.data.incurrido}</td>
                    <td>${project.data.restante}</td>
                    <td style="font-weight: 700; color: #6b21a8; background-color: #faf5ff;">${project.data.calcConsumo || '-'}</td>
                    <td>${project.data.avance}</td>
                    <td class="tm-ext-actions-cell">
                        <button type="button" class="tm-ext-btn-icon tm-ext-btn-icon-impute tm-ext-consult-row" data-index="${pIndex}" title="Consultar de nuevo">↻</button>
                        <button type="button" class="tm-ext-btn-icon tm-ext-btn-icon-delete tm-ext-delete-row" data-index="${pIndex}" title="Eliminar fila">🗑️</button>
                    </td>
                </tr>`;
      });

      html += `</tbody></table>`;
      container.innerHTML = html;

      document.querySelectorAll('.tm-ext-consult-row').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const idx = e.target.getAttribute('data-index');
          e.target.disabled = true;
          e.target.innerText = '⏳';
          await fetchProjectData(idx);
        });
      });

      document.querySelectorAll('.tm-ext-delete-row').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = e.target.getAttribute('data-index');
          if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
            stateData.splice(idx, 1);
            saveState();
            renderList();
          }
        });
      });
    }

    function downloadCSV() {
      const fecha = new Date();
      const strFecha =
        fecha.getFullYear() +
        '-' +
        String(fecha.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(fecha.getDate()).padStart(2, '0') +
        '_' +
        String(fecha.getHours()).padStart(2, '0') +
        '-' +
        String(fecha.getMinutes()).padStart(2, '0');

      const filename = `Extraccion_ODEENE_${strFecha}.csv`;

      let csvContent =
        '\uFEFFProyecto;Estado;Alerta;Inicio Planificado;Fin Planificado;Horas Planificadas;Inicio Real;Fin Real;Incurrido;Restante;Diferencia (P-I);Avance\n';

      stateData.forEach((row) => {
        const d = row.data;
        const status = row.status === 'error' ? row.errorMsg : row.status;
        let alertaText = '';
        if (row.analysisWarning === 'rojo') alertaText = 'Excedido';
        else if (row.analysisWarning === 'amarillo') alertaText = 'Alerta >=80%';

        csvContent += `"${row.id}";"${status}";"${alertaText}";"${d.inicioPlan}";"${d.finPlan}";"${d.horasPlan}";"${d.inicioReal}";"${d.finReal}";"${d.incurrido}";"${d.restante}";"${d.calcConsumo}";"${d.avance}"\n`;
      });

      const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    loadState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarScript);
  } else {
    inicializarScript();
  }
})();
