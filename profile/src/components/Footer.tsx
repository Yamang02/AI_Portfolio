import type { ProfileSiteContent } from '../content/types';

interface FooterProps {
  readonly content: ProfileSiteContent['footer'];
}

export function Footer({ content }: FooterProps) {
  return (
    <footer className="w-full border-t border-outline-variant/10 bg-surface-container px-6 py-10 text-black md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-6 text-center md:gap-8">
        <div className="flex flex-col items-center gap-1.5 md:gap-2">
          <p
            className="text-[1.625rem] leading-tight tracking-tight md:text-[2rem]"
            style={{ fontFamily: 'Griun PolSensibility, serif' }}
          >
            {content.title}
          </p>
          <p className="font-body text-[13px] text-black/90 md:text-sm">{content.copyright}</p>
        </div>
        <dl className="flex w-full max-w-3xl flex-wrap justify-center gap-x-6 gap-y-3 border-t border-black/10 pt-6 text-[11px] leading-snug text-black/80 md:gap-x-10 md:gap-y-4 md:pt-7 md:text-xs">
          {content.businessInformation.map(({ label, value, minWidth }) => (
            <div className="flex min-w-[7rem] flex-col items-center gap-0.5" key={label} style={{ minWidth }}>
              <dt className="font-label text-[10px] uppercase tracking-wider text-black/55">{label}</dt>
              <dd className="font-body">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
