class AppState {
  #state = {
    documents: [],
    companies: [],
    activeScreen: 'documentos',
  };

  #listeners = new Map();

  get(key) {
    return this.#state[key];
  }

  set(key, value) {
    this.#state[key] = value;
    this.#notify(key, value);
  }

  subscribe(key, fn) {
    if (!this.#listeners.has(key)) this.#listeners.set(key, new Set());
    this.#listeners.get(key).add(fn);
    return () => this.#listeners.get(key).delete(fn); // retorna unsubscribe
  }

  #notify(key, value) {
    this.#listeners.get(key)?.forEach((fn) => fn(value));
  }
}

export const appState = new AppState();
