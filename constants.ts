
import { Project } from './types';
import { appConfig } from './config/app.config';

// 기본 프로젝트 정보 (GitHub API 실패 시 폴백용)
export const PROJECTS: Project[] = [
  {
    id: 1,
    title: '성균관대학교 순수미술 동아리 갤러리 (SKKU FAC)',
    description: '성균관대 미술동아리 전시회의 예술 작품들을 온라인으로 전시하고 관리하는 웹 플랫폼입니다.',
    technologies: ['Node.js', 'Express.js', 'MySQL', 'EJS', 'JavaScript', 'Cloudinary', 'Redis'],
    githubUrl: `https://github.com/${appConfig.github.username}/SKKU_FAC`,
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '', // GitHub API에서 동적으로 가져올 예정
    type: 'project'
  },
  {
    id: 2,
    title: 'PYQT5 파일 태거 (File Tagger)',
    description: 'PyQt5를 사용한 데스크톱 파일 태깅 애플리케이션으로, 파일에 메타데이터 태그를 추가하고 관리할 수 있습니다.',
    technologies: ['Python', 'PyQt5', 'MongoDB', 'File System', 'GUI'],
    githubUrl: `https://github.com/${appConfig.github.username}/PYQT5_FileTagger`,
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '', // GitHub API에서 동적으로 가져올 예정
    type: 'project'
  },
  {
    id: 3,
    title: 'AI 포트폴리오 챗봇 (AI Portfolio Chatbot)',
    description: 'Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇으로, 프로젝트 정보를 자연어로 소개합니다.',
    technologies: ['React', 'TypeScript', 'Google Gemini API', 'GitHub API', 'Tailwind CSS'],
    githubUrl: `https://github.com/${appConfig.github.username}/AI_Portfolio`,
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '', // GitHub API에서 동적으로 가져올 예정
    type: 'project'
  },
  {
    id: 4,
    title: '개인 학습 노트 (Personal Study Notes)',
    description: '개인적으로 학습한 내용을 정리하고 관리하는 로컬 애플리케이션입니다. 다양한 주제의 학습 자료를 체계적으로 정리할 수 있습니다.',
    technologies: ['Python', 'SQLite', 'Tkinter', 'Markdown', 'Local Storage'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '로컬에서 개발 중인 개인 학습 노트 애플리케이션입니다.',
    type: 'experience'
  },
  {
    id: 5,
    title: '데이터 분석 대시보드 (Data Analysis Dashboard)',
    description: '회사 내부 데이터를 분석하고 시각화하는 로컬 대시보드 애플리케이션입니다. Excel 파일과 CSV 데이터를 처리할 수 있습니다.',
    technologies: ['Python', 'Pandas', 'Matplotlib', 'Streamlit', 'Excel'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '회사 내부용 데이터 분석 도구로, 민감한 데이터를 다루므로 로컬에서만 실행됩니다.',
    type: 'experience'
  }
];