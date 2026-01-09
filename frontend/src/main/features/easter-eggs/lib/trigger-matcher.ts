import type { EasterEggTrigger } from '../model/easter-egg.types';

export function matchTrigger(message: string, trigger: EasterEggTrigger): boolean {
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
      const hashtagPattern = new RegExp(`#${normalizedPattern.replace(/^#/, '')}\\b`, 'i');
      return hashtagPattern.test(message);
    }

    default:
      return false;
  }
}

export function findMatchingTriggers(
  message: string,
  triggers: EasterEggTrigger[]
): EasterEggTrigger[] {
  return triggers.filter(trigger => matchTrigger(message, trigger));
}

