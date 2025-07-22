import { Experience, Education } from '../types';

// 경력 항목들
export const EXPERIENCES: Experience[] = [
                {
                id: 'exp-001',
                title: '(주)디아이티',
                description: '노루그룹 전산 계열사에서 ERP, 웹사이트 유지보수 및 IT외주 관리 등을 담당했습니다.',
                technologies: ['Oracle Forms', 'PL/SQL', 'Java', 'C#', 'MSSQL', 'SAP', 'REST API', 'Git', 'GitLab'],
                organization: '디아이티',
                role: 'ERP 개발/유지보수 엔지니어',
                startDate: '2023-07',
                endDate: '2025-01',
                type: 'career',
                mainResponsibilities: [
                  '영업/물류 도메인 ERP 시스템 및 WEB 유지보수',
                  'Noroo 화학 BG 차세대 ERP에 맞춘 Legacy 프로그램 개발',
                  '차세대 ERP FCM팀 Git 관리 위원',
                  '노루 로지넷 운임비 정산 시스템 TMS, 물류 추적 시스템 DTS 100% 개인 담당'
                ],
                achievements: [
                  'SAP EAI와의 인터페이스 개발로 REST API 방식 전환',
                  '기존 DB 데이터 정리로 약 30% 저장공간 절약',
                  'Oracle Forms 바이너리 파일 전량 txt화로 코드 변경점 추적 가능',
                  'Git 기반 버전 관리 시스템으로 개발 프로세스 표준화'
                ],
                projects: [
                  '노루화학 BG 차세대 ERP (SAP) 전환 프로젝트',
                  '(주)디아이티 VMS(버전관리시스템) 통합 프로젝트',
                  '노루 로지넷 운임비 정산 시스템 TMS 개발',
                  '노루 로지넷 물류 추적 시스템 DTS 개발'
                ]
              },
  {
    id: 'exp-002',
    title: '배재고등학교(비개발)',
    description: '국어교사, 담임',
    technologies: [],
    organization: '배재고등학교',
    startDate: '2021-03',
    endDate: '2022-03',
    type: 'career'
  },
  {
    id: 'exp-003',
    title: '상명고등학교(비개발)',
    description: '국어교사, 담임',
    technologies: [],
    organization: '상명고등학교',
    startDate: '2019-03',
    endDate: '2021-03',
    type: 'career'
  }
];

// 교육 항목들
export const EDUCATIONS: Education[] = [
  {
    id: 'edu-001',
    title: 'Sesac',
    description: 'Cloud 기반 Multi Modal AI 개발자 양성 과정 with Google Cloud',
    technologies: ['Python', 'PyQt5', 'Cursor', 'Gemini', 'Gemini CLI', 'Numpy', 'Matplotlib'],
    organization: 'Sesac 강동지점',
    startDate: '2025-06',
    endDate: undefined,
    type: 'education',
    projects: [
      'PYQT5 파일 태거 (File Tagger)',
      'AI 포트폴리오 챗봇 (AI Portfolio Chatbot)'
    ]
  },
  {
    id: 'edu-002',
    title: 'KH정보교육원',
    description: '(디지털컨버전스)자바(JAVA)기반 클라우드 융합 개발자 양성과정A9',
    technologies: ['Java', 'Spring Framework', 'Oracle', 'JSP', 'Servlet', 'HTML', 'CSS', 'JavaScript'],
    organization: 'KH정보교육원 강남지사',
    startDate: '2022-11',
    endDate: '2023-04',
    type: 'education',
    projects: [
      'CloseToU - 중고거래 게시판',
      'OnTheTrain - 여행 계획 스케줄러'
    ]
  }
]; 