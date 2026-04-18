import { BaseModal }          from './BaseModal.js';
import { CompanyApiService }  from '../../services/CompanyApiService.js';
import { maskCnpj, maskPhone } from '../../utils/masks.js';
import { toast }              from '../Toast.js';

class CompanyModal extends BaseModal {
  #form;
  #submitBtn;
  #modalTitle;
  #editingId = null;
  #onSuccess;

  constructor(onSuccess) {
    super({ backdropId: 'add-empresa-backdrop', closeButtonId: 'empresa-modal-close', errorId: 'empresa-form-error' });
    this.#form       = document.getElementById('add-empresa-form');
    this.#submitBtn  = document.getElementById('btn-empresa-submit');
    this.#modalTitle = document.getElementById('modal-empresa-title');
    this.#onSuccess  = onSuccess;
    this._initCloseTriggers('btn-empresa-cancel');
    this.#initMasks();
    this.#initSubmit();
  }

  // ─── Abrir em modo criação ────────────────────────────────────────────────
  _onOpen() {
    this.#editingId = null;
    this.#form.reset();
    this.#modalTitle.textContent      = 'Nova Empresa';
    this.#submitBtn.textContent       = 'Salvar empresa';
    setTimeout(() => document.getElementById('field-empresa-nome').focus(), 60);
  }

  // ─── Abrir em modo edição ─────────────────────────────────────────────────
  async openForEdit(id) {
    this.#editingId = id;
    this.#form.reset();
    this.#modalTitle.textContent = 'Editar Empresa';
    this.#submitBtn.textContent  = 'Salvar alterações';

    this.hideError();
    document.getElementById('add-empresa-backdrop').classList.add('open');

    try {
      const companies = await CompanyApiService.getAll();
      const company   = companies.find((c) => c.id === id);
      if (!company) throw new Error('Empresa não encontrada.');

      document.getElementById('field-empresa-nome').value     = company.nome;
      document.getElementById('field-empresa-cnpj').value     = company.cnpj;
      document.getElementById('field-empresa-telefone').value = company.telefone;
      document.getElementById('field-empresa-email').value    = company.email;

      setTimeout(() => document.getElementById('field-empresa-nome').focus(), 60);
    } catch (err) {
      this.showError('Erro ao carregar dados da empresa: ' + (err.message || 'tente novamente.'));
    }
  }

  #initMasks() {
    document.getElementById('field-empresa-cnpj').addEventListener('input', (e) => {
      e.target.value = maskCnpj(e.target.value);
    });
    document.getElementById('field-empresa-telefone').addEventListener('input', (e) => {
      e.target.value = maskPhone(e.target.value);
    });
  }

  #initSubmit() {
    this.#form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.hideError();

      const isEditing  = this.#editingId !== null;
      const data       = new FormData(this.#form);
      this.#submitBtn.disabled  = true;
      this.#submitBtn.innerHTML = '<span class="spinner"></span> Salvando...';

      try {
        const payload = {
          nome:     data.get('nome').trim(),
          cnpj:     data.get('cnpj').trim(),
          telefone: data.get('telefone').trim(),
          email:    data.get('email').trim(),
        };

        if (isEditing) {
          await CompanyApiService.update(this.#editingId, payload);
          toast.show('Empresa atualizada com sucesso!', 'success');
        } else {
          await CompanyApiService.add(payload);
          toast.show('Empresa cadastrada com sucesso!', 'success');
        }

        this.close();
        await this.#onSuccess();
      } catch (err) {
        this.showError(err.message || 'Erro ao salvar empresa. Tente novamente.');
      } finally {
        this.#submitBtn.disabled    = false;
        this.#submitBtn.textContent = isEditing ? 'Salvar alterações' : 'Salvar empresa';
      }
    });
  }
}

export { CompanyModal };
