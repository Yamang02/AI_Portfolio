/**
 * 수동 비트 타이밍 감지 유틸리티
 * 미리 정의된 비트 타이밍 배열을 사용하여 정확한 시간에 비트를 감지합니다.
 */

const DEFAULT_TOLERANCE = 0.1; // 기본 100ms 허용 오차

export interface ManualBeatTimingConfig {
  beatTimings: number[];
  onBeatDetected: (beatTime: number) => void;
  tolerance?: number; // 허용 오차 (초 단위)
}

export class ManualBeatTimingDetector {
  private beatTimings: number[];
  private onBeatDetected: (beatTime: number) => void;
  private tolerance: number;
  private triggeredBeats: Set<number> = new Set();
  private animationFrameRef: number | undefined;
  private isRunning: boolean = false;
  private getCurrentTime: () => number;

  constructor(config: ManualBeatTimingConfig, getCurrentTime: () => number) {
    this.beatTimings = config.beatTimings;
    this.onBeatDetected = config.onBeatDetected;
    this.tolerance = config.tolerance ?? DEFAULT_TOLERANCE;
    this.getCurrentTime = getCurrentTime;
  }

  private checkBeatTimings = () => {
    if (!this.isRunning || this.beatTimings.length === 0) return;

    const currentTime = this.getCurrentTime();

    for (const beatTime of this.beatTimings) {
      // 이미 트리거된 비트는 건너뛰기
      if (this.triggeredBeats.has(beatTime)) continue;

      // 현재 시간이 비트 타이밍에 근접하면 트리거
      if (Math.abs(currentTime - beatTime) <= this.tolerance) {
        this.triggeredBeats.add(beatTime);
        this.onBeatDetected(beatTime);
        break; // 한 프레임에 하나의 비트만 트리거
      }
    }

    this.animationFrameRef = requestAnimationFrame(this.checkBeatTimings);
  };

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.triggeredBeats.clear();
    this.checkBeatTimings();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameRef !== undefined) {
      cancelAnimationFrame(this.animationFrameRef);
      this.animationFrameRef = undefined;
    }
  }

  reset() {
    this.triggeredBeats.clear();
  }

  destroy() {
    this.stop();
  }
}

