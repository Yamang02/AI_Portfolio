/**
 * SEO 공통 설정
 * VITE_SITE_URL은 빌드 시 환경 변수로 주입 (프로덕션: https://www.yamang02.com)
 */
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.yamang02.com';

export const seoConfig = {
  siteName: 'YamangSolution',
  siteUrl,
  defaultTitle: 'YamangSolution',
  defaultDescription:
    'AI와 함께 꿈을 실현하는 개발자 YamangSolution의 포트폴리오. ' +
    'Spring Boot, React, TypeScript, AI 서비스 개발 프로젝트와 기술 아티클을 확인하세요.',
  defaultOgImage: `${siteUrl}/images/og-default.png`,
  twitterHandle: '@yamang02',
  locale: 'ko_KR',
  author: 'YamangSolution',
  contactEmail: 'contact@yamangsolution.com',
} as const;

export const pageMetaDefaults = {
  profile: {
    title: '프로필',
    description:
      'YamangSolution의 경력, 기술 스택, 교육 이력을 확인하세요. Java/Spring Boot, React/TypeScript 전문 개발자.',
    canonicalPath: '/profile',
  },
  projects: {
    title: '프로젝트',
    description:
      'AI 통합 웹 서비스, 포트폴리오 사이트, 백엔드 API 등 YamangSolution의 주요 프로젝트를 확인하세요.',
    canonicalPath: '/projects',
  },
  articles: {
    title: '기술 아티클',
    description:
      'Spring Boot, React, AI/ML, 시스템 아키텍처에 대한 YamangSolution의 기술 아티클과 개발 노트를 읽어보세요.',
    canonicalPath: '/articles',
  },
  chat: {
    title: 'AI 챗봇',
    description:
      'Claude API 기반 AI 챗봇으로 YamangSolution의 프로젝트, 기술 스택, 경험에 대해 자연어로 질문해보세요.',
    canonicalPath: '/chat',
  },
} as const;
