import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { act, createElement } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createServer } from 'vite';
import { createDom } from './helpers/dom.mjs';
import { prerender } from './helpers/prerender.mjs';

let environment;
let server;
let HistorySection;
let content;
let scrollY;
let markup;
const scrollCalls = [];
const ids = ['y2026', 'y2025', 'y2023', 'y2022', 'y2019'];

before(async () => {
  markup = prerender('/src/components/history/HistorySection.tsx', 'HistorySection', 'history');
  environment = createDom({ html: '<nav></nav><div id="root"></div>' });
  const { window } = environment;
  Object.defineProperties(window, {
    scrollY: { get: () => scrollY },
    innerWidth: { value: 1440 },
    innerHeight: { value: 900 },
  });
  window.scrollTo = options => { scrollCalls.push(options); scrollY = options.top; };
  Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
    get() { return this.classList.contains('history-content') ? 960 : 0; },
  });
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    let height = 2520;
    let top = 1000 - scrollY;
    if (this.classList.contains('history-flow-navigation')) { height = 34; }
    else if (this.tagName === 'NAV') { height = 54; top = 0; }
    else if (this.classList.contains('history-viewport-measure')) { height = 900; }
    else if (this.classList.contains('history-section')) { height = 4200; }
    else if (this.classList.contains('history-flow-step')) {
      top += ids.indexOf(this.dataset.historyStep) * 700;
      height = 650;
    } else if (this.id.startsWith('history-year-')) {
      top += ids.indexOf(this.id.slice('history-year-'.length)) * 405;
      height = 1;
    }
    return { x: 0, y: top, top, bottom: top + height, left: 0, right: 960, width: 960, height };
  };
  server = await createServer({ logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  ({ HistorySection } = await server.ssrLoadModule('/src/components/history/HistorySection.tsx'));
  const { getProfileContent } = await server.ssrLoadModule('/src/content/index.ts');
  content = getProfileContent('ko');
  assert.deepEqual(content.history.steps.map(step => step.id), ids);
});
after(async () => { await server?.close(); environment?.close(); });

for (const { hash, initialScrollY, expectedTop } of [
  { hash: '#history-year-y2023', initialScrollY: 2400, expectedTop: 1810 },
  { hash: '#history-year-y2023', initialScrollY: 0, expectedTop: 1810 },
  { hash: '', initialScrollY: 2400, expectedTop: 1810 },
  { hash: '#connect', initialScrollY: 0, expectedTop: undefined },
]) {
  test(`initial history layout preserves ${hash || 'restored position'} at scrollY ${initialScrollY}`, async () => {
    environment.window.history.replaceState(null, '', '/' + hash);
    scrollY = initialScrollY;
    scrollCalls.length = 0;
    const root = createRoot(document.getElementById('root'));
    try {
      await act(async () => root.render(createElement(HistorySection, { content: content.history, locale: 'ko' })));
      assert.equal(document.querySelector('#history').dataset.layout, 'pinned');
      assert.equal(scrollCalls[0]?.top, expectedTop);
      if (expectedTop === undefined) assert.equal(scrollCalls.length, 0);
    } finally {
      await act(async () => root.unmount());
    }
  });
}

test('hydration preserves a history anchor when reduced motion selects document flow', async () => {
  environment.window.history.replaceState(null, '', '/#history-year-y2023');
  environment.setReducedMotion(true);
  scrollY = 2400;
  scrollCalls.length = 0;
  const container = document.getElementById('root');
  container.innerHTML = markup;
  container.querySelectorAll('video').forEach(video => { video.muted = video.defaultMuted; });
  const errors = [];
  let root;
  try {
    await act(async () => {
      root = hydrateRoot(container, createElement(HistorySection, { content: content.history, locale: 'ko' }), {
        onRecoverableError: error => errors.push(error),
      });
    });
    assert.deepEqual(errors, []);
    assert.equal(container.querySelector('#history').dataset.layout, 'flow');
    assert.equal(scrollCalls.at(-1)?.top, 2330);
  } finally {
    await act(async () => root?.unmount());
    environment.setReducedMotion(false);
  }
});
