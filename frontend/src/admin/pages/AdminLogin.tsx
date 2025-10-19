import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

/**
 * 관리자 로그인 컴포넌트
 */
const AdminLogin: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const success = await login(values.username, values.password);
            if (success) {
                message.success('로그인 성공!');
                // 로그인 성공 시 대시보드로 리다이렉트
                window.location.href = '/admin/dashboard';
            } else {
                message.error('로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.');
            }
        } catch (error) {
            message.error('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToMain = () => {
        window.location.href = '/';
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            <Card
                style={{
                    width: 400,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Title level={2} style={{ marginBottom: '8px', color: '#8b5cf6' }}>
                        AI Portfolio
                    </Title>
                    <Text type="secondary">관리자 로그인</Text>
                </div>

                <Form
                    name="admin-login"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: '사용자명을 입력해주세요!' },
                            { min: 3, message: '사용자명은 최소 3자 이상이어야 합니다!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="사용자명"
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: '비밀번호를 입력해주세요!' },
                            { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="비밀번호"
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '8px',
                                background: '#8b5cf6',
                                borderColor: '#8b5cf6',
                            }}
                        >
                            로그인
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackToMain}
                        style={{ color: '#666' }}
                    >
                        메인페이지로 돌아가기
                    </Button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        기본 계정: admin / admin123
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default AdminLogin;
