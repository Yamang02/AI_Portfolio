/**
 * 오디오 비트 감지 유틸리티
 * Web Audio API를 사용하여 오디오의 비트를 감지합니다.
 */

const ENERGY_HISTORY_SIZE = 20;
const MIN_ENERGY_HISTORY = 10;
const BEAT_COOLDOWN_MS = 350;
const BASE_THRESHOLD_MULTIPLIER = 1.4;
const RELAXED_THRESHOLD_MULTIPLIER = 1.25;
const RELAXED_THRESHOLD_DELAY_MS = 600;

export interface BeatDetectorConfig {
  analyser: AnalyserNode;
  onBeatDetected: () => void;
}

export class BeatDetector {
  private analyser: AnalyserNode;
  private onBeatDetected: () => void;
  private animationFrameRef: number | undefined;
  private lastBeatTimeRef: number = 0;
  private energyHistoryRef: number[] = [];
  private isRunning: boolean = false;

  constructor(config: BeatDetectorConfig) {
    this.analyser = config.analyser;
    this.onBeatDetected = config.onBeatDetected;
  }

  private detectBeat(energy: number) {
    if (this.energyHistoryRef.length < MIN_ENERGY_HISTORY) return;

    const historyLength = this.energyHistoryRef.length;
    
    // 가중 평균 계산 (최근 값에 더 높은 가중치)
    let weightedSum = 0;
    let weightSum = 0;
    
    this.energyHistoryRef.forEach((value, index) => {
      // 최근 5개 값은 2배 가중치, 나머지는 1배
      const weight = index >= historyLength - 5 ? 2 : 1;
      weightedSum += value * weight;
      weightSum += weight;
    });
    
    const avgEnergy = weightedSum / weightSum;
    
    const currentTime = Date.now();
    const timeSinceLastBeat = currentTime - this.lastBeatTimeRef;
    
    // 동적 임계값: 마지막 비트 후 시간이 길수록 임계값을 낮춰서 약한 비트도 감지
    const baseThreshold = avgEnergy * BASE_THRESHOLD_MULTIPLIER;
    const relaxedThreshold = avgEnergy * RELAXED_THRESHOLD_MULTIPLIER;
    
    // relaxed threshold 사용 조건
    const useRelaxed = timeSinceLastBeat > RELAXED_THRESHOLD_DELAY_MS 
      && avgEnergy > 8
      && energy > avgEnergy * 1.15;
    
    const threshold = useRelaxed ? relaxedThreshold : baseThreshold;

    // 비트 감지: 최소 간격 350ms 이상 경과 시 감지
    if (energy > threshold && timeSinceLastBeat > BEAT_COOLDOWN_MS) {
      this.lastBeatTimeRef = currentTime;
      this.onBeatDetected();
    }
  }

  private analyzeAudio = () => {
    if (!this.isRunning) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // 평균 에너지 계산
    const energy = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

    // 에너지 히스토리 관리
    this.energyHistoryRef.push(energy);
    if (this.energyHistoryRef.length > ENERGY_HISTORY_SIZE) {
      this.energyHistoryRef.shift();
    }

    this.detectBeat(energy);

    this.animationFrameRef = requestAnimationFrame(this.analyzeAudio);
  };

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.energyHistoryRef = [];
    this.lastBeatTimeRef = 0;
    this.analyzeAudio();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameRef !== undefined) {
      cancelAnimationFrame(this.animationFrameRef);
      this.animationFrameRef = undefined;
    }
  }

  destroy() {
    this.stop();
  }
}

