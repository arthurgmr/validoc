'use strict';

const { ipcMain } = require('electron');
const DocumentService = require('../services/DocumentService');
const { AppError } = require('../errors/AppError');

function handleSafe(fn) {
  return async (...args) => {
    try {
      return { ok: true, data: await fn(...args) };
    } catch (err) {
      if (err.isAppError) {
        return { ok: false, code: err.code, message: err.message };
      }
      console.error('[IPC Error]', err);
      throw err;
    }
  };
}

module.exports = function registerDocumentHandlers(getMainWindow) {
  ipcMain.handle('documents:getAll',   ()            => handleSafe(() => DocumentService.getAll())());
  ipcMain.handle('documents:add',      (_, data)     => handleSafe(() => DocumentService.add(data))());
  ipcMain.handle('documents:delete',   (_, id)       => handleSafe(() => DocumentService.remove(id))());
  ipcMain.handle('documents:open',     (_, id)       => handleSafe(() => DocumentService.open(id))());
  ipcMain.handle('documents:saveCopy', (_, id)       => handleSafe(() => DocumentService.saveCopy(id, getMainWindow()))());
  ipcMain.handle('documents:update',   (_, id, data) => handleSafe(() => DocumentService.update(id, data))());
  ipcMain.handle('documents:getById',  (_, id)       => handleSafe(() => DocumentService.getById(id))());
};
