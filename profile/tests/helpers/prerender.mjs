import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function prerender(modulePath, exportName, contentPath = '') {
  const rendered = spawnSync(process.execPath, [
    fileURLToPath(new URL('../fixtures/render-component.mjs', import.meta.url)), modulePath, exportName, contentPath,
  ], { encoding: 'utf8', windowsHide: true });
  assert.equal(rendered.status, 0, rendered.stderr);
  return rendered.stdout;
}
