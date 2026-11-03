import artclub400Avif from '../../assets/history/artclub-400.avif';
import artclub400Webp from '../../assets/history/artclub-400.webp';
import artclub800Avif from '../../assets/history/artclub-800.avif';
import artclub800Webp from '../../assets/history/artclub-800.webp';
import designPoster400Avif from '../../assets/history/design-poster-400.avif';
import designPoster400Webp from '../../assets/history/design-poster-400.webp';
import designPoster800Avif from '../../assets/history/design-poster-800.avif';
import designPoster800Webp from '../../assets/history/design-poster-800.webp';
import designLoop from '../../assets/history/design-loop.mp4';

export const historyAssets = {
  artclub: {
    avif400: artclub400Avif,
    webp400: artclub400Webp,
    avif800: artclub800Avif,
    webp800: artclub800Webp,
  },
  design: {
    video: designLoop,
    posterAvif400: designPoster400Avif,
    posterWebp400: designPoster400Webp,
    posterAvif800: designPoster800Avif,
    posterWebp800: designPoster800Webp,
  },
} as const;
