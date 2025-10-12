import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface LoginFormData {
  username: string;
  password: string;
}

const AdminLoginForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0, color: '#8b5cf6' }}>
              Admin Dashboard
            </Title>
            <Text type="secondary">
              포트폴리오 관리자 로그인
            </Text>
          </div>

          <Form
            form={form}
            name="admin-login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="사용자명"
              rules={[
                { required: true, message: '사용자명을 입력해주세요' },
                { min: 3, message: '사용자명은 최소 3자 이상이어야 합니다' },
                { max: 50, message: '사용자명은 최대 50자까지 가능합니다' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="사용자명을 입력하세요"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="비밀번호"
              rules={[
                { required: true, message: '비밀번호를 입력해주세요' },
                { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' },
                { max: 100, message: '비밀번호는 최대 100자까지 가능합니다' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="비밀번호를 입력하세요"
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
                  fontSize: '16px',
                  fontWeight: '500',
                }}
              >
                로그인
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              기본 계정: admin / admin123
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AdminLoginForm;

