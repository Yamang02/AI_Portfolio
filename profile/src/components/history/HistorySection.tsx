import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import type {
  ProfileHistoryContent,
  ProfileHistoryStep,
  ProfileLocale,
} from '../../content/types';
import { ScrollHint } from '../ScrollHint';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { HistoryCard } from './HistoryCard';
import { HistoryConnector } from './HistoryConnector';
import { HistoryStem } from './HistoryStem';
import { getHistoryLayout } from './historyLayout';
import type { HistoryLayout } from './historyLayout';
import './HistorySection.css';

interface HistorySectionProps {
  readonly content: ProfileHistoryContent;
  readonly locale: ProfileLocale;
}

interface HistoryStepPanelProps {
  readonly step: ProfileHistoryStep;
  readonly isActive: boolean;
  readonly prefersReducedMotion: boolean;
  readonly presentLabel: string;
  readonly linkSuffix: string;
  readonly layout: HistoryLayout;
  readonly locale: ProfileLocale;
}

interface HistoryViewProps extends HistorySectionProps {
  readonly layout: HistoryLayout;
}

interface HistoryYearHeaderProps {
  readonly steps: readonly ProfileHistoryStep[];
  readonly activeIndex: number;
  readonly onSelect: (index: number) => void;
}

const STEP_SVH = 45;
const ENTRY_SNAP_VIEWPORT_RATIO = 0.3;
const SCROLL_IDLE_MS = 140;
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function HistoryStepPanel({ step, isActive, prefersReducedMotion, presentLabel, linkSuffix, layout, locale }: HistoryStepPanelProps) {
  const entries = step.entries
    .map((entry, contentIndex) => ({ entry, contentIndex }))
    .sort((left, right) => right.entry.start.localeCompare(left.entry.start) || left.contentIndex - right.contentIndex);

  return (
    <ul className="history-panel">
      {entries.map(({ entry }, index) => {
        const side = index % 2 === 0 ? 'right' : 'left';
        return (
          <li className="history-card-slot" data-side={side} key={entry.id} style={{ gridRow: index + 1 }}>
            <HistoryConnector
              isActive={isActive}
              kind={entry.kind}
              isWide={layout.isWide}
              metrics={layout.metrics}
              prefersReducedMotion={prefersReducedMotion}
              side={side}
            />
            <HistoryCard
              subtitle={entry.subtitle}
              end={entry.end}
              href={entry.href}
              isActive={isActive}
              imageSizes={layout.thumbnailWidth + 'px'}
              linkSuffix={linkSuffix}
              locale={locale}
              media={entry.media}
              presentLabel={presentLabel}
              side={side}
              start={entry.start}
              title={entry.title}
            />
          </li>
        );
      })}
    </ul>
  );
}

function HistoryYearHeader({ steps, activeIndex, onSelect }: HistoryYearHeaderProps) {
  return (
    <div className="history-year-header">
      <div aria-hidden="true" className="history-year-wheel font-headline text-secondary/80">
        <motion.div
          animate={{ y: -activeIndex * 1.1 + 'em' }}
          initial={false}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {steps.map(step => <div className="h-[1.1em] tabular-nums" key={step.id}>{step.label}</div>)}
        </motion.div>
      </div>
      <ol className="history-year-navigation font-label tabular-nums">
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              aria-current={index === activeIndex ? 'step' : undefined}
              className={'rounded-sm transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary '
                + (index === activeIndex ? 'font-semibold text-primary' : 'text-on-surface-variant/60 hover:text-on-surface')}
              onClick={() => onSelect(index)}
              type="button"
            >
              {step.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PinnedHistory({ content, layout, locale }: HistoryViewProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const stepCount = content.steps.length;
  const lastIndex = Math.max(stepCount - 1, 1);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    setActiveIndex(Math.min(stepCount - 1, Math.max(0, Math.round(progress * lastIndex))));
  });

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    let lastScrollY = window.scrollY;
    let isScrollingDown = false;
    let isTouching = false;
    let idleTimer: number | undefined;

    const markerOffsets = () => {
      const trackTop = track.getBoundingClientRect().top;
      return markerRefs.current.map(marker => (marker ? marker.getBoundingClientRect().top - trackTop : 0));
    };

    const snap = () => {
      if (isTouching) {
        return;
      }

      const trackTop = track.getBoundingClientRect().top;
      const offsets = markerOffsets();
      const lastOffset = offsets[offsets.length - 1] ?? 0;
      const stepPx = offsets.length > 1 ? (offsets[1] ?? 0) - (offsets[0] ?? 0) : window.innerHeight;
      const scrolled = -trackTop;
      let target: number | undefined;

      if (trackTop > 0) {
        if (isScrollingDown && trackTop < window.innerHeight * ENTRY_SNAP_VIEWPORT_RATIO) {
          target = 0;
        }
      } else if (scrolled <= lastOffset) {
        target = offsets.reduce((nearest, offset) => (Math.abs(offset - scrolled) < Math.abs(nearest - scrolled) ? offset : nearest), 0);
      } else if (!isScrollingDown && scrolled - lastOffset < stepPx / 2) {
        target = lastOffset;
      }

      if (target !== undefined && Math.abs(target - scrolled) > 2) {
        window.scrollTo({ top: window.scrollY + trackTop + target, behavior: 'smooth' });
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY !== lastScrollY) {
        isScrollingDown = currentScrollY > lastScrollY;
        lastScrollY = currentScrollY;
      }

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(snap, SCROLL_IDLE_MS);
    };

    const handleTouchStart = () => {
      isTouching = true;
      window.clearTimeout(idleTimer);
    };

    const handleTouchEnd = () => {
      isTouching = false;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(snap, SCROLL_IDLE_MS);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.clearTimeout(idleTimer);
    };
  }, []);

  const scrollToStep = (index: number) => {
    const marker = markerRefs.current[index];

    if (!marker || index === activeIndex) {
      return;
    }

    window.scrollTo({ top: marker.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  };

  return (
    <div className="relative" ref={trackRef} style={{ height: 'calc(100svh + ' + (stepCount - 1) * STEP_SVH + 'svh)' }}>
      {content.steps.map((step, index) => (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-px"
          id={'history-year-' + step.id}
          key={step.id}
          ref={element => { markerRefs.current[index] = element; }}
          style={{ top: index * STEP_SVH + 'svh' }}
        />
      ))}
      <div className="history-pinned-frame">
        <div className="history-pinned-content">
          <HistoryStem isEnd={activeIndex === stepCount - 1} isStart={activeIndex === 0} />
          <HistoryYearHeader activeIndex={activeIndex} onSelect={scrollToStep} steps={content.steps} />
          <ol className="history-pinned-panels">
            {content.steps.map((step, index) => {
              const isActive = index === activeIndex;
              const offset = index < activeIndex ? -36 : index > activeIndex ? 36 : 0;

              return (
                <motion.li
                  animate={{ opacity: isActive ? 1 : 0, y: offset }}
                  className={'history-pinned-step ' + (isActive ? '' : 'pointer-events-none')}
                  data-active={isActive ? 'true' : 'false'}
                  data-history-step={step.id}
                  initial={false}
                  key={step.id}
                  onFocusCapture={() => scrollToStep(index)}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <h3 className="sr-only">{step.label}</h3>
                  <HistoryStepPanel
                    isActive={isActive}
                    linkSuffix={content.linkSuffix}
                    layout={layout}
                    locale={locale}
                    prefersReducedMotion={false}
                    presentLabel={content.presentLabel}
                    step={step}
                  />
                </motion.li>
              );
            })}
          </ol>
        </div>
        <ScrollHint
          className="history-pinned-hint"
          isVisible={activeIndex === stepCount - 1}
          label={content.scrollLabel}
        />
      </div>
    </div>
  );
}

function FlowHistory({ content, layout, prefersReducedMotion, locale }: HistoryViewProps & { readonly prefersReducedMotion: boolean }) {
  const navigationRef = useRef<HTMLElement | null>(null);
  const [navigationHeight, setNavigationHeight] = useState(0);
  const navigation = useMemo(() => content.steps.map(step => ({
    href: '#history-year-' + step.id,
    label: step.label,
  })), [content.steps]);
  const activeYear = useScrollSpy(navigation) ?? navigation[0]?.href.slice(1);

  useIsomorphicLayoutEffect(() => {
    const element = navigationRef.current;
    if (!element) return;
    const measure = () => setNavigationHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="history-flow" style={{ '--history-flow-navigation-height': navigationHeight + 'px' } as CSSProperties}>
      <nav aria-label={content.label} className="history-flow-navigation font-label tabular-nums" ref={navigationRef}>
        <ol>
          {navigation.map(item => (
            <li key={item.href}>
              <a
                aria-current={item.href.slice(1) === activeYear ? 'step' : undefined}
                className="text-on-surface-variant/70 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary aria-[current=step]:font-semibold aria-[current=step]:text-primary"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="history-flow-content">
        <HistoryStem />
        <ol className="history-flow-steps">
          {content.steps.map(step => (
            <li
              className="history-flow-step"
              data-active={'history-year-' + step.id === activeYear ? 'true' : 'false'}
              data-history-step={step.id}
              id={'history-year-' + step.id}
              key={step.id}
            >
              <h3 className="history-flow-year font-headline text-secondary/80">
                {step.label}
              </h3>
              <HistoryStepPanel isActive layout={layout} linkSuffix={content.linkSuffix} locale={locale} prefersReducedMotion={prefersReducedMotion} presentLabel={content.presentLabel} step={step} />
            </li>
          ))}
        </ol>
      </div>
      <ScrollHint className="relative mx-auto mt-10 flex justify-center" isAnimated={false} isVisible label={content.scrollLabel} />
    </div>
  );
}

function getLayoutStyle(layout: HistoryLayout): CSSProperties & { readonly [key: `--history-${string}`]: string } {
  const { metrics } = layout;
  return {
    '--history-stem-width': metrics.stemWidth + 'px',
    '--history-center-gap': metrics.centerGap + 'px',
    '--history-card-inset': metrics.cardInset + 'px',
    '--history-rail-x': metrics.railX + 'px',
    '--history-compact-inset': metrics.compactInset + 'px',
    '--history-stack-gap': metrics.stackGap + 'px',
    '--history-thumb-width': layout.thumbnailWidth + 'px',
    '--history-thumb-height': layout.thumbnailHeight + 'px',
    '--history-card-gap': layout.cardGap + 'px',
    '--history-year-size': layout.yearSize + 'px',
    '--history-frame-top': layout.frameTop + 'px',
    '--history-frame-bottom': layout.frameBottom + 'px',
    '--history-panel-top': layout.panelTop + 'px',
    '--history-hint-bottom': metrics.hintBottom + 'px',
    '--history-nav-height': layout.navHeight + 'px',
  };
}

export function HistorySection({ content, locale }: HistorySectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pendingYearRef = useRef<string | null>(null);
  const hasMeasuredRef = useRef(false);
  const cardCount = Math.max(1, ...content.steps.map(step => step.entries.length));
  const [layout, setLayout] = useState(() => getHistoryLayout({
    viewportWidth: 0, viewportHeight: 0, contentWidth: 420, cardCount,
  }));
  const previousLayoutRef = useRef(layout);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const contentElement = contentRef.current;
    const viewport = viewportRef.current;
    const nav = document.querySelector('nav');

    if (!section || !contentElement || !viewport) {
      return;
    }

    let measurementKey = '';
    const measure = () => {
      const input = {
        viewportWidth: window.innerWidth,
        viewportHeight: viewport.getBoundingClientRect().height,
        contentWidth: contentElement.clientWidth,
        rootFontSize: Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16,
        navHeight: nav?.getBoundingClientRect().height ?? 54,
        cardCount,
      };
      const nextKey = JSON.stringify(input);
      if (nextKey === measurementKey) return;
      measurementKey = nextKey;
      const calculated = getHistoryLayout(input);
      const next = prefersReducedMotion ? { ...calculated, mode: 'flow' as const } : calculated;
      const previous = previousLayoutRef.current;
      const isInitialMeasurement = !hasMeasuredRef.current;
      hasMeasuredRef.current = true;
      const sectionBounds = section.getBoundingClientRect();
      const isVisible = sectionBounds.top < input.viewportHeight && sectionBounds.bottom > input.navHeight;
      const steps = Array.from(contentElement.querySelectorAll<HTMLElement>('[data-history-step]'));
      const initialAnchor = isInitialMeasurement
        ? steps.find(step => step.id === window.location.hash.slice(1))
        : undefined;

      if (initialAnchor || (isVisible && (previous.mode !== next.mode || previous.isWide !== next.isWide || next.mode === 'pinned'))) {
        const reading = initialAnchor
          ?? (previous.mode === 'pinned' ? steps.find(step => step.dataset.active === 'true') : undefined)
          ?? steps.find(step => step.getBoundingClientRect().bottom > input.navHeight);
        pendingYearRef.current = reading?.dataset.historyStep ?? null;
      }

      previousLayoutRef.current = next;
      setLayout(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(contentElement);
    observer.observe(viewport);
    if (nav) observer.observe(nav);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [cardCount, prefersReducedMotion]);

  useIsomorphicLayoutEffect(() => {
    if (layout !== previousLayoutRef.current) return;
    const year = pendingYearRef.current;
    pendingYearRef.current = null;
    if (!year) return;
    const marker = document.getElementById('history-year-' + year);
    if (marker) {
      window.scrollTo({
        top: window.scrollY + marker.getBoundingClientRect().top - (layout.mode === 'flow' ? layout.frameTop : 0),
        behavior: 'instant',
      });
    }
  }, [layout]);

  return (
    <section
      aria-labelledby="history-heading"
      className="history-section"
      data-layout={prefersReducedMotion ? 'flow' : layout.mode}
      data-wide={layout.isWide ? 'true' : 'false'}
      id="history"
      ref={sectionRef}
      style={getLayoutStyle(layout)}
    >
      <div aria-hidden="true" className="history-viewport-measure" ref={viewportRef} />
      <div className="history-content" ref={contentRef}>
        <h2 className="sr-only" id="history-heading">{content.label}</h2>
        {prefersReducedMotion || layout.mode === 'flow'
          ? <FlowHistory content={content} layout={layout} locale={locale} prefersReducedMotion={prefersReducedMotion} />
          : <PinnedHistory content={content} layout={layout} locale={locale} />}
      </div>
    </section>
  );
}
