import { useEffect, useState } from 'react';
import { OPENING_BAND_LAYOUT, OPENING_FRAME_LAYOUT } from './bandLayout';
import type { OpeningBandId } from './bandLayout';
import { getOpeningAssetUrl } from './openingAssets';
import { OPENING_TEMPO } from './openingTimeline';

const FINAL_TITLE_BAND_IDS: readonly OpeningBandId[] = ['top', 'bottom'];

function getTitleUrl(bandId: OpeningBandId) {
  return getOpeningAssetUrl(`hero-final-${bandId}.webp`);
}

export function getFinalTitleImageUrls() {
  return FINAL_TITLE_BAND_IDS.map(getTitleUrl);
}

export function decodeFinalTitleImages() {
  return Promise.all(getFinalTitleImageUrls().map(url => {
    const image = new Image();
    image.src = url;
    return image.decode();
  }));
}

export function FinalTitleBands() {
  const [isTopVisible, setIsTopVisible] = useState(false);
  const [isBottomVisible, setIsBottomVisible] = useState(false);
  const bands = OPENING_BAND_LAYOUT.filter(band => (
    (band.id === 'top' && isTopVisible) || (band.id === 'bottom' && isBottomVisible)
  ));

  useEffect(() => {
    const { topDelayMs, bottomDelayMs } = OPENING_TEMPO.finalTitles;
    const topTimeout = window.setTimeout(() => setIsTopVisible(true), topDelayMs);
    const bottomTimeout = window.setTimeout(() => setIsBottomVisible(true), bottomDelayMs);

    return () => {
      window.clearTimeout(topTimeout);
      window.clearTimeout(bottomTimeout);
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {bands.map(band => (
          <div
            className="absolute overflow-clip"
            key={band.id}
            style={{
              height: `${band.heightPercent}%`,
              left: `${OPENING_FRAME_LAYOUT.leftPercent}%`,
              top: `${band.topPercent}%`,
              width: `${OPENING_FRAME_LAYOUT.widthPercent}%`,
            }}
          >
            <img
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-fill"
              decoding="async"
              height={Math.round(1280 * band.heightPercent / OPENING_FRAME_LAYOUT.widthPercent)}
              loading="eager"
              src={getTitleUrl(band.id)}
              width={1280}
            />
          </div>
        ))}
      </div>
      <p className="sr-only">YAMANG. LEE JEONGJUN.</p>
    </>
  );
}
