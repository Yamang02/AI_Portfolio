import { Fragment } from 'react';
import type { ProfileIntroContent } from '../../content/types';

interface IntroGreetingProps {
  readonly content: ProfileIntroContent;
  readonly activeIndex: number;
}

function verbSeparator(index: number, count: number) {
  if (index === 0) {
    return ' ';
  }

  return index === count - 1 ? ', and ' : ', ';
}

export function IntroGreeting({ content, activeIndex }: IntroGreetingProps) {
  return (
    <div className="pb-16 pt-2 text-center font-headline text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.6] md:pb-24 md:pt-4">
      <div className="text-on-surface">
        {content.greeting}{' '}
        <h1 className="inline font-semibold" id="intro-name">{content.name}</h1>
        {content.nameSuffix}
      </div>
      <p className="text-outline">
        {content.taglineSubject}
        {content.roles.map((role, index) => (
          <Fragment key={role.id}>
            {verbSeparator(index, content.roles.length)}
            <span
              className="transition-colors duration-300 data-[active=true]:text-primary"
              data-active={index === activeIndex ? 'true' : 'false'}
            >
              {role.verb}
            </span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
