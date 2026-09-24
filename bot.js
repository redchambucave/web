/* ============================================================
   ASISTENTE VIRTUAL ISP
   ============================================================ */

/* ============================================================
   CONFIGURACIÓN
   ============================================================ */

/* Números de WhatsApp por departamento (formato internacional sin +) */
const WHATSAPP = {
  "Soporte Técnico": "584121234567",
  "Administración":  "584121234568"
};

/* Planes de fibra */
const PLANES = {
  "Básico":   23.2,
  "Avanzado": 29,
  "Plus":     35
};

/* Zonas con fibra disponible */
const ZONAS_FIBRA = [
  "el cardon", "arenales", "yumarito", "las velas", "la plumita",
  "barrio nuevo", "barrio ajuro", "san antonio", "la perdomera",
  "el palmar", "5 y 7 casas", "los patios", "los tubos"
];

/* Zonas con radio enlace disponible */
const ZONAS_RADIO_ENLACE = [
  "agua negra", "tapa la lucha", "maporita", "cdi",
  "valles de pena", "san jose", "las velas"
];

/* Promoción de instalación */
const PROMO = {
  costo: 5,
  excepcion: "el cardon"
};

/* Costo del servicio por radio enlace */
const COSTO_RADIO_ENLACE = 23.2;

/* Casos que requieren derivación a WhatsApp */
const CASOS_DERIVACION = [
  "instalacion", "instalar", "instalación",
  "cambio de plan", "cambiar plan", "mejorar plan", "upgrade",
  "falla", "fallo", "averia", "avería", "no funciona", "no sirve",
  "reporte", "reportar", "queja", "reclamo",
  "lentitud", "lento", "va lento", "demora", "tarda"
];

/* ============================================================
   ESTADOS DEL BOT
   ============================================================ */
const ESTADOS = {
  INICIO:       "inicio",
  NOMBRE:       "nombre",
  TELEFONO:     "telefono",
  ZONA:         "zona",
  DEPARTAMENTO: "departamento",
  PROBLEMA:     "problema",
  DETALLE:      "detalle",
  SEGUIMIENTO:  "seguimiento",
  FIN:          "fin"
};

let estado = ESTADOS.INICIO;
let datos = {
  nombre: "",
  telefono: "",
  zona: "",
  servicio: "",
  departamento: "",
  problema: "",
  consulta: ""
};

let historial = [];
let whatsappMostrado = false;
let redirigido = false;

/* ============================================================
   PREGUNTAS PREDEFINIDAS POR DEPARTAMENTO
   ============================================================ */
const PROBLEMAS = {
  "Soporte Técnico": [
    {
      etiqueta: "Problema de internet",
      claves: ["internet", "conexion", "conectar", "señal", "red", "sin internet", "no conecta"],
      respuesta: "Entiendo, es un problema de conexión. ¿El internet no conecta del todo, va lento o se corta a ratos?"
    },
    {
      etiqueta: "Falla de WiFi / Router",
      claves: ["wifi", "inalambric", "router", "modem", "módem", "señal wifi"],
      respuesta: "Vamos a revisar tu WiFi. ¿El problema es en toda la casa o solo en algunos dispositivos?"
    },
    {
      etiqueta: "Lentitud del servicio",
      claves: ["lentitud", "lento", "va lento", "demora", "tarda", "se pone lento"],
      respuesta: "Lamento la lentitud. ¿Ocurre todo el día o en horarios específicos?"
    },
    {
      etiqueta: "Cortes de conexión",
      claves: ["se corta", "cortes", "se va", "intermitente", "inestable"],
      respuesta: "Entiendo, la conexión se corta. ¿Los cortes son frecuentes o cada cierto tiempo?"
    },
    {
      etiqueta: "Falla de radio enlace",
      claves: ["radio enlace", "radioenlace", "antena", "antena caida", "antena no funciona", "señal antena"],
      respuesta: "Vamos a revisar tu radio enlace. ¿La señal se perdió por completo o va intermitente?"
    },
    {
      etiqueta: "WhatsApp",
      claves: ["correo", "email", "mail", "no envia", "no recibe"],
      respuesta: "Cuéntame sobre tu WhatsApp. ¿No puedes enviar, no recibes mensajes, o no cargan los estados?"
    },
    {
      etiqueta: "Cambiar contraseña",
      claves: ["contrasena", "contraseña", "clave", "password", "acceso", "no puedo entrar"],
      respuesta: "Podemos cambiar tu contraseña. ¿Cuál necesitas?"
    },
    {
      etiqueta: "Falla de equipo",
      claves: ["hardware", "computadora", "pc", "impresora", "equipo", "telefono", "tablet", "no enciende"],
      respuesta: "¿Qué equipo presenta la falla? ¿Computadora, impresora, u otro dispositivo?"
    },
    {
      etiqueta: "Seguridad",
      claves: ["virus", "seguridad", "hackeo", "malware", "antivirus"],
      respuesta: "Es importante atender esto rápido. ¿Notaste algún comportamiento extraño?"
    },
    {
      etiqueta: "Reportar una falla",
      claves: ["falla", "fallo", "averia", "avería", "reporte", "reportar", "no funciona", "no sirve"],
      respuesta: "Vamos a reportar la falla. ¿Desde cuándo ocurre y qué servicio afecta?"
    },
    {
      etiqueta: "Otro problema técnico",
      claves: ["otro", "otra", "diferente", "no se", "no sé"],
      respuesta: "Cuéntame con tus palabras qué está pasando, y te oriento."
    }
  ],

  "Administración": [
    {
      etiqueta: "Solicitar factura",
      claves: ["factura", "recibo", "comprobante"],
      respuesta: "Podemos enviarte la factura. ¿La necesitas del mes actual o de un período anterior?"
    },
    {
      etiqueta: "Consultar pago",
      claves: ["pago", "cobro", "transferencia", "tarjeta", "banco"],
      respuesta: "Cuéntame sobre tu pago. ¿Quieres confirmar si se recibió, o tienes dudas con un cobro?"
    },
    {
      etiqueta: "Cambio de plan",
      claves: ["plan", "cambiar", "cambio de plan", "cambiar plan", "mejorar", "upgrade", "subir plan", "otro plan"],
      respuesta: "¿Qué plan tienes actualmente y a cuál te gustaría cambiarte? Tenemos Básico 23.2, Avanzado 29 y Plus 35."
    },
    {
      etiqueta: "Cancelar servicio",
      claves: ["cancelar", "baja", "retirar", "no quiero"],
      respuesta: "Lamentamos que te vayas. ¿Podemos saber el motivo para mejorar?"
    },
    {
      etiqueta: "Actualizar datos",
      claves: ["datos", "actualizar", "cambiar correo", "direccion", "telefono"],
      respuesta: "¿Qué dato necesitas actualizar? (correo, dirección, teléfono, etc.)"
    },
    {
      etiqueta: "Precios y planes de fibra",
      claves: ["precio fibra", "plan fibra", "planes fibra", "costo fibra"],
      respuesta: "Tenemos 3 planes de fibra: Básico 23.2, Avanzado 29 y Plus 35."
    },
    {
      etiqueta: "Precios y planes de radio enlace",
      claves: ["precio radio enlace", "plan radio enlace", "costo radio enlace", "precio antena", "costo antena", "plan antena"],
      respuesta: "El servicio por radio enlace tiene un costo de 23.2. Próximamente tendremos migración a fibra para los clientes de radio enlace."
    },
    {
      etiqueta: "Migración a fibra",
      claves: ["migracion", "migración", "pasar a fibra", "cambiar a fibra", "cuando fibra", "cuándo fibra", "fibra proximamente"],
      respuesta: "Próximamente tendremos migración a fibra para los clientes de radio enlace. ¿En qué zona estás para confirmarte la disponibilidad?"
    },
    {
      etiqueta: "Reembolso",
      claves: ["reembolso", "devolucion", "devolver", "dinero"],
      respuesta: "Los reembolsos se procesan en 5-7 días hábiles. ¿Tienes a mano el número de factura?"
    },
    {
      etiqueta: "Instalación / cambio de plan",
      claves: ["instalacion", "instalar", "nueva instalacion", "poner internet"],
      respuesta: "Podemos gestionar tu instalación o cambio de plan. ¿Qué servicio te interesa?"
    },
    {
      etiqueta: "Información de cobertura",
      claves: ["cobertura", "zona", "sector", "disponible", "llega"],
      respuesta: "¿En qué zona estás? Así te confirmo si tenemos fibra o radio enlace disponible."
    },
    {
      etiqueta: "Otra consulta",
      claves: ["otro", "otra", "diferente", "no se", "no sé"],
      respuesta: "Cuéntame con tus palabras tu consulta y te oriento."
    }
  ]
};

/* ============================================================
   REDIRECCIONES CRUZADAS ENTRE DEPARTAMENTOS
   ============================================================ */
const REDIRECCIONES = {
  "Soporte Técnico": [
    { claves: ["cambio de plan", "cambiar plan", "mejorar plan", "upgrade", "subir plan", "otro plan"], destino: "Administración" },
    { claves: ["factura", "recibo", "comprobante", "pago", "cobro", "reembolso"], destino: "Administración" },
    { claves: ["cancelar", "baja", "retirar"], destino: "Administración" },
    { claves: ["precio", "costo", "cuanto", "cuánto", "tarifa", "planes"], destino: "Administración" },
    { claves: ["migracion", "migración", "pasar a fibra", "cambiar a fibra"], destino: "Administración" }
  ],
  "Administración": [
    { claves: ["falla", "fallo", "averia", "avería", "no funciona", "no sirve", "sin internet", "no conecta"], destino: "Soporte Técnico" },
    { claves: ["internet", "router", "wifi", "conexion", "señal", "modem", "módem"], destino: "Soporte Técnico" },
    { claves: ["lentitud", "lento", "va lento", "tarda", "demora"], destino: "Soporte Técnico" },
    { claves: ["radio enlace", "radioenlace", "antena caida", "señal antena"], destino: "Soporte Técnico" },
    { claves: ["instalacion tecnica", "instalación tecnica", "instalar equipo"], destino: "Soporte Técnico" }
  ]
};

/* ============================================================
   LÓGICA DEL CHAT
   ============================================================ */
const toggleBtn   = document.getElementById("bot-toggle");
const closeBtn    = document.getElementById("bot-close");
const botWindow   = document.getElementById("bot-window");
const messages    = document.getElementById("bot-messages");
const form        = document.getElementById("bot-form");
const input       = document.getElementById("bot-input");
const suggestions = document.getElementById("bot-suggestions");

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
    btn.addEventListener("click", () => manejarEnvio(op));
    suggestions.appendChild(btn);
  });
}

function limpiarOpciones() {
  suggestions.innerHTML = "";
}

/* ============================================================
   DERIVACIÓN A WHATSAPP
   ============================================================ */
function esCasoDerivacion(texto) {
  const t = normalizar(texto);
  return CASOS_DERIVACION.some(c => t.includes(normalizar(c)));
}

function construirMensajeWhatsApp() {
  const conversacion = historial
    .map(m => `[${m.autor.toUpperCase()}] ${m.texto}`)
    .join("\n");

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

function mostrarBotonWhatsApp(motivo = "") {
  if (whatsappMostrado) return;
  whatsappMostrado = true;

  const url = obtenerUrlWhatsApp();

  const contenedor = document.createElement("div");
  contenedor.className = "msg bot";
  contenedor.style.padding = "8px 0";

  if (motivo) {
    const p = document.createElement("p");
    p.textContent = motivo;
    p.style.margin = "0 0 6px 0";
    contenedor.appendChild(p);
  }

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  enlace.textContent = "📲 Continuar por WhatsApp";
  enlace.style.display = "inline-block";
  enlace.style.padding = "10px 16px";
  enlace.style.background = "#25D366";
  enlace.style.color = "#fff";
  enlace.style.borderRadius = "8px";
  enlace.style.textDecoration = "none";
  enlace.style.fontWeight = "600";

  contenedor.appendChild(enlace);
  messages.appendChild(contenedor);
  messages.scrollTop = messages.scrollHeight;

  historial.push({
    autor: "bot",
    texto: `[Enlace WhatsApp generado] ${url}`,
    hora: new Date().toISOString()
  });
}

function abrirWhatsAppAutomatico() {
  const url = obtenerUrlWhatsApp();
  window.open(url, "_blank");
}

/* ============================================================
   DETECCIÓN DE ZONA
   ============================================================ */
function detectarZona(texto) {
  const t = normalizar(texto);

  for (const z of ZONAS_FIBRA) {
    if (t.includes(normalizar(z))) {
      return { zona: z, servicio: "Fibra" };
    }
  }

  for (const z of ZONAS_RADIO_ENLACE) {
    if (t.includes(normalizar(z))) {
      return { zona: z, servicio: "Radio Enlace" };
    }
  }

  return { zona: texto, servicio: "Sin cobertura" };
}

function esElCardon(zona) {
  return normalizar(zona).includes("cardon");
}

/* ============================================================
   DETECCIÓN DE REDIRECCIÓN
   ============================================================ */
function detectarRedireccion(texto, departamentoActual) {
  const t = normalizar(texto);
  const reglas = REDIRECCIONES[departamentoActual] || [];
  for (const r of reglas) {
    if (r.claves.some(c => t.includes(normalizar(c)))) {
      return r.destino;
    }
  }
  return null;
}

/* ============================================================
   FLUJO PRINCIPAL
   ============================================================ */
function manejarEnvio(texto) {
  if (!texto || !texto.trim()) return;
  agregarMensaje(texto, "user");
  input.value = "";

  setTimeout(() => procesarEstado(texto.trim()), 300);
}

function procesarEstado(texto) {
  switch (estado) {

    /* ---------- INICIO ---------- */
    case ESTADOS.INICIO:
      estado = ESTADOS.NOMBRE;
      agregarMensaje(
        "¡Hola! 👋 Soy el asistente virtual de la empresa.\n\n" +
        "Para ayudarte necesito algunos datos.\n\n" +
        "¿Cuál es tu nombre? (solo letras)",
        "bot"
      );
      limpiarOpciones();
      break;

    /* ---------- NOMBRE ---------- */
    case ESTADOS.NOMBRE:
      if (!soloLetras(texto) || texto.trim().length < 2) {
        agregarMensaje(
          "Por favor escribe tu nombre usando solo letras.",
          "bot"
        );
        return;
      }
      datos.nombre = texto.trim();
      estado = ESTADOS.TELEFONO;
      agregarMensaje(
        `Gracias, ${datos.nombre} 😊\n\n¿Cuál es tu número de teléfono?`,
        "bot"
      );
      limpiarOpciones();
      break;

    /* ---------- TELÉFONO ---------- */
    case ESTADOS.TELEFONO: {
      const digitos = texto.replace(/\D/g, "");
      if (digitos.length < 7) {
        agregarMensaje(
          "Ese teléfono no parece válido. Intenta de nuevo (ej: +58 412 1234567).",
          "bot"
        );
        return;
      }
      datos.telefono = texto;
      estado = ESTADOS.ZONA;
      agregarMensaje(
        "Perfecto ✅\n\n¿En qué zona o sector vives?",
        "bot"
      );
      limpiarOpciones();
      break;
    }

    /* ---------- ZONA ---------- */
    case ESTADOS.ZONA: {
      const resultado = detectarZona(texto);
      datos.zona = resultado.zona;
      datos.servicio = resultado.servicio;

      let mensajeZona = "";

      if (resultado.servicio === "Fibra") {
        if (esElCardon(resultado.zona)) {
          mensajeZona =
            `¡Buenas noticias! Tenemos fibra disponible en ${resultado.zona}. 🎉\n\n` +
            `Planes de fibra:\n` +
            `• Básico: 23.2\n` +
            `• Avanzado: 29\n` +
            `• Plus: 35\n\n` +
            `La instalación en El Cardón no aplica para la promoción.`;
        } else {
          mensajeZona =
            `¡Buenas noticias! Tenemos fibra disponible en ${resultado.zona}. 🎉\n\n` +
            `Planes de fibra:\n` +
            `• Básico: 23.2\n` +
            `• Avanzado: 29\n` +
            `• Plus: 35\n\n` +
            `🎁 Promoción: instalación a solo ${PROMO.costo}$ en tu zona.`;
        }
      } else if (resultado.servicio === "Radio Enlace") {
        mensajeZona =
          `En ${resultado.zona} tenemos servicio por radio enlace. 📡\n\n` +
          `Costo: ${COSTO_RADIO_ENLACE}\n\n` +
          `🔜 Próximamente tendremos migración a fibra para los clientes de radio enlace.`;
      } else {
        mensajeZona =
          `Aún no tenemos cobertura confirmada en ${resultado.zona}. 😔\n\n` +
          `Estamos expandiéndonos, pronto tendremos novedades.`;
      }

      agregarMensaje(mensajeZona, "bot");

      estado = ESTADOS.DEPARTAMENTO;
      setTimeout(() => {
        agregarMensaje(
          "¿A qué departamento deseas dirigirte?",
          "bot"
        );
        mostrarOpciones(["Soporte Técnico", "Administración"]);
      }, 800);
      break;
    }

    /* ---------- DEPARTAMENTO ---------- */
    case ESTADOS.DEPARTAMENTO: {
      const dep = normalizar(texto);
      let elegido = "";

      if (dep.includes("soporte") || dep.includes("tecnico") || dep.includes("tecnica")) {
        elegido = "Soporte Técnico";
      } else if (dep.includes("admin") || dep.includes("administracion")) {
        elegido = "Administración";
      } else {
        agregarMensaje(
          "Solo tengo dos departamentos disponibles: Soporte Técnico y Administración. ¿Cuál eliges?",
          "bot"
        );
        mostrarOpciones(["Soporte Técnico", "Administración"]);
        return;
      }

      datos.departamento = elegido;
      estado = ESTADOS.PROBLEMA;

      agregarMensaje(
        `Perfecto, te atiendo desde ${elegido} 🛠️\n\n` +
        `¿Cuál de estos casos describe mejor tu situación?`,
        "bot"
      );

      const lista = PROBLEMAS[elegido];
      mostrarOpciones(lista.map(p => p.etiqueta));
      break;
    }

    /* ---------- PROBLEMA ---------- */
    case ESTADOS.PROBLEMA: {
      const redir = detectarRedireccion(texto, datos.departamento);
      if (redir) {
        datos.departamento = redir;
        redirigido = true;
        agregarMensaje(
          `Ese caso lo gestiona ${redir}. Te paso con ellos para continuar. 👇`,
          "bot"
        );
        estado = ESTADOS.PROBLEMA;
        setTimeout(() => {
          agregarMensaje(
            `¿Cuál de estos casos describe mejor tu situación?`,
            "bot"
          );
          mostrarOpciones(PROBLEMAS[redir].map(p => p.etiqueta));
        }, 700);
        return;
      }

      const problema = detectarProblema(texto, datos.departamento);

      if (!problema) {
        agregarMensaje(
          "No identifiqué ese caso. Elige una de las opciones o descríbelo con otras palabras.",
          "bot"
        );
        mostrarOpciones(PROBLEMAS[datos.departamento].map(p => p.etiqueta));
        return;
      }

      datos.problema = problema.etiqueta;
      datos.consulta = problema.etiqueta;
      estado = ESTADOS.DETALLE;

      agregarMensaje(problema.respuesta, "bot");

      setTimeout(() => {
        agregarMensaje(
          "¿Puedes darme más detalles?",
          "bot"
        );
        limpiarOpciones();
        mostrarOpciones(["Ya te lo detallo", "Prefiero que me llamen"]);
      }, 700);
      break;
    }

    /* ---------- DETALLE ---------- */
    case ESTADOS.DETALLE: {
      const detalleNorm = normalizar(texto);

      if ((detalleNorm.includes("prefiero") && detalleNorm.includes("llamen")) ||
          detalleNorm.includes("llamada") ||
          detalleNorm.includes("me llamen")) {
        datos.consulta += " | Solicita llamada telefónica";
        agregarMensaje(
          "Entendido, agendaremos una llamada al número que nos diste. 📞",
          "bot"
        );
      } else {
        datos.consulta += ` | Detalle: ${texto}`;
        agregarMensaje(
          "Gracias por el detalle. Lo he registrado para el equipo de " +
          datos.departamento + ".",
          "bot"
        );
      }

      estado = ESTADOS.SEGUIMIENTO;

      setTimeout(() => {
        agregarMensaje(
          "¿Hay algo más que quieras agregar? Si ya terminaste, escribe 'listo'.",
          "bot"
        );
        mostrarOpciones(["Listo, eso es todo", "Quiero agregar más"]);
      }, 900);
      break;
    }

    /* ---------- SEGUIMIENTO ---------- */
    case ESTADOS.SEGUIMIENTO: {
      const norm = normalizar(texto);

      if (norm.includes("listo") || norm.includes("eso es todo") ||
          norm.includes("termin") || norm.includes("gracias") ||
          norm.includes("nada mas") || norm.includes("adios")) {

        datos.consulta += ` | Cierre: ${texto}`;
        limpiarOpciones();
        estado = ESTADOS.FIN;

        agregarMensaje(
          `✅ ¡Listo, ${datos.nombre}!\n\n` +
          `Zona: ${datos.zona} (${datos.servicio})\n` +
          `Departamento: ${datos.departamento}\n` +
          `Caso: ${datos.problema}\n` +
          `Te contactaremos al ${datos.telefono}.\n\n` +
          `Abriendo WhatsApp para continuar la asistencia… 📲`,
          "bot"
        );

        setTimeout(() => {
          abrirWhatsAppAutomatico();
        }, 600);

        setTimeout(() => {
          agregarMensaje(
            `Gracias por contactarnos. 👋\n\n` +
            `Escribe "reiniciar" para una nueva consulta.`,
            "bot"
          );
        }, 1000);

      } else {
        const redir = detectarRedireccion(texto, datos.departamento);
        if (redir && !redirigido) {
          datos.departamento = redir;
          redirigido = true;
          agregarMensaje(
            `Ese caso lo gestiona ${redir}. Te paso con ellos. 👇`,
            "bot"
          );
        }

        datos.consulta += ` | Más detalles: ${texto}`;
        agregarMensaje(
          "Anotado. ¿Algo más? Cuando termines escribe 'listo'.",
          "bot"
        );
        mostrarOpciones(["Listo, eso es todo", "Quiero agregar más"]);
      }
      break;
    }

    /* ---------- FIN ---------- */
    case ESTADOS.FIN: {
      const finNorm = normalizar(texto);
      if (finNorm.includes("reiniciar") ||
          finNorm.includes("nueva") ||
          finNorm.includes("otra")) {
        reiniciar();
      } else if (finNorm.includes("whatsapp") || finNorm.includes("agente") ||
                 finNorm.includes("humano") || finNorm.includes("persona")) {
        abrirWhatsAppAutomatico();
      } else {
        agregarMensaje(
          "Escribe 'reiniciar' para una nueva consulta " +
          "o pide 'WhatsApp' para continuar con un agente.",
          "bot"
        );
        mostrarOpciones(["Reiniciar", "Continuar por WhatsApp"]);
      }
      break;
    }
  }
}

/* ============================================================
   DETECTAR PROBLEMA
   ============================================================ */
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

/* ============================================================
   REINICIAR
   ============================================================ */
function reiniciar() {
  estado = ESTADOS.INICIO;
  datos = {
    nombre: "",
    telefono: "",
    zona: "",
    servicio: "",
    departamento: "",
    problema: "",
    consulta: ""
  };
  historial = [];
  whatsappMostrado = false;
  redirigido = false;
  messages.innerHTML = "";
  suggestions.innerHTML = "";
  agregarMensaje("Perfecto, empecemos de nuevo 👇", "bot");
  procesarEstado("");
}

/* ============================================================
   EVENTOS
   ============================================================ */
toggleBtn.addEventListener("click", () => {
  botWindow.classList.toggle("bot-hidden");

  if (!botWindow.classList.contains("bot-hidden")) {
    input.focus();

    // Si nunca se ha iniciado la conversación, el bot saluda
    if (estado === ESTADOS.INICIO && historial.length === 0) {
      procesarEstado("");
    }
  }
});

closeBtn.addEventListener("click", () => botWindow.classList.add("bot-hidden"));

form.addEventListener("submit", (e) => {
  e.preventDefault();
  manejarEnvio(input.value);
});

/* ============================================================
   INICIO AUTOMÁTICO AL CARGAR LA PÁGINA
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {
  // Abrir la ventana del bot automáticamente
  botWindow.classList.remove("bot-hidden");

  // Iniciar la conversación si aún no ha empezado
  if (estado === ESTADOS.INICIO && historial.length === 0) {
    procesarEstado("");
  }

  input.focus();
});
