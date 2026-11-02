import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
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
const PREVIEW_PATH = path.join(os.tmpdir(), `profile-p02-horizontal-tears-${Date.now()}.png`);
const WIDTHS = [640, 1280, 2048];
const CURL_BACK_WIDTH = 1280;
const FIBER_WIDTH = 1280;
const PREVIEW_SIZE = 1024;
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

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function toSvgPoints(points) {
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}

function averageY(points) {
  return points.reduce((total, point) => total + point.y, 0) / points.length;
}

function offsetPath(points, offset) {
  return points.map(point => ({
    ...point,
    y: round(Math.min(100, Math.max(0, point.y + offset))),
  }));
}

function createMaskSvg(points, width, height) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon fill="#fff" stroke="#fff" stroke-width="0.12" stroke-linejoin="round" points="${toSvgPoints(points)}"/></svg>`,
  );
}

function createFiberSvg(pathPoints, side, width, height, seed) {
  const direction = side === 'upper' ? -1 : 1;
  const oppositeEdge = pathPoints.map(point => ({
    x: point.x,
    y: round(point.y + direction * point.fiberWidth),
  }));
  const points = [
    ...pathPoints.map(({ x, y }) => ({ x, y })),
    ...oppositeEdge.toReversed(),
  ];

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><filter id="fiber-grain" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence baseFrequency="0.7" numOctaves="2" result="grain" seed="${seed}" type="fractalNoise"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="0.28" xChannelSelector="R" yChannelSelector="G"/></filter></defs><polygon fill="#f2ede3" filter="url(#fiber-grain)" points="${toSvgPoints(points)}"/></svg>`,
  );
}

function getPieceGeometry() {
  const firstPath = TEAR_PATHS.first;
  const secondPath = TEAR_PATHS.second;
  const firstCenter = averageY(firstPath);
  const secondCenter = averageY(secondPath);
  const topCurlHeight = firstCenter * 0.08;
  const middleCurlHeight = (secondCenter - firstCenter) * 0.08;
  const bottomCurlHeight = (100 - secondCenter) * 0.08;
  const topHinge = offsetPath(firstPath, -topCurlHeight);
  const middleTopHinge = offsetPath(firstPath, middleCurlHeight);
  const middleBottomHinge = offsetPath(secondPath, -middleCurlHeight);
  const bottomHinge = offsetPath(secondPath, bottomCurlHeight);

  return {
    bodies: {
      top: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        ...topHinge.toReversed(),
      ],
      middle: [
        ...middleTopHinge,
        ...middleBottomHinge.toReversed(),
      ],
      bottom: [
        ...bottomHinge,
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
    },
    curls: [
      {
        id: 'top-bottom',
        tearId: 'first',
        side: 'upper',
        hingePercent: firstCenter - topCurlHeight,
        polygon: [...firstPath, ...topHinge.toReversed()],
      },
      {
        id: 'middle-top',
        tearId: 'first',
        side: 'lower',
        hingePercent: firstCenter + middleCurlHeight,
        polygon: [...firstPath, ...middleTopHinge.toReversed()],
      },
      {
        id: 'middle-bottom',
        tearId: 'second',
        side: 'upper',
        hingePercent: secondCenter - middleCurlHeight,
        polygon: [...middleBottomHinge, ...secondPath.toReversed()],
      },
      {
        id: 'bottom-top',
        tearId: 'second',
        side: 'lower',
        hingePercent: secondCenter + bottomCurlHeight,
        polygon: [...secondPath, ...bottomHinge.toReversed()],
      },
    ],
    fibers: [
      { tearId: 'first', side: 'upper', points: firstPath },
      { tearId: 'first', side: 'lower', points: firstPath },
      { tearId: 'second', side: 'upper', points: secondPath },
      { tearId: 'second', side: 'lower', points: secondPath },
    ],
  };
}

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

async function renderEncoded(imageBuffer, format, destination) {
  const image = sharp(imageBuffer);
  const output = format === 'avif'
    ? image.avif({ quality: 55, effort: 5, chromaSubsampling: '4:2:0', alphaQuality: 75 })
    : image.webp({ quality: 75, effort: 5, alphaQuality: 85 });

  return output.toFile(destination);
}

async function renderBandImage(sourcePath, crop, width, format, destination) {
  const image = sharp(sourcePath).extract(crop).resize({ width, kernel: sharp.kernel.lanczos3 });
  const output = format === 'avif'
    ? image.avif({ quality: 55, effort: 5, chromaSubsampling: '4:2:0' })
    : image.webp({ quality: 75, effort: 5 });

  return output.toFile(destination);
}

async function renderMaskedImage(sourceBuffer, polygon, width, format, destination) {
  const imageBuffer = await sharp(sourceBuffer)
    .resize({ width, height: width, kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .png()
    .toBuffer();
  const mask = createMaskSvg(polygon, width, width);
  const maskedImage = await sharp(imageBuffer)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  return renderEncoded(maskedImage, format, destination);
}

async function renderCurlBack(sourceBuffer, polygon, width, destination) {
  const mirroredImage = await sharp(sourceBuffer)
    .resize({ width, height: width, kernel: sharp.kernel.lanczos3 })
    .flop()
    .jpeg({ quality: 76 })
    .toBuffer();
  const clipPoints = toSvgPoints(polygon);
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><clipPath id="curl-mask"><polygon points="${clipPoints}" stroke="#fff" stroke-width="0.12" stroke-linejoin="round"/></clipPath><linearGradient id="curl-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#433a30" stop-opacity="0.18"/><stop offset="0.5" stop-color="#433a30" stop-opacity="0.02"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.12"/></linearGradient></defs><g clip-path="url(#curl-mask)"><rect width="100" height="100" fill="#efe6d6"/><image href="data:image/jpeg;base64,${mirroredImage.toString('base64')}" width="100" height="100" opacity="0.1"/><rect width="100" height="100" fill="url(#curl-shade)"/></g></svg>`,
  );

  return sharp(svg).webp({ quality: 80, effort: 5, alphaQuality: 90 }).toFile(destination);
}

async function renderTearFiber(fiber, destination) {
  const seed = (fiber.tearId === 'first' ? 31 : 53) + (fiber.side === 'upper' ? 0 : 17);
  const svg = createFiberSvg(fiber.points, fiber.side, FIBER_WIDTH, FIBER_WIDTH, seed);

  return sharp(svg).png({ compressionLevel: 9 }).toFile(destination);
}

async function renderPreviewPiece(sourceImage, polygon) {
  const mask = createMaskSvg(polygon, PREVIEW_SIZE, PREVIEW_SIZE);

  return sharp(sourceImage)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function createTearLinesSvg(paths, size) {
  const lines = Object.values(paths).map(points => {
    const coordinates = points.map(point => `${point.x / 100 * size},${point.y / 100 * size}`).join(' ');
    return `<polyline points="${coordinates}" fill="none" stroke="#ff00a8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${lines}</svg>`);
}

async function createPreview(sourceData, geometry) {
  const fallen = sourceData.get('fallen');
  const hero = sourceData.get('hero');
  const fallenImage = await sharp(fallen.path)
    .resize({ width: PREVIEW_SIZE, height: PREVIEW_SIZE })
    .ensureAlpha()
    .png()
    .toBuffer();
  const heroLayers = [];

  for (const band of LAYOUT.bands) {
    const crop = getCrop(hero.width, hero.height, band);
    const bandBuffer = await sharp(hero.path)
      .extract(crop)
      .resize({ width: Math.round(PREVIEW_SIZE * LAYOUT.frame.widthPercent / 100) })
      .png()
      .toBuffer();

    heroLayers.push({
      input: bandBuffer,
      left: Math.round(PREVIEW_SIZE * LAYOUT.frame.leftPercent / 100),
      top: Math.round(PREVIEW_SIZE * band.topPercent / 100),
    });
  }

  const heroImage = await sharp({
    create: { width: PREVIEW_SIZE, height: PREVIEW_SIZE, channels: 3, background: '#ffffff' },
  }).composite(heroLayers).png().toBuffer();
  const lines = createTearLinesSvg(TEAR_PATHS, PREVIEW_SIZE);
  const piecePolygons = [
    ...Object.values(geometry.bodies),
    ...geometry.curls.map(curl => curl.polygon),
  ];
  const assemblyLayers = [];

  for (const polygon of piecePolygons) {
    assemblyLayers.push({ input: await renderPreviewPiece(fallenImage, polygon), left: 0, top: 0 });
  }

  const assembledImage = await sharp({
    create: { width: PREVIEW_SIZE, height: PREVIEW_SIZE, channels: 3, background: '#ffffff' },
  }).composite(assemblyLayers).png().toBuffer();
  const annotatedFallen = await sharp(fallenImage).composite([{ input: lines }]).png().toBuffer();
  const annotatedAssembly = await sharp(assembledImage).composite([{ input: lines }]).png().toBuffer();
  const annotatedHero = await sharp(heroImage).composite([{ input: lines }]).png().toBuffer();
  const [originalPixels, assembledPixels] = await Promise.all([
    sharp(fallenImage).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer(),
    sharp(assembledImage).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer(),
  ]);
  let totalDifference = 0;
  let maxDifference = 0;

  for (let index = 0; index < originalPixels.length; index += 1) {
    const difference = Math.abs(originalPixels[index] - assembledPixels[index]);
    totalDifference += difference;
    maxDifference = Math.max(maxDifference, difference);
  }

  await sharp({
    create: { width: PREVIEW_SIZE * 3, height: PREVIEW_SIZE, channels: 3, background: '#ffffff' },
  })
    .composite([
      { input: annotatedFallen, left: 0, top: 0 },
      { input: annotatedAssembly, left: PREVIEW_SIZE, top: 0 },
      { input: annotatedHero, left: PREVIEW_SIZE * 2, top: 0 },
    ])
    .png()
    .toFile(PREVIEW_PATH);

  return {
    meanAbsolutePixelDifference: totalDifference / originalPixels.length,
    maxPixelDifference: maxDifference,
  };
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
await mkdir(FONT_OUTPUT_DIRECTORY, { recursive: true });

for (const filename of await readdir(OUTPUT_DIRECTORY)) {
  const isOldPiece = /^fallen-(top|middle|bottom)-(left|right)-/.test(filename);
  const isOldOverlay = /^(tear|shadow)-(top|middle|bottom)-(left|right)\.png$/.test(filename);

  if (isOldPiece || isOldOverlay) {
    await rm(path.resolve(OUTPUT_DIRECTORY, filename), { force: true });
  }
}

const sourceData = new Map();
const geometry = getPieceGeometry();
const responsiveImages = [];
const staticImages = [];

for (const source of IMAGE_SOURCES) {
  const sourcePath = path.join(SOURCE_DIRECTORY, source.filename);
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height || metadata.width !== metadata.height) {
    throw new Error(`Expected a square source image: ${sourcePath}`);
  }

  sourceData.set(source.name, { path: sourcePath, width: metadata.width, height: metadata.height });

  if (source.name === 'hero') {
    for (const band of LAYOUT.bands) {
      const crop = getCrop(metadata.width, metadata.height, band);

      for (const width of WIDTHS) {
        for (const format of ['avif', 'webp']) {
          const filename = `hero-${band.id}-${width}.${format}`;
          const destination = path.resolve(OUTPUT_DIRECTORY, filename);
          const image = await renderBandImage(sourcePath, crop, width, format, destination);
          const file = await stat(destination);

          if (width === 640 && format === 'avif' && file.size > 60 * 1024) {
            throw new Error(`${filename} exceeds the 60 KB budget (${file.size} bytes)`);
          }

          responsiveImages.push({ filename, bytes: file.size, width: image.width, height: image.height });
        }
      }
    }
  }
}

const fallenSource = sourceData.get('fallen');
const fallenImage = await sharp(fallenSource.path).png().toBuffer();

for (const [pieceId, polygon] of Object.entries(geometry.bodies)) {
  for (const width of WIDTHS) {
    for (const format of ['avif', 'webp']) {
      const filename = `fallen-${pieceId}-body-${width}.${format}`;
      const destination = path.resolve(OUTPUT_DIRECTORY, filename);
      const image = await renderMaskedImage(fallenImage, polygon, width, format, destination);
      const file = await stat(destination);

      if (width === 640 && format === 'avif' && file.size > 60 * 1024) {
        throw new Error(`${filename} exceeds the 60 KB budget (${file.size} bytes)`);
      }

      responsiveImages.push({ filename, bytes: file.size, width: image.width, height: image.height });
    }
  }
}

for (const curl of geometry.curls) {
  for (const width of WIDTHS) {
    for (const format of ['avif', 'webp']) {
      const filename = `fallen-curl-${curl.id}-front-${width}.${format}`;
      const destination = path.resolve(OUTPUT_DIRECTORY, filename);
      const image = await renderMaskedImage(fallenImage, curl.polygon, width, format, destination);
      const file = await stat(destination);

      if (width === 640 && format === 'avif' && file.size > 60 * 1024) {
        throw new Error(`${filename} exceeds the 60 KB budget (${file.size} bytes)`);
      }

      responsiveImages.push({ filename, bytes: file.size, width: image.width, height: image.height });
    }
  }

  const backFilename = `fallen-curl-${curl.id}-back.webp`;
  const backPath = path.resolve(OUTPUT_DIRECTORY, backFilename);
  await renderCurlBack(fallenImage, curl.polygon, CURL_BACK_WIDTH, backPath);
  staticImages.push({ filename: backFilename, bytes: (await stat(backPath)).size });
}

for (const fiber of geometry.fibers) {
  const filename = `fiber-${fiber.tearId}-${fiber.side}.png`;
  const destination = path.resolve(OUTPUT_DIRECTORY, filename);
  await renderTearFiber(fiber, destination);
  staticImages.push({ filename, bytes: (await stat(destination)).size });
}

const fontSource = path.join(SOURCE_DIRECTORY, 'griun_original.ttf');
const fontDestination = path.join(FONT_OUTPUT_DIRECTORY, 'griun-yamang-v1.woff2');
const fontSubset = await subsetFont(await readFile(fontSource), '야망솔루션', { targetFormat: 'woff2' });
await writeFile(fontDestination, fontSubset);
const fontBytes = (await stat(fontDestination)).size;

if (fontBytes > 10 * 1024) {
  throw new Error(`Subset font exceeds the 10 KB budget (${fontBytes} bytes)`);
}

const previewDifference = await createPreview(sourceData, geometry);

const expectedResponsiveCount = (LAYOUT.bands.length + Object.keys(geometry.bodies).length + geometry.curls.length) * WIDTHS.length * 2;

if (responsiveImages.length !== expectedResponsiveCount) {
  throw new Error(`Expected ${expectedResponsiveCount} responsive images, received ${responsiveImages.length}`);
}
if (staticImages.length !== geometry.curls.length + geometry.fibers.length) {
  throw new Error(`Expected ${geometry.curls.length + geometry.fibers.length} static tear assets, received ${staticImages.length}`);
}

console.log(JSON.stringify({
  outputDirectory: OUTPUT_DIRECTORY,
  responsiveImageCount: responsiveImages.length,
  staticTearAssetCount: staticImages.length,
  responsiveImages,
  staticImages,
  previewDifference,
  fontBytes,
  fontOutput: fontDestination,
  preview: PREVIEW_PATH,
}, null, 2));
