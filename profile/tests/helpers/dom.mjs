import { JSDOM } from 'jsdom';

export function createDom({ html = '<div id="root"></div>', url = 'http://localhost/', reducedMotion = false } = {}) {
  const dom = new JSDOM(html, { url, pretendToBeVisual: true });
  const { window } = dom;
  const originals = new Map();
  const install = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };
  const mediaListeners = new Set();
  const query = {
    matches: reducedMotion,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_, listener) => mediaListeners.add(listener),
    removeEventListener: (_, listener) => mediaListeners.delete(listener),
  };
  window.matchMedia = () => query;
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  const intersections = [];
  const resizes = [];
  class IntersectionObserver {
    disconnected = false;
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      intersections.push(this);
    }
    observe() {}
    disconnect() { this.disconnected = true; }
    emit(entry) { this.callback([entry]); }
  }
  class ResizeObserver {
    constructor(callback) { this.callback = callback; resizes.push(this); }
    observe() {}
    disconnect() {}
  }
  for (const key of ['window', 'document', 'HTMLElement', 'Element', 'SVGElement', 'Node', 'FormData']) {
    install(key, key === 'window' ? window : window[key]);
  }
  install('getComputedStyle', window.getComputedStyle.bind(window));
  install('requestAnimationFrame', window.requestAnimationFrame.bind(window));
  install('cancelAnimationFrame', window.cancelAnimationFrame.bind(window));
  install('IntersectionObserver', IntersectionObserver);
  install('ResizeObserver', ResizeObserver);
  install('IS_REACT_ACT_ENVIRONMENT', true);
  return {
    window,
    intersections,
    resizes,
    setReducedMotion(matches) {
      query.matches = matches;
      for (const listener of mediaListeners) listener({ matches });
    },
    close() {
      window.close();
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}
