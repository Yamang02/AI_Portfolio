import { copyFile, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const sourceDirectory = path.resolve(process.cwd(), '../asset/connect');
const outputDirectory = path.resolve(process.cwd(), 'src/assets/connect');
const temporaryDirectory = path.resolve(process.cwd(), 'tmp/connect-assets');
const megabyte = 1024 * 1024;
const variants = [
  { name: 'wide', width: 1280, videoSizeLimit: 3 * megabyte, crfs: [23, 26, 29, 32] },
  { name: 'narrow', width: 720, videoSizeLimit: 1.5 * megabyte, crfs: [29, 32, 35] },
];

function run(executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8', windowsHide: true });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || executable + ' exited with status ' + result.status);
  }

  return result.stdout.trim();
}

async function buildVideo(ffmpeg, variant, sourcePath, durationSeconds) {
  const filename = 'monet-connect-' + variant.name + '-loop.mp4';
  const temporaryVideo = path.join(temporaryDirectory, filename);
  const outputVideo = path.join(outputDirectory, filename);
  let outputBytes = 0;

  for (const crf of variant.crfs) {
    await rm(temporaryVideo, { force: true });
    run(ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-i', sourcePath,
      '-map', '0:v:0', '-an', '-vf', "scale=w='min(" + variant.width + ",iw)':h=-2,fps=30",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', temporaryVideo,
    ]);
    outputBytes = (await stat(temporaryVideo)).size;

    if (outputBytes <= variant.videoSizeLimit) {
      break;
    }
  }

  if (outputBytes > variant.videoSizeLimit) {
    throw new Error(filename + ' exceeds the ' + variant.videoSizeLimit + ' byte budget (' + outputBytes + ' bytes).');
  }

  await copyFile(temporaryVideo, outputVideo);
  return { filename, bytes: outputBytes, durationSeconds };
}

async function buildPosters(ffmpeg, variant, sourcePath, durationSeconds) {
  const temporaryPoster = path.join(temporaryDirectory, 'monet-connect-' + variant.name + '-poster.jpg');
  const midpoint = (durationSeconds / 2).toFixed(3);

  run(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-ss', midpoint, '-i', sourcePath,
    '-map', '0:v:0', '-frames:v', '1', '-vf', "scale=w='min(" + variant.width + ",iw)':h=-2",
    '-q:v', '2', '-y', temporaryPoster,
  ]);

  const outputs = [];

  for (const format of ['avif', 'webp']) {
    const filename = 'monet-connect-' + variant.name + '-poster.' + format;
    const destination = path.join(outputDirectory, filename);
    const image = sharp(temporaryPoster).resize({ width: variant.width, withoutEnlargement: true });

    if (format === 'avif') {
      await image.avif({ quality: 45, effort: 5 }).toFile(destination);
    } else {
      await image.webp({ quality: 76, effort: 5 }).toFile(destination);
    }

    const metadata = await sharp(destination).metadata();
    const file = await stat(destination);
    outputs.push({ filename, width: metadata.width, height: metadata.height, bytes: file.size });
  }

  return outputs;
}

const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH || 'ffprobe';

await mkdir(outputDirectory, { recursive: true });
await mkdir(temporaryDirectory, { recursive: true });

try {
  const assets = [];

  for (const variant of variants) {
    const sourcePath = path.join(sourceDirectory, 'monet-connect-' + variant.name + '-original.mp4');
    const durationSeconds = Number(run(ffprobe, [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', sourcePath,
    ]));

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error('Could not read the source video duration: ' + sourcePath);
    }

    assets.push(
      await buildVideo(ffmpeg, variant, sourcePath, durationSeconds),
      ...await buildPosters(ffmpeg, variant, sourcePath, durationSeconds),
    );
  }

  console.log(JSON.stringify({ outputDirectory, assets }, null, 2));
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
