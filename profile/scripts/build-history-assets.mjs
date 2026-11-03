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

async function buildResponsiveImages(sourcePath, name) {
  const source = sharp(sourcePath);
  const sourceMetadata = await source.metadata();

  if (!sourceMetadata.width || !sourceMetadata.height) {
    throw new Error('Could not read image dimensions: ' + sourcePath);
  }

  const outputs = [];

  for (const width of imageWidths) {
    for (const format of ['avif', 'webp']) {
      const filename = name + '-' + width + '.' + format;
      const destination = path.join(outputDirectory, filename);
      const resized = sharp(sourcePath).resize(width, Math.round(width * 10 / 16), {
        fit: 'cover',
        position: 'centre',
      });

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
const images = await buildResponsiveImages(path.join(sourceDirectory, 'artclub.png'), 'artclub');
const video = await buildVideoAssets();

console.log(JSON.stringify({ outputDirectory, assets: [...images, ...video] }, null, 2));
