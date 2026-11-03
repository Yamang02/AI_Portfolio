import type { ProfileHistoryEntry } from '../../content/types';

export interface HistoryLayoutInput {
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly contentWidth: number;
  readonly cardCount: number;
  readonly rootFontSize?: number;
  readonly navHeight?: number;
}

export function getHistoryMetrics(rootFontSize = 16) {
  const unit = rootFontSize / 16;
  return {
    unit,
    stemWidth: 6 * unit,
    centerGap: 36 * unit,
    cardInset: 30 * unit,
    railX: 10.5 * unit,
    compactInset: 33 * unit,
    careerNodeSize: 18 * unit,
    courseNodeSize: 15 * unit,
    careerStroke: 3 * unit,
    courseStroke: 2.25 * unit,
    workStroke: 1.5 * unit,
    mediaLineTop: 14.25 * unit,
    wideBranchRise: 21 * unit,
    compactBranchRise: 10.5 * unit,
    stackGap: 9 * unit,
    staggerSpace: 18 * unit,
    hintBottom: 24 * unit,
    hintClearance: 12 * unit,
  };
}

export type HistoryMetrics = ReturnType<typeof getHistoryMetrics>;

export function getHistoryConnectorGeometry(
  kind: ProfileHistoryEntry['kind'],
  isWide: boolean,
  metrics: HistoryMetrics,
) {
  const rise = isWide ? metrics.wideBranchRise : metrics.compactBranchRise;
  const width = isWide
    ? metrics.centerGap / 2 + metrics.cardInset - metrics.stemWidth / 2
    : metrics.compactInset - metrics.railX - metrics.stemWidth / 2;
  const strokeWidth = kind === 'career' ? metrics.careerStroke
    : kind === 'course' ? metrics.courseStroke : metrics.workStroke;
  const nodeSize = kind === 'career' ? metrics.careerNodeSize
    : kind === 'course' ? metrics.courseNodeSize : 0;
  return {
    rise,
    width,
    strokeWidth,
    nodeSize,
    svgTop: metrics.mediaLineTop - strokeWidth / 2,
    nodeTop: metrics.mediaLineTop + rise - nodeSize / 2,
  };
}

export function getHistoryLayout({
  viewportWidth,
  viewportHeight,
  contentWidth,
  cardCount,
  rootFontSize = 16,
  navHeight = 54,
}: HistoryLayoutInput) {
  const metrics = getHistoryMetrics(rootFontSize);
  const { unit, compactInset, stackGap, staggerSpace } = metrics;
  const isWide = viewportWidth >= 64 * rootFontSize && contentWidth >= 48 * rootFontSize;
  const count = Math.max(1, cardCount);
  const frameTop = navHeight + 16 * unit;
  const frameBottom = 15 + 36 * unit + metrics.hintBottom + metrics.hintClearance;
  const panelTop = (isWide ? 48 : 80) * unit;
  const panelHeight = Math.max(0, viewportHeight - frameTop - frameBottom - panelTop);
  const aspectRatio = isWide ? 16 / 10 : 21 / 10;
  const preferredWidth = isWide
    ? Math.min(
      256 * unit,
      Math.max(192 * unit, viewportWidth * 0.165),
      (contentWidth - metrics.centerGap) / 2 - metrics.cardInset - 144 * unit,
    )
    : Math.min(420 * unit, Math.max(0, contentWidth - compactInset));
  const minimumWidth = Math.min(preferredWidth, (isWide ? 192 : 288) * unit);
  const heightLimit = isWide
    ? (panelHeight - (count - 1) * staggerSpace) / (1 + (count - 1) / 2)
    : (panelHeight - (count - 1) * stackGap) / count;
  const widthLimit = Math.max(0, heightLimit * aspectRatio);
  const canPin = viewportHeight > 0 && preferredWidth > 0 && widthLimit >= minimumWidth;
  const thumbnailWidth = canPin ? Math.min(preferredWidth, widthLimit) : preferredWidth;
  const thumbnailHeight = thumbnailWidth / aspectRatio;
  const cardGap = isWide ? thumbnailHeight / 2 + staggerSpace : thumbnailHeight + stackGap;
  const bundleHeight = (count - 1) * cardGap + thumbnailHeight;

  return {
    mode: canPin ? 'pinned' as const : 'flow' as const,
    isWide,
    metrics,
    navHeight,
    frameTop,
    frameBottom,
    panelTop,
    panelHeight,
    thumbnailWidth,
    thumbnailHeight,
    cardGap,
    bundleHeight,
    yearSize: (isWide ? 72 : 36) * unit,
  };
}

export type HistoryLayout = ReturnType<typeof getHistoryLayout>;
