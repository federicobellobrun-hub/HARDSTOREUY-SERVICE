const HEADERS = [
  'ID','Fecha','Cliente','Telefono','Tipo','Marca','Modelo','SerieIMEI','Problema','Accesorios',
  'Estado','Presupuesto','Tecnico','Observaciones','FechaFinalizacion','Historial','WhatsApp','Prioridad'
];

function getSS_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function getSheet_() { setupDatabase(); return getSS_().getSheetByName(SHEET_NAME); }

function setupDatabase() {
  const ss = getSS_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);

  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);

  const maxCols = Math.max(sh.getLastColumn(), HEADERS.length);
  const current = sh.getRange(1, 1, 1, maxCols).getValues()[0];
  HEADERS.forEach((h, i) => {
    if (current[i] !== h) sh.getRange(1, i + 1).setValue(h);
  });

  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#f5f5f7')
    .setFontColor('#1d1d1f');
  sh.autoResizeColumns(1, HEADERS.length);

  let cfg = ss.getSheetByName(CONFIG_SHEET);
  if (!cfg) {
    cfg = ss.insertSheet(CONFIG_SHEET);
    cfg.appendRow(['Clave', 'Valor']);
    cfg.appendRow(['ultimo_numero', '0']);
    cfg.hideSheet();
  }
}

function nextOrderId_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    setupDatabase();
    const cfg = getSS_().getSheetByName(CONFIG_SHEET);
    const values = cfg.getDataRange().getValues();
    let row = values.findIndex(r => r[0] === 'ultimo_numero') + 1;
    if (row < 1) {
      cfg.appendRow(['ultimo_numero', '0']);
      row = cfg.getLastRow();
    }
    const next = Number(cfg.getRange(row, 2).getValue() || 0) + 1;
    cfg.getRange(row, 2).setValue(next);
    return 'HS-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy') + '-' + String(next).padStart(6, '0');
  } finally {
    lock.releaseLock();
  }
}

function mapRow_(row) {
  const obj = {};
  HEADERS.forEach((h, i) => obj[h] = row[i] === undefined ? '' : row[i]);
  return obj;
}

function getRowById_(id) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][0]) === String(id)) return { sh, rowNumber: r + 1, row: values[r] };
  }
  throw new Error('Orden no encontrada: ' + id);
}

function createOrder(data) {
  setupDatabase();
  const sh = getSheet_();
  const id = nextOrderId_();
  const now = new Date();
  const status = clean_(data.Estado) || 'Recibido';
  const history = JSON.stringify([{ fecha: now.toISOString(), accion: 'Orden creada', estado: status }]);

  sh.appendRow([
    id,
    now,
    clean_(data.Cliente),
    normalizePhone_(data.Telefono),
    clean_(data.Tipo),
    clean_(data.Marca),
    clean_(data.Modelo),
    clean_(data.SerieIMEI),
    clean_(data.Problema),
    clean_(data.Accesorios),
    status,
    clean_(data.Presupuesto),
    clean_(data.Tecnico),
    clean_(data.Observaciones),
    '',
    history,
    '',
    clean_(data.Prioridad) || 'Normal'
  ]);

  return { ok: true, id, message: 'Orden creada' };
}

function listOrders(query, limit) {
  setupDatabase();
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues().map(mapRow_).reverse();
  const q = String(query || '').toLowerCase().trim();
  const filtered = q
    ? rows.filter(o => Object.values(o).join(' ').toLowerCase().includes(q))
    : rows;
  return filtered.slice(0, Number(limit || 100)).map(formatOrder_);
}

function getOrder(id) {
  const found = getRowById_(id);
  return formatOrder_(mapRow_(found.row));
}

function updateOrder(id, data) {
  const found = getRowById_(id);
  const sh = found.sh;
  const rowNumber = found.rowNumber;
  const idx = HEADERS.reduce((a, h, i) => (a[h] = i, a), {});
  const oldStatus = found.row[idx.Estado];

  ['Cliente','Telefono','Tipo','Marca','Modelo','SerieIMEI','Problema','Accesorios','Estado','Presupuesto','Tecnico','Observaciones','Prioridad'].forEach(k => {
    if (data[k] !== undefined) {
      const value = k === 'Telefono' ? normalizePhone_(data[k]) : clean_(data[k]);
      sh.getRange(rowNumber, idx[k] + 1).setValue(value);
    }
  });

  if (data.Estado && data.Estado !== oldStatus) {
    appendHistory_(sh, rowNumber, 'Cambio de estado', data.Estado);
    if (data.Estado === 'Listo para retirar' || data.Estado === 'Finalizado') {
      sh.getRange(rowNumber, idx.FechaFinalizacion + 1).setValue(new Date());
    }
  }

  return { ok: true, message: 'Orden actualizada' };
}

function quickStatus(orderId, status) {
  return updateOrder(orderId, { Estado: status });
}

function appendNote(orderId, note) {
  const found = getRowById_(orderId);
  appendHistory_(found.sh, found.rowNumber, clean_(note) || 'Nota agregada', '');
  return { ok: true };
}

function appendHistory_(sh, rowNumber, action, status) {
  const col = HEADERS.indexOf('Historial') + 1;
  let hist = [];
  try { hist = JSON.parse(sh.getRange(rowNumber, col).getValue() || '[]'); } catch (e) {}
  hist.push({ fecha: new Date().toISOString(), accion: action, estado: status || '' });
  sh.getRange(rowNumber, col).setValue(JSON.stringify(hist));
}

function getStats() {
  const orders = listOrders('', 10000);
  const count = s => orders.filter(o => o.Estado === s).length;
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const todayOrders = orders.filter(o => o.FechaISO && o.FechaISO.slice(0, 10) === today).length;
  return {
    total: orders.length,
    hoy: todayOrders,
    recibido: count('Recibido'),
    diagnostico: count('Diagnóstico'),
    reparando: count('Reparando'),
    esperando: count('Esperando repuesto'),
    listo: count('Listo para retirar'),
    entregado: count('Entregado'),
    noreparable: count('No reparable')
  };
}

function formatOrder_(o) {
  if (o.Fecha instanceof Date) {
    o.FechaTexto = Utilities.formatDate(o.Fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
    o.FechaISO = Utilities.formatDate(o.Fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  } else {
    o.FechaTexto = String(o.Fecha || '');
    o.FechaISO = '';
  }
  if (o.FechaFinalizacion instanceof Date) {
    o.FechaFinalizacionTexto = Utilities.formatDate(o.FechaFinalizacion, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  } else {
    o.FechaFinalizacionTexto = String(o.FechaFinalizacion || '');
  }
  try { o.HistorialParsed = JSON.parse(o.Historial || '[]'); } catch (e) { o.HistorialParsed = []; }
  return o;
}

function clean_(v) { return String(v == null ? '' : v).trim(); }
function normalizePhone_(v) { return clean_(v).replace(/[\s\-().]/g, ''); }
