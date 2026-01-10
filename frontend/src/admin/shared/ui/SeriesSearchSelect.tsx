import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Select, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminArticleApi } from '@/admin/entities/article/api/adminArticleApi';

interface SeriesSearchSelectProps {
  value?: string;
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
  onChange,
  placeholder = '시리즈명으로 검색...',
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
      console.log('[SeriesSearchSelect] Debounced keyword updated:', searchKeyword);
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  // 시리즈 검색 쿼리
  const { data: seriesList = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'articles', 'series', 'search', debouncedKeyword],
    queryFn: async () => {
      console.log('[SeriesSearchSelect] API call with keyword:', debouncedKeyword);
      const result = await adminArticleApi.searchSeries(debouncedKeyword);
      console.log('[SeriesSearchSelect] API result:', result);
      return result;
    },
    enabled: debouncedKeyword.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // 에러 로깅
  useEffect(() => {
    if (error) {
      console.error('[SeriesSearchSelect] API error:', error);
    }
  }, [error]);

  // 선택된 시리즈 정보 조회 (검색 결과에서 찾기)
  const selectedSeries = useMemo(() => {
    if (!value) return null;
    // 검색 결과에서 찾거나, 검색어가 없을 때는 value를 그대로 표시
    return seriesList.find((s) => s.seriesId === value) || { seriesId: value, title: value };
  }, [value, seriesList]);

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
    
    // 검색어가 없고 선택된 시리즈가 있으면 그것만 표시
    if (searchKeyword.length === 0 && selectedSeries) {
      return [{ value: selectedSeries.seriesId, label: selectedSeries.title }];
    }
    
    return result;
  }, [seriesList, selectedSeries, searchKeyword]);

  const handleSearch = (searchText: string) => {
    // 디버깅: 검색어 변경 확인
    console.log('[SeriesSearchSelect] onSearch called:', searchText);
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
      onChange?.(selectedValue);
      setSearchKeyword(''); // 선택 후 검색어 초기화
    }
  };

  const handleSelect = (selectedValue: string) => {
    // onSelect는 드롭다운에서 선택할 때 호출
    handleChange(selectedValue);
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
      onSelect={handleSelect}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      loading={isLoading || createSeriesMutation.isPending}
      allowClear
      onClear={handleClear}
      showSearch
      filterOption={false} // 서버 사이드 필터링 사용
      notFoundContent={
        isLoading 
          ? '로딩 중...' 
          : debouncedKeyword.length > 0 && seriesList.length === 0
          ? '시리즈를 찾을 수 없습니다'
          : null
      }
    />
  );
};
