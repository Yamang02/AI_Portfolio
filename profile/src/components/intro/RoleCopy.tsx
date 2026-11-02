import { AnimatePresence, motion } from 'motion/react';
import type { ProfileIntroContent } from '../../content/types';

interface RoleCopyProps {
  readonly content: ProfileIntroContent;
  readonly activeIndex: number;
}

export function RoleCopy({ content, activeIndex }: RoleCopyProps) {
  const activeRole = content.roles[activeIndex];

  return (
    <div className="flex min-h-full flex-col justify-center py-4 md:py-12">
      <p className="font-label text-sm tracking-wide text-secondary md:text-base">{content.greeting}</p>
      <div className="relative mt-2 h-[clamp(4rem,9vw,7.5rem)] overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 font-headline text-[clamp(3rem,7vw,6rem)] font-medium leading-none tracking-tight text-primary"
            exit={{ opacity: 0, y: -24 }}
            initial={{ opacity: 0, y: 24 }}
            key={activeRole.id}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {activeRole.label}
          </motion.p>
        </AnimatePresence>
      </div>
      <h1 className="mt-1 font-headline text-3xl font-semibold tracking-tight text-on-surface md:text-4xl" id="intro-name">
        {content.name}
      </h1>
      <div
        aria-label="역할별 소개"
        className="relative mt-6 min-h-16 text-base leading-relaxed text-on-surface-variant md:mt-8 md:text-lg"
        role="group"
      >
        {content.roles.map((role, index) => (
          <motion.p
            animate={{ opacity: activeIndex === index ? 1 : 0 }}
            className="absolute inset-0"
            key={role.id}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {role.fact}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
