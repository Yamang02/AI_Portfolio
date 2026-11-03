import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { act, createElement, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createServer } from 'vite';
import { createDom } from './helpers/dom.mjs';

let environment;
let server;
let useInView;

before(async () => {
  environment = createDom();
  server = await createServer({ logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  ({ useInView } = await server.ssrLoadModule('/src/hooks/useInView.ts'));
});
after(async () => { await server?.close(); environment?.close(); });

function Probe({ options }) {
  const ref = useRef(null);
  const isVisible = useInView(ref, options);
  return createElement('div', { ref, 'data-visible': String(isVisible) });
}

test('visibility follows the requested ratio on initial observation and both crossings', async () => {
  const root = createRoot(document.getElementById('root'));
  try {
    await act(async () => root.render(createElement(Probe, { options: { threshold: 0.5 } })));
    const observer = environment.intersections.at(-1);
    const visible = () => document.querySelector('[data-visible]').dataset.visible;
    await act(async () => observer.emit({ isIntersecting: true, intersectionRatio: 0.01 }));
    assert.equal(visible(), 'false');
    await act(async () => observer.emit({ isIntersecting: true, intersectionRatio: 0.5 }));
    assert.equal(visible(), 'true');
    await act(async () => observer.emit({ isIntersecting: true, intersectionRatio: 0.49 }));
    assert.equal(visible(), 'false');
  } finally {
    await act(async () => root.unmount());
  }
});

test('once disconnects only after reaching the threshold', async () => {
  const root = createRoot(document.getElementById('root'));
  try {
    await act(async () => root.render(createElement(Probe, { options: { threshold: 0.5, once: true } })));
    const observer = environment.intersections.at(-1);
    await act(async () => observer.emit({ isIntersecting: true, intersectionRatio: 0.1 }));
    assert.equal(observer.disconnected, false);
    await act(async () => observer.emit({ isIntersecting: true, intersectionRatio: 0.5 }));
    assert.equal(observer.disconnected, true);
    assert.equal(document.querySelector('[data-visible]').dataset.visible, 'true');
  } finally {
    await act(async () => root.unmount());
  }
});

test('threshold zero still requires an intersection and cleans up on unmount', async () => {
  const root = createRoot(document.getElementById('root'));
  let observer;
  try {
    await act(async () => root.render(createElement(Probe, { options: { threshold: 0 } })));
    observer = environment.intersections.at(-1);
    await act(async () => observer.emit({ isIntersecting: false, intersectionRatio: 0 }));
    assert.equal(document.querySelector('[data-visible]').dataset.visible, 'false');
    await act(async () => observer.emit({ isIntersecting: true, intersectionRatio: 0 }));
    assert.equal(document.querySelector('[data-visible]').dataset.visible, 'true');
  } finally {
    await act(async () => root.unmount());
  }
  assert.equal(observer.disconnected, true);
});
