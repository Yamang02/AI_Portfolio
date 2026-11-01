import type { ProfileInterest, ProfileSiteContent } from '../content/types';

interface InterestsSectionProps {
  readonly interests: readonly ProfileInterest[];
  readonly siteContent: ProfileSiteContent;
}

export function InterestsSection({ interests, siteContent }: InterestsSectionProps) {
  return (
    <section className="bg-surface-container-low px-8 py-32 md:px-24" id="interests">
      <div className="mx-auto max-w-screen-2xl">
        <h2 className="mb-20 font-headline text-[2.5rem] font-bold tracking-tight">
          {siteContent.sections.interests}
        </h2>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {interests.map(interest => (
            <div
              className="group rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-10 transition-all duration-500 hover:border-primary/30"
              key={interest.title}
            >
              <span className="material-symbols-outlined mb-6 block text-4xl text-primary" data-icon={interest.icon}>
                {interest.icon}
              </span>
              <h3 className="mb-4 font-headline text-2xl">{interest.title}</h3>
              <p className="font-body leading-relaxed text-on-surface-variant">{interest.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
