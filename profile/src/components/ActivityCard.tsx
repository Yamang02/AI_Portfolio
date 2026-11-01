import type { ProfileActivity } from '../content/types';

interface ActivityCardProps {
  readonly activity: ProfileActivity;
  readonly nowLabel: string;
  readonly onOpen: (activity: ProfileActivity) => void;
}

const GRID_COLUMN_CLASSES: Record<number, string> = {
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  7: 'md:col-span-7',
};

export function ActivityCard({ activity, nowLabel, onOpen }: ActivityCardProps) {
  const columnClass = GRID_COLUMN_CLASSES[activity.colSpan] ?? '';
  const sizeStyle = { minHeight: `${activity.minHeight}px` };
  const cardClass = activity.modalLayout === 'none'
    ? 'bg-primary-container'
    : 'bg-surface-container-high';

  return (
    <button
      aria-label={activity.cardTitle}
      className={`${columnClass} group relative cursor-pointer overflow-hidden rounded-xl text-left focus:outline-none ${cardClass}`}
      onClick={() => onOpen(activity)}
      style={sizeStyle}
      type="button"
    >
      {activity.modalLayout === 'none' ? (
        <>
          <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="font-label text-[0.65rem] uppercase tracking-widest text-primary">
              {nowLabel}
            </span>
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 font-label text-[0.65rem] uppercase tracking-widest text-primary">
              {activity.badge}
            </span>
            <h3 className="font-headline text-2xl text-on-surface md:text-3xl">{activity.cardTitle}</h3>
          </div>
          <div className="absolute right-4 top-4 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="material-symbols-outlined text-xl text-on-surface-variant">open_in_full</span>
          </div>
        </>
      ) : (
        <>
          {activity.mediaType === 'img' ? (
            <img
              alt={activity.cardTitle}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={activity.mediaSrc}
            />
          ) : (
            <video
              aria-hidden="true"
              autoPlay
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loop
              muted
              playsInline
            >
              <source src={activity.mediaSrc} type="video/mp4" />
            </video>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent via-black/60 to-black/80 px-7 pb-6 pt-12">
            <span className="font-label text-[0.65rem] uppercase tracking-widest text-white/60">
              {activity.badge}
            </span>
            <h3 className={`mt-1 font-headline text-white ${activity.cardTitleClass ?? 'text-2xl md:text-3xl'}`}>
              {activity.cardTitle}
            </h3>
          </div>
          <div className="absolute right-4 top-4 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="material-symbols-outlined text-xl text-white/80">open_in_full</span>
          </div>
        </>
      )}
    </button>
  );
}
