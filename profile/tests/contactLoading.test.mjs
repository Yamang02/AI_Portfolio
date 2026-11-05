import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { act, createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createServer } from 'vite';
import { createDom } from './helpers/dom.mjs';
import { prerender } from './helpers/prerender.mjs';

let environment;
let server;
let App;
let markup;

before(async () => {
  markup = prerender('/src/App.tsx', 'App');
  environment = createDom({ reducedMotion: true });
  server = await createServer({ logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  ({ App } = await server.ssrLoadModule('/src/App.tsx'));
});
after(async () => { await server?.close(); environment?.close(); });

test('the deferred contact form opens, closes and reopens after a prerendered page hydrates', async () => {
  const container = document.getElementById('root');
  container.innerHTML = markup;
  container.querySelectorAll('video').forEach(video => { video.muted = video.defaultMuted; });
  const errors = [];
  let root;
  try {
    await act(async () => {
      root = hydrateRoot(container, createElement(App, { locale: 'ko' }), { onRecoverableError: error => errors.push(error) });
    });
    assert.deepEqual(errors, []);
    assert.equal(container.querySelector('[role="dialog"]'), null);
    const openButton = container.querySelector('nav button');
    await act(async () => openButton.click());
    const deadline = Date.now() + 2000;
    while (!container.querySelector('[role="dialog"]') && Date.now() < deadline) {
      await act(async () => new Promise(resolve => setTimeout(resolve, 20)));
    }
    const dialog = container.querySelector('[role="dialog"]');
    assert.ok(dialog);
    assert.equal(dialog.getAttribute('aria-modal'), 'true');
    assert.equal(document.body.style.overflow, 'hidden');
    container.querySelector('#contact-name').value = '방문자';
    await act(async () => document.dispatchEvent(new environment.window.KeyboardEvent('keydown', { key: 'Escape' })));
    assert.equal(dialog.getAttribute('aria-modal'), 'false');
    assert.equal(document.body.style.overflow, '');
    await act(async () => openButton.click());
    assert.equal(dialog.getAttribute('aria-modal'), 'true');
    assert.equal(container.querySelector('#contact-name').value, '');
  } finally {
    await act(async () => root?.unmount());
  }
});

test('a rejected contact chunk keeps the page usable and explains how to retry', async t => {
  const failureServer = await createServer({
    logLevel: 'silent',
    plugins: [{
      name: 'reject-contact-chunk',
      enforce: 'pre',
      load(id) {
        if (id.replaceAll('\\', '/').endsWith('/src/components/ContactModal.tsx')) {
          return 'throw new Error("Contact chunk unavailable");';
        }
      },
    }],
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    appType: 'custom',
  });
  const alerts = [];
  t.mock.method(environment.window, 'alert', message => alerts.push(message));
  t.mock.method(console, 'error', () => {});
  const container = document.getElementById('root');
  container.innerHTML = markup;
  container.querySelectorAll('video').forEach(video => { video.muted = video.defaultMuted; });
  let root;
  try {
    const { App: FailureApp } = await failureServer.ssrLoadModule('/src/App.tsx');
    await act(async () => { root = hydrateRoot(container, createElement(FailureApp, { locale: 'ko' })); });
    const openButton = container.querySelector('nav button');
    for (const attempt of [1, 2]) {
      await act(async () => openButton.click());
      const deadline = Date.now() + 2000;
      while (alerts.length < attempt && Date.now() < deadline) {
        await act(async () => new Promise(resolve => setTimeout(resolve, 20)));
      }
      assert.equal(alerts.length, attempt);
      assert.match(alerts.at(-1), /새로고침/);
      assert.ok(container.querySelector('main h1'));
      assert.equal(container.querySelector('[role="dialog"]'), null);
      assert.equal(document.body.style.overflow, '');
    }
  } finally {
    await act(async () => root?.unmount());
    await failureServer.close();
  }
});
