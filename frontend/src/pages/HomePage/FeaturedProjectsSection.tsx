import React, { useEffect, useState, useRef } from 'react';
import { SectionTitle } from '@/design-system';
import { TechStackList } from '@/main/components/common/TechStack';
import styles from './FeaturedProjectsSection.module.css';

interface Project {
  id: string;
  title: string;
  imageUrl?: string;
  technologies: string[];
  description: string;
}

// Phase 4: 하드코딩된 예시 데이터
// Phase 5에서 API 연동으로 교체 예정
const PROJECTS: Project[] = [
  {
    id: 'genpresso',
    title: 'Genpresso',
    imageUrl: '/images/project-1.jpg',
    technologies: ['TypeScript', 'React', 'Node.js'],
    description: 'AI 기반 블로그 자동화 플랫폼입니다. 콘텐츠 생성부터 배포까지 전 과정을 자동화하여 블로거의 생산성을 크게 향상시킵니다.',
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    imageUrl: '/images/project-2.jpg',
    technologies: ['Python', 'FastAPI', 'OpenAI'],
    description: 'LLM 기반 지능형 채팅봇 서비스입니다. 자연어 처리 기술을 활용하여 사용자와 자연스러운 대화를 제공합니다.',
  },
  {
    id: 'noru-erp',
    title: '노루 ERP',
    imageUrl: '/images/project-3.jpg',
    technologies: ['Java', 'Spring', 'PostgreSQL'],
    description: '중소기업을 위한 통합 ERP 시스템입니다. 재고 관리, 회계, 인사 등 기업 운영에 필요한 모든 기능을 제공합니다.',
  },
];

export const FeaturedProjectsSection: React.FC = () => {
  const [cardProgress, setCardProgress] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const windowHeight = window.innerHeight;
      const windowCenter = windowHeight / 2;
      const progressArray: number[] = [];

      cardRefs.current.forEach((card) => {
        if (!card) {
          progressArray.push(0);
          return;
        }

        const rect = card.getBoundingClientRect();
        const cardTop = rect.top;
        const cardBottom = rect.bottom;
        const cardHeight = rect.height;
        const cardCenter = cardTop + cardHeight / 2;

        // 카드가 뷰포트 중앙에 얼마나 가까운지 계산 (0 ~ 1)
        const distance = Math.abs(cardCenter - windowCenter);
        const maxDistance = windowHeight / 2 + cardHeight / 2;
        const progress = Math.max(0, 1 - distance / maxDistance);

        progressArray.push(progress);
      });

      setCardProgress(progressArray);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기값 설정

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      id="featured-projects" 
      ref={sectionRef}
      className={styles.featuredProjects}
    >
      <div className={styles.cardsContainer}>
        {PROJECTS.map((project, index) => {
          const progress = cardProgress[index] || 0;
          const isActive = progress > 0.5;
          const opacity = Math.min(1, progress * 2); // 0.5 이상일 때 완전히 보이도록
          const scale = 0.8 + progress * 0.2; // 0.8 ~ 1.0
          const translateY = (1 - progress) * 50; // 위에서 아래로

          return (
            <div
              key={project.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={styles.cardWrapper}
              style={{
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
              }}
            >
              <div className={styles.projectCard}>
                {/* 이미지 영역 */}
                <div className={styles.imageArea}>
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>📁</span>
                    </div>
                  )}
                </div>
                
                {/* 카드 본문 */}
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
              
              {/* 소개문구 */}
              <div 
                className={styles.description}
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                }}
              >
                <p>{project.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
