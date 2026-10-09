/* ============================================================
   BOT.JS — ChambuBot de REDCHAMBU CA
   Consume datos desde js/data.js
   ============================================================ */

(function () {
  'use strict';

  if (!window.REDCHAMBU) {
    console.warn('[ChambuBot] data.js no está cargado.');
    return;
  }

  const CFG = window.REDCHAMBU;

  const WHATSAPP = CFG.whatsappPorDepto;
  const PLANES = {
    "Básico":   CFG.planes.basico.usd,
    "Avanzado": CFG.planes.avanzado.usd,
    "Plus":     CFG.planes.plus.usd
  };

  const ZONAS_FIBRA = CFG.zonasFibra.map(z => z.toLowerCase());
  const ZONAS_RADIO_ENLACE = CFG.zonasRadio.map(z => z.toLowerCase());

  const PROMO = {
    costo: CFG.promo.costoInstalacion,
    excepcion: CFG.promo.excepcion.toLowerCase()
  };

  const COSTO_RADIO_ENLACE = CFG.costoRadioEnlace;

  const CASOS_DERIVACION = [
    "instalacion", "instalar", "instalación",
    "cambio de plan", "cambiar plan", "mejorar plan", "upgrade",
    "falla", "fallo", "averia", "avería", "no funciona", "no sirve",
    "reporte", "reportar", "queja", "reclamo",
    "lentitud", "lento", "va lento", "demora", "tarda"
  ];

  /* ---------- ESTADOS ---------- */
  const ESTADOS = {
    INICIO: "inicio", NOMBRE: "nombre", TELEFONO: "telefono",
    ZONA: "zona", DEPARTAMENTO: "departamento", PROBLEMA: "problema",
    DETALLE: "detalle", SEGUIMIENTO: "seguimiento", FIN: "fin"
  };

  let estado = ESTADOS.INICIO;
  let datos = { nombre: "", telefono: "", zona: "", servicio: "", departamento: "", problema: "", consulta: "" };
  let historial = [];
  let redirigido = false;

  /* ---------- COMANDOS ---------- */
  const COMANDOS = {
    ATRAS:    ["atras", "atrás", "volver", "regresar", "anterior", "back"],
    REINICIAR:["reiniciar", "reinicia", "empezar de nuevo", "comenzar de nuevo", "reset", "reinicio"],
    CANCELAR: ["cancelar", "salir", "abortar"],
    EDITAR:   ["editar", "corregir", "arreglar", "me equivoque", "me equivoqué", "error"]
  };

  const CAMPOS = {
    "nombre":       { campo: "nombre",       estado: ESTADOS.NOMBRE,       label: "Nombre" },
    "telefono":     { campo: "telefono",     estado: ESTADOS.TELEFONO,     label: "Teléfono" },
    "teléfono":     { campo: "telefono",     estado: ESTADOS.TELEFONO,     label: "Teléfono" },
    "zona":         { campo: "zona",         estado: ESTADOS.ZONA,         label: "Zona" },
    "sector":       { campo: "zona",         estado: ESTADOS.ZONA,         label: "Zona" },
    "departamento": { campo: "departamento", estado: ESTADOS.DEPARTAMENTO, label: "Departamento" },
    "problema":     { campo: "problema",     estado: ESTADOS.PROBLEMA,     label: "Problema" },
    "consulta":     { campo: "consulta",     estado: ESTADOS.DETALLE,      label: "Consulta" },
    "detalle":      { campo: "consulta",     estado: ESTADOS.DETALLE,      label: "Consulta" }
  };

  let pilaEstados = [];
  let editandoCampo = null;

  /* ---------- PROBLEMAS POR DEPARTAMENTO ---------- */
  const PROBLEMAS = {
    "Soporte Técnico": [
      { etiqueta: "Problema de internet",
        claves: ["internet", "conexion", "conectar", "señal", "red", "sin internet", "no conecta"],
        respuesta: "Entiendo, es un problema de conexión. ¿El internet no conecta del todo, va lento o se corta a ratos?" },
      { etiqueta: "Falla de WiFi / Router",
        claves: ["wifi", "inalambrico", "router", "modem", "módem", "señal wifi"],
        respuesta: "Vamos a revisar tu WiFi. ¿El problema es en toda la casa o solo en algunos dispositivos?" },
      { etiqueta: "Lentitud del servicio",
        claves: ["lentitud", "lento", "va lento", "demora", "tarda", "se pone lento"],
        respuesta: "Lamento la lentitud. ¿Ocurre todo el día o en horarios específicos?" },
      { etiqueta: "Cortes de conexión",
        claves: ["se corta", "cortes", "se va", "intermitente", "inestable"],
        respuesta: "Entiendo, la conexión se corta. ¿Los cortes son frecuentes o cada cierto tiempo?" },
      { etiqueta: "Falla de radio enlace",
        claves: ["radio enlace", "radioenlace", "antena", "antena caida", "antena no funciona"],
        respuesta: "Vamos a revisar tu radio enlace. ¿La señal se perdió por completo o va intermitente?" },
      { etiqueta: "WhatsApp",
        claves: ["mensaje", "fotos", "videos", "estados", "audios", "no envia", "no recibe"],
        respuesta: "Cuéntame sobre tu WhatsApp. ¿No puedes enviar, no recibes mensajes, o no cargan los estados?" },
      { etiqueta: "Cambiar contraseña",
        claves: ["contrasena", "contraseña", "clave", "password", "acceso", "no puedo entrar"],
        respuesta: "Podemos cambiar tu contraseña. ¿Cuál necesitas?" },
      { etiqueta: "Falla de equipo",
        claves: ["hardware", "computadora", "pc", "impresora", "equipo", "telefono", "tablet", "no enciende"],
        respuesta: "¿Qué equipo presenta la falla? ¿Computadora, impresora, u otro dispositivo?" },
      { etiqueta: "Seguridad",
        claves: ["virus", "seguridad", "hackeo", "malware", "antivirus"],
        respuesta: "Es importante atender esto rápido. ¿Notaste algún comportamiento extraño?" },
      { etiqueta: "Reportar una falla",
        claves: ["falla", "fallo", "averia", "avería", "reporte", "reportar", "no funciona", "no sirve"],
        respuesta: "Vamos a reportar la falla. ¿Desde cuándo ocurre y qué servicio afecta?" },
      { etiqueta: "Otro problema técnico",
        claves: ["otro", "otra", "diferente", "no se", "no sé"],
        respuesta: "Cuéntame con tus palabras qué está pasando, y te oriento." }
    ],
    "Administración": [
      { etiqueta: "Solicitar factura",
        claves: ["factura", "recibo", "comprobante"],
        respuesta: "Podemos enviarte la factura. ¿La necesitas del mes actual o de un período anterior?" },
      { etiqueta: "Consultar pago",
        claves: ["pago", "cobro", "transferencia", "tarjeta", "banco"],
        respuesta: "Cuéntame sobre tu pago. ¿Quieres confirmar si se recibió, o tienes dudas con un cobro?" },
      { etiqueta: "Cambio de plan",
        claves: ["plan", "cambiar", "cambio de plan", "cambiar plan", "mejorar", "upgrade", "subir plan", "otro plan"],
        respuesta: "¿Qué plan tienes actualmente y a cuál te gustaría cambiarte? Tenemos Básico 23.2, Avanzado 29 y Plus 35." },
      { etiqueta: "Cancelar servicio",
        claves: ["cancelar", "baja", "retirar", "no quiero"],
        respuesta: "Lamentamos que te vayas. ¿Podemos saber el motivo para mejorar?" },
      { etiqueta: "Actualizar datos",
        claves: ["datos", "actualizar", "cambiar correo", "direccion", "telefono"],
        respuesta: "¿Qué dato necesitas actualizar? (correo, dirección, teléfono, etc.)" },
      { etiqueta: "Precios y planes de fibra",
        claves: ["precio fibra", "plan fibra", "planes fibra", "costo fibra"],
        respuesta: "Tenemos 3 planes de fibra: Básico 23.2, Avanzado 29 y Plus 35." },
      { etiqueta: "Precios y planes de radio enlace",
        claves: ["precio radio enlace", "plan radio enlace", "costo radio enlace", "precio antena"],
        respuesta: "El servicio por radio enlace tiene un costo de 23.2. Próximamente tendremos migración a fibra." },
      { etiqueta: "Migración a fibra",
        claves: ["migracion", "migración", "pasar a fibra", "cambiar a fibra", "cuando fibra"],
        respuesta: "Próximamente tendremos migración a fibra para los clientes de radio enlace. ¿En qué zona estás?" },
      { etiqueta: "Reembolso",
        claves: ["reembolso", "devolucion", "devolver", "dinero"],
        respuesta: "Los reembolsos se procesan en 5-7 días hábiles. ¿Tienes a mano el número de factura?" },
      { etiqueta: "Instalación / cambio de plan",
        claves: ["instalacion", "instalar", "nueva instalacion", "poner internet"],
        respuesta: "Podemos gestionar tu instalación o cambio de plan. ¿Qué servicio te interesa?" },
      { etiqueta: "Información de cobertura",
        claves: ["cobertura", "zona", "sector", "disponible", "llega"],
        respuesta: "¿En qué zona estás? Así te confirmo si tenemos fibra o radio enlace disponible." },
      { etiqueta: "Otra consulta",
        claves: ["otro", "otra", "diferente", "no se", "no sé"],
        respuesta: "Cuéntame con tus palabras tu consulta y te oriento." }
    ]
  };

  const REDIRECCIONES = {
    "Soporte Técnico": [
      { claves: ["cambio de plan", "cambiar plan", "mejorar plan", "upgrade", "subir plan"], destino: "Administración" },
      { claves: ["factura", "recibo", "comprobante", "pago", "cobro", "reembolso"], destino: "Administración" },
      { claves: ["cancelar", "baja", "retirar"], destino: "Administración" },
      { claves: ["precio", "costo", "cuanto", "cuánto", "tarifa", "planes"], destino: "Administración" },
      { claves: ["migracion", "migración", "pasar a fibra", "cambiar a fibra"], destino: "Administración" }
    ],
    "Administración": [
      { claves: ["falla", "fallo", "averia", "avería", "no funciona", "no sirve", "sin internet", "no conecta"], destino: "Soporte Técnico" },
      { claves: ["internet", "router", "wifi", "conexion", "señal", "modem", "módem"], destino: "Soporte Técnico" },
      { claves: ["lentitud", "lento", "va lento", "tarda", "demora"], destino: "Soporte Técnico" },
      { claves: ["radio enlace", "radioenlace", "antena caida", "señal antena"], destino: "Soporte Técnico" }
    ]
  };

  /* ---------- DOM ---------- */
  const toggleBtn   = document.getElementById("bot-toggle");
  const closeBtn    = document.getElementById("bot-close");
  const botWindow   = document.getElementById("bot-window");
  const messages    = document.getElementById("bot-messages");
  const form        = document.getElementById("bot-form");
  const input       = document.getElementById("bot-input");
  const suggestions = document.getElementById("bot-suggestions");

  if (!toggleBtn || !botWindow) return;

  /* ---------- UTILIDADES ---------- */
  function normalizar(t) {
    return t.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!.,;:]/g, "").trim();
  }

  function soloLetras(t) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(t.trim());
  }

  function agregarMensaje(texto, autor) {
    const div = document.createElement("div");
    div.className = `msg ${autor}`;
    div.textContent = texto;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    historial.push({ autor, texto, hora: new Date().toISOString() });
  }

  function mostrarOpciones(opciones) {
    suggestions.innerHTML = "";
    opciones.forEach(op => {
      const btn = document.createElement("button");
      btn.textContent = op;
      btn.type = "button";
      btn.addEventListener("click", () => manejarEnvio(op));
      suggestions.appendChild(btn);
    });
  }

  function limpiarOpciones() { suggestions.innerHTML = ""; }

  function guardarEstado() {
    pilaEstados.push({ estado, datos: { ...datos } });
    if (pilaEstados.length > 10) pilaEstados.shift();
  }

  function volverAtras() {
    if (pilaEstados.length === 0) {
      agregarMensaje("No hay pasos anteriores. Escribe 'reiniciar' para empezar de nuevo.", "bot");
      return;
    }
    const anterior = pilaEstados.pop();
    estado = anterior.estado;
    datos = { ...anterior.datos };
    editandoCampo = null;
    agregarMensaje("↩️ Volvimos al paso anterior.", "bot");
    setTimeout(repetirPregunta, 400);
  }

  function repetirPregunta() {
    switch (estado) {
      case ESTADOS.INICIO: procesarEstado(""); break;
      case ESTADOS.NOMBRE: agregarMensaje("¿Cuál es tu nombre? (solo letras)", "bot"); limpiarOpciones(); break;
      case ESTADOS.TELEFONO: agregarMensaje("¿Cuál es tu número de teléfono?", "bot"); limpiarOpciones(); break;
      case ESTADOS.ZONA: agregarMensaje("¿En qué zona o sector vives?", "bot"); limpiarOpciones(); break;
      case ESTADOS.DEPARTAMENTO:
        agregarMensaje("¿A qué departamento deseas dirigirte?", "bot");
        mostrarOpciones(["Soporte Técnico", "Administración"]);
        break;
      case ESTADOS.PROBLEMA:
        agregarMensaje("¿Cuál de estos casos describe mejor tu situación?", "bot");
        if (PROBLEMAS[datos.departamento]) {
          mostrarOpciones(PROBLEMAS[datos.departamento].map(p => p.etiqueta));
        }
        break;
      case ESTADOS.DETALLE:
        agregarMensaje("¿Puedes darme más detalles?", "bot");
        mostrarOpciones(["Ya te lo detallo", "Prefiero que me llamen"]);
        break;
    }
  }

  function detectarComando(texto) {
    const t = normalizar(texto);
    for (const [cmd, variantes] of Object.entries(COMANDOS)) {
      if (variantes.some(v => t === normalizar(v) || t.includes(normalizar(v)))) return cmd;
    }
    return null;
  }

  function detectarCampoAEditar(texto) {
    const t = normalizar(texto);
    for (const [clave, info] of Object.entries(CAMPOS)) {
      if (t.includes(normalizar(clave))) return info;
    }
    return null;
  }

  function pedirCampoAEditar() {
    agregarMensaje("✏️ ¿Qué dato deseas corregir?", "bot");
    mostrarOpciones(["Nombre", "Teléfono", "Zona", "Departamento", "Problema", "Cancelar edición"]);
  }

  function aplicarEdicion(nuevoValor) {
    const campo = editandoCampo.campo;
    const label = editandoCampo.label;

    if (campo === "nombre" && (!soloLetras(nuevoValor) || nuevoValor.trim().length < 2)) {
      agregarMensaje("El nombre solo debe contener letras (mínimo 2). Intenta de nuevo.", "bot");
      return;
    }
    if (campo === "telefono" && nuevoValor.replace(/\D/g, "").length < 7) {
      agregarMensaje("Teléfono inválido. Intenta de nuevo (ej: +58 412 1234567).", "bot");
      return;
    }

    const valorAnterior = datos[campo] || "(vacío)";
    datos[campo] = nuevoValor;

    if (campo === "zona") {
      const r = detectarZona(nuevoValor);
      datos.zona = r.zona;
      datos.servicio = r.servicio;
    }

    agregarMensaje(`✅ ${label} actualizado.\nAntes: ${valorAnterior}\nAhora: ${nuevoValor}`, "bot");
    editandoCampo = null;
    limpiarOpciones();

    setTimeout(() => {
      agregarMensaje("¿Deseas corregir algo más o continuamos?", "bot");
      mostrarOpciones(["Continuar", "Corregir otro dato", "Reiniciar"]);
    }, 500);
  }

  function construirMensajeWhatsApp() {
    const conversacion = historial.map(m => `[${m.autor.toUpperCase()}] ${m.texto}`).join("\n");

    const mensaje =
      `Hola, vengo del asistente virtual del sitio web.\n\n` +
      `👤 Nombre: ${datos.nombre}\n` +
      `📞 Teléfono: ${datos.telefono}\n` +
      `📍 Zona: ${datos.zona}\n` +
      `🛰️ Servicio: ${datos.servicio}\n` +
      `🏢 Departamento: ${datos.departamento}\n` +
      `⚠️ Problema: ${datos.problema}\n` +
      `📝 Consulta: ${datos.consulta}\n\n` +
      `--- Conversación completa ---\n${conversacion}`;

    return encodeURIComponent(mensaje);
  }

  function obtenerUrlWhatsApp() {
    const numero = WHATSAPP[datos.departamento] || WHATSAPP["Soporte Técnico"];
    return `https://wa.me/${numero}?text=${construirMensajeWhatsApp()}`;
  }

  function abrirWhatsAppAutomatico() {
    window.open(obtenerUrlWhatsApp(), "_blank");
  }

  function detectarZona(texto) {
    const t = normalizar(texto);
    for (const z of ZONAS_FIBRA) {
      if (t.includes(normalizar(z))) return { zona: z, servicio: "Fibra" };
    }
    for (const z of ZONAS_RADIO_ENLACE) {
      if (t.includes(normalizar(z))) return { zona: z, servicio: "Radio Enlace" };
    }
    return { zona: texto, servicio: "Sin cobertura" };
  }

  function esElCardon(zona) {
    return normalizar(zona).includes("cardon");
  }

  function detectarRedireccion(texto, departamentoActual) {
    const t = normalizar(texto);
    const reglas = REDIRECCIONES[departamentoActual] || [];
    for (const r of reglas) {
      if (r.claves.some(c => t.includes(normalizar(c)))) return r.destino;
    }
    return null;
  }

  function detectarProblema(texto, departamento) {
    const t = normalizar(texto);
    const lista = PROBLEMAS[departamento] || [];
    for (const p of lista) {
      if (normalizar(p.etiqueta) === t) return p;
    }
    for (const p of lista) {
      for (const clave of p.claves) {
        if (t.includes(normalizar(clave))) return p;
      }
    }
    return null;
  }

  /* ---------- FLUJO ---------- */
  function manejarEnvio(texto) {
    if (!texto || !texto.trim()) return;
    agregarMensaje(texto, "user");
    input.value = "";

    setTimeout(() => {
      const limpio = texto.trim();
      const cmd = detectarComando(limpio);

      if (cmd === "REINICIAR") { reiniciar(); return; }
      if (cmd === "ATRAS")     { volverAtras(); return; }
      if (cmd === "CANCELAR")  {
        agregarMensaje("Conversación cancelada. Escribe 'reiniciar' cuando quieras volver. 👋", "bot");
        estado = ESTADOS.FIN;
        limpiarOpciones();
        mostrarOpciones(["Reiniciar", "Continuar por WhatsApp"]);
        return;
      }
      if (cmd === "EDITAR")    { pedirCampoAEditar(); return; }
      if (editandoCampo)       { aplicarEdicion(limpio); return; }

      const t = normalizar(limpio);
      if (t.includes("cambiar") || t.includes("corregir") || t.includes("editar") || t.includes("modificar")) {
        const campoDetectado = detectarCampoAEditar(limpio);
        if (campoDetectado) {
          editandoCampo = campoDetectado;
          agregarMensaje(`✏️ Editando ${campoDetectado.label}.\nValor actual: ${datos[campoDetectado.campo] || "(sin definir)"}\n\nEscribe el nuevo valor:`, "bot");
          limpiarOpciones();
          return;
        }
      }

      if (t === "continuar") {
        agregarMensaje("Perfecto, continuemos. 👍", "bot");
        limpiarOpciones();
        return;
      }
      if (t === "corregir otro dato" || t === "corregir") { pedirCampoAEditar(); return; }
      if (t === "cancelar edicion") {
        editandoCampo = null;
        agregarMensaje("Edición cancelada. Continuamos.", "bot");
        limpiarOpciones();
        return;
      }

      guardarEstado();
      procesarEstado(limpio);
    }, 300);
  }

  function procesarEstado(texto) {
    switch (estado) {

      case ESTADOS.INICIO:
        estado = ESTADOS.NOMBRE;
        agregarMensaje("Para ayudarte necesito algunos datos.\n\n¿Cuál es tu nombre? (solo letras)", "bot");
        limpiarOpciones();
        break;

      case ESTADOS.NOMBRE:
        if (!soloLetras(texto) || texto.trim().length < 2) {
          agregarMensaje("Por favor escribe tu nombre usando solo letras.", "bot");
          return;
        }
        datos.nombre = texto.trim();
        estado = ESTADOS.TELEFONO;
        agregarMensaje(`Gracias, ${datos.nombre} 😊\n\n¿Cuál es tu número de teléfono?`, "bot");
        limpiarOpciones();
        break;

      case ESTADOS.TELEFONO: {
        const digitos = texto.replace(/\D/g, "");
        if (digitos.length < 7) {
          agregarMensaje("Ese teléfono no parece válido. Intenta de nuevo.", "bot");
          return;
        }
        datos.telefono = texto;
        estado = ESTADOS.ZONA;
        agregarMensaje("Perfecto ✅\n\n¿En qué zona o sector vives?", "bot");
        limpiarOpciones();
        break;
      }

      case ESTADOS.ZONA: {
        const resultado = detectarZona(texto);
        datos.zona = resultado.zona;
        datos.servicio = resultado.servicio;

        let msg = "";
        if (resultado.servicio === "Fibra") {
          if (esElCardon(resultado.zona)) {
            msg = `¡Buenas noticias! Tenemos fibra en ${resultado.zona}. 🎉\n\nPlanes:\n• Básico: 23.2\n• Avanzado: 29\n• Plus: 35\n\nLa instalación en El Cardón no aplica para la promoción.`;
          } else {
            msg = `¡Buenas noticias! Tenemos fibra en ${resultado.zona}. 🎉\n\nPlanes:\n• Básico: 23.2\n• Avanzado: 29\n• Plus: 35\n\n🎁 ${CFG.promo.texto}`;
          }
        } else if (resultado.servicio === "Radio Enlace") {
          msg = `En ${resultado.zona} tenemos radio enlace. 📡\n\nCosto: ${COSTO_RADIO_ENLACE}\n\n🔜 Próximamente migración a fibra.`;
        } else {
          msg = `Aún no tenemos cobertura en ${resultado.zona}. 😔\n\nEstamos expandiéndonos, pronto tendremos novedades.`;
        }
        agregarMensaje(msg, "bot");

        estado = ESTADOS.DEPARTAMENTO;
        setTimeout(() => {
          agregarMensaje("¿A qué departamento deseas dirigirte?", "bot");
          mostrarOpciones(["Soporte Técnico", "Administración"]);
        }, 800);
        break;
      }

      case ESTADOS.DEPARTAMENTO: {
        const dep = normalizar(texto);
        let elegido = "";
        if (dep.includes("soporte") || dep.includes("tecnico")) elegido = "Soporte Técnico";
        else if (dep.includes("admin")) elegido = "Administración";
        else {
          agregarMensaje("Solo tengo dos departamentos: Soporte Técnico y Administración.", "bot");
          mostrarOpciones(["Soporte Técnico", "Administración"]);
          return;
        }
        datos.departamento = elegido;
        estado = ESTADOS.PROBLEMA;
        agregarMensaje(`Perfecto, te atiendo desde ${elegido} 🛠️\n\n¿Cuál de estos casos describe mejor tu situación?`, "bot");
        mostrarOpciones(PROBLEMAS[elegido].map(p => p.etiqueta));
        break;
      }

      case ESTADOS.PROBLEMA: {
        const redir = detectarRedireccion(texto, datos.departamento);
        if (redir) {
          datos.departamento = redir;
          redirigido = true;
          agregarMensaje(`Ese caso lo gestiona ${redir}. Te paso con ellos. 👇`, "bot");
          estado = ESTADOS.PROBLEMA;
          setTimeout(() => {
            agregarMensaje("¿Cuál de estos casos describe mejor tu situación?", "bot");
            mostrarOpciones(PROBLEMAS[redir].map(p => p.etiqueta));
          }, 700);
          return;
        }

        const problema = detectarProblema(texto, datos.departamento);
        if (!problema) {
          agregarMensaje("No identifiqué ese caso. Elige una opción o descríbelo con otras palabras.", "bot");
          mostrarOpciones(PROBLEMAS[datos.departamento].map(p => p.etiqueta));
          return;
        }
        datos.problema = problema.etiqueta;
        datos.consulta = problema.etiqueta;
        estado = ESTADOS.DETALLE;
        agregarMensaje(problema.respuesta, "bot");
        setTimeout(() => {
          agregarMensaje("¿Puedes darme más detalles?", "bot");
          limpiarOpciones();
          mostrarOpciones(["Ya te lo detallo", "Prefiero que me llamen"]);
        }, 700);
        break;
      }

      case ESTADOS.DETALLE: {
        const detalleNorm = normalizar(texto);
        if ((detalleNorm.includes("prefiero") && detalleNorm.includes("llamen")) ||
            detalleNorm.includes("llamada") || detalleNorm.includes("me llamen")) {
          datos.consulta += " | Solicita llamada telefónica";
          agregarMensaje("Entendido, agendaremos una llamada. 📞", "bot");
        } else {
          datos.consulta += ` | Detalle: ${texto}`;
          agregarMensaje("Gracias por el detalle. Lo registré para el equipo de " + datos.departamento + ".", "bot");
        }
        estado = ESTADOS.SEGUIMIENTO;
        setTimeout(() => {
          agregarMensaje("¿Hay algo más que quieras agregar? Si ya terminaste, escribe 'listo'.", "bot");
          mostrarOpciones(["Listo, eso es todo"]);
        }, 900);
        break;
      }

      case ESTADOS.SEGUIMIENTO: {
        const norm = normalizar(texto);
        if (norm.includes("listo") || norm.includes("eso es todo") || norm.includes("termin") ||
            norm.includes("gracias") || norm.includes("nada mas") || norm.includes("adios")) {
          datos.consulta += ` | Cierre: ${texto}`;
          limpiarOpciones();
          estado = ESTADOS.FIN;
          agregarMensaje(
            `✅ ¡Listo, ${datos.nombre}!\n\n` +
            `Zona: ${datos.zona} (${datos.servicio})\n` +
            `Departamento: ${datos.departamento}\n` +
            `Caso: ${datos.problema}\n` +
            `Te contactaremos al ${datos.telefono}.\n\n` +
            `Abriendo WhatsApp… 📲`,
            "bot"
          );
          setTimeout(abrirWhatsAppAutomatico, 600);
          setTimeout(() => {
            agregarMensaje(`Gracias por contactarnos. 👋\n\nEscribe "reiniciar" para una nueva consulta.`, "bot");
            mostrarOpciones(["Reiniciar", "Corregir un dato", "Continuar por WhatsApp"]);
          }, 1000);
        } else {
          const redir = detectarRedireccion(texto, datos.departamento);
          if (redir && !redirigido) {
            datos.departamento = redir;
            redirigido = true;
            agregarMensaje(`Ese caso lo gestiona ${redir}. Te paso con ellos. 👇`, "bot");
          }
          datos.consulta += ` | Más detalles: ${texto}`;
          agregarMensaje("Anotado. ¿Algo más? Cuando termines escribe 'listo'.", "bot");
          mostrarOpciones(["Listo, eso es todo"]);
        }
        break;
      }

      case ESTADOS.FIN: {
        const finNorm = normalizar(texto);
        if (finNorm.includes("reiniciar") || finNorm.includes("nueva") || finNorm.includes("otra")) {
          reiniciar();
        } else if (finNorm.includes("whatsapp") || finNorm.includes("agente") ||
                   finNorm.includes("humano") || finNorm.includes("persona")) {
          abrirWhatsAppAutomatico();
        } else {
          agregarMensaje("Escribe 'reiniciar' para una nueva consulta o pide 'WhatsApp' para continuar con un agente.", "bot");
          mostrarOpciones(["Reiniciar", "Continuar por WhatsApp"]);
        }
        break;
      }
    }
  }

  function reiniciar() {
    estado = ESTADOS.INICIO;
    datos = { nombre: "", telefono: "", zona: "", servicio: "", departamento: "", problema: "", consulta: "" };
    historial = [];
    redirigido = false;
    pilaEstados = [];
    editandoCampo = null;
    messages.innerHTML = "";
    suggestions.innerHTML = "";
    agregarMensaje("Perfecto, empecemos de nuevo 👇", "bot");
    procesarEstado("");
  }

  /* ---------- EVENTOS ---------- */
  toggleBtn.addEventListener("click", () => {
    botWindow.classList.remove("bot-hidden");
    toggleBtn.style.opacity = "0";
    toggleBtn.style.pointerEvents = "none";
    if (input) input.focus();
    if (estado === ESTADOS.INICIO && historial.length === 0) procesarEstado("");
  });

  closeBtn.addEventListener("click", () => {
    botWindow.classList.add("bot-hidden");
    toggleBtn.style.opacity = "1";
    toggleBtn.style.pointerEvents = "auto";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    manejarEnvio(input.value);
  });

  const botAtras  = document.getElementById("bot-atras");
  const botReset  = document.getElementById("bot-reiniciar");

  if (botAtras) botAtras.addEventListener("click", volverAtras);
  if (botReset) botReset.addEventListener("click", reiniciar);

})();
