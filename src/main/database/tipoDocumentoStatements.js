'use strict';

const db = require('./db');

module.exports = {
  getAll: db.prepare(`
    SELECT id, nome FROM tipos_documento ORDER BY nome ASC
  `),

  insert: db.prepare(`
    INSERT INTO tipos_documento (nome) VALUES (@nome)
  `),

  update: db.prepare(`
    UPDATE tipos_documento SET nome = @nome WHERE id = @id
  `),

  delete: db.prepare(`
    DELETE FROM tipos_documento WHERE id = ?
  `),

  getById: db.prepare(`
    SELECT id, nome FROM tipos_documento WHERE id = ?
  `),

  countUsage: db.prepare(`
    SELECT COUNT(*) AS total FROM documentos WHERE tipo = ?
  `),
};
