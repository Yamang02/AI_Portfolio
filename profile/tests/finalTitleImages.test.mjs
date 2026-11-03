import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let decodeFinalTitleImages;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  ({ decodeFinalTitleImages } = await server.ssrLoadModule('/src/components/opening/FinalTitleBands.tsx'));
});

after(async () => { await server?.close(); });

test('a failed top title still preserves the successfully decoded bottom title', async t => {
  const original = globalThis.Image;
  globalThis.Image = class {
    src = '';
    decode() {
      return this.src.includes('hero-final-top')
        ? Promise.reject(new Error('Missing top title'))
        : Promise.resolve();
    }
  };
  t.after(() => {
    if (original === undefined) delete globalThis.Image;
    else globalThis.Image = original;
  });
  assert.deepEqual(await decodeFinalTitleImages(new AbortController().signal), ['bottom']);
});

test('failed title requests settle with no image titles instead of rejecting the scene', async t => {
  const original = globalThis.Image;
  globalThis.Image = class {
    src = '';
    decode() { return Promise.reject(new Error('Title service unavailable')); }
  };
  t.after(() => {
    if (original === undefined) delete globalThis.Image;
    else globalThis.Image = original;
  });
  assert.deepEqual(await decodeFinalTitleImages(new AbortController().signal), []);
});
