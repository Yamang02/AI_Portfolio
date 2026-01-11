import { Form } from 'antd';
import { Article, CreateArticleRequest, UpdateArticleRequest } from '@/admin/entities/article';
import { useEffect } from 'react';

export interface ArticleFormData {
  title: string;
  summary?: string;
  content: string;
  projectId?: number;
  category?: string;
  tags?: string[];
  techStack?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * 아티클 폼 훅
 */
export function useArticleForm(article?: Article) {
  const [form] = Form.useForm<ArticleFormData>();

  // 초기 데이터 로드
  useEffect(() => {
    if (article) {
      form.setFieldsValue({
        title: article.title,
        summary: article.summary,
        content: article.content,
        projectId: article.projectId ?? null, // null을 명시적으로 설정
        category: article.category,
        tags: article.tags,
        techStack: article.techStack,
        status: article.status,
        isFeatured: article.isFeatured,
        seriesId: article.seriesId,
        seriesOrder: article.seriesOrder,
      });
    }
  }, [article, form]);

  return { form };
}
