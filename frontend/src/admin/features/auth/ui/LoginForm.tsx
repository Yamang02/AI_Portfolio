import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, App, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  // 이미 로그인된 사용자인 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 로딩 중이거나 인증 상태 확인 중일 때 로딩 스피너 표시
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);

    try {
      const result = await login(values.username, values.password);

      if (result.success) {
        message.success('로그인 성공');
        navigate('/admin/dashboard');
      } else {
        message.error(result.message || '로그인 실패');
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      message.error(error.message || '로그인 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}
        styles={{ body: { padding: '40px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
              관리자 로그인
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              포트폴리오 관리 시스템
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="사용자명"
              rules={[
                { required: true, message: '사용자명을 입력해주세요' },
                { min: 3, message: '사용자명은 최소 3자 이상이어야 합니다' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                placeholder="사용자명을 입력하세요"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="비밀번호"
              rules={[
                { required: true, message: '비밀번호를 입력해주세요' },
                { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                placeholder="비밀번호를 입력하세요"
                style={{ borderRadius: '8px' }}
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: '#1f2937',
                  border: 'none',
                  boxShadow: 'none'
                }}
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              © 2024 AI Portfolio. All rights reserved.
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export { LoginForm };
