import { AnimatePresence, motion } from 'motion/react';

interface ScrollHintProps {
  readonly isVisible: boolean;
}

export function ScrollHint({ isVisible }: ScrollHintProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 font-label text-[10px] tracking-[0.3em] text-on-surface/60"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="pl-[0.3em]">SCROLL</span>
            <span className="relative block h-7 w-px overflow-hidden bg-on-surface/15">
              <motion.span
                animate={{ y: ['-100%', '100%'] }}
                className="absolute inset-0 bg-on-surface/60"
                transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 }}
              />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
