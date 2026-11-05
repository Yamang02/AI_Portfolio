import { useEffect, useRef, useState } from 'react';
import { useLayoutEffect } from 'react';
import { useReducedMotion, motion } from 'motion/react';
import type { ProfileIntroContent } from '../../content/types';
import { useInView } from '../../hooks/useInView';
import { useRoleCycle } from '../../hooks/useRoleCycle';
import { IntroGreeting } from './IntroGreeting';
import { RoleBento } from './RoleBento';
import { RoleFact } from './RoleFact';
import { RoleTabs } from './RoleTabs';

interface IntroSectionProps {
  readonly content: ProfileIntroContent;
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function IntroSection({ content }: IntroSectionProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const hasEnteredRef = useRef(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(stageRef);
  const [isEntered, setIsEntered] = useState(true);
  const [isEntryAnimationComplete, setIsEntryAnimationComplete] = useState(false);
  const [isTabListFocused, setIsTabListFocused] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const cycle = useRoleCycle({
    roleCount: content.roles.length,
    isInView,
    isDocumentVisible,
    isTabListFocused,
    isEntryAnimationComplete,
    prefersReducedMotion,
  });
  const activeRole = content.roles[cycle.activeIndex];

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;

    if (prefersReducedMotion) {
      hasEnteredRef.current = true;
      setIsEntered(true);
      setIsEntryAnimationComplete(true);
      return;
    }

    if (!stage) {
      return;
    }

    const bounds = stage.getBoundingClientRect();
    const isInitiallyVisible = bounds.top < window.innerHeight && bounds.bottom > 0;

    if (!isInitiallyVisible) {
      setIsEntered(false);
      return;
    }

    hasEnteredRef.current = true;
    setIsEntryAnimationComplete(true);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const updateDocumentVisibility = () => setIsDocumentVisible(document.visibilityState === 'visible');

    updateDocumentVisibility();
    document.addEventListener('visibilitychange', updateDocumentVisibility);

    return () => document.removeEventListener('visibilitychange', updateDocumentVisibility);
  }, []);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    if (prefersReducedMotion) {
      hasEnteredRef.current = true;
      setIsEntered(true);
      setIsEntryAnimationComplete(true);
      return;
    }

    if (hasEnteredRef.current) {
      setIsEntryAnimationComplete(true);
      return;
    }

    hasEnteredRef.current = true;
    setIsEntered(true);
    setIsEntryAnimationComplete(false);
  }, [isInView, prefersReducedMotion]);

  const revealState = (delay: number) => isEntered
    ? {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const, delay },
    }
    : { opacity: 0, y: 24 };

  return (
    <section
      aria-labelledby="intro-name"
      className="px-6 pb-24 pt-[10svh] md:px-12 lg:px-20"
      id="identity"
    >
      <div className="mx-auto max-w-screen-2xl">
        <IntroGreeting activeIndex={cycle.activeIndex} content={content} />
        <div
          className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start lg:w-fit lg:grid-cols-[21rem_30rem]"
          ref={stageRef}
        >
          <motion.div
            animate={revealState(0)}
            className="w-full pl-12 font-headline text-[clamp(2.25rem,4.4vw,3.75rem)] font-medium leading-[1.15] tracking-tight md:max-w-[21rem] md:justify-self-end md:text-[clamp(2rem,3.5vw,3rem)]"
            initial={false}
          >
            <div className="relative">
              <button
                aria-label={cycle.playState === 'playing' ? content.pauseLabel : content.playLabel}
                className="ghost-icon-button absolute -left-10 -top-12 text-on-surface/70 transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={cycle.togglePlayback}
                type="button"
              >
                {cycle.playState === 'playing'
                  ? (
                    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
                    </svg>
                  )
                  : (
                    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
              </button>
              <RoleTabs
                activeIndex={cycle.activeIndex}
                onFocusChange={setIsTabListFocused}
                onSelect={cycle.selectRole}
                progress={cycle.progress}
                roles={content.roles}
                tabListLabel={content.tabListLabel}
              />
            </div>
            <RoleFact
              activeIndex={cycle.activeIndex}
              className="mt-8 max-w-full text-left font-body text-sm font-normal leading-relaxed tracking-normal md:mt-10 md:text-base"
              isAnnounced={!cycle.isRunning}
              roles={content.roles}
            />
          </motion.div>
          <motion.div
            animate={revealState(0.1)}
            className="w-full min-w-0 md:max-w-[44.5rem] md:justify-self-start lg:w-[30rem]"
            initial={false}
            onAnimationComplete={() => setIsEntryAnimationComplete(true)}
          >
            <div
              aria-labelledby={'intro-tab-' + activeRole.id}
              className="mx-auto w-full max-w-[44.5rem]"
              id="intro-tabpanel"
              role="tabpanel"
              tabIndex={0}
            >
              <div className="w-full">
                <RoleBento activeIndex={cycle.activeIndex} imageGroupLabel={content.imageGroupLabel} roles={content.roles} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
