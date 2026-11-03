import type { CSSProperties } from 'react';
import { OPENING_COLUMN_COUNT, OPENING_SWEEP_DIRECTIONS } from './bandLayout';
import type { OpeningBandId, OpeningTearId } from './bandLayout';
import { getOpeningAssetUrl } from './openingAssets';
import { FIBER_HIDDEN_CLIP } from './openingTimeline';

interface TornPieceProps {
  readonly pieceId: OpeningBandId;
  readonly imageUrl: string;
}

const PIECE_Z_INDEX: Record<OpeningBandId, number> = {
  top: 1,
  bottom: 2,
  middle: 3,
};
const FIBER_SIDES = ['upper', 'lower'] as const;
const TEAR_IDS: readonly OpeningTearId[] = ['first', 'second'];

export function getPieceBackUrl(pieceId: OpeningBandId) {
  return getOpeningAssetUrl(`fallen-${pieceId}-back.webp`);
}

export function getFiberUrl(tearId: OpeningTearId, side: typeof FIBER_SIDES[number]) {
  return getOpeningAssetUrl(`fiber-${tearId}-${side}.png`);
}

export function getAllFiberUrls() {
  return TEAR_IDS.flatMap(tearId => FIBER_SIDES.map(side => getFiberUrl(tearId, side)));
}

function getColumnStyle(pieceId: OpeningBandId, columnIndex: number): CSSProperties {
  return {
    height: '100%',
    left: `calc(${columnIndex} * 100cqw / ${OPENING_COLUMN_COUNT})`,
    transformOrigin: OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right' ? '100% 50%' : '0% 50%',
    transformStyle: 'preserve-3d',
    width: `calc(100cqw / ${OPENING_COLUMN_COUNT} + 1px)`,
    zIndex: PIECE_Z_INDEX[pieceId],
  };
}

function getFaceStyle(imageUrl: string, columnIndex: number, isBack: boolean): CSSProperties {
  return {
    backfaceVisibility: 'hidden',
    backgroundImage: `url("${imageUrl}")`,
    backgroundPosition: `calc(${columnIndex} * -100cqw / ${OPENING_COLUMN_COUNT}) 0`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100cqw 100%',
    transform: isBack ? 'rotateY(180deg)' : undefined,
  };
}

export function TornPiece({ pieceId, imageUrl }: TornPieceProps) {
  const backUrl = getPieceBackUrl(pieceId);

  return Array.from({ length: OPENING_COLUMN_COUNT }, (_, columnIndex) => (
    <div
      className="absolute top-0"
      data-column={columnIndex}
      data-piece={pieceId}
      key={`${pieceId}-${columnIndex}`}
      style={getColumnStyle(pieceId, columnIndex)}
    >
      <div className="absolute inset-0" style={getFaceStyle(imageUrl, columnIndex, false)} />
      <div className="absolute inset-0" style={getFaceStyle(backUrl, columnIndex, true)} />
    </div>
  ));
}

export function TearFibers() {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 4 }}>
      {TEAR_IDS.map(tearId => (
        <div
          className="absolute inset-0"
          data-fiber-tear={tearId}
          key={tearId}
          style={{ clipPath: FIBER_HIDDEN_CLIP }}
        >
          {FIBER_SIDES.map(side => (
            <img
              alt=""
              className="absolute inset-0 size-full object-fill"
              decoding="async"
              height={1280}
              key={side}
              src={getFiberUrl(tearId, side)}
              width={1280}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
