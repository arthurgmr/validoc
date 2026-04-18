'use strict';

const { ipcMain, dialog } = require('electron');

module.exports = function registerDialogHandlers(getMainWindow) {
  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(getMainWindow(), {
      title: 'Selecionar arquivo do documento',
      properties: ['openFile'],
      filters: [
        { name: 'Documentos', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'] },
        { name: 'Todos os arquivos', extensions: ['*'] },
      ],
    });
    if (canceled || filePaths.length === 0) return null;
    return filePaths[0];
  });
};
