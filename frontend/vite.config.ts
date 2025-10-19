import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: env.VITE_API_BASE_URL || 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
            ws: true,
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

              // 마크다운 관련 (에디터, 렌더러, 플러그인)
              if (id.includes('node_modules/react-markdown') ||
                  id.includes('node_modules/@uiw/react-md-editor') ||
                  id.includes('node_modules/remark-') ||
                  id.includes('node_modules/rehype-') ||
                  id.includes('node_modules/unified') ||
                  id.includes('node_modules/unist-util')) {
                return 'markdown-vendor';
              }

              // 코드 하이라이팅
              if (id.includes('node_modules/highlight.js')) {
                return 'highlight-vendor';
              }

              // React Query
              if (id.includes('node_modules/@tanstack/react-query')) {
                return 'react-query-vendor';
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
