import { useState, useEffect } from 'react';
import {
  useAdminProfileIntroductionQuery,
  useSaveProfileIntroductionMutation,
} from '@/admin/entities/profile-introduction';

/**
 * 프로필 자기소개 폼 훅
 */
export function useProfileIntroductionForm() {
  const [content, setContent] = useState('');

  // 현재 자기소개 조회
  const { data: introduction, isLoading } = useAdminProfileIntroductionQuery();

  // 자기소개 저장
  const { mutate: save, isPending: isSaving } = useSaveProfileIntroductionMutation();

  // 초기 데이터 로드
  useEffect(() => {
    if (introduction) {
      setContent(introduction.content);
    }
  }, [introduction]);

  // 저장 핸들러
  const handleSave = () => {
    if (!content.trim()) {
      return;
    }
    save({ content });
  };

  return {
    content,
    setContent,
    handleSave,
    isSaving,
    isLoading,
    introduction,
  };
}
