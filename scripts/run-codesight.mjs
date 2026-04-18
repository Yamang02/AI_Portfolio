/**
 * Runs CodeSight analyze from repo root; requires bash (Git Bash on Windows).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const ensured = spawnSync(process.execPath, [path.join(__dirname, 'ensure-codesight.mjs')], {
  cwd: root,
  stdio: 'inherit',
});
if (ensured.status !== 0) {
  process.exit(ensured.status ?? 1);
}
const bin = path.join(root, 'tools', 'codesight', 'bin', 'codesight');
const outFile = path.join(root, 'docs', 'agent', 'codesight-context.txt');

if (!fs.existsSync(bin)) {
  console.error('[codesight] CLI not found. Run: npm run codesight:ensure');
  process.exit(1);
}

function findBash() {
  if (process.platform !== 'win32') {
    return 'bash';
  }
  const candidates = [
    path.join(process.env.ProgramFiles ?? '', 'Git', 'bin', 'bash.exe'),
    path.join(process.env['ProgramFiles(x86)'] ?? '', 'Git', 'bin', 'bash.exe'),
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      return c;
    }
  }
  return 'bash';
}

const bash = findBash();
const posixBin = bin.replace(/\\/g, '/');
const posixOut = outFile.replace(/\\/g, '/');

const r = spawnSync(
  bash,
  [posixBin, 'analyze', '.', '--output', posixOut],
  { cwd: root, stdio: 'inherit', env: process.env },
);

process.exit(r.status === 0 ? 0 : r.status ?? 1);
