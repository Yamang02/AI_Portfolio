interface IconProps {
  readonly name: 'home' | 'close';
  readonly className?: string;
}

const ICON_PATHS = {
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  close: 'm6 6 12 12M6 18 18 6',
} as const;

export function Icon({ name, className = '' }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={'inline-block shrink-0 align-middle ' + className}
      fill="none"
      focusable="false"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="1em"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
