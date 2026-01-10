import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Select, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminArticleApi } from '@/admin/entities/article/api/adminArticleApi';

interface SeriesSearchSelectProps {
  value?: string;
  seriesTitle?: string; // Article 조회 시 함께 전달되는 시리즈명
  onChange?: (value: string | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

interface SeriesOption {
  value: string;
  label: string;
}

/**
 * 시리즈명으로 디바운싱 검색하는 Select 컴포넌트
 */
export const SeriesSearchSelect: React.FC<SeriesSearchSelectProps> = ({
  value,
  seriesTitle,
  onChange,
  placeholder = '시리즈명으로 검색...',
  style,
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [selectedSeriesInfo, setSelectedSeriesInfo] = useState<{ seriesId: string; title: string } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 디바운싱 처리
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  // 시리즈 검색 쿼리 (검색어가 있을 때만 실행)
  const { data: seriesList = [], isLoading: isSearchLoading, error: searchError } = useQuery({
    queryKey: ['admin', 'articles', 'series', 'search', debouncedKeyword],
    queryFn: async () => {
      return await adminArticleApi.searchSeries(debouncedKeyword);
    },
    enabled: debouncedKeyword.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // 시리즈 ID로 단일 시리즈 조회 (value가 있고 seriesTitle이 없을 때만 실행)
  // seriesTitle은 Article 조회 시 함께 전달되므로 별도 조회 불필요
  const { data: seriesById, isLoading: isByIdLoading, error: byIdError } = useQuery({
    queryKey: ['admin', 'articles', 'series', value],
    queryFn: async () => {
      if (!value) return null;
      return await adminArticleApi.getSeriesById(value);
    },
    enabled: false, // Article 조회 시 seriesTitle이 함께 전달되므로 비활성화
    staleTime: 5 * 60 * 1000,
  });

  // 에러 로깅
  useEffect(() => {
    if (searchError) {
      console.error('[SeriesSearchSelect] Search API error:', searchError);
    }
    if (byIdError) {
      console.error('[SeriesSearchSelect] Get by ID API error:', byIdError);
    }
  }, [searchError, byIdError]);

  // 선택된 시리즈 정보 조회 (seriesTitle prop 우선, 검색 결과, 저장된 정보 순)
  const selectedSeries = useMemo(() => {
    if (!value) {
      return null;
    }
    // 1. seriesTitle prop이 있으면 우선 사용 (Article 조회 시 함께 전달됨)
    if (seriesTitle) {
      return { seriesId: value, title: seriesTitle };
    }
    // 2. ID로 조회한 결과 사용
    if (seriesById) {
      return seriesById;
    }
    // 3. 검색 결과에서 찾기
    const found = seriesList.find((s) => s.seriesId === value);
    if (found) {
      return found;
    }
    // 4. 저장된 정보가 있으면 사용
    if (selectedSeriesInfo && selectedSeriesInfo.seriesId === value) {
      return selectedSeriesInfo;
    }
    // 5. 없으면 value를 title로 사용 (임시)
    return { seriesId: value, title: value };
  }, [value, seriesTitle, seriesById, seriesList, selectedSeriesInfo]);
  
  // value나 seriesTitle, seriesById, seriesList가 변경될 때 selectedSeriesInfo 업데이트
  useEffect(() => {
    if (!value) {
      setSelectedSeriesInfo(null);
      return;
    }
    
    // seriesTitle prop이 있으면 우선 저장
    if (seriesTitle) {
      if (!selectedSeriesInfo || selectedSeriesInfo.seriesId !== value) {
        setSelectedSeriesInfo({ seriesId: value, title: seriesTitle });
      }
      return;
    }
    
    // ID로 조회한 결과 저장
    if (seriesById) {
      if (!selectedSeriesInfo || selectedSeriesInfo.seriesId !== value) {
        setSelectedSeriesInfo(seriesById);
      }
      return;
    }
    
    // 검색 결과에서 찾기
    const found = seriesList.find((s) => s.seriesId === value);
    if (found) {
      // 검색 결과에서 찾았으면 저장 (중복 저장 방지)
      if (!selectedSeriesInfo || selectedSeriesInfo.seriesId !== value) {
        setSelectedSeriesInfo(found);
      }
    } else if (selectedSeriesInfo && selectedSeriesInfo.seriesId !== value) {
      // value가 변경되었는데 검색 결과에도 없으면 초기화
      setSelectedSeriesInfo(null);
    }
  }, [value, seriesTitle, seriesById, seriesList]); // selectedSeriesInfo는 의존성에서 제외 (무한루프 방지)

  // 시리즈 생성 뮤테이션
  const queryClient = useQueryClient();
  const createSeriesMutation = useMutation({
    mutationFn: (title: string) => adminArticleApi.createSeries(title),
    onSuccess: (data) => {
      message.success(`시리즈 "${data.title}"가 생성되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles', 'series'] });
      onChange?.(data.seriesId);
      setSearchKeyword('');
    },
    onError: () => {
      message.error('시리즈 생성에 실패했습니다.');
    },
  });

  // Select 옵션 생성
  const options: SeriesOption[] = useMemo(() => {
    const result: SeriesOption[] = [];
    
    // 검색 결과 추가
    seriesList.forEach((series) => {
      result.push({
        value: series.seriesId,
        label: series.title,
      });
    });
    
    // 검색어가 있고 결과가 없거나, 검색어가 입력되었을 때 "새 시리즈 생성" 옵션 추가
    if (searchKeyword.trim().length > 0 && !seriesList.some(s => s.title.toLowerCase() === searchKeyword.toLowerCase())) {
      result.push({
        value: '__CREATE_NEW__',
        label: `새 시리즈 생성: "${searchKeyword}"`,
      });
    }
    
    // 선택된 시리즈가 있으면 항상 options에 포함 (중복 방지)
    // 이렇게 하면 선택 후에도 시리즈명이 표시됨
    if (selectedSeries && !result.some(opt => opt.value === selectedSeries.seriesId)) {
      result.unshift({ 
        value: selectedSeries.seriesId, 
        label: selectedSeries.title 
      });
    }
    
    return result;
  }, [seriesList, selectedSeries, searchKeyword]);

  const handleSearch = (searchText: string) => {
    setSearchKeyword(searchText);
  };

  const handleChange = (selectedValue: string | null) => {
    if (selectedValue === null || selectedValue === undefined) {
      onChange?.(null);
      setSearchKeyword('');
      return;
    }
    
    if (selectedValue === '__CREATE_NEW__') {
      // 새 시리즈 생성
      createSeriesMutation.mutate(searchKeyword.trim());
    } else {
      // 선택된 시리즈 정보 저장
      const selected = seriesList.find((s) => s.seriesId === selectedValue);
      if (selected) {
        setSelectedSeriesInfo(selected);
      }
      onChange?.(selectedValue);
      setSearchKeyword(''); // 선택 후 검색어 초기화
    }
  };

  const handleClear = () => {
    onChange?.(null);
    setSearchKeyword('');
  };

  // 표시할 값 결정
  const displayValue = useMemo(() => {
    if (!value) return undefined;
    // value가 있으면 그대로 사용 (Form.Item에서 관리)
    return value;
  }, [value]);

  return (
    <Select
      value={displayValue}
      options={options}
      onSearch={handleSearch}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      loading={isSearchLoading || isByIdLoading || createSeriesMutation.isPending}
      allowClear
      onClear={handleClear}
      showSearch
      filterOption={false} // 서버 사이드 필터링 사용
      notFoundContent={
        isSearchLoading || isByIdLoading
          ? '로딩 중...' 
          : debouncedKeyword.length > 0 && seriesList.length === 0
          ? '시리즈를 찾을 수 없습니다'
          : null
      }
    />
  );
};
