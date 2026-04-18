'use strict';

require('./src/main/database/schema'); // garante criação das tabelas antes de tudo

const { app, BrowserWindow } = require('electron');
const { createWindow, getMainWindow } = require('./src/main/window');
const { createTray }  = require('./src/main/tray');
const { setupCron }   = require('./src/main/cron');
const db              = require('./src/main/database/db');

const registerDocumentHandlers = require('./src/main/ipc/documentHandlers');
const registerCompanyHandlers  = require('./src/main/ipc/companyHandlers');
const registerDialogHandlers   = require('./src/main/ipc/dialogHandlers');
const registerUpdateHandlers   = require('./src/main/ipc/updateHandlers');
const UpdateService            = require('./src/main/services/UpdateService');

registerDocumentHandlers(getMainWindow);
registerCompanyHandlers();
registerDialogHandlers(getMainWindow);
registerUpdateHandlers();
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

