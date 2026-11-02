import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceDirectory = path.resolve(process.cwd(), '../asset/intro');
const outputDirectory = path.resolve(process.cwd(), 'src/assets/intro');
const sourceImages = [
  { id: 'educator', filename: 'educator.jpg' },
  { id: 'developer', filename: 'developer.jpg' },
  { id: 'artist', filename: 'artist.jpg' },
  { id: 'entrepreneur', filename: 'entrepreneur.jpg' },
];
const targetWidths = [400, 800, 1200];
const outputSummary = [];

await mkdir(outputDirectory, { recursive: true });

for (const sourceImage of sourceImages) {
  const sourcePath = path.join(sourceDirectory, sourceImage.filename);
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions: ' + sourcePath);
  }

  for (const targetWidth of targetWidths) {
    const width = Math.min(targetWidth, metadata.width);

    for (const format of ['avif', 'webp']) {
      const filename = sourceImage.id + '-' + width + '.' + format;
      const destination = path.join(outputDirectory, filename);
      const pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true });

      if (format === 'avif') {
        await pipeline.avif({ quality: 48, effort: 5 }).toFile(destination);
      } else {
        await pipeline.webp({ quality: 78, effort: 5 }).toFile(destination);
      }

      const outputMetadata = await sharp(destination).metadata();
      const file = await stat(destination);
      const sourceRatio = metadata.width / metadata.height;
      const outputRatio = outputMetadata.width / outputMetadata.height;
      const ratioTolerance = sourceRatio / outputMetadata.height + 0.00001;

      if (Math.abs(sourceRatio - outputRatio) > ratioTolerance) {
        throw new Error(filename + ' changed the source aspect ratio.');
      }

      if (width === 400 && format === 'avif' && file.size > 60 * 1024) {
        throw new Error(filename + ' exceeds the 60 KB budget (' + file.size + ' bytes).');
      }

      outputSummary.push({
        filename,
        width: outputMetadata.width,
        height: outputMetadata.height,
        bytes: file.size,
      });
    }
  }
}

console.log(JSON.stringify({ outputDirectory, images: outputSummary }, null, 2));
