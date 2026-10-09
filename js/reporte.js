/* ============================================================
   REPORTE.JS — Envío del formulario de fallas por WhatsApp
   Requiere: js/data.js cargado antes.
   ============================================================ */

(function () {
  'use strict';

  var WHATSAPP_SOPORTE =
    (window.REDCHAMBU && window.REDCHAMBU.empresa && window.REDCHAMBU.empresa.whatsappSoporte) ||
    '584262954205';

  var form = document.getElementById('reportForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name         = document.getElementById('name').value.trim();
    var phone        = document.getElementById('phone').value.trim();
    var email        = document.getElementById('email').value.trim();
    var zone         = document.getElementById('zone').value.trim();
    var service_type = document.getElementById('service_type').value;
    var failure_type = document.getElementById('failure_type').value;
    var urgency      = (document.querySelector('input[name="urgency"]:checked') || {}).value || '';
    var message      = document.getElementById('message').value.trim();

    var texto = '*NUEVO REPORTE DE FALLA - REDCHAMBU CA*\n\n';
    texto += '👤 *Nombre:* ' + name + '\n';
    texto += '📞 *Teléfono:* ' + phone + '\n';
    if (email) texto += '✉️ *Correo:* ' + email + '\n';
    texto += '📍 *Zona:* ' + zone + '\n';
    texto += '📡 *Servicio:* ' + service_type + '\n';
    texto += '⚠️ *Tipo de falla:* ' + failure_type + '\n';
    texto += '🔥 *Urgencia:* ' + urgency + '\n\n';
    texto += '📝 *Descripción:*\n' + message;

    window.open(
      'https://wa.me/' + WHATSAPP_SOPORTE + '?text=' + encodeURIComponent(texto),
      '_blank'
    );
  });

})();
