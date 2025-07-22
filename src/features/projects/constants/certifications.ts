import { Certification } from '../types';

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-001',
    title: 'AWS Certified Solutions Architect - Associate',
    description: 'AWS 클라우드 아키텍처 설계 및 배포에 대한 전문 지식을 인증하는 자격증입니다.',
    technologies: ['AWS', 'Cloud Architecture', 'DevOps', 'Infrastructure'],
    issuer: 'Amazon Web Services',
    credentialId: 'AWS-123456789',
    validUntil: '2025-12-31',
    credentialUrl: 'https://aws.amazon.com/verification',
    startDate: '2024-01',
    endDate: '2024-03'
  },
  {
    id: 'cert-002',
    title: 'Microsoft Certified: Azure Developer Associate',
    description: 'Microsoft Azure 플랫폼에서 애플리케이션을 개발하고 배포하는 능력을 인증하는 자격증입니다.',
    technologies: ['Azure', 'C#', '.NET', 'Cloud Development'],
    issuer: 'Microsoft',
    credentialId: 'MS-987654321',
    validUntil: '2025-06-30',
    credentialUrl: 'https://www.microsoft.com/verification',
    startDate: '2023-09',
    endDate: '2023-12'
  }
]; 