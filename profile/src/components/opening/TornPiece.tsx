import { motion } from 'motion/react';
import { TEAR_PATHS } from './tearPaths';
import type { OpeningTearId } from './bandLayout';
import { OpeningPicture } from './OpeningPicture';
import { getOpeningAssetUrl } from './openingAssets';

type PieceId = 'top' | 'middle' | 'bottom';
type FiberSide = 'upper' | 'lower';

interface CurlDefinition {
  readonly id: string;
  readonly tearId: OpeningTearId;
  readonly side: FiberSide;
  readonly hingePercent: number;
}

interface TornPieceProps {
  readonly pieceId: PieceId;
}

function averageY(tearId: OpeningTearId) {
  const path = TEAR_PATHS[tearId];
  return path.reduce((total, point) => total + point.y, 0) / path.length;
}

const firstCenter = averageY('first');
const secondCenter = averageY('second');
const topCurlHeight = firstCenter * 0.08;
const middleCurlHeight = (secondCenter - firstCenter) * 0.08;
const bottomCurlHeight = (100 - secondCenter) * 0.08;

const CURLS_BY_PIECE: Record<PieceId, readonly CurlDefinition[]> = {
  top: [
    {
      id: 'top-bottom',
      tearId: 'first',
      side: 'upper',
      hingePercent: firstCenter - topCurlHeight,
    },
  ],
  middle: [
    {
      id: 'middle-top',
      tearId: 'first',
      side: 'lower',
      hingePercent: firstCenter + middleCurlHeight,
    },
    {
      id: 'middle-bottom',
      tearId: 'second',
      side: 'upper',
      hingePercent: secondCenter - middleCurlHeight,
    },
  ],
  bottom: [
    {
      id: 'bottom-top',
      tearId: 'second',
      side: 'lower',
      hingePercent: secondCenter + bottomCurlHeight,
    },
  ],
};

function CurlBand({ definition }: { readonly definition: CurlDefinition }) {
  return (
    <motion.div
      className="absolute inset-0"
      data-curl={definition.id}
      style={{
        transformOrigin: `50% ${definition.hingePercent}%`,
        transformStyle: 'preserve-3d',
      }}
    >
      <OpeningPicture
        imageStyle={{ backfaceVisibility: 'hidden' }}
        name={`fallen-curl-${definition.id}-front`}
      />
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-fill"
        data-opening-image
        decoding="async"
        height={640}
        loading="eager"
        src={getOpeningAssetUrl(`fallen-curl-${definition.id}-back.webp`)}
        style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
        width={640}
      />
      <motion.img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-fill"
        data-opening-image
        data-tear={definition.tearId}
        decoding="async"
        height={640}
        loading="eager"
        src={getOpeningAssetUrl(`fiber-${definition.tearId}-${definition.side}.png`)}
        style={{
          scaleX: 0,
          transformOrigin: definition.tearId === 'second' ? 'right center' : 'left center',
        }}
        width={640}
      />
    </motion.div>
  );
}

export function TornPiece({ pieceId }: TornPieceProps) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      data-piece={pieceId}
      style={{
        transformStyle: 'preserve-3d',
        zIndex: pieceId === 'middle' ? 3 : pieceId === 'bottom' ? 2 : 1,
      }}
    >
      <OpeningPicture
        highPriority={pieceId === 'bottom'}
        name={`fallen-${pieceId}-body`}
      />
      {CURLS_BY_PIECE[pieceId].map(definition => (
        <CurlBand definition={definition} key={definition.id} />
      ))}
    </motion.div>
  );
}
