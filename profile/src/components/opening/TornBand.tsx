import { motion, useReducedMotion, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { OPENING_BAND_LAYOUT, type OpeningBandId } from './bandLayout';
import { BandPicture } from './BandPicture';
import { getOpeningAssetUrl } from './openingAssets';

interface TornBandProps {
  readonly bandId: OpeningBandId;
  readonly scrollProgress: MotionValue<number>;
}

export function TornBand({ bandId, scrollProgress }: TornBandProps) {
  const prefersReducedMotion = useReducedMotion();
  const band = OPENING_BAND_LAYOUT.find(item => item.id === bandId);

  if (!band) {
    throw new Error(`Missing opening band layout: ${bandId}`);
  }

  const localProgress = useTransform(scrollProgress, [band.scrollStart, band.scrollEnd], [0, 1], { clamp: true });
  const leftX = useTransform(localProgress, [0, 1], ['0%', '-60%']);
  const leftY = useTransform(localProgress, [0, 1], ['0%', '-2%']);
  const leftRotate = useTransform(localProgress, [0, 1], ['0deg', '-4deg']);
  const rightX = useTransform(localProgress, [0, 1], ['0%', '60%']);
  const rightY = useTransform(localProgress, [0, 1], ['0%', '-1.5%']);
  const rightRotate = useTransform(localProgress, [0, 1], ['0deg', '3deg']);
  const pieceOpacity = useTransform(localProgress, [0, 0.7, 1], [1, 1, 0]);
  const shadowOpacity = useTransform(localProgress, [0, 0.45, 1], [0, 0.35, 0]);

  return (
    <div aria-hidden="true" className="absolute inset-0">
      <motion.img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-fill will-change-transform"
        decoding="async"
        src={getOpeningAssetUrl(`shadow-${bandId}-left.png`)}
        style={{
          z: 0,
          opacity: prefersReducedMotion ? 0 : shadowOpacity,
          x: prefersReducedMotion ? 0 : leftX,
          y: prefersReducedMotion ? 0 : leftY,
          rotate: prefersReducedMotion ? 0 : leftRotate,
        }}
      />
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          z: 0,
          opacity: pieceOpacity,
          x: prefersReducedMotion ? 0 : leftX,
          y: prefersReducedMotion ? 0 : leftY,
          rotate: prefersReducedMotion ? 0 : leftRotate,
        }}
      >
        <BandPicture alt="" highPriority={bandId === 'bottom'} name={`fallen-${bandId}-left`} />
        <img
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full motion-reduce:hidden"
          decoding="async"
          src={getOpeningAssetUrl(`tear-${bandId}-left.png`)}
        />
      </motion.div>
      <motion.img
        className="absolute inset-0 size-full object-fill will-change-transform"
        alt=""
        aria-hidden="true"
        decoding="async"
        src={getOpeningAssetUrl(`shadow-${bandId}-right.png`)}
        style={{
          z: 0,
          opacity: prefersReducedMotion ? 0 : shadowOpacity,
          x: prefersReducedMotion ? 0 : rightX,
          y: prefersReducedMotion ? 0 : rightY,
          rotate: prefersReducedMotion ? 0 : rightRotate,
        }}
      />
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          z: 0,
          opacity: pieceOpacity,
          x: prefersReducedMotion ? 0 : rightX,
          y: prefersReducedMotion ? 0 : rightY,
          rotate: prefersReducedMotion ? 0 : rightRotate,
        }}
      >
        <BandPicture alt="" name={`fallen-${bandId}-right`} />
        <img
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full motion-reduce:hidden"
          decoding="async"
          src={getOpeningAssetUrl(`tear-${bandId}-right.png`)}
        />
      </motion.div>
    </div>
  );
}
