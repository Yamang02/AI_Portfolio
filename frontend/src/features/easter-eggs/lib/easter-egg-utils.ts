import { easterEggRegistry } from '../registry/easterEggRegistry';
import { findMatchingTriggers } from './trigger-matcher';
import type { EasterEggContext, EasterEggTrigger } from '../model/easter-egg.types';

export function checkEasterEggTrigger(
  message: string,
  isEasterEggMode: boolean = false
): {
  shouldBlock: boolean;
  triggers: EasterEggTrigger[];
} {
  const triggers = easterEggRegistry.getEnabledTriggers();
  const matchingTriggers = findMatchingTriggers(message, triggers);
  
  if (matchingTriggers.length === 0) {
    return { shouldBlock: false, triggers: [] };
  }
  
  if (!isEasterEggMode) {
    return { shouldBlock: false, triggers: [] };
  }
  
  const shouldBlock = matchingTriggers.some(
    trigger => trigger.blockMessage !== false
  );
  
  return { shouldBlock, triggers: matchingTriggers };
}

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

