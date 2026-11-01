import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import subsetFont from 'subset-font';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '..');
const SOURCE_DIRECTORY = path.resolve(PROJECT_DIRECTORY, '..', 'asset', 'opening');
const OUTPUT_DIRECTORY = path.resolve(PROJECT_DIRECTORY, 'src', 'assets', 'opening');
const FONT_OUTPUT_DIRECTORY = path.resolve(PROJECT_DIRECTORY, 'public', 'fonts');
const PREVIEW_PATH = path.join(os.tmpdir(), `profile-p02-opening-preview-${Date.now()}.png`);
const WIDTHS = [640, 1280, 2048];
const EDGE_WIDTH = 1280;
const IMAGE_SOURCES = [
  { name: 'hero', filename: 'hero_original.jpg' },
  { name: 'fallen', filename: 'fallen_angel_square_606_x4.png' },
];
const LAYOUT = JSON.parse(
  await readFile(path.resolve(PROJECT_DIRECTORY, 'src', 'components', 'opening', 'bandLayout.json'), 'utf8'),
);
const TEAR_PATHS = JSON.parse(
  await readFile(path.resolve(PROJECT_DIRECTORY, 'src', 'components', 'opening', 'tearPaths.json'), 'utf8'),
);

function getCrop(sourceWidth, sourceHeight, band) {
  const crop = {
    left: Math.round(sourceWidth * LAYOUT.frame.leftPercent / 100),
    top: Math.round(sourceHeight * band.topPercent / 100),
    width: Math.round(sourceWidth * LAYOUT.frame.widthPercent / 100),
    height: Math.round(sourceHeight * band.heightPercent / 100),
  };

  if (crop.left + crop.width > sourceWidth || crop.top + crop.height > sourceHeight) {
    throw new Error(`Band ${band.id} exceeds the ${sourceWidth}x${sourceHeight} source image`);
  }

  return crop;
}

function toSvgPoints(points) {
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}

function createFiberSvg(points, width, height, seed) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><filter id="fiber-grain" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence baseFrequency="0.7" numOctaves="2" result="grain" seed="${seed}" type="fractalNoise"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="0.35" xChannelSelector="R" yChannelSelector="G"/></filter></defs><polygon fill="#f2ede3" filter="url(#fiber-grain)" points="${toSvgPoints(points)}"/></svg>`,
  );
}

function createMaskSvg(points, width, height) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon fill="#fff" points="${toSvgPoints(points)}"/></svg>`,
  );
}

function createShadowSvg(points, width, height) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><filter id="tear-shadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.18"/></filter></defs><polygon fill="#201d1a" fill-opacity="0.5" filter="url(#tear-shadow)" points="${toSvgPoints(points)}"/></svg>`,
  );
}

async function renderImage(sourcePath, crop, width, format, destination) {
  let image = sharp(sourcePath).extract(crop).resize({ width, kernel: sharp.kernel.lanczos3 });
  image = format === 'avif'
    ? image.avif({ quality: 55, effort: 5, chromaSubsampling: '4:2:0' })
    : image.webp({ quality: 75, effort: 5 });
  return image.toFile(destination);
}

async function renderFallenPiece(sourcePath, crop, bandId, side, width, format, destination) {
  const height = Math.round(width * crop.height / crop.width);
  const paths = TEAR_PATHS[bandId];
  const imageMask = createMaskSvg(paths[`${side}Clip`], width, height);
  const sideIndex = side === 'left' ? 0 : 1;
  const bandIndex = LAYOUT.bands.findIndex(band => band.id === bandId);
  const fiber = createFiberSvg(paths[`${side}Fiber`], width, height, 17 + bandIndex * 13 + sideIndex * 7);
  const imageBuffer = await sharp(sourcePath)
    .extract(crop)
    .resize({ width, kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .png()
    .toBuffer();
  let image = sharp(imageBuffer).composite([
    { input: imageMask, blend: 'dest-in' },
    { input: fiber, blend: 'over' },
  ]);
  image = format === 'avif'
    ? image.avif({ quality: 55, effort: 5, chromaSubsampling: '4:2:0' })
    : image.webp({ quality: 75, effort: 5 });
  return image.toFile(destination);
}

async function renderTearOverlays(bandId, band, paths, side) {
  const width = EDGE_WIDTH;
  const height = Math.round(width * band.heightPercent / LAYOUT.frame.widthPercent);
  const boundary = paths.leftClip.slice(1, -1);
  const shadowOffset = side === 'left' ? 1.1 : -1.1;
  const shadowPoints = [
    ...boundary,
    ...boundary.toReversed().map(point => ({ x: Math.min(99, Math.max(1, point.x + shadowOffset)), y: point.y })),
  ];
  const sideSeed = side === 'left' ? 1 : 2;
  const fiberPath = path.resolve(OUTPUT_DIRECTORY, `tear-${bandId}-${side}.png`);
  const shadowPath = path.resolve(OUTPUT_DIRECTORY, `shadow-${bandId}-${side}.png`);
  const fiber = createFiberSvg(paths[`${side}Fiber`], width, height, 31 + LAYOUT.bands.findIndex(item => item.id === bandId) * 11 + sideSeed);
  const shadow = createShadowSvg(shadowPoints, width, height);

  await sharp(fiber).png({ compressionLevel: 9 }).toFile(fiberPath);
  await sharp(shadow).png({ compressionLevel: 9 }).toFile(shadowPath);

  return [
    { filename: path.basename(fiberPath), bytes: (await stat(fiberPath)).size },
    { filename: path.basename(shadowPath), bytes: (await stat(shadowPath)).size },
  ];
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
await mkdir(FONT_OUTPUT_DIRECTORY, { recursive: true });

for (const band of LAYOUT.bands) {
  for (const width of WIDTHS) {
    for (const format of ['avif', 'webp']) {
      await rm(path.resolve(OUTPUT_DIRECTORY, `fallen-${band.id}-${width}.${format}`), { force: true });
    }
  }

  for (const side of ['left', 'right']) {
    await rm(path.resolve(OUTPUT_DIRECTORY, `tear-${band.id}-${side}.png`), { force: true });
    await rm(path.resolve(OUTPUT_DIRECTORY, `shadow-${band.id}-${side}.png`), { force: true });
  }
}

const sourceData = new Map();
const outputFiles = [];
const overlayFiles = [];

for (const source of IMAGE_SOURCES) {
  const sourcePath = path.join(SOURCE_DIRECTORY, source.filename);
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height || metadata.width !== metadata.height) {
    throw new Error(`Expected a square source image: ${sourcePath}`);
  }

  for (const band of LAYOUT.bands) {
    const crop = getCrop(metadata.width, metadata.height, band);
    sourceData.set(`${source.name}:${band.id}`, { crop, sourcePath });

    if (source.name === 'hero') {
      for (const width of WIDTHS) {
        for (const format of ['avif', 'webp']) {
          const filename = `${source.name}-${band.id}-${width}.${format}`;
          const destination = path.resolve(OUTPUT_DIRECTORY, filename);
          const image = await renderImage(sourcePath, crop, width, format, destination);
          const file = await stat(destination);

          if (width === 640 && format === 'avif' && file.size > 60 * 1024) {
            throw new Error(`${filename} exceeds the 60 KB budget (${file.size} bytes)`);
          }

          outputFiles.push({ filename, bytes: file.size, width: image.width, height: image.height });
        }
      }
      continue;
    }

    for (const side of ['left', 'right']) {
      for (const width of WIDTHS) {
        for (const format of ['avif', 'webp']) {
          const filename = `${source.name}-${band.id}-${side}-${width}.${format}`;
          const destination = path.resolve(OUTPUT_DIRECTORY, filename);
          const image = await renderFallenPiece(sourcePath, crop, band.id, side, width, format, destination);
          const file = await stat(destination);

          if (width === 640 && format === 'avif' && file.size > 60 * 1024) {
            throw new Error(`${filename} exceeds the 60 KB budget (${file.size} bytes)`);
          }

          outputFiles.push({ filename, bytes: file.size, width: image.width, height: image.height });
        }
      }

      overlayFiles.push(...await renderTearOverlays(band.id, band, TEAR_PATHS[band.id], side));
    }
  }
}

const fontSource = path.join(SOURCE_DIRECTORY, 'griun_original.ttf');
const fontDestination = path.join(FONT_OUTPUT_DIRECTORY, 'griun-yamang-v1.woff2');
const fontSubset = await subsetFont(await readFile(fontSource), '야망솔루션', { targetFormat: 'woff2' });
await writeFile(fontDestination, fontSubset);
const fontBytes = (await stat(fontDestination)).size;
if (fontBytes > 10 * 1024) {
  throw new Error(`Subset font exceeds the 10 KB budget (${fontBytes} bytes)`);
}

const previewWidth = Math.round(1024 * LAYOUT.frame.widthPercent / 100);
const previewLeft = Math.round(1024 * LAYOUT.frame.leftPercent / 100);
const previewLayers = [];

for (const band of LAYOUT.bands) {
  const sourceName = band.id === 'middle' ? 'fallen' : 'hero';
  const { crop, sourcePath } = sourceData.get(`${sourceName}:${band.id}`);
  const previewBand = await sharp(sourcePath)
    .extract(crop)
    .resize({ width: previewWidth, kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  previewLayers.push({
    input: previewBand,
    left: previewLeft,
    top: Math.round(1024 * band.topPercent / 100),
  });
}

await sharp({
  create: { width: 1024, height: 1024, channels: 3, background: '#ffffff' },
})
  .composite(previewLayers)
  .png()
  .toFile(PREVIEW_PATH);

if (outputFiles.length !== LAYOUT.bands.length * 3 * WIDTHS.length * 2) {
  throw new Error(`Expected 54 responsive band images, received ${outputFiles.length}`);
}
if (overlayFiles.length !== LAYOUT.bands.length * 2 * 2) {
  throw new Error(`Expected 12 static edge and shadow overlays, received ${overlayFiles.length}`);
}

console.log(JSON.stringify({
  outputDirectory: OUTPUT_DIRECTORY,
  responsiveImageCount: outputFiles.length,
  overlayCount: overlayFiles.length,
  images: outputFiles,
  overlays: overlayFiles,
  fontBytes,
  fontOutput: fontDestination,
  preview: PREVIEW_PATH,
}, null, 2));
