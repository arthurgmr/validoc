'use strict';

require('./src/main/database/schema');

const { app, BrowserWindow } = require('electron');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.validoc.desktop');
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const { getMainWindow } = require('./src/main/window');
    const win = getMainWindow();
    if (win) { win.show(); win.focus(); }
  });
}
const { createWindow, getMainWindow } = require('./src/main/window');
const { createTray }  = require('./src/main/tray');
const { setupCron }   = require('./src/main/cron');
const db              = require('./src/main/database/db');

const registerDocumentHandlers      = require('./src/main/ipc/documentHandlers');
const registerCompanyHandlers       = require('./src/main/ipc/companyHandlers');
const registerDialogHandlers        = require('./src/main/ipc/dialogHandlers');
const registerUpdateHandlers        = require('./src/main/ipc/updateHandlers');
const registerTipoDocumentoHandlers = require('./src/main/ipc/tipoDocumentoHandlers');
const UpdateService                 = require('./src/main/services/UpdateService');

registerDocumentHandlers(getMainWindow);
registerCompanyHandlers();
registerDialogHandlers(getMainWindow);
registerUpdateHandlers();
registerTipoDocumentoHandlers();
UpdateService.setup();

app.whenReady().then(() => {
  createWindow();
  createTray(getMainWindow);
  setupCron();
  UpdateService.checkForUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else { getMainWindow().show(); getMainWindow().focus(); }
  });
});

app.on('window-all-closed', () => {});

app.on('before-quit', () => {
  app.isQuiting = true;
  db.close();
});

