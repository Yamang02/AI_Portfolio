
import { Project } from './types';

// 기본 프로젝트 정보 (GitHub API 실패 시 폴백용)
export const PROJECTS: Project[] = [
  {
    id: 1,
    title: '성균관대학교 순수미술 동아리 갤러리 (SKKU FAC)',
    description: '성균관대 미술동아리 전시회의 예술 작품들을 온라인으로 전시하고 관리하는 웹 플랫폼입니다.',
    technologies: ['Node.js', 'Express.js', 'MySQL', 'EJS', 'JavaScript', 'Cloudinary', 'Redis'],
    githubUrl: 'https://github.com/Yamang02/SKKU_FAC',
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '' // GitHub API에서 동적으로 가져올 예정
  }
  // 추가 프로젝트는 대기 중...
];