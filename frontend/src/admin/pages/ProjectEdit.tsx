import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Switch,
  InputNumber,
  Typography,
  Space,
  message,
  Spin,
  Divider,
  Row,
  Col,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useProject, useUpdateProject, useCreateProject } from '../hooks/useProjects';
import { ProjectUpdateRequest, ProjectCreateRequest } from '../api/adminProjectApi';
import { ProjectThumbnailUpload } from '../features/project-management/ui/ProjectThumbnailUpload';
import { ProjectScreenshotsUpload } from '../features/project-management/ui/ProjectScreenshotsUpload';
import { ProjectMarkdownEditor } from '../features/project-management/ui/ProjectMarkdownEditor';
import { TechStackSelector } from '../features/project-management/ui/TechStackSelector';
import { ProjectLinksForm } from '../features/project-management/ui/ProjectLinksForm';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * 프로젝트 편집 컴포넌트
 */
const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const isNew = id === 'new';
  const { data: project, isLoading, isError } = useProject(id!, { enabled: !isNew && !!id });
  const updateProjectMutation = useUpdateProject();
  const createProjectMutation = useCreateProject();

  const [isTeam, setIsTeam] = useState(false);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        title: project.title,
        description: project.description,
        type: project.type,
        status: project.status,
        isTeam: project.isTeam,
        teamSize: project.teamSize,
        role: project.role,
        startDate: project.startDate ? dayjs(project.startDate) : undefined,
        endDate: project.endDate ? dayjs(project.endDate) : undefined,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        externalUrl: project.externalUrl,
        sortOrder: project.sortOrder,
      });
      setIsTeam(project.isTeam || false);
      setScreenshots(project.screenshots || []);
      setTechnologies(project.technologies?.map(t => t.name) || []);
    }
  }, [project, form]);

  const handleIsTeamChange = (checked: boolean) => {
    setIsTeam(checked);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (isNew) {
        // 새 프로젝트 생성
        const createData: ProjectCreateRequest = {
          title: values.title,
          description: values.description,
          readme: values.readme,
          type: values.type,
          status: values.status,
          isTeam: values.isTeam,
          teamSize: values.teamSize,
          role: values.role,
          myContributions: values.myContributions,
          startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
          endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
          imageUrl: values.imageUrl,
          screenshots: screenshots.map(s => s.imageUrl),
          githubUrl: values.githubUrl,
          liveUrl: values.liveUrl,
          externalUrl: values.externalUrl,
          technologies: technologies,
          sortOrder: values.sortOrder,
        };

        await createProjectMutation.mutateAsync(createData);
        message.success('프로젝트가 성공적으로 생성되었습니다');
      } else {
        // 프로젝트 수정
        const updateData: ProjectUpdateRequest = {
          title: values.title,
          description: values.description,
          readme: values.readme,
          type: values.type,
          status: values.status,
          isTeam: values.isTeam,
          teamSize: values.teamSize,
          role: values.role,
          myContributions: values.myContributions,
          startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
          endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
          imageUrl: values.imageUrl,
          screenshots: screenshots.map(s => s.imageUrl),
          githubUrl: values.githubUrl,
          liveUrl: values.liveUrl,
          externalUrl: values.externalUrl,
          technologies: technologies,
          sortOrder: values.sortOrder,
        };

        await updateProjectMutation.mutateAsync({ id: id!, project: updateData });
        message.success('프로젝트가 성공적으로 수정되었습니다');
      }
      navigate('/admin/projects');
    } catch (error: any) {
      message.error(error.message || '프로젝트 저장 중 오류가 발생했습니다');
    }
  };

  const handleThumbnailChange = (url: string) => {
    form.setFieldValue('imageUrl', url);
  };

  const handleScreenshotsChange = (newScreenshots: any[]) => {
    setScreenshots(newScreenshots);
  };

  const handleTechnologiesChange = (newTechs: string[]) => {
    setTechnologies(newTechs);
  };

  if (!isNew && isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isNew && isError) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={3}>프로젝트를 불러올 수 없습니다</Title>
          <Button onClick={() => navigate('/admin/projects')}>목록으로 돌아가기</Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/projects')}
          />
          <Title level={2} style={{ margin: 0 }}>
            {isNew ? '새 프로젝트 생성' : '프로젝트 편집'}
          </Title>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          sortOrder: 0,
          isTeam: false,
          status: undefined, // 기본값 없음
          type: undefined, // 기본값 없음
        }}
      >
        <Card title="기본 정보" style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="title"
                label="프로젝트 제목"
                rules={[{ required: true, message: '프로젝트 제목을 입력해주세요' }]}
              >
                <Input placeholder="프로젝트 제목" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="type"
                label="프로젝트 타입"
                rules={[{ required: true, message: '프로젝트 타입을 선택해주세요' }]}
              >
                <Select placeholder="프로젝트 타입" allowClear>
                  <Option value="BUILD">빌드 프로젝트</Option>
                  <Option value="LAB">실험 프로젝트</Option>
                  <Option value="MAINTENANCE">유지보수 프로젝트</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="status"
                label="프로젝트 상태"
                rules={[{ required: true, message: '프로젝트 상태를 선택해주세요' }]}
              >
                <Select placeholder="완료/진행 중/유지보수" allowClear>
                  <Option value="completed">완료</Option>
                  <Option value="in_progress">진행 중</Option>
                  <Option value="maintenance">유지보수</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="isTeam"
                label="팀 프로젝트"
                valuePropName="checked"
              >
                <Switch onChange={handleIsTeamChange} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="프로젝트 설명"
            rules={[{ required: true, message: '프로젝트 설명을 입력해주세요' }]}
          >
            <TextArea rows={4} placeholder="프로젝트 설명" />
          </Form.Item>

          {isTeam && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="teamSize"
                    label="팀 크기"
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="팀 크기" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="role"
                    label="내 역할"
                  >
                    <Input placeholder="내 역할" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="myContributions"
                label="내 기여사항"
              >
                <TextArea rows={3} placeholder="내 기여사항 (각 항목은 줄바꿈으로 구분)" />
              </Form.Item>
            </>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="시작일"
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="종료일"
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="기술 스택" style={{ marginBottom: '24px' }}>
          <TechStackSelector
            value={technologies}
            onChange={handleTechnologiesChange}
          />
        </Card>

        <Card title="썸네일 이미지" style={{ marginBottom: '24px' }}>
          <ProjectThumbnailUpload
            value={project?.imageUrl}
            onChange={handleThumbnailChange}
          />
        </Card>

        <Card title="스크린샷" style={{ marginBottom: '24px' }}>
          <ProjectScreenshotsUpload
            value={screenshots}
            onChange={handleScreenshotsChange}
          />
        </Card>

        <Card title="프로젝트 링크" style={{ marginBottom: '24px' }}>
          <ProjectLinksForm form={form} />
        </Card>

        <Card title="README" style={{ marginBottom: '24px' }}>
          <ProjectMarkdownEditor
            value={project?.readme}
            onChange={(value) => form.setFieldValue('readme', value)}
          />
        </Card>

        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <Space>
            <Button onClick={() => navigate('/admin/projects')}>
              취소
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={updateProjectMutation.isPending || createProjectMutation.isPending}
            >
              {isNew ? '생성' : '저장'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export { ProjectEdit };