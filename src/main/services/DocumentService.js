'use strict';

const stmt        = require('../database/documentStatements');
const compStmt    = require('../database/companyStatements');
const FileService = require('./FileService');
const { NotFoundError } = require('../errors/AppError');

function getAll() {
  return stmt.getAll.all();
}

function add({ nome, empresa_id, tipo, data_validade, sourcePath }) {
  if (!empresa_id || !compStmt.getById.get(Number(empresa_id))) {
    throw new NotFoundError('Empresa não encontrada.');
  }
  const storedFilename = FileService.copyToStorage(sourcePath);
  const result = stmt.insert.run({
    nome,
    empresa_id: Number(empresa_id),
    tipo,
    data_validade,
    caminho_arquivo: storedFilename,
  });
  return { id: result.lastInsertRowid };
}

function remove(id) {
  const doc = stmt.getById.get(id);
  if (!doc) throw new NotFoundError('Documento não encontrado.');
  FileService.deleteFromStorage(doc.caminho_arquivo);
  stmt.delete.run(id);
  return { success: true };
}

function open(id) {
  const doc = stmt.getById.get(id);
  if (!doc) throw new NotFoundError('Documento não encontrado.');
  FileService.openFromStorage(doc.caminho_arquivo);
  return { success: true };
}

async function saveCopy(id, browserWindow) {
  const doc = stmt.getById.get(id);
  if (!doc) throw new NotFoundError('Documento não encontrado.');
  return FileService.saveCopyDialog(browserWindow, doc.caminho_arquivo, doc.nome);
}

function getExpiring(date) {
  return stmt.getExpiring.all(date);
}

function getById(id) {
  const doc = stmt.getById.get(id);
  if (!doc) throw new NotFoundError('Documento não encontrado.');
  return doc;
}

function update(id, { nome, empresa_id, tipo, data_validade, sourcePath }) {
  const doc = stmt.getById.get(id);
  if (!doc) throw new NotFoundError('Documento não encontrado.');

  if (!compStmt.getById.get(Number(empresa_id))) {
    throw new NotFoundError('Empresa não encontrada.');
  }

  if (sourcePath) {
    const novoNomeArquivo = FileService.copyToStorage(sourcePath);
    FileService.deleteFromStorage(doc.caminho_arquivo);
    stmt.updateWithFile.run({
      id,
      nome,
      empresa_id: Number(empresa_id),
      tipo,
      data_validade,
      caminho_arquivo: novoNomeArquivo,
    });
  } else {
    stmt.update.run({ id, nome, empresa_id: Number(empresa_id), tipo, data_validade });
  }

  return { success: true };
}

module.exports = { getAll, add, remove, open, saveCopy, getExpiring, update, getById };
