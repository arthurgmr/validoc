import { escapeHtml } from '../utils/format.js';

const ICONS = { success: '✓', error: '✕', info: 'ℹ' };

class Toast {
  #container;

  constructor(containerId = 'toast-container') {
    this.#container = document.getElementById(containerId);
  }

  show(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `
      <span class="toast-icon">${ICONS[type] ?? ICONS.info}</span>
      <span class="toast-msg">${escapeHtml(message)}</span>
    `;
    this.#container.appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 3600);
  }
}

export const toast = new Toast();
