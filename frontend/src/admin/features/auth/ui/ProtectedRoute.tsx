import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@design-system/components';
import { useAuth } from '../../../hooks/useAuth';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때는 스피너 표시
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" ariaLabel="로딩 중" />
      </div>
    );
  }

  // 인증되지 않은 경우에만 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export { ProtectedRoute };
