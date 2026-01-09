import React from 'react';
import type { EasterEggTrigger, EasterEggEffect, EasterEggResource, TriggerType } from '../model/easter-egg.types';
import easterEggConfig from './easterEggConfig.json';

// 명시적 import로 Vite가 모든 컴포넌트를 번들에 포함하도록 함
import {
  MatrixEffect,
  DemonSlayerEffect,
  ConfettiEffect,
  GiantBlockEffect,
  VideoEffect,
  AudioEffect,
} from '../effects';

/**
 * JSON 설정 파일의 Trigger 인터페이스
 */
interface ConfigTrigger {
  id: string;
  type: string;
  pattern: string;
  caseSensitive?: boolean;
  name: string;
  hint?: string;
  triggerDescription?: string;
  description?: string;
  enabled?: boolean;
  blockMessage?: boolean;
}

/**
 * JSON 설정 파일의 Effect 인터페이스
 */
interface ConfigEffect {
  id: string;
  componentPath: string;
  duration?: number | null;
  zIndex?: number;
  isHeavy?: boolean;
  resources?: EasterEggResource[];
  alwaysEnabled?: boolean;
  config?: Record<string, unknown>;
}

/**
 * 컴포넌트 경로와 실제 컴포넌트를 매핑하는 맵
 * 프로덕션 빌드에서 동적 import가 제대로 작동하도록 명시적으로 정의
 */
const componentMap: Record<string, React.ComponentType<any>> = {
  'effects/matrix/MatrixEffect': MatrixEffect,
  'effects/demon-slayer/DemonSlayerEffect': DemonSlayerEffect,
  'effects/confetti/ConfettiEffect': ConfettiEffect,
  'effects/giant-block/GiantBlockEffect': GiantBlockEffect,
  'effects/video/VideoEffect': VideoEffect,
  'effects/audio/AudioEffect': AudioEffect,
};

/**
 * 컴포넌트를 로드하는 함수
 * 명시적 맵을 사용하여 프로덕션 빌드에서도 안정적으로 작동
 * 동적 import를 사용하지 않으므로 동기 함수로 변경 (MIME 타입 오류 방지)
 */
function loadEffectComponent(componentPath: string): React.ComponentType<any> {
  // 명시적 맵에서 컴포넌트 찾기
  const component = componentMap[componentPath];
  
  if (!component) {
    throw new Error(`Component not found: ${componentPath}. Available paths: ${Object.keys(componentMap).join(', ')}`);
  }
  
  return component;
}

/**
 * JSON 설정을 TypeScript 타입으로 변환
 * 동적 import를 사용하지 않으므로 동기 함수로 변경
 */
export function loadEasterEggConfig(): {
  triggers: EasterEggTrigger[];
  effects: EasterEggEffect[];
} {
  const triggers: EasterEggTrigger[] = (easterEggConfig.triggers as ConfigTrigger[]).map(trigger => ({
    ...trigger,
    type: trigger.type as TriggerType,
    enabled: trigger.enabled ?? true,
    caseSensitive: trigger.caseSensitive ?? false,
  }));

  // 이펙트 컴포넌트를 로드 (동적 import 없이 명시적 맵 사용)
  const effects = (easterEggConfig.effects as ConfigEffect[]).map((configEffect) => {
    const component = loadEffectComponent(configEffect.componentPath);
    
    return {
      id: configEffect.id,
      component,
      duration: configEffect.duration ?? undefined,
      zIndex: configEffect.zIndex,
      isHeavy: configEffect.isHeavy ?? false,
      resources: configEffect.resources || [],
      alwaysEnabled: configEffect.alwaysEnabled ?? false,
      config: configEffect.config,
    } as EasterEggEffect;
  });

  return { triggers, effects };
}

/**
 * 동기적으로 트리거만 로드 (컴포넌트 로드 없이)
 */
export function loadTriggersSync(): EasterEggTrigger[] {
  return (easterEggConfig.triggers as ConfigTrigger[]).map(trigger => ({
    ...trigger,
    type: trigger.type as TriggerType,
    enabled: trigger.enabled ?? true,
    caseSensitive: trigger.caseSensitive ?? false,
  }));
}

