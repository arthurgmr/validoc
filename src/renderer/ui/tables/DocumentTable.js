import { getStatus }           from '../../utils/status.js';
import { escapeHtml, formatDate } from '../../utils/format.js';
import { appState }            from '../../state/AppState.js';

class DocumentTable {
  #tbody;
  #emptyState;
  #searchInput;
  #searchTimer = null;
  #onDelete;
  #onOpen;
  #onSave;
  #onEdit;

  constructor({ onDelete, onOpen, onSave, onEdit }) {
    this.#tbody       = document.getElementById('table-body');
    this.#emptyState  = document.getElementById('empty-state');
    this.#searchInput = document.getElementById('search-input');
    this.#onDelete    = onDelete;
    this.#onOpen      = onOpen;
    this.#onSave      = onSave;
    this.#onEdit      = onEdit;
  }

  init() {
    appState.subscribe('documents', () => this.#applyFilter());

    this.#searchInput.addEventListener('input', () => {
      clearTimeout(this.#searchTimer);
      this.#searchTimer = setTimeout(() => this.#applyFilter(), 120);
    });

    this.#tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id, nome } = btn.dataset;
      if (action === 'open')   await this.#onOpen(Number(id));
      if (action === 'save')   await this.#onSave(Number(id));
      if (action === 'delete') this.#onDelete(Number(id), nome);
      if (action === 'edit')   this.#onEdit(Number(id));
    });
  }

  #applyFilter() {
    const docs = appState.get('documents');
    const q    = this.#searchInput.value.toLowerCase().trim();
    const filtered = q
      ? docs.filter((d) =>
          d.nome.toLowerCase().includes(q) ||
          (d.empresa_nome  && d.empresa_nome.toLowerCase().includes(q)) ||
          (d.identificador && d.identificador.toLowerCase().includes(q))
        )
      : docs;
    this.#render(filtered);
  }

  #render(docs) {
    if (docs.length === 0) {
      this.#tbody.innerHTML          = '';
      this.#emptyState.style.display = 'flex';
      return;
    }
    this.#emptyState.style.display = 'none';
    this.#tbody.innerHTML = docs.map((doc) => {
      const status      = getStatus(doc.data_validade);
      const empresaCell = doc.empresa_nome
        ? `<span title="${escapeHtml(doc.empresa_nome)}">${escapeHtml(doc.empresa_nome)}</span>`
        : `<span class="col-id" title="${escapeHtml(doc.identificador ?? '')}">${escapeHtml(doc.identificador ?? '—')}</span>`;

      return `
        <tr class="row--${status.type}">
          <td class="col-nome"><span title="${escapeHtml(doc.nome)}">${escapeHtml(doc.nome)}</span></td>
          <td class="col-id">${empresaCell}</td>
          <td><span class="type-badge">${escapeHtml(doc.tipo)}</span></td>
          <td>${formatDate(doc.data_validade)}</td>
          <td><span class="status-badge status-badge--${status.type}">${status.label}</span></td>
          <td>
            <div class="action-group">
              <button class="btn btn--ghost btn--icon" data-action="open"   data-id="${doc.id}" title="Abrir o arquivo no programa padrão">↗</button>
              <button class="btn btn--ghost btn--icon" data-action="save"   data-id="${doc.id}" title="Salvar uma cópia em outro local">⬇</button>
              <button class="btn btn--ghost btn--icon" data-action="edit"   data-id="${doc.id}" title="Editar documento">✏️</button>
              <button class="btn btn--ghost-danger btn--icon" data-action="delete" data-id="${doc.id}" data-nome="${escapeHtml(doc.nome)}" title="Remover documento e arquivo">🗑</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
}

export { DocumentTable };
