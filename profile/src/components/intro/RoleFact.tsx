import type { ProfileIntroRole } from '../../content/types';

interface RoleFactProps {
  readonly roles: readonly ProfileIntroRole[];
  readonly activeIndex: number;
  readonly isAnnounced: boolean;
  readonly className?: string;
}

export function RoleFact({ roles, activeIndex, isAnnounced, className = '' }: RoleFactProps) {
  return (
    <div
      aria-live={isAnnounced ? 'polite' : 'off'}
      className={'grid leading-relaxed text-on-surface-variant ' + className}
    >
      {roles.map((role, index) => {
        const isActive = index === activeIndex;

        return (
          <p
            aria-hidden={!isActive}
            className="transition-opacity duration-300 ease-in-out [grid-area:1/1]"
            key={role.id}
            style={{ opacity: isActive ? 1 : 0 }}
          >
            {role.fact}
          </p>
        );
      })}
    </div>
  );
}
