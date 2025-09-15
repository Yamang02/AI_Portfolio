export const TEST_DOCUMENTS = {
  SAMPLE_DOCUMENT: {
    content: `AI 포트폴리오 프로젝트 테스트 문서

이 문서는 e2e 테스트를 위한 샘플 문서입니다.

## 주요 기능
- 문서 로드 및 관리
- RAG 기반 질의응답
- 벡터 검색 시스템

## 아키텍처
헥사고널 아키텍처를 기반으로 구현되어 있습니다.`,
    source: 'E2E 테스트'
  },
  
  ARCHITECTURE_DOCUMENT: {
    content: `헥사고널 아키텍처 (Hexagonal Architecture)

포트와 어댑터 패턴이라고도 불리는 헥사고널 아키텍처는 
애플리케이션의 핵심 비즈니스 로직을 외부 의존성으로부터 분리하는 설계 패턴입니다.

## 구성 요소
1. Domain Layer - 비즈니스 로직
2. Application Layer - 유스케이스
3. Infrastructure Layer - 외부 시스템 연동

## 장점
- 테스트 용이성
- 유지보수성 향상
- 의존성 역전`,
    source: '아키텍처 문서'
  },

  SHORT_DOCUMENT: {
    content: '간단한 테스트 문서입니다.',
    source: '간단 테스트'
  }
};

export const UI_SELECTORS = {
  DOCUMENT_LOAD_TAB: '📄 DocumentLoad',
  LOAD_SAMPLE_BUTTON: '📚 샘플 데이터 로드',
  ADD_DOCUMENT_BUTTON: '📄 문서 추가',
  REFRESH_BUTTON: '🔄 새로고침',
  VIEW_CONTENT_BUTTON: '📖 전체 내용 보기',
  DELETE_DOC_BUTTON: '🗑️ 선택한 문서 삭제',
  CLEAR_ALL_BUTTON: '🗑️ 모든 문서 삭제'
};

export const EXPECTED_RESPONSES = {
  SAMPLE_DATA_LOADED: {
    statusContains: ['성공', '로드', '완료'],
    previewContains: ['문서', '목록']
  },
  
  DOCUMENT_ADDED: {
    outputContains: ['추가', '성공', '완료']
  },
  
  DOCUMENT_DELETED: {
    outputContains: ['삭제', '성공', '완료']
  }
};

export const TIMEOUTS = {
  PAGE_LOAD: 30000,
  SAMPLE_DATA_LOAD: 60000,
  DOCUMENT_OPERATION: 15000,
  ELEMENT_VISIBLE: 10000
};

export class TestDataHelper {
  static getRandomDocument() {
    const documents = Object.values(TEST_DOCUMENTS);
    return documents[Math.floor(Math.random() * documents.length)];
  }

  static generateUniqueContent(baseContent: string) {
    const timestamp = new Date().toISOString();
    return `${baseContent}\n\n생성 시간: ${timestamp}`;
  }

  static generateTestDocument(title: string) {
    return {
      content: `테스트 문서: ${title}\n\n이 문서는 자동화된 테스트에서 생성되었습니다.\n생성 시간: ${new Date().toISOString()}`,
      source: `테스트 - ${title}`
    };
  }
}