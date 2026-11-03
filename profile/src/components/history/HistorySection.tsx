import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import type {
  ProfileCareerHistoryEntry,
  ProfileCourseHistoryEntry,
  ProfileHistoryContent,
  ProfileHistoryStep,
  ProfileWorkHistoryEntry,
} from '../../content/types';
import { BRANCH_RISE_PX, BRANCH_TOP_PX, HistoryBranchLine } from './HistoryBranchLine';
import { HistoryCard } from './HistoryCard';
import { HistoryNode } from './HistoryNode';
import { HistoryStem } from './HistoryStem';

interface HistorySectionProps {
  readonly content: ProfileHistoryContent;
}

interface HistoryRowProps<Entry> {
  readonly entry: Entry;
  readonly slot: number;
  readonly isActive: boolean;
  readonly prefersReducedMotion: boolean;
  readonly presentLabel: string;
  readonly linkSuffix: string;
}

interface HistoryStepPanelProps {
  readonly step: ProfileHistoryStep;
  readonly isActive: boolean;
  readonly prefersReducedMotion: boolean;
  readonly presentLabel: string;
  readonly linkSuffix: string;
}

interface HistoryYearHeaderProps {
  readonly steps: readonly ProfileHistoryStep[];
  readonly activeIndex: number;
  readonly onSelect: (index: number) => void;
}

const STEP_SVH = 45;
const ENTRY_SNAP_VIEWPORT_RATIO = 0.55;
const SCROLL_IDLE_MS = 140;
const CAREER_STROKE_PX = 4;
const WORK_STROKE_PX = 2;
const CAREER_DOT_PX = 24;
const SLOT_ROW_CLASSES = ['md:row-start-1', 'md:row-start-2'] as const;

function careerDotTop(rise: number) {
  return BRANCH_TOP_PX + rise + CAREER_STROKE_PX / 2 - CAREER_DOT_PX / 2;
}

function HistoryCareerRow({ entry, slot, isActive, prefersReducedMotion, presentLabel, linkSuffix }: HistoryRowProps<ProfileCareerHistoryEntry | ProfileCourseHistoryEntry>) {
  const rowClass = 'relative md:col-start-1 md:pr-10 ' + SLOT_ROW_CLASSES[slot];
  const dotTransition = prefersReducedMotion ? 'none' : 'background-color 500ms ease-out';

  if (entry.kind === 'course') {
    return (
      <li className={rowClass}>
        <span aria-hidden="true" className="absolute -left-[1.875rem] top-1 size-4 -translate-x-1/2 rounded-full border-[3px] border-primary bg-surface md:-right-6 md:left-auto md:translate-x-1/2" />
        <HistoryNode entry={entry} presentLabel={presentLabel} />
      </li>
    );
  }

  return (
    <li className={rowClass}>
      <span
        aria-hidden="true"
        className={'absolute -left-[1.875rem] z-10 size-6 -translate-x-1/2 rounded-full border-4 border-primary md:hidden ' + (isActive ? 'bg-primary' : 'bg-surface')}
        style={{ top: careerDotTop(BRANCH_RISE_PX.mobile), transition: dotTransition }}
      />
      <span
        aria-hidden="true"
        className={'absolute -right-6 z-10 hidden size-6 translate-x-1/2 rounded-full border-4 border-primary md:block ' + (isActive ? 'bg-primary' : 'bg-surface')}
        style={{ top: careerDotTop(BRANCH_RISE_PX.desktop), transition: dotTransition }}
      />
      <HistoryBranchLine isVisible={isActive} prefersReducedMotion={prefersReducedMotion} side="left" strokeWidth={CAREER_STROKE_PX} />
      <HistoryCard
        desc={entry.desc}
        end={entry.end}
        href={entry.href}
        isActive={isActive}
        linkSuffix={linkSuffix}
        media={entry.media}
        presentLabel={presentLabel}
        side="left"
        start={entry.start}
        title={entry.org}
      />
    </li>
  );
}

function HistoryWorkRow({ entry, slot, isActive, prefersReducedMotion, presentLabel, linkSuffix }: HistoryRowProps<ProfileWorkHistoryEntry>) {
  return (
    <li className={'relative md:col-start-3 md:pl-10 ' + SLOT_ROW_CLASSES[slot]}>
      <HistoryBranchLine isVisible={isActive} prefersReducedMotion={prefersReducedMotion} side="right" strokeWidth={WORK_STROKE_PX} />
      <HistoryCard
        desc={entry.desc}
        end={entry.end}
        href={entry.href}
        isActive={isActive}
        linkSuffix={linkSuffix}
        media={entry.media}
        presentLabel={presentLabel}
        side="right"
        start={entry.start}
        title={entry.title}
      />
    </li>
  );
}

function HistoryStepPanel({ step, isActive, prefersReducedMotion, presentLabel, linkSuffix }: HistoryStepPanelProps) {
  const careers = step.entries.filter((entry): entry is ProfileCareerHistoryEntry | ProfileCourseHistoryEntry => entry.kind !== 'work');
  const works = step.entries.filter((entry): entry is ProfileWorkHistoryEntry => entry.kind === 'work');
  const rowProps = { isActive, prefersReducedMotion, presentLabel, linkSuffix };

  return (
    <ul className="grid grid-cols-1 gap-y-6 pl-11 md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] md:gap-y-8 md:pl-0">
      {careers.map((entry, slot) => <HistoryCareerRow entry={entry} key={entry.id} slot={slot} {...rowProps} />)}
      {works.map((entry, slot) => <HistoryWorkRow entry={entry} key={entry.id} slot={slot} {...rowProps} />)}
    </ul>
  );
}

function HistoryYearHeader({ steps, activeIndex, onSelect }: HistoryYearHeaderProps) {
  return (
    <div className="absolute left-11 top-0 z-10 md:left-0">
      <div aria-hidden="true" className="h-[1.1em] overflow-hidden font-headline text-5xl leading-[1.1] text-secondary/80 md:text-8xl">
        <motion.div
          animate={{ y: -activeIndex * 1.1 + 'em' }}
          initial={false}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {steps.map(step => <div className="h-[1.1em] tabular-nums" key={step.id}>{step.label}</div>)}
        </motion.div>
      </div>
      <ol className="mt-3 flex gap-3 font-label text-xs tabular-nums md:mt-4 md:gap-4 md:text-sm">
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

function PinnedHistory({ content }: HistorySectionProps) {
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
          key={step.id}
          ref={element => { markerRefs.current[index] = element; }}
          style={{ top: index * STEP_SVH + 'svh' }}
        />
      ))}
      <div className="sticky top-0 flex h-svh flex-col pb-10 pt-[6.5rem]">
        <div className="relative mx-auto w-full max-w-6xl flex-1">
          <HistoryStem />
          <HistoryYearHeader activeIndex={activeIndex} onSelect={scrollToStep} steps={content.steps} />
          <ol className="absolute inset-x-0 bottom-0 top-36 md:top-[max(15rem,34svh)]">
            {content.steps.map((step, index) => {
              const isActive = index === activeIndex;
              const offset = index < activeIndex ? -48 : index > activeIndex ? 48 : 0;

              return (
                <motion.li
                  animate={{ opacity: isActive ? 1 : 0, y: offset }}
                  className={'absolute inset-0 ' + (isActive ? '' : 'pointer-events-none')}
                  initial={false}
                  key={step.id}
                  onFocusCapture={() => scrollToStep(index)}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <h3 className="sr-only">{step.label}</h3>
                  <HistoryStepPanel
                    isActive={isActive}
                    linkSuffix={content.linkSuffix}
                    prefersReducedMotion={false}
                    presentLabel={content.presentLabel}
                    step={step}
                  />
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function StaticHistory({ content }: HistorySectionProps) {
  return (
    <div className="relative mx-auto mb-28 max-w-6xl pt-28">
      <HistoryStem />
      <ol className="relative space-y-16">
        {content.steps.map(step => (
          <li key={step.id}>
            <h3 className="relative mb-8 ml-11 font-headline text-4xl leading-none text-secondary/80 md:ml-0 md:text-6xl">
              {step.label}
            </h3>
            <HistoryStepPanel isActive linkSuffix={content.linkSuffix} prefersReducedMotion presentLabel={content.presentLabel} step={step} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HistorySection({ content }: HistorySectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      aria-labelledby="history-heading"
      className="px-6 md:px-12 lg:px-20"
      id="history"
    >
      <div className="mx-auto max-w-screen-2xl">
        <h2 className="sr-only" id="history-heading">{content.label}</h2>
        {prefersReducedMotion ? <StaticHistory content={content} /> : <PinnedHistory content={content} />}
      </div>
    </section>
  );
}
