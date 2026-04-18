/**
 * SEO 공통 설정
 * VITE_SITE_URL은 빌드 시 환경 변수로 주입 (프로덕션 SPA: https://portfolio.yamang02.com)
 */
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://portfolio.yamang02.com';

export const seoConfig = {
  siteName: '이정준',
  siteUrl,
  defaultTitle: '이정준 | 포트폴리오',
  defaultDescription:
    '이정준의 개발자 포트폴리오입니다. Spring Boot, React, TypeScript, AI 프로젝트와 기술 아티클을 확인하세요.',
  defaultOgImage: `${siteUrl}/images/og-default.png`,
  twitterHandle: '@yamang02',
  locale: 'ko_KR',
  author: '이정준',
  contactEmail: 'contact@yamangsolution.com',
} as const;

export const pageMetaDefaults = {
  profile: {
    title: '프로필',
    description:
      '이정준의 경력, 기술 스택, 교육 이력을 확인하세요. Java/Spring Boot, React/TypeScript 전문 개발자.',
    canonicalPath: '/profile',
  },
  projects: {
    title: '프로젝트',
    description:
      'AI 통합 웹 서비스, 백엔드 API 등 이정준의 주요 프로젝트를 확인하세요.',
    canonicalPath: '/projects',
  },
  articles: {
    title: '기술 아티클',
    description:
      'Spring Boot, React, AI/ML, 시스템 아키텍처에 대한 기술 아티클과 개발 노트를 읽어보세요.',
    canonicalPath: '/articles',
  },
  chat: {
    title: 'AI 챗봇',
    description:
      'Claude API 기반 AI 챗봇으로 프로젝트, 기술 스택, 경험에 대해 자연어로 질문해보세요.',
    canonicalPath: '/chat',
  },
} as const;
