import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  InputNumber,
  Typography,
  Space,
  message,
  Spin,
  Row,
  Col,
  Modal,
  Upload,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { useProject, useUpdateProject, useCreateProject, useDeleteProject } from '../hooks/useProjects';
import { ProjectUpdateRequest, ProjectCreateRequest } from '../api/adminProjectApi';
import { ProjectThumbnailUpload } from '../features/project-management/ui/ProjectThumbnailUpload';
import { ProjectScreenshotsUpload } from '../features/project-management/ui/ProjectScreenshotsUpload';
import { ProjectMarkdownEditor } from '../features/project-management/ui/ProjectMarkdownEditor';
import { TechStackSelector } from '../features/project-management/ui/TechStackSelector';
import { ProjectLinksForm } from '../features/project-management/ui/ProjectLinksForm';
import { DateRangeWithOngoing } from '../../shared/ui/date-range';
import dayjs from 'dayjs';
import { useUploadImage, useUploadImages, useDeleteImage } from '../hooks/useUpload';

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
  const deleteProjectMutation = useDeleteProject();

  const [isTeam, setIsTeam] = useState(false);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [thumbPreviewVisible, setThumbPreviewVisible] = useState(false);
  const [isUploadingScreenshots, setIsUploadingScreenshots] = useState(false);
  const [lastScreenshotsSelectionKey, setLastScreenshotsSelectionKey] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [tempThumbnailUrl, setTempThumbnailUrl] = useState<string | undefined>(undefined);
  const [tempScreenshotUrls, setTempScreenshotUrls] = useState<string[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const uploadImageMutation = useUploadImage();
  const uploadImagesMutation = useUploadImages();
  const deleteImageMutation = useDeleteImage();

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
        imageUrl: project.imageUrl,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        externalUrl: project.externalUrl,
        sortOrder: project.sortOrder,
        readme: project.readme,
      });
      setIsTeam(project.isTeam || false);
      // screenshots는 백엔드에서 객체 배열로 올 수 있으므로 변환 처리
      const projectScreenshots = project.screenshots || [];
      const screenshotsData = projectScreenshots.map((s: any) => 
        typeof s === 'string' 
          ? { imageUrl: s, displayOrder: 0 } 
          : { imageUrl: s?.imageUrl || s, displayOrder: s?.displayOrder || 0, cloudinaryPublicId: s?.cloudinaryPublicId }
      );
      setScreenshots(screenshotsData);
      setTechnologies(project.technologies?.map(t => t.name) || []);
    }
  }, [project, form]);

  const handleIsTeamChange = (checked: boolean) => {
    setIsTeam(checked);
  };

  const handleSubmit = async (values: any) => {
    try {
      // screenshots를 문자열 배열로 변환 (객체 배열인 경우 imageUrl 추출, 이미 문자열 배열인 경우 그대로 사용)
      const screenshotsArray = screenshots && screenshots.length > 0
        ? screenshots.map((s: any) => typeof s === 'string' ? s : s?.imageUrl || s).filter(Boolean)
        : [];

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
          endDate: values.endDate?.format('YYYY-MM-DD') || undefined,
          imageUrl: values.imageUrl,
          screenshots: screenshotsArray.length > 0 ? screenshotsArray : undefined,
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
          endDate: values.endDate?.format('YYYY-MM-DD') || undefined,
          imageUrl: values.imageUrl,
          screenshots: screenshotsArray.length > 0 ? screenshotsArray : undefined,
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

  const handleDelete = () => {
    if (!project || isNew) {
      return;
    }
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(id!);
      message.success('프로젝트가 성공적으로 삭제되었습니다');
      navigate('/admin/projects');
    } catch (error: any) {
      message.error(error.message || '프로젝트 삭제 중 오류가 발생했습니다');
    } finally {
      setDeleteModalVisible(false);
    }
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
        {/* 썸네일 섹션을 기본 정보 위로 이동 */}
        <Card 
          title="썸네일 이미지" 
          style={{ marginBottom: '24px' }}
          extra={
            <Space>
              <Upload
                showUploadList={false}
                accept="image/*"
                customRequest={async ({ file, onSuccess, onError }: any) => {
                  try {
                    // 임시 미리보기 URL과 로딩 상태 설정
                    const f = file as File;
                    const objectUrl = URL.createObjectURL(f);
                    setTempThumbnailUrl(objectUrl);
                    setIsUploadingThumbnail(true);
                    const response = await uploadImageMutation.mutateAsync({ file: file as File, type: 'project', projectId: !isNew ? id : undefined });
                    if (response?.url) {
                      form.setFieldValue('imageUrl', response.url);
                      message.success('이미지가 업로드되었습니다');
                    }
                    onSuccess?.();
                  } catch (e: any) {
                    message.error(e?.message || '이미지 업로드 실패');
                    onError?.(e);
                  } finally {
                    // 로딩 해제 및 임시 URL 정리
                    setIsUploadingThumbnail(false);
                    if (tempThumbnailUrl) {
                      URL.revokeObjectURL(tempThumbnailUrl);
                    }
                    setTempThumbnailUrl(undefined);
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>이미지 변경</Button>
              </Upload>
              {form.getFieldValue('imageUrl') && (
                <>
                  <Button icon={<EyeOutlined />} onClick={() => setThumbPreviewVisible(true)}>미리보기</Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={async () => {
                      const value = form.getFieldValue('imageUrl');
                      if (!value) return;
                      try {
                        const publicId = value.split('/').pop()?.split('.')[0];
                        if (publicId) {
                          await deleteImageMutation.mutateAsync(publicId);
                        }
                        form.setFieldValue('imageUrl', '');
                        message.success('이미지가 삭제되었습니다');
                      } catch (e: any) {
                        message.error(e?.message || '이미지 삭제 실패');
                      }
                    }}
                  />
                </>
              )}
            </Space>
          }
        >
          <Form.Item name="imageUrl">
            <ProjectThumbnailUpload 
              hideControls
              isLoading={isUploadingThumbnail}
              tempImageUrl={tempThumbnailUrl}
              projectId={!isNew ? id : undefined}
            />
          </Form.Item>
        </Card>

        <Modal open={thumbPreviewVisible} footer={null} onCancel={() => setThumbPreviewVisible(false)} width={1000}>
          {form.getFieldValue('imageUrl') && (
            <img src={form.getFieldValue('imageUrl')} alt="썸네일 미리보기" style={{ width: '100%' }} />
          )}
        </Modal>

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
                  <Option value="COMPLETED">완료</Option>
                  <Option value="IN_PROGRESS">진행 중</Option>
                  <Option value="MAINTENANCE">유지보수</Option>
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

          <DateRangeWithOngoing
            startDateName="startDate"
            endDateName="endDate"
            startDateLabel="시작일"
            endDateLabel="종료일"
            ongoingLabel="진행중"
            defaultOngoing={project ? !project.endDate : false}
          />
        </Card>

        <Card title="기술 스택" style={{ marginBottom: '24px' }}>
          <TechStackSelector
            value={technologies}
            onChange={handleTechnologiesChange}
          />
        </Card>

        <Card 
          title="스크린샷" 
          style={{ marginBottom: '24px' }}
          extra={
            <Upload
              showUploadList={false}
              accept="image/*"
              multiple
              beforeUpload={() => false}
              fileList={[]}
              onChange={async (info) => {
                if (isUploadingScreenshots) return;
                const files = (info.fileList || [])
                  .map((f: any) => f.originFileObj)
                  .filter(Boolean) as File[];
                if (files.length === 0) return;
                // 동일 선택에 대한 중복 업로드 방지 키
                const selectionKey = files
                  .map(f => `${f.name}-${f.size}-${(f as any).lastModified}`)
                  .join('|');
                if (selectionKey && selectionKey === lastScreenshotsSelectionKey) {
                  return;
                }
                // 임시 프리뷰 URL 생성 및 표시 (finally에서 정리 필요하므로 try 바깥에서 선언)
                const tempUrls = files.map(f => URL.createObjectURL(f));
                setTempScreenshotUrls(prev => [...prev, ...tempUrls]);
                try {
                  setIsUploadingScreenshots(true);
                  setLastScreenshotsSelectionKey(selectionKey);
                  const response = await uploadImagesMutation.mutateAsync({ files, type: 'screenshots', projectId: !isNew ? id : undefined });
                  if (response && response.length > 0) {
                    const newItems = response.map((url: string, index: number) => ({ imageUrl: url, displayOrder: (screenshots?.length || 0) + index + 1 }));
                    const updated = [...(screenshots || []), ...newItems];
                    setScreenshots(updated);
                    message.success(`${files.length}개의 이미지가 업로드되었습니다`);
                  }
                } catch (e: any) {
                  message.error(e?.message || '스크린샷 업로드 실패');
                } finally {
                  setIsUploadingScreenshots(false);
                  // 임시 URL 정리 및 제거
                  setTempScreenshotUrls(current => {
                    tempUrls.forEach((u: string) => URL.revokeObjectURL(u));
                    return current.filter(u => !tempUrls.includes(u));
                  });
                }
              }}
            >
              <Button icon={<UploadOutlined />}>스크린샷 추가</Button>
            </Upload>
          }
        >
          <ProjectScreenshotsUpload
            value={screenshots}
            onChange={handleScreenshotsChange}
            projectId={!isNew ? id : undefined}
            hideAddButton
            isLoading={isUploadingScreenshots}
            tempImageUrls={tempScreenshotUrls}
          />
        </Card>

        <Card title="프로젝트 링크" style={{ marginBottom: '24px' }}>
          <ProjectLinksForm form={form} />
        </Card>

        <Card title="README" style={{ marginBottom: '24px' }}>
          <Form.Item name="readme" noStyle>
            <ProjectMarkdownEditor />
          </Form.Item>
        </Card>

        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <Space>
            {!isNew && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
                loading={deleteProjectMutation.isPending}
              >
                삭제
              </Button>
            )}
            <Button onClick={(e) => {
              e.preventDefault();
              navigate('/admin/projects');
            }}>
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

      <Modal
        open={deleteModalVisible}
        title="프로젝트 삭제"
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="삭제"
        cancelText="취소"
        okType="danger"
        confirmLoading={deleteProjectMutation.isPending}
      >
        <p>
          '{project?.title}' 프로젝트를 삭제하시겠습니까? 
          <br />
          이 작업은 되돌릴 수 없습니다.
        </p>
      </Modal>
    </div>
  );
};

export { ProjectEdit };