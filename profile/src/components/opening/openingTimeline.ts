import { cubicBezier } from 'motion/react';
import { OPENING_COLUMN_COUNT, OPENING_SWEEP_DIRECTIONS } from './bandLayout';
import type { OpeningBandId, OpeningTearId } from './bandLayout';

const TOP_SWEEP_PROGRESS_DURATION = 0.78;
const STANDARD_SWEEP_PROGRESS_DURATION = 0.9;
const MIDDLE_SWEEP_HOLD_DURATION = 0.1;
const MIDDLE_SWEEP_HOLD_ORDER = Math.floor(OPENING_COLUMN_COUNT / 2);
const FINAL_COLUMN_SCALE = 0.18;
const FINAL_COLUMN_SCALE_DURATION = 0.06;
const FINAL_COLUMN_HOLD_DURATION = 0.14;
const FINAL_COLUMN_EXIT_DURATION = 0.18;
const BOTTOM_START_AT = TOP_SWEEP_PROGRESS_DURATION * 0.8;
const MIDDLE_PAUSE_DURATION = 0.28;
const MIDDLE_START_AT = BOTTOM_START_AT + getBandDuration('bottom') + MIDDLE_PAUSE_DURATION;
const FIBER_LEAD_COLUMNS = 0;
const FIBER_SPAN_COLUMNS = 3;
const FIBER_HIDDEN_CLIP = 'inset(0 100% 0 0)';

const PIECE_START_AT: Record<OpeningBandId, number> = {
  top: 0,
  bottom: BOTTOM_START_AT,
  middle: MIDDLE_START_AT,
};

const curlEase = cubicBezier(0.6, 0, 0.8, 0.4);
const topCurlEase = cubicBezier(0.42, 0, 0.58, 1);
const easeOut = cubicBezier(0, 0, 0.58, 1);

export const OPENING_PIECE_IDS: readonly OpeningBandId[] = ['top', 'middle', 'bottom'];
export const OPENING_TEAR_PIECES: Record<OpeningTearId, OpeningBandId> = {
  first: 'top',
  second: 'bottom',
};
export const OPENING_TOTAL_DURATION = MIDDLE_START_AT + getBandDuration('middle');

export interface OpeningColumnFrame {
  readonly transform: string;
  readonly opacity: number;
}

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getSweepOrder(pieceId: OpeningBandId, columnIndex: number) {
  return OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right'
    ? columnIndex
    : OPENING_COLUMN_COUNT - columnIndex - 1;
}

function getColumnStagger(pieceId: OpeningBandId) {
  const duration = pieceId === 'top' ? TOP_SWEEP_PROGRESS_DURATION : STANDARD_SWEEP_PROGRESS_DURATION;
  return duration / OPENING_COLUMN_COUNT;
}

function getBandDuration(pieceId: OpeningBandId) {
  const columnStagger = getColumnStagger(pieceId);
  const columnCurlDuration = columnStagger * 1.5;
  const middleSweepHoldDuration = pieceId === 'middle' ? MIDDLE_SWEEP_HOLD_DURATION : 0;
  const columnWaveDuration = (OPENING_COLUMN_COUNT - 1) * columnStagger
    + columnCurlDuration
    + middleSweepHoldDuration;
  const columnBackHoldDuration = columnStagger * 0.45;

  return columnWaveDuration
    + columnBackHoldDuration
    + FINAL_COLUMN_SCALE_DURATION
    + FINAL_COLUMN_HOLD_DURATION
    + FINAL_COLUMN_EXIT_DURATION;
}

export function getColumnFrame(pieceId: OpeningBandId, columnIndex: number, elapsed: number): OpeningColumnFrame {
  const sign = OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right' ? 1 : -1;
  const order = getSweepOrder(pieceId, columnIndex);
  const columnStagger = getColumnStagger(pieceId);
  const columnCurlDuration = columnStagger * 1.5;
  const columnBackHoldDuration = columnStagger * 0.45;
  const columnFadeDuration = columnStagger * 0.55;
  const middleSweepHold = pieceId === 'middle' && order >= MIDDLE_SWEEP_HOLD_ORDER
    ? MIDDLE_SWEEP_HOLD_DURATION
    : 0;
  const local = elapsed - PIECE_START_AT[pieceId] - order * columnStagger - middleSweepHold;
  const ease = pieceId === 'top' ? topCurlEase : pieceId === 'middle' ? easeOut : curlEase;
  const rotateY = sign * 180 * ease(clampUnit(local / columnCurlDuration));
  const afterBackHold = local - columnCurlDuration - columnBackHoldDuration;

  if (order < OPENING_COLUMN_COUNT - 1) {
    return {
      transform: `rotateY(${rotateY}deg)`,
      opacity: 1 - clampUnit(afterBackHold / columnFadeDuration),
    };
  }

  const scaleX = 1 - (1 - FINAL_COLUMN_SCALE) * easeOut(clampUnit(afterBackHold / FINAL_COLUMN_SCALE_DURATION));
  const exit = curlEase(clampUnit(
    (afterBackHold - FINAL_COLUMN_SCALE_DURATION - FINAL_COLUMN_HOLD_DURATION) / FINAL_COLUMN_EXIT_DURATION,
  ));

  return {
    transform: `translateX(${sign * 100 * exit}%) scaleX(${scaleX}) rotateY(${rotateY}deg)`,
    opacity: 1 - exit,
  };
}

export function getFiberClip(tearId: OpeningTearId, elapsed: number) {
  const pieceId = OPENING_TEAR_PIECES[tearId];
  const position = (elapsed - PIECE_START_AT[pieceId]) / getColumnStagger(pieceId);
  const start = position + FIBER_LEAD_COLUMNS;

  if (position < 0 || start >= OPENING_COLUMN_COUNT) {
    return FIBER_HIDDEN_CLIP;
  }

  const from = start / OPENING_COLUMN_COUNT * 100;
  const to = Math.min(start + FIBER_SPAN_COLUMNS, OPENING_COLUMN_COUNT) / OPENING_COLUMN_COUNT * 100;

  return OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right'
    ? `inset(0 ${100 - to}% 0 ${from}%)`
    : `inset(0 ${from}% 0 ${100 - to}%)`;
}

export { FIBER_HIDDEN_CLIP };
