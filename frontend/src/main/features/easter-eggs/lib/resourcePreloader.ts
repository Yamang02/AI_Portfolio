import type { EasterEggResource } from '../model/easter-egg.types';

/**
 * 리소스 프리로딩 상태
 */
export interface PreloadStatus {
  total: number;
  loaded: number;
  failed: number;
  isComplete: boolean;
  errors: Array<{ resource: string; error: Error }>;
  failedResources: string[];
}

/**
 * 리소스 프리로더 클래스
 * 이스터에그 모드 활성화 시 백그라운드에서 리소스를 미리 로드합니다.
 */
export class ResourcePreloader {
  private preloadedResources = new Map<string, HTMLMediaElement | HTMLImageElement>();
  private preloadPromises = new Map<string, Promise<void>>();
  private status: PreloadStatus = {
    total: 0,
    loaded: 0,
    failed: 0,
    isComplete: false,
    errors: [],
    failedResources: [],
  };

  /**
   * 비디오 리소스 프리로드
   */
  private preloadVideo(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true; // 자동 재생 정책을 위해 음소거

      const handleCanPlayThrough = () => {
        this.preloadedResources.set(path, video);
        cleanup();
        resolve();
      };

      const handleError = () => {
        const error = new Error(`Failed to preload video: ${path}`);
        this.status.errors.push({ resource: path, error });
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        video.removeEventListener('error', handleError);
      };

      video.addEventListener('canplaythrough', handleCanPlayThrough);
      video.addEventListener('error', handleError);
      video.src = path;
      video.load();
    });
  }

  /**
   * 오디오 리소스 프리로드
   */
  private preloadAudio(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio');
      audio.preload = 'auto';

      const handleCanPlayThrough = () => {
        this.preloadedResources.set(path, audio);
        cleanup();
        resolve();
      };

      const handleError = () => {
        const error = new Error(`Failed to preload audio: ${path}`);
        this.status.errors.push({ resource: path, error });
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('error', handleError);
      };

      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('error', handleError);
      audio.src = path;
      audio.load();
    });
  }

  /**
   * 이미지 리소스 프리로드
   */
  private preloadImage(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.preloadedResources.set(path, img);
        resolve();
      };

      img.onerror = () => {
        const error = new Error(`Failed to preload image: ${path}`);
        this.status.errors.push({ resource: path, error });
        reject(error);
      };

      img.src = path;
    });
  }

  /**
   * 단일 리소스 프리로드
   */
  private async preloadResource(resource: EasterEggResource): Promise<void> {
    const { type, path, preload } = resource;

    // preload가 false이면 스킵
    if (preload === false) {
      return;
    }

    // 이미 프리로드 중이면 기존 Promise 반환
    if (this.preloadPromises.has(path)) {
      return this.preloadPromises.get(path);
    }

    // 이미 프리로드 완료된 경우
    if (this.preloadedResources.has(path)) {
      return Promise.resolve();
    }

    let promise: Promise<void>;

    try {
      switch (type) {
        case 'video':
          promise = this.preloadVideo(path);
          break;
        case 'audio':
          promise = this.preloadAudio(path);
          break;
        case 'image':
          promise = this.preloadImage(path);
          break;
        default:
          console.warn(`Unknown resource type: ${type}`);
          return Promise.resolve();
      }

      this.preloadPromises.set(path, promise);

      await promise;
      this.status.loaded++;
    } catch (error) {
      this.status.failed++;
      console.error(`Failed to preload ${type}: ${path}`, error);
      // 에러가 발생해도 다른 리소스 로딩은 계속 진행
    } finally {
      this.preloadPromises.delete(path);
    }
  }

  /**
   * 여러 리소스를 백그라운드에서 프리로드
   */
  async preloadResources(resources: EasterEggResource[]): Promise<PreloadStatus> {
    const resourcesToPreload = resources.filter(r => r.preload !== false);

    this.status = {
      total: resourcesToPreload.length,
      loaded: 0,
      failed: 0,
      isComplete: false,
      errors: [],
      failedResources: [],
    };

    if (resourcesToPreload.length === 0) {
      this.status.isComplete = true;
      return this.status;
    }

    // 모든 리소스를 병렬로 프리로드 (에러가 발생해도 계속 진행)
    await Promise.allSettled(
      resourcesToPreload.map(resource => this.preloadResource(resource))
    );

    this.status.isComplete = true;
    this.status.failedResources = this.status.errors.map(e => e.resource);
    return this.status;
  }

  /**
   * 프리로드된 리소스 가져오기
   */
  getPreloadedResource(path: string): HTMLMediaElement | HTMLImageElement | undefined {
    return this.preloadedResources.get(path);
  }

  /**
   * 특정 리소스가 프리로드되었는지 확인
   */
  isPreloaded(path: string): boolean {
    return this.preloadedResources.has(path);
  }

  /**
   * 현재 프리로드 상태 가져오기
   */
  getStatus(): PreloadStatus {
    return { ...this.status };
  }

  /**
   * 프리로드된 모든 리소스 해제
   */
  clear(): void {
    // 비디오와 오디오 요소는 명시적으로 정리
    this.preloadedResources.forEach((element, path) => {
      if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
        element.pause();
        element.src = '';
        element.load();
      }
    });

    this.preloadedResources.clear();
    this.preloadPromises.clear();

    this.status = {
      total: 0,
      loaded: 0,
      failed: 0,
      isComplete: false,
      errors: [],
      failedResources: [],
    };
  }

  /**
   * 프리로드 진행률 (0-100)
   */
  getProgress(): number {
    if (this.status.total === 0) return 100;
    return Math.round((this.status.loaded / this.status.total) * 100);
  }

  /**
   * 설정 파일에서 리소스 목록 로드
   * 프로덕션 빌드에서도 작동하도록 import된 JSON 사용
   */
  private async loadConfig(): Promise<{ effects: Array<{ resources?: EasterEggResource[] }> }> {
    try {
      // 동적 import로 JSON 파일을 로드 (Vite가 번들에 포함)
      const config = await import('../config/easterEggConfig.json');
      return config.default || config;
    } catch (error) {
      console.error('Failed to load config:', error);
      return { effects: [] };
    }
  }

  /**
   * 모든 리소스 프리로드 (설정 파일 기반)
   */
  async preloadAll(): Promise<PreloadStatus> {
    const config = await this.loadConfig();

    // effects에서 모든 리소스를 추출
    const allResources: EasterEggResource[] = [];
    config.effects.forEach(effect => {
      if (effect.resources) {
        allResources.push(...effect.resources);
      }
    });

    return this.preloadResources(allResources);
  }
}

// 싱글톤 인스턴스
export const resourcePreloader = new ResourcePreloader();
