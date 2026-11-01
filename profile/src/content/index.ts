import contentData from './content.json';
import type {
  ColumnsActivity,
  HighlightActivity,
  ProfileActivity,
  ProfileContent,
  SiteActivity,
} from './types';

function narrowActivity(activity: typeof contentData.activities[number]): ProfileActivity {
  if (Array.isArray(activity.columns) && typeof activity.mediaSrc === 'string') {
    return {
      ...activity,
      modalLayout: 'columns',
      mediaType: 'img',
      columns: activity.columns as ColumnsActivity['columns'],
      itemStyle: activity.itemStyle === 'career' ? 'career' : undefined,
    } satisfies ColumnsActivity;
  }

  if (
    typeof activity.link === 'string'
    && typeof activity.linkLabel === 'string'
    && typeof activity.mediaSrc === 'string'
    && typeof activity.period === 'string'
    && typeof activity.body === 'string'
    && (activity.mediaType === 'img' || activity.mediaType === 'video')
  ) {
    return {
      ...activity,
      modalLayout: 'site',
      mediaType: activity.mediaType,
    } satisfies SiteActivity;
  }

  if (typeof activity.period === 'string' && typeof activity.body === 'string') {
    return {
      ...activity,
      modalLayout: 'none',
      mediaType: 'none',
      highlight: true,
    } satisfies HighlightActivity;
  }

  throw new Error('Profile activity content does not match a supported modal layout.');
}

const activities = contentData.activities.map(narrowActivity);

export const profileContent = {
  ...contentData,
  activities,
} satisfies ProfileContent;
