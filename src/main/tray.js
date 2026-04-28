'use strict';

const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');
const fs   = require('fs');

let tray;

function createTray(getMainWindow) {
  try {
    const iconFile = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
    const iconPath = path.join(__dirname, '../../assets', iconFile);
    const icon = fs.existsSync(iconPath)
      ? nativeImage.createFromPath(iconPath)
      : nativeImage.createEmpty();

    tray = new Tray(icon);
    tray.setToolTip('ValiDoc – Gestão de Documentos');

    function buildMenu() {
      const openAtLogin = app.getLoginItemSettings().openAtLogin;
      return Menu.buildFromTemplate([
        { label: 'Abrir ValiDoc', click: () => { getMainWindow().show(); getMainWindow().focus(); } },
        { type: 'separator' },
        {
          label: 'Iniciar com o sistema',
          type: 'checkbox',
          checked: openAtLogin,
          click: () => {
            app.setLoginItemSettings({ openAtLogin: !openAtLogin });
            tray.setContextMenu(buildMenu());
          },
        },
        { type: 'separator' },
        { label: 'Sair', click: () => { app.isQuiting = true; app.quit(); } },
      ]);
    }

    tray.setContextMenu(buildMenu());
    tray.on('double-click', () => { getMainWindow().show(); getMainWindow().focus(); });
  } catch (err) {
    console.error('[Tray] Falha ao criar ícone na bandeja:', err.message);
  }
}

module.exports = { createTray };
