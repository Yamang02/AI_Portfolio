import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import connectPosterAvif from '../assets/connect/monet-connect-poster.avif';
import connectPosterWebp from '../assets/connect/monet-connect-poster.webp';
import connectVideo from '../assets/connect/monet-connect-loop.mp4';
import type { ProfileSiteContent } from '../content/types';
import { useInView } from '../hooks/useInView';

const circleCtaClassName = 'flex size-[94px] flex-col items-center justify-center rounded-[50%] border border-[#253b30]/15 bg-[#fffaf0]/90 px-2 text-center text-[#253b30] shadow-[0_12px_34px_rgba(23,36,29,0.2)] transition duration-300 hover:-translate-y-1.5 hover:scale-105 hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#253b30] focus-visible:ring-offset-2 sm:size-[116px] md:size-[148px]';

interface ConnectSectionProps {
  readonly content: ProfileSiteContent['connect'];
  readonly onOpenContact: () => void;
}

export function ConnectSection({ content, onOpenContact }: ConnectSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isInView = useInView(sectionRef, { threshold: 0.05 });
  const hasPassedRevealPoint = useInView(sectionRef, { threshold: 0.5 });
  const prefersReducedMotion = useReducedMotion() ?? false;
  const shouldPlay = isInView && !prefersReducedMotion;
  const isBackgroundVisible = prefersReducedMotion || hasPassedRevealPoint;

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
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-surface"
      id="connect"
      ref={sectionRef}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-out motion-reduce:transition-none ${isBackgroundVisible ? (prefersReducedMotion ? 'opacity-100 delay-0' : 'opacity-100 delay-500') : 'opacity-0 delay-0'}`}
      >
        <picture className="absolute inset-0 block size-full">
          <source srcSet={connectPosterAvif} type="image/avif" />
          <img
            alt=""
            className="size-full object-cover object-[30%_50%] md:object-center"
            decoding="async"
            loading="lazy"
            src={connectPosterWebp}
          />
        </picture>
        {!prefersReducedMotion && (
          <video
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-[30%_50%] md:object-center"
            loop
            muted
            playsInline
            preload="none"
            ref={videoRef}
            src={shouldPlay ? connectVideo : undefined}
            tabIndex={-1}
          />
        )}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] backdrop-blur-[14px] [mask-image:radial-gradient(ellipse_at_center,transparent_74%,black_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_74%,black_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: 'linear-gradient(180deg, #f8f9fa 0%, rgba(248,249,250,0.92) 5%, rgba(248,249,250,0.76) 12%, rgba(248,249,250,0.32) 22%, transparent 34%, transparent 100%)',
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl items-start justify-center px-5 pb-8 pt-[clamp(5rem,10vh,7rem)] md:items-start md:justify-end md:px-16 md:pb-8 md:pt-16">
        <div className="w-full text-center md:mr-[3%] md:max-w-[31rem]">
          <h2
            className={`mb-5 font-brand text-[2rem] leading-tight tracking-tight text-[#253b30] drop-shadow-[0_1px_5px_rgba(255,255,255,0.7)] transition-all duration-500 ease-out motion-reduce:transition-none sm:mb-7 sm:text-[2.5rem] md:text-[3.5rem] ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            {content.title}
          </h2>
          <div
            aria-hidden={!isBackgroundVisible}
            className={`mx-auto grid w-fit grid-cols-2 justify-items-center gap-3 transition-[opacity,visibility] duration-500 ease-out motion-reduce:transition-none sm:gap-5 md:gap-6 ${isBackgroundVisible ? (prefersReducedMotion ? 'visible opacity-100 delay-0' : 'visible opacity-100 delay-500') : 'invisible opacity-0 delay-0'}`}
          >
            <a
              aria-label={content.companyLabel}
              className={circleCtaClassName}
              href={content.companyHref}
              rel="noreferrer"
              target="_blank"
            >
              <span className="font-label text-[9px] uppercase tracking-[0.16em] text-[#53655a] sm:text-[10px]">Yamang</span>
              <span className="mt-1 font-body text-xs font-semibold leading-tight sm:text-sm md:text-base">{content.companyLabel}</span>
              <span className="mt-1 font-label text-[8px] uppercase tracking-wider text-[#53655a] sm:text-[9px]">Website ↗</span>
            </a>
            <a
              aria-label={content.portfolioLabel}
              className={circleCtaClassName}
              href={content.portfolioHref}
              rel="noreferrer"
              target="_blank"
            >
              <span className="font-label text-[9px] uppercase tracking-[0.16em] text-[#53655a] sm:text-[10px]">Personal</span>
              <span className="mt-1 font-body text-xs font-semibold leading-tight sm:text-sm md:text-base">{content.portfolioLabel}</span>
              <span className="mt-1 font-label text-[8px] uppercase tracking-wider text-[#53655a] sm:text-[9px]">Portfolio ↗</span>
            </a>
            <button
              aria-label={content.contactLabel}
              className={circleCtaClassName}
              onClick={onOpenContact}
              type="button"
            >
              <span className="font-label text-[9px] uppercase tracking-[0.16em] text-[#53655a] sm:text-[10px]">Get in touch</span>
              <span className="mt-1 font-body text-xs font-semibold leading-tight sm:text-sm md:text-base">{content.contactLabel}</span>
              <span className="mt-1 font-label text-[8px] uppercase tracking-wider text-[#53655a] sm:text-[9px]">Email</span>
            </button>
            <a
              aria-label={content.threadsLabel + ' ' + content.threadsHandle}
              className={circleCtaClassName}
              href={content.threadsHref}
              rel="noreferrer"
              target="_blank"
            >
              <span className="font-label text-[9px] uppercase tracking-[0.16em] text-[#53655a] sm:text-[10px]">Social</span>
              <span className="mt-1 font-body text-xs font-semibold leading-tight sm:text-sm md:text-base">{content.threadsLabel}</span>
              <span className="mt-1 font-label text-[8px] tracking-wide text-[#53655a] sm:text-[9px]">{content.threadsHandle}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
