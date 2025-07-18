
import { Project } from './types';

// 기본 프로젝트 정보 (GitHub API 실패 시 폴백용)
export const PROJECTS: Project[] = [
  {
    id: 1,
    title: '성균관대학교 순수미술 동아리 갤러리 (SKKU FAC)',
    description: '성균관대 미술동아리 성미회를 위한 디지털 아카이브 사이트입니다.',
    technologies: ['Java', 'Spring Boot', 'Spring Security', 'JPA', 'MySQL', 'JavaScript', 'Thymeleaf', 'AWS'],
    githubUrl: 'https://github.com/Yamang02/SKKU_FAC',
    liveUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed711b934?q=80&w=800&h=600&auto=format&fit=crop',
    readme: '' // GitHub API에서 동적으로 가져올 예정
  }
  // 추가 프로젝트는 대기 중...
];