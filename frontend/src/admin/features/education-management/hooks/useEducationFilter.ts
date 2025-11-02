/**
 * Education 필터링 커스텀 훅
 */

import { useMemo, useState } from 'react';
import type { Education, EducationType } from '@/admin/entities/education';

export const useEducationFilter = (educations: Education[] = []) => {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<EducationType | 'all'>('all');

  const filteredEducations = useMemo(() => {
    return educations.filter(education => {
      // 검색어 필터링
      const matchesSearch =
        !searchText ||
        education.title.toLowerCase().includes(searchText.toLowerCase()) ||
        education.organization.toLowerCase().includes(searchText.toLowerCase()) ||
        (education.major && education.major.toLowerCase().includes(searchText.toLowerCase())) ||
        (education.description && education.description.toLowerCase().includes(searchText.toLowerCase()));

      // 타입 필터링
      const matchesType = typeFilter === 'all' || education.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [educations, searchText, typeFilter]);

  return {
    filteredEducations,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
  };
};
