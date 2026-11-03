import { useEffect, useState } from 'react';
import { OPENING_BAND_LAYOUT, OPENING_FRAME_LAYOUT } from './bandLayout';
import { getOpeningAssetUrl } from './openingAssets';
import { OPENING_TEMPO } from './openingTimeline';
import { loadOpeningImages } from './openingImages';

const FINAL_TITLE_BAND_IDS = ['top', 'bottom'] as const;
export type FinalTitleBandId = typeof FINAL_TITLE_BAND_IDS[number];
const FINAL_TITLES: Record<FinalTitleBandId, string> = { top: 'YAMANG', bottom: 'LEE JEONGJUN' };

function getTitleUrl(bandId: FinalTitleBandId) {
  return getOpeningAssetUrl(`hero-final-${bandId}.webp`);
}

export async function decodeFinalTitleImages(signal: AbortSignal): Promise<readonly FinalTitleBandId[]> {
  const results = await Promise.allSettled(FINAL_TITLE_BAND_IDS.map(async bandId => {
    await loadOpeningImages([getTitleUrl(bandId)], signal);
    return bandId;
  }));
  return results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
}

interface FinalTitleBandsProps {
  readonly readyTitleIds: readonly FinalTitleBandId[];
}

export function FinalTitleBands({ readyTitleIds }: FinalTitleBandsProps) {
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
        {bands.map(band => band.id === 'middle' ? null : (
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
            {readyTitleIds.includes(band.id) ? (
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
            ) : (
              <span className="flex size-full items-center justify-center font-headline text-[clamp(0.75rem,3vw,2rem)] font-semibold tracking-[0.15em] text-on-surface">
                {FINAL_TITLES[band.id]}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="sr-only">YAMANG. LEE JEONGJUN.</p>
    </>
  );
}
