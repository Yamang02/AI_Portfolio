import educator400Avif from '../../assets/intro/educator-400.avif';
import educator800Avif from '../../assets/intro/educator-800.avif';
import educator1200Avif from '../../assets/intro/educator-1200.avif';
import educator400Webp from '../../assets/intro/educator-400.webp';
import educator800Webp from '../../assets/intro/educator-800.webp';
import educator1200Webp from '../../assets/intro/educator-1200.webp';
import developer400Avif from '../../assets/intro/developer-400.avif';
import developer800Avif from '../../assets/intro/developer-800.avif';
import developer1200Avif from '../../assets/intro/developer-1200.avif';
import developer400Webp from '../../assets/intro/developer-400.webp';
import developer800Webp from '../../assets/intro/developer-800.webp';
import developer1200Webp from '../../assets/intro/developer-1200.webp';
import artist400Avif from '../../assets/intro/artist-400.avif';
import artist800Avif from '../../assets/intro/artist-800.avif';
import artist1200Avif from '../../assets/intro/artist-1200.avif';
import artist400Webp from '../../assets/intro/artist-400.webp';
import artist800Webp from '../../assets/intro/artist-800.webp';
import artist1200Webp from '../../assets/intro/artist-1200.webp';
import entrepreneur400Avif from '../../assets/intro/entrepreneur-400.avif';
import entrepreneur800Avif from '../../assets/intro/entrepreneur-800.avif';
import entrepreneur1200Avif from '../../assets/intro/entrepreneur-1200.avif';
import entrepreneur400Webp from '../../assets/intro/entrepreneur-400.webp';
import entrepreneur800Webp from '../../assets/intro/entrepreneur-800.webp';
import entrepreneur1200Webp from '../../assets/intro/entrepreneur-1200.webp';

interface ResponsiveAsset {
  readonly width: number;
  readonly avif: string;
  readonly webp: string;
}

interface IntroImageAssetSet {
  readonly aspectRatio: number;
  readonly images: readonly ResponsiveAsset[];
}

function asset(width: number, avif: string, webp: string): ResponsiveAsset {
  return { width, avif, webp };
}

export const introImageAssets = {
  educator: {
    aspectRatio: 1440 / 1080,
    images: [
      asset(400, educator400Avif, educator400Webp),
      asset(800, educator800Avif, educator800Webp),
      asset(1200, educator1200Avif, educator1200Webp),
    ],
  },
  developer: {
    aspectRatio: 1207 / 903,
    images: [
      asset(400, developer400Avif, developer400Webp),
      asset(800, developer800Avif, developer800Webp),
      asset(1200, developer1200Avif, developer1200Webp),
    ],
  },
  artist: {
    aspectRatio: 2919 / 2280,
    images: [
      asset(400, artist400Avif, artist400Webp),
      asset(800, artist800Avif, artist800Webp),
      asset(1200, artist1200Avif, artist1200Webp),
    ],
  },
  entrepreneur: {
    aspectRatio: 1440 / 1920,
    images: [
      asset(400, entrepreneur400Avif, entrepreneur400Webp),
      asset(800, entrepreneur800Avif, entrepreneur800Webp),
      asset(1200, entrepreneur1200Avif, entrepreneur1200Webp),
    ],
  },
} satisfies Record<string, IntroImageAssetSet>;
