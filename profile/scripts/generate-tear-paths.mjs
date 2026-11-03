import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '..');
const LAYOUT_PATH = path.resolve(PROJECT_DIRECTORY, 'src', 'components', 'opening', 'bandLayout.json');
const OUTPUT_PATH = path.resolve(PROJECT_DIRECTORY, 'src', 'components', 'opening', 'tearPaths.ts');
const JSON_OUTPUT_PATH = path.resolve(PROJECT_DIRECTORY, 'src', 'components', 'opening', 'tearPaths.json');
const POINT_COUNT = 52;

function createRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function format(value) {
  return Number(value.toFixed(3));
}

function createTearPath(tear) {
  const random = createRandom(tear.seed);
  const lowFrequency = 1.4 + random() * 0.8;
  const lowPhase = random() * Math.PI * 2;
  const highPhase = random() * Math.PI * 2;
  const lowAmplitude = 0.55 + random() * 0.3;
  const halfGap = tear.gapHeightPercent / 2;
  const lowLimit = tear.centerPercent - halfGap + 0.08;
  const highLimit = tear.centerPercent + halfGap - 0.08;

  return Array.from({ length: POINT_COUNT }, (_, index) => {
    const position = index / (POINT_COUNT - 1);
    const lowNoise = Math.sin(position * lowFrequency * Math.PI * 2 + lowPhase) * lowAmplitude;
    const highNoise = Math.sin(position * 21 * Math.PI * 2 + highPhase) * (0.1 + random() * 0.2);
    const y = Math.min(highLimit, Math.max(lowLimit, tear.centerPercent + lowNoise + highNoise));

    return {
      x: format(position * 100),
      y: format(y),
      fiberWidth: format(0.3 + random() * 0.6),
    };
  });
}

const layout = JSON.parse(await readFile(LAYOUT_PATH, 'utf8'));
const generated = Object.fromEntries(layout.tears.map(tear => [tear.id, createTearPath(tear)]));

for (const tear of layout.tears) {
  const points = generated[tear.id];
  const gapBottom = tear.gapTopPercent + tear.gapHeightPercent;

  if (points.some(point => point.y < tear.gapTopPercent || point.y > gapBottom)) {
    throw new Error(`Tear ${tear.id} extends beyond its hero gap`);
  }
}

const output = [
  "import tearPathData from './tearPaths.json';",
  '',
  'export interface TearPoint {',
  '  readonly x: number;',
  '  readonly y: number;',
  '  readonly fiberWidth: number;',
  '}',
  '',
  'export type TearPath = readonly TearPoint[];',
  '',
  "export const TEAR_PATHS = tearPathData satisfies Record<'first' | 'second', TearPath>;",
  '',
].join('\n');

await writeFile(OUTPUT_PATH, output, 'utf8');
await writeFile(JSON_OUTPUT_PATH, `${JSON.stringify(generated, null, 2)}\n`, 'utf8');
console.log(`Generated two deterministic horizontal tear paths: ${JSON_OUTPUT_PATH}`);
