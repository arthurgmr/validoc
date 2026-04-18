'use strict';

const { BrowserWindow, app } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 760, minWidth: 820, minHeight: 560,
    backgroundColor: '#f1f5f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    title: 'ValiDoc – Gestão de Documentos',
  });

  mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));

  if (process.argv.includes('--dev')) mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('close', (e) => {
    if (!app.isQuiting) { e.preventDefault(); mainWindow.hide(); }
  });
}

function getMainWindow() { return mainWindow; }

module.exports = { createWindow, getMainWindow };
