'use strict';

const { ipcMain } = require('electron');
const UpdateService = require('../services/UpdateService');

function registerUpdateHandlers() {
  ipcMain.handle('updater:check',   () => UpdateService.checkForUpdates());
  ipcMain.handle('updater:install', () => UpdateService.installUpdate());
}

module.exports = registerUpdateHandlers;
