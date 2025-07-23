import { Project } from '../types';

// GitHub 소스 연결이 가능한 프로젝트들
export const GITHUB_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    title: '성균관대학교 순수미술 동아리 갤러리 (SKKU FAC)',
    description: '성균관대 미술동아리 전시회의 예술 작품들을 온라인으로 전시하고 관리하는 웹 플랫폼입니다.',
    technologies: ['Node.js', 'Express.js', 'MySQL', 'EJS', 'JavaScript', 'Cloudinary', 'Redis', 'Cursor'],
    githubUrl: `https://github.com/Yamang02/SKKU_FAC`,
    liveUrl: 'https://www.skkuartclub.kr/',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '', // GitHub API에서 동적으로 가져올 예정
    type: 'project',
    source: 'github',
    startDate: '2025-02',
    endDate: '2025-05',
    isTeam: false,
    externalUrl: 'https://enchanting-caravan-a18.notion.site/SKKU-1dc50f33f34c80b7a08fc7afce8be9ab'
  },
  {
    id: 'proj-002',
    title: 'PYQT5 파일 태거 (File Tagger)',
    description: 'PyQt5를 사용한 데스크톱 파일 태깅 애플리케이션으로, 파일에 메타데이터 태그를 추가하고 관리할 수 있습니다.',
    technologies: ['Python', 'PyQt5', 'MongoDB', 'File System', 'Cursor', 'Gemini CLI'],
    githubUrl: `https://github.com/Yamang02/PYQT5_FileTagger`,
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '', // GitHub API에서 동적으로 가져올 예정
    type: 'project',
    source: 'github',
    startDate: '2025-07',
    endDate: '2025-08',
    isTeam: false,
    externalUrl: 'https://enchanting-caravan-a18.notion.site/FileTagger-23750f33f34c8005b895e92f6a66b6e9?pvs=74'
  },
  {
    id: 'proj-003',
    title: 'AI 포트폴리오 챗봇 (AI Portfolio Chatbot)',
    description: 'Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇으로, 프로젝트 정보를 자연어로 소개합니다.',
    technologies: ['React', 'Google Gemini API', 'GitHub API', 'Cursor', 'Gemini CLI', 'GCP', 'Cloud Run', 'Docker', 'GitHub Actions'],
    githubUrl: `https://github.com/Yamang02/AI_Portfolio`,
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '', // GitHub API에서 동적으로 가져올 예정
    type: 'project',
    source: 'github',
    startDate: '2025-07',
    endDate: undefined, // 현재 진행 중
    isTeam: false,
    externalUrl: 'https://enchanting-caravan-a18.notion.site/AI-23750f33f34c80b8ade2d33e80698d5f'
  },
  {
    id: 'github-004',
    title: 'Jooongo - 중고거래 크롤링 프로그램',
    description: '키워드를 입력하면 중고나라, 번개장터, 당근마켓 페이지에서 해당 키워드로 검색된 내용들을 크롤링해오는 파이썬 프로그램입니다.',
    technologies: ['Python', 'Selenium', 'ChromeDriver', 'Web Scraping', 'BeautifulSoup', 'Requests'],
    githubUrl: `https://github.com/Yamang02/Jooongo`,
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '', // GitHub API에서 동적으로 가져올 예정
    type: 'project',
    source: 'github',
    startDate: '2022-09',
    endDate: '2022-11',
    isTeam: false
  }
];

// 모든 프로젝트 (GitHub + 로컬)
export const ALL_PROJECTS: Project[] = [
  ...GITHUB_PROJECTS,
  // 추가 로컬 프로젝트들
]; 