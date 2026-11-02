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

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % roles.length;
    } else if (event.key === 'ArrowLeft') {
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
      className="no-scrollbar min-w-0 flex-1 overflow-x-auto"
      onBlurCapture={event => {
        const nextTarget = event.relatedTarget;
        onFocusChange(nextTarget instanceof Node && event.currentTarget.contains(nextTarget));
      }}
      onFocusCapture={() => onFocusChange(true)}
    >
      <div aria-label={tabListLabel} className="flex min-w-max gap-5 md:gap-8" role="tablist">
        {roles.map((role, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              aria-controls="intro-tabpanel"
              aria-posinset={index + 1}
              aria-selected={isActive}
              aria-setsize={roles.length}
              className="relative min-h-12 shrink-0 px-0.5 pb-3 pt-1 font-label text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary aria-selected:text-on-surface md:text-base"
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
              {role.label}
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                style={{
                  scaleX: isActive ? progress : 0,
                  transformOrigin: 'left',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
