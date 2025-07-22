import { Project } from '../types';

// GitHub 소스 연결이 불가능한 로컬 프로젝트들
export const LOCAL_PROJECTS: Project[] = [
  {
    id: 'local-001',
    title: '노루화학 BG 차세대 ERP (SAP) 전환 프로젝트',
    description: '노루그룹의 기존 Oracle ERP를 SAP로 전환하는 프로젝트로, 차세대 ERP FCM팀의 멤버로 참여하여 물류(Logistics Execution) 모듈을 담당했습니다.',
    technologies: ['Java', 'C#', 'MSSQL', 'SAP', 'REST API', 'Oracle Database', 'PL/SQL'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: '#',
    readme: `# 노루화학 BG 차세대 ERP (SAP) 전환 프로젝트

## 개요
노루 페인트로 유명한 노루그룹의 기존 Oracle ERP를 SAP로 전환하는 프로젝트로, 차세대 ERP FCM팀(구 IT서비스 1팀)의 멤버로 참여했습니다. ERP 전환간 기간계 시스템의 분석 및 개발을 담당했습니다.

## 프로젝트 정보
- **회사:** (주)디아이티 (노루그룹 전산 계열사)
- **역할:** ERP 전환 프로젝트 개발자
- **기간:** 2023.11 ~ 2025.01 (1년 3개월)
- **담당 모듈:** 물류(Logistics Execution)
- **팀:** 차세대 ERP FCM팀 Git 관리 위원

## 기술 스택
- **기존 시스템:** Oracle Database, PL/SQL, Oracle Forms
- **신규 시스템:** SAP, Java, C#, MSSQL
- **인터페이스:** REST API, EAI
- **기타:** Git, 프로세스 분석 도구

## 주요 성과 및 기여
### 1. 노루 로지넷 운임비 정산 시스템 TMS, 물류 추적 시스템 DTS (100% 개인 담당)
- **SAP EAI와의 인터페이스 개발**
  - Oracle ERP에서 DB Link로 연결되고 있던 인터페이스들을 REST API 방식으로 개발
  - 기존 시스템과 SAP 시스템 간의 안정적인 데이터 연동 구축

### 2. 기존 DB 데이터 정리
- **Web코드, SQL 분석을 통해 미사용 스토어드 프로시저, 더미 데이터 등 차세대 ERP 전환시 불필요한 요소들을 추출하여 정리**
- **약 30%의 저장공간 절약** 달성

### 3. As-Is 프로세스 분석 (2023.11 ~ 2024.01)
- **시스템 프로세스 분석:** Oracle ERP의 물류 모듈 프로세스 분석 및 문서화
- **업무 다이어그램 작성:** 영업물류 모듈 전산 업무 다이어그램을 SAP 전환 프로젝트 기반 자료로 확장
- **데이터베이스 분석:** 개발 테이블, 데이터, 워크플로우 분석 및 도식화

### 4. Process Innovation 논의
- **SAP 컨설턴트 협업:** SAP 컨설턴트 및 ERP 운용 담당자와 PI 논의
- **개선점 도출:** SAP 시스템과 Oracle ERP 로직 간 영향도 분석을 통한 업무 개선점 도출
- **To-Be 프로세스 설계:** SAP 컨설턴트와 현업 사이에서 실제 적용 로직 검토

## 주요 성과
- **프로세스 최적화:** 기존 ERP 시스템 프로세스 도식화 및 SAP 전환 기반 자료 제공
- **저장공간 절약:** 미사용 스토어드 프로시저, 더미 데이터 정리로 약 30% 저장공간 절약
- **인터페이스 안정화:** REST API 방식으로 전환하여 시스템 간 연동 안정성 향상

## 도전 과제
- **대규모 시스템 전환:** Oracle ERP에서 SAP로의 전환 과정에서의 비즈니스 로직 분석
- **데이터 정합성 확보:** 기존 DB 데이터 정리 및 인터페이스 전환 시 데이터 일관성 유지
- **업무 프로세스 변경:** SAP 시스템에 맞춘 업무 프로세스 재설계 및 사용자 교육

## 학습 내용
- SAP 시스템 아키텍처 및 모듈 이해
- 대규모 ERP 시스템 전환 프로젝트 경험
- RESTful API 설계 및 개발
- 프로세스 분석 및 개선 방법론`,
    type: 'project',
    source: 'local',
    startDate: '2023-11',
    endDate: '2025-01',
    isTeam: true,
    myContributions: [
      'SAP EAI와의 인터페이스 개발 (REST API 전환)',
      'Oracle Forms 바이너리 파일 txt화 및 Git 관리',
      '물류(Logistics Execution) 모듈 담당',
      '데이터 정리 및 저장공간 최적화'
    ]
  },
  {
    id: 'local-002',
    title: '(주)디아이티 VMS(버전관리시스템) 통합 프로젝트',
    description: '사내 팀별로 분리되어 있던 VMS를 GIT으로 통합하는 프로젝트로, 대상은 tortoiesSVN을 사용하고 있던 ERP팀이 GitLab 사용으로 전환하는 것이 목표였습니다.',
    technologies: ['Git', 'GitLab', 'SVN', 'Oracle Forms'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: '#',
    readme: `# (주)디아이티 VMS(버전관리시스템) 통합 프로젝트

## 개요
사내 팀별로 분리되어 있던 VMS를 GIT으로 통합하는 프로젝트입니다. 대상은 tortoiesSVN을 사용하고 있던 ERP팀이 GitLab 사용으로 전환하는 것이 목표였습니다.

## 프로젝트 정보
- **회사:** (주)디아이티 (노루그룹 전산 계열사)
- **역할:** Git 관리 위원
- **기간:** 2023.09 ~ 2024.02 (5개월)
- **팀:** IT 서비스 1팀

## 기술 스택
- **버전 관리:** Git, GitLab, SVN
- **기타:** Oracle Forms, 바이너리 파일 처리

## 주요 성과 및 기여
### 1. IT 서비스 1팀의 GIT관리 위원으로 발탁
- **팀 내 인원들에게 git 사용법 교육 및 브랜치 전략 구성에 참여**
- **기존 자료 변환:** 안건 제안, 연구, 실행
  - Diff가 불가능하던 이진파일을 txt화하는 방법을 연구하여, git으로 코드 변경점 추적을 가능케 함
  - **기존 개발된 Oracle Forms 바이너리 파일 전량 txt화**

### 2. 브랜치 전략 수립
- **Main / Test / Feature 브랜치로 나눠서 사용**
- 체계적인 개발 워크플로우 구축

### 3. 프로젝트 관리 개선
- **버전 관리 시스템 통합으로 개발 프로세스 표준화**
- **팀 간 협업 효율성 향상**

## 주요 성과
- **개발 프로세스 표준화:** Git 기반 버전 관리 시스템으로 전환
- **코드 추적성 향상:** 바이너리 파일 txt화를 통한 코드 변경점 추적 가능
- **팀 협업 개선:** 체계적인 브랜치 전략으로 개발 워크플로우 최적화

## 도전 과제
- **바이너리 파일 처리:** Oracle Forms 바이너리 파일의 txt화 방법 연구
- **팀 교육:** 기존 SVN 사용자들의 Git 전환 교육
- **브랜치 전략 수립:** 팀에 적합한 Git 워크플로우 설계

## 학습 내용
- Git 및 GitLab을 활용한 버전 관리 시스템 구축
- Oracle Forms 바이너리 파일 처리 방법
- 팀 단위 개발 프로세스 표준화
- 개발자 교육 및 워크플로우 설계`,
    type: 'project',
    source: 'local',
    startDate: '2023-09',
    endDate: '2024-02',
    isTeam: true,
    myContributions: [
      'GitLab 기반 버전 관리 시스템 도입 및 교육',
      'Oracle Forms 바이너리 파일 txt화 및 코드 추적',
      '팀 내 Git 브랜치 전략 설계 및 적용'
    ]
  },
  {
    id: 'local-003',
    title: 'CloseToU - 중고거래 게시판',
    description: 'KH정보교육원 세미 프로젝트로 개발된 중고 거래 게시판 웹 애플리케이션입니다. 의류 카테고리 중심의 거래 시스템과 나눔 기능을 제공합니다.',
    technologies: ['Java', 'Spring Boot', 'Oracle', 'JSP', 'Servlet', 'HTML', 'CSS', 'JavaScript'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: '#',
    readme: 'docs/projects/2_CloseToU.md',
    type: 'project',
    source: 'local',
    startDate: '2022-12',
    endDate: '2023-01',
    isTeam: true,
    myContributions : ['팀장', '상품 목록 페이지 및 상세 페이지 개발', '팀원 코드 리뷰 및 방향성 제시']
  },
  {
    id: 'local-004',
    title: 'OnTheTrain - 기차 여행 통합 사이트',
    description: 'KH정보교육원 팀 프로젝트로 개발된 여행 계획 스케줄러입니다. 일정, 숙소, 승차권을 통합 관리하며 캘린더 인터페이스와 드래그 앤 드롭 기능을 제공합니다.',
    technologies: ['Java', 'Spring Boot', 'Oracle', 'JSP', 'Servlet', 'HTML', 'CSS', 'JavaScript', 'DayPilot', 'jQuery'],
    githubUrl: '#',
    liveUrl: '#',
    imageUrl: '#',
    readme: 'docs/projects/3_OnTheTrain.md',
    type: 'project',
    source: 'local',
    startDate: '2023-02',
    endDate: '2023-04',
    isTeam: true,
    myContributions : [ '일정 관리 페이지 담당', '전국 행사 API 연결', '팀원 코드 리뷰 및 방향성 제시']
    }
]; 