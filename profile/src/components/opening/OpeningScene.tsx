import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import type { ProfileOpening } from '../../content/types';
import { OPENING_BAND_LAYOUT, OPENING_FRAME_LAYOUT } from './bandLayout';
import { BandPicture } from './BandPicture';
import { TornBand } from './TornBand';

interface OpeningSceneProps {
  readonly content: ProfileOpening;
}

export function OpeningScene({ content }: OpeningSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const prefersReducedMotion = useReducedMotion();
  const textOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1], { clamp: true });
  const brandY = useTransform(scrollYProgress, [0.85, 1], ['14px', '0px'], { clamp: true });
  const nameY = useTransform(scrollYProgress, [0.85, 1], ['18px', '0px'], { clamp: true });

  return (
    <section
      aria-labelledby="opening-name"
      className="relative w-full overflow-x-clip"
      ref={sectionRef}
      style={{ height: '250svh' }}
    >
      <div className="sticky top-0 flex h-svh w-full items-center justify-center will-change-transform">
        <div
          className="relative bg-white"
          style={{
            aspectRatio: '1',
            containerType: 'inline-size',
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

          {OPENING_BAND_LAYOUT.map(band => (
            <div
              className="absolute"
              key={`fallen-${band.id}`}
              style={{
                height: `${band.heightPercent}%`,
                left: `${OPENING_FRAME_LAYOUT.leftPercent}%`,
                top: `${band.topPercent}%`,
                width: `${OPENING_FRAME_LAYOUT.widthPercent}%`,
              }}
            >
              <TornBand bandId={band.id} scrollProgress={scrollYProgress} />
            </div>
          ))}

          <motion.div
            className="absolute z-30 flex items-center justify-end pr-[5%] text-right font-brand text-brand-red"
            style={{
              fontSize: 'clamp(1.5rem, 9cqw, 5.5rem)',
              height: `${OPENING_BAND_LAYOUT[0].heightPercent}%`,
              left: `${OPENING_FRAME_LAYOUT.leftPercent}%`,
              opacity: textOpacity,
              top: `${OPENING_BAND_LAYOUT[0].topPercent}%`,
              width: `${OPENING_FRAME_LAYOUT.widthPercent}%`,
              y: prefersReducedMotion ? 0 : brandY,
            }}
          >
            {content.brand}
          </motion.div>
          <motion.div
            className="absolute z-30 flex items-end pb-[3%] pl-[5%]"
            style={{
              height: `${OPENING_BAND_LAYOUT[2].heightPercent}%`,
              left: `${OPENING_FRAME_LAYOUT.leftPercent}%`,
              opacity: textOpacity,
              top: `${OPENING_BAND_LAYOUT[2].topPercent}%`,
              width: `${OPENING_FRAME_LAYOUT.widthPercent}%`,
              y: prefersReducedMotion ? 0 : nameY,
            }}
          >
            <h1
              className="font-headline font-semibold tracking-[0.08em] text-white"
              id="opening-name"
              style={{
                fontSize: 'clamp(2rem, 8.4cqw, 5rem)',
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.48)',
              }}
            >
              {content.name}
            </h1>
          </motion.div>
        </div>
      </div>
      <p className="sr-only">{content.artworkCredit}</p>
    </section>
  );
}
