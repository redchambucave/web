/* ============================================================
   FALLAS.JS — Lee avisos desde Google Sheets (CSV público)
   ------------------------------------------------------------
   NO edites este archivo para cambiar los avisos.
   Edita directamente la hoja de Google Sheets.
   ============================================================ */

/* ⚙️ CONFIGURACIÓN: pega aquí la URL de tu Google Sheets */
const FALLAS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTYzwtlciW3oOPR6S-yYU6u2KANgDUDMwX1WmUEsqN7cXBVRYqDH4s85F3qTQCsj_EHu_XlSRd2N_QG/pub?output=csv';

/* Almacén en memoria */
window.FALLAS = [];

/* ============================================================
   CARGAR AVISOS
   ============================================================ */
window.cargarFallas = async function () {
  try {
    // cache-buster: evita que el navegador use una versión vieja
    const url = FALLAS_SHEET_URL + '&t=' + Date.now();
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const csv = await res.text();
    window.FALLAS = parsearCSV(csv);

    console.log('[Fallas] Cargados:', window.FALLAS.length, 'avisos');
    return window.FALLAS;
  } catch (e) {
    console.warn('[Fallas] Error al cargar desde Google Sheets:', e);
    window.FALLAS = [];
    return [];
  }
};

/* ============================================================
   PARSER CSV (soporta comillas y saltos de línea escapados)
   ============================================================ */
function parsearCSV(csv) {
  const lineas = dividirFilas(csv);
  if (lineas.length < 2) return [];

  const cabeceras = parsearLinea(lineas[0]).map(h =>
    h.trim().toLowerCase().replace(/^"|"$/g, '')
  );

  const filas = [];

  for (let i = 1; i < lineas.length; i++) {
    const valores = parsearLinea(lineas[i]);
    const obj = {};

    cabeceras.forEach((h, idx) => {
      let v = (valores[idx] || '').trim().replace(/^"|"$/g, '');
      obj[h] = v;
    });

    // Ignorar filas sin id o sin zona
    if (!obj.id || !obj.zona) continue;

    // Convertir tipos
    obj.id = parseInt(obj.id, 10);
    obj.mostrarHistorial = ['si', 'sí', 'true', '1', 'x', 'yes'].includes(
      (obj.mostrar || '').toLowerCase()
    );

    // Ignorar filas que no tengan estado válido
    if (!['programado', 'activo', 'resuelto'].includes(obj.estado)) {
      console.warn('[Fallas] Fila con estado inválido:', obj);
      continue;
    }

    filas.push(obj);
  }

  return filas;
}

/* Divide el CSV en filas respetando saltos de línea dentro de comillas */
function dividirFilas(csv) {
  const filas = [];
  let actual = '';
  let dentroComillas = false;

  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];

    if (c === '"') {
      dentroComillas = !dentroComillas;
      actual += c;
    } else if ((c === '\n' || c === '\r') && !dentroComillas) {
      if (actual.trim()) filas.push(actual);
      actual = '';
      if (c === '\r' && csv[i + 1] === '\n') i++;
    } else {
      actual += c;
    }
  }

  if (actual.trim()) filas.push(actual);
  return filas;
}

/* Parsea una sola línea CSV respetando comillas */
function parsearLinea(linea) {
  const resultado = [];
  let actual = '';
  let dentroComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];

    if (c === '"') {
      if (dentroComillas && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else {
        dentroComillas = !dentroComillas;
      }
    } else if (c === ',' && !dentroComillas) {
      resultado.push(actual);
      actual = '';
    } else {
      actual += c;
    }
  }

  resultado.push(actual);
  return resultado;
}
