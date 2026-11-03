import { AnimatePresence, motion } from 'motion/react';

interface ScrollHintProps {
  readonly className?: string;
  readonly isAnimated?: boolean;
  readonly isVisible: boolean;
}

const defaultClassName = 'absolute bottom-6 left-1/2 -translate-x-1/2';

export function ScrollHint({ className = defaultClassName, isAnimated = true, isVisible }: ScrollHintProps) {
  return (
    <div aria-hidden="true" className={'pointer-events-none ' + className}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            animate={isAnimated ? { opacity: 1 } : undefined}
            className="flex flex-col items-center gap-2 font-label text-[10px] tracking-[0.3em] text-on-surface/60"
            exit={isAnimated ? { opacity: 0 } : undefined}
            initial={isAnimated ? { opacity: 0 } : false}
            transition={isAnimated ? { duration: 0.6, ease: 'easeOut' } : undefined}
          >
            <span className="pl-[0.3em]">SCROLL</span>
            <span className="relative block h-7 w-px overflow-hidden bg-on-surface/15">
              <motion.span
                animate={isAnimated ? { y: ['-100%', '100%'] } : undefined}
                className="absolute inset-0 bg-on-surface/60"
                transition={isAnimated ? { duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 } : undefined}
              />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
