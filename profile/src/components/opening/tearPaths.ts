import tearPathData from './tearPaths.json';

export interface TearPoint {
  readonly x: number;
  readonly y: number;
}

export interface TearBandPaths {
  readonly leftClip: readonly TearPoint[];
  readonly rightClip: readonly TearPoint[];
  readonly leftFiber: readonly TearPoint[];
  readonly rightFiber: readonly TearPoint[];
}

export const TEAR_PATHS = tearPathData satisfies Record<'top' | 'middle' | 'bottom', TearBandPaths>;
