import { escapeHtml } from '../../utils/format.js';
import { appState }   from '../../state/AppState.js';
import { Icons }      from '../../utils/icons.js';

class CompanyTable {
  #tbody;
  #emptyState;
  #searchInput;
  #searchTimer = null;
  #onDelete;
  #onEdit;

  constructor({ onDelete, onEdit }) {
    this.#tbody       = document.getElementById('empresas-table-body');
    this.#emptyState  = document.getElementById('empty-state-empresas');
    this.#searchInput = document.getElementById('search-empresas-input');
    this.#onDelete    = onDelete;
    this.#onEdit      = onEdit;
  }

  init() {
    appState.subscribe('companies', () => this.#applyFilter());

    this.#searchInput.addEventListener('input', () => {
      clearTimeout(this.#searchTimer);
      this.#searchTimer = setTimeout(() => this.#applyFilter(), 120);
    });

    this.#tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id, nome } = btn.dataset;
      if (action === 'delete-empresa') this.#onDelete(Number(id), nome);
      if (action === 'edit-empresa')   this.#onEdit(Number(id));
    });
  }

  #applyFilter() {
    const companies = appState.get('companies');
    const q         = this.#searchInput.value.toLowerCase().trim();
    const filtered  = q
      ? companies.filter((c) =>
          c.nome.toLowerCase().includes(q) ||
          c.cnpj.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        )
      : companies;
    this.#render(filtered);
  }

  #render(companies) {
    if (companies.length === 0) {
      this.#tbody.innerHTML          = '';
      this.#emptyState.style.display = 'flex';
      return;
    }
    this.#emptyState.style.display = 'none';
    this.#tbody.innerHTML = companies.map((c) => `
      <tr>
        <td class="col-nome"><span title="${escapeHtml(c.nome)}">${escapeHtml(c.nome)}</span></td>
        <td class="col-id">${escapeHtml(c.cnpj)}</td>
        <td>${escapeHtml(c.telefone)}</td>
        <td>${escapeHtml(c.email)}</td>
        <td>
          <div class="action-group">
            <button class="btn btn--ghost btn--icon" data-action="edit-empresa"
              data-id="${c.id}" title="Editar empresa">${Icons.pencil}</button>
            <button class="btn btn--ghost-danger btn--icon" data-action="delete-empresa"
              data-id="${c.id}" data-nome="${escapeHtml(c.nome)}" title="Remover empresa">${Icons.trash}</button>
          </div>
        </td>
      </tr>
    `).join('');
  }
}

export { CompanyTable };
