'use strict';

const stmt = require('../database/tipoDocumentoStatements');
const { ValidationError, NotFoundError } = require('../errors/AppError');

function getAll() {
  return stmt.getAll.all();
}

function add({ nome }) {
  const nomeTrimmed = (nome ?? '').trim();
  if (!nomeTrimmed) throw new ValidationError('O nome do tipo é obrigatório.');
  if (nomeTrimmed.length > 200) throw new ValidationError('O nome do tipo deve ter no máximo 200 caracteres.');

  try {
    const result = stmt.insert.run({ nome: nomeTrimmed });
    return { id: result.lastInsertRowid };
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      throw new ValidationError('Já existe um tipo com este nome.');
    }
    throw err;
  }
}

function update(id, { nome }) {
  const nomeTrimmed = (nome ?? '').trim();
  if (!nomeTrimmed) throw new ValidationError('O nome do tipo é obrigatório.');
  if (nomeTrimmed.length > 200) throw new ValidationError('O nome do tipo deve ter no máximo 200 caracteres.');

  const existing = stmt.getById.get(id);
  if (!existing) throw new NotFoundError('Tipo de documento não encontrado.');

  try {
    stmt.update.run({ id, nome: nomeTrimmed });
    return { success: true };
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      throw new ValidationError('Já existe um tipo com este nome.');
    }
    throw err;
  }
}

function remove(id) {
  const existing = stmt.getById.get(id);
  if (!existing) throw new NotFoundError('Tipo de documento não encontrado.');

  const { total } = stmt.countUsage.get(existing.nome);
  if (total > 0) {
    throw new ValidationError(
      `Não é possível excluir: ${total} documento(s) utilizam este tipo.`
    );
  }

  stmt.delete.run(id);
  return { success: true };
}

module.exports = { getAll, add, update, remove };
