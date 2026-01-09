/**
 * Certification 엔티티 타입 정의
 * Main과 Admin에서 공통으로 사용하는 자격증 타입
 */

// Certification 카테고리 타입
export type CertificationCategory = 'IT' | 'LANGUAGE' | 'PROJECT_MANAGEMENT' | 'CLOUD' | 'SECURITY' | 'DATA' | 'OTHER';

// Certification 엔티티 (Main용 - 간단한 형태)
export interface CertificationMain {
  id: string;
  name: string; // title 대신 name 사용
  description: string;
  issuer: string;
  date: string; // startDate 대신 date 사용
  credentialUrl: string;
}

// Certification 엔티티 (Admin용)
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

