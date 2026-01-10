import { adminApiClient } from '@/admin/api/adminApiClient';
import { Article, CreateArticleRequest, UpdateArticleRequest } from '../model/article.types';

/**
 * Admin 아티클 API
 */
export const adminArticleApi = {
  /**
   * 전체 목록 조회 (페이징)
   */
  getAll: (params: { page: number; size: number }) =>
    adminApiClient.get<{ content: Article[]; totalElements: number; totalPages: number }>('/articles', { params }),

  /**
   * ID로 조회
   */
  getById: (id: number) =>
    adminApiClient.get<Article>(`/articles/${id}`),

  /**
   * 생성
   */
  create: (data: CreateArticleRequest) =>
    adminApiClient.post<Article>('/articles', data),

  /**
   * 업데이트
   */
  update: (id: number, data: UpdateArticleRequest) =>
    adminApiClient.put<Article>(`/articles/${id}`, data),

  /**
   * 삭제
   */
  delete: (id: number) =>
    adminApiClient.delete(`/articles/${id}`),
};
