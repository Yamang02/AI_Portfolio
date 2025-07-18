
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
  },
  {
    id: 2,
    title: 'PYQT5 파일 태거 (File Tagger)',
    description: 'PyQt5를 사용한 데스크톱 파일 태깅 애플리케이션으로, 파일에 메타데이터 태그를 추가하고 관리할 수 있습니다.',
    technologies: ['Python', 'PyQt5', 'SQLite', 'File System', 'GUI'],
    githubUrl: 'https://github.com/Yamang02/PYQT5_FileTagger',
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '' // GitHub API에서 동적으로 가져올 예정
  },
  {
    id: 3,
    title: 'AI 포트폴리오 챗봇 (AI Portfolio Chatbot)',
    description: 'Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇으로, 프로젝트 정보를 자연어로 소개합니다.',
    technologies: ['React', 'TypeScript', 'Google Gemini API', 'GitHub API', 'Tailwind CSS'],
    githubUrl: 'https://github.com/Yamang02/AI_Portfolio',
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '' // GitHub API에서 동적으로 가져올 예정
  }
];