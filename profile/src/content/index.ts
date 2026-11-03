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
    || (typeof value.end !== 'undefined' && (typeof value.end !== 'string' || !/^\d{4}\.\d{2}$/.test(value.end)))
    || (value.kind !== 'career' && value.kind !== 'course' && value.kind !== 'work')
    || typeof value.title !== 'string'
    || typeof value.desc !== 'string'
    || (typeof value.href !== 'undefined' && typeof value.href !== 'string')) {
    throw new Error('Profile history entry has invalid dates or identifiers.');
  }

  const common = {
    id: value.id,
    start: value.start,
    ...(typeof value.end === 'string' ? { end: value.end } : {}),
    title: value.title,
    desc: value.desc,
    media: narrowHistoryMedia(value.media),
  };

  if (value.kind === 'work') {
    if (typeof value.href !== 'string' || value.href.length === 0) {
      throw new Error('Profile history work entry ' + value.id + ' requires an href.');
    }

    return { ...common, kind: value.kind, href: value.href };
  }

  return {
    ...common,
    kind: value.kind,
    ...(typeof value.href === 'string' ? { href: value.href } : {}),
  };
}

function narrowHistoryStep(step: typeof contentData.history.steps[number]): ProfileHistoryStep {
  if (step.entries.length > 4) {
    throw new Error('Profile history step ' + step.label + ' exceeds 4 entries.');
  }

  return { ...step, entries: step.entries.map(narrowHistoryEntry) };
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
