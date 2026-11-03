import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeOpeningImages, loadOpeningImages } from '../src/components/opening/openingImages.ts';

test('image preparation waits for every decoded image', async () => {
  let finishSecond;
  let ready = false;
  const second = new Promise(resolve => { finishSecond = resolve; });
  const pending = decodeOpeningImages([
    { decode: () => Promise.resolve() },
    { decode: () => second },
  ], new AbortController().signal).then(() => { ready = true; });

  await new Promise(setImmediate);
  assert.equal(ready, false);
  finishSecond();
  await pending;
  assert.equal(ready, true);
});

test('a failed scene image rejects preparation without waiting for a stalled image', async () => {
  const failure = new Error('Missing scene image');
  await assert.rejects(decodeOpeningImages([
    { decode: () => new Promise(() => {}) },
    { decode: () => Promise.reject(failure) },
  ], new AbortController().signal), error => error === failure);
});

test('an image that never decodes reaches the preparation deadline', async () => {
  await assert.rejects(decodeOpeningImages([
    { decode: () => new Promise(() => {}) },
  ], new AbortController().signal, 10), /timed out/);
});

test('unmounting cancels pending preparation', async () => {
  const controller = new AbortController();
  const pending = decodeOpeningImages([
    { decode: () => new Promise(() => {}) },
  ], controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('already cancelled preparation does not decode images', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(decodeOpeningImages([
    { decode: () => assert.fail('Cancelled images must not be decoded') },
  ], controller.signal), { name: 'AbortError' });
});

function mockImages(t, decode) {
  const original = globalThis.Image;
  const images = [];
  globalThis.Image = class {
    src = '';
    constructor() { images.push(this); }
    decode() { return decode(this); }
  };
  t.after(() => {
    if (original === undefined) {
      delete globalThis.Image;
    } else {
      globalThis.Image = original;
    }
  });
  return images;
}

test('successfully prepared fallback images keep their sources', async t => {
  const images = mockImages(t, () => Promise.resolve());
  const result = await loadOpeningImages(['back.webp', 'fiber.png'], new AbortController().signal);
  assert.deepEqual(result, images);
  assert.deepEqual(images.map(image => image.src), ['back.webp', 'fiber.png']);
});

test('failed fallback preparation releases all temporary image sources', async t => {
  const images = mockImages(t, image => image.src === 'back.webp'
    ? Promise.reject(new Error('Missing fallback image'))
    : new Promise(() => {}));
  await assert.rejects(loadOpeningImages(['back.webp', 'fiber.png'], new AbortController().signal));
  assert.deepEqual(images.map(image => image.src), ['', '']);
});

test('cancelled fallback preparation releases temporary image sources', async t => {
  const images = mockImages(t, () => new Promise(() => {}));
  const controller = new AbortController();
  const pending = loadOpeningImages(['back.webp'], controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(images[0].src, '');
});

test('already cancelled fallback loading starts no requests', async t => {
  const images = mockImages(t, () => assert.fail('No image should be created'));
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(loadOpeningImages(['back.webp'], controller.signal), { name: 'AbortError' });
  assert.equal(images.length, 0);
});
