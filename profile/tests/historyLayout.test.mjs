import assert from 'node:assert/strict';
import test from 'node:test';
import { getHistoryConnectorGeometry, getHistoryLayout, getHistoryMetrics } from '../src/components/history/historyLayout.ts';

function layoutFor(width, height, cardCount = 4, rootFontSize = 16) {
  const unit = rootFontSize / 16;
  const padding = Math.min(60 * unit, Math.max(18 * unit, width * 0.045));
  return getHistoryLayout({
    viewportWidth: width,
    viewportHeight: height,
    contentWidth: Math.min(960 * unit, width - 2 * padding),
    cardCount,
    rootFontSize,
  });
}

for (const [width, height] of [[390, 844], [768, 1024], [1024, 600], [1280, 720], [1440, 900]]) {
  test(`${width}x${height}: four cards fit in the pinned reading area`, () => {
    const layout = layoutFor(width, height);
    assert.equal(layout.mode, 'pinned');
    assert.ok(layout.bundleHeight <= layout.panelHeight + 0.001);
    assert.ok(layout.frameTop + layout.panelTop + layout.bundleHeight + layout.frameBottom <= height + 0.001);
  });
}

for (const [width, height] of [[390, 667], [390, 760], [667, 390], [1024, 400]]) {
  test(`${width}x${height}: a short viewport uses document flow instead of hiding cards`, () => {
    const layout = layoutFor(width, height);
    assert.equal(layout.mode, 'flow');
    assert.ok(layout.thumbnailWidth >= (layout.isWide ? 192 : Math.min(288, width - 69)));
  });
}

test('available height constrains thumbnails before falling back to document flow', () => {
  const tall = layoutFor(390, 844);
  const shorter = layoutFor(390, 820);
  assert.equal(shorter.mode, 'pinned');
  assert.ok(shorter.thumbnailWidth < tall.thumbnailWidth);
  assert.ok(shorter.thumbnailWidth >= 288);
  assert.ok(Math.abs(shorter.bundleHeight - shorter.panelHeight) < 0.001);
  const tallerNavigation = getHistoryLayout({
    viewportWidth: 390, viewportHeight: 820, contentWidth: 354, cardCount: 4, navHeight: 100,
  });
  assert.equal(tallerNavigation.mode, 'flow');
});

test('pinned layouts fit one to four cards across viewport and text-size combinations', () => {
  for (const width of [320, 390, 768, 1024, 1280, 1440, 1920]) {
    for (const height of [360, 568, 667, 844, 900, 1024]) {
      for (const rootFontSize of [16, 20, 24, 32]) {
        for (const count of [1, 2, 3, 4]) {
          const layout = layoutFor(width, height, count, rootFontSize);
          if (layout.mode === 'flow') continue;
          assert.ok(layout.bundleHeight <= layout.panelHeight + 0.001, JSON.stringify({ width, height, rootFontSize, count }));
          assert.ok(layout.thumbnailWidth > 0);
          if (layout.isWide) assert.ok(layout.thumbnailWidth >= 12 * rootFontSize - 0.001);
        }
      }
    }
  }
});

test('a tall but narrow content container keeps the compact layout', () => {
  const layout = getHistoryLayout({ viewportWidth: 1440, viewportHeight: 900, contentWidth: 600, cardCount: 4 });
  assert.equal(layout.isWide, false);
  assert.ok(layout.thumbnailWidth <= 600 - layout.metrics.compactInset);
});

test('text-size changes scale stem, nodes and branch geometry together', () => {
  const normal = getHistoryMetrics(16);
  const enlarged = getHistoryMetrics(24);
  for (const key of Object.keys(normal)) {
    assert.ok(Math.abs(enlarged[key] - normal[key] * 1.5) < 0.001, key);
  }
  assert.equal(normal.careerNodeSize / normal.stemWidth, 3);
  assert.equal(normal.courseNodeSize / normal.stemWidth, 2.5);
});

test('branches meet the stem edge and card edge, with nodes centered on the branch', () => {
  for (const rootFontSize of [16, 24, 32]) {
    const metrics = getHistoryMetrics(rootFontSize);
    for (const isWide of [false, true]) {
      for (const kind of ['career', 'course', 'work']) {
        const geometry = getHistoryConnectorGeometry(kind, isWide, metrics);
        const cardEdge = isWide ? metrics.centerGap / 2 + metrics.cardInset : metrics.compactInset;
        const stemEdge = (isWide ? 0 : metrics.railX) + metrics.stemWidth / 2;
        assert.equal(stemEdge + geometry.width, cardEdge);
        const originY = geometry.svgTop + geometry.rise + geometry.strokeWidth / 2;
        assert.equal(originY, geometry.nodeTop + geometry.nodeSize / 2);
      }
    }
  }
});
