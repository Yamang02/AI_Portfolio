/**
 * 클라우드 사용량 도메인 타입
 */

export enum CloudProvider {
  AWS = 'AWS',
  GCP = 'GCP',
}

export interface Period {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface ServiceCost {
  serviceName: string;
  cost: number;
  unit: string;
}

export interface CloudUsage {
  provider: CloudProvider;
  totalCost: number;
  currency: string;
  period: Period;
  services: ServiceCost[];
  lastUpdated: string; // ISO date string
}

export interface UsageTrend {
  date: string; // ISO date string
  cost: number;
  awsCost: number;
  gcpCost: number;
}

export interface ServiceBreakdown {
  awsTop5: ServiceCost[];
  gcpTop5: ServiceCost[];
}








