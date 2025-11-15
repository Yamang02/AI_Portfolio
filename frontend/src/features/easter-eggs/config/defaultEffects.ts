import type { EasterEggEffect } from '../model/easter-egg.types';
import { ConfettiEffect } from '../effects/confetti/ConfettiEffect';
import { GiantBlockEffect } from '../effects/giant-block/GiantBlockEffect';

export const defaultEffects: EasterEggEffect[] = [
  {
    id: 'confetti-celebration',
    component: ConfettiEffect,
    duration: 3000,
    zIndex: 1000,
    isHeavy: false,
  },
  {
    id: 'confetti-celebration-2',
    component: ConfettiEffect,
    duration: 3000,
    zIndex: 1000,
    isHeavy: false,
  },
  {
    id: 'name-click-5',
    component: GiantBlockEffect,
    duration: 0,
    zIndex: 1000,
    isHeavy: false,
  },
];

