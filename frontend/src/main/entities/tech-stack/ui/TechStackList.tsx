import React, { useEffect, useState } from 'react';
import { TechStackBadge, TechStack } from './TechStackBadge';
import { techStackApi } from '../api/techStackApi';

/**
 * 기술 스택 리스트 Props
 */
export interface TechStackListProps {
  technologies: string[] | TechStack[];
  maxVisible?: number; // 표시할 최대 개수 (나머지는 +N으로 표시)
  variant?: 'default' | 'core' | 'filter' | 'compact'; // TechStackBadge variant
  size?: 'sm' | 'md' | 'lg'; // TechStackBadge size
  className?: string;
}

/**
 * 주요 기술 스택 캐시
 * API 호출을 최소화하기 위해 메모리에 캐시
 */
let coreTechCache: Set<string> | null = null;
let coreTechPromise: Promise<Set<string>> | null = null;

/**
 * 주요 기술 스택 로드
 */
const loadCoreTechnologies = async (): Promise<Set<string>> => {
  if (coreTechCache) {
    return coreTechCache;
  }

  if (coreTechPromise) {
    return coreTechPromise;
  }

  coreTechPromise = (async () => {
    try {
      const coreTechs = await techStackApi.getCoreTechStacks();
      coreTechCache = new Set(coreTechs.map((tech: TechStack) => tech.name.toLowerCase()));
      return coreTechCache;
    } catch (error) {
      console.error('Failed to load core technologies:', error);
      // 폴백: 빈 Set 반환
      coreTechCache = new Set();
      return coreTechCache;
    } finally {
      coreTechPromise = null;
    }
  })();

  return coreTechPromise;
};

/**
 * 기술 스택 메타데이터 변환
 */
const convertToTechStack = (tech: string | TechStack): TechStack => {
  if (typeof tech === 'string') {
    return {
      name: tech,
      category: 'other',
      level: 'intermediate',
    };
  }
  return tech;
};

/**
 * 기술 스택 리스트 컴포넌트
 * 기술 스택들을 배지 형태로 표시하는 컴포넌트
 */
export const TechStackList: React.FC<TechStackListProps> = ({
  technologies,
  maxVisible = 10,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const [coreTechs, setCoreTechs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCoreTechs = async () => {
      try {
        setIsLoading(true);
        const coreTechSet = await loadCoreTechnologies();
        setCoreTechs(coreTechSet);
      } catch (error) {
        console.error('Failed to load core technologies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCoreTechs();
  }, []);

  if (!technologies || technologies.length === 0) {
    return (
      <div className={`tech-stack-list ${className}`}>
        <span className="text-gray-500 text-sm">기술 스택 정보가 없습니다.</span>
      </div>
    );
  }

  // 기술 스택 변환 및 정렬
  const techStacks = technologies
    .map(convertToTechStack)
    .sort((a, b) => {
      // 핵심 기술을 먼저 표시
      const aIsCore = coreTechs.has(a.name.toLowerCase());
      const bIsCore = coreTechs.has(b.name.toLowerCase());
      
      if (aIsCore && !bIsCore) return -1;
      if (!aIsCore && bIsCore) return 1;
      
      // 그 다음은 이름순
      return a.name.localeCompare(b.name);
    });

  // 표시할 기술 스택과 숨길 개수 계산
  const visibleTechs = techStacks.slice(0, maxVisible);
  const hiddenCount = Math.max(0, techStacks.length - maxVisible);

  return (
    <div className={`tech-stack-list flex flex-wrap gap-2 ${className}`}>
      {visibleTechs.filter(tech => tech && tech.name).map((tech, index) => {
        const isCore = coreTechs.has(tech.name.toLowerCase());
        const techVariant = isCore ? 'core' : variant;
        
        return (
          <TechStackBadge
            key={`${tech.name}-${index}`}
            tech={tech}
            variant={techVariant}
            size={size}
          />
        );
      })}
      
      {hiddenCount > 0 && (
        <span className="tech-stack-list__more text-gray-500 text-sm px-2 py-1 bg-gray-100 rounded">
          +{hiddenCount}개 더
        </span>
      )}
      
      {isLoading && (
        <span className="tech-stack-list__loading text-gray-400 text-sm">
          로딩 중...
        </span>
      )}
    </div>
  );
};
