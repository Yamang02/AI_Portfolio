import { copyFile, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const sourceDirectory = path.resolve(process.cwd(), '../asset/history');
const outputDirectory = path.resolve(process.cwd(), 'src/assets/history');
const temporaryDirectory = path.resolve(process.cwd(), 'tmp/history-assets');
const imageWidths = [400, 800];
const videoWidth = 960;
const videoDurationSeconds = 10;

const photoSources = [
  { file: 'artclub.png', name: 'artclub' },
  { file: 'chatbot.png', name: 'chatbot' },
  { file: 'gbsa.jpg', name: 'gbsa', crop: { left: 0.06, top: 0.19, width: 0.68 } },
  { file: 'reconlabs.jpg', name: 'reconlabs', crop: { left: 0.264, top: 0.385, width: 0.44 } },
  { file: 'sesac.jpg', name: 'sesac', crop: { left: 0.313, top: 0.442, width: 0.44 } },
  { file: 'yamangsolution.png', name: 'yamangsolution', focus: { x: 0, y: 0 } },
];

async function buildResponsiveImages(sourcePath, name, { focus = { x: 0.5, y: 0.5 }, crop } = {}) {
  const { data: source, info } = await sharp(sourcePath).rotate().toBuffer({ resolveWithObject: true });

  if (!info.width || !info.height) {
    throw new Error('Could not read image dimensions: ' + sourcePath);
  }

  const frameWidth = crop ? Math.round(info.width * crop.width) : info.width;
  const cropHeight = Math.min(info.height, Math.round(frameWidth * 10 / 16));
  const cropWidth = Math.min(frameWidth, Math.round(cropHeight * 16 / 10));
  const region = crop
    ? { left: Math.round(info.width * crop.left), top: Math.round(info.height * crop.top), width: cropWidth, height: cropHeight }
    : {
      left: Math.round((info.width - cropWidth) * focus.x),
      top: Math.round((info.height - cropHeight) * focus.y),
      width: cropWidth,
      height: cropHeight,
    };

  if (region.left + region.width > info.width || region.top + region.height > info.height) {
    throw new Error('Crop region exceeds the source image: ' + sourcePath);
  }

  const outputs = [];

  for (const width of imageWidths) {
    for (const format of ['avif', 'webp']) {
      const filename = name + '-' + width + '.' + format;
      const destination = path.join(outputDirectory, filename);
      const resized = sharp(source).extract(region).resize(width, Math.round(width * 10 / 16), { fit: 'cover' });

      if (format === 'avif') {
        await resized.avif({ quality: 45, effort: 6 }).toFile(destination);
      } else {
        await resized.webp({ quality: 76, effort: 6 }).toFile(destination);
      }

      const metadata = await sharp(destination).metadata();
      const file = await stat(destination);

      if (metadata.width !== width || Math.abs(metadata.width / metadata.height - 1.6) > 0.01) {
        throw new Error(filename + ' is not a 16:10 image at the requested width.');
      }

      if (width === 400 && format === 'avif' && file.size > 40 * 1024) {
        throw new Error(filename + ' exceeds the 40 KB budget (' + file.size + ' bytes).');
      }

      outputs.push({ filename, width: metadata.width, height: metadata.height, bytes: file.size });
    }
  }

  return outputs;
}

function runFfmpeg(executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8', windowsHide: true });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || 'ffmpeg exited with status ' + result.status);
  }
}

async function buildVideoAssets() {
  const sourcePath = path.join(sourceDirectory, 'design.mp4');
  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
  const availability = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8', windowsHide: true });

  if (availability.error || availability.status !== 0) {
    console.log('ffmpeg is unavailable; skipped the design video and poster. Add ffmpeg to PATH and rerun assets:history.');
    return [];
  }

  await mkdir(temporaryDirectory, { recursive: true });
  const temporaryVideo = path.join(temporaryDirectory, 'design-loop.mp4');
  const outputVideo = path.join(outputDirectory, 'design-loop.mp4');
  const posterJpeg = path.join(temporaryDirectory, 'design-poster.jpg');
  let outputBytes = 0;

  for (const crf of [29, 32, 35]) {
    await rm(temporaryVideo, { force: true });
    runFfmpeg(ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-ss', '0', '-i', sourcePath,
      '-t', String(videoDurationSeconds), '-an', '-vf', "scale=w='min(" + videoWidth + ",iw)':h=-2",
      '-r', '24', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', temporaryVideo,
    ]);
    outputBytes = (await stat(temporaryVideo)).size;

    if (outputBytes <= 2 * 1024 * 1024) {
      break;
    }
  }

  if (outputBytes > 2 * 1024 * 1024) {
    throw new Error('design-loop.mp4 exceeds the 2 MB budget (' + outputBytes + ' bytes).');
  }

  await rm(outputVideo, { force: true });
  await copyFile(temporaryVideo, outputVideo);
  runFfmpeg(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-i', outputVideo, '-frames:v', '1', '-q:v', '2', '-y', posterJpeg,
  ]);

  const posterOutputs = await buildResponsiveImages(posterJpeg, 'design-poster');
  await rm(temporaryDirectory, { recursive: true, force: true });

  return [{ filename: 'design-loop.mp4', bytes: outputBytes }, ...posterOutputs];
}

await mkdir(outputDirectory, { recursive: true });
const images = [];

for (const photo of photoSources) {
  images.push(...await buildResponsiveImages(path.join(sourceDirectory, photo.file), photo.name, photo));
}

const video = await buildVideoAssets();

console.log(JSON.stringify({ outputDirectory, assets: [...images, ...video] }, null, 2));
