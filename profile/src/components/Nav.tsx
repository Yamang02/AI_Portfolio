import { useEffect, useState } from 'react';
import type { ProfileSiteContent } from '../content/types';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { Icon } from './Icon';

interface NavProps {
  readonly content: ProfileSiteContent;
}

export function Nav({ content }: NavProps) {
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
      <div className="mx-auto flex w-full max-w-screen-2xl items-center border-b border-outline-variant/20 px-8 py-6">
        <div className="flex-1">
          <a
            className="text-on-surface tracking-tighter transition-colors duration-300 hover:text-primary dark:text-surface-bright font-headline text-xl font-bold"
            href="#"
          >
            <span id="logo-text" style={{ opacity: isLogoVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
              {logoText}
            </span>
          </a>
        </div>
        <div className="hidden items-center space-x-12 md:flex">
          {content.navigation.map(({ href, label }) => {
            const isActive = href.slice(1) === activeSection;
            const activeClass = isActive ? 'border-b border-primary pb-1 text-primary' : 'text-on-surface-variant';

            return (
              <a
                className={`${activeClass} font-body transition-colors duration-300 hover:text-primary`}
                href={href}
                key={href}
              >
                {label}
              </a>
            );
          })}
        </div>
        <div className="flex flex-1 justify-end">
          <div className="group relative">
            <a
              aria-label={content.homeLink.label}
              className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-on-primary transition-all duration-300 hover:bg-primary-dim"
              href={content.homeLink.href}
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="text-xl" name="home" />
            </a>
            <span className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap bg-inverse-surface px-3 py-1.5 font-label text-xs text-inverse-on-surface opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {content.homeLink.label}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
