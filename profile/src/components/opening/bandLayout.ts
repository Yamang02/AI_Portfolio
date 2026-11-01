import layoutData from './bandLayout.json';

export type OpeningBandId = 'top' | 'middle' | 'bottom';

export interface OpeningBandLayout {
  readonly id: OpeningBandId;
  readonly topPercent: number;
  readonly heightPercent: number;
  readonly tearCenterPercent: number;
  readonly scrollStart: number;
  readonly scrollEnd: number;
}

function isOpeningBandId(value: string): value is OpeningBandId {
  return value === 'top' || value === 'middle' || value === 'bottom';
}

export const OPENING_FRAME_LAYOUT = layoutData.frame;
export const OPENING_BAND_LAYOUT: readonly OpeningBandLayout[] = layoutData.bands.map(band => {
  if (!isOpeningBandId(band.id)) {
    throw new Error(`Unknown opening band: ${band.id}`);
  }

  return { ...band, id: band.id };
});
