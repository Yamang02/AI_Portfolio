import { renderToString } from 'react-dom/server';
import { App } from './App';
import { getProfileContent } from './content';
import type { ProfileLocale } from './content/types';

export function render(locale: ProfileLocale) {
  return renderToString(<App locale={locale} />);
}

export function getMetadata(locale: ProfileLocale) {
  return getProfileContent(locale).metadata;
}
