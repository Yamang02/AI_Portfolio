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
  Divider,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { MarkdownEditor } from '@/admin/shared/ui/markdown/MarkdownEditor';
import { ProjectSearchSelect } from '@/admin/shared/ui/ProjectSearchSelect';
import { SeriesSearchSelect } from '@/admin/shared/ui/SeriesSearchSelect';
import { Article, ARTICLE_CATEGORIES } from '../entities/article';
import {
  useAdminArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
} from '../entities/article/api/useAdminArticleQuery';
import { useArticleForm } from '../features/article-management/hooks/useArticleForm';
import { useSearchTechStacksQuery, useAdminTechStacksQuery } from '../entities/tech-stack/api/useAdminTechStackQuery';
import type { TechStackMetadata } from '../entities/tech-stack/model/techStack.types';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * 아티클 편집 페이지
 * 실제 발행될 내용과 유사한 레이아웃으로 구성
 */
const ArticleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { form } = useArticleForm();

  const isNew = !id || id === 'new';
  const articleId = id && id !== 'new' ? Number(id) : 0;
  const { data: article, isLoading } = useAdminArticleQuery(articleId, { enabled: !isNew && !!id && !isNaN(articleId) && articleId > 0 });
  const createMutation = useCreateArticleMutation();
  const updateMutation = useUpdateArticleMutation();

  const [content, setContent] = useState('');
  const [techStackSearchTerm, setTechStackSearchTerm] = useState('');
  
  // 전체 기술 스택 목록 (검색어가 없을 때 사용)
  const { data: allTechStacks } = useAdminTechStacksQuery();
  
  // 기술 스택 검색 (디바운싱 적용)
  const { data: searchedTechStacks, isLoading: isSearchingTechStacks } = useSearchTechStacksQuery(
    techStackSearchTerm,
    300, // 300ms 디바운싱
    techStackSearchTerm.length > 0 // 검색어가 있을 때만 검색
  );
  
  // 표시할 기술 스택 목록 결정
  const displayTechStacks = techStackSearchTerm.length > 0 
    ? searchedTechStacks 
    : allTechStacks;

  // 기존 아티클 데이터 로드
  useEffect(() => {
    if (article && !isNew) {
      form.setFieldsValue({
        title: article.title,
        summary: article.summary,
        category: article.category,
        tags: article.tags || [],
        techStack: article.techStack || [],
        status: article.status || 'draft',
        isFeatured: article.isFeatured || false,
        projectId: article.projectId ?? null, // null을 명시적으로 설정
        seriesId: article.seriesId,
        seriesOrder: article.seriesOrder,
      });
      setContent(article.content || '');
    } else if (isNew) {
      // 새 아티클 생성 시 초기값 설정
      form.setFieldsValue({
        status: 'draft',
        isFeatured: false,
        projectId: null, // 명시적으로 null 설정
      });
      setContent('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, isNew]); // form은 안정적인 참조이므로 의존성에서 제외

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, content };
      
      // projectId가 undefined이거나 빈 문자열인 경우 null로 변환
      if (data.projectId === undefined || data.projectId === '' || (typeof data.projectId === 'string' && data.projectId.trim().length === 0)) {
        data.projectId = null;
      }


      if (isNew) {
        createMutation.mutate(data, {
          onSuccess: () => {
            message.success('아티클이 생성되었습니다.');
            navigate('/admin/articles');
          },
        });
      } else {
        updateMutation.mutate({ id: Number(id), data }, {
          onSuccess: () => {
            message.success('아티클이 수정되었습니다.');
            navigate('/admin/articles');
          },
        });
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
        <span style={{ marginLeft: '12px' }}>로딩 중...</span>
      </div>
    );
  }


  return (
    <div className="article-edit-page">
      {/* 헤더 */}
      <Card className="mb-4">
        <Space className="w-full justify-between">
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/articles')}
            >
              목록으로
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {isNew ? '아티클 생성' : '아티클 수정'}
            </Title>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            저장
          </Button>
        </Space>
      </Card>

      {/* 편집 영역 */}
      <Card title="편집" className="mb-4">
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="title"
                label="제목"
                rules={[{ required: true, message: '제목은 필수입니다.' }]}
              >
                <Input placeholder="아티클 제목" size="large" />
              </Form.Item>

              <Form.Item name="summary" label="요약">
                <TextArea
                  rows={3}
                  placeholder="아티클 요약 (목록에서 표시)"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="category" label="카테고리">
                    <Select placeholder="카테고리 선택" allowClear>
                      {Object.entries(ARTICLE_CATEGORIES).map(([key, label]) => (
                        <Select.Option key={key} value={key}>
                          {label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label="상태" initialValue="draft">
                    <Select>
                      <Select.Option value="draft">초안</Select.Option>
                      <Select.Option value="published">발행</Select.Option>
                      <Select.Option value="archived">보관</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="tags" label="태그">
                <Select mode="tags" placeholder="태그 입력" />
              </Form.Item>

              <Form.Item name="techStack" label="기술 스택">
                <Select
                  mode="tags"
                  placeholder="기술 스택 입력 (검색 가능)"
                  showSearch
                  onSearch={setTechStackSearchTerm}
                  filterOption={false}
                  loading={isSearchingTechStacks}
                  notFoundContent={isSearchingTechStacks ? <Spin size="small" /> : '검색 결과가 없습니다. 직접 입력하세요.'}
                  allowClear
                >
                  {displayTechStacks?.map((tech: TechStackMetadata) => (
                    <Select.Option key={tech.name} value={tech.name}>
                      {tech.displayName || tech.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="isFeatured" label="추천 아티클" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="projectId" label="연관 프로젝트">
                    <ProjectSearchSelect placeholder="프로젝트명으로 검색..." />
                  </Form.Item>
                </Col>
              </Row>

              {/* 읽기 전용 정보 표시 (수정 모드일 때만) */}
              {!isNew && article && (article.seriesTitle || article.projectTitle) && (
                <Row gutter={16}>
                  {article.seriesTitle && (
                    <Col span={12}>
                      <Form.Item label="시리즈명 (DB 매핑)">
                        <Input 
                          value={article.seriesTitle} 
                          readOnly 
                          style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {article.projectTitle && (
                    <Col span={12}>
                      <Form.Item label="연관 프로젝트명 (DB 매핑)">
                        <Input 
                          value={article.projectTitle} 
                          readOnly 
                          style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="seriesId" label="시리즈">
                    <SeriesSearchSelect 
                      placeholder="시리즈명으로 검색..." 
                      seriesTitle={article?.seriesTitle}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="seriesOrder" label="시리즈 순서">
                    <InputNumber placeholder="시리즈 순서 (선택)" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Divider>본문</Divider>

            <div className="mb-4">
              <MarkdownEditor
                value={content}
                onChange={setContent}
                height={600}
                // preview prop을 제거하여 리본 메뉴에서 미리보기 모드 제어 가능
              />
            </div>
          </Card>
    </div>
  );
};

export { ArticleEdit };
