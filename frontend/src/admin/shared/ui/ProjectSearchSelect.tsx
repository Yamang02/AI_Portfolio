import React, { useState, useMemo, useEffect } from 'react';
import { Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/main/entities/project/api/projectApi';
import { useDebounce } from '@/shared/hooks';

interface ProjectSearchSelectProps {
  value?: string; // 비즈니스 ID (string)
  onChange?: (value: string | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

interface ProjectOption {
  value: string; // 비즈니스 ID
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
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  // 프로젝트 검색 쿼리
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'projects', 'search', debouncedKeyword],
    queryFn: async () => {
      return await projectApi.getAdminProjects({ search: debouncedKeyword, size: 20 });
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

  // value가 유효한 비즈니스 ID인지 확인
  const isValidValue = value !== null && value !== undefined && typeof value === 'string' && value.length > 0;

  // 검색어가 없을 때도 최근 프로젝트 목록 표시 (선택적)
  const { data: recentProjects = [] } = useQuery({
    queryKey: ['admin', 'projects', 'recent'],
    queryFn: () => projectApi.getAdminProjects({ size: 10 }),
    enabled: searchKeyword.length === 0 && !isValidValue,
    staleTime: 5 * 60 * 1000,
  });

  // 선택된 프로젝트 정보 조회 (비즈니스 ID로 조회)
  const { data: selectedProject } = useQuery({
    queryKey: ['admin', 'projects', value],
    queryFn: () => {
      if (!isValidValue || !value) return null;
      // value는 비즈니스 ID (string)이므로 그대로 사용
      return projectApi.getAdminProject(value);
    },
    enabled: isValidValue && !!value,
    staleTime: 5 * 60 * 1000,
  });

  // Select 옵션 생성 (비즈니스 ID 사용)
  const options: ProjectOption[] = useMemo(() => {
    if (searchKeyword.length === 0 && selectedProject) {
      // 검색어가 없고 선택된 프로젝트가 있으면 그것만 표시
      return [{ value: selectedProject.id, label: selectedProject.title }];
    }
    if (searchKeyword.length === 0 && recentProjects.length > 0) {
      // 검색어가 없고 최근 프로젝트가 있으면 최근 프로젝트 표시
      return recentProjects.map((project) => ({
        value: project.id, // 비즈니스 ID 사용
        label: project.title,
      }));
    }
    return projects.map((project) => ({
      value: project.id, // 비즈니스 ID 사용
      label: project.title,
    }));
  }, [projects, selectedProject, searchKeyword, recentProjects]);

  const handleSearch = (searchText: string) => {
    setSearchKeyword(searchText);
  };

  const handleChange = (selectedValue: string | null) => {
    // 유효성 검사: 비즈니스 ID는 문자열이어야 함
    if (selectedValue !== null && (typeof selectedValue !== 'string' || selectedValue.length === 0)) {
      onChange?.(null);
      return;
    }
    onChange?.(selectedValue);
    if (selectedValue !== null) {
      setSearchKeyword(''); // 선택 후 검색어 초기화
    }
  };

  const handleSelect = (selectedValue: string) => {
    // onSelect는 드롭다운에서 선택할 때 호출
    if (typeof selectedValue !== 'string' || selectedValue.length === 0) {
      handleChange(null);
      return;
    }
    handleChange(selectedValue);
  };

  const handleClear = () => {
    onChange?.(null);
    setSearchKeyword('');
  };

  // value가 유효한 비즈니스 ID인지 확인
  const safeValue = (value !== null && value !== undefined && typeof value === 'string' && value.length > 0)
    ? value
    : undefined;

  return (
    <Select
      value={safeValue}
      options={options}
      onSearch={handleSearch}
      onChange={(val) => {
        if (val === null || val === undefined) {
          handleChange(null);
        } else {
          // val은 비즈니스 ID (string)이어야 함
          const stringVal = String(val);
          if (stringVal.length === 0) {
            handleChange(null);
          } else {
            handleChange(stringVal);
          }
        }
      }}
      onSelect={(val) => {
        // val은 비즈니스 ID (string)이어야 함
        const stringVal = String(val);
        if (stringVal.length === 0) {
          handleChange(null);
        } else {
          handleSelect(stringVal);
        }
      }}
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
