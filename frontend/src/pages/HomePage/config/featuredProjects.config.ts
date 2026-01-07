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
    id: 'prj-001',
    title: '성균관대 미술동아리 아카이브',
    subtitle: 'Cursor로 제작한 첫 프로젝트. 에이전틱 코딩의 가능성을 보고 생소했던 기술스택 선정. 현재 운영 중',
    imageUrl: '/images/projects/prj-001-skkufac.png',
    tags: ['Node.js', 'Express.js', 'JavaScript', 'MySQL', 'Redis', 'EJS'],
    link: '/projects/prj-001',
  },
  {
    id: 'prj-003',
    title: 'AI 챗봇 포트폴리오',
    subtitle: 'Gemini LLM 래핑으로 POC 구축한 현재 사이트, 추후 로컬LLM 적용 예정',
    imageUrl: '/images/projects/prj-003-ai-chatbot.png',
    tags: ['React', 'Spring Boot', 'Java', 'Google Gemini API', 'Docker'],
    link: '/projects/prj-003',
  },
  {
    id: 'prj-011',
    title: 'Genpresso(Admin)',
    subtitle: '실무에 에이전틱 코딩을 적용, 사내 서비스 관리 사이트를 완성',
    imageUrl: '/images/projects/prj-011-genpresso.png',
    tags: ['React', 'TypeScript', 'Node.js', 'AWS', 'Postgresql', 'DynamoDB'],
    link: '/projects/prj-011',
  },
];

export const FEATURED_CONFIG = {
  maxDisplay: 3,
  // 향후 확장: A/B 테스트, 다국어 등
} as const;
