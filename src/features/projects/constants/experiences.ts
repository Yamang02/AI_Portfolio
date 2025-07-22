import { Experience, Education } from '../types';

// 경력 항목들
export const EXPERIENCES: Experience[] = [
  {
    id: 'exp-001',
    title: '(주)디아이티',
    description: '노루 그룹 전산 계열사',
    technologies: ['Python', 'SQLite', 'Tkinter', 'Markdown', 'Local Storage'],
    organization: '디아이티',
    startDate: '2023-07',
    endDate: '2025-01',
    type: 'career'
  }
];

// 교육 항목들
export const EDUCATIONS: Education[] = [
  {
    id: 'edu-001',
    title: 'Sesac',
    description: 'Cloud 기반 Multi Modal AI 개발자 양성 과정 with Google Cloud',
    technologies: ['Python', 'SQLite', 'Tkinter', 'Markdown', 'Local Storage'],
    organization: 'Sesac 강동지점',
    startDate: '2025-06',
    endDate: undefined,
    type: 'education'
  },
  {
    id: 'edu-002',
    title: 'KH정보교육원',
    description: '(디지털컨버전스)자바(JAVA)기반 클라우드 융합 개발자 양성과정A9',
    technologies: ['Python', 'SQLite', 'Tkinter', 'Markdown', 'Local Storage'],
    organization: 'KH정보교육원 강남지사',
    startDate: '2022-11',
    endDate: '2023-04',
    type: 'education'
  }
]; 