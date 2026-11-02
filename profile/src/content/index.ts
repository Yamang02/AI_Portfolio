import contentData from './content.json';
import type {
  ColumnsActivity,
  HighlightActivity,
  ProfileIntroRole,
  ProfileIntroRoleId,
  ProfileActivity,
  ProfileContent,
  SiteActivity,
} from './types';

function isProfileIntroRoleId(id: string): id is ProfileIntroRoleId {
  return id === 'educator' || id === 'developer' || id === 'artist' || id === 'entrepreneur';
}

function narrowIntroRole(role: typeof contentData.intro.roles[number]): ProfileIntroRole {
  if (!isProfileIntroRoleId(role.id)) {
    throw new Error('Profile intro content contains an unsupported role id: ' + role.id);
  }

  return { ...role, id: role.id };
}

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
const intro = {
  ...contentData.intro,
  roles: contentData.intro.roles.map(narrowIntroRole),
};

export const profileContent = {
  ...contentData,
  intro,
  activities,
} satisfies ProfileContent;
