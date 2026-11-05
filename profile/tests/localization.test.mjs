import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { act, createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { createDom } from './helpers/dom.mjs';

let environment;
let server;
let getProfileContent;
let getProfileLocale;
let render;
let getMetadata;
let Nav;
let App;

function structure(value) {
  if (Array.isArray(value)) return value.map(structure);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, structure(value[key])]));
  }
  return typeof value;
}

before(async () => {
  environment = createDom({ reducedMotion: true });
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  ({ getProfileContent, getProfileLocale } = await server.ssrLoadModule('/src/content/index.ts'));
  ({ render, getMetadata } = await server.ssrLoadModule('/src/entry-server.tsx'));
  ({ Nav } = await server.ssrLoadModule('/src/components/Nav.tsx'));
  ({ App } = await server.ssrLoadModule('/src/App.tsx'));
});

after(async () => { await server?.close(); environment?.close(); });

test('Korean and English content use the same structural contract', () => {
  assert.deepEqual(structure(getProfileContent('ko')), structure(getProfileContent('en')));
});

test('locale comes from the requested URL path', () => {
  assert.equal(getProfileLocale('/'), 'ko');
  assert.equal(getProfileLocale('/en'), 'en');
  assert.equal(getProfileLocale('/en/'), 'en');
  assert.equal(getProfileLocale('/en/profile'), 'en');
  assert.equal(getProfileLocale('/english/'), 'ko');
});

test('server rendering and metadata use the same requested locale', () => {
  const koreanHtml = render('ko');
  const englishHtml = render('en');

  assert.match(koreanHtml, /야망솔루션 홈페이지 열기/);
  assert.match(koreanHtml, /aria-label="English"/);
  assert.match(koreanHtml, /aria-current="page"[^>]*href="\/"[^>]*lang="ko"/);
  assert.match(koreanHtml, /aria-label="English"[^>]*href="\/en\/"[^>]*lang="en"/);
  assert.match(englishHtml, /Open Yamang Solution website/);
  assert.match(englishHtml, /aria-label="한국어"/);
  assert.match(englishHtml, /aria-current="page"[^>]*href="\/en\/"[^>]*lang="en"/);
  assert.match(englishHtml, /aria-label="한국어"[^>]*href="\/"[^>]*lang="ko"/);
  assert.doesNotMatch(englishHtml, /야망솔루션 홈페이지 열기/);

  assert.equal(getMetadata('ko').ogLocale, 'ko_KR');
  assert.equal(getMetadata('en').ogLocale, 'en_US');
});

test('compact logo states render full and shortened spellings together on the server', () => {
  for (const locale of ['ko', 'en']) {
    const content = getProfileContent(locale).site;
    for (const logo of content.logoTexts.filter(item => item.compactText)) {
      const html = renderToString(createElement(Nav, {
        content: { ...content, logoTexts: [logo] },
        locale,
        onOpenContact() {},
      }));
      assert.ok(html.includes(`<span class="profile-logo-full">${logo.text}</span>`));
      assert.ok(html.includes(`<span class="profile-logo-compact">${logo.compactText}</span>`));
      assert.match(html, /data-has-compact="true"/);
    }
  }
});

test('English prerender hydrates without a locale mismatch', async () => {
  const container = document.getElementById('root');
  container.innerHTML = render('en');
  container.querySelectorAll('video').forEach(video => { video.muted = video.defaultMuted; });
  const errors = [];
  const warnings = [];
  const originalConsoleError = console.error;
  let root;

  console.error = (...args) => warnings.push(args);
  try {
    await act(async () => {
      root = hydrateRoot(container, createElement(App, { locale: 'en' }), {
        onRecoverableError: error => errors.push(error),
      });
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
  } finally {
    await act(async () => root?.unmount());
    console.error = originalConsoleError;
  }
});
