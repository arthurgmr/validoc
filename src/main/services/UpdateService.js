'use strict';

const { autoUpdater } = require('electron-updater');
const { getMainWindow } = require('../window');

const isDev = process.argv.includes('--dev');

function _send(data) {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) win.webContents.send('update:status', data);
}

function setup() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    _send({ type: 'available', version: info.version });
  });

  autoUpdater.on('update-downloaded', (info) => {
    _send({ type: 'downloaded', version: info.version });
  });

  autoUpdater.on('error', (err) => {
    if (isDev) return;
    _send({ type: 'error', message: err.message });
  });
}

function checkForUpdates() {
  if (isDev) return;
  autoUpdater.checkForUpdates().catch(() => {});
}

function installUpdate() {
  autoUpdater.quitAndInstall(false, true);
}

module.exports = { setup, checkForUpdates, installUpdate };
