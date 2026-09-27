/* ============================================
   LÓGICA DE TASA AUTOMÁTICA
   ============================================
   🌐 Fuente 1: Cloudflare Worker → BCV directo (oficial, sin retraso)
   🌐 Fuente 2: dolarapi (respaldo)
   💾 Caché: localStorage (1 consulta por día)
   🛟 Respaldo: TASA_FALLBACK (manual)
   ============================================ */

// ⚙️ CONFIGURACIÓN
// ─────────────────────────────────────────────
// Precios de tus planes en USD
const PLANES_USD = {
  basico:   23.2,
  avanzado: 29,
  plus:     35,
  antena:   23.2
};

// 🛟 RESPALDO MANUAL — Solo se usa si TODAS las fuentes fallan
const TASA_FALLBACK = {
  valor: 0.0,
  fecha: "2026-09-17",   // YYYY-MM-DD
  hora:  "6:00 PM"
};

// 🌐 Fuentes (en orden de prioridad)
const WORKER = 'https://tasas-ve.jfrp2004m.workers.dev';
const API_BCV_DIRECTO = WORKER + '/?url=' + encodeURIComponent('https://www.bcv.org.ve/');
const API_DOLARAPI = 'https://ve.dolarapi.com/v1/dolares/oficial';

// 🔑 Clave de caché (nueva versión para invalidar las anteriores)
const CACHE_KEY = 'redchambu_tasa_bcv_v4';
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

// Convierte Date → "YYYY-MM-DD" en zona Venezuela (no UTC)
const fechaVE = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(d);

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
  } else if (fuente === 'respaldo') {
    badge.className = 'status-badge';
    badge.innerHTML = '<span class="dot"></span> Respaldo';
  } else {
    badge.className = 'status-badge red';
    badge.innerHTML = '<span class="dot"></span> Modo respaldo';
  }

  document.getElementById('planBasicBs').textContent    = fmtBs(PLANES_USD.basico   * valor);
  document.getElementById('planAdvancedBs').textContent = fmtBs(PLANES_USD.avanzado * valor);
  document.getElementById('planPlusBs').textContent     = fmtBs(PLANES_USD.plus     * valor);
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
    const hoy = fechaVE();
    // Caché válida si es del mismo día (zona VE)
    if (data.fechaCache === hoy && data.valor) return data;
    return null;
  } catch { return null; }
}

function guardarCache(d) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...d,
      fechaCache: fechaVE()
    }));
  } catch {}
}

/* ============================================
   FUENTE 1: Worker → BCV directo
   ============================================ */
async function consultarBCVDirecto() {
  const res = await fetchConTimeout(API_BCV_DIRECTO);
  if (!res.ok) throw new Error('BCV HTTP ' + res.status);

  const data = await res.json();
  if (typeof data?.price !== 'number' || isNaN(data.price)) {
    throw new Error('BCV sin precio válido');
  }

  // El Worker devuelve la hora del scraping en `fecha` (UTC ISO).
  // La fecha de vigencia real la asumimos como "hoy en Venezuela".
  // (El BCV publica la tasa del día hábil siguiente).
  const ahora = new Date();
  return {
    valor: data.price,
    fecha: fechaVE(ahora),
    hora:  ahora.toLocaleTimeString('es-VE', {
      timeZone: 'America/Caracas',
      hour: '2-digit', minute: '2-digit', hour12: true
    }),
    fuente: 'BCV directo'
  };
}

/* ============================================
   FUENTE 2: dolarapi (respaldo)
   ============================================ */
async function consultarDolarAPI() {
  const res = await fetchConTimeout(API_DOLARAPI);
  if (!res.ok) throw new Error('HTTP ' + res.status);

  const data = await res.json();
  if (typeof data?.promedio !== 'number') {
    throw new Error('Respuesta sin promedio');
  }

  const f = new Date(data.fechaActualizacion || Date.now());
  return {
    valor: data.promedio,
    fecha: fechaVE(f),
    hora:  f.toLocaleTimeString('es-VE', {
      timeZone: 'America/Caracas',
      hour: '2-digit', minute: '2-digit', hour12: true
    }),
    fuente: 'dolarapi'
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

  // 2) Worker → BCV directo (prioridad)
  try {
    const tasa = await consultarBCVDirecto();
    console.log('[Tasa BCV] ✅ BCV directo:', tasa);
    guardarCache(tasa);
    renderTasa(tasa, 'api');
    return;
  } catch (err) {
    console.warn('[Tasa BCV] ❌ Worker falló:', err.message);
  }

  // 3) dolarapi (respaldo)
  try {
    const tasa = await consultarDolarAPI();
    console.log('[Tasa BCV] ⚠️ dolarapi (respaldo):', tasa);
    guardarCache(tasa);
    renderTasa(tasa, 'respaldo');
    return;
  } catch (err) {
    console.warn('[Tasa BCV] ❌ dolarapi falló:', err.message);
  }

  // 4) Respaldo manual (último recurso)
  console.warn('[Tasa BCV] 🛟 Usando respaldo manual');
  renderTasa(
    {
      valor: TASA_FALLBACK.valor,
      fecha: TASA_FALLBACK.fecha,
      hora:  TASA_FALLBACK.hora
    },
    'manual'
  );
}

// Limpia cachés viejas automáticamente
try {
  ['v1','v2','v3'].forEach(v =>
    localStorage.removeItem('redchambu_tasa_bcv_' + v)
  );
} catch {}

// Ejecutar
cargarTasa();
