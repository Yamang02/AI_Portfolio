import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

  const routes = [
    { locale: 'ko', path: '/', output: htmlPath },
    { locale: 'en', path: '/en/', output: join(outputDirectory, 'en', 'index.html') },
  ];
  const siteOrigin = 'https://www.yamang02.com';

  for (const route of routes) {
    const metadata = serverEntry.getMetadata(route.locale);
    const canonicalUrl = siteOrigin + route.path;
    const alternateLinks = [
      ['ko', siteOrigin + '/'],
      ['en', siteOrigin + '/en/'],
      ['x-default', siteOrigin + '/'],
    ].map(([language, href]) => `<link rel="alternate" hreflang="${language}" href="${href}" />`).join('\n');
    const replacements = {
      __PROFILE_LANG__: route.locale,
      __PROFILE_TITLE__: metadata.title,
      __PROFILE_DESCRIPTION__: metadata.description,
      __PROFILE_AUTHOR__: metadata.author,
      __PROFILE_CANONICAL__: canonicalUrl,
      __PROFILE_OG_URL__: canonicalUrl,
      __PROFILE_OG_TITLE__: metadata.ogTitle,
      __PROFILE_OG_DESCRIPTION__: metadata.description,
      __PROFILE_OG_LOCALE__: metadata.ogLocale,
      __PROFILE_TWITTER_TITLE__: metadata.ogTitle,
      __PROFILE_TWITTER_DESCRIPTION__: metadata.description,
    };
    const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]);
    let html = template.replace('<!--app-html-->', serverEntry.render(route.locale));
    html = html.replace('<!--profile-hreflang-->', alternateLinks);

    for (const [placeholder, value] of Object.entries(replacements)) {
      html = html.replaceAll(placeholder, escapeHtml(value));
    }

    if (/__PROFILE_[A-Z_]+__|<!--(?:app-html|profile-hreflang)-->/u.test(html)) {
      throw new Error(`The ${route.locale} prerender output contains an unresolved template marker.`);
    }

    await mkdir(dirname(route.output), { recursive: true });
    await writeFile(route.output, html, 'utf8');
  }
} finally {
  await rm(serverOutputDirectory, { recursive: true, force: true });
}
