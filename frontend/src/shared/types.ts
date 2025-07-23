export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  readme: string;
  imageUrl: string;
  type: 'project' | 'experience'; // 실제 개발 프로젝트와 업무/학습 경험을 구분
} 