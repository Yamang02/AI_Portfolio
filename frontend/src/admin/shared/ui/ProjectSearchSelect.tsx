import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/main/entities/project/api/projectApi';

interface ProjectSearchSelectProps {
  value?: number;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

interface ProjectOption {
  value: number;
  label: string;
}

/**
 * 프로젝트명으로 디바운싱 검색하는 Select 컴포넌트
 */
export const ProjectSearchSelect: React.FC<ProjectSearchSelectProps> = ({
  value,
  onChange,
  placeholder = '프로젝트명으로 검색...',
  style,
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 디바운싱 처리
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      console.log('[ProjectSearchSelect] Debounced keyword updated:', searchKeyword);
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  // 프로젝트 검색 쿼리
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'projects', 'search', debouncedKeyword],
    queryFn: async () => {
      console.log('[ProjectSearchSelect] API call with keyword:', debouncedKeyword);
      const result = await projectApi.getAdminProjects({ search: debouncedKeyword, size: 20 });
      console.log('[ProjectSearchSelect] API result:', result);
      return result;
    },
    enabled: debouncedKeyword.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // 에러 로깅
  useEffect(() => {
    if (error) {
      console.error('[ProjectSearchSelect] API error:', error);
    }
  }, [error]);

  // 검색어가 없을 때도 최근 프로젝트 목록 표시 (선택적)
  const { data: recentProjects = [] } = useQuery({
    queryKey: ['admin', 'projects', 'recent'],
    queryFn: () => projectApi.getAdminProjects({ size: 10 }),
    enabled: searchKeyword.length === 0 && !value,
    staleTime: 5 * 60 * 1000,
  });

  // 선택된 프로젝트 정보 조회
  const { data: selectedProject } = useQuery({
    queryKey: ['admin', 'projects', value],
    queryFn: () => (value ? projectApi.getAdminProject(value) : null),
    enabled: !!value,
    staleTime: 5 * 60 * 1000,
  });

  // Select 옵션 생성
  const options: ProjectOption[] = useMemo(() => {
    if (searchKeyword.length === 0 && selectedProject) {
      // 검색어가 없고 선택된 프로젝트가 있으면 그것만 표시
      return [{ value: selectedProject.id, label: selectedProject.title }];
    }
    if (searchKeyword.length === 0 && recentProjects.length > 0) {
      // 검색어가 없고 최근 프로젝트가 있으면 최근 프로젝트 표시
      return recentProjects.map((project) => ({
        value: project.id,
        label: project.title,
      }));
    }
    return projects.map((project) => ({
      value: project.id,
      label: project.title,
    }));
  }, [projects, selectedProject, searchKeyword, recentProjects]);

  const handleSearch = (searchText: string) => {
    console.log('[ProjectSearchSelect] onSearch called:', searchText);
    setSearchKeyword(searchText);
  };

  const handleChange = (selectedValue: number | null) => {
    onChange?.(selectedValue);
    if (selectedValue !== null) {
      setSearchKeyword(''); // 선택 후 검색어 초기화
    }
  };

  const handleSelect = (selectedValue: number) => {
    // onSelect는 드롭다운에서 선택할 때 호출
    handleChange(selectedValue);
  };

  const handleClear = () => {
    onChange?.(null);
    setSearchKeyword('');
  };

  return (
    <Select
      value={value || undefined}
      options={options}
      onSearch={handleSearch}
      onChange={(val) => handleChange(val ? Number(val) : null)}
      onSelect={(val) => handleSelect(Number(val))}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      loading={isLoading}
      allowClear
      onClear={handleClear}
      showSearch
      filterOption={false} // 서버 사이드 필터링 사용
      notFoundContent={isLoading ? '로딩 중...' : '프로젝트를 찾을 수 없습니다'}
    />
  );
};
