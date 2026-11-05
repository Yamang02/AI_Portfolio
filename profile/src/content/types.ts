export interface ProfileOpening {
  readonly heading: string;
  readonly heroAlt: string;
  readonly artworkCredit: string;
  readonly replayLabel: string;
  readonly finalTitleLabel: string;
  readonly scrollLabel: string;
}

export interface ProfileMetadata {
  readonly title: string;
  readonly description: string;
  readonly author: string;
  readonly ogTitle: string;
  readonly ogLocale: string;
}

export type ProfileLocale = 'ko' | 'en';

export type ProfileIntroRoleId = 'educator' | 'developer' | 'artist' | 'entrepreneur';

export interface ProfileIntroRole {
  readonly id: ProfileIntroRoleId;
  readonly label: string;
  readonly verb: string;
  readonly fact: string;
  readonly imageAlt: string;
  readonly sceneFocus: string;
  readonly portraitFocus: string;
  readonly portraitZoom: number;
}

export interface ProfileIntroContent {
  readonly greeting: string;
  readonly name: string;
  readonly nameSuffix: string;
  readonly taglineSubject: string;
  readonly verbSeparator: string;
  readonly finalVerbSeparator: string;
  readonly tabListLabel: string;
  readonly imageGroupLabel: string;
  readonly pauseLabel: string;
  readonly playLabel: string;
  readonly roles: readonly ProfileIntroRole[];
}

export type ProfileHistoryImageAsset = 'artclub' | 'chatbot' | 'gbsa' | 'reconlabs' | 'sesac' | 'yamangsolution';

export type ProfileHistoryIcon = 'database' | 'code' | 'briefcase' | 'book' | 'erp';

export type ProfileHistoryMedia =
  | { readonly type: 'image'; readonly asset: ProfileHistoryImageAsset; readonly focus?: string }
  | { readonly type: 'video'; readonly asset: 'design'; readonly focus?: string }
  | { readonly type: 'wordmark'; readonly text: string }
  | { readonly type: 'keyword'; readonly icon: ProfileHistoryIcon; readonly text: string }
  | { readonly type: 'placeholder' };

interface ProfileHistoryEntryBase {
  readonly id: string;
  readonly start: string;
  readonly end?: string;
  readonly title: string;
  readonly subtitle: string;
  readonly media: ProfileHistoryMedia;
  readonly href?: string;
}

export type ProfileHistoryEntry =
  | (ProfileHistoryEntryBase & { readonly kind: 'career' | 'course' })
  | (ProfileHistoryEntryBase & { readonly kind: 'work'; readonly href: string });

export interface ProfileHistoryStep {
  readonly id: string;
  readonly label: string;
  readonly entries: readonly ProfileHistoryEntry[];
}

export interface ProfileHistoryContent {
  readonly label: string;
  readonly presentLabel: string;
  readonly linkSuffix: string;
  readonly scrollLabel: string;
  readonly steps: readonly ProfileHistoryStep[];
}

export interface ProfileNavigationItem {
  readonly href: string;
  readonly label: string;
}

export interface ProfileSiteContent {
  readonly logoTexts: readonly { readonly text: string; readonly compactText: string }[];
  readonly navigation: readonly ProfileNavigationItem[];
  readonly languageNames: { readonly ko: string; readonly en: string };
  readonly closeLabel: string;
  readonly connect: {
    readonly title: string;
    readonly linksLabel: string;
    readonly portfolioHref: string;
    readonly portfolioLabel: string;
    readonly portfolioActionLabel: string;
    readonly portfolioControlLabel: string;
    readonly companyHref: string;
    readonly companyLabel: string;
    readonly companyActionLabel: string;
    readonly companyControlLabel: string;
    readonly contactLabel: string;
    readonly contactActionLabel: string;
    readonly contactControlLabel: string;
    readonly githubHref: string;
    readonly githubHandle: string;
    readonly githubActionLabel: string;
    readonly githubControlLabel: string;
    readonly threadsHref: string;
    readonly threadsLabel: string;
    readonly threadsHandle: string;
    readonly threadsActionLabel: string;
    readonly threadsControlLabel: string;
  };
  readonly footer: {
    readonly text: string;
  };
  readonly contact: {
    readonly eyebrow: string;
    readonly title: string;
    readonly nameLabel: string;
    readonly namePlaceholder: string;
    readonly emailLabel: string;
    readonly emailPlaceholder: string;
    readonly subjectLabel: string;
    readonly subjectPlaceholder: string;
    readonly messageLabel: string;
    readonly messagePlaceholder: string;
    readonly cancelLabel: string;
    readonly submitLabel: string;
    readonly sendingLabel: string;
    readonly loadFailedMessage: string;
    readonly emailValidationMessage: string;
    readonly messageValidationMessage: string;
    readonly successMessage: string;
    readonly sendFailedMessage: string;
    readonly toEmail: string;
  };
}

export interface ProfileContent {
  readonly metadata: ProfileMetadata;
  readonly opening: ProfileOpening;
  readonly intro: ProfileIntroContent;
  readonly history: ProfileHistoryContent;
  readonly site: ProfileSiteContent;
}
