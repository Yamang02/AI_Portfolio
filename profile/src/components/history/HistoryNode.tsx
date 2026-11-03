import type { ProfileCourseHistoryEntry } from '../../content/types';
import { HistoryPeriod } from './HistoryCard';

interface HistoryNodeProps {
  readonly entry: ProfileCourseHistoryEntry;
  readonly presentLabel: string;
}

export function HistoryNode({ entry, presentLabel }: HistoryNodeProps) {
  return (
    <div className="space-y-1 text-on-surface-variant md:text-right">
      <div className="flex flex-col gap-x-4 gap-y-1 md:flex-row-reverse md:flex-wrap md:items-baseline md:justify-start">
        <p className="font-body text-sm font-medium md:text-base">{entry.org}</p>
        <HistoryPeriod end={entry.end} presentLabel={presentLabel} start={entry.start} />
      </div>
      <p className="font-body text-sm leading-relaxed opacity-80">{entry.desc}</p>
    </div>
  );
}
