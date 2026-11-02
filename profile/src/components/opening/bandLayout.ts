import layoutData from './bandLayout.json';

export type OpeningBandId = 'top' | 'middle' | 'bottom';
export type OpeningTearId = 'first' | 'second';

export interface OpeningBandLayout {
  readonly id: OpeningBandId;
  readonly topPercent: number;
  readonly heightPercent: number;
}

export interface OpeningTearLayout {
  readonly id: OpeningTearId;
  readonly gapTopPercent: number;
  readonly gapHeightPercent: number;
  readonly centerPercent: number;
  readonly seed: number;
}

function isOpeningBandId(value: string): value is OpeningBandId {
  return value === 'top' || value === 'middle' || value === 'bottom';
}

function isOpeningTearId(value: string): value is OpeningTearId {
  return value === 'first' || value === 'second';
}

export const OPENING_FRAME_LAYOUT = layoutData.frame;
export const OPENING_BAND_LAYOUT: readonly OpeningBandLayout[] = layoutData.bands.map(band => {
  if (!isOpeningBandId(band.id)) {
    throw new Error(`Unknown opening band: ${band.id}`);
  }

  return { ...band, id: band.id };
});
export const OPENING_TEAR_LAYOUT: readonly OpeningTearLayout[] = layoutData.tears.map(tear => {
  if (!isOpeningTearId(tear.id)) {
    throw new Error(`Unknown opening tear: ${tear.id}`);
  }

  return { ...tear, id: tear.id };
});
