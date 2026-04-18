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
  ipc/
    documentHandlers.js  # ipcMain.handle('documents:*')
    companyHandlers.js   # ipcMain.handle('companies:*')
    dialogHandlers.js    # ipcMain.handle('dialog:*')
  services/
    DocumentService.js   # Lógica de negócio de documentos
    CompanyService.js    # Lógica de negócio de empresas
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
    DocumentApiService.js  # Chama window.api.*
    CompanyApiService.js
  ui/
    Navigation.js        # Troca de telas (documentos / empresas)
    Stats.js             # Cards de totais
    Toast.js             # Notificações temporárias
    modals/
      BaseModal.js       # Classe base: open/close/showError/hideError
      DocumentModal.js   # Herda BaseModal
      CompanyModal.js    # Herda BaseModal
      DeleteModal.js     # Herda BaseModal
    tables/
      DocumentTable.js   # Renderiza tabela + filtragem via AppState
      CompanyTable.js
  utils/
    format.js            # formatDate, escapeHtml
    masks.js             # Máscaras de input (CNPJ, telefone)
    status.js            # getStatus(data_validade) → { type, label }
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

SQLite via **better-sqlite3** (síncrono). Duas tabelas principais:

```sql
empresas   (id, nome, cnpj, telefone, email, data_criacao)
documentos (id, nome, identificador, empresa_id, tipo, data_validade, caminho_arquivo, data_criacao)
```

Arquivos físicos ficam em `app.getPath('userData')/arquivos/` gerenciados por `FileService.js`.  
`schema.js` usa `CREATE TABLE IF NOT EXISTS` + blocos `try/catch` para migrations idempotentes.

## Padrões de UI

- **Sem framework** — DOM direto, classes ES6
- Modais vivem **no HTML** (`index.html`) e são mostrados/ocultados via classe `.open` no backdrop
- `BaseModal` gerencia open/close/error; subclasses sobrescrevem `_onOpen()` e `_onClose()`
- Estado reativo via `AppState.subscribe('chave', callback)` — tabelas e stats ouvem o estado
- Tabelas recebem callbacks (`onDelete`, `onEdit`, `onOpen`, `onSave`) instanciadas em `renderer.js`

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
