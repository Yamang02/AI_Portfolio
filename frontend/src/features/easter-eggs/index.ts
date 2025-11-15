/**
 * 이스터에그 기능 내보내기
 */

// Components
export { EasterEggLayer } from './components/EasterEggLayer';
export { EasterEggListPanel } from './components/EasterEggListPanel';
export { EasterEggProvider } from './store/easterEggStore';

// Hooks
export { useEasterEggTrigger, useEasterEggEscapeKey } from './hooks/useEasterEggTrigger';
export { useClickCounter } from './hooks/useClickCounter';
export { useEasterEggStore } from './store/easterEggStore';

// Registry
export { easterEggRegistry } from './registry/easterEggRegistry';

// Types
export type {
  EasterEggTrigger,
  EasterEggContext,
  ActiveEasterEgg,
  EasterEggState,
  EasterEggEffect,
  TriggerType,
} from './model/easter-egg.types';

// Config
export { defaultTriggers } from './config/defaultTriggers';
export { defaultEffects } from './config/defaultEffects';

// Utils
export { matchTrigger, findMatchingTriggers } from './lib/trigger-matcher';
export { debounce } from './lib/debounce';
export { checkEasterEggTrigger, triggerEasterEggs } from './lib/easter-egg-utils';

