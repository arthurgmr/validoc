'use strict';

const { Notification } = require('electron');
const DocumentService  = require('./DocumentService');

function send(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
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
