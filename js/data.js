/* ============================================================
   DATA.JS — Fuente única de verdad de REDCHAMBU CA
   Todos los precios, zonas y contactos viven aquí.
   Cambia un valor y se actualiza en TODA la web.
   ============================================================ */

window.REDCHAMBU = {

  /* ---------- EMPRESA ---------- */
  empresa: {
    nombre:       "REDCHAMBU CA",
    rif:          "J504571849",
    email:        "redchambuca@gmail.com",
    whatsapp:     "584268731872",
    whatsappSoporte: "584262954205",
horario: {
  oficina: {
    semana: "8:00 am – 7:00 pm",
    finde:  "9:00 am – 6:00 pm"
  },
  soporte: {
    dias:  "Todos los días",
    horas: "7:00 am – 10:00 pm"
  }
},
    redes: {
      instagram: "",
      facebook:  ""
    }
  },

  /* ---------- PLANES ---------- */
  planes: {
    basico: {
      id:       "basico",
      nombre:   "Básico",
      tipo:     "fibra",
      mbps:     100,
      usd:      23.2,
      features: [
        "Ideal para streaming HD y teletrabajo",
        "Instalación promoción de $5",
        "Soporte técnico 7am a 10pm",
        "Sin contrato de permanencia",
        "1 mes gratis del servicio"
      ]
    },
    avanzado: {
      id:       "avanzado",
      nombre:   "Avanzado",
      tipo:     "fibra",
      mbps:     250,
      usd:      29,
      popular:  true,
      features: [
        "Perfecto para gaming y 4K",
        "Múltiples dispositivos sin lag",
        "Instalación promoción de $5",
        "Soporte técnico 7am a 10pm",
        "Sin contrato de permanencia",
        "1 mes gratis del servicio"
      ]
    },
    plus: {
      id:       "plus",
      nombre:   "Plus",
      tipo:     "fibra",
      mbps:     400,
      usd:      35,
      features: [
        "400 Mbps simétricos",
        "Para negocios y oficinas",
        "+20 dispositivos conectados",
        "Soporte prioritario 7am–10pm",
        "Instalación $5",
        "1 mes gratis del servicio"
      ]
    },
    antena: {
      id:       "antena",
      nombre:   "Radio Enlace",
      tipo:     "radio",
      mbps:     20,
      usd:      23.2,
      features: [
        "Ideal para navegación y redes sociales",
        "Cobertura en zonas rurales",
        "Soporte técnico 7am a 10pm"
      ]
    }
  },

  /* ---------- ZONAS ---------- */
  zonasFibra: [
    "El Cardón", "Arenales", "Yumarito", "Las Velas", "La Plumita",
    "Barrio Nuevo", "Barrio Ajuro", "San Antonio", "La Perdomera",
    "El Palmar", "5 y 7 Casas", "Los Patios", "Los Tubos"
  ],

  zonasRadio: [
    "Agua Negra", "Tapa La Lucha", "Maporita", "CDI",
    "Valles de Peña", "San José", "El Cardón"
  ],

  /* Coordenadas para el mapa */
  zonasMapa: [
    { name: "El Cardón",      type: "ftth",  coords: [10.154724, -69.169248], radius: 800 },
    { name: "Arenales",       type: "ftth",  coords: [10.009611, -69.137157], radius: 700 },
    { name: "Yumarito",       type: "ftth",  coords: [9.987850, -69.136921], radius: 700 },
    { name: "Las Velas",      type: "ftth",  coords: [9.974557, -69.136068], radius: 700 },
    { name: "La Plumita",     type: "ftth",  coords: [9.966519, -69.134443], radius: 600 },
    { name: "Barrio Nuevo",   type: "ftth",  coords: [9.95381,  -69.13243],  radius: 600 },
    { name: "Barrio Ajuro",   type: "ftth",  coords: [9.94764,  -69.13298],  radius: 600 },
    { name: "San Antonio",    type: "ftth",  coords: [9.94293,  -69.13265],  radius: 700 },
    { name: "La Perdomera",   type: "ftth",  coords: [9.921465, -69.130160], radius: 600 },
    { name: "El Palmar",      type: "ftth",  coords: [9.902574, -69.121942], radius: 700 },
    { name: "5 y 7 Casas",    type: "ftth",  coords: [9.894283, -69.123181], radius: 500 },
    { name: "Los Patios",     type: "ftth",  coords: [9.892633, -69.119593], radius: 500 },
    { name: "Los Tubos",      type: "ftth",  coords: [9.888188, -69.103477], radius: 600 },
    { name: "Agua Negra",     type: "radio", coords: [10.062715, -69.157018], radius: 1200 },
    { name: "Tapa La Lucha",  type: "radio", coords: [10.048610, -69.110794], radius: 1000 },
    { name: "Maporita",       type: "radio", coords: [10.11705,  -69.16246],  radius: 1000 },
    { name: "CDI",            type: "radio", coords: [10.080789, -69.129513], radius: 700 },
    { name: "Valles de Peña", type: "radio", coords: [10.066453, -69.146533], radius: 1000 },
    { name: "San José",       type: "radio", coords: [10.089709, -69.119292], radius: 900 },
    { name: "El Cardón (R)",  type: "radio", coords: [10.154724, -69.169248], radius: 1000 }
  ],

  /* ---------- PROMOCIONES ---------- */
  promo: {
    costoInstalacion: 5,
    excepcion:        "El Cardón",
    texto:            "🎁 Promoción: instalación a solo $5 en tu zona."
  },

  /* ---------- WHATSAPP POR DEPARTAMENTO (bot) ---------- */
  whatsappPorDepto: {
    "Soporte Técnico": "584262954205",
    "Administración":  "584268731872"
  },

  /* ---------- COSTO RADIO ENLACE ---------- */
  costoRadioEnlace: 23.2
};
