import { useAdminQuery } from '@/admin/hooks/useAdminQuery';
import { useAdminMutation } from '@/admin/hooks/useAdminMutation';
import { adminArticleApi } from './adminArticleApi';
import { CreateArticleRequest, UpdateArticleRequest } from '../model/article.types';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

/**
 * 아티클 목록 조회 쿼리
 */
export function useAdminArticleListQuery(params: { page: number; size: number; sort?: string }) {
  return useAdminQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => adminArticleApi.getAll(params),
  });
}

/**
 * 아티클 상세 조회 쿼리
 */
export function useAdminArticleQuery(id: number, options?: { enabled?: boolean }) {
  return useAdminQuery({
    queryKey: ['admin', 'articles', id],
    queryFn: () => adminArticleApi.getById(id),
    enabled: options?.enabled !== false && !!id,
  });
}

/**
 * 아티클 생성 뮤테이션
 */
export function useCreateArticleMutation() {
  const queryClient = useQueryClient();

  return useAdminMutation({
    mutationFn: (data: CreateArticleRequest) => adminArticleApi.create(data),
    onSuccess: () => {
      message.success('아티클이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
}

/**
 * 아티클 업데이트 뮤테이션
 */
export function useUpdateArticleMutation() {
  const queryClient = useQueryClient();

  return useAdminMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateArticleRequest }) =>
      adminArticleApi.update(id, data),
    onSuccess: () => {
      message.success('아티클이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
}

/**
 * 아티클 삭제 뮤테이션
 */
export function useDeleteArticleMutation() {
  const queryClient = useQueryClient();

  return useAdminMutation({
    mutationFn: (id: number) => adminArticleApi.delete(id),
    onSuccess: () => {
      message.success('아티클이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
}
