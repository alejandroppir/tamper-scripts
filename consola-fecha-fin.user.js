// ==UserScript==
// @name         Metrópolis: Ajustar Fecha Fin (+1h)
// @namespace    https://github.com/alejandroppir/tamper-scripts
// @author       @alejandroppir
// @version      1.0.0
// @description  Ajusta automáticamente el campo "Fecha de fin" a la hora actual + 1 hora en las transacciones finalizadas.
// @match        http://tpmetroo2kc:9080/IFRTJ030/finalizadas*
// @match        http://tcmetroo2kc:9080/IFRTJ030/finalizadas*
// @match        http://dpmetroo2kc:9080/IFRTJ030/finalizadas*
// @match        http://dcmetroo2kc:9080/IFRTJ030/finalizadas*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/consola-fecha-fin.user.js
// @downloadURL  https://raw.githubusercontent.com/alejandroppir/tamper-scripts/main/consola-fecha-fin.user.js
// ==/UserScript==

(function () {
  'use strict';

  const DEBUG = false; // Cambia a true para ver trazas en la consola

  if (DEBUG) console.log('[Metrópolis-Script] Iniciando script de ajuste de fecha...');

  // Buscamos el input por su ID directamente
  const inputFechaFin = document.getElementById('fechaFin');

  if (inputFechaFin) {
    // Calculamos la fecha y hora actual + 1 hora
    const fechaModificada = new Date();
    fechaModificada.setHours(fechaModificada.getHours() + 1);

    // Función auxiliar para añadir el cero a la izquierda si el número es menor a 10
    const pad = (num) => num.toString().padStart(2, '0');

    // Extraemos los componentes de la fecha
    const anio = fechaModificada.getFullYear();
    const mes = pad(fechaModificada.getMonth() + 1); // getMonth() es 0-indexado
    const dia = pad(fechaModificada.getDate());
    const horas = pad(fechaModificada.getHours());
    const minutos = pad(fechaModificada.getMinutes());
    const segundos = pad(fechaModificada.getSeconds());

    // Construimos la cadena con el formato esperado: YYYY-MM-DD HH:mm:ss
    const nuevaFechaString = `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

    // Asignamos el nuevo valor al campo
    inputFechaFin.value = nuevaFechaString;

    if (DEBUG) console.log(`[Metrópolis-Script] Fecha Fin ajustada correctamente a: ${nuevaFechaString}`);
  } else {
    if (DEBUG) console.log('[Metrópolis-Script] No se encontró el campo de Fecha Fin (id="fechaFin").');
  }
})();
