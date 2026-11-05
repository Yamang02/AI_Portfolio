import englishContentData from './content.en.json';
import koreanContentData from './content.ko.json';
import type {
  ProfileIntroRole,
  ProfileIntroRoleId,
  ProfileContent,
  ProfileHistoryEntry,
  ProfileHistoryIcon,
  ProfileHistoryImageAsset,
  ProfileHistoryMedia,
  ProfileHistoryStep,
  ProfileLocale,
} from './types';

function isProfileIntroRoleId(id: string): id is ProfileIntroRoleId {
  return id === 'educator' || id === 'developer' || id === 'artist' || id === 'entrepreneur';
}

function narrowIntroRole(role: typeof koreanContentData.intro.roles[number]): ProfileIntroRole {
  if (!isProfileIntroRoleId(role.id)) {
    throw new Error('Profile intro content contains an unsupported role id: ' + role.id);
  }

  return { ...role, id: role.id };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const HISTORY_IMAGE_ASSETS = ['artclub', 'chatbot', 'gbsa', 'reconlabs', 'sesac', 'yamangsolution'] as const satisfies readonly ProfileHistoryImageAsset[];
const HISTORY_ICONS = ['database', 'code', 'briefcase', 'book', 'erp'] as const satisfies readonly ProfileHistoryIcon[];

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

function narrowHistoryFocus(value: Record<string, unknown>): string | undefined {
  if (typeof value.focus === 'undefined') {
    return undefined;
  }

  if (typeof value.focus !== 'string' || value.focus.trim().length === 0) {
    throw new Error('Profile history media focus must be a non-empty object-position value.');
  }

  return value.focus;
}

function narrowHistoryMedia(value: unknown): ProfileHistoryMedia {
  if (!isRecord(value)) {
    throw new Error('Profile history media must be an object.');
  }

  if (value.type === 'image' && isOneOf(value.asset, HISTORY_IMAGE_ASSETS)) {
    const focus = narrowHistoryFocus(value);
    return { type: 'image', asset: value.asset, ...(focus ? { focus } : {}) };
  }

  if (value.type === 'video' && value.asset === 'design') {
    const focus = narrowHistoryFocus(value);
    return { type: 'video', asset: 'design', ...(focus ? { focus } : {}) };
  }

  if (value.type === 'wordmark' && typeof value.text === 'string') {
    return { type: 'wordmark', text: value.text };
  }

  if (value.type === 'keyword' && isOneOf(value.icon, HISTORY_ICONS) && typeof value.text === 'string' && value.text.trim().length > 0) {
    return { type: 'keyword', icon: value.icon, text: value.text };
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
    || typeof value.subtitle !== 'string'
    || (typeof value.href !== 'undefined' && typeof value.href !== 'string')) {
    throw new Error('Profile history entry has invalid dates or identifiers.');
  }

  const common = {
    id: value.id,
    start: value.start,
    ...(typeof value.end === 'string' ? { end: value.end } : {}),
    title: value.title,
    subtitle: value.subtitle,
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

function narrowHistoryStep(step: typeof koreanContentData.history.steps[number]): ProfileHistoryStep {
  if (step.entries.length > 4) {
    throw new Error('Profile history step ' + step.label + ' exceeds 4 entries.');
  }

  return { ...step, entries: step.entries.map(narrowHistoryEntry) };
}

function normalizeProfileContent(contentData: typeof koreanContentData): ProfileContent {
  const intro = {
    ...contentData.intro,
    roles: contentData.intro.roles.map(narrowIntroRole),
  };
  const history = {
    ...contentData.history,
    steps: contentData.history.steps.map(narrowHistoryStep),
  };

  return {
    ...contentData,
    intro,
    history,
  } satisfies ProfileContent;
}

const profileContentByLocale: Readonly<Record<ProfileLocale, ProfileContent>> = {
  ko: normalizeProfileContent(koreanContentData),
  en: normalizeProfileContent(englishContentData),
};

export function getProfileContent(locale: ProfileLocale): ProfileContent {
  return profileContentByLocale[locale];
}

export function getProfileLocale(pathname: string): ProfileLocale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ko';
}
