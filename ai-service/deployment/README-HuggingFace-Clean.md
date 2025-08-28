---
title: AI Portfolio RAG Pipeline Demo
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 5.44.0
app_file: app.py
pinned: false
header: mini
short_description: Clean Architecture based RAG system demonstration
---

# 🤖 AI Portfolio - RAG Pipeline Demo

Clean Architecture 기반 RAG(Retrieval-Augmented Generation) 시스템의 완전한 데모입니다.

## ✨ 주요 기능

### 📄 Document Processing
- **파일 업로드**: `.txt`, `.md`, `.json` 파일 지원
- **Clean Architecture Pipeline**: Domain-Application-Infrastructure 계층 분리
- **LangChain 표준**: 일관된 Document 모델 사용
- **실시간 처리**: 비동기 문서 처리 및 청크 분할

### 🔍 Vector Search
- **실제 임베딩**: sentence-transformers 기반 벡터 생성
- **코사인 유사도**: 정확한 유사도 계산
- **실시간 검색**: 메모리 기반 고속 검색
- **상세 결과**: 유사도 점수와 메타데이터 제공

### 🤖 RAG Generation  
- **컨텍스트 검색**: 관련 문서 자동 검색
- **답변 생성**: 검색된 컨텍스트 기반 답변
- **소스 추적**: 답변 근거 문서 제공
- **성능 모니터링**: 처리 시간 및 통계 표시

## 🏗️ Clean Architecture

이 데모는 완전한 Clean Architecture로 구현되었습니다:

```
📁 Architecture
├── presentation/     # UI Controllers (Gradio)
├── application/      # Use Cases (RAG, Chat)  
├── domain/          # Business Logic & Entities
└── infrastructure/  # External Systems (Vector Store, LLM)
```

### 핵심 설계 원칙
- **의존성 역전**: Domain이 중심, Infrastructure가 구현
- **관심사 분리**: 각 계층의 명확한 책임
- **테스트 용이성**: 계층별 독립 테스트 가능
- **확장성**: 새 기능 추가 시 기존 코드 영향 최소

## 🚀 기술 스택

- **Backend**: FastAPI + AsyncIO
- **UI**: Gradio 5.44.0
- **Vector Processing**: sentence-transformers
- **Document Processing**: LangChain
- **Vector Store**: In-Memory (Production: Qdrant)
- **LLM**: Mock Service (Production: Gemini)

## 📊 체험 가이드

1. **문서 업로드**: 샘플 파일을 업로드하거나 직접 텍스트 입력
2. **벡터 검색**: 키워드로 유사 문서 검색 체험
3. **RAG 생성**: 질문을 입력해 AI 답변 생성 확인
4. **시스템 모니터링**: 처리 성능과 저장소 상태 확인

## 💡 실제 포트폴리오 적용

이 데모의 Clean Architecture 구조는 실제 AI Portfolio 서비스에서 활용됩니다:
- 포트폴리오 문서 자동 인덱싱
- 사용자 질문에 대한 정확한 답변 제공
- 프로젝트별 상세 정보 검색
- 기술 스택 및 경험 질의응답

---

🔗 **GitHub**: [AI_Portfolio](https://github.com/user/AI_Portfolio)
🌐 **Live Demo**: [Portfolio Website](https://ai-portfolio.com)

Built with ❤️ using Clean Architecture principles