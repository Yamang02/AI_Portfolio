/**
 * Relationship 타입 정의
 */

export interface TechStackRelationshipRequest {
  techStackId: number;
  isPrimary: boolean;
  usageDescription?: string;
}

export interface ProjectRelationshipRequest {
  projectBusinessId: string;  // Business ID (PRJ001, PRJ002...)
  isPrimary?: boolean;
  usageDescription?: string;
  roleInProject?: string;
  contributionDescription?: string;
}

export interface TechStackRelationship {
  id: number;
  techStackId: number;
  techStackName: string;
  techStackDisplayName: string;
  category: string;
  isPrimary: boolean;
  usageDescription?: string;
}

export interface ProjectRelationship {
  id: number;
  projectId: number;  // DB ID (내부 사용, 삭제 시)
  projectBusinessId: string;  // Business ID (외부 API)
  projectTitle: string;
  isPrimary?: boolean;
  usageDescription?: string;
  roleInProject?: string;
  contributionDescription?: string;
}

