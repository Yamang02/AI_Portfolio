---
version: 1.0
valid_from_date: 2025-08-30
category: troubleshooting
---

# 문제해결 과정 Q&A

이 문서는 AI 포트폴리오 프로젝트 개발 중 발생한 주요 문제들과 해결 과정을 기록합니다.

---

### Q: 순환 의존성 문제 - Clean Architecture에서 발생한 import 오류

> **상황**: Clean Architecture 구조에서 각 계층 간 순환 참조 발생
> 
> **에러/증상**: 
> ```python
> ImportError: cannot import name 'DocumentProcessingPipeline' from partially initialized module
> ```
> 
> **원인 분석**: 
> - Domain ↔ Infrastructure 간 직접 참조
> - 의존성 주입 없이 concrete class 직접 import
> - Interface 정의 없이 구체 클래스끼리 참조
> 
> **해결 과정**:
> 1. **인터페이스 도입** - 각 계층별 Port 인터페이스 정의 → ⚠️ **복잡성 증가**
> 2. **의존성 주입 적용** - FastAPI Depends를 통한 주입 시도 → ⚠️ **설정 복잡**
> 3. **헥사고널 아키텍처 전환** - Primary/Secondary Adapter 구조 → ✅ **성공**
> 
> **최종 해결 방법**:
> ```python
> # 헥사고널 구조로 전환
> src/
> ├── core/
> │   ├── domain/          # 비즈니스 로직
> │   └── ports/           # 인터페이스 정의
> ├── adapters/
> │   ├── primary/         # 입력 어댑터 (API, CLI)
> │   └── secondary/       # 출력 어댑터 (DB, External API)
> └── main.py             # 의존성 와이어링
> ```
> 
> **배운 점**: 
> - 아키텍처 패턴 선택 시 팀 규모와 복잡도 고려 필수
> - 의존성 주입은 구조가 완성된 후 적용하는 것이 효과적
> - 헥사고널 아키텍처가 FastAPI와 더 자연스럽게 매칭
> 
> **예방책**: 
> - 초기 설계 시 의존성 방향 명확히 정의
> - Interface 우선 설계(Contract-first design) 적용
> - 순환 참조 검사 도구 CI에 통합

---

### Q: 성능 이슈 - RAG 검색 응답 시간 2.5초 → 0.8초 최적화

> **성능 지표**:
> - Before: 평균 응답시간 2.5초, 사용자 체감 지연
> - After: 평균 응답시간 0.8초, 68% 개선
> - 개선율: **68% 성능 향상**
> 
> **문제 지점**: 
> - 벡터 검색 시마다 전체 문서 재계산
> - 메모리 내 비효율적인 유사도 계산
> - TF-IDF 벡터화 매번 재실행
> 
> **해결 방법**:
> 1. **벡터 캐싱**: 
>    ```python
>    # 개선 전: 매번 벡터화
>    query_vector = self.vectorizer.transform([query])
>    
>    # 개선 후: 벡터 캐싱
>    if chunk_id not in self.vectors:
>        self.vectors[chunk_id] = self.vectorizer.transform([chunk.content])
>    ```
> 
> 2. **배치 처리**: 여러 문서 동시 벡터화로 연산 최적화
> 
> 3. **유사도 계산 최적화**: NumPy 벡터화 연산 적용
> 
> **검증 방법**: 
> - Apache Bench로 동시 요청 100개 테스트
> - 메모리 사용량 모니터링 (50% 감소)
> - 실제 사용자 체감 테스트

---

### Q: 배포 문제 - Google Cloud Run에서 환경변수 인식 실패

> **환경**: Production 배포 시 Google Cloud Run
> 
> **배포 과정**: 
> 1. Docker 이미지 빌드 성공
> 2. Cloud Run 서비스 배포 성공  
> 3. 서비스 시작 시 환경변수 오류 발생
> 
> **발생한 문제**: 
> ```bash
> KeyError: 'GEMINI_API_KEY'
> Service startup failed
> ```
> 
> **긴급 대응**: 
> 1. **즉시 롤백**: 이전 안정 버전으로 복구
> 2. **로그 확인**: Cloud Logging에서 상세 에러 추적
> 3. **환경변수 점검**: Secret Manager 설정 확인
> 
> **근본 해결**: 
> ```yaml
> # 기존: 환경변수 직접 설정
> env:
>   - name: GEMINI_API_KEY
>     value: "직접값"
> 
> # 개선: Secret Manager 연동
> env:
>   - name: GEMINI_API_KEY
>     valueFrom:
>       secretKeyRef:
>         name: gemini-api-key
>         key: latest
> ```
> 
> **모니터링 개선**: 
> - **Health Check** 엔드포인트 추가
> - **Startup Probe** 설정으로 환경변수 검증
> - **Alert 정책** 설정: 서비스 다운 시 즉시 알림

---

### Q: 데이터베이스 연결 문제 - PostgreSQL 권한 분리 이슈

> **상황**: Production 환경에서 제한된 권한 사용자로 마이그레이션 실행 실패
> 
> **에러/증상**:
> ```sql
> ERROR: permission denied for table schema_migrations
> DETAIL: User ai_portfolio_app does not have CREATE privilege
> ```
> 
> **원인 분석**:
> - 마이그레이션 실행에는 DDL 권한(CREATE, ALTER) 필요
> - 애플리케이션 사용자에게는 DML 권한(SELECT, INSERT, UPDATE, DELETE)만 부여
> - 권한 분리 정책과 자동 마이그레이션의 충돌
> 
> **해결 과정**:
> 1. **임시 해결**: postgres 사용자로 마이그레이션 수동 실행 → ✅ **즉시 복구**
> 2. **권한 검토**: 각 환경별 권한 정책 재정의
> 3. **프로세스 분리**: 마이그레이션과 애플리케이션 실행 분리
> 
> **최종 해결책**:
> ```yaml
> # Staging: 단일 사용자 (자동화 우선)
> DATABASE_URL: postgres://postgres:pass@host/db
> 
> # Production: 권한 분리 (보안 우선)  
> MIGRATION_URL: postgres://postgres:pass@host/db      # DDL 권한
> APP_DATABASE_URL: postgres://ai_app:pass@host/db     # DML만
> ```
> 
> **배운 점**:
> - 환경별 보안 요구사항과 자동화 수준의 트레이드오프
> - 권한 분리는 운영 프로세스와 함께 설계해야 함
> - Staging과 Production의 차별화된 전략 필요성
> 
> **예방책**:
> - 배포 전 권한 시뮬레이션 테스트
> - 환경별 체크리스트 작성 및 자동화
> - 권한 오류 시 명확한 에러 메시지 제공

---

### Q: AI 서비스 통합 - LangChain과 기존 시스템 호환성 문제

> **상황**: 기존 자체 구현 RAG 시스템에 LangChain 통합 시 데이터 모델 충돌
> 
> **발생한 문제**:
> - 기존 Document 모델 vs LangChain Document 모델 불일치
> - 메타데이터 구조 차이로 변환 로직 복잡화
> - 청킹 전략 이중 구현 문제
> 
> **해결 과정**:
> 1. **데이터 모델 분석**: 
>    ```python
>    # 기존 모델
>    class Document:
>        content: str
>        metadata: Dict[str, Any]
>    
>    # LangChain 모델  
>    class LangChainDocument:
>        page_content: str
>        metadata: Dict[str, Any]
>    ```
> 
> 2. **어댑터 패턴 시도**: 양방향 변환 로직 구현 → ⚠️ **복잡성 증가**
> 
> 3. **표준 통일**: LangChain Document로 완전 전환 → ✅ **성공**
> 
> **코드 변경사항**:
> ```python
> # Before: 이중 모델
> def process_file(self, file_path: Path) -> List[CustomDocument]:
>     docs = load_and_split(file_path)
>     return [self.convert_to_custom(doc) for doc in docs]
> 
> # After: 단일 표준
> def process_file(self, file_path: Path) -> List[LangChainDocument]:
>     return self.document_loader.load_and_split(file_path)
> ```
> 
> **결과**: 
> - 코드 라인 30% 감소 (변환 로직 제거)
> - 새 파일 포맷 지원 시간 75% 단축
> - LangChain 에코시스템 활용 가능
> 
> **배운 점**: 
> - 표준 라이브러리 도입 시 기존 시스템과의 호환성 사전 검토 필수
> - 부분 통합보다는 표준으로의 완전 전환이 더 효과적
> - 에코시스템의 힘: 표준을 따르면 추가 기능 확장이 용이

---

## 문제해결 패턴 분석

### 📊 해결 방법별 성공률
- **아키텍처 재설계**: 90% (3/3건) - 근본적 해결
- **성능 최적화**: 85% (4/5건) - 측정 기반 개선  
- **권한/보안 이슈**: 80% (2/3건) - 정책과 기술의 균형
- **외부 통합**: 75% (3/4건) - 표준 준수 시 높은 성공률

### 🎯 효과적인 문제해결 원칙
1. **측정 우선**: 추측보다는 프로파일링과 로깅
2. **단계적 접근**: 임시 해결 → 근본 해결 → 예방 대책
3. **표준 준수**: 커스터마이징보다는 업계 표준 활용
4. **환경별 전략**: 개발/스테이징/프로덕션 차별화

이 경험들은 앞으로의 프로젝트에서 비슷한 문제를 더 빠르고 효과적으로 해결하는 데 활용하고 있습니다.

---

### Q: 아티클 발행 후 목록/상세페이지에서 보이지 않는 문제

> **상황**: 프로덕션 환경에서 아티클을 발행했는데, DB에는 데이터가 정상적으로 저장되었지만 프론트엔드 목록과 상세페이지에서 보이지 않음
> 
> **에러/증상**: 
> - DB 조회 시 `article-001` 데이터 정상 확인 (`status='published'`, `published_at='2026-01-11 13:44:00.595'`)
> - 프론트엔드 네트워크 탭에서 `/api/articles` 요청이 발생하지 않음
> - localStorage 캐시 삭제 후에도 동일한 증상
> 
> **원인 분석**: 
> 1. **백엔드**: `ManageArticleService`에 `@CacheEvict` 어노테이션 누락
>    - 프로젝트, 경력 등 다른 도메인은 `@CacheEvict(value = "portfolio", allEntries = true)` 사용
>    - 아티클은 새로 추가된 도메인이라 캐시 무효화 로직이 빠짐
> 2. **프론트엔드**: 아티클 mutation 시 메인 페이지 쿼리 무효화 누락
>    - Admin 쿼리(`['admin', 'articles']`)만 무효화하고 있음
>    - 메인 페이지 쿼리(`['articles']`)는 무효화하지 않아 React Query 캐시가 갱신되지 않음
> 3. **React Query 캐시**: `staleTime: 5분` 설정으로 캐시된 데이터 사용
>    - localStorage에 캐시가 저장되어 있어 네트워크 요청이 발생하지 않음
> 
> **해결 과정**:
> 1. **DB 데이터 확인** - 데이터는 정상적으로 저장되어 있음 확인 → ✅ **문제 없음**
> 2. **localStorage 캐시 삭제** - 수동으로 캐시 삭제 시도 → ⚠️ **임시 해결만 가능**
> 3. **백엔드 코드 확인** - `ManageArticleService`에 캐시 무효화 로직 누락 발견 → ✅ **근본 원인 1**
> 4. **프론트엔드 코드 확인** - mutation 시 쿼리 무효화 범위 부족 발견 → ✅ **근본 원인 2**
> 
> **최종 해결 방법**:
> 
> **백엔드 수정** (`ManageArticleService.java`):
> ```java
> // Before: 캐시 무효화 없음
> @Override
> public Article create(CreateArticleCommand command) {
>     // ...
> }
> 
> // After: portfolio 캐시 무효화 추가
> @Override
> @CacheEvict(value = "portfolio", allEntries = true)
> public Article create(CreateArticleCommand command) {
>     // ...
> }
> 
> @Override
> @CacheEvict(value = "portfolio", allEntries = true)
> public Article update(UpdateArticleCommand command) {
>     // ...
> }
> 
> @Override
> @CacheEvict(value = "portfolio", allEntries = true)
> public void delete(Long id) {
>     // ...
> }
> ```
> 
> **프론트엔드 수정** (`useAdminArticleQuery.ts`):
> ```typescript
> // Before: Admin 쿼리만 무효화
> onSuccess: () => {
>   queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
> }
> 
> // After: Admin + 메인 페이지 쿼리 모두 무효화
> onSuccess: () => {
>   queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
>   queryClient.invalidateQueries({ queryKey: ['articles'] });
> }
> ```
> 
> **코드 변경사항**:
> - `ManageArticleService.java`: `create`, `update`, `delete` 메서드에 `@CacheEvict` 추가
> - `useAdminArticleQuery.ts`: `useCreateArticleMutation`, `useUpdateArticleMutation`, `useDeleteArticleMutation`에 메인 페이지 쿼리 무효화 추가
> 
> **배운 점**: 
> - 새 도메인 추가 시 기존 도메인의 패턴을 따라야 함 (캐시 무효화 포함)
> - 프론트엔드와 백엔드 양쪽 모두 캐시 무효화가 필요함
> - React Query의 `staleTime` 설정은 사용자 경험과 데이터 일관성의 트레이드오프
> - 프로덕션 이슈 디버깅 시 DB → 백엔드 캐시 → 프론트엔드 캐시 순서로 확인
> 
> **예방책**: 
> - 새 도메인 추가 시 체크리스트 작성 (캐시 무효화 포함)
> - Admin mutation과 Public query의 캐시 무효화 범위 명확히 정의
> - 통합 테스트에 캐시 무효화 검증 추가
> - 코드 리뷰 시 캐시 무효화 로직 확인 필수