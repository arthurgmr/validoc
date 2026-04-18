'use strict';

const stmt = require('../database/companyStatements');
const { ValidationError, BusinessRuleError, NotFoundError } = require('../errors/AppError');

function getAll() {
  return stmt.getAll.all();
}

function add({ nome, cnpj, telefone, email }) {
  const nomeTrim = String(nome ?? '').trim();
  if (nomeTrim.length < 3) throw new ValidationError('Nome deve ter pelo menos 3 caracteres.');

  const cnpjDigits = String(cnpj ?? '').replace(/\D/g, '');
  if (cnpjDigits.length !== 14) throw new ValidationError('CNPJ inválido.');
  const cnpjFormatted = cnpjDigits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

  const telDigits = String(telefone ?? '').replace(/\D/g, '');
  if (telDigits.length < 10 || telDigits.length > 11) throw new ValidationError('Telefone inválido.');

  const emailTrim = String(email ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) throw new ValidationError('E-mail inválido.');

  try {
    const result = stmt.insert.run({ nome: nomeTrim, cnpj: cnpjFormatted, telefone: String(telefone).trim(), email: emailTrim });
    return { id: result.lastInsertRowid };
  } catch (err) {
    if (err.message.includes('UNIQUE')) throw new BusinessRuleError('CNPJ já cadastrado.');
    throw err;
  }
}

function remove(id) {
  const company = stmt.getById.get(id);
  if (!company) throw new NotFoundError('Empresa não encontrada.');

  const { count } = stmt.countDocs.get(id);
  if (count > 0) throw new BusinessRuleError(`Não é possível excluir: há ${count} documento(s) vinculado(s) a esta empresa.`);

  stmt.delete.run(id);
  return { success: true };
}

function update(id, { nome, cnpj, telefone, email }) {
  const company = stmt.getById.get(id);
  if (!company) throw new NotFoundError('Empresa não encontrada.');

  const nomeTrim = String(nome ?? '').trim();
  if (nomeTrim.length < 3) throw new ValidationError('Nome deve ter pelo menos 3 caracteres.');

  const cnpjDigits = String(cnpj ?? '').replace(/\D/g, '');
  if (cnpjDigits.length !== 14) throw new ValidationError('CNPJ inválido.');
  const cnpjFormatted = cnpjDigits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

  const telDigits = String(telefone ?? '').replace(/\D/g, '');
  if (telDigits.length < 10 || telDigits.length > 11) throw new ValidationError('Telefone inválido.');

  const emailTrim = String(email ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) throw new ValidationError('E-mail inválido.');

  try {
    stmt.update.run({ id, nome: nomeTrim, cnpj: cnpjFormatted, telefone: String(telefone).trim(), email: emailTrim });
    return { success: true };
  } catch (err) {
    if (err.message.includes('UNIQUE')) throw new BusinessRuleError('CNPJ já cadastrado por outra empresa.');
    throw err;
  }
}

module.exports = { getAll, add, remove, update };
