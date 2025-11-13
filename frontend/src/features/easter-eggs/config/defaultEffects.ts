/**
 * 기본 이스터에그 이펙트 정의
 */

import type { EasterEggEffect } from '../model/easter-egg.types';
import { ConfettiEffect } from '../effects/confetti/ConfettiEffect';

/**
 * 기본 이펙트 목록
 * 여기에 새로운 이스터에그 이펙트를 추가할 수 있습니다.
 */
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
  // 추가 이펙트 예시:
  // {
  //   id: 'matrix-rain',
  //   component: MatrixEffect,
  //   duration: 0, // 수동 종료만 가능
  //   zIndex: 1001,
  //   isHeavy: true, // WebGL 사용 시 true
  // },
];

