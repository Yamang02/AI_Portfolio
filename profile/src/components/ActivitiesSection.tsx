import { useCallback, useState } from 'react';
import type { ProfileActivity, ProfileSiteContent } from '../content/types';
import { ActivityCard } from './ActivityCard';
import { ActivityModal } from './ActivityModal';

interface ActivitiesSectionProps {
  readonly activities: readonly ProfileActivity[];
  readonly siteContent: ProfileSiteContent;
}

export function ActivitiesSection({ activities, siteContent }: ActivitiesSectionProps) {
  const [selectedActivity, setSelectedActivity] = useState<ProfileActivity | null>(null);
  const closeModal = useCallback(() => setSelectedActivity(null), []);

  return (
    <>
      <section className="bg-surface px-8 py-32 md:px-24" id="works">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-20 flex flex-col items-baseline justify-between gap-4 md:flex-row">
            <h2 className="font-headline text-[2.5rem] font-bold tracking-tight">
              {siteContent.sections.activities}
            </h2>
            <p className="font-label uppercase tracking-[0.2em] text-secondary">
              {siteContent.sections.activitiesPeriod}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
            {activities.map(activity => (
              <ActivityCard
                activity={activity}
                key={activity.id}
                nowLabel={siteContent.nowLabel}
                onOpen={setSelectedActivity}
              />
            ))}
          </div>
        </div>
      </section>
      <ActivityModal
        activity={selectedActivity}
        closeLabel={siteContent.closeLabel}
        isOpen={selectedActivity !== null}
        onClose={closeModal}
      />
    </>
  );
}
