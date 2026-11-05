import { defineConfig } from 'vite';
import type { IndexHtmlTransformContext, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import englishContent from './src/content/content.en.json' with { type: 'json' };
import koreanContent from './src/content/content.ko.json' with { type: 'json' };

function profileDevelopmentTitle(): Plugin {
  return {
    name: 'profile-development-title',
    apply: 'serve',
    transformIndexHtml(html: string, context: IndexHtmlTransformContext) {
      const pathname = new URL(context.originalUrl ?? context.path, 'http://localhost').pathname;
      const title = pathname === '/en' || pathname.startsWith('/en/')
        ? englishContent.metadata.title
        : koreanContent.metadata.title;
      const escapedTitle = title.replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!);

      return html.replace('<title>__PROFILE_TITLE__</title>', `<title>${escapedTitle}</title>`);
    },
  };
}

export default defineConfig({
  plugins: [profileDevelopmentTitle(), react(), tailwindcss()],
  server: {
    port: 3002,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: filePath => filePath.replaceAll('\\', '/').includes('/src/assets/opening/') ? false : undefined,
  },
});
