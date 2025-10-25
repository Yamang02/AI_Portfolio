/**
 * 기술 스택 필터링 커스텀 훅
 */

import { useMemo, useState } from 'react';
import type { TechStackMetadata, TechStackCategory } from '../../entities/tech-stack';

export const useTechStackFilter = (techStacks: TechStackMetadata[] = []) => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TechStackCategory | 'all'>('all');

  const filteredTechStacks = useMemo(() => {
    return techStacks.filter(tech => {
      const matchesSearch = tech.displayName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
        tech.name.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || tech.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [techStacks, searchText, categoryFilter]);

  return {
    filteredTechStacks,
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
  };
};
