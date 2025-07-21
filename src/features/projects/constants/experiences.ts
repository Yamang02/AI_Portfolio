import { Project } from '../types';

// 경험 항목들 (GitHub 소스가 없는 학습/업무 경험)
export const EXPERIENCES: Project[] = [
  {
    id: 4,
    title: 'Sesac',
    description: 'Sesac 교육 수강',
    technologies: ['Python', 'SQLite', 'Tkinter', 'Markdown', 'Local Storage'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: '#', // 기본 아이콘 사용
    readme: '커리큘럼 참고',
    type: 'experience',
    source: 'experience'
  }
]; 