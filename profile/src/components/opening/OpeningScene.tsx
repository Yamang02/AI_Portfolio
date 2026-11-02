import { useEffect, useState } from 'react';
import { useAnimate, useReducedMotion } from 'motion/react';
import type { ProfileOpening } from '../../content/types';
import { OPENING_BAND_LAYOUT, OPENING_FRAME_LAYOUT } from './bandLayout';
import { BandPicture } from './BandPicture';
import { TornPiece } from './TornPiece';

interface OpeningSceneProps {
  readonly content: ProfileOpening;
}

const PIECE_IDS = ['top', 'middle', 'bottom'] as const;

export function OpeningScene({ content }: OpeningSceneProps) {
  const [scope, animate] = useAnimate();
  const prefersReducedMotion = useReducedMotion();
  const [artworkHidden, setArtworkHidden] = useState(false);

  useEffect(() => {
    const root = scope.current as HTMLDivElement | null;

    if (!root || artworkHidden) {
      return;
    }

    let isDisposed = false;
    let imagesDecoded = false;
    let hasStarted = false;
    let startTimer: number | undefined;

    const playOpening = async () => {
      if (prefersReducedMotion) {
        await animate('[data-piece]', { opacity: 0 }, { duration: 0.6, ease: 'easeInOut' });
      } else {
        await animate([
          ['[data-tear="first"]', { scaleX: 1 }, { at: 0, duration: 0.5, ease: 'easeIn' }],
          ['[data-piece="top"]', { y: '-0.3%' }, { at: 0, duration: 0.5 }],
          ['[data-curl="top-bottom"]', { rotateX: -110 }, { at: 0.4, duration: 0.8, ease: [0.6, 0, 0.8, 0.4] }],
          ['[data-piece="top"]', {
            x: '115%',
            rotateY: '-18deg',
            rotateZ: '3deg',
            opacity: [1, 1, 0],
          }, { at: 0.4, duration: 0.8, times: [0, 0.7, 1], ease: [0.6, 0, 0.8, 0.4] }],
          ['[data-tear="second"]', { scaleX: 1 }, { at: 0.8, duration: 0.5, ease: 'easeIn' }],
          ['[data-curl="bottom-top"]', { rotateX: 110 }, { at: 1.2, duration: 0.8, ease: [0.6, 0, 0.8, 0.4] }],
          ['[data-piece="bottom"]', {
            x: '-115%',
            rotateY: '18deg',
            rotateZ: '-3deg',
            opacity: [1, 1, 0],
          }, { at: 1.2, duration: 0.8, times: [0, 0.7, 1], ease: [0.6, 0, 0.8, 0.4] }],
          ['[data-curl="middle-top"], [data-curl="middle-bottom"]', { rotateX: 60 }, { at: 2.4, duration: 0.8, ease: [0.6, 0, 0.8, 0.4] }],
          ['[data-piece="middle"]', {
            x: '115%',
            rotateY: '-22deg',
            opacity: [1, 1, 0],
          }, { at: 2.4, duration: 0.8, times: [0, 0.7, 1], ease: [0.6, 0, 0.8, 0.4] }],
        ]);
      }

      if (!isDisposed) {
        setArtworkHidden(true);
      }
    };

    const startWhenReady = () => {
      if (isDisposed || !imagesDecoded || hasStarted || document.hidden || startTimer !== undefined) {
        return;
      }

      startTimer = window.setTimeout(() => {
        startTimer = undefined;

        if (isDisposed || document.hidden || hasStarted) {
          return;
        }

        hasStarted = true;
        void playOpening();
      }, 600);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && startTimer !== undefined) {
        window.clearTimeout(startTimer);
        startTimer = undefined;
        return;
      }

      startWhenReady();
    };

    const images = Array.from(root.querySelectorAll<HTMLImageElement>('[data-opening-image]'));

    document.addEventListener('visibilitychange', handleVisibilityChange);
    void Promise.all(images.map(image => image.decode())).then(() => {
      imagesDecoded = true;
      startWhenReady();
    }).catch(() => undefined);

    return () => {
      isDisposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (startTimer !== undefined) {
        window.clearTimeout(startTimer);
      }
    };
  }, [animate, artworkHidden, prefersReducedMotion, scope]);

  return (
    <section
      aria-labelledby="opening-name"
      className="relative flex h-svh w-full items-center justify-center overflow-x-clip"
      style={{ height: '100svh', overflow: 'clip' }}
    >
      <h1 className="sr-only" id="opening-name">{content.heading}</h1>
      <div
        className="relative bg-white"
        ref={scope}
        style={{
          aspectRatio: '1',
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
          width: 'min(calc(100vw - 32px), calc(100svh - 176px))',
        }}
      >
        {OPENING_BAND_LAYOUT.map(band => (
          <div
            className="absolute"
            key={`hero-${band.id}`}
            style={{
              height: `${band.heightPercent}%`,
              left: `${OPENING_FRAME_LAYOUT.leftPercent}%`,
              top: `${band.topPercent}%`,
              width: `${OPENING_FRAME_LAYOUT.widthPercent}%`,
            }}
          >
            <BandPicture alt={band.id === 'middle' ? content.heroAlt : ''} name={`hero-${band.id}`} />
          </div>
        ))}

        {!artworkHidden && (
          <div aria-hidden="true" className="absolute inset-0">
            {PIECE_IDS.map(pieceId => (
              <TornPiece key={pieceId} pieceId={pieceId} />
            ))}
          </div>
        )}
      </div>
      <p className="sr-only">{content.artworkCredit}</p>
    </section>
  );
}
