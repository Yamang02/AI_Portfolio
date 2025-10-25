/**
 * Certification 엔티티 타입 정의
 */

// Certification 카테고리 타입
export type CertificationCategory = 'IT' | 'LANGUAGE' | 'PROJECT_MANAGEMENT' | 'CLOUD' | 'SECURITY' | 'DATA' | 'OTHER';

// Certification 엔티티
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  category?: CertificationCategory;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Certification 생성/수정 폼 데이터
export interface CertificationFormData {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  category?: CertificationCategory;
  sortOrder?: number;
}

// Certification 필터
export interface CertificationFilter {
  searchText?: string;
  category?: CertificationCategory | 'all';
  issuer?: string;
}

// Certification 통계
export interface CertificationStats {
  total: number;
  expired: number;
  expiringSoon: number; // 3개월 이내 만료
  byCategory: Record<CertificationCategory, number>;
}

