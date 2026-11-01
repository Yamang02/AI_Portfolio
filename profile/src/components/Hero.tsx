import type { ProfileHero, ProfileSiteContent } from '../content/types';

interface HeroProps {
  readonly content: ProfileHero;
  readonly siteContent: ProfileSiteContent;
}

export function Hero({ content, siteContent }: HeroProps) {
  const nameParts = content.nameEn.split(' ');

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col justify-center px-8 py-10 md:px-24 md:py-16">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-16">
        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <p className="mb-4 font-label text-sm tracking-widest text-on-surface-variant">
              {siteContent.heroGreeting}
            </p>
            <div className="mb-4 ml-1 h-12 overflow-hidden">
              <div className="flex animate-[scroll_10s_infinite] flex-col space-y-4" id="hero-role-track">
                {content.roles.map(role => (
                  <span className="font-headline text-2xl italic text-primary md:text-3xl" key={role}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <h1 className="mb-8 font-headline text-[3.5rem] leading-[1.1] tracking-tight md:text-[5.5rem]">
              {nameParts.map((namePart, index) => (
                <span key={`${namePart}-${index}`}>
                  {index > 0 && <br />}
                  {namePart}
                </span>
              ))}
            </h1>
          </div>
        </div>
        <div className="order-first w-full shrink-0 md:order-last md:w-[400px]">
          <div className="aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-high">
            <img
              alt={siteContent.heroImageAlt}
              className="h-full w-full object-cover object-top"
              src={content.imageSrc}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
