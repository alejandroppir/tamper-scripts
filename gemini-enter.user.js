// ==UserScript==
// @name         Gemini: Enter = newline, Ctrl+Enter = send (VDI Optimized)
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.0.0
// @description  Enter = salto de línea, Ctrl+Enter/Cmd+Enter = enviar.
// @match        https://gemini.google.com/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/gemini-enter.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/gemini-enter.user.js
// ==/UserScript==

(function () {
  'use strict';

  const DEBUG = false; // Cambia a true si quieres ver las trazas en consola

  if (DEBUG) console.log('[Gemini-Fix] Script cargado en modo VDI.');

  document.addEventListener(
    'keydown',
    function (e) {
      // Solo actuar si es la tecla Enter y no se está componiendo texto (IME de emojis/acentos)
      if (e.key !== 'Enter' || e.isComposing) return;

      // FILTRO CRÍTICO: Asegurarnos de que el usuario está escribiendo DENTRO del editor de chat
      const editor = e.target.closest('[contenteditable="true"]');
      if (!editor) return;

      // Evitar bucles infinitos con los eventos simulados por este mismo script
      if (e.isSimulatedEvent) return;

      if (e.ctrlKey || e.metaKey) {
        // ==========================================
        // CASO 1: Ctrl+Enter o Cmd+Enter -> ENVIAR
        // ==========================================
        e.preventDefault();
        e.stopPropagation();

        if (DEBUG) console.log('[Gemini-Fix] Ctrl+Enter detectado -> Simulando Enter nativo (Enviar)');

        // Simulamos un Enter común y corriente (que Gemini interpreta como enviar)
        const enviarEvt = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        });

        // Le añadimos una propiedad oculta para saber que es nuestro y no volverlo a capturar
        Object.defineProperty(enviarEvt, 'isSimulatedEvent', {value: true});
        e.target.dispatchEvent(enviarEvt);
      } else if (!e.shiftKey && !e.altKey) {
        // ==========================================
        // CASO 2: Enter a secas -> SALTO DE LÍNEA
        // ==========================================
        e.preventDefault();
        e.stopPropagation();

        if (DEBUG) console.log('[Gemini-Fix] Enter a secas detectado -> Simulando Shift+Enter nativo (Salto de línea)');

        // Simulamos un Shift+Enter. El editor de Gemini lo procesará de forma nativa
        // manteniendo el cursor exactamente donde debe estar y respetando el Ctrl+Z.
        const saltoEvt = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          shiftKey: true, // Aquí ocurre la magia para la VDI
          bubbles: true,
          cancelable: true,
        });

        Object.defineProperty(saltoEvt, 'isSimulatedEvent', {value: true});
        e.target.dispatchEvent(saltoEvt);
      }
    },
    true,
  ); // Usamos fase de captura (true) para adelantarnos a los scripts de Google
})();
