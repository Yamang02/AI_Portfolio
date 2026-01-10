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
import { SaveOutlined, ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { MarkdownEditor } from '@/admin/shared/ui/markdown/MarkdownEditor';
import { MarkdownRenderer } from '@/shared/ui/markdown/MarkdownRenderer';
import { Article, ARTICLE_CATEGORIES } from '../entities/article';
import {
  useAdminArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
} from '../entities/article/api/useAdminArticleQuery';
import { useArticleForm } from '../features/article-management/hooks/useArticleForm';

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
  const { data: article, isLoading } = useAdminArticleQuery(Number(id) || 0, { enabled: !isNew && !!id });
  const createMutation = useCreateArticleMutation();
  const updateMutation = useUpdateArticleMutation();

  const [content, setContent] = useState('');
  const [formValues, setFormValues] = useState<any>({});

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
        projectId: article.projectId,
        seriesId: article.seriesId,
        seriesOrder: article.seriesOrder,
      });
      setContent(article.content || '');
      setFormValues({
        title: article.title,
        summary: article.summary,
        category: article.category,
        tags: article.tags || [],
        techStack: article.techStack || [],
      });
    } else if (isNew) {
      // 새 아티클 생성 시 초기값 설정
      form.setFieldsValue({
        status: 'draft',
        isFeatured: false,
      });
      setContent('');
      setFormValues({});
    }
  }, [article, form, isNew]);

  // 폼 값 변경 감지
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    setFormValues(values);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, content };

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

  // 미리보기용 데이터
  const previewData = {
    title: formValues.title || article?.title || '',
    summary: formValues.summary || article?.summary || '',
    content: content || article?.content || '',
    category: formValues.category || article?.category || '',
    tags: formValues.tags || article?.tags || [],
    techStack: formValues.techStack || article?.techStack || [],
    publishedAt: article?.publishedAt || new Date().toISOString(),
    viewCount: article?.viewCount || 0,
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="로딩 중..." />
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
      <Row gutter={24}>
        {/* 좌측: 편집 폼 */}
        <Col xs={24} lg={12}>
          <Card title="편집" className="mb-4">
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleFormChange}
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
                <Select mode="tags" placeholder="기술 스택 입력" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="isFeatured" label="추천 아티클" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="projectId" label="연관 프로젝트 ID">
                    <InputNumber placeholder="프로젝트 ID (선택)" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="seriesId" label="시리즈 ID">
                    <Input placeholder="시리즈 ID (선택)" />
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
                preview="edit"
              />
            </div>
          </Card>
        </Col>

        {/* 우측: 미리보기 (실제 발행될 모습) */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <EyeOutlined />
                <span>미리보기</span>
              </Space>
            }
            className="sticky top-4"
          >
            <article className="article-preview max-w-full">
              <header className="mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  {previewData.title || '제목을 입력하세요'}
                </h1>
                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                  <span>
                    {previewData.publishedAt &&
                      new Date(previewData.publishedAt).toLocaleDateString('ko-KR')}
                  </span>
                  <span>조회 {previewData.viewCount}</span>
                </div>
                {previewData.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {previewData.tags.map((tag: string) => (
                      <span key={tag} className="bg-gray-100 px-3 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {previewData.summary && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">{previewData.summary}</p>
                </div>
              )}

              {previewData.content ? (
                <MarkdownRenderer content={previewData.content} />
              ) : (
                <div className="text-gray-400 text-center py-12">
                  본문을 입력하세요
                </div>
              )}

              {previewData.techStack.length > 0 && (
                <footer className="mt-12 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">기술 스택</h3>
                  <div className="flex gap-2 flex-wrap">
                    {previewData.techStack.map((tech: string) => (
                      <span
                        key={tech}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </footer>
              )}
            </article>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export { ArticleEdit };
