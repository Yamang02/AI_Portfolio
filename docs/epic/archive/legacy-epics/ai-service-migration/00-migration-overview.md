# AI Service Migration - 전체 개요

## 🎯 마이그레이션 목표

기존 `AI_PortFolio` 프로젝트에서 AI 서비스 관련 요소를 `AI_portfolio_agent` 프로젝트로 분리하여:
1. **웹서비스 운영에 무관한 코드 제거** - 프로젝트 경량화
2. **의존성 및 라이브러리 정리** - 불필요한 의존성 제거
3. **명확한 책임 분리** - AI 서비스는 독립 배포

## 📊 현재 상황

### AI_PortFolio (메인 웹서비스)
```
✅ 운영 중인 서비스:
- Frontend (React + Vite)
- Backend (Spring Boot)
- PostgreSQL, Redis

❌ 사용되지 않는 요소:
- ai-service/ 디렉토리 전체
- AIServiceClient.java (데드 코드)
- Qdrant Vector DB
- 일부 AI 관련 의존성
```

### AI_portfolio_agent (신규 독립 프로젝트)
```
✅ 준비된 인프라:
- FastAPI + LangGraph
- Hexagonal Architecture
- Docker + docker-compose
- GitHub Actions (Cloud Run 배포)
- Qdrant, Redis, PostgreSQL

⏳ 마이그레이션 대상:
- ai-service/demo → demo/
- HuggingFace 배포 워크플로우
```

## 🗂️ 마이그레이션 범위

### Phase 1: 분석 및 준비 (현재 단계)
- [x] 현재 상황 파악
- [ ] 의존성 분석
- [ ] 마이그레이션 상세 계획 수립
- [ ] 체크리스트 작성

### Phase 2: AI Service 이동
- [ ] ai-service/demo → AI_portfolio_agent/demo
- [ ] ai-service/common → AI_portfolio_agent/common
- [ ] GitHub Workflow 이동 및 수정
- [ ] 테스트 환경 검증

### Phase 3: AI_PortFolio 정리
- [ ] ai-service/ 디렉토리 삭제
- [ ] 데드 코드 제거 (AIServiceClient.java 등)
- [ ] 의존성 정리
- [ ] docker-compose.yml 정리

### Phase 4: 통합 테스트
- [ ] 웹서비스 정상 작동 확인
- [ ] AI Agent 독립 배포 확인
- [ ] Demo HuggingFace 배포 확인

### Phase 5: 문서화
- [ ] 마이그레이션 완료 보고서
- [ ] 새로운 아키텍처 문서
- [ ] 배포 가이드 업데이트

## 📁 문서 구조

```
docs/ai-service-migration/
├── 00-migration-overview.md          # 전체 개요 (현재 문서)
├── 01-dependency-analysis.md         # 의존성 분석
├── 02-code-removal-checklist.md      # 제거할 코드 체크리스트
├── 03-migration-steps.md             # 마이그레이션 단계별 가이드
├── 04-testing-guide.md               # 테스트 가이드
└── 05-rollback-plan.md               # 롤백 계획
```

## ⚠️ 주의사항

### 운영 서비스 영향 최소화
- 현재 운영 중인 웹서비스에 영향 없도록 순차 진행
- 백업 우선 (Git commit/branch 활용)
- 단계별 검증 필수

### 롤백 가능성 유지
- 각 단계마다 Git commit
- 중요 파일 백업
- 문제 발생 시 즉시 롤백 가능하도록 준비

## 📅 예상 일정

| Phase | 예상 소요 시간 | 비고 |
|-------|---------------|------|
| Phase 1 | 1-2시간 | 분석 및 계획 |
| Phase 2 | 2-3시간 | 파일 이동 및 설정 |
| Phase 3 | 1-2시간 | 정리 작업 |
| Phase 4 | 1-2시간 | 통합 테스트 |
| Phase 5 | 1시간 | 문서화 |
| **총계** | **6-10시간** | 안전하게 진행 시 |

## 🎯 성공 기준

### 필수 조건
- [x] AI_PortFolio 웹서비스 정상 작동
- [ ] AI_portfolio_agent 독립 배포 성공
- [ ] Demo HuggingFace 배포 성공
- [ ] 불필요한 의존성 제거 완료

### 선택 조건
- [ ] Backend ↔ AI Agent 통신 연결
- [ ] 통합 문서 완성
- [ ] CI/CD 파이프라인 검증

## 📝 다음 단계

1. **의존성 분석** (`01-dependency-analysis.md`)
   - Backend 의존성 점검
   - Frontend 의존성 점검
   - Docker 설정 검토

2. **제거 대상 식별** (`02-code-removal-checklist.md`)
   - 파일/디렉토리 목록
   - 코드 라인 레벨 체크리스트
   - 설정 파일 수정사항

3. **마이그레이션 실행** (`03-migration-steps.md`)
   - 단계별 명령어
   - 검증 스크립트
   - 트러블슈팅 가이드

---

**작성일**: 2025-01-29
**최종 업데이트**: 2025-01-29
**담당**: AI Agent (Claude)
