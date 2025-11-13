/**
 * 이스터에그 유틸리티 함수
 * 메시지가 이스터에그 트리거인지 확인하고, 챗봇으로 전송해야 하는지 판단
 */

import { easterEggRegistry } from '../registry/easterEggRegistry';
import { findMatchingTriggers } from './trigger-matcher';
import type { EasterEggContext, EasterEggTrigger } from '../model/easter-egg.types';

/**
 * 메시지가 이스터에그 트리거인지 확인하고, 챗봇 전송을 차단해야 하는지 반환
 */
export function checkEasterEggTrigger(message: string): {
  shouldBlock: boolean;
  triggers: EasterEggTrigger[];
} {
  const triggers = easterEggRegistry.getEnabledTriggers();
  const matchingTriggers = findMatchingTriggers(message, triggers);
  
  if (matchingTriggers.length === 0) {
    return { shouldBlock: false, triggers: [] };
  }
  
  // 하나라도 blockMessage가 false가 아니면 차단 (기본값: true)
  const shouldBlock = matchingTriggers.some(
    trigger => trigger.blockMessage !== false
  );
  
  return { shouldBlock, triggers: matchingTriggers };
}

/**
 * 이스터에그 트리거들을 실행하는 헬퍼 함수
 * 중복 코드를 제거하기 위한 유틸리티
 */
export function triggerEasterEggs(
  triggers: EasterEggTrigger[],
  message: string,
  triggerEasterEgg: (id: string, context: EasterEggContext) => void
): void {
  triggers.forEach(trigger => {
    triggerEasterEgg(trigger.id, {
      message,
      timestamp: new Date(),
      metadata: {
        triggerType: trigger.type,
        pattern: trigger.pattern,
      },
    });
  });
}

