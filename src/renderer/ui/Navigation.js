import { appState } from '../state/AppState.js';

class Navigation {
  #navDocumentos;
  #navEmpresas;
  #btnAdd;
  #docsMenuWrapper;
  #screenDocumentos;
  #screenEmpresas;
  #onSwitchCallbacks = new Map();

  constructor() {
    this.#navDocumentos    = document.getElementById('nav-documentos');
    this.#navEmpresas      = document.getElementById('nav-empresas');
    this.#btnAdd           = document.getElementById('btn-add');
    this.#docsMenuWrapper  = document.getElementById('docs-menu-wrapper');
    this.#screenDocumentos = document.getElementById('screen-documentos');
    this.#screenEmpresas   = document.getElementById('screen-empresas');
  }

  init() {
    this.#navDocumentos.addEventListener('click', () => this.#switch('documentos'));
    this.#navEmpresas.addEventListener('click',   () => this.#switch('empresas'));
    this.#btnAdd.addEventListener('click', () => {
      const cb = this.#onSwitchCallbacks.get(appState.get('activeScreen'));
      cb?.();
    });
  }

  onAddClick(screen, fn) {
    this.#onSwitchCallbacks.set(screen, fn);
  }

  #switch(name) {
    appState.set('activeScreen', name);
    const isDocumentos = name === 'documentos';
    this.#screenDocumentos.style.display = isDocumentos ? '' : 'none';
    this.#screenEmpresas.style.display   = isDocumentos ? 'none' : '';
    this.#navDocumentos.classList.toggle('btn--nav-active', isDocumentos);
    this.#navEmpresas.classList.toggle('btn--nav-active', !isDocumentos);

    // Header action: menu sanduíche para documentos, btn normal para empresas
    this.#docsMenuWrapper.style.display = isDocumentos ? '' : 'none';
    this.#btnAdd.style.display          = isDocumentos ? 'none' : '';
  }
}

export const navigation = new Navigation();
