import artclub400Avif from '../../assets/history/artclub-400.avif';
import artclub400Webp from '../../assets/history/artclub-400.webp';
import artclub800Avif from '../../assets/history/artclub-800.avif';
import artclub800Webp from '../../assets/history/artclub-800.webp';
import chatbot400Avif from '../../assets/history/chatbot-400.avif';
import chatbot400Webp from '../../assets/history/chatbot-400.webp';
import chatbot800Avif from '../../assets/history/chatbot-800.avif';
import chatbot800Webp from '../../assets/history/chatbot-800.webp';
import gbsa400Avif from '../../assets/history/gbsa-400.avif';
import gbsa400Webp from '../../assets/history/gbsa-400.webp';
import gbsa800Avif from '../../assets/history/gbsa-800.avif';
import gbsa800Webp from '../../assets/history/gbsa-800.webp';
import reconlabs400Avif from '../../assets/history/reconlabs-400.avif';
import reconlabs400Webp from '../../assets/history/reconlabs-400.webp';
import reconlabs800Avif from '../../assets/history/reconlabs-800.avif';
import reconlabs800Webp from '../../assets/history/reconlabs-800.webp';
import sesac400Avif from '../../assets/history/sesac-400.avif';
import sesac400Webp from '../../assets/history/sesac-400.webp';
import sesac800Avif from '../../assets/history/sesac-800.avif';
import sesac800Webp from '../../assets/history/sesac-800.webp';
import yamangsolution400Avif from '../../assets/history/yamangsolution-400.avif';
import yamangsolution400Webp from '../../assets/history/yamangsolution-400.webp';
import yamangsolution800Avif from '../../assets/history/yamangsolution-800.avif';
import yamangsolution800Webp from '../../assets/history/yamangsolution-800.webp';
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
  chatbot: {
    avif400: chatbot400Avif,
    webp400: chatbot400Webp,
    avif800: chatbot800Avif,
    webp800: chatbot800Webp,
  },
  gbsa: {
    avif400: gbsa400Avif,
    webp400: gbsa400Webp,
    avif800: gbsa800Avif,
    webp800: gbsa800Webp,
  },
  reconlabs: {
    avif400: reconlabs400Avif,
    webp400: reconlabs400Webp,
    avif800: reconlabs800Avif,
    webp800: reconlabs800Webp,
  },
  sesac: {
    avif400: sesac400Avif,
    webp400: sesac400Webp,
    avif800: sesac800Avif,
    webp800: sesac800Webp,
  },
  yamangsolution: {
    avif400: yamangsolution400Avif,
    webp400: yamangsolution400Webp,
    avif800: yamangsolution800Avif,
    webp800: yamangsolution800Webp,
  },
  design: {
    video: designLoop,
    posterAvif400: designPoster400Avif,
    posterWebp400: designPoster400Webp,
    posterAvif800: designPoster800Avif,
    posterWebp800: designPoster800Webp,
  },
} as const;
