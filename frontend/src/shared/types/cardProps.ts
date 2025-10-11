/**
 * 공통 카드 컴포넌트 Props 타입
 */

/**
 * 모든 카드 컴포넌트의 기본 Props 인터페이스
 * @template T - 카드에 표시할 데이터 타입
 */
export interface BaseCardProps<T> {
  data: T;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHighlighted?: boolean;
  onLongHover?: (id: string) => void;
}

/**
 * 클릭 가능한 카드 Props
 */
export interface ClickableCardProps<T> extends BaseCardProps<T> {
  onClick?: (data: T) => void;
}

/**
 * 카드 hover 상태 타입
 */
export interface CardHoverState {
  isHovered: boolean;
  isLongHovered: boolean;
}
