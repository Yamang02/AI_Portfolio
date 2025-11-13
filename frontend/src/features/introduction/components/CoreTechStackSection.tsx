import React, { useState, useEffect } from 'react';
import { TechStackMetadata } from '@entities/tech-stack';
import { TechStackApi } from '@shared/techStackApi';
import { TechStackBadge } from '@shared/ui';
import './CoreTechStackSection.css';

/**
 * 소개 섹션용 핵심 기술 스택 컴포넌트
 * 사용자의 핵심 기술 스택을 시각적으로 표시
 */
export const CoreTechStackSection: React.FC = () => {
  const [coreTechs, setCoreTechs] = useState<TechStackMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoreTechs = async () => {
      try {
        setLoading(true);
        const data = await TechStackApi.getCoreTechStackMetadata();
        setCoreTechs(data);
        setError(null);
      } catch (err) {
        console.error('핵심 기술 스택 조회 실패:', err);
        setError('핵심 기술 스택을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoreTechs();
  }, []);

  if (loading) {
    return (
      <div className="core-tech-section">
        <h3 className="core-tech-section__title">핵심 기술 스택</h3>
        <div className="core-tech-section__badges">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="tech-badge tech-badge--loading">
              <div className="tech-badge__skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="core-tech-section">
        <h3 className="core-tech-section__title">핵심 기술 스택</h3>
        <div className="core-tech-section__error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (coreTechs.length === 0) {
    return (
      <div className="core-tech-section">
        <h3 className="core-tech-section__title">핵심 기술 스택</h3>
        <div className="core-tech-section__empty">
          <p>표시할 핵심 기술 스택이 없습니다.</p>
        </div>
      </div>
    );
  }

  // 레벨별로 그룹화 (단순화)
  const coreLevelTechs = coreTechs.filter(tech => tech.level === 'core');
  const generalLevelTechs = coreTechs.filter(tech => tech.level === 'general');

  return (
    <div className="core-tech-section--minimal">
      <div className="core-tech-section__badges">
        {coreTechs.map((tech) => (
          <TechStackBadge
            key={tech.name}
            tech={tech}
            variant="default"
            size="md"
          />
        ))}
      </div>
    </div>
  );
};
