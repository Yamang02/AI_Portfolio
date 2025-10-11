import { useRef, useCallback } from 'react';

/**
 * 카드 hover 상태를 관리하는 커스텀 훅
 *
 * @param itemId - 카드의 고유 ID
 * @param onMouseEnter - 마우스 진입 시 호출될 콜백
 * @param onMouseLeave - 마우스 이탈 시 호출될 콜백
 * @param onLongHover - 긴 hover(500ms) 시 호출될 콜백
 * @returns hover 이벤트 핸들러
 */
export const useCardHover = (
  itemId: string,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  onLongHover?: (id: string) => void
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter?.();

    if (onLongHover) {
      timerRef.current = setTimeout(() => {
        onLongHover(itemId);
      }, 500);
    }
  }, [itemId, onMouseEnter, onLongHover]);

  const handleMouseLeave = useCallback(() => {
    onMouseLeave?.();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [onMouseLeave]);

  return {
    handleMouseEnter,
    handleMouseLeave
  };
};
