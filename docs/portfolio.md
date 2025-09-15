# AI Portfolio Chatbot - 포트폴리오 프로젝트

## 🎯 프로젝트 개요
AI 챗봇이 통합된 개발자 포트폴리오 사이트로, 방문자들이 자연어로 프로젝트에 대해 질문할 수 있는 웹 애플리케이션입니다.

## 🚀 핵심 기능
- **AI Agent API**: Google Gemini API 기반 자연어 처리
- **GitHub API 연동**: 동적 프로젝트 정보 수집 및 캐싱
- **Cloud Run 배포**: 서버리스 아키텍처 및 CI/CD 파이프라인
- **하이브리드 데이터**: GitHub API + 로컬 데이터 관리

## 🛠 기술 스택
- **프론트엔드**: React 19.1.0, TypeScript, Tailwind CSS, Vite
- **백엔드**: Spring Boot 3.x, LangChain4j, 헥사고날 아키텍처
- **AI/API**: Google Gemini API, GitHub REST API
- **인프라**: Google Cloud Run, Docker, GitHub Actions

## 📊 주요 성과
- **AI 통합**: 프롬프트 엔지니어링, 컨텍스트 관리, 에러 처리
- **동적 데이터**: GitHub API 연동, 24시간 캐싱, 폴백 메커니즘
- **서버리스**: 자동 스케일링, 멀티스테이지 빌드, 보안 설정
- **UI/UX**: 프로젝트 타입 구분, 필터링, 반응형 디자인

## 🔧 아키텍처
- **프론트엔드**: FSD (Feature-Sliced Design)
- **백엔드**: 헥사고날 아키텍처 (포트 & 어댑터 패턴)
- **데이터**: 하이브리드 소스 (GitHub API + 로컬 JSON)
- **배포**: Cloud Run 서버리스 컨테이너