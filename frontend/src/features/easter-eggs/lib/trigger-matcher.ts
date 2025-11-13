/**
 * 트리거 매칭 로직
 */

import type { EasterEggTrigger } from '../model/easter-egg.types';

/**
 * 메시지가 트리거와 매칭되는지 확인
 */
export function matchTrigger(message: string, trigger: EasterEggTrigger): boolean {
  // enabled가 명시적으로 false이면 비활성화
  if (trigger.enabled === false) {
    return false;
  }

  const normalizedMessage = trigger.caseSensitive ? message : message.toLowerCase();
  const normalizedPattern = trigger.caseSensitive ? trigger.pattern : trigger.pattern.toLowerCase();

  switch (trigger.type) {
    case 'exact':
      return normalizedMessage === normalizedPattern;

    case 'regex': {
      try {
        const flags = trigger.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(trigger.pattern, flags);
        return regex.test(message);
      } catch (error) {
        console.error(`Invalid regex pattern: ${trigger.pattern}`, error);
        return false;
      }
    }

    case 'hashtag': {
      // 해시태그 매칭 (#pattern 또는 #pattern으로 시작하는 단어)
      const hashtagPattern = new RegExp(`#${normalizedPattern.replace(/^#/, '')}\\b`, 'i');
      return hashtagPattern.test(message);
    }

    default:
      return false;
  }
}

/**
 * 메시지에서 매칭되는 트리거 찾기
 */
export function findMatchingTriggers(
  message: string,
  triggers: EasterEggTrigger[]
): EasterEggTrigger[] {
  return triggers.filter(trigger => matchTrigger(message, trigger));
}

