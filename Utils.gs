function getStatuses() {
  return ['Recibido','Diagnóstico','Esperando repuesto','Reparando','Listo para retirar','Entregado','No reparable'];
}

function getDeviceTypes() {
  return ['Celular','Computadora','Laptop','Impresora','Tablet','TV','Audio','Consola','Otro'];
}

function getTechnicians() {
  return ['Federico','Técnico 1','Técnico 2'];
}

function buildWhatsappLink(orderId) {
  const o = getOrder(orderId);
  let phone = String(o.Telefono || '').replace(/\D/g, '');

  // Uruguay: si escriben 09xxxxxxx, WhatsApp necesita 5989xxxxxxx.
  if (phone.length === 8 && phone.charAt(0) === '9') phone = '598' + phone;
  if (phone.length === 9 && phone.indexOf('09') === 0) phone = '598' + phone.substring(1);

  const text = `Hola ${o.Cliente || ''}. Te avisamos de HARDSTOREUY: tu ${o.Tipo || 'equipo'} ${o.Marca || ''} ${o.Modelo || ''} de la orden ${o.ID} está listo para retirar. Muchas gracias.`;
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
}

function buildReceivedWhatsappLink(orderId) {
  const o = getOrder(orderId);
  let phone = String(o.Telefono || '').replace(/\D/g, '');
  if (phone.length === 8 && phone.charAt(0) === '9') phone = '598' + phone;
  if (phone.length === 9 && phone.indexOf('09') === 0) phone = '598' + phone.substring(1);
  const text = `Hola ${o.Cliente || ''}. Recibimos tu ${o.Tipo || 'equipo'} ${o.Marca || ''} ${o.Modelo || ''}. Orden ${o.ID}. Te avisaremos cuando tengamos novedades. HARDSTOREUY.`;
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
}
