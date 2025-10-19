import React, { useEffect, useState } from 'react';
import { TechStackBadge } from '../TechStackBadge/TechStackBadge';
import { TechStackMetadata } from '../../../entities/techstack';
import { apiClient } from '../../../../shared/services/apiClient';

/**
 * 기술 스택 리스트 Props
 */
export interface TechStackListProps {
  technologies: string[] | TechStackMetadata[];
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
      const coreTechs = await apiClient.getCoreTechStacks();
      coreTechCache = new Set(coreTechs.map((tech: any) => tech.name.toLowerCase()));
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
 * 문자열을 TechStackMetadata로 변환
 * ProjectCard에서 사용하던 변환 로직 재사용
 */
const convertToTechStackMetadata = (tech: string, coreTechnologies: Set<string>): TechStackMetadata => {
  const lowerTech = tech.toLowerCase();

  // 카테고리 결정
  let category: TechStackMetadata['category'] = 'other';
  if (['java', 'javascript', 'python', 'c#', 'typescript', 'c', 'c++', 'go', 'rust', 'kotlin', 'swift'].includes(lowerTech)) {
    category = 'language';
  } else if (['spring boot', 'react', 'express.js', 'pyqt5', 'phaser.js', 'jsp', 'servlet', 'vue.js', 'angular', 'next.js', 'django', 'flask', 'fastapi', 'nest.js', 'asp.net', '.net', 'laravel', 'spring', 'node.js'].includes(lowerTech)) {
    category = 'framework';
  } else if (['oracle', 'mysql', 'mongodb', 'redis', 'mssql', 'postgresql', 'sqlite'].includes(lowerTech)) {
    category = 'database';
  } else if (['git', 'docker', 'github actions', 'maven', 'cursor', 'selenium', 'beautifulsoup', 'yt-dlp', 'cloudinary', 'ejs', 'jquery', 'daypilot', 'chromedriver', 'pl/sql', 'svn', 'gitlab', 'sap', 'oracle forms', 'file system', 'gemini cli', 'cli', 'json', 'web scraping', 'requests', 'github pages'].includes(lowerTech)) {
    category = 'tool';
  }

  // 주요 기술 스택인지 확인
  const isCore = coreTechnologies.has(lowerTech);
  const level: 'core' | 'general' | 'learning' = isCore ? 'core' : 'learning';

  return {
    name: tech,
    displayName: tech,
    category,
    level,
    isCore,
    isActive: true,
    colorHex: '#6b7280',
    description: '',
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * 기술 스택 리스트 컴포넌트
 * 기술 스택을 배지 형태로 표시하고, 개수 제한 및 축약 표시 기능 제공
 */
export const TechStackList: React.FC<TechStackListProps> = ({
  technologies,
  maxVisible = 3,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  const [coreTechnologies, setCoreTechnologies] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // 주요 기술 스택 로드
  useEffect(() => {
    loadCoreTechnologies().then(coreSet => {
      setCoreTechnologies(coreSet);
      setIsLoading(false);
    });
  }, []);

  // 빈 배열 처리
  if (!technologies || technologies.length === 0) {
    return null;
  }

  // 로딩 중일 때는 기본 렌더링
  if (isLoading) {
    return null;
  }

  // TechStackMetadata 배열로 변환
  const techMetadataList: TechStackMetadata[] = technologies.map(tech => {
    if (typeof tech === 'string') {
      return convertToTechStackMetadata(tech, coreTechnologies);
    }
    return tech;
  });

  // 주요 기술 스택 우선 정렬
  const sortedTechs = [...techMetadataList].sort((a, b) => {
    // isCore가 true인 것을 우선 배치
    if (a.isCore && !b.isCore) return -1;
    if (!a.isCore && b.isCore) return 1;

    // 카테고리 우선순위: language > framework > database > tool > other
    const categoryPriority: Record<string, number> = {
      'language': 1,
      'framework': 2,
      'database': 3,
      'tool': 4,
      'other': 5
    };
    const aPriority = categoryPriority[a.category] || 5;
    const bPriority = categoryPriority[b.category] || 5;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // 같은 우선순위면 원래 순서 유지
    return 0;
  });

  // 표시할 항목과 숨겨진 항목 분리
  const visibleTechs = sortedTechs.slice(0, maxVisible);
  const hiddenCount = sortedTechs.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* 표시할 기술 스택 배지들 */}
      {visibleTechs.map((tech, index) => (
        <TechStackBadge
          key={`${tech.name}-${index}`}
          tech={tech}
          variant={variant}
          size={size}
        />
      ))}

      {/* 숨겨진 항목 개수 표시 */}
      {hiddenCount > 0 && (
        <span
          className={`inline-block font-medium rounded-full border bg-gray-200 text-gray-600 border-gray-300 ${
            size === 'sm' ? 'text-xs px-3 py-1.5' :
            size === 'lg' ? 'text-base px-4 py-2' :
            'text-sm px-3 py-1.5'
          }`}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
};

/**
 * 인라인 스타일의 간단한 기술 스택 리스트
 * ExperienceCard, EducationCard에서 사용하던 스타일
 */
export const SimpleTechStackList: React.FC<{
  technologies: string[];
  className?: string;
}> = ({ technologies, className = '' }) => {
  if (!technologies || technologies.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {technologies.map((tech, index) => (
        <span
          key={index}
          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200"
        >
          {tech}
        </span>
      ))}
    </div>
  );
};
