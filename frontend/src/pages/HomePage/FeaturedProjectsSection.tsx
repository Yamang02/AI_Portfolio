import React from 'react';
import { SectionTitle, TextLink, Badge, Divider } from '@/design-system';
import styles from './FeaturedProjectsSection.module.css';

interface Project {
  id: string;
  title: string;
  summary: string;
  tags: string[];
}

// Phase 4: 하드코딩된 예시 데이터
// Phase 5에서 API 연동으로 교체 예정
const featuredProjects: Project[] = [
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
];

export const FeaturedProjectsSection: React.FC = () => {
  return (
    <section className={styles.featured}>
      <Divider variant="horizontal" />
      <div className={styles.container}>
        <SectionTitle level="h2">Featured Projects</SectionTitle>
        <div className={styles.grid}>
          {featuredProjects.map((project) => (
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
        <div className={styles.viewAll}>
          <TextLink href="/projects" underline>
            전체 프로젝트 보기 →
          </TextLink>
        </div>
      </div>
    </section>
  );
};
