import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { adminArticleApi } from '@/admin/entities/article';

interface ArticleSearchSelectProps {
  value?: number;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

interface ArticleOption {
  value: number;
  label: string;
}

export const ArticleSearchSelect: React.FC<ArticleSearchSelectProps> = ({
  value,
  onChange,
  placeholder = '아티클 제목으로 검색...',
  style,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedKeyword(searchKeyword), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchKeyword]);

  const { data: searchResult, isLoading: isSearchLoading } = useQuery({
    queryKey: ['admin', 'articles', 'search', debouncedKeyword],
    queryFn: () => adminArticleApi.getAll({ page: 0, size: 20, searchKeyword: debouncedKeyword }),
    enabled: debouncedKeyword.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const { data: selectedArticle, isLoading: isSelectedLoading } = useQuery({
    queryKey: ['admin', 'articles', value],
    queryFn: () => adminArticleApi.getById(value!),
    enabled: value != null && !searchResult?.content.some(a => a.id === value),
    staleTime: 5 * 60 * 1000,
  });

  const options: ArticleOption[] = useMemo(() => {
    const result: ArticleOption[] = [];

    if (selectedArticle && !searchResult?.content.some(a => a.id === selectedArticle.id)) {
      result.push({ value: selectedArticle.id, label: selectedArticle.title });
    }

    (searchResult?.content ?? []).forEach(a => {
      result.push({ value: a.id, label: a.title });
    });

    return result;
  }, [searchResult, selectedArticle]);

  const handleChange = (val: number | null | undefined) => {
    onChange?.(val ?? null);
    if (val != null) setSearchKeyword('');
  };

  return (
    <Select
      value={value ?? undefined}
      options={options}
      onSearch={setSearchKeyword}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      loading={isSearchLoading || isSelectedLoading}
      allowClear
      onClear={() => onChange?.(null)}
      showSearch
      filterOption={false}
      notFoundContent={
        isSearchLoading ? '로딩 중...' :
        debouncedKeyword ? '아티클을 찾을 수 없습니다' :
        '검색어를 입력하세요'
      }
    />
  );
};
