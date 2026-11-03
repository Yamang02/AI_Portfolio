import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const outputDirectory = join(projectDirectory, 'dist');
const serverOutputDirectory = join(projectDirectory, 'dist-ssr');
const htmlPath = join(outputDirectory, 'index.html');
const serverEntryPath = join(serverOutputDirectory, 'entry-server.js');

try {
  const [template, serverEntry] = await Promise.all([
    readFile(htmlPath, 'utf8'),
    import(pathToFileURL(serverEntryPath).href),
  ]);

  if (!template.includes('<!--app-html-->')) {
    throw new Error('The prerender root marker is missing from dist/index.html.');
  }

  await writeFile(htmlPath, template.replace('<!--app-html-->', serverEntry.render()), 'utf8');
} finally {
  await rm(serverOutputDirectory, { recursive: true, force: true });
}
