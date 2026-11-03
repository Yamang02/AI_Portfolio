import type { ProfileSiteContent } from '../content/types';

interface FooterProps {
  readonly content: ProfileSiteContent['footer'];
}

export function Footer({ content }: FooterProps) {
  return (
    <footer className="w-full border-t border-outline-variant/10 bg-surface-container px-6 py-2.5 text-center text-black/80 md:px-8">
      <p className="font-body text-xs leading-relaxed md:text-sm">{content.text}</p>
    </footer>
  );
}
