import { ArticleListItem, ArticleDetail } from '../model/article.types';
import { ApiResponse } from '@/shared/types/api';

/**
 * Public 아티클 API
 */
export const articleApi = {
  /**
   * 전체 목록 조회
   * genpresso-admin-backend 패턴 참고: 검색, 정렬, 페이지네이션 지원
   */
  getAll: async (params: { 
    page: number; 
    size: number; 
    category?: string;
    projectId?: number;
    seriesId?: string;
    searchKeyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ content: ArticleListItem[]; totalElements: number }> => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
    });
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.projectId) {
      queryParams.append('projectId', params.projectId.toString());
    }
    if (params.seriesId) {
      queryParams.append('seriesId', params.seriesId);
    }
    if (params.searchKeyword) {
      queryParams.append('searchKeyword', params.searchKeyword);
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }
    const response = await fetch(`/api/articles?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    const apiResponse: ApiResponse<{ content: ArticleListItem[]; totalElements: number }> = await response.json();
    return apiResponse.data || { content: [], totalElements: 0 };
  },

  /**
   * BusinessId로 조회
   */
  getByBusinessId: async (businessId: string): Promise<ArticleDetail> => {
    const response = await fetch(`/api/articles/${businessId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    const apiResponse: ApiResponse<ArticleDetail> = await response.json();
    if (!apiResponse.data) {
      throw new Error('Article not found');
    }
    return apiResponse.data;
  },
};
