import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({
  root: fileURLToPath(new URL('../../', import.meta.url)),
  logLevel: 'silent',
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: 'custom',
});
try {
  const [modulePath, exportName, contentPath] = process.argv.slice(2);
  const module = await server.ssrLoadModule(modulePath);
  const { getProfileContent } = await server.ssrLoadModule('/src/content/index.ts');
  const profileContent = getProfileContent('ko');
  const content = contentPath?.split('.').reduce((value, key) => value[key], profileContent);
  const props = { locale: 'ko', onOpenContact() {} };
  if (content) Object.assign(props, { content });
  process.stdout.write(renderToString(createElement(module[exportName], props)));
} finally {
  await server.close();
}
