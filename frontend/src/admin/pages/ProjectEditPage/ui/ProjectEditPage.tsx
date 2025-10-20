import React from 'react';
import { Card, Typography, Form, Input, Select, Button, Space, Upload, Switch } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAdminProjectQuery } from '../../entities/project';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * 프로젝트 편집 페이지
 */
const ProjectEditPage: React.FC = () => {
    const [form] = Form.useForm();
    
    // URL에서 프로젝트 ID 추출 (실제로는 useParams 사용)
    const projectId = '1'; // 임시 값
    const { data: project, isLoading } = useAdminProjectQuery(Number(projectId));

    const handleSave = (values: any) => {
        console.log('프로젝트 저장:', values);
        // 실제 저장 로직 구현
    };

    const handleCancel = () => {
        window.history.back();
    };

    if (isLoading) {
        return (
            <div>
                <Title level={2} style={{ marginBottom: '24px' }}>
                    프로젝트 편집
                </Title>
                <Card>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>
                    프로젝트 편집
                </Title>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
                        취소
                    </Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
                        저장
                    </Button>
                </Space>
            </div>
            
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={project}
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="title"
                        label="프로젝트 제목"
                        rules={[{ required: true, message: '프로젝트 제목을 입력해주세요' }]}
                    >
                        <Input placeholder="프로젝트 제목을 입력하세요" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="프로젝트 설명"
                        rules={[{ required: true, message: '프로젝트 설명을 입력해주세요' }]}
                    >
                        <TextArea rows={4} placeholder="프로젝트 설명을 입력하세요" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="프로젝트 타입"
                        rules={[{ required: true, message: '프로젝트 타입을 선택해주세요' }]}
                    >
                        <Select placeholder="프로젝트 타입을 선택하세요">
                            <Option value="BUILD">개발 프로젝트</Option>
                            <Option value="LAB">실험 프로젝트</Option>
                            <Option value="MAINTENANCE">유지보수</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="프로젝트 상태"
                        rules={[{ required: true, message: '프로젝트 상태를 선택해주세요' }]}
                    >
                        <Select placeholder="프로젝트 상태를 선택하세요">
                            <Option value="completed">완료</Option>
                            <Option value="in_progress">진행중</Option>
                            <Option value="maintenance">유지보수</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="isTeam"
                        label="팀 프로젝트"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="githubUrl"
                        label="GitHub URL"
                    >
                        <Input placeholder="https://github.com/username/repository" />
                    </Form.Item>

                    <Form.Item
                        name="liveUrl"
                        label="라이브 URL"
                    >
                        <Input placeholder="https://example.com" />
                    </Form.Item>

                    <Form.Item
                        name="readme"
                        label="README 내용"
                    >
                        <TextArea rows={10} placeholder="마크다운 형식으로 README 내용을 입력하세요" />
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProjectEditPage;
