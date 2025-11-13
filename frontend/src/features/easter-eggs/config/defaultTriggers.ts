/**
 * 기본 이스터에그 트리거 정의
 */

import type { EasterEggTrigger } from '../model/easter-egg.types';

/**
 * 기본 트리거 목록
 * 여기에 새로운 이스터에그 트리거를 추가할 수 있습니다.
 */
export const defaultTriggers: EasterEggTrigger[] = [
  {
    id: 'confetti-celebration',
    type: 'exact',
    pattern: '축하해',
    name: '축하 컨페티',
    description: '"축하해"를 입력하면 컨페티가 터집니다',
    enabled: true,
    caseSensitive: false,
  },
  {
    id: 'confetti-celebration-2',
    type: 'regex',
    pattern: '(축하|축하해|축하합니다|축하해요)',
    name: '축하 컨페티 (정규식)',
    description: '축하 관련 문구를 입력하면 컨페티가 터집니다',
    enabled: true,
    caseSensitive: false,
  },
  // 추가 트리거 예시:
  // {
  //   id: 'matrix-rain',
  //   type: 'hashtag',
  //   pattern: 'matrix',
  //   name: '매트릭스 레인',
  //   description: '#matrix를 입력하면 매트릭스 레인이 시작됩니다',
  //   enabled: true,
  // },
];

