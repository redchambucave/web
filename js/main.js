/* ============================================================
   MAIN.JS — REDCHAMBU CA (Fiber Light)
   - Menú móvil
   - Header scroll
   - Inyección del bot
   - Renderizado de planes desde data.js
   - Renderizado de contacto
   - Renderizado de zonas (tags)
   - Renderizado de avisos de la red (desde Google Sheets)
   - Medidor radial + contadores
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. MENÚ MÓVIL
     ============================================================ */
  function initMenu() {
    const mnav      = document.getElementById('mnav');
    const menuBtn   = document.getElementById('menuBtn');
    const menuClose = document.getElementById('menuClose');

    if (!mnav || !menuBtn || !menuClose) return;

    function openMenu() {
      mnav.classList.add('open');
      mnav.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      mnav.classList.remove('open');
      mnav.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    mnav.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mnav.classList.contains('open')) closeMenu();
    });

    const mq = window.matchMedia('(min-width: 960px)');
    mq.addEventListener('change', (e) => { if (e.matches) closeMenu(); });
  }

  /* ============================================================
     2. HEADER SCROLL
     ============================================================ */
  function initHeader() {
    const hdr = document.getElementById('hdr');
    if (!hdr) return;
    window.addEventListener('scroll', () => {
      hdr.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ============================================================
     3. INYECCIÓN DEL BOT
     ============================================================ */
  function injectBot() {
    if (document.getElementById('bot-toggle')) return;

    const html = `
      <button id="bot-toggle" aria-label="Abrir chat">💬</button>

      <div id="bot-window" class="bot-hidden">
        <div class="bot-header">
          <span class="bot-title">
            <img src="img/robot.webp" alt="ChambuBot" class="bot-avatar-header">
            <span>ChambuBot</span>
          </span>
          <button id="bot-close" aria-label="Cerrar">✕</button>
        </div>

        <div class="bot-messages" id="bot-messages">
          <div class="msg bot">
            <img src="img/robot.webp" alt="ChambuBot" class="bot-avatar-msg">
          </div>
          <div class="msg bot">
            <span>¡Hola! 👋 Soy tu asistente ChambuBot.</span>
          </div>
        </div>

        <div id="bot-toolbar">
          <button type="button" id="bot-atras" title="Volver al paso anterior">✏️ Corregir anterior</button>
          <button type="button" id="bot-reiniciar" title="Empezar de nuevo">🔄</button>
        </div>

        <div id="bot-suggestions" class="bot-suggestions"></div>

        <form id="bot-form" class="bot-input">
          <input id="bot-input" type="text" placeholder="Escribe tu pregunta..." autocomplete="off">
          <button type="submit">➤</button>
        </form>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    if (!document.querySelector('script[src*="bot.js"]')) {
      const s = document.createElement('script');
      s.src = 'js/bot.js';
      s.defer = true;
      document.body.appendChild(s);
    }
  }

  /* ============================================================
     4. RENDERIZADO DE PLANES
     ============================================================ */
  function renderPlanes() {
    const grid = document.querySelector('[data-planes]');
    if (!grid || !window.REDCHAMBU) return;

    const { planes } = window.REDCHAMBU;
    const order = ['basico', 'avanzado', 'plus', 'antena'];

    grid.innerHTML = order.map(key => {
      const p = planes[key];
      const isFibra = p.tipo === 'fibra';
      const techLabel = isFibra ? 'FIBRA' : 'RADIO';
      const techIcon  = isFibra ? 'fa-network-wired' : 'fa-satellite-dish';
      const techClass = isFibra ? '' : ' gold';
      const featured  = p.popular ? ' plan-featured' : '';
      const btnClass  = p.popular ? 'btn btn-primary btn-block' : 'btn btn-outline btn-block';
      const ribbon    = p.popular ? '<div class="plan-ribbon mono">★ MÁS POPULAR</div>' : '';

      return `
        <article class="plan${featured}">
          ${ribbon}
          <div class="plan-top">
            <span class="plan-tech mono${techClass}">
              <i class="fas ${techIcon}"></i> ${techLabel}
            </span>
            <h3 class="plan-name">${p.nombre}</h3>
          </div>

          <div class="plan-speed">
            <span class="num mono">${p.mbps}</span>
            <span class="unit">Mbps</span>
          </div>

          <ul class="plan-features">
            ${p.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
          </ul>

          <div class="plan-foot">
            <div class="plan-price">
              <span class="cur">Ref</span><span class="amt mono">${p.usd}</span><span class="per">/mes</span>
            </div>
            <a href="#contacto" class="${btnClass}">Contratar</a>
          </div>
        </article>
      `;
    }).join('');
  }

  /* ============================================================
     5. RENDERIZADO DE CONTACTO
     ============================================================ */
  function renderContacto() {
    const box = document.querySelector('[data-contacto]');
    if (!box || !window.REDCHAMBU) return;

    const { empresa } = window.REDCHAMBU;
    const waMsg = encodeURIComponent("Hola REDCHAMBU CA, quiero información sobre sus planes de internet");
    const waUrl = `https://wa.me/${empresa.whatsapp}?text=${waMsg}`;

    box.innerHTML = `
      <div class="cta-copy">
        <div class="sect-meta">
          <span class="sect-num mono gold">03</span>
          <span class="sect-eyebrow gold">Estamos para ayudarte</span>
        </div>
        <h2>Conectemos <em>hoy mismo</em></h2>
        <p>¿Listo para conectarte o tienes dudas? Escríbenos y te respondemos en breve.</p>

        <div class="cta-actions">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-lg">
            <i class="fab fa-whatsapp"></i> Escribir por WhatsApp
          </a>
          <a href="reporte.html" class="btn btn-outline btn-lg">
            <i class="fas fa-tools"></i> Reportar falla
          </a>
        </div>
      </div>

      <div class="cta-cards">
        <a href="https://wa.me/${empresa.whatsapp}?text=Hola%20REDCHAMBU%20CA" target="_blank" rel="noopener noreferrer" class="cta-card">
          <div class="cc-ico"><i class="fab fa-whatsapp"></i></div>
          <div class="cc-body">
            <div class="cc-k mono">WhatsApp</div>
            <div class="cc-v">+58 426 8731 872</div>
          </div>
          <i class="fas fa-arrow-right cc-arrow"></i>
        </a>

        <a href="mailto:${empresa.email}" class="cta-card">
          <div class="cc-ico"><i class="fas fa-envelope"></i></div>
          <div class="cc-body">
            <div class="cc-k mono">Correo</div>
            <div class="cc-v">${empresa.email}</div>
          </div>
          <i class="fas fa-arrow-right cc-arrow"></i>
        </a>

        <div class="cta-card static">
          <div class="cc-ico"><i class="fas fa-clock"></i></div>
          <div class="cc-body">
            <div class="cc-k mono">Oficina · Lun a Vie</div>
            <div class="cc-v">${empresa.horario.oficina.semana}</div>
          </div>
        </div>

        <div class="cta-card static">
          <div class="cc-ico"><i class="fas fa-clock"></i></div>
          <div class="cc-body">
            <div class="cc-k mono">Oficina · Sáb a Dom</div>
            <div class="cc-v">${empresa.horario.oficina.finde}</div>
          </div>
        </div>

        <div class="cta-card static highlight-support">
          <div class="cc-ico"><i class="fas fa-headset"></i></div>
          <div class="cc-body">
            <div class="cc-k mono">Soporte técnico · ${empresa.horario.soporte.dias}</div>
            <div class="cc-v">${empresa.horario.soporte.horas}</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     6. RENDERIZADO DE TAGS DE ZONAS
     ============================================================ */
  function renderZonasTags() {
    if (!window.REDCHAMBU) return;

    const { zonasFibra, zonasRadio } = window.REDCHAMBU;

    const fibraCont = document.querySelector('[data-zonas-fibra]');
    if (fibraCont) {
      fibraCont.innerHTML = zonasFibra
        .map(z => `<span class="coverage-tag">${z}</span>`).join('');
    }

    const radioCont = document.querySelector('[data-zonas-radio]');
    if (radioCont) {
      radioCont.innerHTML = zonasRadio
        .map(z => `<span class="coverage-tag">${z}</span>`).join('');
    }
  }

  /* ============================================================
     7. RENDERIZADO DE AVISOS DE LA RED (desde Google Sheets)
     ============================================================ */
  async function renderFallas() {
    const container = document.querySelector('[data-fallas]');
    const section   = document.getElementById('avisos');
    if (!container || !section) return;

    /* Estado de carga */
    container.innerHTML = `
      <div class="fallas-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando estado de la red...</p>
      </div>
    `;

    /* Cargar desde Google Sheets */
    if (typeof window.cargarFallas === 'function') {
      await window.cargarFallas();
    }

    const fallas = window.FALLAS || [];

    const principales = fallas.filter(f =>
      f.estado === 'activo' || f.estado === 'programado'
    );

    const historial = fallas.filter(f =>
      f.estado === 'resuelto' && f.mostrarHistorial
    );

    /* ---------- Sin avisos → ocultar la sección completa ---------- */
    if (principales.length === 0 && historial.length === 0) {
      section.hidden = true;
      container.innerHTML = '';
      return;
    }

    /* ---------- Con avisos → mostrar la sección ---------- */
    section.hidden = false;

    container.innerHTML = `
      ${principales.length > 0 ? `
        <div class="fallas-list">
          ${principales.map(f => tarjetaFalla(f)).join('')}
        </div>
      ` : `
        <div class="falla-ok">
          <div class="falla-ok-icon"><i class="fas fa-check-circle"></i></div>
          <h3>Todo funcionando correctamente</h3>
          <p>No hay fallas activas en este momento. Todos los sistemas operativos.</p>
        </div>
      `}

      ${historial.length > 0 ? `
        <div class="fallas-history">
          <button type="button" class="fallas-history-toggle" id="fallasHistoryToggle">
            <i class="fas fa-chevron-down"></i> Ver historial (${historial.length})
          </button>
          <div class="fallas-history-list" id="fallasHistoryList">
            <div class="fallas-list">
              ${historial.map(f => tarjetaFalla(f)).join('')}
            </div>
          </div>
        </div>
      ` : ''}
    `;

    /* Toggle del historial */
    const toggle = document.getElementById('fallasHistoryToggle');
    const list = document.getElementById('fallasHistoryList');

    if (toggle && list) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        list.classList.toggle('open');
      });
    }
  }

  /* Construye una tarjeta de falla */
  function tarjetaFalla(f) {
    const estadoLabel = {
      activo:     'En atención',
      programado: 'Programado',
      resuelto:   'Resuelto'
    }[f.estado] || f.estado;

    const tipoIcon = {
      general:       'fa-exclamation-triangle',
      fibra:         'fa-network-wired',
      radio:         'fa-satellite-dish',
      mantenimiento: 'fa-wrench'
    }[f.tipo] || 'fa-info-circle';

    return `
      <article class="falla-card ${f.tipo}" data-estado="${f.estado}">
        <div class="falla-status">
          <span class="falla-dot"></span>
          ${estadoLabel}
        </div>
        <h4>${f.titulo || 'Aviso de la red'}</h4>
        <div class="falla-zona">
          <i class="fas ${tipoIcon}"></i> ${f.zona}
        </div>
        <p>${f.descripcion || ''}</p>
        <div class="falla-meta">
          ${f.inicio ? `<span><i class="fas fa-clock"></i> Inicio: ${formatoFecha(f.inicio)}</span>` : ''}
          ${f.estimado ? `<span><i class="fas fa-hourglass-half"></i> Estimado: ${formatoFecha(f.estimado)}</span>` : ''}
        </div>
      </article>
    `;
  }

  /* Formatea "2025-10-08 14:00" a algo legible */
  function formatoFecha(str) {
    if (!str) return '—';
    try {
      const [fecha, hora] = str.split(' ');
      const d = new Date(fecha + 'T' + (hora || '00:00'));
      if (isNaN(d)) return str;

      const fechaFmt = d.toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const horaFmt = hora
        ? ' · ' + d.toLocaleTimeString('es-VE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : '';

      return fechaFmt + horaFmt;
    } catch {
      return str;
    }
  }

  /* ============================================================
     8. MEDIDOR RADIAL + CONTADORES
     ============================================================ */
  function initMeter() {
    const meterNum = document.getElementById('meterNum');
    if (!meterNum) return;

    const speeds = [250, 248, 252, 251, 249, 250];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % speeds.length;
      meterNum.textContent = speeds[i];
    }, 2200);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const startCounter = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          startCounter(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((c) => io.observe(c));
  }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', async () => {
    initMenu();
    initHeader();
    injectBot();
    renderPlanes();
    renderContacto();
    renderZonasTags();
    await renderFallas();
    initMeter();
    initCounters();
  });

})();
