'use strict';

const db = require('./db');

module.exports = {
  insert:    db.prepare('INSERT INTO empresas (nome, cnpj, telefone, email) VALUES (@nome, @cnpj, @telefone, @email)'),
  getAll:    db.prepare('SELECT * FROM empresas ORDER BY nome ASC'),
  getById:   db.prepare('SELECT * FROM empresas WHERE id = ?'),
  delete:    db.prepare('DELETE FROM empresas WHERE id = ?'),
  countDocs: db.prepare('SELECT COUNT(*) AS count FROM documentos WHERE empresa_id = ?'),
  update:    db.prepare('UPDATE empresas SET nome = @nome, cnpj = @cnpj, telefone = @telefone, email = @email WHERE id = @id'),
};
