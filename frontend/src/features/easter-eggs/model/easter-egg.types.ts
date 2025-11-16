export type TriggerType = 'exact' | 'regex' | 'hashtag';

export interface EasterEggTrigger {
  id: string;
  type: TriggerType;
  pattern: string;
  caseSensitive?: boolean;
  name: string;
  hint?: string; // 미발견 시 표시할 힌트
  triggerDescription?: string; // 발견 시 표시할 구체적인 트리거 조건
  description?: string; // 하위 호환성을 위한 필드 (deprecated: hint와 triggerDescription 사용 권장)
  enabled?: boolean;
  blockMessage?: boolean;
}

export interface EasterEggContext {
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ActiveEasterEgg {
  id: string;
  context: EasterEggContext;
  startTime: Date;
  zIndex?: number;
}

export interface EasterEggState {
  activeEffects: ActiveEasterEgg[];
  maxConcurrent: number;
  isEnabled: boolean;
  isEasterEggMode: boolean;
}

export interface EasterEggResource {
  type: 'video' | 'audio' | 'image';
  path: string;
  preload?: boolean;
  loop?: boolean;
  volume?: number;
  [key: string]: unknown;
}

export interface EasterEggEffect {
  id: string;
  component: React.ComponentType<{ context: EasterEggContext; onClose: () => void; config?: Record<string, unknown> }>;
  duration?: number;
  zIndex?: number;
  isHeavy?: boolean;
  resources?: EasterEggResource[];
  alwaysEnabled?: boolean; // 이스터에그 모드 없이도 작동하는지 여부
  config?: Record<string, unknown>; // 이펙트별 설정
}

