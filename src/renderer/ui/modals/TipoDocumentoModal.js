import { BaseModal }              from './BaseModal.js';
import { TipoDocumentoApiService } from '../../services/TipoDocumentoApiService.js';
import { escapeHtml }              from '../../utils/format.js';
import { Icons }                   from '../../utils/icons.js';

class TipoDocumentoModal extends BaseModal {
  #list;
  #input;
  #addBtn;
  #errorEl;

  constructor() {
    super({ backdropId: 'tipos-backdrop', closeButtonId: 'tipos-modal-close', errorId: 'tipos-form-error' });
    this.#list    = document.getElementById('tipos-list');
    this.#input   = document.getElementById('tipos-novo-input');
    this.#addBtn  = document.getElementById('tipos-add-btn');
    this.#errorEl = document.getElementById('tipos-form-error');
    this._initCloseTriggers('tipos-modal-fechar');
    this.#initEvents();
  }

  async _onOpen() {
    this.#input.value = '';
    this.hideError();
    await this.#renderList();
    setTimeout(() => this.#input.focus(), 60);
  }

  _onClose() {
    this.hideError();
  }

  // ─── Renderiza a lista de tipos ─────────────────────────────────────────
  async #renderList() {
    this.#list.innerHTML = '<li class="tipos-list-loading">Carregando...</li>';
    try {
      const tipos = await TipoDocumentoApiService.getAll();
      if (tipos.length === 0) {
        this.#list.innerHTML = '<li class="tipos-list-empty">Nenhum tipo cadastrado.</li>';
        return;
      }
      this.#list.innerHTML = tipos.map((t) => this.#itemHtml(t)).join('');
      this.#bindItemEvents();
    } catch {
      this.#list.innerHTML = '<li class="tipos-list-empty">Erro ao carregar tipos.</li>';
    }
  }

  #itemHtml({ id, nome }) {
    return `
      <li class="tipos-list-item" data-id="${id}">
        <span class="tipos-item-nome">${escapeHtml(nome)}</span>
        <div class="action-group">
          <button class="btn btn--ghost btn--icon tipos-edit-btn" data-id="${id}" data-nome="${escapeHtml(nome)}" title="Editar">${Icons.pencil}</button>
          <button class="btn btn--ghost-danger btn--icon tipos-delete-btn" data-id="${id}" data-nome="${escapeHtml(nome)}" title="Excluir">${Icons.trash}</button>
        </div>
      </li>
    `;
  }

  // ─── Bind de eventos nos botões da lista ────────────────────────────────
  #bindItemEvents() {
    this.#list.querySelectorAll('.tipos-edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.#startInlineEdit(btn));
    });
    this.#list.querySelectorAll('.tipos-delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.#startInlineDelete(btn));
    });
  }

  // ─── Edição inline ───────────────────────────────────────────────────────
  #startInlineEdit(btn) {
    const id   = Number(btn.dataset.id);
    const nome = btn.dataset.nome;
    const li   = this.#list.querySelector(`li[data-id="${id}"]`);
    if (!li) return;

    li.innerHTML = `
      <input class="form-control tipos-edit-input" value="${escapeHtml(nome)}" maxlength="200" style="flex:1">
      <div class="action-group">
        <button class="btn btn--primary btn--sm tipos-save-btn" data-id="${id}">Salvar</button>
        <button class="btn btn--secondary btn--sm tipos-cancel-btn">Cancelar</button>
      </div>
    `;

    const editInput = li.querySelector('.tipos-edit-input');
    editInput.focus();
    editInput.select();

    li.querySelector('.tipos-cancel-btn').addEventListener('click', () => this.#renderList());
    li.querySelector('.tipos-save-btn').addEventListener('click',  () => this.#saveEdit(id, editInput));
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.#saveEdit(id, editInput);
      if (e.key === 'Escape') this.#renderList();
    });
  }

  async #saveEdit(id, input) {
    const nome = input.value.trim();
    if (!nome) return;

    input.disabled = true;
    try {
      await TipoDocumentoApiService.update(id, { nome });
      await this.#renderList();
    } catch (err) {
      this.#showInlineError(err.message || 'Erro ao atualizar.');
      input.disabled = false;
      input.focus();
    }
  }

  // ─── Confirmação inline de exclusão ─────────────────────────────────────
  #startInlineDelete(btn) {
    const id   = Number(btn.dataset.id);
    const nome = btn.dataset.nome;
    const li   = this.#list.querySelector(`li[data-id="${id}"]`);
    if (!li) return;

    li.innerHTML = `
      <span class="tipos-item-nome tipos-item-nome--warning"><strong>${escapeHtml(nome)}</strong></span>
      <div class="action-group">
        <button class="btn btn--danger btn--sm tipos-confirm-delete-btn" data-id="${id}">Excluir</button>
        <button class="btn btn--secondary btn--sm tipos-cancel-btn">Cancelar</button>
      </div>
    `;

    li.querySelector('.tipos-cancel-btn').addEventListener('click', () => this.#renderList());
    li.querySelector('.tipos-confirm-delete-btn').addEventListener('click', () => this.#doDelete(id, li));
  }

  async #doDelete(id, li) {
    const confirmBtn = li.querySelector('.tipos-confirm-delete-btn');
    confirmBtn.disabled  = true;
    confirmBtn.innerHTML = '<span class="spinner"></span>';

    try {
      await TipoDocumentoApiService.delete(id);
      await this.#renderList();
    } catch (err) {
      this.#showInlineError(err.message || 'Erro ao excluir.');
      await this.#renderList();
    }
  }

  // ─── Adicionar novo tipo ─────────────────────────────────────────────────
  #initEvents() {
    this.#addBtn.addEventListener('click', () => this.#addTipo());
    this.#input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.#addTipo(); }
    });
  }

  async #addTipo() {
    const nome = this.#input.value.trim();
    if (!nome) {
      this.#showInlineError('Informe o nome do tipo.');
      this.#input.focus();
      return;
    }

    this.#addBtn.disabled = true;
    this.hideError();

    try {
      await TipoDocumentoApiService.add({ nome });
      this.#input.value = '';
      await this.#renderList();
      this.#input.focus();
    } catch (err) {
      this.#showInlineError(err.message || 'Erro ao adicionar tipo.');
    } finally {
      this.#addBtn.disabled = false;
    }
  }

  // ─── Helpers de erro ─────────────────────────────────────────────────────
  #showInlineError(msg) {
    this.#errorEl.textContent = msg;
    this.#errorEl.classList.add('visible');
    this.#errorEl.style.display = 'block';
  }
}

export { TipoDocumentoModal };

