import { demonSlayerTheme } from '@/shared/config/theme';
import type { DemonSlayerColors } from './types';

export const CARD_WIDTH = 280;
export const CARD_HEIGHT = 360;
export const EFFECT_DURATION_MS = 30000;
export const FADE_OUT_DELAY_MS = 1000;
export const HEADER_GLOW_DURATION_MS = 300;
export const SLIDE_ANIMATION_DURATION_MS = 10000;
export const SLIDE_ANIMATION_MAX_OFFSET = 50;
export const CARD_REMOVAL_OFFSET = 200;
export const MAIN_FADE_TRANSITION = 'opacity 1s ease-out';
export const MAIN_CLIP_TRANSITION = 'clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out';
export const CLIP_PATH_RESET_DELAY_MS = 500;

export const getDemonSlayerColors = (): DemonSlayerColors => {
  return {
    surface: demonSlayerTheme.surface,
    surfaceElevated: demonSlayerTheme.surfaceElevated,
    textPrimary: demonSlayerTheme.textPrimary,
    textSecondary: demonSlayerTheme.textSecondary,
    textMuted: demonSlayerTheme.textMuted,
    border: demonSlayerTheme.border,
    imageBgStart: '#3d2a1a',
    imageBgEnd: '#2a1f1f',
    glowColor: 'rgba(255, 179, 102, 0.3)',
  };
};
