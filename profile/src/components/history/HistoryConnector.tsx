import { useId } from 'react';
import { motion } from 'motion/react';
import type { ProfileHistoryEntry } from '../../content/types';
import type { HistoryCardSide } from './HistoryCard';

interface HistoryConnectorProps {
  readonly kind: ProfileHistoryEntry['kind'];
  readonly side: HistoryCardSide;
  readonly isActive: boolean;
  readonly prefersReducedMotion: boolean;
}

interface BranchSvgProps extends HistoryConnectorProps {
  readonly width: number;
  readonly rise: number;
  readonly side: HistoryCardSide;
  readonly maskId: string;
  readonly className: string;
}

const MEDIA_LINE_TOP_PX = 19;
const BRANCH_RISE_PX = { mobile: 14, desktop: 28 } as const;

function strokeWidthForKind(kind: ProfileHistoryEntry['kind']) {
  if (kind === 'career') {
    return 4;
  }

  return kind === 'course' ? 3 : 2;
}

function pathForSide(side: HistoryCardSide, width: number, rise: number, strokeWidth: number) {
  const halfStroke = strokeWidth / 2;

  return side === 'right'
    ? 'M0 ' + (rise + halfStroke) + ' L' + rise + ' ' + halfStroke + ' L' + width + ' ' + halfStroke
    : 'M' + width + ' ' + (rise + halfStroke) + ' L' + (width - rise) + ' ' + halfStroke + ' L0 ' + halfStroke;
}

function BranchSvg({ kind, side, isActive, prefersReducedMotion, width, rise, maskId, className }: BranchSvgProps) {
  const strokeWidth = strokeWidthForKind(kind);
  const height = rise + strokeWidth;
  const path = pathForSide(side, width, rise, strokeWidth);
  const shouldReveal = isActive || prefersReducedMotion;

  return (
    <svg
      aria-hidden="true"
      className={'pointer-events-none absolute overflow-visible ' + className}
      fill="none"
      height={height}
      style={{ top: MEDIA_LINE_TOP_PX - strokeWidth / 2 }}
      viewBox={'0 0 ' + width + ' ' + height}
      width={width}
    >
      <defs>
        <mask
          height={height + strokeWidth * 2}
          id={maskId}
          maskContentUnits="userSpaceOnUse"
          maskUnits="userSpaceOnUse"
          width={width + strokeWidth * 2}
          x={-strokeWidth}
          y={-strokeWidth}
        >
          <motion.path
            animate={{ pathLength: shouldReveal ? 1 : 0 }}
            d={path}
            fill="none"
            initial={false}
            stroke="white"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: 'easeOut',
              delay: isActive && !prefersReducedMotion ? 0.15 : 0,
            }}
          />
        </mask>
      </defs>
      <path
        d={path}
        mask={'url(#' + maskId + ')'}
        stroke="var(--color-primary)"
        strokeDasharray={kind === 'course' ? '6 5' : undefined}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export function HistoryConnector({ kind, side, isActive, prefersReducedMotion }: HistoryConnectorProps) {
  const id = 'history-connector-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const isCareer = kind === 'career';
  const hasNode = kind !== 'work';
  const nodeSize = isCareer ? 24 : 20;
  const nodeClass = isCareer
    ? 'size-6 border-4 ' + (isActive ? 'bg-primary' : 'bg-surface')
    : 'size-5 border-[3px] bg-surface';
  const mobileNodeTop = MEDIA_LINE_TOP_PX + BRANCH_RISE_PX.mobile - nodeSize / 2;
  const desktopNodeTop = MEDIA_LINE_TOP_PX + BRANCH_RISE_PX.desktop - nodeSize / 2;
  const desktopNodeSide = side === 'right'
    ? '-left-6 -translate-x-1/2'
    : '-right-6 translate-x-1/2';

  return (
    <>
      <BranchSvg
        className="-left-[26px] md:hidden"
        isActive={isActive}
        kind={kind}
        maskId={id + '-mobile'}
        prefersReducedMotion={prefersReducedMotion}
        rise={BRANCH_RISE_PX.mobile}
        side="right"
        width={26}
      />
      <BranchSvg
        className={'hidden md:block ' + (side === 'right' ? '-left-5' : '-right-5')}
        isActive={isActive}
        kind={kind}
        maskId={id + '-desktop'}
        prefersReducedMotion={prefersReducedMotion}
        rise={BRANCH_RISE_PX.desktop}
        side={side}
        width={60}
      />
      {hasNode && (
        <>
          <span
            aria-hidden="true"
            className={'absolute -left-[1.875rem] z-10 -translate-x-1/2 rounded-full border-primary md:hidden ' + nodeClass}
            style={{ top: mobileNodeTop, transition: prefersReducedMotion ? 'none' : 'background-color 500ms ease-out' }}
          />
          <span
            aria-hidden="true"
            className={'absolute z-10 hidden rounded-full border-primary md:block ' + desktopNodeSide + ' ' + nodeClass}
            style={{ top: desktopNodeTop, transition: prefersReducedMotion ? 'none' : 'background-color 500ms ease-out' }}
          />
        </>
      )}
    </>
  );
}
