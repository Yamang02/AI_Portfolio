import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
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
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // 청크 크기 경고 임계값 상향 (기본 500kB -> 1000kB)
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          onwarn(warning, warn) {
            // "use client" 지시문 경고 무시
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
              return;
            }
            warn(warning);
          },
          output: {
            // 청크 분리 최적화
            manualChunks: (id) => {
              // React 관련 라이브러리
              if (id.includes('node_modules/react') ||
                  id.includes('node_modules/react-dom') ||
                  id.includes('node_modules/react-router-dom')) {
                return 'react-vendor';
              }

              // Ant Design UI 라이브러리
              if (id.includes('node_modules/antd') ||
                  id.includes('node_modules/@ant-design')) {
                return 'antd-vendor';
              }

              // React Query
              if (id.includes('node_modules/@tanstack/react-query')) {
                return 'react-query-vendor';
              }

              // 마크다운 생태계 전체를 하나의 청크로 통합
              // unified, remark, rehype, unist, react-markdown, md-editor, highlight 모두 포함
              if (id.includes('node_modules/react-markdown') ||
                  id.includes('node_modules/@uiw/react-md-editor') ||
                  id.includes('node_modules/remark-') ||
                  id.includes('node_modules/rehype-') ||
                  id.includes('node_modules/unified') ||
                  id.includes('node_modules/unist-') ||
                  id.includes('node_modules/micromark') ||
                  id.includes('node_modules/mdast') ||
                  id.includes('node_modules/hast') ||
                  id.includes('node_modules/highlight.js') ||
                  id.includes('node_modules/lowlight')) {
                return 'markdown-vendor';
              }

              // 나머지 node_modules는 공통 vendor로
              if (id.includes('node_modules')) {
                return 'common-vendor';
              }
            }
          }
        }
      }
    };
});
