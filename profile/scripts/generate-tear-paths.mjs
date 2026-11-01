import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '..');
const LAYOUT_PATH = path.resolve(PROJECT_DIRECTORY, 'src', 'components', 'opening', 'bandLayout.json');
const OUTPUT_PATH = path.resolve(PROJECT_DIRECTORY, 'src', 'components', 'opening', 'tearPaths.ts');
const JSON_OUTPUT_PATH = path.resolve(PROJECT_DIRECTORY, 'src', 'components', 'opening', 'tearPaths.json');
const BAND_SEEDS = { top: 4817, middle: 16055, bottom: 9383 };

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
  return Number(value.toFixed(2));
}

function createBandPaths(band) {
  const random = createRandom(BAND_SEEDS[band.id]);
  const pointCount = 32;
  const lowFrequency = 1.1 + random() * 1.2;
  const lowPhase = random() * Math.PI * 2;
  const highPhase = random() * Math.PI * 2;
  const lowAmplitude = 0.45 + random() * 1.05;
  const points = Array.from({ length: pointCount }, (_, index) => {
    const y = index / (pointCount - 1) * 100;
    const position = index / (pointCount - 1);
    const lowNoise = Math.sin(position * lowFrequency * Math.PI * 2 + lowPhase) * lowAmplitude;
    const highNoise = Math.sin(position * 22 * Math.PI * 2 + highPhase) * (0.1 + random() * 0.3);
    const x = Math.min(98, Math.max(2, band.tearCenterPercent + lowNoise + highNoise));

    return { x: format(x), y: format(y), fiberWidth: format(0.3 + random() * 0.6) };
  });
  const boundary = points.map(({ x, y }) => ({ x, y }));
  const leftFiber = [
    ...boundary,
    ...points.toReversed().map(({ x, y, fiberWidth }) => ({ x: format(x - fiberWidth), y })),
  ];
  const rightFiber = [
    ...boundary,
    ...points.toReversed().map(({ x, y, fiberWidth }) => ({ x: format(x + fiberWidth), y })),
  ];
  const leftClip = [
    { x: 0, y: 0 },
    ...boundary,
    { x: 0, y: 100 },
  ];
  const rightClip = [
    ...boundary,
    { x: 100, y: 100 },
    { x: 100, y: 0 },
  ];

  return {
    leftClip,
    rightClip,
    leftFiber,
    rightFiber,
  };
}

const layout = JSON.parse(await readFile(LAYOUT_PATH, 'utf8'));
const generated = Object.fromEntries(layout.bands.map(band => [band.id, createBandPaths(band)]));
const output = `import tearPathData from './tearPaths.json';\n\nexport interface TearPoint {\n  readonly x: number;\n  readonly y: number;\n}\n\nexport interface TearBandPaths {\n  readonly leftClip: readonly TearPoint[];\n  readonly rightClip: readonly TearPoint[];\n  readonly leftFiber: readonly TearPoint[];\n  readonly rightFiber: readonly TearPoint[];\n}\n\nexport const TEAR_PATHS = tearPathData satisfies Record<'top' | 'middle' | 'bottom', TearBandPaths>;\n`;

await writeFile(OUTPUT_PATH, output, 'utf8');
await writeFile(JSON_OUTPUT_PATH, `${JSON.stringify(generated, null, 2)}\n`, 'utf8');
console.log(`Generated deterministic tear path data: ${OUTPUT_PATH}`);
