import { useEffect, useState } from 'react';
import type { ProfileSiteContent } from '../content/types';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { AnimatedMailIcon } from './Icon';

interface NavProps {
  readonly content: ProfileSiteContent;
  readonly onOpenContact: () => void;
}

export function Nav({ content, onOpenContact }: NavProps) {
  const [logoText, setLogoText] = useState(content.logoTexts[0] ?? '');
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const activeSection = useScrollSpy(content.navigation);

  useEffect(() => {
    let logoIndex = 0;
    let fadeTimeout: number | undefined;
    const intervalId = window.setInterval(() => {
      setIsLogoVisible(false);
      fadeTimeout = window.setTimeout(() => {
        logoIndex = (logoIndex + 1) % content.logoTexts.length;
        setLogoText(content.logoTexts[logoIndex] ?? '');
        setIsLogoVisible(true);
      }, 400);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
      if (fadeTimeout !== undefined) {
        window.clearTimeout(fadeTimeout);
      }
    };
  }, [content.logoTexts]);

  return (
    <nav className="fixed top-0 z-50 w-full bg-surface/80 transition-all duration-300 dark:bg-inverse-surface/80 backdrop-blur-xl">
      <div className="mx-auto grid min-h-[54px] w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-outline-variant/20 px-3 py-1 md:gap-0 md:px-8">
        <div className="min-w-0">
          <span
            className="block truncate text-on-surface tracking-tighter dark:text-surface-bright font-headline text-base font-bold sm:text-lg md:text-xl"
            id="logo-text"
            style={{ opacity: isLogoVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}
          >
            {logoText}
          </span>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-12">
          {content.navigation.map(({ href, label }) => {
            const isActive = href.slice(1) === activeSection;
            const activeClass = isActive ? 'border-b border-primary pb-1 text-primary' : 'text-on-surface-variant';

            return (
              <a
                className={`${activeClass} whitespace-nowrap font-body text-xs transition-colors duration-300 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm md:text-base`}
                href={href}
                key={href}
              >
                {label}
              </a>
            );
          })}
        </div>
        <div className="flex justify-self-end">
          <div className="group relative">
            <button
              aria-label={content.contact.title}
              className="ghost-icon-button text-on-surface-variant transition-colors duration-300 hover:bg-surface-container-high hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:text-surface-bright dark:hover:bg-inverse-surface"
              onClick={onOpenContact}
              type="button"
            >
              <AnimatedMailIcon className="size-6" />
            </button>
            <span aria-hidden="true" className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap bg-inverse-surface px-3 py-1.5 font-label text-xs text-inverse-on-surface opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {content.contact.title}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
