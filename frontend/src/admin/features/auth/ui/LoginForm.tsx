import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, PasswordInput, Text, SectionTitle, Spinner } from '@design-system/components';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styles from './LoginForm.module.css';

interface LoginFormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인된 사용자인 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 로딩 중이거나 인증 상태 확인 중일 때 로딩 스피너 표시
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" ariaLabel="로딩 중" />
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = '사용자명을 입력해주세요';
    } else if (formData.username.length < 3) {
      newErrors.username = '사용자명은 최소 3자 이상이어야 합니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // 필드 변경 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrors({
          general: result.message || '로그인 실패',
        });
      }
    } catch (error: any) {
      setErrors({
        general: error.message || '로그인 중 오류가 발생했습니다',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card variant="elevated" padding="lg" className={styles.card}>
        <div className={styles.header}>
          <SectionTitle level="h2" className={styles.title}>
            관리자 로그인
          </SectionTitle>
          <Text size="sm" variant="secondary" className={styles.subtitle}>
            포트폴리오 관리 시스템
          </Text>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorMessage}>
              <Text size="sm" className={styles.errorText}>
                {errors.general}
              </Text>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              <Text size="sm" weight="medium" variant="secondary">
                사용자명
              </Text>
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange('username')}
              placeholder="사용자명을 입력하세요"
              prefix={<UserOutlined />}
              error={!!errors.username}
              size="lg"
              disabled={loading}
              autoComplete="username"
            />
            {errors.username && (
              <Text size="xs" className={styles.fieldError}>
                {errors.username}
              </Text>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              <Text size="sm" weight="medium" variant="secondary">
                비밀번호
              </Text>
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="비밀번호를 입력하세요"
              prefix={<LockOutlined />}
              error={!!errors.password}
              size="lg"
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.password && (
              <Text size="xs" className={styles.fieldError}>
                {errors.password}
              </Text>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </div>
        </form>

        <div className={styles.footer}>
          <Text size="xs" variant="tertiary">
            © 2026, Lee Jeongjun(Yamang02)
          </Text>
        </div>
      </Card>
    </div>
  );
};

export { LoginForm };
