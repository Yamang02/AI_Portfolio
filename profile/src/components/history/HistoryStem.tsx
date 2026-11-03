interface HistoryStemProps {
  readonly isEnd?: boolean;
  readonly isStart?: boolean;
}

export function HistoryStem({ isEnd = true, isStart = true }: HistoryStemProps) {
  return (
    <div
      aria-hidden="true"
      className={'history-stem pointer-events-none '
        + (isStart ? 'rounded-t-full ' : '')
        + (isEnd ? 'rounded-b-full ' : '')
        + 'bg-primary'}
    />
  );
}
