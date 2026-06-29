// ==UserScript==
// @name         Imputador Masivo de Horas
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.0.0
// @description  Imputador masivo de horas de odeene
// @match        http://ecaplicaciones/RPOS323/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/imputador-masivo.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/imputador-masivo.user.js
// ==/UserScript==

(function () {
  'use strict';

  // =========================================================================
  // 1. CONFIGURACIÓN GLOBAL (Modificable)
  // =========================================================================
  const CONFIG = {
    DELAY_MS: 300,
    ROW_SELECTOR: 'table[id^="tabla"] tr',
    INPUT_PREFIX: 'txt',
    COLOR_PRIMARIO: '#276466',
    COLOR_SECUNDARIO: '#1e4f51',
    STORAGE_KEY: 'tm_imputacion_state',
    BTN_POS_KEY: 'tm_btn_position',
    PANEL_POS_KEY: 'tm_panel_position',

    ENABLE_CSV_DOWNLOAD: true,
    ENABLE_WEBHOOK: true,
    GOOGLE_CHAT_WEBHOOK:
      'https://chat.googleapis.com/v1/spaces/AAQAA70Cbeo/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=6-fn-GZNSeECQH1QpjAOSLLfBRnA-RZxmfiBxq_-4QY',
  };

  // =========================================================================
  // FUNCIÓN DE ARRANQUE SEGURO (Espera a que el DOM esté listo)
  // =========================================================================
  function inicializarScript() {
    if (!document.body) {
      setTimeout(inicializarScript, 100);
      return;
    }

    if (document.getElementById('tm-floating-btn')) return; // Evitar duplicados

    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 492.6 430.7"><g><circle fill="currentColor" cx="117" cy="233.4" r="9.3"/><circle fill="currentColor" cx="141.1" cy="233.4" r="9.3"/><circle fill="currentColor" cx="165.2" cy="233.4" r="9.3"/><circle fill="currentColor" cx="189.4" cy="233.4" r="9.3"/><circle fill="currentColor" cx="92.9" cy="233.4" r="9.3"/><circle fill="currentColor" cx="68.8" cy="233.4" r="9.3"/><circle fill="currentColor" cx="354.5" cy="233.4" r="9.3"/><circle fill="currentColor" cx="378.6" cy="233.4" r="9.3"/><circle fill="currentColor" cx="402.8" cy="233.4" r="9.3"/><circle fill="currentColor" cx="426.9" cy="233.4" r="9.3"/><circle fill="currentColor" cx="330.4" cy="233.4" r="9.3"/><circle fill="currentColor" cx="306.3" cy="233.4" r="9.3"/><circle fill="currentColor" cx="345.2" cy="255.1" r="9.3"/><circle fill="currentColor" cx="371.4" cy="255.1" r="9.3"/><circle fill="currentColor" cx="396.2" cy="255.3" r="9.3"/><circle fill="currentColor" cx="421.5" cy="255.5" r="9.3"/><circle fill="currentColor" cx="319.5" cy="255.1" r="9.3"/><circle fill="currentColor" cx="293.5" cy="255.1" r="9.3"/><circle fill="currentColor" cx="304.5" cy="273.5" r="9.3"/><circle fill="currentColor" cx="317.2" cy="295.2" r="9.3"/><circle fill="currentColor" cx="333.8" cy="277.8" r="9.3"/><circle fill="currentColor" cx="360.4" cy="278.9" r="9.3"/><circle fill="currentColor" cx="387.3" cy="279.8" r="9.3"/><circle fill="currentColor" cx="375" cy="300.3" r="9.3"/><circle fill="currentColor" cx="402.4" cy="300.6" r="9.3"/><circle fill="currentColor" cx="347.3" cy="299.2" r="9.3"/><circle fill="currentColor" cx="431.2" cy="313.8" r="9.3"/><circle fill="currentColor" cx="128" cy="255.1" r="9.3"/><circle fill="currentColor" cx="152.1" cy="255.1" r="9.3"/><circle fill="currentColor" cx="176.2" cy="255.1" r="9.3"/><circle fill="currentColor" cx="200.3" cy="255.1" r="9.3"/><circle fill="currentColor" cx="103.8" cy="255.1" r="9.3"/><circle fill="currentColor" cx="79.7" cy="255.1" r="9.3"/><circle fill="currentColor" cx="481.2" cy="277.8" r="9.3"/><circle fill="currentColor" cx="459" cy="233.4" r="9.3"/><circle fill="currentColor" cx="455.1" cy="357" r="9.3"/><circle fill="currentColor" cx="387" cy="379.2" r="9.3"/><circle fill="currentColor" cx="387" cy="322" r="9.3"/><circle fill="currentColor" cx="370" cy="337.6" r="9.3"/><circle fill="currentColor" cx="352.3" cy="355.7" r="9.3"/><circle fill="currentColor" cx="339.7" cy="334.2" r="9.3"/><circle fill="currentColor" cx="307" cy="327.1" r="9.3"/><circle fill="currentColor" cx="296.9" cy="308.2" r="9.3"/><circle fill="currentColor" cx="284.1" cy="289.2" r="9.3"/><circle fill="currentColor" cx="271.4" cy="268" r="9.3"/><circle fill="currentColor" cx="248.2" cy="275" r="9.3"/><circle fill="currentColor" cx="222.4" cy="268.6" r="9.3"/><circle fill="currentColor" cx="234.6" cy="293.7" r="9.3"/><circle fill="currentColor" cx="259.5" cy="292.3" r="9.3"/><circle fill="currentColor" cx="211.5" cy="288.6" r="9.3"/><circle fill="currentColor" cx="189.7" cy="273.5" r="9.3"/><circle fill="currentColor" cx="160.8" cy="276.6" r="9.3"/><circle fill="currentColor" cx="133.9" cy="277.9" r="9.3"/><circle fill="currentColor" cx="81.4" cy="277.9" r="9.3"/><circle fill="currentColor" cx="45" cy="238" r="9.3"/><circle fill="currentColor" cx="22.9" cy="270.4" r="9.3"/><circle fill="currentColor" cx="41.7" cy="311.2" r="9.3"/><circle fill="currentColor" cx="121.4" cy="299.7" r="9.3"/><circle fill="currentColor" cx="147.9" cy="299.7" r="9.3"/><circle fill="currentColor" cx="178.4" cy="295.2" r="9.3"/><circle fill="currentColor" cx="166.2" cy="315.2" r="9.3"/><circle fill="currentColor" cx="137.3" cy="319" r="9.3"/><circle fill="currentColor" cx="107.6" cy="320.6" r="9.3"/><circle fill="currentColor" cx="81.9" cy="323.1" r="9.3"/><circle fill="currentColor" cx="82.2" cy="351.5" r="9.3"/><circle fill="currentColor" cx="108.2" cy="359.2" r="9.3"/><circle fill="currentColor" cx="121.6" cy="339.8" r="9.3"/><circle fill="currentColor" cx="154.4" cy="335.1" r="9.3"/><circle fill="currentColor" cx="143.3" cy="355.2" r="9.3"/><circle fill="currentColor" cx="188.4" cy="327.9" r="9.3"/><circle fill="currentColor" cx="176.3" cy="348.4" r="9.3"/><circle fill="currentColor" cx="164.4" cy="367.9" r="9.3"/><circle fill="currentColor" cx="186.3" cy="377.2" r="9.3"/><circle fill="currentColor" cx="198.4" cy="355.7" r="9.3"/><circle fill="currentColor" cx="210.4" cy="337.2" r="9.3"/><circle fill="currentColor" cx="223" cy="315.8" r="9.3"/><circle fill="currentColor" cx="246.6" cy="319.4" r="9.3"/><circle fill="currentColor" cx="272.3" cy="315.8" r="9.3"/><circle fill="currentColor" cx="283.4" cy="337.6" r="9.3"/><circle fill="currentColor" cx="296.5" cy="357" r="9.3"/><circle fill="currentColor" cx="307.6" cy="379.2" r="9.3"/><circle fill="currentColor" cx="335.5" cy="406.1" r="9.3"/><circle fill="currentColor" cx="329.1" cy="367" r="9.3"/><circle fill="currentColor" cx="319.5" cy="348.1" r="9.3"/><circle fill="currentColor" cx="272.3" cy="362.5" r="9.3"/><circle fill="currentColor" cx="259.5" cy="339.8" r="9.3"/><circle fill="currentColor" cx="234.6" cy="340" r="9.3"/><circle fill="currentColor" cx="223" cy="362.5" r="9.3"/><circle fill="currentColor" cx="248.2" cy="363.8" r="9.3"/><circle fill="currentColor" cx="234.6" cy="388.6" r="9.3"/><circle fill="currentColor" cx="284.1" cy="384.4" r="9.3"/><circle fill="currentColor" cx="294.4" cy="408.1" r="9.3"/><circle fill="currentColor" cx="255.3" cy="416.2" r="9.3"/><circle fill="currentColor" cx="220.8" cy="408.1" r="9.3"/><circle fill="currentColor" cx="359.2" cy="317.8" r="9.3"/><circle fill="currentColor" cx="384.4" cy="420.4" r="9.3"/><circle fill="currentColor" cx="107.1" cy="278.6" r="9.3"/><circle fill="currentColor" cx="376.1" cy="185" r="9.3"/><circle fill="currentColor" cx="352" cy="185" r="9.3"/><circle fill="currentColor" cx="327.9" cy="185" r="9.3"/><circle fill="currentColor" cx="303.8" cy="185" r="9.3"/><circle fill="currentColor" cx="400.3" cy="185" r="9.3"/><circle fill="currentColor" cx="424.4" cy="185" r="9.3"/><circle fill="currentColor" cx="138.6" cy="185" r="9.3"/><circle fill="currentColor" cx="114.5" cy="185" r="9.3"/><circle fill="currentColor" cx="90.4" cy="185" r="9.3"/><circle fill="currentColor" cx="66.3" cy="185" r="9.3"/><circle fill="currentColor" cx="162.7" cy="185" r="9.3"/><circle fill="currentColor" cx="186.9" cy="185" r="9.3"/><circle fill="currentColor" cx="148" cy="163.4" r="9.3"/><circle fill="currentColor" cx="121.7" cy="163.4" r="9.3"/><circle fill="currentColor" cx="97" cy="163.1" r="9.3"/><circle fill="currentColor" cx="71.7" cy="162.9" r="9.3"/><circle fill="currentColor" cx="173.7" cy="163.4" r="9.3"/><circle fill="currentColor" cx="199.6" cy="163.4" r="9.3"/><circle fill="currentColor" cx="188.6" cy="144.9" r="9.3"/><circle fill="currentColor" cx="175.9" cy="123.2" r="9.3"/><circle fill="currentColor" cx="164.8" cy="103.3" r="9.3"/><circle fill="currentColor" cx="159.4" cy="140.7" r="9.3"/><circle fill="currentColor" cx="132.7" cy="139.5" r="9.3"/><circle fill="currentColor" cx="105.8" cy="138.6" r="9.3"/><circle fill="currentColor" cx="118.1" cy="118.1" r="9.3"/><circle fill="currentColor" cx="90.7" cy="117.8" r="9.3"/><circle fill="currentColor" cx="145.8" cy="119.2" r="9.3"/><circle fill="currentColor" cx="61.9" cy="104.6" r="9.3"/><circle fill="currentColor" cx="365.2" cy="163.4" r="9.3"/><circle fill="currentColor" cx="341.1" cy="163.4" r="9.3"/><circle fill="currentColor" cx="316.9" cy="163.4" r="9.3"/><circle fill="currentColor" cx="292.8" cy="163.4" r="9.3"/><circle fill="currentColor" cx="389.3" cy="163.4" r="9.3"/><circle fill="currentColor" cx="413.4" cy="163.4" r="9.3"/><circle fill="currentColor" cx="11.9" cy="140.7" r="9.3"/><circle fill="currentColor" cx="34.1" cy="185" r="9.3"/><circle fill="currentColor" cx="38" cy="61.5" r="9.3"/><circle fill="currentColor" cx="133.9" cy="99" r="9.3"/><circle fill="currentColor" cx="106.1" cy="96.4" r="9.3"/><circle fill="currentColor" cx="123.1" cy="80.8" r="9.3"/><circle fill="currentColor" cx="140.9" cy="62.7" r="9.3"/><circle fill="currentColor" cx="153.4" cy="84.2" r="9.3"/><circle fill="currentColor" cx="186.1" cy="91.3" r="9.3"/><circle fill="currentColor" cx="196.2" cy="110.2" r="9.3"/><circle fill="currentColor" cx="209" cy="129.2" r="9.3"/><circle fill="currentColor" cx="221.7" cy="150.4" r="9.3"/><circle fill="currentColor" cx="246.8" cy="145.2" r="9.3"/><circle fill="currentColor" cx="270.7" cy="149.8" r="9.3"/><circle fill="currentColor" cx="258.5" cy="124.7" r="9.3"/><circle fill="currentColor" cx="233.7" cy="126.2" r="9.3"/><circle fill="currentColor" cx="281.6" cy="129.8" r="9.3"/><circle fill="currentColor" cx="303.4" cy="144.9" r="9.3"/><circle fill="currentColor" cx="332.4" cy="141.8" r="9.3"/><circle fill="currentColor" cx="359.2" cy="140.5" r="9.3"/><circle fill="currentColor" cx="411.8" cy="140.5" r="9.3"/><circle fill="currentColor" cx="448.1" cy="180.4" r="9.3"/><circle fill="currentColor" cx="470.3" cy="148" r="9.3"/><circle fill="currentColor" cx="329.4" cy="313.8" r="9.3"/><circle fill="currentColor" cx="371.7" cy="118.8" r="9.3"/><circle fill="currentColor" cx="345.3" cy="118.8" r="9.3"/><circle fill="currentColor" cx="314.7" cy="123.2" r="9.3"/><circle fill="currentColor" cx="326.9" cy="103.3" r="9.3"/><circle fill="currentColor" cx="355.8" cy="99.5" r="9.3"/><circle fill="currentColor" cx="385.5" cy="97.8" r="9.3"/><circle fill="currentColor" cx="411.2" cy="95.3" r="9.3"/><circle fill="currentColor" cx="199.6" cy="306.5" r="9.3"/><circle fill="currentColor" cx="293.5" cy="109.8" r="9.3"/><circle fill="currentColor" cx="371.5" cy="78.6" r="9.3"/><circle fill="currentColor" cx="338.8" cy="83.3" r="9.3"/><circle fill="currentColor" cx="349.9" cy="63.2" r="9.3"/><circle fill="currentColor" cx="304.8" cy="90.5" r="9.3"/><circle fill="currentColor" cx="316.8" cy="70" r="9.3"/><circle fill="currentColor" cx="328.8" cy="50.5" r="9.3"/><circle fill="currentColor" cx="306.8" cy="41.2" r="9.3"/><circle fill="currentColor" cx="294.8" cy="62.7" r="9.3"/><circle fill="currentColor" cx="282.7" cy="81.2" r="9.3"/><circle fill="currentColor" cx="270.1" cy="102.6" r="9.3"/><circle fill="currentColor" cx="246.5" cy="99" r="9.3"/><circle fill="currentColor" cx="220.8" cy="102.6" r="9.3"/><circle fill="currentColor" cx="209.8" cy="80.8" r="9.3"/><circle fill="currentColor" cx="196.6" cy="61.5" r="9.3"/><circle fill="currentColor" cx="185.6" cy="39.2" r="9.3"/><circle fill="currentColor" cx="398.6" cy="118.8" r="9.3"/><circle fill="currentColor" cx="164.1" cy="51.4" r="9.3"/><circle fill="currentColor" cx="173.7" cy="70.3" r="9.3"/><circle fill="currentColor" cx="220.8" cy="55.9" r="9.3"/><circle fill="currentColor" cx="233.7" cy="78.6" r="9.3"/><circle fill="currentColor" cx="258.5" cy="78.4" r="9.3"/><circle fill="currentColor" cx="270.1" cy="55.9" r="9.3"/><circle fill="currentColor" cx="245" cy="54.7" r="9.3"/><circle fill="currentColor" cx="258.5" cy="29.9" r="9.3"/><circle fill="currentColor" cx="209" cy="34" r="9.3"/><circle fill="currentColor" cx="198.8" cy="10.3" r="9.3"/><circle fill="currentColor" cx="233.7" cy="31.8" r="9.3"/><circle fill="currentColor" cx="272.3" cy="10.3" r="9.3"/><circle fill="currentColor" cx="81" cy="138.5" r="9.3"/><circle fill="currentColor" cx="281.6" cy="34" r="9.3"/><circle fill="currentColor" cx="386.1" cy="139.8" r="9.3"/><circle fill="currentColor" cx="385.3" cy="208.7" r="9.3"/><circle fill="currentColor" cx="361.2" cy="208.7" r="9.3"/><circle fill="currentColor" cx="337" cy="208.7" r="9.3"/><circle fill="currentColor" cx="312.9" cy="208.7" r="9.3"/><circle fill="currentColor" cx="409.4" cy="208.7" r="9.3"/><circle fill="currentColor" cx="433.5" cy="208.7" r="9.3"/><circle fill="currentColor" cx="131.3" cy="208.7" r="9.3"/><circle fill="currentColor" cx="107.2" cy="208.7" r="9.3"/><circle fill="currentColor" cx="78.5" cy="208.7" r="9.3"/><circle fill="currentColor" cx="155.4" cy="208.7" r="9.3"/><circle fill="currentColor" cx="179.5" cy="208.7" r="9.3"/><circle fill="currentColor" cx="23.2" cy="210.6" r="9.3"/></g></svg>`;

    const style = document.createElement('style');
    style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            * { box-sizing: border-box; }

            #tm-panel, #tm-floating-btn {
                font-family: 'Inter', system-ui, -apple-system, "Segoe UI", sans-serif;
            }

            /* ---- BOTÓN FLOTANTE ---- */
            #tm-floating-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                position: fixed;
                z-index: 999999;
                padding: 10px 16px;
                background: ${CONFIG.COLOR_PRIMARIO};
                color: white;
                border: none;
                border-radius: 100px;
                cursor: pointer;
                font-weight: 600;
                font-size: 13px;
                letter-spacing: 0.2px;
                box-shadow: 0 4px 6px -1px rgba(39,100,102,0.35), 0 2px 4px -1px rgba(39,100,102,0.2);
                transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
                user-select: none;
                backdrop-filter: blur(8px);
            }
            #tm-floating-btn:hover {
                background: ${CONFIG.COLOR_SECUNDARIO};
                box-shadow: 0 8px 15px -3px rgba(39,100,102,0.4), 0 4px 6px -2px rgba(39,100,102,0.2);
                transform: translateY(-1px);
            }
            #tm-floating-btn:active { cursor: grabbing; transform: translateY(0); }
            #tm-floating-btn svg { fill: white; pointer-events: none; }
            #tm-floating-btn span { pointer-events: none; }

            /* ---- PANEL PRINCIPAL ---- */
            #tm-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 980px;
                min-width: 600px;
                height: 620px;
                min-height: 400px;
                background: #f8fafb;
                border: 1px solid rgba(0,0,0,0.07);
                border-radius: 16px;
                z-index: 999999;
                display: none;
                flex-direction: column;
                box-shadow:
                    0 0 0 1px rgba(0,0,0,0.04),
                    0 10px 15px -3px rgba(0,0,0,0.08),
                    0 4px 6px -2px rgba(0,0,0,0.04),
                    0 25px 50px -12px rgba(0,0,0,0.12);
                font-size: 13px;
                color: #1a2332;
                overflow: hidden;
                resize: both;
            }

            /* ---- HEADER ---- */
            #tm-header {
                background: ${CONFIG.COLOR_PRIMARIO};
                background: linear-gradient(135deg, ${CONFIG.COLOR_PRIMARIO} 0%, #1e4f51 100%);
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
                border-bottom: 1px solid rgba(255,255,255,0.08);
            }
            #tm-header:active { cursor: grabbing; }
            .tm-header-title {
                display: flex;
                align-items: center;
                gap: 10px;
                pointer-events: none;
                letter-spacing: -0.1px;
            }
            #tm-close {
                cursor: pointer;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                opacity: 0.7;
                transition: all 0.15s ease;
                font-size: 15px;
                background: rgba(255,255,255,0);
            }
            #tm-close:hover { opacity: 1; background: rgba(255,255,255,0.15); }

            /* ---- CUERPO ---- */
            #tm-body {
                padding: 16px;
                overflow-y: auto;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: #f8fafb;
            }

            /* ---- TEXTAREA ---- */
            .tm-textarea {
                width: 100%;
                height: 58px;
                min-height: 58px;
                resize: vertical;
                box-sizing: border-box;
                font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
                font-size: 12px;
                padding: 10px 12px;
                border: 1.5px solid #e2e8f0;
                border-radius: 8px;
                outline: none;
                background: #ffffff;
                color: #1a2332;
                transition: border-color 0.2s, box-shadow 0.2s;
                flex-shrink: 0;
            }
            .tm-textarea:focus {
                border-color: ${CONFIG.COLOR_PRIMARIO};
                box-shadow: 0 0 0 3px rgba(39,100,102,0.12);
            }
            .tm-textarea::placeholder { color: #94a3b8; }

            /* ---- BOTONES SUPERIORES ---- */
            .tm-actions-top {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .tm-btn {
                flex: 1;
                background: ${CONFIG.COLOR_PRIMARIO};
                color: white;
                border: none;
                padding: 9px 14px;
                cursor: pointer;
                border-radius: 8px;
                font-weight: 600;
                font-size: 13px;
                transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
                text-align: center;
                letter-spacing: 0.1px;
            }
            .tm-btn:hover {
                background: ${CONFIG.COLOR_SECUNDARIO};
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(39,100,102,0.25);
            }
            .tm-btn:active { transform: translateY(0); box-shadow: none; }
            .tm-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

            .tm-btn-clear {
                background: #ffffff;
                color: #64748b;
                border: 1.5px solid #e2e8f0;
                flex: 0 0 auto;
                padding: 9px 16px;
            }
            .tm-btn-clear:hover { background: #f1f5f9; color: #334155; border-color: #cbd5e1; box-shadow: none; transform: none; }

            /* ---- WORKSPACE ---- */
            #tm-workspace {
                display: flex;
                flex-direction: column;
                flex: 1;
                min-height: 0;
                gap: 8px;
            }

            /* ---- TOOLBAR ---- */
            .tm-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                flex-shrink: 0;
            }

            /* ---- BOTONES ACCIÓN MASIVA ---- */
            .tm-btn-impute-all {
                background: linear-gradient(135deg, #059669, #047857);
                border: none;
                flex: 0 0 auto;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(5,150,105,0.25);
            }
            .tm-btn-impute-all:hover { background: linear-gradient(135deg, #047857, #065f46); box-shadow: 0 4px 10px rgba(5,150,105,0.35); }

            .tm-btn-calc-all {
                background: linear-gradient(135deg, #7c3aed, #6d28d9);
                border: none;
                flex: 0 0 auto;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(124,58,237,0.25);
            }
            .tm-btn-calc-all:hover { background: linear-gradient(135deg, #6d28d9, #5b21b6); box-shadow: 0 4px 10px rgba(124,58,237,0.35); }

            .tm-btn-chat {
                background: linear-gradient(135deg, #0284c7, #0369a1);
                border: none;
                flex: 0 0 auto;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(2,132,199,0.25);
            }
            .tm-btn-chat:hover { background: linear-gradient(135deg, #0369a1, #075985); box-shadow: 0 4px 10px rgba(2,132,199,0.35); }

            /* ---- FILTROS ---- */
            .tm-filters {
                display: flex;
                gap: 4px;
                padding: 5px 8px;
                background: #ffffff;
                border: 1.5px solid #e2e8f0;
                border-radius: 8px;
                align-items: center;
                flex: 1;
                flex-wrap: wrap;
            }
            .tm-filters label {
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                font-weight: 500;
                color: #64748b;
                margin: 0;
                font-size: 12px;
                padding: 3px 8px;
                border-radius: 5px;
                transition: all 0.15s;
            }
            .tm-filters label:hover { background: #f1f5f9; color: #334155; }
            .tm-filter-title {
                font-weight: 700;
                color: #94a3b8;
                margin-right: 2px;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
            }
            .tm-filters input[type="radio"] { accent-color: ${CONFIG.COLOR_PRIMARIO}; }

            /* ---- BOTONES ICONO ---- */
            .tm-btn-icon {
                background: #f8fafc;
                color: #64748b;
                border: 1.5px solid #e2e8f0;
                padding: 0;
                cursor: pointer;
                border-radius: 6px;
                font-size: 12px;
                transition: all 0.15s;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 28px;
            }
            .tm-btn-icon:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; transform: translateY(-1px); }

            .tm-btn-icon-impute {
                background: #ecfdf5;
                border-color: #a7f3d0;
                color: #047857;
            }
            .tm-btn-icon-impute:hover { background: #d1fae5; color: #065f46; border-color: #6ee7b7; }

            .tm-btn-icon-delete {
                background: #fff1f2;
                border-color: #fecdd3;
                color: #e11d48;
            }
            .tm-btn-icon-delete:hover { background: #ffe4e6; color: #be123c; border-color: #fda4af; }

            .tm-btn-icon-calc {
                background: #faf5ff;
                border-color: #ddd6fe;
                color: #7c3aed;
            }
            .tm-btn-icon-calc:hover { background: #ede9fe; color: #6d28d9; border-color: #c4b5fd; }

            /* ---- TABLA ---- */
            .tm-table-wrapper {
                background: #ffffff;
                border: 1.5px solid #e2e8f0;
                border-radius: 10px;
                flex: 1;
                overflow-y: auto;
                position: relative;
                min-height: 160px;
            }

            /* Scrollbar personalizada */
            .tm-table-wrapper::-webkit-scrollbar { width: 6px; }
            .tm-table-wrapper::-webkit-scrollbar-track { background: transparent; }
            .tm-table-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
            .tm-table-wrapper::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

            .tm-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                text-align: center;
            }
            .tm-table th {
                background: #f8fafc;
                font-weight: 600;
                color: #94a3b8;
                padding: 10px 6px;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                position: sticky;
                top: 0;
                z-index: 10;
                border-bottom: 1.5px solid #e2e8f0;
            }
            .tm-table tfoot th {
                position: sticky;
                bottom: 0;
                background: #f0fdf4;
                color: #166534;
                font-weight: 700;
                border-top: 1.5px solid #bbf7d0;
                z-index: 10;
                font-size: 12px;
                padding: 9px 6px;
            }
            .tm-table td {
                padding: 7px 5px;
                border-bottom: 1px solid #f1f5f9;
                vertical-align: middle;
            }
            .tm-table tbody tr { transition: background 0.1s; }
            .tm-table tbody tr:hover { background: #f8fafc; }
            .tm-table tbody tr:last-child td { border-bottom: none; }

            .tm-col-proj-th { text-align: left !important; padding-left: 14px !important; }
            .tm-col-day-th { width: 40px; }
            .tm-col-actions-th { width: 110px; }
            .tm-col-proj { text-align: left !important; padding-left: 14px !important; }

            .tm-proj-container {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 5px;
            }
            .tm-proj-id {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 240px;
                font-weight: 600;
                font-size: 12px;
                color: #1a2332;
            }

            /* ---- INPUTS DE HORA ---- */
            .tm-input-hour {
                width: 30px;
                text-align: center;
                border: 1.5px solid #e2e8f0;
                border-radius: 5px;
                padding: 4px 2px;
                font-family: inherit;
                font-size: 12px;
                font-weight: 500;
                outline: none;
                transition: all 0.15s;
                background: #ffffff;
                color: #334155;
            }
            .tm-input-hour:focus {
                border-color: ${CONFIG.COLOR_PRIMARIO};
                box-shadow: 0 0 0 3px rgba(39,100,102,0.1);
                background: #f0fafa;
            }

            .tm-state-ok {
                background: #f0fdf4;
                border-color: #86efac;
                color: #15803d;
                font-weight: 700;
            }
            .tm-state-error {
                background: #fff1f2;
                border-color: #fca5a5;
                color: #b91c1c;
            }
            .tm-state-pending {
                background: #fefce8;
                border-color: #fde047;
                color: #92400e;
            }

            .tm-actions-cell {
                display: flex;
                gap: 4px;
                justify-content: center;
                padding-right: 10px !important;
            }

            /* ---- BADGES ---- */
            .tm-badge {
                padding: 2px 7px;
                border-radius: 100px;
                font-size: 10px;
                font-weight: 600;
                display: inline-block;
                white-space: nowrap;
                letter-spacing: 0.2px;
            }
            .tm-badge-not-found { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
            .tm-badge-ok { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
            .tm-badge-updated { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
            .tm-badge-warning { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
            .tm-badge-info { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
            .tm-badge-error { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
            .tm-badge-restante { background: #faf5ff; color: #6d28d9; border: 1px solid #ddd6fe; }
            .tm-badge-restante-warn { background: #fefce8; color: #92400e; border: 1px solid #fde047; }

            .tm-hidden { display: none !important; }

            /* ---- MODAL ---- */
            #tm-success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9999999;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .tm-modal-overlay {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(15,23,42,0.55);
                backdrop-filter: blur(4px);
            }
            .tm-modal-content {
                position: relative;
                background: #ffffff;
                padding: 32px 28px 24px;
                border-radius: 16px;
                text-align: center;
                box-shadow:
                    0 0 0 1px rgba(0,0,0,0.05),
                    0 25px 50px -12px rgba(0,0,0,0.18);
                width: 340px;
                z-index: 1;
                animation: tm-pop 0.25s cubic-bezier(0.34,1.56,0.64,1);
                font-family: 'Inter', system-ui, sans-serif;
            }
            @keyframes tm-pop {
                0% { transform: scale(0.88) translateY(8px); opacity: 0; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            .tm-modal-content h3 {
                margin: 0 0 8px 0;
                color: #0f172a;
                font-size: 18px;
                font-weight: 700;
                letter-spacing: -0.3px;
            }
            .tm-modal-content p {
                color: #64748b;
                margin: 0 0 24px 0;
                font-size: 14px;
                line-height: 1.5;
            }
        `;
    document.head.appendChild(style);

    const floatBtn = document.createElement('div');
    floatBtn.id = 'tm-floating-btn';
    floatBtn.innerHTML = `${logoSvg} <span>Imputación CSV</span>`;
    document.body.appendChild(floatBtn);

    const panel = document.createElement('div');
    panel.id = 'tm-panel';
    panel.innerHTML = `
            <div id="tm-header">
                <div class="tm-header-title">${logoSvg} Gestión de Imputaciones y Restante</div>
                <span id="tm-close" title="Cerrar">✕</span>
            </div>
            <div id="tm-body">
                <textarea id="tm-csv-input" class="tm-textarea" placeholder="Pega aquí los datos (Ej: ID_Proyecto;8;0;0;4;0;0;0)"></textarea>
                <div class="tm-actions-top">
                    <button type="button" id="tm-load-btn" class="tm-btn">Cargar Datos</button>
                    <button type="button" id="tm-clear-btn" class="tm-btn tm-btn-clear">Limpiar</button>
                </div>

                <div id="tm-workspace" class="tm-hidden">

                    <div class="tm-toolbar">
                        <div class="tm-filters">
                            <span class="tm-filter-title">Imputación:</span>
                            <label><input type="radio" name="tm-filter-imp" class="tm-radio-filter" value="all" checked> Todos</label>
                            <label><input type="radio" name="tm-filter-imp" class="tm-radio-filter" value="pending"> Pendientes</label>
                            <label><input type="radio" name="tm-filter-imp" class="tm-radio-filter" value="ok"> Correctos</label>
                            <label><input type="radio" name="tm-filter-imp" class="tm-radio-filter" value="error"> Errores</label>
                            <label><input type="radio" name="tm-filter-imp" class="tm-radio-filter" value="imputado"> Ya imputados</label>
                        </div>
                        <button type="button" id="tm-impute-all-btn" class="tm-btn tm-btn-impute-all">🚀 Imputar Todo</button>
                    </div>

                    <div class="tm-toolbar">
                        <div class="tm-filters">
                            <span class="tm-filter-title">Restante:</span>
                            <label><input type="radio" name="tm-filter-rest" class="tm-radio-filter" value="all" checked> Todos</label>
                            <label><input type="radio" name="tm-filter-rest" class="tm-radio-filter" value="pending"> Sin Calcular</label>
                            <label><input type="radio" name="tm-filter-rest" class="tm-radio-filter" value="ok"> OK</label>
                            <label><input type="radio" name="tm-filter-rest" class="tm-radio-filter" value="warning"> ⚠ Bloqueado</label>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button type="button" id="tm-calc-all-btn" class="tm-btn tm-btn-calc-all">🖩 Recalcular Todo</button>
                            <button type="button" id="tm-notify-chat-btn" class="tm-btn tm-btn-chat">💬 Notificar Chat</button>
                        </div>
                    </div>

                    <div class="tm-table-wrapper" id="tm-table-container"></div>
                </div>
            </div>
        `;
    document.body.appendChild(panel);

    const successModal = document.createElement('div');
    successModal.id = 'tm-success-modal';
    successModal.className = 'tm-hidden';
    successModal.innerHTML = `
            <div class="tm-modal-overlay"></div>
            <div class="tm-modal-content">
                <div style="font-size:44px; margin-bottom:12px; line-height:1;">✅</div>
                <h3>Proceso Completado</h3>
                <p id="tm-success-message"></p>
                <button type="button" id="tm-close-modal-btn" class="tm-btn" style="width:100%;">Aceptar</button>
            </div>
        `;
    document.body.appendChild(successModal);

    // =========================================================================
    // 4. ESTADO GLOBAL Y UTILIDADES
    // =========================================================================
    let stateData = [];
    const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const labelsDias = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function getMonday(d) {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }

    function normalizeValue(val) {
      if (!val || val.trim() === '') return '0';
      let strVal = val.trim();
      let parsed = parseFloat(strVal.replace(',', '.'));
      if (isNaN(parsed)) return '0';
      return parsed.toString().replace('.', ',');
    }

    function extractNumber(str) {
      if (!str || str.trim() === '-' || str.trim() === '') return 0;
      const match = str.match(/[\d,.]+/);
      if (!match) return 0;
      let numStr = match[0].replace(/\./g, '').replace(',', '.');
      let val = parseFloat(numStr);
      return isNaN(val) ? 0 : val;
    }

    function saveState() {
      const payload = {
        timestamp: Date.now(),
        projects: stateData,
      };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(payload));
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

          if (Array.isArray(parsed)) {
            stateData = parsed;
          } else {
            const savedMonday = getMonday(parsed.timestamp);
            const currentMonday = getMonday(Date.now());

            if (savedMonday < currentMonday) {
              console.log('Limpieza de LocalStorage: Datos de una semana anterior detectados.');
              localStorage.removeItem(CONFIG.STORAGE_KEY);
              stateData = [];
              return;
            }
            stateData = parsed.projects || [];
          }

          if (stateData.length > 0) {
            document.getElementById('tm-workspace').classList.remove('tm-hidden');
            checkExistingInDOM();
            renderList();
          }
        } catch (e) {
          console.error('Error recuperando estado local:', e);
        }
      }
    }

    function checkExistingInDOM() {
      const filas = document.querySelectorAll(CONFIG.ROW_SELECTOR);

      stateData.forEach((project) => {
        project.hasDomData = false;
        let filaTarget = null;

        for (let fila of filas) {
          if (!fila.querySelector(`input[id*="${CONFIG.INPUT_PREFIX}Lunes"]`)) continue;

          if (fila.textContent.includes(project.id) || fila.innerHTML.includes(project.id)) {
            filaTarget = fila;
            break;
          }
        }

        if (filaTarget) {
          for (let i = 0; i < 7; i++) {
            const selector = `input[id*="${CONFIG.INPUT_PREFIX}${diasSemana[i]}"]`;
            const inputDia = filaTarget.querySelector(selector);

            if (inputDia) {
              const val = normalizeValue(inputDia.value);
              if (val !== '0') {
                project.hasDomData = true;
                break;
              }
            }
          }
        }
      });
    }

    // =========================================================================
    // 5. EVENT LISTENERS DE LA INTERFAZ
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
        let newX = e.clientX - btnOffsetX;
        let newY = e.clientY - btnOffsetY;

        newX = Math.max(0, Math.min(newX, window.innerWidth - floatBtn.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - floatBtn.offsetHeight));

        floatBtn.style.left = newX + 'px';
        floatBtn.style.top = newY + 'px';
      }

      if (isPanelDragging) {
        let newX = e.clientX - panelOffsetX;
        let newY = e.clientY - panelOffsetY;

        newX = Math.max(0, Math.min(newX, window.innerWidth - panel.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - panel.offsetHeight));

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

      const isOpening = panel.style.display !== 'flex';
      panel.style.display = isOpening ? 'flex' : 'none';

      if (isOpening && stateData.length > 0) {
        checkExistingInDOM();
        renderList();
      }
    });

    let isPanelDragging = false;
    let panelOffsetX, panelOffsetY;
    const tmHeader = document.getElementById('tm-header');

    tmHeader.addEventListener('mousedown', (e) => {
      if (e.target.id === 'tm-close') return;

      isPanelDragging = true;
      const rect = panel.getBoundingClientRect();
      panelOffsetX = e.clientX - rect.left;
      panelOffsetY = e.clientY - rect.top;

      panel.style.right = 'auto';
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
    });

    document.getElementById('tm-close').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    document.getElementById('tm-clear-btn').addEventListener('click', () => {
      if (confirm('¿Seguro que deseas purgar la tabla y la memoria temporal?')) {
        stateData = [];
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        document.getElementById('tm-csv-input').value = '';
        document.getElementById('tm-workspace').classList.add('tm-hidden');
        renderList();
      }
    });

    document.getElementById('tm-load-btn').addEventListener('click', () => {
      const csv = document.getElementById('tm-csv-input').value.trim();
      if (!csv) return;

      const newData = parseCSV(csv);

      newData.forEach((newItem) => {
        const existingIdx = stateData.findIndex((item) => item.id === newItem.id);
        if (existingIdx !== -1) {
          stateData[existingIdx].days = newItem.days;
          stateData[existingIdx].status = newItem.status;
          stateData[existingIdx].notFound = newItem.notFound;
          stateData[existingIdx].extraColumns = newItem.extraColumns;
          stateData[existingIdx].updated = true;
          stateData[existingIdx].restanteVal = '-';
          stateData[existingIdx].restanteStatus = 'pending';
          evaluateProjectStatus(stateData[existingIdx]);
        } else {
          stateData.push(newItem);
        }
      });

      document.getElementById('tm-csv-input').value = '';
      document.getElementById('tm-workspace').classList.remove('tm-hidden');

      checkExistingInDOM();
      saveState();
      renderList();
    });

    document.querySelectorAll('.tm-radio-filter').forEach((radio) => {
      radio.addEventListener('change', renderList);
    });

    // =========================================================================
    // PROCESAMIENTO: "Imputar Todo"
    // =========================================================================
    document.getElementById('tm-impute-all-btn').addEventListener('click', async () => {
      const btn = document.getElementById('tm-impute-all-btn');
      btn.disabled = true;
      btn.innerText = '⏳ Procesando...';

      for (let i = 0; i < stateData.length; i++) {
        await processProject(i);
      }

      btn.disabled = false;
      btn.innerText = '🚀 Imputar Todo';

      document.getElementById('tm-success-message').innerHTML = 'La imputación masiva de horas ha finalizado.';
      document.getElementById('tm-success-modal').classList.remove('tm-hidden');
    });

    // =========================================================================
    // PROCESAMIENTO: "Recalcular Todo"
    // =========================================================================
    document.getElementById('tm-calc-all-btn').addEventListener('click', async () => {
      const btn = document.getElementById('tm-calc-all-btn');
      btn.disabled = true;
      btn.innerText = '⏳ Recalculando...';

      for (let i = 0; i < stateData.length; i++) {
        await processRestante(i);
      }

      btn.disabled = false;
      btn.innerText = '🖩 Recalcular Todo';

      document.getElementById('tm-success-message').innerHTML = "El recálculo de campos 'Restante' ha finalizado.";
      document.getElementById('tm-success-modal').classList.remove('tm-hidden');
    });

    // =========================================================================
    // NOTIFICAR POR CHAT (A DEMANDA)
    // =========================================================================
    document.getElementById('tm-notify-chat-btn').addEventListener('click', () => {
      if (!CONFIG.GOOGLE_CHAT_WEBHOOK || CONFIG.GOOGLE_CHAT_WEBHOOK.trim() === '') {
        alert('La URL del Webhook no está configurada.');
        return;
      }

      const btn = document.getElementById('tm-notify-chat-btn');
      btn.disabled = true;
      btn.innerText = '⏳ Enviando...';

      let lines = stateData.map((p) => {
        let rest = p.restanteVal && p.restanteVal !== '-' ? p.restanteVal : 'No calculado';
        let blockStr = p.restanteStatus === 'warning' ? ' [⚠️ Bloqueado en web]' : '';
        return `• Proyecto *${p.id}*: ${rest}h restantes${blockStr}`;
      });
      let msg = `✅ *Recálculo finalizado.*\n\n${lines.join('\n')}`;

      fetch(CONFIG.GOOGLE_CHAT_WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: JSON.stringify({text: msg}),
      })
        .then((res) => {
          if (res.ok) alert('Notificación enviada correctamente al Chat.');
          else alert('Fallo al enviar la notificación. Verifica el Webhook.');
        })
        .catch((e) => {
          console.error(e);
          alert('Error de red enviando la notificación.');
        })
        .finally(() => {
          btn.disabled = false;
          btn.innerText = '💬 Notificar Chat';
        });
    });

    document.getElementById('tm-close-modal-btn').addEventListener('click', () => {
      document.getElementById('tm-success-modal').classList.add('tm-hidden');
    });

    // =========================================================================
    // 6. FUNCIONES CORE Y LÓGICA DE NEGOCIO
    // =========================================================================
    function parseCSV(csv) {
      const lines = csv.split('\n');
      const data = [];
      lines.forEach((line) => {
        const cols = line.split(';');
        if (cols.length >= 1 && cols[0].trim() !== '') {
          const project = {
            id: cols[0].trim(),
            status: 'pending',
            notFound: false,
            updated: false,
            hasDomData: false,
            extraColumns: cols.length > 8,
            restanteVal: '-',
            restanteStatus: 'pending',
            days: [],
          };
          for (let i = 0; i < 7; i++) {
            let h = normalizeValue(cols[i + 1]);
            project.days.push({
              name: diasSemana[i],
              hours: h,
              status: 'pending',
            });
          }
          data.push(project);
        }
      });
      return data;
    }

    async function handleClipboardPaste(pIndex) {
      let text = '';
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          text = await navigator.clipboard.readText();
        } else {
          throw new Error('API Restringida');
        }
      } catch (e) {
        text = prompt('Pega aquí los valores para este proyecto (Ej: 8;0;0;4;0;0;0):');
      }

      if (!text) return;

      const cols = text.trim().split(';');
      let startIdx = 0;
      const project = stateData[pIndex];

      if (cols[0].trim() === project.id) {
        startIdx = 1;
        project.extraColumns = cols.length > 8;
      } else {
        startIdx = 0;
        project.extraColumns = cols.length > 7;
      }

      project.updated = true;
      for (let i = 0; i < 7; i++) {
        let h = normalizeValue(cols[startIdx + i]);
        project.days[i].hours = h;
        project.days[i].status = 'pending';
      }

      evaluateProjectStatus(project);
      checkExistingInDOM();
      saveState();
      renderList();
    }

    function evaluateProjectStatus(project) {
      let hasError = false;
      let hasPending = false;
      let hasSuccess = false;

      project.days.forEach((d) => {
        if (d.status === 'error') hasError = true;
        if (d.status === 'pending') hasPending = true;
        if (d.status === 'ok') hasSuccess = true;
      });

      if (hasError || project.notFound) project.status = 'error';
      else if (hasPending) project.status = 'pending';
      else project.status = 'ok';
    }

    function renderList() {
      const filterImp = document.querySelector('input[name="tm-filter-imp"]:checked').value;
      const filterRest = document.querySelector('input[name="tm-filter-rest"]:checked').value;

      const container = document.getElementById('tm-table-container');

      let html = `<table class="tm-table">
                <thead>
                    <tr>
                        <th class="tm-col-proj-th">Proyecto</th>`;
      labelsDias.forEach((d) => (html += `<th class="tm-col-day-th">${d}</th>`));
      html += `   <th class="tm-col-day-th">Σ</th>
                        <th class="tm-col-day-th" style="width: 70px;">Rest.</th>
                        <th class="tm-col-actions-th">Acciones</th>
                    </tr>
                </thead>
                <tbody>`;

      let totals = [0, 0, 0, 0, 0, 0, 0];

      stateData.forEach((project, pIndex) => {
        if (filterImp !== 'all') {
          if (filterImp === 'imputado' && !project.hasDomData) return;
          if (filterImp !== 'imputado' && project.status !== filterImp) return;
        }
        if (filterRest !== 'all') {
          if (project.restanteStatus !== filterRest) return;
        }

        let badgeHtml = '';
        if (project.notFound) badgeHtml += `<span class="tm-badge tm-badge-error">No encontrado</span>`;
        else if (project.status === 'error') badgeHtml += `<span class="tm-badge tm-badge-error">⚠ Error</span>`;
        else if (project.status === 'ok') badgeHtml += `<span class="tm-badge tm-badge-ok">✓ Completado</span>`;

        if (project.updated) badgeHtml += ` <span class="tm-badge tm-badge-updated">Actualizado</span>`;
        if (project.hasDomData) badgeHtml += ` <span class="tm-badge tm-badge-info" title="Ya existen horas imputadas">Ya imputado</span>`;
        if (project.extraColumns)
          badgeHtml += ` <span class="tm-badge tm-badge-warning" title="El CSV contenía más columnas de las esperadas">Exceso col</span>`;

        let restBadge = '';
        if (project.restanteStatus === 'ok')
          restBadge = `<div class="tm-badge tm-badge-restante" title="Recalculado e inyectado correctamente">${project.restanteVal}</div>`;
        else if (project.restanteStatus === 'warning')
          restBadge = `<div class="tm-badge tm-badge-restante-warn" title="Campo bloqueado en web. Cálculo: ${project.restanteVal}">⚠ Bloq.</div>`;
        else if (project.restanteStatus === 'error')
          restBadge = `<div class="tm-badge tm-badge-error" title="No se encontraron las celdas necesarias">Error DOM</div>`;
        else restBadge = `<div style="color:#cbd5e1; font-size:11px;">—</div>`;

        html += `<tr>
                    <td class="tm-col-proj" title="${project.id}">
                        <div class="tm-proj-container">
                            <span class="tm-proj-id">${project.id}</span>
                            ${badgeHtml}
                        </div>
                    </td>`;

        let rowTotal = 0;

        project.days.forEach((day, dIndex) => {
          let cssClass = '';
          if (day.status === 'ok') cssClass = 'tm-state-ok';
          else if (day.status === 'error') cssClass = 'tm-state-error';
          else if (day.status === 'pending') cssClass = 'tm-state-pending';

          const numVal = parseFloat(day.hours.replace(',', '.'));
          if (!isNaN(numVal)) {
            totals[dIndex] += numVal;
            rowTotal += numVal;
          }

          html += `<td>
                        <input type="text" class="tm-input-hour ${cssClass}" data-p="${pIndex}" data-d="${dIndex}" value="${day.hours}">
                    </td>`;
        });

        html += `<td style="font-weight:700; color:#276466; background:#f0fafa; border-radius:4px; font-size:12px; letter-spacing:-0.3px;">${rowTotal.toString().replace('.', ',')}</td>`;

        html += `<td>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                                ${restBadge}
                                <button type="button" class="tm-btn-icon tm-btn-icon-calc tm-calc-row" data-index="${pIndex}" title="Recalcular Restante" style="width:24px; height:24px; padding:0; font-size:11px;">🖩</button>
                            </div>
                         </td>`;

        html += `<td class="tm-actions-cell">
                    <button type="button" class="tm-btn-icon tm-paste-row" data-index="${pIndex}" title="Pegar horas (Ctrl+V)">📋</button>
                    <button type="button" class="tm-btn-icon tm-btn-icon-impute tm-impute-row" data-index="${pIndex}" title="Imputar">⚡</button>
                    <button type="button" class="tm-btn-icon tm-btn-icon-delete tm-delete-row" data-index="${pIndex}" title="Eliminar fila">🗑</button>
                </td></tr>`;
      });

      html += `</tbody>
                <tfoot>
                    <tr>
                        <th style="text-align:right; padding-right:16px; font-size:11px; letter-spacing:0.5px;">TOTAL</th>`;

      let grandTotal = 0;
      totals.forEach((t) => {
        html += `<th>${t !== 0 ? t.toString().replace('.', ',') : '—'}</th>`;
        grandTotal += t;
      });

      html += `       <th style="color:#276466;">${grandTotal !== 0 ? grandTotal.toString().replace('.', ',') : '—'}</th>
                            <th></th>
                            <th></th>
                    </tr>
                </tfoot>
            </table>`;

      container.innerHTML = html;

      document.querySelectorAll('.tm-input-hour').forEach((input) => {
        input.addEventListener('change', (e) => {
          const pIdx = e.target.getAttribute('data-p');
          const dIdx = e.target.getAttribute('data-d');
          const val = normalizeValue(e.target.value);

          stateData[pIdx].days[dIdx].hours = val;
          stateData[pIdx].days[dIdx].status = 'pending';
          stateData[pIdx].updated = false;

          evaluateProjectStatus(stateData[pIdx]);
          saveState();
          renderList();
        });
      });

      document.querySelectorAll('.tm-impute-row').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const idx = e.target.getAttribute('data-index');
          stateData[idx].days.forEach((d) => (d.status = 'pending'));
          e.target.disabled = true;
          e.target.innerText = '⏳';
          await processProject(idx);
        });
      });

      document.querySelectorAll('.tm-calc-row').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const idx = e.target.getAttribute('data-index');
          e.target.disabled = true;
          e.target.innerText = '⏳';
          await processRestante(idx);
        });
      });

      document.querySelectorAll('.tm-paste-row').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = e.target.getAttribute('data-index');
          handleClipboardPaste(idx);
        });
      });

      document.querySelectorAll('.tm-delete-row').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = e.target.getAttribute('data-index');
          if (confirm('¿Estás seguro de que deseas eliminar esta fila?')) {
            stateData.splice(idx, 1);
            saveState();
            renderList();
          }
        });
      });
    }

    async function processProject(index) {
      const project = stateData[index];
      const filas = document.querySelectorAll(CONFIG.ROW_SELECTOR);
      let filaTarget = null;

      for (let fila of filas) {
        if (!fila.querySelector(`input[id*="${CONFIG.INPUT_PREFIX}Lunes"]`)) continue;

        if (fila.textContent.includes(project.id) || fila.innerHTML.includes(project.id)) {
          filaTarget = fila;
          break;
        }
      }

      project.updated = false;

      if (!filaTarget) {
        project.notFound = true;
        project.days.forEach((d) => {
          if (d.status === 'pending') d.status = 'error';
        });
      } else {
        project.notFound = false;

        for (let day of project.days) {
          if (day.status === 'ok') continue;

          const selector = `input[id*="${CONFIG.INPUT_PREFIX}${day.name}"]`;
          const inputDia = filaTarget.querySelector(selector);

          if (!inputDia) {
            day.status = 'error';
            continue;
          }

          const valorActual = normalizeValue(inputDia.value);
          const estaBloqueada =
            inputDia.disabled === true ||
            inputDia.hasAttribute('disabled') ||
            inputDia.readOnly === true ||
            inputDia.className.includes('disabled') ||
            inputDia.className.includes('aspNetDisabled');

          if (estaBloqueada) {
            if (day.hours === '0' && valorActual === '0') {
              day.status = 'ok';
            } else {
              day.status = 'error';
            }
          } else {
            inputDia.value = day.hours;
            inputDia.dispatchEvent(new Event('change', {bubbles: true}));
            day.status = 'ok';

            renderList();
            await sleep(CONFIG.DELAY_MS);
          }
        }
      }

      evaluateProjectStatus(project);
      checkExistingInDOM();
      saveState();
      renderList();
    }

    async function processRestante(index) {
      const project = stateData[index];
      const filas = document.querySelectorAll(CONFIG.ROW_SELECTOR);
      let filaTarget = null;

      for (let fila of filas) {
        if (!fila.querySelector(`input[id*="${CONFIG.INPUT_PREFIX}Lunes"]`)) continue;
        if (fila.textContent.includes(project.id) || fila.innerHTML.includes(project.id)) {
          filaTarget = fila;
          break;
        }
      }

      if (!filaTarget) {
        project.restanteStatus = 'error';
        saveState();
        renderList();
        return;
      }

      const lblPlanificado = filaTarget.querySelector('[id*="lblTrabajoPlanificado"]');
      const txtIncurrido = filaTarget.querySelector('input[id*="txtHorasIncurridas"]');
      const txtRestante = filaTarget.querySelector('input[id*="txtHorasRestantes"]');

      if (!lblPlanificado || !txtIncurrido || !txtRestante) {
        project.restanteStatus = 'error';
        saveState();
        renderList();
        return;
      }

      const plan = extractNumber(lblPlanificado.textContent);
      const inc = extractNumber(txtIncurrido.value);
      let rest = 0;

      if (plan > inc) {
        // Aquí aplicamos el redondeo hacia arriba para obtener el número entero
        rest = Math.ceil(plan - inc);
      } else {
        rest = 8;
      }

      project.restanteVal = rest.toString().replace('.', ',');

      const isBlocked =
        txtRestante.disabled === true ||
        txtRestante.hasAttribute('disabled') ||
        txtRestante.readOnly === true ||
        txtRestante.className.includes('disabled') ||
        txtRestante.className.includes('aspNetDisabled');

      if (isBlocked) {
        project.restanteStatus = 'warning';
      } else {
        txtRestante.value = project.restanteVal;
        txtRestante.dispatchEvent(new Event('change', {bubbles: true}));
        project.restanteStatus = 'ok';
      }

      saveState();
      renderList();
      await sleep(CONFIG.DELAY_MS);
    }

    loadState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarScript);
  } else {
    inicializarScript();
  }
})();
