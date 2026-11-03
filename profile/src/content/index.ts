import contentData from './content.json';
import type {
  ProfileIntroRole,
  ProfileIntroRoleId,
  ProfileContent,
  ProfileHistoryEntry,
  ProfileHistoryMedia,
  ProfileHistoryStep,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function narrowHistoryMedia(value: unknown): ProfileHistoryMedia {
  if (!isRecord(value)) {
    throw new Error('Profile history media must be an object.');
  }

  if (value.type === 'image' && value.asset === 'artclub') {
    return { type: 'image', asset: 'artclub' };
  }

  if (value.type === 'video' && value.asset === 'design') {
    return { type: 'video', asset: 'design' };
  }

  if (value.type === 'wordmark' && typeof value.text === 'string') {
    return { type: 'wordmark', text: value.text };
  }

  if (value.type === 'placeholder') {
    return { type: 'placeholder' };
  }

  throw new Error('Profile history media does not match a supported asset.');
}

function narrowHistoryEntry(value: unknown): ProfileHistoryEntry {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.start !== 'string'
    || !/^\d{4}\.\d{2}$/.test(value.start)
    || (typeof value.end !== 'undefined' && (typeof value.end !== 'string' || !/^\d{4}\.\d{2}$/.test(value.end)))) {
    throw new Error('Profile history entry has invalid dates or identifiers.');
  }

  const common = {
    id: value.id,
    start: value.start,
    ...(typeof value.end === 'string' ? { end: value.end } : {}),
  };

  if (value.kind === 'career'
    && typeof value.org === 'string'
    && typeof value.desc === 'string'
    && (typeof value.href === 'undefined' || typeof value.href === 'string')) {
    return {
      ...common,
      kind: 'career',
      org: value.org,
      desc: value.desc,
      media: narrowHistoryMedia(value.media),
      ...(typeof value.href === 'string' ? { href: value.href } : {}),
    };
  }

  if (value.kind === 'course'
    && typeof value.org === 'string'
    && typeof value.desc === 'string') {
    return { ...common, kind: 'course', org: value.org, desc: value.desc };
  }

  if (value.kind === 'work'
    && typeof value.title === 'string'
    && typeof value.desc === 'string'
    && typeof value.href === 'string') {
    return {
      ...common,
      kind: 'work',
      title: value.title,
      desc: value.desc,
      href: value.href,
      media: narrowHistoryMedia(value.media),
    };
  }

  throw new Error('Profile history entry does not match a supported kind.');
}

const HISTORY_SLOTS_PER_SIDE = 2;

function narrowHistoryStep(step: typeof contentData.history.steps[number]): ProfileHistoryStep {
  const entries = step.entries.map(narrowHistoryEntry);
  const workCount = entries.filter(entry => entry.kind === 'work').length;

  if (workCount > HISTORY_SLOTS_PER_SIDE || entries.length - workCount > HISTORY_SLOTS_PER_SIDE) {
    throw new Error('Profile history step ' + step.label + ' exceeds ' + HISTORY_SLOTS_PER_SIDE + ' entries per side.');
  }

  return { ...step, entries };
}

const intro = {
  ...contentData.intro,
  roles: contentData.intro.roles.map(narrowIntroRole),
};
const history = {
  ...contentData.history,
  steps: contentData.history.steps.map(narrowHistoryStep),
};

export const profileContent = {
  ...contentData,
  intro,
  history,
} satisfies ProfileContent;
