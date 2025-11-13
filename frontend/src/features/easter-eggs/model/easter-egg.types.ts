/**
 * 이스터에그 타입 정의
 */

export type TriggerType = 'exact' | 'regex' | 'hashtag';

export interface EasterEggTrigger {
  /** 이스터에그 고유 ID */
  id: string;
  /** 트리거 타입 */
  type: TriggerType;
  /** 매칭할 문구 (exact: 정확한 문자열, regex: 정규식, hashtag: 해시태그) */
  pattern: string;
  /** 대소문자 구분 여부 (기본값: false) */
  caseSensitive?: boolean;
  /** 이스터에그 이름 */
  name: string;
  /** 설명 */
  description?: string;
  /** 활성화 여부 */
  enabled?: boolean;
  /** 메시지 전송 차단 여부 (기본값: true, 이스터에그 전용 문구는 챗봇으로 전송하지 않음) */
  blockMessage?: boolean;
}

export interface EasterEggContext {
  /** 트리거된 메시지 */
  message: string;
  /** 트리거된 시간 */
  timestamp: Date;
  /** 추가 컨텍스트 데이터 */
  metadata?: Record<string, unknown>;
}

export interface ActiveEasterEgg {
  /** 이스터에그 ID */
  id: string;
  /** 트리거 컨텍스트 */
  context: EasterEggContext;
  /** 시작 시간 */
  startTime: Date;
  /** z-index */
  zIndex?: number;
}

export interface EasterEggState {
  /** 활성화된 이스터에그 목록 */
  activeEffects: ActiveEasterEgg[];
  /** 최대 동시 실행 가능한 이스터에그 수 */
  maxConcurrent: number;
  /** 이스터에그가 활성화되어 있는지 여부 */
  isEnabled: boolean;
}

export interface EasterEggEffect {
  /** 이펙트 ID */
  id: string;
  /** 이펙트 컴포넌트 또는 렌더링 함수 */
  component: React.ComponentType<{ context: EasterEggContext; onClose: () => void }>;
  /** 이펙트 지속 시간 (ms, 0이면 수동 종료만 가능) */
  duration?: number;
  /** z-index */
  zIndex?: number;
  /** 이펙트가 무거운지 여부 (lazy loading 여부) */
  isHeavy?: boolean;
}

