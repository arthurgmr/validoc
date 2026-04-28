'use strict';

const { Notification } = require('electron');
const path             = require('path');
const DocumentService  = require('./DocumentService');

const ICON_PATH = path.join(__dirname, '../../../assets/icon.png');

function send(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: ICON_PATH }).show();
  }
}

function checkExpiringDocuments() {
  const today    = new Date().toISOString().split('T')[0];
  const expiring = DocumentService.getExpiring(today);
  expiring.forEach((doc) => {
    send('⚠️ Documento Vencendo Hoje', `"${doc.nome}" — ${doc.empresa_display ?? 'Documento'} vence hoje!`);
  });
}

module.exports = { send, checkExpiringDocuments };
