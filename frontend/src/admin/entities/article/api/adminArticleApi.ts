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
    adminApiClient.get<{ content: Article[]; totalElements: number; totalPages: number }>('/articles', params),

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

  /**
   * 시리즈 검색 (제목으로 검색)
   */
  searchSeries: (keyword: string) =>
    adminApiClient.get<Array<{ seriesId: string; title: string }>>('/articles/series/search', {
      keyword,
    }),

  /**
   * 시리즈 ID로 조회
   */
  getSeriesById: (seriesId: string) =>
    adminApiClient.get<{ seriesId: string; title: string }>(`/articles/series/${seriesId}`),

  /**
   * 시리즈 생성 (시리즈 ID 자동 생성)
   */
  createSeries: (title: string) =>
    adminApiClient.post<{ seriesId: string; title: string }>('/articles/series', { title }),
};
