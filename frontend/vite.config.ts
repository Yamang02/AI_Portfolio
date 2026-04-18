import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import Sitemap from 'vite-plugin-sitemap';

function getSitemapRoutes(): string[] {
  const p = path.resolve(__dirname, 'sitemap-routes.json');
  if (!fs.existsSync(p)) return [];
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const siteUrl = env.VITE_SITE_URL || 'https://portfolio.yamang02.com';
    return {
      plugins: [
        {
          name: 'admin-html-spa-fallback',
          configureServer(server) {
            server.middlewares.use((req, _res, next) => {
              const raw = req.url?.split('?')[0] ?? '';
              if (raw === '/admin' || raw.startsWith('/admin/')) {
                const last = raw.split('/').pop() ?? '';
                const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(last);
                if (!looksLikeFile) {
                  const q = req.url?.includes('?') ? `?${req.url!.split('?')[1]}` : '';
                  req.url = `/admin.html${q}`;
                }
              }
              next();
            });
          },
        },
        react(),
        Sitemap({
          hostname: siteUrl,
          dynamicRoutes: getSitemapRoutes(),
          exclude: ['/admin', '/admin/*'],
          changefreq: 'weekly',
          priority: 0.8,
          routes: {
            '/': { priority: 1.0, changefreq: 'weekly' },
            '/profile': { priority: 0.95, changefreq: 'weekly' },
            '/projects': { priority: 0.9, changefreq: 'weekly' },
            '/articles': { priority: 0.9, changefreq: 'daily' },
          },
        }),
        imagetools({
          defaultDirectives: (url) => {
            // 모든 이미지에 기본 최적화 적용
            if (url.searchParams.has('webp')) {
              return new URLSearchParams('format=webp;quality=80');
            }
            // 기본값: WebP 포맷, 품질 80%
            return new URLSearchParams('format=webp;quality=80');
          },
          // 확장자별 최적화 설정
          extendOutputFormats: (builtins) => {
            return {
              ...builtins,
              // WebP 포맷 추가
              webp: builtins.webp || builtins.jpeg,
            };
          },
        }),
      ],
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          port: 3001, // HMR WebSocket을 다른 포트로 분리
        },
        proxy: {
          '/api': {
            target: env.VITE_API_BASE_URL || 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
            ws: false, // 백엔드에 WebSocket 서버가 없으므로 false로 설정
            // 쿠키 전송을 위한 설정
            cookieDomainRewrite: '',
            cookiePathRewrite: '/',
            // 타임아웃 설정 (기본 30초 -> 60초)
            timeout: 60000,
            // 연결 유지 설정
            configure: (proxy, _options) => {
              proxy.on('error', (err, req, res) => {
                console.error('❌ 프록시 오류 발생:', {
                  url: req.url,
                  method: req.method,
                  error: err.message,
                  code: err.code,
                  hint: '백엔드 서버가 실행 중인지 확인하세요. (http://localhost:8080)'
                });
                if (!res.headersSent) {
                  res.writeHead(502, {
                    'Content-Type': 'application/json',
                  });
                  res.end(JSON.stringify({
                    success: false,
                    message: '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.',
                    error: err.message
                  }));
                }
              });
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                console.log('📤 프록시 요청:', req.method, req.url, '→', _options.target);
              });
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                console.log('📥 프록시 응답:', proxyRes.statusCode, req.url);
              });
            },
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@main': path.resolve(__dirname, './src/main'),
          '@admin': path.resolve(__dirname, './src/admin'),
          '@shared': path.resolve(__dirname, './src/shared'),
          '@design-system': path.resolve(__dirname, './src/design-system'),
        }
      },
      build: {
        // 청크 크기 경고 임계값 (기본 500kB)
        chunkSizeWarningLimit: 500,
        // .htaccess 파일을 dist에 복사
        copyPublicDir: true,
        // 동적 import를 위한 상대 경로 설정
        assetsDir: 'assets',
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            admin: path.resolve(__dirname, 'admin.html'),
          },
          onwarn(warning, warn) {
            // "use client" 지시문 경고 무시
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
              return;
            }
            warn(warning);
          },
          output: {
            // 청크 분리 최적화: 큰 라이브러리들을 별도 청크로 분리
            manualChunks: (id) => {
              // node_modules 분리
              if (id.includes('node_modules')) {
                // React 코어는 vendor에 포함 (다른 청크들이 의존)
                if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
                  return 'vendor';
                }
                // 큰 라이브러리들을 별도 청크로 분리
                if (id.includes('@tanstack/react-query')) {
                  return 'react-query';
                }
                // react-router는 vendor에 포함 (React와 함께 로드되어야 함)
                if (id.includes('react-router')) {
                  return 'vendor';
                }
                if (id.includes('@uiw/react-md-editor') || id.includes('react-markdown') || id.includes('@uiw/react-markdown-preview')) {
                  return 'markdown-editor';
                }
                if (id.includes('antd')) {
                  return 'antd';
                }
                if (id.includes('highlight.js')) {
                  return 'highlight';
                }
                // 나머지 node_modules는 vendor 청크로
                return 'vendor';
              }
            }
          }
        }
      }
    };
});
