import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';

/**
 * 보호된 라우트 컴포넌트
 * 인증이 필요한 페이지에 접근할 때 인증 상태를 확인합니다.
 */
const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, loading, checkSession } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                await checkSession();
            } catch (error) {
                console.error('Session verification failed:', error);
            } finally {
                setIsChecking(false);
            }
        };

        verifySession();
    }, [checkSession]);

    // 세션 확인 중
    if (isChecking || loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // 인증된 경우 자식 라우트 렌더링
    return <Outlet />;
};

export default ProtectedRoute;
