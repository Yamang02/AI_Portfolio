export interface ProfileOpening {
  readonly heading: string;
  readonly heroAlt: string;
  readonly artworkCredit: string;
}

export type ProfileIntroRoleId = 'educator' | 'developer' | 'artist' | 'entrepreneur';

export interface ProfileIntroRole {
  readonly id: ProfileIntroRoleId;
  readonly label: string;
  readonly fact: string;
  readonly imageAlt: string;
  readonly sceneFocus: string;
  readonly portraitFocus: string;
  readonly portraitZoom: number;
}

export interface ProfileIntroContent {
  readonly greeting: string;
  readonly name: string;
  readonly tabListLabel: string;
  readonly pauseLabel: string;
  readonly playLabel: string;
  readonly roles: readonly ProfileIntroRole[];
}

interface ActivityBase {
  readonly id: string;
  readonly badge: string;
  readonly cardTitle: string;
  readonly cardTitleClass?: string;
  readonly colSpan: number;
  readonly minHeight: number;
}

export interface ColumnsActivityItem {
  readonly org: string;
  readonly subOrg?: string;
  readonly period: string;
  readonly desc?: string;
  readonly duties?: readonly string[];
}

export interface ColumnsActivityColumn {
  readonly label: string;
  readonly items: readonly ColumnsActivityItem[];
}

export interface ColumnsActivity extends ActivityBase {
  readonly modalLayout: 'columns';
  readonly mediaType: 'img';
  readonly mediaSrc: string;
  readonly itemStyle?: 'career';
  readonly columns: readonly ColumnsActivityColumn[];
}

export interface SiteActivity extends ActivityBase {
  readonly modalLayout: 'site';
  readonly mediaType: 'img' | 'video';
  readonly mediaSrc: string;
  readonly period: string;
  readonly body: string;
  readonly link: string;
  readonly linkLabel: string;
}

export interface HighlightActivity extends ActivityBase {
  readonly modalLayout: 'none';
  readonly mediaType: 'none';
  readonly highlight: true;
  readonly period: string;
  readonly body: string;
}

export type ProfileActivity = ColumnsActivity | SiteActivity | HighlightActivity;

export interface ProfileInterest {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
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
  readonly sections: {
    readonly activities: string;
    readonly activitiesPeriod: string;
    readonly interests: string;
  };
  readonly nowLabel: string;
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
  readonly activities: readonly ProfileActivity[];
  readonly interests: readonly ProfileInterest[];
  readonly site: ProfileSiteContent;
}
