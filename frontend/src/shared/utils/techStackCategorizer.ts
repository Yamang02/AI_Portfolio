import { TechStackMetadata } from '../../entities/techstack';

// 기술 스택 분야별 분류 정의
export interface TechStackCategory {
  id: string;
  name: string;
  description: string;
  categories: string[];
}

export const TECH_STACK_CATEGORIES: TechStackCategory[] = [
  {
    id: 'languages',
    name: '프로그래밍 언어',
    description: 'Programming Languages',
    categories: ['language']
  },
  {
    id: 'frameworks',
    name: '프레임워크 & 라이브러리',
    description: 'Frameworks & Libraries',
    categories: ['framework', 'library', 'template', 'web']
  },
  {
    id: 'databases',
    name: '데이터베이스 & 인프라',
    description: 'Databases & Infrastructure',
    categories: ['database', 'platform', 'hosting', 'service']
  },
  {
    id: 'tools',
    name: '개발 도구 & 기타',
    description: 'Development Tools & Others',
    categories: ['tool', 'vcs', 'testing', 'api', 'ai_ml', 'scraping', 'utility', 'erp', 'system', 'data', 'technique']
  }
];

// 기술 스택을 분야별로 분류하는 함수
export const categorizeTechStacks = (techStacks: TechStackMetadata[]): Record<string, TechStackMetadata[]> => {
  const categorized: Record<string, TechStackMetadata[]> = {};
  
  // 입력값 검증
  if (!techStacks || !Array.isArray(techStacks)) {
    // 빈 배열이나 유효하지 않은 입력값인 경우 빈 카테고리 반환
    TECH_STACK_CATEGORIES.forEach(category => {
      categorized[category.id] = [];
    });
    return categorized;
  }
  
  // 각 분야별로 빈 배열 초기화
  TECH_STACK_CATEGORIES.forEach(category => {
    categorized[category.id] = [];
  });
  
  // 기술 스택을 분야별로 분류
  techStacks.forEach(tech => {
    // tech 객체 유효성 검증
    if (!tech || typeof tech !== 'object') {
      console.warn('Invalid tech object:', tech);
      return;
    }
    
    const category = TECH_STACK_CATEGORIES.find(cat => 
      cat.categories.includes(tech.category)
    );
    
    if (category) {
      categorized[category.id].push(tech);
    } else {
      // 분류되지 않은 기술은 'tools' 카테고리에 추가
      categorized['tools'].push(tech);
    }
  });
  
  // 각 분야 내에서 알파벳 순으로 정렬
  Object.keys(categorized).forEach(categoryId => {
    categorized[categoryId].sort((a, b) => 
      a.displayName.localeCompare(b.displayName, 'ko', { sensitivity: 'base' })
    );
  });
  
  return categorized;
};

// 분야별 기술 스택 그룹 정보를 생성하는 함수
export const createTechStackGroups = (techStacks: TechStackMetadata[]) => {
  // 입력값 검증
  if (!techStacks || !Array.isArray(techStacks)) {
    return []; // 빈 배열 반환
  }
  
  const categorized = categorizeTechStacks(techStacks);
  
  return TECH_STACK_CATEGORIES.map(category => ({
    ...category,
    techs: categorized[category.id],
    count: categorized[category.id].length
  })).filter(group => group.count > 0); // 기술이 있는 분야만 반환
};
