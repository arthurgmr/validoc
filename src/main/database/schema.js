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
    data_validade   TEXT,
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

// Migration idempotente: permite data_validade nula (prazo indeterminado)
// SQLite não suporta DROP NOT NULL via ALTER TABLE, então recriamos a tabela
// preservando todos os dados existentes apenas se a constraint ainda existir.
try {
  const colInfo = db.prepare("PRAGMA table_info(documentos)").all();
  const validadeCol = colInfo.find((c) => c.name === 'data_validade');
  if (validadeCol && validadeCol.notnull === 1) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS documentos_new (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        nome            TEXT    NOT NULL,
        identificador   TEXT    NOT NULL DEFAULT '',
        empresa_id      INTEGER REFERENCES empresas(id),
        tipo            TEXT    NOT NULL,
        data_validade   TEXT,
        caminho_arquivo TEXT    NOT NULL,
        data_criacao    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO documentos_new (id, nome, identificador, empresa_id, tipo, data_validade, caminho_arquivo, data_criacao)
        SELECT id, nome, identificador, empresa_id, tipo, data_validade, caminho_arquivo, data_criacao
        FROM documentos;
      DROP TABLE documentos;
      ALTER TABLE documentos_new RENAME TO documentos;
      CREATE INDEX IF NOT EXISTS idx_validade ON documentos (data_validade);
      CREATE INDEX IF NOT EXISTS idx_pesquisa ON documentos (nome, identificador);
    `);
  }
} catch {
  // Tabela já migrada ou erro inesperado — ignorar
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
