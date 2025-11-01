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
            // 청크 분리 최적화: 의존성 문제를 피하기 위해 단순화
            manualChunks: (id) => {
              // node_modules의 모든 라이브러리를 하나의 vendor 청크로
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            }
          }
        }
      }
    };
});
