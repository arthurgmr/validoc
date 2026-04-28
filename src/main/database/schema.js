'use strict';

const db = require('./db');

db.exec(`
  CREATE TABLE IF NOT EXISTS empresas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nome         TEXT NOT NULL,
    cnpj         TEXT NOT NULL UNIQUE,
    telefone     TEXT NOT NULL,
    email        TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_empresas_nome ON empresas (nome);
  CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas (cnpj);

  CREATE TABLE IF NOT EXISTS documentos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT    NOT NULL,
    identificador   TEXT    NOT NULL DEFAULT '',
    empresa_id      INTEGER REFERENCES empresas(id),
    tipo            TEXT    NOT NULL,
    data_validade   TEXT    NOT NULL,
    caminho_arquivo TEXT    NOT NULL,
    data_criacao    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_validade ON documentos (data_validade);
  CREATE INDEX IF NOT EXISTS idx_pesquisa ON documentos (nome, identificador);
`);

// Migration idempotente: adiciona empresa_id em instalações existentes
try {
  db.exec('ALTER TABLE documentos ADD COLUMN empresa_id INTEGER REFERENCES empresas(id)');
} catch {
  // Coluna já existe — ignorar
}

// Migration idempotente: tabela de tipos de documento gerenciáveis
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tipos_documento (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nome         TEXT    NOT NULL UNIQUE,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch {
  // Tabela já existe — ignorar
}

module.exports = {};
