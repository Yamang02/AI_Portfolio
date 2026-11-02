import { cubicBezier } from 'motion/react';
import { OPENING_COLUMN_COUNT, OPENING_SWEEP_DIRECTIONS } from './bandLayout';
import type { OpeningBandId, OpeningTearId } from './bandLayout';

type BezierPoints = readonly [number, number, number, number];

interface BandTempo {
  readonly sweepDuration: number;
  readonly sweepEase: BezierPoints;
  readonly curlEase: BezierPoints;
  readonly jitter: number;
  readonly seed: number;
  readonly holdAtHalf?: number;
}

interface SweepHold {
  readonly order: number;
  readonly duration: number;
}

export const OPENING_TEMPO = {
  top: {
    sweepDuration: 0.85,
    sweepEase: [0.55, 0, 0.75, 0.2],
    curlEase: [0.42, 0, 0.58, 1],
    jitter: 0.12,
    seed: 11,
  },
  bottom: {
    sweepDuration: 0.7,
    sweepEase: [0.5, 0, 0.7, 0.3],
    curlEase: [0.6, 0, 0.8, 0.4],
    jitter: 0.12,
    seed: 23,
  },
  middle: {
    sweepDuration: 0.9,
    sweepEase: [0.7, 0, 0.85, 0.15],
    curlEase: [0, 0, 0.58, 1],
    jitter: 0.08,
    seed: 37,
    holdAtHalf: 0.1,
  },
  bottomStartAtTopFrontProgress: 0.45,
  pauseBeforeMiddle: 0.35,
  middleAnticipation: { duration: 0.18, releaseDuration: 0.12, offsetPx: 2 },
  curlDurationInColumns: 1.5,
  backHoldInColumns: 0.45,
  fadeInColumns: 0.55,
  finalColumn: { scale: 0.18, scaleDuration: 0.06, holdDuration: 0.14, exitDuration: 0.18 },
  fiber: { leadColumns: 0, spanColumns: 3 },
  finalTitles: { topDelayMs: 800, bottomDelayMs: 1350 },
  scrollHint: { delayAfterTitleMs: 400 },
} as const satisfies Record<OpeningBandId, BandTempo> & Record<string, unknown>;

const FIBER_HIDDEN_CLIP = 'inset(0 100% 0 0)';
const LAST_ORDER = OPENING_COLUMN_COUNT - 1;
const INVERSE_SEARCH_STEPS = 32;
const finalExitEase = cubicBezier(0.6, 0, 0.8, 0.4);
const easeOut = cubicBezier(0, 0, 0.58, 1);

interface BandTimeline {
  readonly startAt: number;
  readonly columnStarts: readonly number[];
  readonly averageStagger: number;
  readonly curlDuration: number;
  readonly curlEase: (value: number) => number;
  readonly sweepHold?: SweepHold;
  readonly endAt: number;
}

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function invertEase(ease: (value: number) => number, target: number) {
  let low = 0;
  let high = 1;

  for (let step = 0; step < INVERSE_SEARCH_STEPS; step += 1) {
    const middle = (low + high) / 2;

    if (ease(middle) < target) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return (low + high) / 2;
}

function createBandTimeline(tempo: BandTempo, startAt: number): BandTimeline {
  const sweepEase = cubicBezier(...tempo.sweepEase);
  const averageStagger = tempo.sweepDuration / OPENING_COLUMN_COUNT;
  const random = createRandom(tempo.seed);
  const halfOrder = Math.floor(OPENING_COLUMN_COUNT / 2);
  const columnStarts: number[] = [];

  for (let order = 0; order < OPENING_COLUMN_COUNT; order += 1) {
    const front = invertEase(sweepEase, order / LAST_ORDER) * tempo.sweepDuration;
    const isEdge = order === 0 || order === LAST_ORDER;
    const jitter = isEdge ? 0 : (random() * 2 - 1) * tempo.jitter * averageStagger;
    const hold = tempo.holdAtHalf !== undefined && order > halfOrder ? tempo.holdAtHalf : 0;
    const previous = columnStarts[order - 1] ?? 0;

    columnStarts.push(Math.max(previous, startAt + front + jitter + hold));
  }

  const curlDuration = averageStagger * OPENING_TEMPO.curlDurationInColumns;
  const { scaleDuration, holdDuration, exitDuration } = OPENING_TEMPO.finalColumn;
  const endAt = columnStarts[LAST_ORDER]
    + curlDuration
    + averageStagger * OPENING_TEMPO.backHoldInColumns
    + scaleDuration
    + holdDuration
    + exitDuration;

  return {
    startAt,
    columnStarts,
    averageStagger,
    curlDuration,
    curlEase: cubicBezier(...tempo.curlEase),
    sweepHold: tempo.holdAtHalf === undefined ? undefined : { order: halfOrder, duration: tempo.holdAtHalf },
    endAt,
  };
}

function getTimeAtSweepProgress(timeline: BandTimeline, progress: number) {
  const targetOrder = clampUnit(progress) * LAST_ORDER;
  const lowerOrder = Math.floor(targetOrder);
  const upperOrder = Math.min(lowerOrder + 1, LAST_ORDER);
  const orderProgress = targetOrder - lowerOrder;
  const startAt = timeline.columnStarts[lowerOrder];
  const endAt = timeline.columnStarts[upperOrder];

  return startAt + (endAt - startAt) * orderProgress;
}

const TOP_TIMELINE = createBandTimeline(OPENING_TEMPO.top, 0);
const BOTTOM_TIMELINE = createBandTimeline(
  OPENING_TEMPO.bottom,
  getTimeAtSweepProgress(TOP_TIMELINE, OPENING_TEMPO.bottomStartAtTopFrontProgress),
);
const MIDDLE_TIMELINE = createBandTimeline(
  OPENING_TEMPO.middle,
  BOTTOM_TIMELINE.endAt + OPENING_TEMPO.pauseBeforeMiddle,
);

const BAND_TIMELINES: Record<OpeningBandId, BandTimeline> = {
  top: TOP_TIMELINE,
  bottom: BOTTOM_TIMELINE,
  middle: MIDDLE_TIMELINE,
};

export const OPENING_PIECE_IDS: readonly OpeningBandId[] = ['top', 'middle', 'bottom'];
export const OPENING_TEAR_PIECES: Record<OpeningTearId, OpeningBandId> = {
  first: 'top',
  second: 'bottom',
};
export const OPENING_TOTAL_DURATION = Math.max(...Object.values(BAND_TIMELINES).map(timeline => timeline.endAt));

export interface OpeningColumnFrame {
  readonly transform: string;
  readonly opacity: number;
}

export interface OpeningCurlFrame {
  readonly progress: number;
  readonly offsetPx: number;
  readonly radiusScale: number;
  readonly opacity: number;
}

function getSweepOrder(pieceId: OpeningBandId, columnIndex: number) {
  return OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right'
    ? columnIndex
    : LAST_ORDER - columnIndex;
}

function getSweepSign(pieceId: OpeningBandId) {
  return OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right' ? 1 : -1;
}

function getAnticipationOffset(pieceId: OpeningBandId, elapsed: number) {
  if (pieceId !== 'middle') {
    return 0;
  }

  const { duration, releaseDuration, offsetPx } = OPENING_TEMPO.middleAnticipation;
  const startAt = MIDDLE_TIMELINE.startAt;
  const pull = easeOut(clampUnit((elapsed - (startAt - duration)) / duration));
  const release = easeOut(clampUnit((elapsed - startAt) / releaseDuration));

  return -getSweepSign(pieceId) * offsetPx * pull * (1 - release);
}

export function getCurlFrame(pieceId: OpeningBandId, elapsed: number): OpeningCurlFrame {
  const timeline = BAND_TIMELINES[pieceId];
  const front = getSweepFront(pieceId, elapsed);
  const afterBackHold = elapsed
    - timeline.columnStarts[LAST_ORDER]
    - timeline.curlDuration
    - timeline.averageStagger * OPENING_TEMPO.backHoldInColumns;
  const { scale, scaleDuration, holdDuration, exitDuration } = OPENING_TEMPO.finalColumn;
  const scaleProgress = easeOut(clampUnit(afterBackHold / scaleDuration));
  const exitProgress = finalExitEase(clampUnit(
    (afterBackHold - scaleDuration - holdDuration) / exitDuration,
  ));

  return {
    progress: front / LAST_ORDER,
    offsetPx: getAnticipationOffset(pieceId, elapsed),
    radiusScale: 1 - (1 - scale) * scaleProgress,
    opacity: 1 - exitProgress,
  };
}

export function getSweepFront(pieceId: OpeningBandId, elapsed: number) {
  const timeline = BAND_TIMELINES[pieceId];
  const { columnStarts, averageStagger, sweepHold } = timeline;

  if (elapsed < columnStarts[0]) {
    return -1;
  }

  const holdStartAt = sweepHold ? columnStarts[sweepHold.order] : Number.POSITIVE_INFINITY;
  const holdEndAt = sweepHold ? holdStartAt + sweepHold.duration : Number.POSITIVE_INFINITY;

  if (sweepHold && elapsed >= holdStartAt && elapsed < holdEndAt) {
    return sweepHold.order;
  }

  const afterHold = sweepHold !== undefined && elapsed >= holdEndAt;
  const sweepTime = afterHold ? elapsed - sweepHold.duration : elapsed;
  const getColumnStart = (order: number) => afterHold && sweepHold && order > sweepHold.order
    ? columnStarts[order] - sweepHold.duration
    : columnStarts[order];
  const lastStartAt = getColumnStart(LAST_ORDER);

  if (sweepTime >= lastStartAt) {
    return LAST_ORDER + (sweepTime - lastStartAt) / averageStagger;
  }

  let low = 0;
  let high = LAST_ORDER;

  while (high - low > 1) {
    const middle = (low + high) >> 1;

    if (getColumnStart(middle) <= sweepTime) {
      low = middle;
    } else {
      high = middle;
    }
  }

  const startAt = getColumnStart(low);
  const span = getColumnStart(high) - startAt;
  return low + (span > 0 ? (sweepTime - startAt) / span : 0);
}

export function getColumnFrame(pieceId: OpeningBandId, columnIndex: number, elapsed: number): OpeningColumnFrame {
  const timeline = BAND_TIMELINES[pieceId];
  const sign = getSweepSign(pieceId);
  const order = getSweepOrder(pieceId, columnIndex);
  const local = elapsed - timeline.columnStarts[order];
  const rotateY = sign * 180 * timeline.curlEase(clampUnit(local / timeline.curlDuration));
  const afterBackHold = local - timeline.curlDuration - timeline.averageStagger * OPENING_TEMPO.backHoldInColumns;
  const anticipation = getAnticipationOffset(pieceId, elapsed);
  const tug = anticipation === 0 ? '' : `translateX(${anticipation}px) `;

  if (order < LAST_ORDER) {
    return {
      transform: `${tug}rotateY(${rotateY}deg)`,
      opacity: 1 - clampUnit(afterBackHold / (timeline.averageStagger * OPENING_TEMPO.fadeInColumns)),
    };
  }

  const { scale, scaleDuration, holdDuration, exitDuration } = OPENING_TEMPO.finalColumn;
  const scaleX = 1 - (1 - scale) * easeOut(clampUnit(afterBackHold / scaleDuration));
  const exit = finalExitEase(clampUnit((afterBackHold - scaleDuration - holdDuration) / exitDuration));

  return {
    transform: `${tug}translateX(${sign * 100 * exit}%) scaleX(${scaleX}) rotateY(${rotateY}deg)`,
    opacity: 1 - exit,
  };
}

export function getFiberClip(tearId: OpeningTearId, elapsed: number) {
  const pieceId = OPENING_TEAR_PIECES[tearId];
  const front = getSweepFront(pieceId, elapsed);
  const start = front + OPENING_TEMPO.fiber.leadColumns;

  if (front < 0 || start >= OPENING_COLUMN_COUNT) {
    return FIBER_HIDDEN_CLIP;
  }

  const from = start / OPENING_COLUMN_COUNT * 100;
  const to = Math.min(start + OPENING_TEMPO.fiber.spanColumns, OPENING_COLUMN_COUNT) / OPENING_COLUMN_COUNT * 100;

  return OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right'
    ? `inset(0 ${100 - to}% 0 ${from}%)`
    : `inset(0 ${from}% 0 ${100 - to}%)`;
}

export { FIBER_HIDDEN_CLIP };
