const APP_NAME = 'HARDSTOREUY Service';
const APP_VERSION = 'v0.3-clasp';
const SHEET_NAME = 'REPARACIONES';
const CONFIG_SHEET = 'CONFIG';

function doGet() {
  setupDatabase();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function apiInit() {
  setupDatabase();
  return {
    appName: APP_NAME,
    version: APP_VERSION,
    stats: getStats(),
    recent: listOrders('', 20),
    statuses: getStatuses(),
    types: getDeviceTypes(),
    technicians: getTechnicians()
  };
}
