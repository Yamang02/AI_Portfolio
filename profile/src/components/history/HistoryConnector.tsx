import { useId } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { ProfileHistoryEntry } from '../../content/types';
import type { HistoryCardSide } from './HistoryCard';
import { getHistoryConnectorGeometry } from './historyLayout';
import type { HistoryMetrics } from './historyLayout';

interface HistoryConnectorProps {
  readonly kind: ProfileHistoryEntry['kind'];
  readonly side: HistoryCardSide;
  readonly isActive: boolean;
  readonly prefersReducedMotion: boolean;
  readonly isWide: boolean;
  readonly metrics: HistoryMetrics;
}

interface BranchSvgProps extends HistoryConnectorProps {
  readonly width: number;
  readonly rise: number;
  readonly side: HistoryCardSide;
  readonly maskId: string;
  readonly style: CSSProperties;
}

function pathForSide(side: HistoryCardSide, width: number, rise: number, strokeWidth: number) {
  const halfStroke = strokeWidth / 2;

  return side === 'right'
    ? 'M0 ' + (rise + halfStroke) + ' L' + rise + ' ' + halfStroke + ' L' + width + ' ' + halfStroke
    : 'M' + width + ' ' + (rise + halfStroke) + ' L' + (width - rise) + ' ' + halfStroke + ' L0 ' + halfStroke;
}

function BranchSvg({ kind, side, isActive, prefersReducedMotion, width, rise, maskId, style, isWide, metrics }: BranchSvgProps) {
  const { strokeWidth, svgTop } = getHistoryConnectorGeometry(kind, isWide, metrics);
  const height = rise + strokeWidth;
  const path = pathForSide(side, width, rise, strokeWidth);
  const shouldReveal = isActive || prefersReducedMotion;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute overflow-visible"
      fill="none"
      height={height}
      style={{ ...style, top: svgTop }}
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
        strokeDasharray={kind === 'course' ? `${4.5 * metrics.unit} ${3.75 * metrics.unit}` : undefined}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export function HistoryConnector({ kind, side, isActive, prefersReducedMotion, isWide, metrics }: HistoryConnectorProps) {
  const id = 'history-connector-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const isCareer = kind === 'career';
  const hasNode = kind !== 'work';
  const { width, rise, nodeSize, nodeTop, strokeWidth } = getHistoryConnectorGeometry(kind, isWide, metrics);
  const isLeft = isWide && side === 'left';
  const edgeInset = metrics.centerGap / 2 - metrics.stemWidth / 2;
  const branchStyle: CSSProperties = isWide
    ? isLeft ? { right: -edgeInset } : { left: -edgeInset }
    : { left: -width };
  const nodePosition: CSSProperties = isWide
    ? isLeft ? { right: -metrics.centerGap / 2 } : { left: -metrics.centerGap / 2 }
    : { left: metrics.railX - metrics.compactInset };

  return (
    <>
      <BranchSvg
        isActive={isActive}
        isWide={isWide}
        kind={kind}
        maskId={id}
        metrics={metrics}
        prefersReducedMotion={prefersReducedMotion}
        rise={rise}
        side={isLeft ? 'left' : 'right'}
        style={branchStyle}
        width={width}
      />
      {hasNode && (
        <span
          aria-hidden="true"
          className={'absolute z-10 rounded-full border-primary '
            + (isLeft ? 'translate-x-1/2 ' : '-translate-x-1/2 ')
            + (isCareer && isActive ? 'bg-primary' : 'bg-surface')}
          style={{
            ...nodePosition,
            top: nodeTop,
            width: nodeSize,
            height: nodeSize,
            borderWidth: strokeWidth,
            transition: prefersReducedMotion ? 'none' : 'background-color 500ms ease-out',
          }}
        />
      )}
    </>
  );
}
