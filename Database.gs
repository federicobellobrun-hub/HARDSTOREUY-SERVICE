const HEADERS = [
  'ID','Fecha','Cliente','Telefono','Direccion','Tipo','Marca','Modelo','SerieIMEI','Problema','Accesorios',
  'Estado','Presupuesto','Tecnico','Observaciones','FechaFinalizacion','Historial','WhatsApp','Prioridad','GarantiaDias','FechaEntrega'
];

const CLIENT_HEADERS = ['Telefono','Cliente','Direccion','UltimaOrden','CantidadOrdenes','Actualizado'];

function getSS_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function getSheet_() { setupDatabase(); return getSS_().getSheetByName(SHEET_NAME); }
function getClientSheet_() { setupDatabase(); return getSS_().getSheetByName('CLIENTES'); }

function setupDatabase() {
  const ss = getSS_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  ensureHeaders_(sh, HEADERS);
  formatSheet_(sh, HEADERS.length);

  let clients = ss.getSheetByName('CLIENTES');
  if (!clients) clients = ss.insertSheet('CLIENTES');
  ensureHeaders_(clients, CLIENT_HEADERS);
  formatSheet_(clients, CLIENT_HEADERS.length);

  let hist = ss.getSheetByName('HISTORIAL');
  if (!hist) hist = ss.insertSheet('HISTORIAL');
  ensureHeaders_(hist, ['Fecha','OrdenID','Accion','Estado','Usuario','Detalle']);
  formatSheet_(hist, 6);

  let cfg = ss.getSheetByName(CONFIG_SHEET);
  if (!cfg) {
    cfg = ss.insertSheet(CONFIG_SHEET);
    cfg.appendRow(['Clave', 'Valor']);
    cfg.appendRow(['ultimo_numero', '0']);
    cfg.appendRow(['version', APP_VERSION]);
    cfg.hideSheet();
  }
}

function ensureHeaders_(sh, headers) {
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  const maxCols = Math.max(sh.getLastColumn(), headers.length);
  const current = sh.getRange(1, 1, 1, maxCols).getValues()[0];
  headers.forEach((h, i) => { if (current[i] !== h) sh.getRange(1, i + 1).setValue(h); });
}

function formatSheet_(sh, cols) {
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, cols).setFontWeight('bold').setBackground('#f5f5f7').setFontColor('#1d1d1f');
  sh.autoResizeColumns(1, cols);
}

function nextOrderId_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    setupDatabase();
    const cfg = getSS_().getSheetByName(CONFIG_SHEET);
    const values = cfg.getDataRange().getValues();
    let row = values.findIndex(r => r[0] === 'ultimo_numero') + 1;
    if (row < 1) { cfg.appendRow(['ultimo_numero', '0']); row = cfg.getLastRow(); }
    const next = Number(cfg.getRange(row, 2).getValue() || 0) + 1;
    cfg.getRange(row, 2).setValue(next);
    return 'HS-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy') + '-' + String(next).padStart(6, '0');
  } finally { lock.releaseLock(); }
}

function mapRow_(row) { const obj = {}; HEADERS.forEach((h, i) => obj[h] = row[i] === undefined ? '' : row[i]); return obj; }
function getIndex_(){ return HEADERS.reduce((a, h, i) => (a[h] = i, a), {}); }

function getRowById_(id) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) if (String(values[r][0]) === String(id)) return { sh, rowNumber: r + 1, row: values[r] };
  throw new Error('Orden no encontrada: ' + id);
}

function createOrder(data) {
  setupDatabase();
  validateOrder_(data);
  const sh = getSheet_();
  const id = nextOrderId_();
  const now = new Date();
  const status = clean_(data.Estado) || 'Recibido';
  const history = JSON.stringify([{ fecha: now.toISOString(), accion: 'Orden creada', estado: status, detalle: '' }]);
  const row = [
    id, now, clean_(data.Cliente), normalizePhone_(data.Telefono), clean_(data.Direccion), clean_(data.Tipo), clean_(data.Marca),
    clean_(data.Modelo), clean_(data.SerieIMEI), clean_(data.Problema), clean_(data.Accesorios), status, clean_(data.Presupuesto),
    clean_(data.Tecnico), clean_(data.Observaciones), '', history, '', clean_(data.Prioridad) || 'Normal', clean_(data.GarantiaDias), ''
  ];
  sh.appendRow(row);
  upsertClient_(data.Telefono, data.Cliente, data.Direccion, id);
  logHistory_(id, 'Orden creada', status, 'Ingreso de equipo');
  return { ok: true, id, message: 'Orden creada' };
}

function validateOrder_(data){
  if (!clean_(data.Cliente)) throw new Error('El cliente es obligatorio.');
  if (!normalizePhone_(data.Telefono)) throw new Error('El teléfono es obligatorio.');
  if (!clean_(data.Tipo)) throw new Error('El tipo de equipo es obligatorio.');
  if (!clean_(data.Marca)) throw new Error('La marca es obligatoria.');
  if (!clean_(data.Modelo)) throw new Error('El modelo es obligatorio.');
  if (!clean_(data.Problema)) throw new Error('La falla reportada es obligatoria.');
}

function listOrders(query, limit, status) {
  setupDatabase();
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues().map(mapRow_).reverse();
  const q = String(query || '').toLowerCase().trim();
  const st = String(status || '').trim();
  let filtered = rows;
  if (q) filtered = filtered.filter(o => Object.values(o).join(' ').toLowerCase().includes(q));
  if (st) filtered = filtered.filter(o => String(o.Estado || '') === st);
  return filtered.slice(0, Number(limit || 100)).map(formatOrder_);
}

function getOrder(id) { return formatOrder_(mapRow_(getRowById_(id).row)); }

function updateOrder(id, data) {
  const found = getRowById_(id);
  const sh = found.sh;
  const rowNumber = found.rowNumber;
  const idx = getIndex_();
  const oldStatus = found.row[idx.Estado];
  const changes = [];
  ['Cliente','Telefono','Direccion','Tipo','Marca','Modelo','SerieIMEI','Problema','Accesorios','Estado','Presupuesto','Tecnico','Observaciones','Prioridad','GarantiaDias'].forEach(k => {
    if (data[k] !== undefined) {
      const value = k === 'Telefono' ? normalizePhone_(data[k]) : clean_(data[k]);
      if (String(found.row[idx[k]] || '') !== String(value || '')) changes.push(k);
      sh.getRange(rowNumber, idx[k] + 1).setValue(value);
    }
  });
  const newStatus = clean_(data.Estado);
  if (newStatus && newStatus !== oldStatus) {
    appendHistory_(sh, rowNumber, 'Cambio de estado', newStatus, 'Antes: ' + oldStatus);
    logHistory_(id, 'Cambio de estado', newStatus, 'Antes: ' + oldStatus);
    if (newStatus === 'Listo para retirar' || newStatus === 'Finalizado') sh.getRange(rowNumber, idx.FechaFinalizacion + 1).setValue(new Date());
    if (newStatus === 'Entregado') sh.getRange(rowNumber, idx.FechaEntrega + 1).setValue(new Date());
  } else if (changes.length) {
    appendHistory_(sh, rowNumber, 'Orden editada', newStatus || oldStatus, changes.join(', '));
    logHistory_(id, 'Orden editada', newStatus || oldStatus, changes.join(', '));
  }
  upsertClient_(data.Telefono || found.row[idx.Telefono], data.Cliente || found.row[idx.Cliente], data.Direccion || found.row[idx.Direccion], id);
  return { ok: true, message: 'Orden actualizada' };
}

function quickStatus(orderId, status) { return updateOrder(orderId, { Estado: status }); }

function deleteOrder(orderId) {
  const found = getRowById_(orderId);
  found.sh.deleteRow(found.rowNumber);
  logHistory_(orderId, 'Orden eliminada', '', 'Eliminada desde la app');
  return { ok: true };
}

function appendNote(orderId, note) {
  const found = getRowById_(orderId);
  const text = clean_(note) || 'Nota agregada';
  appendHistory_(found.sh, found.rowNumber, text, '', '');
  logHistory_(orderId, text, '', '');
  return { ok: true };
}

function appendHistory_(sh, rowNumber, action, status, detail) {
  const col = HEADERS.indexOf('Historial') + 1;
  let hist = [];
  try { hist = JSON.parse(sh.getRange(rowNumber, col).getValue() || '[]'); } catch (e) {}
  hist.push({ fecha: new Date().toISOString(), accion: action, estado: status || '', detalle: detail || '' });
  sh.getRange(rowNumber, col).setValue(JSON.stringify(hist));
}

function logHistory_(orderId, action, status, detail) {
  const sh = getSS_().getSheetByName('HISTORIAL');
  if (!sh) return;
  sh.appendRow([new Date(), orderId, action, status || '', Session.getActiveUser().getEmail() || '', detail || '']);
}

function getStats() {
  const orders = listOrders('', 10000);
  const count = s => orders.filter(o => o.Estado === s).length;
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const todayOrders = orders.filter(o => o.FechaISO && o.FechaISO.slice(0, 10) === today).length;
  const active = orders.filter(o => !['Entregado','No reparable'].includes(o.Estado)).length;
  return { total: orders.length, activos: active, hoy: todayOrders, recibido: count('Recibido'), diagnostico: count('Diagnóstico'), reparando: count('Reparando'), esperando: count('Esperando repuesto'), listo: count('Listo para retirar'), entregado: count('Entregado'), noreparable: count('No reparable') };
}

function lookupClientByPhone(phone) {
  setupDatabase();
  const normalized = normalizePhone_(phone);
  if (!normalized) return null;
  const sh = getClientSheet_();
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === normalized) {
      return { Telefono: values[i][0], Cliente: values[i][1], Direccion: values[i][2], UltimaOrden: values[i][3], CantidadOrdenes: values[i][4] || 1 };
    }
  }
  return null;
}

function upsertClient_(phone, name, address, orderId) {
  const normalized = normalizePhone_(phone);
  if (!normalized || !clean_(name)) return;
  const sh = getClientSheet_();
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === normalized) {
      const count = Number(values[i][4] || 0) + (String(values[i][3]) === String(orderId) ? 0 : 1);
      sh.getRange(i + 1, 2, 1, 5).setValues([[clean_(name), clean_(address), orderId, count, new Date()]]);
      return;
    }
  }
  sh.appendRow([normalized, clean_(name), clean_(address), orderId, 1, new Date()]);
}

function formatOrder_(o) {
  ['Fecha','FechaFinalizacion','FechaEntrega'].forEach(k => {
    if (o[k] instanceof Date) {
      o[k + 'Texto'] = Utilities.formatDate(o[k], Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
      o[k + 'ISO'] = Utilities.formatDate(o[k], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    } else { o[k + 'Texto'] = String(o[k] || ''); o[k + 'ISO'] = ''; }
  });
  o.FechaTexto = o.FechaTexto || '';
  o.FechaISO = o.FechaISO || '';
  try { o.HistorialParsed = JSON.parse(o.Historial || '[]'); } catch (e) { o.HistorialParsed = []; }
  return o;
}

function clean_(v) { return String(v == null ? '' : v).trim(); }
function normalizePhone_(v) { return clean_(v).replace(/[\s\-().]/g, ''); }
