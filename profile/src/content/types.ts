export interface ProfileOpening {
  readonly heading: string;
  readonly heroAlt: string;
  readonly artworkCredit: string;
}

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
  readonly tabListLabel: string;
  readonly pauseLabel: string;
  readonly playLabel: string;
  readonly roles: readonly ProfileIntroRole[];
}

export type ProfileHistoryMedia =
  | { readonly type: 'image'; readonly asset: 'artclub' }
  | { readonly type: 'video'; readonly asset: 'design' }
  | { readonly type: 'wordmark'; readonly text: string }
  | { readonly type: 'placeholder' };

interface ProfileHistoryEntryBase {
  readonly id: string;
  readonly start: string;
  readonly end?: string;
  readonly title: string;
  readonly desc: string;
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
  readonly steps: readonly ProfileHistoryStep[];
}

export interface ProfileNavigationItem {
  readonly href: string;
  readonly label: string;
}

export interface ProfileSiteContent {
  readonly logoTexts: readonly string[];
  readonly navigation: readonly ProfileNavigationItem[];
  readonly homeLink: ProfileNavigationItem;
  readonly closeLabel: string;
  readonly connect: {
    readonly eyebrow: string;
    readonly title: string;
    readonly body: string;
    readonly portfolioHref: string;
    readonly portfolioLabel: string;
    readonly companyHref: string;
    readonly companyLabel: string;
    readonly contactLabel: string;
  };
  readonly footer: {
    readonly title: string;
    readonly copyright: string;
    readonly businessInformation: readonly {
      readonly label: string;
      readonly value: string;
      readonly minWidth: string;
    }[];
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
    readonly emailValidationMessage: string;
    readonly messageValidationMessage: string;
    readonly successMessage: string;
    readonly sendFailedMessage: string;
    readonly toEmail: string;
  };
}

export interface ProfileContent {
  readonly opening: ProfileOpening;
  readonly intro: ProfileIntroContent;
  readonly history: ProfileHistoryContent;
  readonly site: ProfileSiteContent;
}
