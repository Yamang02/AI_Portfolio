import { useRef } from 'react';
import { motion } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { ProfileIntroRole } from '../../content/types';

interface RoleTabsProps {
  readonly roles: readonly ProfileIntroRole[];
  readonly activeIndex: number;
  readonly progress: MotionValue<number>;
  readonly tabListLabel: string;
  readonly onSelect: (index: number) => void;
  readonly onFocusChange: (isFocused: boolean) => void;
}

export function RoleTabs({
  roles,
  activeIndex,
  progress,
  tabListLabel,
  onSelect,
  onFocusChange,
}: RoleTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowDown') {
      nextIndex = (index + 1) % roles.length;
    } else if (event.key === 'ArrowUp') {
      nextIndex = (index - 1 + roles.length) % roles.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = roles.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      onSelect(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      aria-label={tabListLabel}
      aria-orientation="vertical"
      className="flex flex-col items-start"
      onBlurCapture={event => {
        const nextTarget = event.relatedTarget;
        onFocusChange(nextTarget instanceof Node && event.currentTarget.contains(nextTarget));
      }}
      onFocusCapture={() => onFocusChange(true)}
      role="tablist"
    >
      {roles.map((role, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            aria-controls="intro-tabpanel"
            aria-posinset={index + 1}
            aria-selected={isActive}
            aria-setsize={roles.length}
            className="group relative min-h-11 text-left text-on-surface-variant/40 transition-colors duration-300 hover:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary aria-selected:text-primary"
            id={'intro-tab-' + role.id}
            key={role.id}
            onClick={() => onSelect(index)}
            onKeyDown={event => handleKeyDown(event, index)}
            ref={element => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="absolute -left-[46px] top-1/2 size-4 -translate-x-1 -translate-y-1/2 text-primary opacity-0 transition-[opacity,translate] duration-200 group-aria-selected:translate-x-0 group-aria-selected:opacity-100 md:-left-[50px] md:size-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="m9 5 7 7-7 7" />
            </svg>
            <span aria-hidden="true" className="absolute inset-y-0.5 -left-5 w-0.5 overflow-hidden bg-outline-variant/60">
              <motion.span
                className="block size-full origin-top bg-primary"
                style={{ scaleY: isActive ? progress : 0 }}
              />
            </span>
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
