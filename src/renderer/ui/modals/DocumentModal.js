import { BaseModal }               from './BaseModal.js';
import { CompanyApiService }       from '../../services/CompanyApiService.js';
import { DocumentApiService }      from '../../services/DocumentApiService.js';
import { TipoDocumentoApiService } from '../../services/TipoDocumentoApiService.js';
import { toast }                   from '../Toast.js';

class DocumentModal extends BaseModal {
  #form;
  #submitBtn;
  #filePathDisplay;
  #empresaSelect;
  #tipoSelect;
  #nomeGroup;
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
    this.#tipoSelect      = document.getElementById('field-tipo');
    this.#nomeGroup       = document.getElementById('field-nome-group');
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
    this.#nomeGroup.style.display = 'none';

    await Promise.all([this.#populateEmpresas(), this.#populateTipos()]);
    setTimeout(() => this.#tipoSelect.focus(), 60);
  }

  // ─── Abrir em modo edição ────────────────────────────────────────────────
  async openForEdit(id) {
    this.#editingId    = id;
    this.#selectedFile = null;

    this.#modalTitle.textContent      = 'Editar Documento';
    this.#submitBtn.textContent       = 'Salvar alterações';
    this.#filePathDisplay.placeholder = 'Clique em "Selecionar" para substituir o arquivo';

    document.getElementById('file-hint').style.display = 'block';
    this.#nomeGroup.style.display = 'none';

    this.hideError();
    this.#form.reset();
    document.getElementById('add-backdrop').classList.add('open');

    try {
      const [doc, companies] = await Promise.all([
        DocumentApiService.getById(id),
        CompanyApiService.getAll(),
      ]);

      await Promise.all([
        this.#populateEmpresas(companies),
        this.#populateTipos(doc.tipo),
      ]);

      document.getElementById('field-nome').value = doc.nome;
      document.getElementById('field-validade').value = doc.data_validade;
      this.#empresaSelect.value                       = String(doc.empresa_id);

      this.#filePathDisplay.value = doc.caminho_arquivo.replace(/^\d+_/, '');
      this.#filePathDisplay.dataset.currentFile = doc.caminho_arquivo;

      setTimeout(() => this.#tipoSelect.focus(), 60);
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

  // ─── Popula o <select> de tipos ──────────────────────────────────────────
  // currentTipo: valor que deve ficar selecionado (edição). Se não estiver
  // na lista da tabela (legado), é adicionado como opção avulsa.
  async #populateTipos(currentTipo = null) {
    this.#tipoSelect.innerHTML = '<option value="" disabled selected>Selecione um tipo...</option>';
    try {
      const tipos = await TipoDocumentoApiService.getAll();
      let found = false;
      tipos.forEach((t) => {
        const opt       = document.createElement('option');
        opt.value       = t.nome;
        opt.textContent = t.nome;
        this.#tipoSelect.appendChild(opt);
        if (currentTipo && t.nome === currentTipo) found = true;
      });
      if (currentTipo && !found) {
        // tipo legado: adicionar como opção avulsa
        const opt       = document.createElement('option');
        opt.value       = currentTipo;
        opt.textContent = `${currentTipo} (legado)`;
        this.#tipoSelect.appendChild(opt);
      }
      if (currentTipo) this.#tipoSelect.value = currentTipo;
    } catch { /* select fica com apenas o placeholder */ }
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

      const tipo = data.get('tipo');
      if (!tipo) { this.showError('Selecione um tipo de documento.'); return; }

      // nome é derivado do tipo (não exibido ao usuário)
      const nome = tipo;

      this.#submitBtn.disabled  = true;
      this.#submitBtn.innerHTML = '<span class="spinner"></span> Salvando...';

      try {
        if (isEditing) {
          await DocumentApiService.update(this.#editingId, {
            nome,
            empresa_id,
            tipo,
            data_validade: data.get('data_validade'),
            sourcePath:    this.#selectedFile ?? null,
          });
          toast.show('Documento atualizado com sucesso!', 'success');
        } else {
          await DocumentApiService.add({
            nome,
            empresa_id,
            tipo,
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
