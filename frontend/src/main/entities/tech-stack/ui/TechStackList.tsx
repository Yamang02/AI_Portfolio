import React, { useEffect, useState } from 'react';
import { compareStrings } from '@/main/shared/utils/sortUtils';
import { TechStackBadge, TechStack } from './TechStackBadge';
import { techStackApi } from '../api/techStackApi';

/**
 * 기술 ?�택 리스??Props
 */
export interface TechStackListProps {
  technologies: string[] | TechStack[];
  maxVisible?: number; // ?�시??최�? 개수 (?�머지??+N?�로 ?�시)
  variant?: 'default' | 'core' | 'filter' | 'compact'; // TechStackBadge variant
  size?: 'sm' | 'md' | 'lg'; // TechStackBadge size
  className?: string;
}

/**
 * 주요 기술 ?�택 캐시
 * API ?�출??최소?�하�??�해 메모리에 캐시
 */
let coreTechCache: Set<string> | null = null;
let coreTechPromise: Promise<Set<string>> | null = null;

/**
 * 주요 기술 ?�택 로드
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
      // ?�백: �?Set 반환
      coreTechCache = new Set();
      return coreTechCache;
    } finally {
      coreTechPromise = null;
    }
  })();

  return coreTechPromise;
};

/**
 * 기술 ?�택 메�??�이??변?? */
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
 * 기술 ?�택 리스??컴포?�트
 * 기술 ?�택?�을 배�? ?�태�??�시?�는 컴포?�트
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

  // 기술 ?�택 변??�??�렬
  const techStacks = technologies
    .map(convertToTechStack)
    .sort((a, b) => {
      const nameA = a.name ?? '';
      const nameB = b.name ?? '';
      const aIsCore = coreTechs.has(nameA.toLowerCase());
      const bIsCore = coreTechs.has(nameB.toLowerCase());

      if (aIsCore && !bIsCore) return -1;
      if (!aIsCore && bIsCore) return 1;

      return compareStrings(a.name, b.name);
    });

  // ?�시??기술 ?�택�??�길 개수 계산
  const visibleTechs = techStacks.slice(0, maxVisible);
  const hiddenCount = Math.max(0, techStacks.length - maxVisible);

  return (
    <div className={`tech-stack-list flex flex-wrap gap-2 ${className}`}>
      {visibleTechs.filter(tech => tech?.name).map((tech, index) => {
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
          +{hiddenCount}개        </span>
      )}
      
      {isLoading && (
        <span className="tech-stack-list__loading text-gray-400 text-sm">
          로딩 중...
        </span>
      )}
    </div>
  );
};
