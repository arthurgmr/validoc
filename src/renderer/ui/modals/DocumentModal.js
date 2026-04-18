import { BaseModal }          from './BaseModal.js';
import { CompanyApiService }  from '../../services/CompanyApiService.js';
import { DocumentApiService } from '../../services/DocumentApiService.js';
import { toast }              from '../Toast.js';

class DocumentModal extends BaseModal {
  #form;
  #submitBtn;
  #filePathDisplay;
  #empresaSelect;
  #modalTitle;
  #selectedFile = null;
  #editingId    = null;
  #onSuccess;

  constructor(onSuccess) {
    super({ backdropId: 'add-backdrop', closeButtonId: 'modal-close', errorId: 'form-error' });
    this.#form            = document.getElementById('add-form');
    this.#submitBtn       = document.getElementById('btn-submit');
    this.#filePathDisplay = document.getElementById('file-path-display');
    this.#empresaSelect   = document.getElementById('field-empresa-id');
    this.#modalTitle      = document.getElementById('modal-add-title');
    this.#onSuccess       = onSuccess;
    this._initCloseTriggers('btn-cancel');
    this.#initEvents();
  }

  // ─── Abrir em modo criação (comportamento original) ──────────────────────
  async _onOpen() {
    this.#editingId = null;
    this.#form.reset();
    this.#selectedFile          = null;
    this.#filePathDisplay.value = '';

    this.#modalTitle.textContent      = 'Novo Documento';
    this.#submitBtn.textContent       = 'Salvar documento';
    this.#filePathDisplay.placeholder = 'Nenhum arquivo selecionado';
    this.#filePathDisplay.removeAttribute('data-current-file');

    document.getElementById('file-hint').style.display = 'none';

    await this.#populateEmpresas();
    setTimeout(() => document.getElementById('field-nome').focus(), 60);
  }

  // ─── Abrir em modo edição ────────────────────────────────────────────────
  async openForEdit(id) {
    this.#editingId    = id;
    this.#selectedFile = null;

    this.#modalTitle.textContent      = 'Editar Documento';
    this.#submitBtn.textContent       = 'Salvar alterações';
    this.#filePathDisplay.placeholder = 'Clique em "Selecionar" para substituir o arquivo';

    document.getElementById('file-hint').style.display = 'block';

    this.hideError();
    this.#form.reset();
    document.getElementById('add-backdrop').classList.add('open');

    try {
      const [doc, companies] = await Promise.all([
        DocumentApiService.getById(id),
        CompanyApiService.getAll(),
      ]);

      await this.#populateEmpresas(companies);

      document.getElementById('field-nome').value     = doc.nome;
      document.getElementById('field-tipo').value     = doc.tipo;
      document.getElementById('field-validade').value = doc.data_validade;
      this.#empresaSelect.value                       = String(doc.empresa_id);

      this.#filePathDisplay.value = doc.caminho_arquivo.replace(/^\d+_/, '');
      this.#filePathDisplay.dataset.currentFile = doc.caminho_arquivo;

      setTimeout(() => document.getElementById('field-nome').focus(), 60);
    } catch (err) {
      this.showError('Erro ao carregar dados do documento: ' + (err.message || 'tente novamente.'));
    }
  }

  // ─── Popula o <select> de empresas ───────────────────────────────────────
  async #populateEmpresas(companies = null) {
    this.#empresaSelect.innerHTML = '<option value="" disabled selected>Selecione uma empresa...</option>';
    try {
      const list = companies ?? await CompanyApiService.getAll();
      list.forEach((c) => {
        const opt       = document.createElement('option');
        opt.value       = c.id;
        opt.textContent = `${c.nome} — ${c.cnpj}`;
        this.#empresaSelect.appendChild(opt);
      });
    } catch { /* select fica vazio */ }
  }

  // ─── Eventos de botões e submit ──────────────────────────────────────────
  #initEvents() {
    document.getElementById('btn-pick-file').addEventListener('click', async () => {
      try {
        const filePath = await CompanyApiService.openFileDialog();
        if (filePath) {
          this.#selectedFile          = filePath;
          this.#filePathDisplay.value = filePath.split(/[\\/]/).pop();
        }
      } catch (err) { toast.show('Erro ao selecionar arquivo: ' + err.message, 'error'); }
    });

    this.#form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.hideError();

      const isEditing = this.#editingId !== null;

      if (!isEditing && !this.#selectedFile) {
        this.showError('Selecione um arquivo para o documento.');
        return;
      }

      const data       = new FormData(this.#form);
      const empresa_id = Number(data.get('empresa_id'));
      if (!empresa_id) { this.showError('Selecione uma empresa.'); return; }

      this.#submitBtn.disabled  = true;
      this.#submitBtn.innerHTML = '<span class="spinner"></span> Salvando...';

      try {
        if (isEditing) {
          await DocumentApiService.update(this.#editingId, {
            nome:          data.get('nome').trim(),
            empresa_id,
            tipo:          data.get('tipo'),
            data_validade: data.get('data_validade'),
            sourcePath:    this.#selectedFile ?? null,
          });
          toast.show('Documento atualizado com sucesso!', 'success');
        } else {
          await DocumentApiService.add({
            nome:          data.get('nome').trim(),
            empresa_id,
            tipo:          data.get('tipo'),
            data_validade: data.get('data_validade'),
            sourcePath:    this.#selectedFile,
          });
          toast.show('Documento cadastrado com sucesso!', 'success');
        }

        this.close();
        await this.#onSuccess();
      } catch (err) {
        this.showError(err.message || 'Erro ao salvar documento. Tente novamente.');
      } finally {
        this.#submitBtn.disabled    = false;
        this.#submitBtn.textContent = isEditing ? 'Salvar alterações' : 'Salvar documento';
      }
    });
  }
}

export { DocumentModal };
