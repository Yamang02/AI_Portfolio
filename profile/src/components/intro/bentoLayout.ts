import type { ProfileIntroRoleId } from '../../content/types';
import { introImageAssets } from './introAssets';

export interface BentoLayout {
  readonly x: number;
  readonly yLeft: number;
  readonly yRight: number;
}

const ACTIVE_SHORT_SIDE_PERCENT = 50;

export function getBentoLayout(activeId: ProfileIntroRoleId): BentoLayout {
  const ratio = introImageAssets[activeId].aspectRatio;
  const activeWidth = ratio >= 1
    ? ACTIVE_SHORT_SIDE_PERCENT * ratio
    : ACTIVE_SHORT_SIDE_PERCENT;
  const activeHeight = ratio >= 1
    ? ACTIVE_SHORT_SIDE_PERCENT
    : ACTIVE_SHORT_SIDE_PERCENT / ratio;

  switch (activeId) {
    case 'educator':
      return {
        x: activeWidth,
        yLeft: activeHeight,
        yRight: 68,
      };
    case 'developer':
      return {
        x: activeWidth,
        yLeft: 100 - activeHeight,
        yRight: 80,
      };
    case 'artist':
      return {
        x: 100 - activeWidth,
        yLeft: 32,
        yRight: 100 - activeHeight,
      };
    case 'entrepreneur':
      return {
        x: 100 - activeWidth,
        yLeft: 48,
        yRight: activeHeight,
      };
  }
}
