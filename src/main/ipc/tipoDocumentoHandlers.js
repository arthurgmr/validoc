'use strict';

const { ipcMain } = require('electron');
const TipoDocumentoService = require('../services/TipoDocumentoService');

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

module.exports = function registerTipoDocumentoHandlers() {
  ipcMain.handle('tipos:getAll',  ()           => handleSafe(() => TipoDocumentoService.getAll())());
  ipcMain.handle('tipos:add',     (_, data)    => handleSafe(() => TipoDocumentoService.add(data))());
  ipcMain.handle('tipos:update',  (_, id, data) => handleSafe(() => TipoDocumentoService.update(id, data))());
  ipcMain.handle('tipos:delete',  (_, id)      => handleSafe(() => TipoDocumentoService.remove(id))());
};
