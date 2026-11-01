import type {
  ColumnsActivity,
  ColumnsActivityItem,
  ProfileActivity,
} from '../content/types';
import { useModalBehavior } from '../hooks/useModalBehavior';

interface ActivityModalProps {
  readonly activity: ProfileActivity | null;
  readonly closeLabel: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function DutyList({ duties, prominent = false }: { readonly duties?: readonly string[]; readonly prominent?: boolean }) {
  if (!duties?.length) {
    return null;
  }

  const dutyClass = prominent
    ? 'font-body text-sm text-on-surface'
    : 'font-body text-xs text-on-surface-variant';

  return (
    <ul className="mt-3 space-y-1.5">
      {duties.map(duty => (
        <li className={dutyClass} key={duty}>· {duty}</li>
      ))}
    </ul>
  );
}

function CareerItem({ item }: { readonly item: ColumnsActivityItem }) {
  return (
    <div>
      <p className="font-body text-sm font-bold leading-snug text-on-surface">{item.desc}</p>
      <p className="mt-1 font-body text-sm font-light text-primary">{item.org}</p>
      <p className="mt-0.5 font-label text-[0.65rem] text-outline">{item.period}</p>
      <DutyList duties={item.duties} />
    </div>
  );
}

function TeachingItem({ item }: { readonly item: ColumnsActivityItem }) {
  return (
    <div>
      <p className="mt-0.5 font-label text-[0.65rem] text-outline">{item.period}</p>
      <p className="mt-1 font-body text-sm font-light text-primary">{item.org}</p>
      {item.subOrg && <p className="mt-0.5 font-body text-xs text-outline">{item.subOrg}</p>}
      <DutyList duties={item.duties} prominent />
    </div>
  );
}

function ColumnsContent({ activity }: { readonly activity: ColumnsActivity }) {
  const isCareerStyle = activity.itemStyle === 'career';

  return (
    <>
      <div className="h-[168px] shrink-0 overflow-hidden">
        <img alt={activity.cardTitle} className="h-full w-full object-cover" src={activity.mediaSrc} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-8 py-6">
        <div className="mb-4">
          <span className="rounded-full bg-secondary-container px-3 py-1 font-label text-[0.65rem] uppercase tracking-widest text-on-secondary-container">
            {activity.badge}
          </span>
          <h2 className="mt-3 font-headline text-2xl">{activity.cardTitle}</h2>
        </div>
        <div className="mb-5 border-t border-outline-variant/30" />
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-10">
          {activity.columns.map(column => (
            <div key={column.label || column.items[0]?.org || 'column'}>
              {column.label && (
                <p className="mb-4 font-label text-[0.65rem] uppercase tracking-widest text-secondary">
                  {column.label}
                </p>
              )}
              {column.items.map((item, index) => (
                <div key={`${item.org}-${item.period}`}>
                  {index > 0 && <div className="mb-5 mt-5 border-t border-outline-variant/20" />}
                  {isCareerStyle ? <CareerItem item={item} /> : <TeachingItem item={item} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SiteContent({ activity }: { readonly activity: Extract<ProfileActivity, { modalLayout: 'site' }> }) {
  return (
    <>
      <div className="h-[320px] shrink-0 overflow-hidden">
        {activity.mediaType === 'video' ? (
          <video autoPlay className="h-full w-full object-cover" loop muted playsInline>
            <source src={activity.mediaSrc} type="video/mp4" />
          </video>
        ) : (
          <img alt={activity.cardTitle} className="h-full w-full object-cover" src={activity.mediaSrc} />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-8 py-5">
        <div className="min-h-0 flex-1">
          <span className="rounded-full bg-secondary-container px-3 py-1 font-label text-[0.65rem] uppercase tracking-widest text-on-secondary-container">
            {activity.badge}
          </span>
          <h2 className="mb-3 mt-3 font-headline text-2xl">{activity.cardTitle}</h2>
          <div className="mb-4 border-t border-outline-variant/30" />
          <p className="font-body text-sm text-on-surface-variant">{activity.body}</p>
        </div>
        <div className="mt-auto flex shrink-0 justify-end pt-3">
          <a
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 font-label text-sm text-on-primary transition-colors duration-200 hover:bg-primary-dim"
            href={activity.link}
            rel="noreferrer"
            target="_blank"
          >
            <span>{activity.linkLabel}</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      </div>
    </>
  );
}

function HighlightContent({ activity }: { readonly activity: Extract<ProfileActivity, { modalLayout: 'none' }> }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-8 py-6">
      <div className="min-h-0 flex-1">
        <span className="rounded-full bg-secondary-container px-3 py-1 font-label text-[0.65rem] uppercase tracking-widest text-on-secondary-container">
          {activity.badge}
        </span>
        <h2 className="mb-0.5 mt-3 font-headline text-2xl">{activity.cardTitle}</h2>
        <p className="mb-3 font-label text-sm text-secondary">{activity.period}</p>
        <div className="mb-4 border-t border-outline-variant/30" />
        <p
          className="font-body text-sm leading-relaxed text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: activity.body }}
        />
      </div>
    </div>
  );
}

export function ActivityModal({ activity, closeLabel, isOpen, onClose }: ActivityModalProps) {
  useModalBehavior(isOpen, onClose);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[100] items-center justify-center bg-black/60 p-4 backdrop-blur-sm md:p-8 ${isOpen ? 'flex' : 'hidden'}`}
      onClick={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-modal={isOpen}
        className="relative flex h-[560px] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-surface shadow-2xl"
        role="dialog"
      >
        <button
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container transition-colors duration-200 hover:bg-surface-container-high"
          onClick={onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-xl leading-none text-on-surface-variant">close</span>
        </button>
        <div className="flex h-full flex-col">
          {activity?.modalLayout === 'columns' && <ColumnsContent activity={activity} />}
          {activity?.modalLayout === 'site' && <SiteContent activity={activity} />}
          {activity?.modalLayout === 'none' && <HighlightContent activity={activity} />}
        </div>
      </div>
    </div>
  );
}
