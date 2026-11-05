import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { act, createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createServer } from 'vite';
import { createDom } from './helpers/dom.mjs';
import { prerender } from './helpers/prerender.mjs';

let environment;
let server;
let ConnectSection;
let content;
let markup;

before(async () => {
  markup = prerender('/src/components/ConnectSection.tsx', 'ConnectSection', 'site.connect');
  assert.match(markup, /<video/);
  environment = createDom({ reducedMotion: true });
  server = await createServer({ logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  ({ ConnectSection } = await server.ssrLoadModule('/src/components/ConnectSection.tsx'));
  const { getProfileContent } = await server.ssrLoadModule('/src/content/index.ts');
  content = getProfileContent('ko');
});

after(async () => { await server?.close(); environment?.close(); });

for (const reducedMotion of [true, false]) {
  test(`connect hydrates without mismatch when reduced motion is ${reducedMotion}`, async () => {
    environment.setReducedMotion(reducedMotion);
    const container = document.getElementById('root');
    container.innerHTML = markup;
    container.querySelectorAll('video').forEach(video => { video.muted = video.defaultMuted; });
    const errors = [];
    const warnings = [];
    const originalConsoleError = console.error;
    console.error = (...args) => warnings.push(args);
    let root;
    try {
      await act(async () => {
        root = hydrateRoot(container, createElement(ConnectSection, {
          content: content.site.connect, onOpenContact() {},
        }), { onRecoverableError: error => errors.push(error) });
      });
      assert.deepEqual(errors, []);
      assert.deepEqual(warnings, []);
      assert.equal(container.querySelectorAll('video').length, reducedMotion ? 0 : 1);
      if (reducedMotion) assert.equal(container.querySelector('ul').getAttribute('aria-hidden'), 'false');
    } finally {
      await act(async () => root?.unmount());
      console.error = originalConsoleError;
    }
  });
}

test('connect responds to reduced-motion changes without reloading', async () => {
  environment.setReducedMotion(false);
  const container = document.getElementById('root');
  container.innerHTML = markup;
  container.querySelectorAll('video').forEach(video => { video.muted = video.defaultMuted; });
  let root;
  try {
    await act(async () => {
      root = hydrateRoot(container, createElement(ConnectSection, { content: content.site.connect, onOpenContact() {} }));
    });
    assert.ok(container.querySelector('video'));
    await act(async () => environment.setReducedMotion(true));
    assert.equal(container.querySelector('video'), null);
    assert.equal(container.querySelector('ul').getAttribute('aria-hidden'), 'false');
  } finally {
    await act(async () => root?.unmount());
  }
});
