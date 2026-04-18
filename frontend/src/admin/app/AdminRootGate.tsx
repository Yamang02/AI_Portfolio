import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@design-system/components';
import { useAuth } from '../features/auth';
import styles from '../features/auth/ui/ProtectedRoute.module.css';

/**
 * Admin 전용 호스트 루트(/). 인증 여부에 따라 로그인 또는 대시보드로 보냄.
 */
const AdminRootGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" ariaLabel="로딩 중" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
};

export { AdminRootGate };
