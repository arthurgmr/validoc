# ValiDoc — Contexto do Projeto

Aplicação desktop (Electron) para **gestão de documentos com data de validade** vinculados a empresas. Sem framework de UI — vanilla JS com classes ES6 e módulos nativos.

## Arquitetura

Electron clássico com separação estrita main/renderer:

```
main.js                  # Entry point Electron
src/main/
  preload.js             # contextBridge → expõe window.api ao renderer
  tray.js                # Ícone na bandeja do sistema
  window.js              # Criação da BrowserWindow
  cron.js                # Scheduler para notificações de vencimento
  database/
    db.js                # Instância better-sqlite3
    schema.js            # CREATE TABLE + migrations idempotentes
    documentStatements.js
    companyStatements.js
    tipoDocumentoStatements.js
  ipc/
    documentHandlers.js        # ipcMain.handle('documents:*')
    companyHandlers.js         # ipcMain.handle('companies:*')
    dialogHandlers.js          # ipcMain.handle('dialog:*')
    tipoDocumentoHandlers.js   # ipcMain.handle('tipos:*')
  services/
    DocumentService.js
    CompanyService.js
    TipoDocumentoService.js
    FileService.js       # Cópia/deleção/abertura de arquivos em userData/arquivos/
    NotificationService.js

renderer/
  index.html             # HTML único com todos os modais já no DOM
  styles.css             # Design tokens + todas as classes
  renderer.js            # Entry point do renderer (ES modules)
src/renderer/
  state/
    AppState.js          # Estado global simples com subscribe/set/get
  services/
    DocumentApiService.js
    CompanyApiService.js
    TipoDocumentoApiService.js
  ui/
    Navigation.js        # Troca de telas (documentos / empresas)
    Stats.js             # Cards de totais
    Toast.js             # Notificações temporárias
    modals/
      BaseModal.js       # Classe base: open/close/showError/hideError
      DocumentModal.js   # Herda BaseModal
      CompanyModal.js    # Herda BaseModal
      DeleteModal.js     # Herda BaseModal
      TipoDocumentoModal.js  # Herda BaseModal — CRUD inline de tipos
    tables/
      DocumentTable.js   # Renderiza tabela + filtragem via AppState
      CompanyTable.js
  utils/
    format.js            # formatDate, escapeHtml
    masks.js             # Máscaras de input (CNPJ, telefone)
    status.js            # getStatus(data_validade) → { type, label }
    icons.js             # Ícones Phosphor inline como constantes Icons.*
```

## Fluxo IPC (padrão obrigatório)

Toda comunicação renderer → main segue este caminho **sem exceções**:

```
UI (renderer)
  └─> XxxApiService  (src/renderer/services/)   — chama window.api.método()
        └─> preload.js                           — ipcRenderer.invoke('canal:ação')
              └─> XxxHandlers.js                 — ipcMain.handle('canal:ação')
                    └─> XxxService.js            — lógica + DB
                          └─> db statements      — SQL via better-sqlite3
```

Para adicionar uma nova operação:
1. Adicionar statement SQL em `*Statements.js`
2. Adicionar função em `*Service.js` e exportar
3. Registrar `ipcMain.handle` em `*Handlers.js`
4. Expor em `preload.js` dentro de `contextBridge.exposeInMainWorld('api', { ... })`
5. Adicionar método no `*ApiService.js` do renderer

## Banco de Dados

SQLite via **better-sqlite3** (síncrono). Tabelas:

```sql
empresa    (id, nome, cnpj, telefone, email, data_criacao)
documentos (id, nome, identificador, empresa_id, tipo, data_validade, caminho_arquivo, data_criacao)
tipo_documento (id, nome UNIQUE, data_criacao)
```

`documentos.tipo` é TEXT livre (compatibilidade com bases antigas). `tipos_documento` é a lista gerenciada pelo usuário — sem FK, para não quebrar registros legados.

Arquivos físicos ficam em `app.getPath('userData')/arquivos/` gerenciados por `FileService.js`.  
`schema.js` usa `CREATE TABLE IF NOT EXISTS` + blocos `try/catch` para migrations idempotentes.

## Ícones

Todos os ícones são SVG inline via constantes em `src/renderer/utils/icons.js`. Usar sempre `Icons.<nome>` — nunca SVG literal no HTML ou em outros arquivos JS.

- Ícones 16×16: gerados pelo helper `_svg(path)` (viewBox 0 0 256 256)
- Ícones 20×20 (botões de ação no header): definidos diretamente com `width/height="20"`
- Exemplos disponíveis: `Icons.eye`, `Icons.download`, `Icons.pencil`, `Icons.trash`, `Icons.list`, `Icons.plus`

## Padrões de UI

- **Sem framework** — DOM direto, classes ES6
- Modais vivem **no HTML** (`index.html`) e são mostrados/ocultados via classe `.open` no backdrop
- `BaseModal` gerencia open/close/error; subclasses sobrescrevem `_onOpen()` e `_onClose()`
- Estado reativo via `AppState.subscribe('chave', callback)` — tabelas e stats ouvem o estado
- Tabelas recebem callbacks (`onDelete`, `onEdit`, `onOpen`, `onSave`) instanciadas em `renderer.js`
- Botões de ação do header usam `.btn--menu` (padding: 9px 12px, line-height: 0) com ícone 20×20 injetado via `innerHTML = Icons.*`
- Dropdowns: `.menu-wrapper` (position: relative) + `.dropdown-menu` (absolute, hidden attr) + `.dropdown-item`
- Tabelas usam classes modificadoras para alinhamento: `.table--docs` (cols 3+ centralizadas), `.table--empresas` (cols 2+ centralizadas)

## Design Tokens (CSS)

Arquivo: `renderer/styles.css`. Usar sempre as variáveis CSS, nunca valores literais de cor/sombra:

| Variável | Uso |
|---|---|
| `--primary` / `--primary-hover` | Botões e foco |
| `--danger` / `--danger-light` | Ações destrutivas |
| `--warning` / `--warning-light` | Documentos próximos do vencimento |
| `--success` / `--success-light` | Status válido |
| `--text` / `--text-secondary` / `--text-muted` | Hierarquia de texto |
| `--border` / `--border-focus` | Bordas e estados de foco |
| `--surface` / `--surface-2` / `--bg` | Fundos |
| `--radius` / `--radius-lg` / `--radius-xl` | Border radius |
| `--shadow-sm` / `--shadow` / `--shadow-lg` | Elevações |
| `--transition` | `160ms ease` para todas as animações |

Classes utilitárias principais: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--ghost-danger`, `.btn--icon`, `.form-control`, `.form-group`, `.modal`, `.modal-backdrop`, `.table`, `.status-badge`, `.type-badge`, `.action-group`.

## Convenções

- Main process: CommonJS (`require` / `module.exports`)
- Renderer: ES Modules (`import` / `export`)
- Propriedades privadas de classe com `#` (não `_`)
- `escapeHtml()` obrigatório em **todo** conteúdo dinâmico inserido no DOM via `innerHTML`
- Validação de paths em `FileService._safeDestPath()` — nunca bypass de path traversal
- Novos campos de formulário sempre com `maxlength` e validação no Service (main), não só no HTML
- `app.requestSingleInstanceLock()` obrigatório — impede segunda instância e duplo tray
- `app.setAppUserModelId('com.validoc.desktop')` no Windows — obrigatório para notificações no Action Center
- Ícone do tray: `icon.ico` no Windows, `icon.png` nos demais (arquivos em `assets/`)
