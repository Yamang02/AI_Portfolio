/**
 * 프로덕션에서 배포 직후 발생하는 "청크 로드 실패" 복구
 *
 * 원인: 예전 index.html이 참조하는 예전 청크 URL 요청 → 404 → 서버가 index.html 반환 → MIME 오류
 * 대응: 청크/모듈 로드 실패 감지 시 세션당 1회만 전체 새로고침하여 최신 HTML·청크 로드
 */

const CHUNK_RELOAD_KEY = 'chunk-error-reload-v1';

function isChunkLoadError(message: string): boolean {
  const s = message.toLowerCase();
  return (
    s.includes('loading chunk') ||
    s.includes('failed to fetch dynamically imported module') ||
    s.includes('importing a module script failed') ||
    s.includes('error loading dynamically imported module') ||
    (s.includes('mime') && s.includes('text/html')) ||
    s.includes('failed to load module script')
  );
}

function tryRecoverByReload(): boolean {
  try {
    if (typeof sessionStorage === 'undefined') return false;
    const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
    if (alreadyReloaded) return false;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
    globalThis.location.reload();
    return true;
  } catch {
    return false;
  }
}

/**
 * 전역 리스너 등록: 동적 import 실패 시 1회 새로고침 시도
 */
function registerChunkLoadErrorRecovery(): void {
  globalThis.addEventListener('unhandledrejection', (event) => {
    const message =
      typeof event.reason === 'string'
        ? event.reason
        : event.reason?.message ?? String(event.reason ?? '');
    if (!isChunkLoadError(message)) return;
    if (tryRecoverByReload()) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  globalThis.addEventListener('error', (event) => {
    if (event.type !== 'error' || !event.message) return;
    if (!isChunkLoadError(event.message)) return;
    if (tryRecoverByReload()) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

export { registerChunkLoadErrorRecovery };
