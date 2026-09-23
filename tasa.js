/* ============================================
   LÓGICA DE TASA AUTOMÁTICA
   ============================================
   🌐 API: https://ve.dolarapi.com/v1/dolares/oficial
   💾 Caché: localStorage (1 consulta por día)
   🛟 Respaldo: TASA_FALLBACK (manual) 
   ============================================ */

// ⚙️ CONFIGURACIÓN
// ─────────────────────────────────────────────
// Precios de tus planes en USD
const PLANES_USD = {
  basico:   23.2,
  avanzado: 29,
   plus:   35,
  antena:   23.2
};

// 🛟 RESPALDO MANUAL — Solo se usa si la API falla
const TASA_FALLBACK = {
  valor: 0.0,
  fecha: "2026-09-17",   // YYYY-MM-DD
  hora:  "6:00 PM"
};

// 🌐 API oficial
const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

// 🔑 Clave de caché (nueva versión para invalidar las anteriores)
const CACHE_KEY = 'redchambu_tasa_bcv_v3';
// ─────────────────────────────────────────────

/* ============================================
   HELPERS
   ============================================ */
const fmtBs = (v) =>
  Number(v).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const fmtFecha = (iso) => {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('es-VE', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch { return iso; }
};

const fetchConTimeout = (url, ms = 9000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal, cache: 'no-store' })
    .finally(() => clearTimeout(t));
};

/* ============================================
   RENDER
   ============================================ */
function renderTasa({ valor, fecha, hora }, fuente) {
  const rateValueEl = document.getElementById('rateValue');
  rateValueEl.classList.remove('loading');
  rateValueEl.innerHTML = fmtBs(valor) + ' <span class="currency">Bs/USD</span>';

  document.getElementById('rateDate').textContent = fmtFecha(fecha);
  document.getElementById('rateTime').textContent = hora;
  document.getElementById('lastUpdate').textContent =
    `${fmtFecha(fecha)} a las ${hora}`;

  const badge = document.getElementById('statusBadge');
  if (fuente === 'api') {
    badge.className = 'status-badge';
    badge.innerHTML = '<span class="dot"></span> Actualizado';
  } else {
    badge.className = 'status-badge red';
    badge.innerHTML = '<span class="dot"></span> Modo respaldo';
  }

  document.getElementById('planBasicBs').textContent    = fmtBs(PLANES_USD.basico   * valor);
  document.getElementById('planAdvancedBs').textContent = fmtBs(PLANES_USD.avanzado * valor);
  document.getElementById('planPlusBs').textContent = fmtBs(PLANES_USD.plus * valor);
  document.getElementById('planAntennaBs').textContent  = fmtBs(PLANES_USD.antena   * valor);
}

/* ============================================
   CACHÉ
   ============================================ */
function leerCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const hoy = new Date().toISOString().split('T')[0];
    if (data.fechaCache === hoy && data.valor) return data;
    return null;
  } catch { return null; }
}

function guardarCache(d) {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...d, fechaCache: hoy }));
  } catch {}
}

/* ============================================
   CONSULTA A LA API
   ============================================ */
async function consultarAPI() {
  const res = await fetchConTimeout(API_URL);
  if (!res.ok) throw new Error('HTTP ' + res.status);

  const data = await res.json();
  if (typeof data?.promedio !== 'number') {
    throw new Error('Respuesta sin promedio');
  }

  const f = new Date(data.fechaActualizacion || Date.now());
  return {
    valor: data.promedio,
    fecha: f.toISOString().split('T')[0],
    hora:  f.toTimeString().slice(0, 5)
  };
}

/* ============================================
   FLUJO PRINCIPAL
   ============================================ */
async function cargarTasa() {
  // 1) Caché del día
  const cache = leerCache();
  if (cache) {
    console.log('[Tasa BCV] 💾 Caché del día:', cache);
    renderTasa(cache, 'api');
    return;
  }

  // 2) API
  try {
    const tasa = await consultarAPI();
    console.log('[Tasa BCV] ✅ dolarapi:', tasa);
    guardarCache(tasa);
    renderTasa(tasa, 'api');
  } catch (err) {
    console.warn('[Tasa BCV] ❌ API falló, usando respaldo manual:', err);
    renderTasa(
      {
        valor: TASA_FALLBACK.valor,
        fecha: TASA_FALLBACK.fecha,
        hora:  TASA_FALLBACK.hora
      },
      'manual'
    );
  }
}

// Limpia cachés viejas automáticamente
try {
  localStorage.removeItem('redchambu_tasa_bcv_v1');
  localStorage.removeItem('redchambu_tasa_bcv_v2');
} catch {}

// Ejecutar
cargarTasa();
