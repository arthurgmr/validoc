'use strict';

const cron = require('node-cron');
const { checkExpiringDocuments } = require('./services/NotificationService');

function setupCron() {
  try {
    cron.schedule('0 9 * * *', checkExpiringDocuments, { timezone: 'America/Sao_Paulo' });
  } catch {
    cron.schedule('0 9 * * *', checkExpiringDocuments);
  }
  setTimeout(checkExpiringDocuments, 5000);
}

module.exports = { setupCron };
