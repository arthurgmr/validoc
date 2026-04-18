export class BaseModal {
  #backdrop;
  #closeButton;
  #errorEl;

  constructor({ backdropId, closeButtonId, errorId = null }) {
    this.#backdrop    = document.getElementById(backdropId);
    this.#closeButton = document.getElementById(closeButtonId);
    this.#errorEl     = errorId ? document.getElementById(errorId) : null;
  }

  _initCloseTriggers(cancelButtonId) {
    this.#closeButton.addEventListener('click', () => this.close());
    if (cancelButtonId !== this.#closeButton.id) {
      document.getElementById(cancelButtonId)?.addEventListener('click', () => this.close());
    }
    this.#backdrop.addEventListener('click', (e) => {
      if (e.target === this.#backdrop) this.close();
    });
  }

  open() {
    this.hideError();
    this._onOpen();
    this.#backdrop.classList.add('open');
  }

  close() {
    this.#backdrop.classList.remove('open');
    this._onClose();
  }

  showError(msg) {
    if (!this.#errorEl) return;
    this.#errorEl.textContent = msg;
    this.#errorEl.classList.add('visible');
    this.#errorEl.style.display = 'block';
  }

  hideError() {
    if (!this.#errorEl) return;
    this.#errorEl.textContent = '';
    this.#errorEl.classList.remove('visible');
    this.#errorEl.style.display = 'none';
  }

  // Hooks opcionais para subclasses
  _onOpen()  {}
  _onClose() {}
}
