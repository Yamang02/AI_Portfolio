import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { ProfileHistoryMedia } from '../../content/types';
import { useInView } from '../../hooks/useInView';
import { historyAssets } from './historyAssets';

export type HistoryCardSide = 'left' | 'right';

interface HistoryCardProps {
  readonly title: string;
  readonly desc: string;
  readonly start: string;
  readonly end?: string;
  readonly href?: string;
  readonly media: ProfileHistoryMedia;
  readonly side: HistoryCardSide;
  readonly isActive: boolean;
  readonly presentLabel: string;
  readonly linkSuffix: string;
}

interface ResponsivePosterProps {
  readonly avif400: string;
  readonly webp400: string;
  readonly avif800: string;
  readonly webp800: string;
  readonly sizes: string;
}

interface HistoryMediaProps {
  readonly media: ProfileHistoryMedia;
  readonly isActive: boolean;
}

interface HistoryPeriodProps {
  readonly start: string;
  readonly end?: string;
  readonly presentLabel: string;
}

const MEDIA_SIZES = '(min-width: 768px) 220px, 96px';
const HOVER_SCALE = 'transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]';

function ResponsivePoster({ avif400, webp400, avif800, webp800, sizes }: ResponsivePosterProps) {
  return (
    <picture aria-hidden="true" className="block size-full">
      <source sizes={sizes} srcSet={avif400 + ' 400w, ' + avif800 + ' 800w'} type="image/avif" />
      <source sizes={sizes} srcSet={webp400 + ' 400w, ' + webp800 + ' 800w'} type="image/webp" />
      <img alt="" className={'size-full object-cover ' + HOVER_SCALE} loading="lazy" sizes={sizes} src={webp400} />
    </picture>
  );
}

function HistoryMedia({ media, isActive }: HistoryMediaProps) {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isMediaInView = useInView(mediaRef, { threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isVideo = media.type === 'video';
  const shouldPlay = isVideo && isActive && isMediaInView && !prefersReducedMotion;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !shouldPlay) {
      video?.pause();
      return;
    }

    void video.play().catch(() => undefined);

    return () => video.pause();
  }, [shouldPlay]);

  return (
    <div
      aria-hidden="true"
      className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden bg-surface-container-high md:w-[13.75rem]"
      ref={mediaRef}
    >
      {media.type === 'wordmark' && (
        <div className={'flex size-full items-center justify-center bg-surface-container-low px-4 ' + HOVER_SCALE}>
          <span className="font-brand text-[clamp(0.875rem,2.2vw,2rem)] leading-none text-brand-red">{media.text}</span>
        </div>
      )}
      {media.type === 'image' && <ResponsivePoster {...historyAssets.artclub} sizes={MEDIA_SIZES} />}
      {media.type === 'video' && (
        <>
          <ResponsivePoster
            avif400={historyAssets.design.posterAvif400}
            avif800={historyAssets.design.posterAvif800}
            sizes={MEDIA_SIZES}
            webp400={historyAssets.design.posterWebp400}
            webp800={historyAssets.design.posterWebp800}
          />
          <video
            className={'absolute inset-0 size-full object-cover ' + HOVER_SCALE}
            loop
            muted
            playsInline
            poster={historyAssets.design.posterWebp400}
            preload="none"
            ref={videoRef}
            src={shouldPlay ? historyAssets.design.video : undefined}
            style={{ display: prefersReducedMotion ? 'none' : undefined }}
          />
        </>
      )}
    </div>
  );
}

function HistoryPeriod({ start, end, presentLabel }: HistoryPeriodProps) {
  return (
    <span className="whitespace-nowrap font-label text-xs tabular-nums text-on-surface-variant md:text-sm">
      <time dateTime={start.replace('.', '-')}>{start}</time>
      {' — '}
      {end ? <time dateTime={end.replace('.', '-')}>{end}</time> : presentLabel}
    </span>
  );
}

export function HistoryCard({ title, desc, start, end, href, media, side, isActive, presentLabel, linkSuffix }: HistoryCardProps) {
  const isLeft = side === 'left';
  const className = 'group flex min-w-0 items-start gap-4 rounded-sm md:gap-5 ' + (isLeft ? 'md:flex-row-reverse' : '');
  const body = (
    <>
      <HistoryMedia isActive={isActive} media={media} />
      <div className={'flex min-w-0 flex-1 flex-col gap-1 md:gap-1.5 md:py-1 ' + (isLeft ? 'md:items-end md:text-right' : '')}>
        <div className={'flex w-full items-start gap-3 ' + (isLeft ? 'justify-between md:flex-row-reverse md:justify-start' : 'justify-between')}>
          <h4 className="font-headline text-lg font-semibold leading-tight text-on-surface md:text-2xl">
            {title}
          </h4>
          {href && (
            <span aria-hidden="true" className="pt-1 text-sm text-primary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
          )}
        </div>
        <p className="font-body text-sm leading-relaxed text-on-surface-variant">{desc}</p>
        <HistoryPeriod end={end} presentLabel={presentLabel} start={start} />
      </div>
    </>
  );

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <a
      aria-label={title + ' ' + linkSuffix}
      className={className + ' focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {body}
    </a>
  );
}
