import { Project } from '../types';

// GitHub 소스 연결이 불가능한 로컬 프로젝트들
export const LOCAL_PROJECTS: Project[] = [
  {
    id: 'proj-004',
    title: '사내 VMS 통합 프로젝트',
    description: '(주)디아이티 사내 Git 전환 프로젝트트',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: '#',
    readme: `# 로컬 개발 프로젝트 A

## 개요
GitHub에 올라가지 않은 로컬 개발 프로젝트입니다.

## 기술 스택
Python, Django, PostgreSQL, Docker

## 주요 기능
- 사용자 인증 시스템
- 데이터베이스 관리
- API 엔드포인트
- 관리자 대시보드

## 도전 과제
- Django ORM 최적화
- PostgreSQL 성능 튜닝
- Docker 컨테이너화

## 학습 내용
- Django 프레임워크 활용
- 데이터베이스 설계
- Docker 배포 환경 구축`,
    type: 'project',
    source: 'local',
    startDate: '2023-10',
    endDate: '2024-02'
  },
  {
    id: 'proj-005',
    title: '노루그룹 차세대ERP 전환 프로젝트',
    description: '회사 내부에서 개발한 프로젝트로, 소스코드가 비공개입니다.',
    technologies: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'AWS'],
    githubUrl: '#',
    liveUrl: 'https://internal-project.company.com',
    imageUrl: '#',
    readme: `# 회사 내부 프로젝트 B

          ## 개요
          회사 내부에서 개발한 프로젝트로, 소스코드가 비공개입니다.

          ## 기술 스택
          Java, Spring Boot, MySQL, Redis, AWS

          ## 프로젝트 정보
          - **소스 타입:** 비공개 프로젝트
          - **회사:** ABC Company
          - **역할:** Backend Developer
          - **기간:** 6 months
          - **팀 크기:** 5명

          ## 주요 기능
          - 마이크로서비스 아키텍처
          - RESTful API 개발
          - 데이터베이스 설계
          - AWS 인프라 구축

          ## 주요 성과
          - API 응답 시간 50% 개선
          - 데이터베이스 쿼리 최적화
          - 자동화된 배포 파이프라인 구축

          ## 도전 과제
          - 대용량 데이터 처리
          - 마이크로서비스 간 통신
          - AWS 비용 최적화`,
    type: 'project',
    source: 'local',
    startDate: '2024-01',
    endDate: '2025-01'
  }
]; 