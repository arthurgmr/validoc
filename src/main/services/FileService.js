'use strict';

const path = require('path');
const fs   = require('fs');
const { app, dialog, shell } = require('electron');

const FILES_DIR = path.join(app.getPath('userData'), 'arquivos');

if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

function _safeDestPath(filename) {
  const dest = path.join(FILES_DIR, path.basename(filename));
  if (!dest.startsWith(FILES_DIR + path.sep) && dest !== FILES_DIR) {
    throw new Error('Caminho de destino inválido.');
  }
  return dest;
}

function copyToStorage(sourcePath) {
  const resolved = path.resolve(sourcePath);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    throw new Error('Arquivo de origem não encontrado ou inválido.');
  }
  const ext      = path.extname(resolved).toLowerCase().slice(0, 10);
  const safeName = path.basename(resolved, path.extname(resolved))
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .substring(0, 60);
  const filename = `${Date.now()}_${safeName}${ext}`;
  const dest     = _safeDestPath(filename);
  fs.copyFileSync(resolved, dest);
  return filename; // retorna só o nome, não o path completo
}

function deleteFromStorage(storedFilename) {
  const filePath = _safeDestPath(storedFilename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function openFromStorage(storedFilename) {
  const filePath = _safeDestPath(storedFilename);
  if (!fs.existsSync(filePath)) throw new Error('Arquivo não encontrado no disco.');
  shell.openPath(filePath);
}

async function saveCopyDialog(browserWindow, storedFilename, suggestedName) {
  const srcPath = _safeDestPath(storedFilename);
  if (!fs.existsSync(srcPath)) throw new Error('Arquivo não encontrado no disco.');

  const ext = path.extname(storedFilename);
  const { canceled, filePath } = await dialog.showSaveDialog(browserWindow, {
    title: 'Salvar cópia do documento',
    defaultPath: `${suggestedName}${ext}`,
    filters: [{ name: 'Todos os arquivos', extensions: ['*'] }],
  });

  if (canceled || !filePath) return { canceled: true };
  fs.copyFileSync(srcPath, filePath);
  return { success: true, filePath };
}

module.exports = { copyToStorage, deleteFromStorage, openFromStorage, saveCopyDialog };
