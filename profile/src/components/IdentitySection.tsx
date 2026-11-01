import type { ProfileIdentitySection, ProfileSiteContent } from '../content/types';

interface IdentitySectionProps {
  readonly content: ProfileIdentitySection;
  readonly siteContent: ProfileSiteContent;
}

export function IdentitySection({ content, siteContent }: IdentitySectionProps) {
  return (
    <section className="bg-surface-container-low px-8 py-32 md:px-24" id="identity">
      <div className="mx-auto max-w-screen-2xl">
        <h2 className="mb-20 font-headline text-[2.5rem] font-bold tracking-tight">
          {siteContent.sections.identity}
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {content.cards.map(card => (
            <div
              className="space-y-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 transition-all duration-500 hover:border-primary/30"
              key={card.title}
            >
              <span className="material-symbols-outlined block text-3xl text-primary" data-icon={card.icon}>
                {card.icon}
              </span>
              <h3 className="font-headline text-xl">{card.title}</h3>
              <p className="font-label text-xs text-secondary">{card.subTitle}</p>
              <p
                className="font-body text-sm leading-relaxed text-on-surface-variant"
                dangerouslySetInnerHTML={{ __html: card.body }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
