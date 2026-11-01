import type { ProfileSiteContent } from '../content/types';

interface ConnectSectionProps {
  readonly content: ProfileSiteContent['connect'];
  readonly onOpenContact: () => void;
}

export function ConnectSection({ content, onOpenContact }: ConnectSectionProps) {
  return (
    <section className="px-8 py-40 md:px-24" id="connect">
      <div className="mx-auto max-w-4xl space-y-12 text-center">
        <p className="font-label text-xs uppercase tracking-[0.4em] text-secondary">{content.eyebrow}</p>
        <h2
          className="font-brand text-[3rem] leading-[1.1] tracking-tight text-brand-red md:text-[4.5rem]"
        >
          {content.title}
        </h2>
        <p
          className="mx-auto max-w-2xl font-body text-lg leading-relaxed text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
        <div className="flex flex-col items-center justify-center gap-4 pt-8 md:flex-row">
          <a
            className="rounded-none bg-primary px-12 py-5 text-base font-medium text-on-primary shadow-sm transition-all duration-500 hover:-translate-y-1 hover:bg-primary-dim hover:shadow-xl"
            href={content.portfolioHref}
            rel="noreferrer"
            target="_blank"
          >
            {content.portfolioLabel}
          </a>
          <a
            className="rounded-none bg-brand-red px-12 py-5 text-base font-medium text-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:bg-brand-red-hover hover:shadow-xl"
            href={content.companyHref}
            rel="noreferrer"
            target="_blank"
          >
            {content.companyLabel}
          </a>
          <button
            className="rounded-none border border-outline px-12 py-5 text-base font-medium text-on-surface-variant transition-all duration-500 hover:border-primary hover:text-primary"
            onClick={onOpenContact}
            type="button"
          >
            {content.contactLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
