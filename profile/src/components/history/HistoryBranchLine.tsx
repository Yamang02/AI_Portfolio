import { motion } from 'motion/react';
import type { HistoryCardSide } from './HistoryCard';

interface HistoryBranchLineProps {
  readonly side: HistoryCardSide;
  readonly strokeWidth: number;
  readonly isVisible: boolean;
  readonly prefersReducedMotion: boolean;
}

interface BranchPathProps extends HistoryBranchLineProps {
  readonly width: number;
  readonly rise: number;
  readonly className: string;
}

export const BRANCH_TOP_PX = 19;
export const BRANCH_RISE_PX = { mobile: 14, desktop: 28 } as const;

function BranchPath({ width, rise, className, side, strokeWidth, isVisible, prefersReducedMotion }: BranchPathProps) {
  const height = rise + strokeWidth;
  const y = strokeWidth / 2;
  const d = side === 'right'
    ? 'M0 ' + (rise + y) + ' L' + rise + ' ' + y + ' L' + width + ' ' + y
    : 'M' + width + ' ' + (rise + y) + ' L' + (width - rise) + ' ' + y + ' L0 ' + y;

  return (
    <svg
      aria-hidden="true"
      className={'pointer-events-none absolute overflow-visible ' + className}
      fill="none"
      height={height}
      style={{ top: BRANCH_TOP_PX }}
      viewBox={'0 0 ' + width + ' ' + height}
      width={width}
    >
      <motion.path
        animate={{ pathLength: isVisible ? 1 : 0 }}
        className="stroke-primary"
        d={d}
        initial={false}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: 'easeOut', delay: isVisible && !prefersReducedMotion ? 0.15 : 0 }}
      />
    </svg>
  );
}

export function HistoryBranchLine(props: HistoryBranchLineProps) {
  return (
    <>
      <BranchPath {...props} className="-left-[26px] md:hidden" rise={BRANCH_RISE_PX.mobile} side="right" width={26} />
      <BranchPath
        {...props}
        className={'hidden md:block ' + (props.side === 'right' ? '-left-5' : '-right-5')}
        rise={BRANCH_RISE_PX.desktop}
        width={60}
      />
    </>
  );
}
