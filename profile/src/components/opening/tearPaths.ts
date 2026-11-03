import tearPathData from './tearPaths.json';

export interface TearPoint {
  readonly x: number;
  readonly y: number;
  readonly fiberWidth: number;
}

export type TearPath = readonly TearPoint[];

export const TEAR_PATHS = tearPathData satisfies Record<'first' | 'second', TearPath>;
