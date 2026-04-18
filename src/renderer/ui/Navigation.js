import { appState } from '../state/AppState.js';

class Navigation {
  #navDocumentos;
  #navEmpresas;
  #btnAdd;
  #screenDocumentos;
  #screenEmpresas;
  #onSwitchCallbacks = new Map();

  constructor() {
    this.#navDocumentos    = document.getElementById('nav-documentos');
    this.#navEmpresas      = document.getElementById('nav-empresas');
    this.#btnAdd           = document.getElementById('btn-add');
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
    this.#btnAdd.textContent = isDocumentos ? '+ Novo Documento' : '+ Nova Empresa';
  }
}

export const navigation = new Navigation();
