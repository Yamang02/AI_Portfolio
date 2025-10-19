import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// 타입 정의
interface AdminUser {
    username: string;
    role: string;
    lastLogin?: string;
}

interface LoginData {
    success: boolean;
    user?: AdminUser;
    message?: string;
}

interface AuthContextType {
    user: AdminUser | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    // 앱 시작 시 세션 확인
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async (): Promise<void> => {
        try {
            const response = await fetch('/api/admin/auth/session', {
                method: 'GET',
                credentials: 'include', // 쿠키 포함
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                }
            }
        } catch (error) {
            console.error('세션 확인 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 쿠키 포함
                body: JSON.stringify({ username, password }),
            });

            const data: LoginData = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
                return true;
            } else {
                console.error('로그인 실패:', data.message);
                return false;
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await fetch('/api/admin/auth/logout', {
                method: 'POST',
                credentials: 'include', // 쿠키 포함
            });
        } catch (error) {
            console.error('로그아웃 오류:', error);
        } finally {
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        checkSession,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
