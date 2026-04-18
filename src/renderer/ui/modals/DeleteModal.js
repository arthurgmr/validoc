import { BaseModal }          from './BaseModal.js';
import { DocumentApiService } from '../../services/DocumentApiService.js';
import { CompanyApiService }  from '../../services/CompanyApiService.js';
import { toast }              from '../Toast.js';

class DeleteModal extends BaseModal {
  #confirmBtn;
  #itemTypeEl;
  #docNameEl;
  #subtitleEl;
  #pendingId   = null;
  #pendingType = null;
  #onDocDeleted;
  #onCompanyDeleted;

  constructor({ onDocDeleted, onCompanyDeleted }) {
    super({ backdropId: 'delete-backdrop', closeButtonId: 'btn-delete-cancel', errorId: 'delete-error' });
    this.#confirmBtn       = document.getElementById('btn-delete-confirm');
    this.#itemTypeEl       = document.getElementById('delete-item-type');
    this.#docNameEl        = document.getElementById('delete-doc-name');
    this.#subtitleEl       = document.getElementById('delete-body-subtitle');
    this.#onDocDeleted     = onDocDeleted;
    this.#onCompanyDeleted = onCompanyDeleted;
    this._initCloseTriggers('btn-delete-cancel');
    this.#initConfirm();
  }

  openFor(id, nome, type = 'document') {
    this.#pendingId              = id;
    this.#pendingType            = type;
    this.#docNameEl.textContent  = nome;
    this.#itemTypeEl.textContent = type === 'empresa' ? 'a empresa' : 'o documento';
    this.#subtitleEl.style.display = type === 'empresa' ? 'none' : '';
    super.open();
    setTimeout(() => document.getElementById('btn-delete-cancel').focus(), 60);
  }

  _onClose() {
    this.#pendingId   = null;
    this.#pendingType = null;
  }

  #initConfirm() {
    this.#confirmBtn.addEventListener('click', async () => {
      if (!this.#pendingId) return;
      this.#confirmBtn.disabled  = true;
      this.#confirmBtn.innerHTML = '<span class="spinner"></span>';

      try {
        if (this.#pendingType === 'empresa') {
          await CompanyApiService.delete(this.#pendingId);
          this.close();
          await this.#onCompanyDeleted();
          toast.show('Empresa excluída.', 'success');
        } else {
          await DocumentApiService.delete(this.#pendingId);
          this.close();
          await this.#onDocDeleted();
          toast.show('Documento excluído.', 'success');
        }
      } catch (err) {
        if (err.code === 'BUSINESS_RULE') {
          this.showError(err.message);
        } else {
          toast.show('Erro inesperado ao excluir.', 'error');
          this.close();
        }
      } finally {
        this.#confirmBtn.disabled    = false;
        this.#confirmBtn.textContent = 'Excluir';
      }
    });
  }
}

export { DeleteModal };
