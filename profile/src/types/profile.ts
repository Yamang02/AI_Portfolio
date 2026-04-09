export interface ProfileHero {
  readonly nameEn: string;
  readonly nameKo: string;
  readonly roles: readonly string[];
}

export interface ProfileIdentityCard {
  readonly icon: string;
  readonly title: string;
  readonly subTitle: string;
  readonly body: string;
}

export interface ProfileIdentitySection {
  readonly tagline: string;
  readonly cards: readonly ProfileIdentityCard[];
}

// ── Activities (discriminated union by modalLayout) ────────────────────────

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
  readonly body: string;
}

export type ProfileActivity = ColumnsActivity | SiteActivity | HighlightActivity;

// ── Interests ──────────────────────────────────────────────────────────────

export interface ProfileInterest {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
}

// ── Root ───────────────────────────────────────────────────────────────────

export interface ProfileContent {
  readonly hero: ProfileHero;
  readonly identity: ProfileIdentitySection;
  readonly activities: readonly ProfileActivity[];
  readonly interests: readonly ProfileInterest[];
}
