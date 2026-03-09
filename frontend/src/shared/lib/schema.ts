import { seoConfig } from '@/shared/config/seo.config';

export function createPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'YamangSolution',
    url: seoConfig.siteUrl,
    image: `${seoConfig.siteUrl}/images/profile.jpg`,
    jobTitle: 'AI 풀스택 개발자',
    description: 'AI와 함께 꿈을 실현하는 풀스택 개발자',
    email: seoConfig.contactEmail,
    sameAs: [
      'https://github.com/Yamang02',
      'https://www.linkedin.com/in/JeongjunLee/',
    ],
    knowsAbout: [
      'Java',
      'Spring Boot',
      'TypeScript',
      'React',
      'PostgreSQL',
      'AI/ML',
      'Claude API',
      'AWS',
      'GCP',
    ],
  };
}

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'YamangSolution',
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/favicons/favicon-96x96.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: seoConfig.contactEmail,
      contactType: 'technical support',
    },
  };
}

export function createWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${seoConfig.siteName} Portfolio`,
    url: seoConfig.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}/projects?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function createProjectSchema(project: {
  id: string;
  title: string;
  description: string;
  updatedAt?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.description,
    author: { '@type': 'Person', name: 'YamangSolution' },
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web',
    url: `${seoConfig.siteUrl}/projects/${project.id}`,
    ...(project.updatedAt && { dateModified: project.updatedAt }),
  };
}

export function createArticleSchema(article: {
  businessId: string;
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    ...(article.summary && { description: article.summary }),
    ...(article.thumbnailUrl
      ? { image: article.thumbnailUrl }
      : { image: seoConfig.defaultOgImage }),
    author: {
      '@type': 'Person',
      name: 'YamangSolution',
      url: `${seoConfig.siteUrl}/profile`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'YamangSolution',
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}/favicons/favicon-96x96.png`,
      },
    },
    ...(article.publishedAt && { datePublished: article.publishedAt }),
    ...(article.updatedAt && { dateModified: article.updatedAt }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${seoConfig.siteUrl}/articles/${article.businessId}`,
    },
  };
}

export function createBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: seoConfig.siteUrl },
      ...items.map((item, index) => ({
        '@type': 'ListItem' as const,
        position: index + 2,
        name: item.name,
        item: `${seoConfig.siteUrl}${item.path}`,
      })),
    ],
  };
}
