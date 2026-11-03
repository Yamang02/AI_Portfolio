import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import connectPosterAvif from '../assets/connect/monet-connect-poster.avif';
import connectPosterWebp from '../assets/connect/monet-connect-poster.webp';
import connectVideo from '../assets/connect/monet-connect-loop.mp4';
import { AnimatedMailIcon, ExternalLinkIcon } from './Icon';
import type { ProfileSiteContent } from '../content/types';
import { useInView } from '../hooks/useInView';

const connectRowClassName = 'group flex min-h-12 w-full items-center gap-2 text-left text-[#253b30] transition-colors duration-200 hover:bg-white/15 hover:text-[#253b30] focus-visible:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253b30] motion-reduce:transition-none';
const connectExternalRowClassName = `${connectRowClassName} pr-5`;
const connectMarkSlotClassName = 'flex w-16 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none';

type ConnectMarkName = 'company' | 'email' | 'portfolio' | 'threads';

interface ConnectMarkProps {
  readonly name: ConnectMarkName;
}

function ConnectMark({ name }: ConnectMarkProps) {
  if (name === 'company') {
    return (
      <svg aria-hidden="true" className="size-6" fill="currentColor" focusable="false" viewBox="0 0 24 24">
        <path d="M15.75 10C15.75 10.4142 15.4142 10.75 15 10.75H14C13.5858 10.75 13.25 10.4142 13.25 10C13.25 9.58579 13.5858 9.25 14 9.25H15C15.4142 9.25 15.75 9.58579 15.75 10Z" />
        <path d="M15 7.75C15.4142 7.75 15.75 7.41421 15.75 7C15.75 6.58579 15.4142 6.25 15 6.25H14C13.5858 6.25 13.25 6.58579 13.25 7C13.25 7.41421 13.5858 7.75 14 7.75H15Z" />
        <path d="M15.75 13C15.75 13.4142 15.4142 13.75 15 13.75H14C13.5858 13.75 13.25 13.4142 13.25 13C13.25 12.5858 13.5858 12.25 14 12.25H15C15.4142 12.25 15.75 12.5858 15.75 13Z" />
        <path d="M10 10.75C10.4142 10.75 10.75 10.4142 10.75 10C10.75 9.58579 10.4142 9.25 10 9.25H9C8.58579 9.25 8.25 9.58579 8.25 10C8.25 10.4142 8.58579 10.75 9 10.75H10Z" />
        <path d="M10.75 7C10.75 7.41421 10.4142 7.75 10 7.75H9C8.58579 7.75 8.25 7.41421 8.25 7C8.25 6.58579 8.58579 6.25 9 6.25H10C10.4142 6.25 10.75 6.58579 10.75 7Z" />
        <path d="M10 13.75C10.4142 13.75 10.75 13.4142 10.75 13C10.75 12.5858 10.4142 12.25 10 12.25H9C8.58579 12.25 8.25 12.5858 8.25 13C8.25 13.4142 8.58579 13.75 9 13.75H10Z" />
        <path clipRule="evenodd" d="M8.7679 1.25H15.2321C16.0449 1.24999 16.7006 1.24999 17.2315 1.29336C17.7781 1.33803 18.2582 1.43239 18.7025 1.65873C19.4081 2.01825 19.9818 2.59193 20.3413 3.29754C20.5676 3.74175 20.662 4.2219 20.7066 4.76853C20.75 5.29944 20.75 5.95505 20.75 6.76788V21.25H22C22.4142 21.25 22.75 21.5858 22.75 22C22.75 22.4142 22.4142 22.75 22 22.75H2C1.58579 22.75 1.25 22.4142 1.25 22C1.25 21.5858 1.58579 21.25 2 21.25H3.25L3.25 6.7679C3.24999 5.95506 3.24999 5.29944 3.29336 4.76853C3.33803 4.2219 3.43239 3.74175 3.65873 3.29754C4.01825 2.59193 4.59193 2.01825 5.29754 1.65873C5.74175 1.43239 6.2219 1.33803 6.76853 1.29336C7.29944 1.24999 7.95506 1.25 8.7679 1.25ZM4.75 21.25H8.75V17C8.75 16.0335 9.5335 15.25 10.5 15.25H13.5C14.4665 15.25 15.25 16.0335 15.25 17V21.25H19.25V6.8C19.25 5.94755 19.2494 5.35331 19.2116 4.89068C19.1745 4.43681 19.1054 4.17604 19.0048 3.97852C18.789 3.55516 18.4448 3.21095 18.0215 2.99524C17.824 2.8946 17.5632 2.82547 17.1093 2.78838C16.6467 2.75058 16.0525 2.75 15.2 2.75H8.8C7.94755 2.75 7.35331 2.75058 6.89068 2.78838C6.4368 2.82547 6.17604 2.8946 5.97852 2.99524C5.55516 3.21095 5.21095 3.55516 4.99524 3.97852C4.8946 4.17604 4.82547 4.43681 4.78838 4.89068C4.75058 5.35331 4.75 5.94755 4.75 6.8V21.25ZM13.75 21.25V17C13.75 16.8619 13.6381 16.75 13.5 16.75H10.5C10.3619 16.75 10.25 16.8619 10.25 17V21.25H13.75Z" fillRule="evenodd" />
      </svg>
    );
  }

  if (name === 'portfolio') {
    return (
      <svg aria-hidden="true" className="size-6" fill="currentColor" focusable="false" viewBox="0 0 24 24">
        <path clipRule="evenodd" d="M8.25 18C8.25 17.5858 8.58579 17.25 9 17.25H15C15.4142 17.25 15.75 17.5858 15.75 18C15.75 18.4142 15.4142 18.75 15 18.75H9C8.58579 18.75 8.25 18.4142 8.25 18Z" fillRule="evenodd" />
        <path clipRule="evenodd" d="M8.69935 1.25001H15.3004C15.5203 1.24995 15.6888 1.2499 15.8362 1.26571C17.1903 1.41104 18.2268 2.52307 18.2897 3.87013C19.4805 4.22571 20.3289 5.3275 20.3443 6.59118C20.9453 6.77151 21.4637 7.05595 21.888 7.51432C22.54 8.21857 22.7421 9.08649 22.7498 10.1003C22.7572 11.075 22.5835 12.3067 22.3678 13.8363L21.9288 16.9499C21.7602 18.146 21.6232 19.1176 21.4101 19.879C21.1871 20.6756 20.8585 21.331 20.25 21.8349C19.6463 22.3347 18.9301 22.5502 18.0835 22.6518C17.265 22.75 16.2353 22.75 14.9532 22.75H9.04687C7.76478 22.75 6.73501 22.75 5.91647 22.6518C5.06993 22.5502 4.35372 22.3347 3.75003 21.8349C3.14152 21.331 2.81286 20.6756 2.58989 19.879C2.37676 19.1176 2.23979 18.146 2.07118 16.9499L1.63219 13.8363C1.41651 12.3067 1.24283 11.075 1.25023 10.1003C1.25792 9.08649 1.45997 8.21857 2.11196 7.51432C2.53621 7.05606 3.05445 6.77164 3.65528 6.5913C3.67058 5.3275 4.51917 4.22559 5.71005 3.87007C5.77295 2.52304 6.80943 1.41102 8.16359 1.26571C8.31094 1.2499 8.4795 1.24995 8.69935 1.25001ZM5.18902 6.32785C6.11481 6.24999 7.24973 6.25 8.61594 6.25001H15.384C16.75 6.25 17.8848 6.24999 18.8105 6.32781C18.6734 5.72018 18.1306 5.25001 17.4617 5.25001H6.53787C5.86896 5.25001 5.32618 5.72019 5.18902 6.32785ZM15.6761 2.75715C16.2263 2.8162 16.6611 3.22633 16.7677 3.75001H7.2321C7.33862 3.22633 7.77344 2.8162 8.32365 2.75715C8.37993 2.75111 8.46013 2.75001 8.74099 2.75001H15.2588C15.5396 2.75001 15.6198 2.75111 15.6761 2.75715ZM3.21267 8.53336C3.51557 8.20618 3.97106 7.98917 4.85612 7.87145C5.75726 7.75159 6.96357 7.75001 8.67239 7.75001H15.3276C17.0364 7.75001 18.2427 7.75159 19.1439 7.87145C20.0289 7.98917 20.4844 8.20618 20.7873 8.53336C21.0832 8.85293 21.2436 9.28782 21.2498 10.1117C21.2563 10.9618 21.1002 12.0828 20.8738 13.6883L20.4509 16.6883C20.2731 17.9491 20.1486 18.821 19.9656 19.4747C19.7894 20.1042 19.582 20.4405 19.2934 20.6795C18.9999 20.9225 18.6058 21.0784 17.9048 21.1625C17.1861 21.2488 16.2465 21.25 14.9046 21.25H9.09536C7.75347 21.25 6.81372 21.2488 6.09519 21.1625C5.39417 20.1042 5.00014 20.9225 4.70664 20.6795C4.41795 20.4405 4.21058 20.1042 4.03437 19.4747C3.8514 18.821 3.7269 17.9491 3.54913 16.6883L3.12616 13.6883C2.89981 12.0828 2.74373 10.9618 2.75018 10.1117C2.75644 9.28782 2.91681 8.85293 3.21267 8.53336Z" fillRule="evenodd" />
      </svg>
    );
  }

  if (name === 'threads') {
    return (
      <svg aria-hidden="true" className="size-6" fill="currentColor" focusable="false" viewBox="0 0 192 192">
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5616 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.962 169.331 37.0353 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.596 141.537 88.9883ZM98.4405 129.507C88.0004 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
      </svg>
    );
  }

  return (
    <AnimatedMailIcon className="size-6" />
  );
}

interface ConnectControlContentsProps {
  readonly external?: boolean;
  readonly label: string;
  readonly mark: ConnectMarkName;
}

function ConnectControlContents({ external = false, label, mark }: ConnectControlContentsProps) {
  return (
    <>
      <span aria-hidden="true" className={connectMarkSlotClassName}>
        <ConnectMark name={mark} />
      </span>
      <span className="min-w-0 flex-1 font-body text-sm font-normal leading-relaxed tracking-normal text-[#253b30] sm:text-base">
        {label}
      </span>
      {external ? (
        <ExternalLinkIcon className="size-4 shrink-0 text-[#253b30]/65 transition-colors duration-300 group-hover:text-[#253b30] motion-reduce:transition-none" />
      ) : (
        <span aria-hidden="true" className="size-4 shrink-0" />
      )}
    </>
  );
}

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
        <div className="w-full text-center md:mr-[3%] md:max-w-[31rem] lg:max-w-[34rem]">
          <h2 className="mb-5 font-brand text-[2rem] leading-tight tracking-tight text-[#253b30] opacity-0 sm:mb-7 sm:text-[2.5rem] md:text-[3.5rem]">
            {content.title}
          </h2>
          <ul
            aria-hidden={!isBackgroundVisible}
            aria-label="연결 링크"
            className={`mx-auto grid w-full max-w-[23rem] grid-cols-1 divide-y divide-[#253b30]/25 border-y border-[#253b30]/25 bg-[#edf3e8]/15 backdrop-blur-[2px] ${isBackgroundVisible ? 'visible' : 'invisible'}`}
          >
            <li
              className={`transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none ${isBackgroundVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: isBackgroundVisible && !prefersReducedMotion ? '500ms' : '0ms' }}
            >
              <button
                aria-label={`${content.contactLabel} 연락하기`}
                className={connectRowClassName}
                onClick={onOpenContact}
                type="button"
              >
                <ConnectControlContents label="연락하기" mark="email" />
              </button>
            </li>
            <li
              className={`transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none ${isBackgroundVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: isBackgroundVisible && !prefersReducedMotion ? '610ms' : '0ms' }}
            >
              <a
                aria-label={`${content.companyLabel} 홈페이지 열기`}
                className={connectExternalRowClassName}
                href={content.companyHref}
                rel="noreferrer"
                target="_blank"
              >
                <ConnectControlContents external label={`${content.companyLabel} 홈페이지`} mark="company" />
              </a>
            </li>
            <li
              className={`transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none ${isBackgroundVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: isBackgroundVisible && !prefersReducedMotion ? '720ms' : '0ms' }}
            >
              <a
                aria-label="포트폴리오 사이트 열기"
                className={connectExternalRowClassName}
                href={content.portfolioHref}
                rel="noreferrer"
                target="_blank"
              >
                <ConnectControlContents external label="포트폴리오 사이트" mark="portfolio" />
              </a>
            </li>
            <li
              className={`transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none ${isBackgroundVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: isBackgroundVisible && !prefersReducedMotion ? '830ms' : '0ms' }}
            >
              <a
                aria-label={`Threads 프로필 ${content.threadsHandle} 열기`}
                className={connectExternalRowClassName}
                href={content.threadsHref}
                rel="noreferrer"
                target="_blank"
              >
                <ConnectControlContents external label={`threads(${content.threadsHandle})`} mark="threads" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
