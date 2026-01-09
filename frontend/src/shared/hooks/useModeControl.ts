import { useCallback } from 'react';
import { useEasterEggStore } from '@features/easter-eggs';

/**
 * 모드별 UI 통제를 위한 통합 훅
 * 
 * 이 훅은 이스터에그 모드와 일반 모드 간의 UI 동작 차이를
 * 구조적으로 처리하기 위한 유틸리티 함수들을 제공합니다.
 * 
 * @example
 * ```tsx
 * const { conditionalHandler, modeValue, modeClass } = useModeControl();
 * 
 * // 이벤트 핸들러 차단
 * const handleFocus = conditionalHandler(
 *   () => openChatbot(),
 *   { allowInEasterEggMode: false }
 * );
 * 
 * // 모드별 값 선택
 * const Component = modeValue(HistoryPanel, HistoryPanel);
 * 
 * // 모드별 클래스 선택
 * const className = modeClass('bg-primary-600', 'bg-yellow-500');
 * ```
 */
export const useModeControl = () => {
  const { isEasterEggMode } = useEasterEggStore();

  /**
   * 조건부 핸들러 생성
   * 모드에 따라 핸들러를 실행하거나 차단합니다.
   * 
   * @param handler - 원본 핸들러 함수
   * @param options - 옵션
   * @param options.allowInEasterEggMode - 이스터에그 모드에서도 실행 허용 여부
   * @returns 조건부 핸들러 함수
   */
  const conditionalHandler = useCallback(
    <T extends (...args: any[]) => any>(
      handler: T,
      options?: { allowInEasterEggMode?: boolean }
    ): T => {
      return ((...args: Parameters<T>) => {
        if (isEasterEggMode && !options?.allowInEasterEggMode) {
          return;
        }
        return handler(...args);
      }) as T;
    },
    [isEasterEggMode]
  );

  /**
   * 모드별 값 선택
   * 현재 모드에 따라 다른 값을 반환합니다.
   * 
   * @param normal - 일반 모드 값
   * @param easterEgg - 이스터에그 모드 값
   * @returns 현재 모드에 맞는 값
   */
  const modeValue = useCallback(
    <T,>(normal: T, easterEgg: T): T => {
      return isEasterEggMode ? easterEgg : normal;
    },
    [isEasterEggMode]
  );

  /**
   * 모드별 클래스 선택
   * 현재 모드에 따라 다른 CSS 클래스를 반환합니다.
   * 
   * @param normal - 일반 모드 클래스
   * @param easterEgg - 이스터에그 모드 클래스
   * @returns 현재 모드에 맞는 클래스
   */
  const modeClass = useCallback(
    (normal: string, easterEgg: string): string => {
      return isEasterEggMode ? easterEgg : normal;
    },
    [isEasterEggMode]
  );

  /**
   * 모드 체크
   * 특정 모드인지 확인합니다.
   * 
   * @param mode - 확인할 모드 ('normal' | 'easterEgg')
   * @returns 모드 일치 여부
   */
  const isMode = useCallback(
    (mode: 'normal' | 'easterEgg'): boolean => {
      if (mode === 'easterEgg') {
        return isEasterEggMode;
      }
      return !isEasterEggMode;
    },
    [isEasterEggMode]
  );

  return {
    isEasterEggMode,
    conditionalHandler,
    modeValue,
    modeClass,
    isMode,
  };
};

