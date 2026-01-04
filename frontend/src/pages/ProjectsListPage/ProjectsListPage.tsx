import React from 'react';
import { SectionTitle, TextLink, Badge, Divider } from '@/design-system';
import styles from './ProjectsListPage.module.css';

// API 구조 정의 (Phase 4에서는 하드코딩, Phase 5에서 실제 API 연동)
export interface ProjectAPIResponse {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  // Phase 5에서 추가될 필드들
  // description?: string;
  // technologies?: string[];
  // githubUrl?: string;
  // liveUrl?: string;
}

interface Project {
  id: string;
  title: string;
  summary: string;
  tags: string[];
}

// Phase 4: 하드코딩된 예시 데이터
// Phase 5: API에서 가져오기
const projects: Project[] = [
  {
    id: 'genpresso',
    title: 'Genpresso',
    summary: 'AI 기반 블로그 자동화 플랫폼',
    tags: ['AI활용', '웹개발', 'TypeScript'],
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    summary: 'LLM 기반 채팅봇 서비스',
    tags: ['AI활용', 'NLP', 'Node.js'],
  },
  {
    id: 'noru-erp',
    title: '노루 ERP',
    summary: '중소기업 ERP 시스템',
    tags: ['웹개발', 'Java', 'Spring'],
  },
  {
    id: 'project-4',
    title: 'Project 4',
    summary: '프로젝트 4 설명',
    tags: ['웹개발', 'React'],
  },
  {
    id: 'project-5',
    title: 'Project 5',
    summary: '프로젝트 5 설명',
    tags: ['AI활용', 'Python'],
  },
  {
    id: 'project-6',
    title: 'Project 6',
    summary: '프로젝트 6 설명',
    tags: ['웹개발', 'Vue'],
  },
  {
    id: 'project-7',
    title: 'Project 7',
    summary: '프로젝트 7 설명',
    tags: ['모바일', 'React Native'],
  },
  {
    id: 'project-8',
    title: 'Project 8',
    summary: '프로젝트 8 설명',
    tags: ['AI활용', 'Machine Learning'],
  },
];

export const ProjectsListPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.container}>
          <SectionTitle level="h1">Projects</SectionTitle>
          <p className={styles.description}>
            AI를 적극 활용한 프로젝트 모음입니다.
          </p>
          <p className={styles.count}>총 {projects.length}개의 프로젝트</p>
        </div>
        <Divider variant="horizontal" />
      </section>

      <section className={styles.projects}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {projects.map((project) => (
              <div key={project.id} className={styles.card}>
                <SectionTitle level="h3">{project.title}</SectionTitle>
                <p className={styles.summary}>{project.summary}</p>
                <div className={styles.tags}>
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className={styles.link}>
                  <TextLink href={`/projects/${project.id}`} underline>
                    자세히 보기 →
                  </TextLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
