import { useEffect, useRef, useState } from 'react';
import { useLayoutEffect } from 'react';
import { useReducedMotion, motion } from 'motion/react';
import type { ProfileIntroContent } from '../../content/types';
import { useInView } from '../../hooks/useInView';
import { useRoleCycle } from '../../hooks/useRoleCycle';
import { RoleBento } from './RoleBento';
import { RoleCopy } from './RoleCopy';
import { RoleTabs } from './RoleTabs';

interface IntroSectionProps {
  readonly content: ProfileIntroContent;
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function IntroSection({ content }: IntroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasEnteredRef = useRef(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(sectionRef);
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
    const section = sectionRef.current;

    if (prefersReducedMotion) {
      hasEnteredRef.current = true;
      setIsEntered(true);
      setIsEntryAnimationComplete(true);
      return;
    }

    if (!section) {
      return;
    }

    const bounds = section.getBoundingClientRect();
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
      className="px-6 pb-24 md:px-12 lg:px-20"
      id="identity"
      ref={sectionRef}
      style={{ paddingTop: '12svh' }}
    >
      <div className="mx-auto max-w-screen-2xl">
        <motion.div
          animate={revealState(0)}
          className="mb-8 flex items-start gap-5 border-t border-outline-variant/50 pt-4 md:mb-12 md:gap-8"
          initial={false}
        >
          <RoleTabs
            activeIndex={cycle.activeIndex}
            onFocusChange={setIsTabListFocused}
            onSelect={cycle.selectRole}
            progress={cycle.progress}
            roles={content.roles}
            tabListLabel={content.tabListLabel}
          />
          <button
            aria-label={cycle.playState === 'playing' ? content.pauseLabel : content.playLabel}
            className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/60 text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={cycle.togglePlayback}
            type="button"
          >
            {cycle.playState === 'playing'
              ? (
                <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
                </svg>
              )
              : (
                <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
          </button>
        </motion.div>
        <div
          aria-labelledby={'intro-tab-' + activeRole.id}
          aria-live={cycle.isRunning ? 'off' : 'polite'}
          className="grid items-center gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-12 xl:gap-20"
          id="intro-tabpanel"
          role="tabpanel"
          tabIndex={0}
        >
          <motion.div animate={revealState(0.1)} initial={false}>
            <RoleCopy activeIndex={cycle.activeIndex} content={content} />
          </motion.div>
          <motion.div
            animate={revealState(0.2)}
            className="min-w-0"
            initial={false}
            onAnimationComplete={() => setIsEntryAnimationComplete(true)}
          >
            <RoleBento activeIndex={cycle.activeIndex} roles={content.roles} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
