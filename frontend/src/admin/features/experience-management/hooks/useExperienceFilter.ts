/**
 * Experience 필터링 커스텀 훅
 */

import { useMemo, useState } from 'react';
import type { Experience, ExperienceType } from '@/admin/entities/experience';

export const useExperienceFilter = (experiences: Experience[] = []) => {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<ExperienceType | 'all'>('all');

  const filteredExperiences = useMemo(() => {
    return experiences.filter(experience => {
      // 검색어 필터링
      const matchesSearch =
        !searchText ||
        experience.title.toLowerCase().includes(searchText.toLowerCase()) ||
        experience.organization.toLowerCase().includes(searchText.toLowerCase()) ||
        experience.role.toLowerCase().includes(searchText.toLowerCase()) ||
        (experience.description && experience.description.toLowerCase().includes(searchText.toLowerCase()));

      // 타입 필터링
      const matchesType = typeFilter === 'all' || experience.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [experiences, searchText, typeFilter]);

  return {
    filteredExperiences,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
  };
};
