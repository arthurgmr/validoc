'use strict';

const { ipcMain } = require('electron');
const CompanyService = require('../services/CompanyService');
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

module.exports = function registerCompanyHandlers() {
  ipcMain.handle('companies:getAll',  ()            => handleSafe(() => CompanyService.getAll())());
  ipcMain.handle('companies:add',     (_, data)     => handleSafe(() => CompanyService.add(data))());
  ipcMain.handle('companies:delete',  (_, id)       => handleSafe(() => CompanyService.remove(id))());
  ipcMain.handle('companies:update',  (_, id, data) => handleSafe(() => CompanyService.update(id, data))());
};
