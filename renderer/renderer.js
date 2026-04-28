import { appState }                from '../src/renderer/state/AppState.js';
import { DocumentApiService }      from '../src/renderer/services/DocumentApiService.js';
import { CompanyApiService }       from '../src/renderer/services/CompanyApiService.js';
import { toast }                   from '../src/renderer/ui/Toast.js';
import { navigation }              from '../src/renderer/ui/Navigation.js';
import { stats }                   from '../src/renderer/ui/Stats.js';
import { DocumentModal }           from '../src/renderer/ui/modals/DocumentModal.js';
import { CompanyModal }            from '../src/renderer/ui/modals/CompanyModal.js';
import { DeleteModal }             from '../src/renderer/ui/modals/DeleteModal.js';
import { TipoDocumentoModal }      from '../src/renderer/ui/modals/TipoDocumentoModal.js';
import { DocumentTable }           from '../src/renderer/ui/tables/DocumentTable.js';
import { CompanyTable }            from '../src/renderer/ui/tables/CompanyTable.js';
import { Icons }                   from '../src/renderer/utils/icons.js';

async function loadDocuments() {
  try {
    appState.set('documents', await DocumentApiService.getAll());
  } catch (err) {
    toast.show('Erro ao carregar documentos: ' + err.message, 'error');
  }
}

async function loadCompanies() {
  try {
    appState.set('companies', await CompanyApiService.getAll());
  } catch (err) {
    toast.show('Erro ao carregar empresas: ' + err.message, 'error');
  }
}

// Modais
const deleteModal         = new DeleteModal({ onDocDeleted: loadDocuments, onCompanyDeleted: loadCompanies });
const documentModal       = new DocumentModal(loadDocuments);
const companyModal        = new CompanyModal(loadCompanies);
const tipoDocumentoModal  = new TipoDocumentoModal();

// Tabelas
const documentTable = new DocumentTable({
  onDelete: (id, nome) => deleteModal.openFor(id, nome, 'document'),
  onOpen:   async (id) => {
    try { await DocumentApiService.open(id); }
    catch (err) { toast.show('Erro ao abrir arquivo: ' + err.message, 'error'); }
  },
  onSave:   async (id) => {
    try {
      const result = await DocumentApiService.saveCopy(id);
      if (result && !result.canceled) toast.show('Cópia salva com sucesso!', 'success');
    } catch (err) { toast.show('Erro ao salvar cópia: ' + err.message, 'error'); }
  },
  onEdit: (id) => documentModal.openForEdit(id),
});

const companyTable = new CompanyTable({
  onDelete: (id, nome) => deleteModal.openFor(id, nome, 'empresa'),
  onEdit:   (id)       => companyModal.openForEdit(id),
});

// Navegação
navigation.onAddClick('empresas', () => companyModal.open());
navigation.init();

// Menu sanduiche — documentos
const docsDropdown = document.getElementById('docs-dropdown');
const btnDocsMenu  = document.getElementById('btn-docs-menu');
btnDocsMenu.innerHTML = Icons.list;

document.getElementById('btn-add').innerHTML = Icons.plus;

btnDocsMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = !docsDropdown.hidden;
  docsDropdown.hidden = isOpen;
});

document.getElementById('dropdown-tipos').addEventListener('click', () => {
  docsDropdown.hidden = true;
  tipoDocumentoModal.open();
});

document.getElementById('dropdown-novo-doc').addEventListener('click', () => {
  docsDropdown.hidden = true;
  documentModal.open();
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#docs-menu-wrapper')) {
    docsDropdown.hidden = true;
  }
});

// Botões de empty state
document.getElementById('btn-add-empty').addEventListener('click',   () => documentModal.open());
document.getElementById('btn-add-empresa').addEventListener('click', () => companyModal.open());

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    documentModal.close();
    companyModal.close();
    deleteModal.close();
    tipoDocumentoModal.close();
    docsDropdown.hidden = true;
  }
});

// Stats e tabelas reagem ao AppState via subscribe (feito nos .init())
stats.init();
documentTable.init();
companyTable.init();

// Auto-update
window.api.onUpdateStatus((data) => {
  if (data.type === 'available')  toast.show(`Nova versão ${data.version} disponível. Baixando...`, 'info');
  if (data.type === 'downloaded') toast.show(`Versão ${data.version} pronta! Será instalada ao fechar o app.`, 'success');
  if (data.type === 'error')      toast.show('Erro ao verificar atualizações.', 'error');
});

// Carga inicial
await Promise.all([loadDocuments(), loadCompanies()]);


