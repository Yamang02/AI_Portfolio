import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let HistorySection;
let content;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  ({ HistorySection } = await server.ssrLoadModule('/src/components/history/HistorySection.tsx'));
  const { getProfileContent } = await server.ssrLoadModule('/src/content/index.ts');
  content = getProfileContent('ko');
});

after(async () => { await server?.close(); });

test('prerender exposes every history card in normal document flow with year anchors', () => {
  const html = renderToStaticMarkup(createElement(HistorySection, { content: content.history, locale: 'ko' }));
  assert.match(html, /data-layout="flow"/);
  assert.doesNotMatch(html, /history-pinned-frame|pointer-events-none absolute inset-x-0 h-px/);
  assert.equal((html.match(/<h4\b/g) ?? []).length, content.history.steps.reduce((sum, step) => sum + step.entries.length, 0));
  for (const step of content.history.steps) {
    assert.ok(html.includes('id="history-year-' + step.id + '"'));
    assert.ok(html.includes('href="#history-year-' + step.id + '"'));
  }
});
