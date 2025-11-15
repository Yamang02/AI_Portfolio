import React from 'react';
import type { EasterEggTrigger, EasterEggEffect, EasterEggResource } from '../model/easter-egg.types';
import easterEggConfig from './easterEggConfig.json';

/**
 * JSON 설정 파일의 Effect 인터페이스
 */
interface ConfigEffect {
  id: string;
  componentPath: string;
  duration?: number;
  zIndex?: number;
  isHeavy?: boolean;
  resources?: EasterEggResource[];
  alwaysEnabled?: boolean;
}

/**
 * 동적으로 컴포넌트를 로드하는 함수
 */
async function loadEffectComponent(componentPath: string): Promise<React.ComponentType<any>> {
  try {
    // 동적 import를 사용하여 컴포넌트 로드
    const module = await import(`../${componentPath}`);
    
    // 컴포넌트가 default export인지 named export인지 확인
    return module.default || module[Object.keys(module)[0]];
  } catch (error) {
    console.error(`Failed to load effect component: ${componentPath}`, error);
    throw error;
  }
}

/**
 * JSON 설정을 TypeScript 타입으로 변환
 */
export async function loadEasterEggConfig(): Promise<{
  triggers: EasterEggTrigger[];
  effects: EasterEggEffect[];
}> {
  const triggers: EasterEggTrigger[] = easterEggConfig.triggers.map(trigger => ({
    ...trigger,
    enabled: trigger.enabled ?? true,
    caseSensitive: trigger.caseSensitive ?? false,
  }));

  // 이펙트 컴포넌트를 동적으로 로드
  const effectsPromises = easterEggConfig.effects.map(async (configEffect: ConfigEffect) => {
    const component = await loadEffectComponent(configEffect.componentPath);
    
    return {
      id: configEffect.id,
      component,
      duration: configEffect.duration,
      zIndex: configEffect.zIndex,
      isHeavy: configEffect.isHeavy ?? false,
      resources: configEffect.resources || [],
      alwaysEnabled: configEffect.alwaysEnabled ?? false,
    } as EasterEggEffect;
  });

  const effects = await Promise.all(effectsPromises);

  return { triggers, effects };
}

/**
 * 동기적으로 트리거만 로드 (컴포넌트 로드 없이)
 */
export function loadTriggersSync(): EasterEggTrigger[] {
  return easterEggConfig.triggers.map(trigger => ({
    ...trigger,
    enabled: trigger.enabled ?? true,
    caseSensitive: trigger.caseSensitive ?? false,
  }));
}

