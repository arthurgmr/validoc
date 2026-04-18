import { getStatus } from '../utils/status.js';
import { appState }  from '../state/AppState.js';

class Stats {
  #total;
  #expiring;
  #expired;

  constructor() {
    this.#total    = document.getElementById('stat-total');
    this.#expiring = document.getElementById('stat-expiring');
    this.#expired  = document.getElementById('stat-expired');
  }

  init() {
    appState.subscribe('documents', (docs) => this.#update(docs));
  }

  #update(docs) {
    let expiring = 0, expired = 0;
    docs.forEach((doc) => {
      const s = getStatus(doc.data_validade);
      if (s.type === 'expired')                                        expired++;
      else if (s.type === 'expiring' || s.type === 'expiring-today') expiring++;
    });
    this.#total.textContent    = docs.length;
    this.#expiring.textContent = expiring;
    this.#expired.textContent  = expired;
  }
}

export const stats = new Stats();
