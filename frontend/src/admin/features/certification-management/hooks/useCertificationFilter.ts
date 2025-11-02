/**
 * Certification 필터 훅
 */

import { useState, useMemo } from 'react';
import type { Certification, CertificationFilter } from '../../../entities/certification';

export const useCertificationFilter = (certifications?: Certification[]) => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CertificationFilter['category']>('all');
  const [issuerFilter, setIssuerFilter] = useState<CertificationFilter['issuer']>('all');

  const filteredCertifications = useMemo(() => {
    if (!certifications) return [];

    return certifications.filter(certification => {
      // 검색어 필터
      const matchesSearch = !searchText || 
        certification.name.toLowerCase().includes(searchText.toLowerCase()) ||
        certification.issuer.toLowerCase().includes(searchText.toLowerCase()) ||
        certification.description?.toLowerCase().includes(searchText.toLowerCase());

      // 카테고리 필터
      const matchesCategory = categoryFilter === 'all' || certification.category === categoryFilter;

      // 발급기관 필터
      const matchesIssuer = issuerFilter === 'all' || certification.issuer === issuerFilter;

      return matchesSearch && matchesCategory && matchesIssuer;
    });
  }, [certifications, searchText, categoryFilter, issuerFilter]);

  return {
    filteredCertifications,
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
    issuerFilter,
    setIssuerFilter,
  };
};

