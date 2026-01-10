import { Modal, Form, Input, Select, Switch, InputNumber, Tabs } from 'antd';
import { MarkdownEditor } from '@/admin/shared/ui/markdown/MarkdownEditor';
import { Article, ARTICLE_CATEGORIES } from '@/admin/entities/article';
import { useArticleForm } from '../hooks/useArticleForm';
import {
  useCreateArticleMutation,
  useUpdateArticleMutation,
} from '@/admin/entities/article/api/useAdminArticleQuery';
import { useState, useEffect } from 'react';

interface ArticleFormModalProps {
  open: boolean;
  onClose: () => void;
  article?: Article;
}

/**
 * 아티클 폼 모달 (생성/수정)
 */
export function ArticleFormModal({ open, onClose, article }: ArticleFormModalProps) {
  const { form } = useArticleForm(article);
  const [content, setContent] = useState(article?.content || '');

  const createMutation = useCreateArticleMutation();
  const updateMutation = useUpdateArticleMutation();

  // content 동기화
  useEffect(() => {
    if (article) {
      setContent(article.content);
    } else {
      setContent('');
    }
  }, [article]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, content };

      if (article) {
        // 업데이트
        updateMutation.mutate({ id: article.id, data }, {
          onSuccess: () => {
            onClose();
            form.resetFields();
            setContent('');
          },
        });
      } else {
        // 생성
        createMutation.mutate(data, {
          onSuccess: () => {
            onClose();
            form.resetFields();
            setContent('');
          },
        });
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Modal
      title={article ? '아티클 수정' : '아티클 생성'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      width={1200}
      okText="저장"
      cancelText="취소"
      confirmLoading={createMutation.isPending || updateMutation.isPending}
    >
      <Tabs
        items={[
          {
            key: 'basic',
            label: '기본 정보',
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="title"
                  label="제목"
                  rules={[{ required: true, message: '제목은 필수입니다.' }]}
                >
                  <Input placeholder="아티클 제목" />
                </Form.Item>

                <Form.Item name="summary" label="요약">
                  <Input.TextArea rows={3} placeholder="아티클 요약 (목록에서 표시)" />
                </Form.Item>

                <Form.Item name="category" label="카테고리">
                  <Select placeholder="카테고리 선택" allowClear>
                    {Object.entries(ARTICLE_CATEGORIES).map(([key, label]) => (
                      <Select.Option key={key} value={key}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="tags" label="태그">
                  <Select mode="tags" placeholder="태그 입력" />
                </Form.Item>

                <Form.Item name="techStack" label="기술 스택">
                  <Select mode="tags" placeholder="기술 스택 입력" />
                </Form.Item>

                <Form.Item name="status" label="상태" initialValue="draft">
                  <Select>
                    <Select.Option value="draft">초안</Select.Option>
                    <Select.Option value="published">발행</Select.Option>
                    <Select.Option value="archived">보관</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="isFeatured" label="추천 아티클" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item name="projectId" label="연관 프로젝트 ID">
                  <InputNumber placeholder="프로젝트 ID (선택)" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="seriesId" label="시리즈 ID">
                  <Input placeholder="시리즈 ID (선택)" />
                </Form.Item>

                <Form.Item name="seriesOrder" label="시리즈 순서">
                  <InputNumber placeholder="시리즈 순서 (선택)" style={{ width: '100%' }} />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'content',
            label: '본문',
            children: (
              <div>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  height={600}
                  preview="live"
                />
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
