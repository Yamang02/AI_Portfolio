/**
 * Admin Certification React Query 훅
 *
 * 책임: Certification 데이터 fetching 및 mutation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCertificationApi } from './adminCertificationApi';
import { Certification, CertificationFormData } from '../model/certification.types';

// ==================== Query Keys ====================
export const CERTIFICATION_KEYS = {
  all: ['admin', 'certifications'] as const,
  lists: () => [...CERTIFICATION_KEYS.all, 'list'] as const,
  list: (filter?: any) => [...CERTIFICATION_KEYS.lists(), filter] as const,
  details: () => [...CERTIFICATION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CERTIFICATION_KEYS.details(), id] as const,
  expired: () => [...CERTIFICATION_KEYS.all, 'expired'] as const,
  expiringSoon: () => [...CERTIFICATION_KEYS.all, 'expiring-soon'] as const,
  category: (category: string) => [...CERTIFICATION_KEYS.all, 'category', category] as const,
};

// ==================== Queries ====================

/**
 * 전체 Certification 목록 조회 훅
 */
export const useAdminCertificationsQuery = () => {
  return useQuery({
    queryKey: CERTIFICATION_KEYS.lists(),
    queryFn: () => adminCertificationApi.getCertifications(),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * Certification 상세 조회 훅
 */
export const useAdminCertificationQuery = (id: string | null) => {
  return useQuery({
    queryKey: CERTIFICATION_KEYS.detail(id!),
    queryFn: () => adminCertificationApi.getCertificationById(id!),
    enabled: !!id,
  });
};

/**
 * 카테고리별 Certification 조회 훅
 */
export const useCertificationsByCategoryQuery = (category: string) => {
  return useQuery({
    queryKey: CERTIFICATION_KEYS.category(category),
    queryFn: () => adminCertificationApi.getCertificationsByCategory(category),
    enabled: !!category && category !== 'all',
  });
};

/**
 * 만료된 Certification 조회 훅
 */
export const useExpiredCertificationsQuery = () => {
  return useQuery({
    queryKey: CERTIFICATION_KEYS.expired(),
    queryFn: () => adminCertificationApi.getExpiredCertifications(),
  });
};

/**
 * 곧 만료될 Certification 조회 훅
 */
export const useExpiringSoonCertificationsQuery = () => {
  return useQuery({
    queryKey: CERTIFICATION_KEYS.expiringSoon(),
    queryFn: () => adminCertificationApi.getExpiringSoonCertifications(),
  });
};

// ==================== Mutations ====================

/**
 * Certification 생성/수정 Mutation 훅
 */
export const useCertificationMutation = (editingCertification?: Certification | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CertificationFormData) => {
      if (editingCertification) {
        await adminCertificationApi.updateCertification(editingCertification.id, data);
      } else {
        await adminCertificationApi.createCertification(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CERTIFICATION_KEYS.expired() });
      queryClient.invalidateQueries({ queryKey: CERTIFICATION_KEYS.expiringSoon() });
    },
  });
};

/**
 * Certification 삭제 Mutation 훅
 */
export const useDeleteCertificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCertificationApi.deleteCertification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CERTIFICATION_KEYS.expired() });
      queryClient.invalidateQueries({ queryKey: CERTIFICATION_KEYS.expiringSoon() });
    },
  });
};

/**
 * Certification 정렬 순서 업데이트 Mutation 훅
 */
export const useUpdateCertificationSortOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sortOrderUpdates: Record<string, number>) =>
      adminCertificationApi.updateSortOrder(sortOrderUpdates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATION_KEYS.lists() });
    },
  });
};
