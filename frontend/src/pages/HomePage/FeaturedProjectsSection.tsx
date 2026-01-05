import React, { useState, useEffect } from 'react';
import { TechStackList } from '@/main/components/common/TechStack';
import styles from './FeaturedProjectsSection.module.css';

interface Project {
  id: string;
  title: string;
  imageUrl?: string;
  technologies: string[];
  description: string;
}

// Phase 4: 하드코딩으로 임시 바인딩
// Phase 5에서 API 연동으로 교체 예정
const PROJECTS: Project[] = [
  {
    id: 'genpresso',
    title: 'Genpresso',
    imageUrl: '/images/project-1.jpg',
    technologies: ['TypeScript', 'React', 'Node.js'],
    description:
      'AI 기반 블로그 자동화 플랫폼입니다. 컨텐츠 작성부터 배포까지 전 과정을 자동화하여 블로거의 생산성을 크게 향상시킵니다.',
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    imageUrl: '/images/project-2.jpg',
    technologies: ['Python', 'FastAPI', 'OpenAI'],
    description:
      'LLM 기반 지능형 챗봇 서비스입니다. 자연어 처리 기술을 활용하여 사용자와 자연스러운 대화를 제공합니다.',
  },
  {
    id: 'noru-erp',
    title: '노루 ERP',
    imageUrl: '/images/project-3.jpg',
    technologies: ['Java', 'Spring', 'PostgreSQL'],
    description:
      '중소기업에 특화된 맞춤형 ERP 솔루션입니다. 재고/회계/영업을 아우르는 통합 관리 기능을 제공합니다.',
  },
];

/**
 * FeaturedProjectsSection - 각 프로젝트를 전폭 섹션으로 독립 노출
 */
export const FeaturedProjectsSection: React.FC = () => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // 섹션이 뷰포트에 들어온 후 1.5초 뒤에 스크롤 인디케이터 표시
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !showScrollIndicator) {
          timer = setTimeout(() => {
            setShowScrollIndicator(true);
          }, 1500);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('featured-projects');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (section) {
        observer.unobserve(section);
      }
    };
  }, [showScrollIndicator]);

  const scrollToNext = () => {
    const nextSection = document.getElementById('cta');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="featured-projects" className={styles.featuredProjects}>
      {PROJECTS.map((project, index) => (
        <article 
          key={project.id} 
          className={styles.projectSection}
          data-project-index={index}
        >
          <div className={styles.projectContent}>
            <div className={styles.projectCard}>
              <div className={styles.imageArea}>
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span role="img" aria-label="placeholder">
                      🖼
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <TechStackList
                  technologies={project.technologies}
                  maxVisible={3}
                  variant="default"
                  size="sm"
                  className={styles.techStack}
                />
              </div>
            </div>

            <div className={styles.description}>
              <p>{project.description}</p>
            </div>
          </div>
          {/* 마지막 프로젝트에만 스크롤 인디케이터 표시 */}
          {index === PROJECTS.length - 1 && (
            <button
              className={`${styles.scrollIndicator} ${showScrollIndicator ? styles.show : ''}`}
              onClick={scrollToNext}
              aria-label="다음 섹션으로"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M7 13l5 5 5-5" />
                <path d="M7 6l5 5 5-5" />
              </svg>
            </button>
          )}
        </article>
      ))}
    </section>
  );
};
