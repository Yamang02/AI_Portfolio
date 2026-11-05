import { useSyncExternalStore } from 'react';

const PORTRAIT_QUERY = '(orientation: portrait)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PORTRAIT_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia(PORTRAIT_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsPortrait(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
