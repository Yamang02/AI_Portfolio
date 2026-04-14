/**
 * Clones mattsilv/codesight into tools/codesight if missing (git required).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const bin = path.join(root, 'tools', 'codesight', 'bin', 'codesight');

if (fs.existsSync(bin)) {
  patchCodesightBinIfNeeded(bin);
  patchCodesightAnalyzerIfNeeded(path.join(root, 'tools', 'codesight', 'src', 'commands', 'analyze', 'analyzer.sh'));
  process.exit(0);
}

const toolsCodesight = path.join(root, 'tools', 'codesight');
if (fs.existsSync(toolsCodesight)) {
  console.error(
    '[codesight] tools/codesight exists but bin/codesight is missing. Remove tools/codesight and run npm run codesight:ensure again.',
  );
  process.exit(1);
}

fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
const r = spawnSync(
  'git',
  ['clone', '--depth', '1', 'https://github.com/mattsilv/codesight.git', toolsCodesight],
  { cwd: root, stdio: 'inherit' },
);
if (r.status !== 0) {
  process.exit(r.status ?? 1);
}

// Upstream bin/codesight may set SCRIPT_DIR to .../bin; sources expect repo root (see install.sh template).
patchCodesightBinIfNeeded(path.join(toolsCodesight, 'bin', 'codesight'));
patchCodesightAnalyzerIfNeeded(path.join(toolsCodesight, 'src', 'commands', 'analyze', 'analyzer.sh'));
process.exit(0);

function patchCodesightBinIfNeeded(binPath) {
  if (!fs.existsSync(binPath)) {
    return;
  }
  let s = fs.readFileSync(binPath, 'utf8');
  const bad = 'SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"';
  const good = 'SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"';
  if (s.includes(bad)) {
    fs.writeFileSync(binPath, s.replace(bad, good));
  }
}

/** Narrow find() + enforce MAX_FILES — upstream modular analyzer collects unbounded files. */
function patchCodesightAnalyzerIfNeeded(analyzerPath) {
  if (!fs.existsSync(analyzerPath)) {
    return;
  }
  let s = fs.readFileSync(analyzerPath, 'utf8');
  if (s.includes('codesight-ai-portfolio-patch')) {
    return;
  }
  const oldFind =
    'temp_files=($(find "$directory" -type f -name "$pattern" -not -path "*/\\.git/*" -not -path "*/node_modules/*"))';
  const newFind =
    'temp_files=($(find "$directory" -type f -name "$pattern" -not -path "*/\\.git/*" -not -path "*/node_modules/*" -not -path "*/docs/epic/archive/*" -not -path "*/target/*" -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/coverage/*" -not -path "*/.scannerwork/*" -not -path "*/storybook-static/*"))';
  if (!s.includes(oldFind)) {
    return;
  }
  s = s.replace(oldFind, newFind);

  const anchor =
    '            files+=("${temp_files[@]}")\n' +
    '        done\n' +
    '    fi\n' +
    '    \n' +
    '    echo "   Debug: After collection, files array size: ${#files[@]}" >&2\n';
  const injection =
    '            files+=("${temp_files[@]}")\n' +
    '        done\n' +
    '        # codesight-ai-portfolio-patch: cap files (upstream collects all matches)\n' +
    '        if [[ ${#files[@]} -gt $max_files ]]; then\n' +
    '            files=("${files[@]:0:$max_files}")\n' +
    '        fi\n' +
    '    fi\n' +
    '    \n' +
    '    echo "   Debug: After collection, files array size: ${#files[@]}" >&2\n';
  if (!s.includes(anchor)) {
    fs.writeFileSync(analyzerPath, s);
    return;
  }
  s = s.replace(anchor, injection);
  fs.writeFileSync(analyzerPath, s);
}
