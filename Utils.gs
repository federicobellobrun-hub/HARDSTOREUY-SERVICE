function getStatuses() {
  return ['Recibido','Diagnóstico','Esperando repuesto','Reparando','Listo para retirar','Entregado','No reparable'];
}

function getDeviceTypes() {
  return ['Celular','Computadora','Laptop','Impresora','Tablet','TV','Audio','Consola','Otro'];
}

function getTechnicians() {
  return ['Federico','Técnico 1','Técnico 2'];
}

function getPriorities() {
  return ['Normal','Alta','Urgente'];
}

function whatsappPhone_(phone) {
  let p = String(phone || '').replace(/\D/g, '');
  // Uruguay: 09xxxxxxx -> 5989xxxxxxx
  if (p.length === 8 && p.charAt(0) === '9') p = '598' + p;
  if (p.length === 9 && p.indexOf('09') === 0) p = '598' + p.substring(1);
  return p;
}

function buildWhatsappLink(orderId) {
  const o = getOrder(orderId);
  const phone = whatsappPhone_(o.Telefono);
  const text = `Hola ${o.Cliente || ''}. Te avisamos de HARDSTOREUY: tu ${o.Tipo || 'equipo'} ${o.Marca || ''} ${o.Modelo || ''} de la orden ${o.ID} está listo para retirar. Muchas gracias.`;
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
}

function buildReceivedWhatsappLink(orderId) {
  const o = getOrder(orderId);
  const phone = whatsappPhone_(o.Telefono);
  const text = `Hola ${o.Cliente || ''}. Recibimos tu ${o.Tipo || 'equipo'} ${o.Marca || ''} ${o.Modelo || ''}. Orden ${o.ID}. Te avisaremos cuando tengamos novedades. HARDSTOREUY.`;
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
}

function buildBudgetWhatsappLink(orderId) {
  const o = getOrder(orderId);
  const phone = whatsappPhone_(o.Telefono);
  const amount = o.Presupuesto ? '$' + o.Presupuesto : 'pendiente de confirmar';
  const text = `Hola ${o.Cliente || ''}. Tenemos novedades sobre tu ${o.Tipo || 'equipo'} ${o.Marca || ''} ${o.Modelo || ''}, orden ${o.ID}. Presupuesto: ${amount}. Responde este mensaje para aprobar o consultar. HARDSTOREUY.`;
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
}
