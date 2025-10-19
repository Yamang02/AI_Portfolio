// 기술 스택 분류를 위한 상수 정의
const TECH_CATEGORIES = {
  language: ['java', 'javascript', 'python', 'c#', 'typescript'],
  framework: ['spring boot', 'react', 'express.js', 'pyqt5', 'phaser.js', 'jsp', 'servlet'],
  database: ['oracle', 'mysql', 'mongodb', 'redis', 'mssql'],
  tool: ['git', 'docker', 'github actions', 'maven', 'cursor', 'selenium', 'beautifulsoup', 'yt-dlp', 'cloudinary', 'ejs', 'jquery', 'daypilot', 'chromedriver', 'pl/sql', 'svn', 'gitlab', 'sap', 'oracle forms', 'file system', 'gemini cli', 'cli', 'json', 'web scraping', 'requests', 'github pages']
} as const;

const TECH_LEVELS = {
  core: ['java', 'spring boot', 'react', 'git', 'javascript'],
  general: ['python', 'mysql', 'docker', 'maven']
} as const;

export type TechCategory = keyof typeof TECH_CATEGORIES;
export type TechLevel = keyof typeof TECH_LEVELS;

export interface TechStackMetadata {
  name: string;
  displayName: string;
  category: TechCategory | 'other';
  level: TechLevel | 'learning';
  isCore: boolean;
  isActive: boolean;
  colorHex: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TechCategoryGroup {
  name: string;
  techs: string[];
}

// 메모이제이션을 위한 캐시
const techStackCache = new Map<string, TechStackMetadata>();

/**
 * 기술 스택을 카테고리별로 분류하는 순수 함수
 */
export const getTechCategory = (tech: string): TechCategory | 'other' => {
  const lowerTech = tech.toLowerCase();
  
  for (const [category, techs] of Object.entries(TECH_CATEGORIES)) {
    if (techs.includes(lowerTech)) {
      return category as TechCategory;
    }
  }
  
  return 'other';
};

/**
 * 기술 스택의 레벨을 결정하는 순수 함수
 */
export const getTechLevel = (tech: string): TechLevel | 'learning' => {
  const lowerTech = tech.toLowerCase();
  
  if (TECH_LEVELS.core.includes(lowerTech as any)) {
    return 'core';
  } else if (TECH_LEVELS.general.includes(lowerTech as any)) {
    return 'general';
  }
  
  return 'learning';
};

/**
 * 기술 스택을 TechStackMetadata로 변환하는 함수
 */
export const convertToTechStackMetadata = (tech: string): TechStackMetadata => {
  const cacheKey = tech.toLowerCase();
  
  if (techStackCache.has(cacheKey)) {
    return techStackCache.get(cacheKey)!;
  }
  
  const category = getTechCategory(tech);
  const level = getTechLevel(tech);
  
  const metadata: TechStackMetadata = {
    name: tech,
    displayName: tech,
    category,
    level,
    isCore: level === 'core',
    isActive: true,
    colorHex: '#6b7280',
    description: '',
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  techStackCache.set(cacheKey, metadata);
  return metadata;
};

/**
 * 기술 스택 배열을 카테고리별로 그룹화하는 함수
 */
export const categorizeTechStack = (technologies: string[]): TechCategoryGroup[] => {
  const groups = new Map<string, string[]>();
  
  technologies.forEach(tech => {
    const category = getTechCategory(tech);
    const categoryName = category === 'other' ? '기타' : 
                        category === 'language' ? '언어' :
                        category === 'framework' ? '프레임워크' :
                        category === 'database' ? '데이터베이스' : '도구';
    
    if (!groups.has(categoryName)) {
      groups.set(categoryName, []);
    }
    groups.get(categoryName)!.push(tech);
  });
  
  return Array.from(groups.entries()).map(([name, techs]) => ({
    name,
    techs: techs.sort() // 알파벳 순으로 정렬
  }));
};

/**
 * 기술 스택 배지의 CSS 클래스를 반환하는 함수
 */
export const getTechBadgeClass = (tech: string): string => {
  const category = getTechCategory(tech);
  
  const baseClass = 'tech-badge tech-badge--sm';
  
  switch (category) {
    case 'language':
      return `${baseClass} tech-badge--language`;
    case 'framework':
      return `${baseClass} tech-badge--framework`;
    case 'database':
      return `${baseClass} tech-badge--database`;
    case 'tool':
      return `${baseClass} tech-badge--tool`;
    default:
      return `${baseClass} tech-badge--default`;
  }
};
