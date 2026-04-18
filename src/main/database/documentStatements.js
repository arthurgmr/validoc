'use strict';

const db = require('./db');

module.exports = {
  insert: db.prepare(`
    INSERT INTO documentos (nome, identificador, empresa_id, tipo, data_validade, caminho_arquivo)
    VALUES (@nome, '', @empresa_id, @tipo, @data_validade, @caminho_arquivo)
  `),

  getAll: db.prepare(`
    SELECT d.id, d.nome, d.tipo, d.data_validade, d.caminho_arquivo, d.data_criacao,
           d.empresa_id,
           COALESCE(e.cnpj, NULLIF(d.identificador, '')) AS identificador,
           e.nome AS empresa_nome
    FROM documentos d
    LEFT JOIN empresas e ON d.empresa_id = e.id
    ORDER BY d.data_validade ASC
  `),

  getById: db.prepare('SELECT * FROM documentos WHERE id = ?'),

  delete: db.prepare('DELETE FROM documentos WHERE id = ?'),

  getExpiring: db.prepare(`
    SELECT d.nome, COALESCE(e.nome, NULLIF(d.identificador, '')) AS empresa_display
    FROM documentos d
    LEFT JOIN empresas e ON d.empresa_id = e.id
    WHERE d.data_validade = ?
  `),

  update: db.prepare(`
    UPDATE documentos
    SET nome = @nome, empresa_id = @empresa_id, tipo = @tipo, data_validade = @data_validade
    WHERE id = @id
  `),

  updateWithFile: db.prepare(`
    UPDATE documentos
    SET nome = @nome, empresa_id = @empresa_id, tipo = @tipo, data_validade = @data_validade,
        caminho_arquivo = @caminho_arquivo
    WHERE id = @id
  `),
};
