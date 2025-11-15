import type { EasterEggTrigger } from '../model/easter-egg.types';

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
];

