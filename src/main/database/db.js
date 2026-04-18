'use strict';

const path = require('path');
const { app } = require('electron');
const Database = require('better-sqlite3');

const DB_PATH = path.join(app.getPath('userData'), 'validoc.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
