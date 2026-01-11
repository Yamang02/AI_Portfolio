import { useState, useEffect } from 'react';

/**
 * 디바운싱 훅
 * 입력값이 일정 시간 동안 변경되지 않을 때까지 기다린 후 값을 반환합니다.
 * 
 * @param value - 디바운싱할 값
 * @param delay - 디바운싱 지연 시간 (밀리초, 기본값: 300ms)
 * @returns 디바운싱된 값
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 타이머 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 값이 변경되면 이전 타이머 취소
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
