import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
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
          '@shared': path.resolve(__dirname, './src/shared'),
          '@entities': path.resolve(__dirname, './src/entities'),
          '@features': path.resolve(__dirname, './src/features'),
          '@main': path.resolve(__dirname, './src/main'),
          '@widgets': path.resolve(__dirname, './src/widgets'),
          '@pages': path.resolve(__dirname, './src/pages'),
          '@processes': path.resolve(__dirname, './src/processes'),
          '@app': path.resolve(__dirname, './src/app'),
          '@design-system': path.resolve(__dirname, './src/design-system'),
        }
      },
      build: {
        // 청크 크기 경고 임계값 (기본 500kB)
        chunkSizeWarningLimit: 500,
        rollupOptions: {
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
                // 큰 라이브러리들을 별도 청크로 분리
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                if (id.includes('@tanstack/react-query')) {
                  return 'react-query';
                }
                if (id.includes('react-router')) {
                  return 'react-router';
                }
                if (id.includes('@uiw/react-md-editor') || id.includes('react-markdown')) {
                  return 'markdown-editor';
                }
                if (id.includes('antd')) {
                  return 'antd';
                }
                if (id.includes('framer-motion')) {
                  return 'framer-motion';
                }
                if (id.includes('mermaid')) {
                  return 'mermaid';
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
