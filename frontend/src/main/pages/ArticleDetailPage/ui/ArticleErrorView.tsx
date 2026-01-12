import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@design-system';
import { TextLink } from '@design-system/components/TextLink';
import { EmptyCard } from '@design-system';
import styles from './ArticleErrorView.module.css';

interface ArticleErrorViewProps {
  error: Error | null;
}

/**
 * 아티클 에러 뷰 컴포넌트
 * 에러 타입에 따라 적절한 메시지와 재시도 버튼을 표시합니다.
 */
export function ArticleErrorView({ error }: ArticleErrorViewProps) {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // 아티클 쿼리 무효화하여 재시도
    queryClient.invalidateQueries({ queryKey: ['articles'] });
  };

  // 에러 타입별 메시지 결정
  const getErrorMessage = () => {
    if (!error) {
      return '아티클을 불러오는 중 문제가 발생했습니다.';
    }

    const errorMessage = error.message || '';
    
    if (errorMessage.includes('404') || errorMessage.includes('찾을 수 없')) {
      return '아티클을 찾을 수 없습니다.';
    }
    
    if (errorMessage.includes('Network') || errorMessage.includes('네트워크')) {
      return '네트워크 연결을 확인해주세요.';
    }
    
    return '아티클을 불러오는 중 문제가 발생했습니다.';
  };

  const isNotFound = error?.message?.includes('404') || error?.message?.includes('찾을 수 없');

  return (
    <div className={styles.errorContainer}>
      <EmptyCard message={getErrorMessage()} />
      
      <div className={styles.actions}>
        {isNotFound ? (
          <TextLink href="/articles" className={styles.backLink}>
            아티클 목록으로 돌아가기
          </TextLink>
        ) : (
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleRetry}
            className={styles.retryButton}
          >
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}
