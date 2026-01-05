/**
 * Featured Projects Configuration
 * 
 * Phase 5: UI Implementation
 * 랜딩 페이지의 주요 프로젝트를 설정 파일로 관리합니다.
 * API 장애와 독립적으로 동작하며, 랜딩 페이지 맥락에 맞는 소개문구를 제공합니다.
 */

export interface FeaturedProject {
  id: string;
  title: string;
  subtitle: string; // 랜딩 전용 소개문구
  imageUrl: string;
  tags: string[];
  link: string;
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: 'genpresso',
    title: 'Genpresso',
    subtitle: 'AI 기반 블로그 자동화 플랫폼',
    imageUrl: '/images/project-1.jpg',
    tags: ['TypeScript', 'React', 'Node.js'],
    link: '/projects/genpresso',
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    subtitle: 'LLM 기반 지능형 챗봇 서비스',
    imageUrl: '/images/project-2.jpg',
    tags: ['Python', 'FastAPI', 'OpenAI'],
    link: '/projects/ai-chatbot',
  },
  {
    id: 'noru-erp',
    title: '노루 ERP',
    subtitle: '중소기업에 특화된 맞춤형 ERP 솔루션',
    imageUrl: '/images/project-3.jpg',
    tags: ['Java', 'Spring', 'PostgreSQL'],
    link: '/projects/noru-erp',
  },
];

export const FEATURED_CONFIG = {
  maxDisplay: 3,
  // 향후 확장: A/B 테스트, 다국어 등
} as const;
