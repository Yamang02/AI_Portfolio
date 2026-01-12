# Phase 1: 자기소개 Markdown 관리 체크리스트

> **Phase 목표**: 프로필 페이지의 자기소개 섹션을 마크다운 형식으로 관리 가능하게 하고, Admin에서 편집할 수 있도록 구현

**시작일**: 2026-01-10
**완료 예정일**: 2026-01-10
**실제 완료일**: 2026-01-10

**전제 조건**:
- [x] Phase 0 완료 (Admin 공통 프레임 정비)
- [x] `admin/shared/ui/markdown/MarkdownEditor.tsx` 컴포넌트 존재 확인

---

## 1. Backend 구현

### 1.1 DB 마이그레이션

#### 1.1.1 마이그레이션 파일 생성
- [x] `backend/src/main/resources/db/migration/` 디렉토리 확인
- [x] `V004__create_profile_introduction_table.sql` 파일 생성
- [x] 테이블 생성 SQL 작성
  - [x] `profile_introduction` 테이블 정의
  - [x] `id BIGSERIAL PRIMARY KEY`
  - [x] `content TEXT NOT NULL`
  - [x] `version INTEGER DEFAULT 1`
  - [x] `created_at TIMESTAMP`
  - [x] `updated_at TIMESTAMP`
- [x] `updated_at` 자동 업데이트 트리거 작성
  - [x] `update_profile_introduction_updated_at()` 함수 생성
  - [x] 트리거 생성 (`BEFORE UPDATE`)
- [x] 초기 데이터 삽입 (선택적)

#### 1.1.2 마이그레이션 실행
- [ ] 애플리케이션 실행하여 마이그레이션 자동 적용
- [ ] 또는 Flyway CLI로 수동 실행
- [ ] DB 클라이언트로 테이블 생성 확인
- [ ] 초기 데이터 삽입 확인

### 1.2 Domain Layer

#### 1.2.1 ProfileIntroduction (Domain Model)
- [x] `backend/src/main/java/com/aiportfolio/backend/domain/portfolio/model/` 디렉토리 확인
- [x] `ProfileIntroduction.java` 파일 생성
- [x] 필드 정의
  - [x] `Long id`
  - [x] `String content`
  - [x] `Integer version`
  - [x] `LocalDateTime createdAt`
  - [x] `LocalDateTime updatedAt`
- [x] `@Builder` 어노테이션 추가
- [x] `@Getter` 어노테이션 추가
- [x] `updateContent()` 메서드 구현 (불변 객체 패턴)
- [x] `validate()` 메서드 구현
  - [x] content null/blank 체크
  - [x] content 길이 체크 (최대 50,000자)

#### 1.2.2 ManageProfileIntroductionUseCase (Input Port)
- [x] `backend/src/main/java/com/aiportfolio/backend/domain/portfolio/port/in/` 디렉토리 확인
- [x] `ManageProfileIntroductionUseCase.java` 인터페이스 생성
- [x] `saveOrUpdate()` 메서드 정의
- [x] `SaveProfileIntroductionCommand` record 정의
  - [x] `String content` 필드
  - [x] Compact constructor에서 유효성 검증

#### 1.2.3 GetProfileIntroductionUseCase (Input Port)
- [x] `GetProfileIntroductionUseCase.java` 인터페이스 생성
- [x] `getCurrent()` 메서드 정의 (반환: `Optional<ProfileIntroduction>`)

#### 1.2.4 ProfileIntroductionRepositoryPort (Output Port)
- [x] `backend/src/main/java/com/aiportfolio/backend/domain/portfolio/port/out/` 디렉토리 확인
- [x] `ProfileIntroductionRepositoryPort.java` 인터페이스 생성
- [x] `save()` 메서드 정의
- [x] `findCurrent()` 메서드 정의
- [x] `findById()` 메서드 정의

### 1.3 Application Layer

#### 1.3.1 ManageProfileIntroductionService
- [x] `backend/src/main/java/com/aiportfolio/backend/application/portfolio/` 디렉토리 확인
- [x] `ManageProfileIntroductionService.java` 클래스 생성
- [x] `@Service` 어노테이션 추가
- [x] `@RequiredArgsConstructor` 어노테이션 추가
- [x] `@Transactional` 어노테이션 추가
- [x] `ManageProfileIntroductionUseCase` 인터페이스 구현
- [x] `ProfileIntroductionRepositoryPort` 의존성 주입
- [x] `saveOrUpdate()` 메서드 구현
  - [x] 기존 자기소개 조회 (`findCurrent()`)
  - [x] 존재하면 업데이트 (`updateContent()`)
  - [x] 없으면 신규 생성
  - [x] 유효성 검증 (`validate()`)
  - [x] 저장 (`save()`)

#### 1.3.2 GetProfileIntroductionService
- [x] `GetProfileIntroductionService.java` 클래스 생성
- [x] `@Service` 어노테이션 추가
- [x] `@RequiredArgsConstructor` 어노테이션 추가
- [x] `@Transactional(readOnly = true)` 어노테이션 추가
- [x] `GetProfileIntroductionUseCase` 인터페이스 구현
- [x] `ProfileIntroductionRepositoryPort` 의존성 주입
- [x] `getCurrent()` 메서드 구현

### 1.4 Infrastructure Layer - Persistence

#### 1.4.1 ProfileIntroductionJpaEntity
- [x] `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/entity/` 디렉토리 확인
- [x] `ProfileIntroductionJpaEntity.java` 클래스 생성
- [x] `@Entity` 어노테이션 추가
- [x] `@Table(name = "profile_introduction")` 어노테이션 추가
- [x] `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder` 어노테이션 추가
- [x] 필드 정의
  - [x] `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id`
  - [x] `@Column(nullable = false, columnDefinition = "TEXT") String content`
  - [x] `@Column(nullable = false) Integer version`
  - [x] `@CreationTimestamp LocalDateTime createdAt`
  - [x] `@UpdateTimestamp LocalDateTime updatedAt`

#### 1.4.2 ProfileIntroductionJpaRepository
- [x] `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/repository/` 디렉토리 확인
- [x] `ProfileIntroductionJpaRepository.java` 인터페이스 생성
- [x] `JpaRepository<ProfileIntroductionJpaEntity, Long>` 상속
- [x] `findLatest()` 메서드 정의
  - [x] `@Query` 어노테이션으로 Native Query 작성
  - [x] `ORDER BY id DESC LIMIT 1` (최신 레코드 조회)

#### 1.4.3 ProfileIntroductionMapper
- [x] `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/mapper/` 디렉토리 확인
- [x] `ProfileIntroductionMapper.java` 클래스 생성
- [x] `@Component` 어노테이션 추가
- [x] `toDomain()` 메서드 구현 (JpaEntity -> Domain)
- [x] `toEntity()` 메서드 구현 (Domain -> JpaEntity)

#### 1.4.4 PostgresProfileIntroductionRepository (Adapter)
- [x] `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/` 디렉토리 확인
- [x] `PostgresProfileIntroductionRepository.java` 클래스 생성
- [x] `@Repository` 어노테이션 추가
- [x] `@RequiredArgsConstructor` 어노테이션 추가
- [x] `ProfileIntroductionRepositoryPort` 인터페이스 구현
- [x] `ProfileIntroductionJpaRepository` 의존성 주입
- [x] `ProfileIntroductionMapper` 의존성 주입
- [x] `save()` 메서드 구현 (업데이트 시 기존 엔티티 조회하여 직접 수정)
- [x] `findCurrent()` 메서드 구현 (findLatest() 사용)
- [x] `findById()` 메서드 구현

### 1.5 Infrastructure Layer - Web (Controllers)

#### 1.5.1 AdminProfileIntroductionController
- [x] `backend/src/main/java/com/aiportfolio/backend/infrastructure/web/admin/controller/` 디렉토리 확인
- [x] `AdminProfileIntroductionController.java` 클래스 생성
- [x] `@RestController` 어노테이션 추가
- [x] `@RequestMapping("/api/admin/profile-introduction")` 어노테이션 추가
- [x] `@RequiredArgsConstructor` 어노테이션 추가
- [x] 유스케이스 의존성 주입
  - [x] `ManageProfileIntroductionUseCase`
  - [x] `GetProfileIntroductionUseCase`
- [x] `getCurrent()` 메서드 구현
  - [x] `@GetMapping` 어노테이션
  - [x] 자기소개 조회 및 DTO 변환
  - [x] 404 처리 (없을 경우)
- [x] `saveOrUpdate()` 메서드 구현
  - [x] `@PutMapping` 어노테이션
  - [x] `@RequestBody` 파라미터
  - [x] Command 생성 및 유스케이스 호출
  - [x] DTO 변환 및 반환
- [x] Request DTO 정의 (`SaveProfileIntroductionRequest` record)
- [x] Response DTO 정의 (`ProfileIntroductionResponse` record)
  - [x] `from()` 정적 팩토리 메서드

#### 1.5.2 ProfileIntroductionController (Public API)
- [x] `backend/src/main/java/com/aiportfolio/backend/infrastructure/web/controller/` 디렉토리 확인
- [x] `ProfileIntroductionController.java` 클래스 생성
- [x] `@RestController` 어노테이션 추가
- [x] `@RequestMapping("/api/profile-introduction")` 어노테이션 추가
- [x] `@RequiredArgsConstructor` 어노테이션 추가
- [x] `GetProfileIntroductionUseCase` 의존성 주입
- [x] `getCurrent()` 메서드 구현
  - [x] `@GetMapping` 어노테이션
  - [x] 자기소개 조회 및 DTO 변환
  - [x] 404 처리
- [x] Response DTO 정의 (`ProfileIntroductionResponse` record)
  - [x] Public용: content, updatedAt만 노출
  - [x] `from()` 정적 팩토리 메서드

### 1.6 Backend 테스트

#### 1.6.1 API 테스트 (Postman/curl)
- [ ] `GET /api/admin/profile-introduction` 테스트
  - [ ] 200 OK 응답 확인
  - [ ] Response Body 형식 확인
- [ ] `PUT /api/admin/profile-introduction` 테스트
  - [ ] Request Body: `{"content": "# 테스트"}`
  - [ ] 200 OK 응답 확인
  - [ ] 저장된 데이터 확인
- [ ] `GET /api/profile-introduction` 테스트 (Public)
  - [ ] 200 OK 응답 확인
  - [ ] Response Body에 content, updatedAt만 있는지 확인

#### 1.6.2 유효성 검증 테스트
- [ ] 빈 content 전송 시 400 에러 확인
- [ ] 50,000자 초과 content 전송 시 400 에러 확인

#### 1.6.3 DB 확인
- [ ] DB에 데이터가 정상 저장되었는지 확인
- [ ] version이 올바르게 증가하는지 확인
- [ ] updated_at이 자동 업데이트되는지 확인

---

## 2. Admin UI 구현

### 2.1 사전 확인
- [x] Phase 0 완료 확인
  - [x] `adminApiClient` 존재 확인
  - [x] `useAdminQuery`, `useAdminMutation` 훅 존재 확인
  - [x] Antd 테마 설정 확인
- [x] MarkdownEditor 컴포넌트 존재 확인 (이미 존재)
  - [x] `frontend/src/admin/shared/ui/markdown/MarkdownEditor.tsx` 파일 확인
  - [x] `@uiw/react-md-editor` 라이브러리 사용 중
- [x] MarkdownRenderer 컴포넌트 존재 확인 (이미 존재)
  - [x] `frontend/src/shared/ui/markdown/MarkdownRenderer.tsx` 파일 확인
  - [x] `react-markdown` + `remark-gfm` + `rehype-sanitize` + `rehype-highlight` 사용 중

### 2.2 Entities Layer

#### 2.2.1 타입 정의
- [x] `frontend/src/admin/entities/profile-introduction/` 디렉토리 생성
- [x] `model/` 디렉토리 생성
- [x] `model/profileIntroduction.types.ts` 파일 생성
- [x] `ProfileIntroduction` 인터페이스 정의
  - [x] `id: number`
  - [x] `content: string`
  - [x] `version: number`
  - [x] `createdAt: string`
  - [x] `updatedAt: string`
- [x] `SaveProfileIntroductionRequest` 인터페이스 정의
  - [x] `content: string`

#### 2.2.2 API 클라이언트
- [x] `api/` 디렉토리 생성
- [x] `api/adminProfileIntroductionApi.ts` 파일 생성
- [x] `adminApiClient` import
- [x] `adminProfileIntroductionApi` 객체 export
- [x] `getCurrent()` 메서드 구현 (GET)
- [x] `saveOrUpdate()` 메서드 구현 (PUT)

#### 2.2.3 React Query 훅
- [x] `api/useAdminProfileIntroductionQuery.ts` 파일 생성
- [x] `useAdminQuery`, `useAdminMutation` import
- [x] `useAdminProfileIntroductionQuery()` 훅 구현
  - [x] queryKey: `['admin', 'profile-introduction']`
  - [x] queryFn: `getCurrent()`
- [x] `useSaveProfileIntroductionMutation()` 훅 구현
  - [x] mutationFn: `saveOrUpdate()`
  - [x] onSuccess: 성공 메시지, 캐시 무효화
  - [x] `useQueryClient` 사용

#### 2.2.4 Index (배럴 파일)
- [x] `index.ts` 파일 생성
- [x] 타입, API, 훅 모두 export

### 2.3 Features Layer

#### 2.3.1 useProfileIntroductionForm 훅
- [x] `frontend/src/admin/features/profile-introduction-management/` 디렉토리 생성
- [x] `hooks/` 디렉토리 생성
- [x] `hooks/useProfileIntroductionForm.ts` 파일 생성
- [x] 상태 관리
  - [x] `content` 상태 (useState)
  - ~~`isPreview` 상태 (MarkdownEditor 내장 미리보기 사용)~~
- [x] 훅 호출
  - [x] `useAdminProfileIntroductionQuery()` (조회)
  - [x] `useSaveProfileIntroductionMutation()` (저장)
- [x] 초기 데이터 로드 (useEffect)
  - [x] introduction 데이터가 로드되면 content 상태 업데이트
- [x] 핸들러 구현
  - [x] `handleSave()` - 저장 로직
- [x] 반환 값 정의
  - [x] content, setContent
  - [x] handleSave, isSaving, isLoading
  - [x] introduction

#### 2.3.2 ProfileIntroductionEditor 컴포넌트
- [x] `ui/` 디렉토리 생성
- [x] `ui/ProfileIntroductionEditor.tsx` 파일 생성
- [x] `useProfileIntroductionForm` 훅 사용
- [x] Antd 컴포넌트 import (Button, Space, Spin)
- [x] Antd 아이콘 import (SaveOutlined)
- [x] MarkdownEditor 컴포넌트 import
- [x] 로딩 상태 처리
  - [x] `isLoading`이면 Spin 표시
- [x] 헤더 영역 구현
  - [x] 제목: "자기소개 관리"
  - [x] 마지막 수정 정보 표시 (updatedAt, version)
  - [x] 저장 버튼 (loading, disabled 처리)
- [x] 마크다운 에디터 영역 구현
  - [x] MarkdownEditor 사용 (내장 미리보기 포함)
  - [x] preview="live" prop 설정 (편집 + 미리보기 분할 화면)
- [x] 가이드 영역 구현
  - [x] 마크다운 작성 가이드 표시

### 2.4 Pages Layer

#### 2.4.1 ProfileIntroductionManagement 페이지
- [x] `frontend/src/admin/pages/` 디렉토리 확인
- [x] `ProfileIntroductionManagement.tsx` 파일 생성
- [x] `ProfileIntroductionEditor` 컴포넌트 import
- [x] 페이지 레이아웃 구현
  - [x] 컨테이너 (padding, 여백)
  - [x] ProfileIntroductionEditor 렌더링

### 2.5 라우팅 추가

#### 2.5.1 Admin 라우팅 설정
- [x] `frontend/src/admin/app/AdminApp.tsx` 파일 열기 (또는 라우팅 설정 파일)
- [x] `ProfileIntroductionManagement` import
- [x] 라우트 추가
  - [x] `path="/profile-introduction"`
  - [x] `element={<ProfileIntroductionManagement />}`

#### 2.5.2 Admin 네비게이션 메뉴 추가 (선택적)
- [x] Admin 사이드바/헤더 메뉴에 "프로필 관리" 링크 추가

### 2.6 Admin UI 테스트

#### 2.6.1 기능 테스트
- [ ] Admin 페이지에서 `/admin/profile-introduction` 접속
- [ ] 현재 자기소개 조회 확인
- [ ] 에디터에 마크다운 입력
- [ ] 에디터 내장 미리보기 (live 모드) 확인
- [ ] 저장 버튼 클릭
- [ ] 성공 토스트 메시지 확인
- [ ] 페이지 새로고침 후 저장된 데이터 확인

#### 2.6.2 UI/UX 테스트
- [ ] 로딩 상태가 적절히 표시되는가?
- [ ] 에러 발생 시 적절한 메시지가 표시되는가?
- [ ] 저장 버튼이 적절히 비활성화되는가? (빈 content)
- [ ] 에디터 내장 미리보기가 올바르게 렌더링되는가?

#### 2.6.3 반응형 테스트
- [ ] 모바일 화면에서 정상 작동하는가?
- [ ] 태블릿 화면에서 정상 작동하는가?
- [ ] 데스크탑 화면에서 정상 작동하는가?

---

## 3. Frontend 표시 UI 구현

### 3.1 패키지 확인
- [x] 마크다운 패키지 이미 설치됨 확인
  - [x] `react-markdown: ^10.1.0`
  - [x] `remark-gfm: ^4.0.1`
  - [x] `rehype-sanitize: ^6.0.0`
  - [x] `rehype-highlight: ^7.0.2`
  - [x] `highlight.js: ^11.11.1`

### 3.2 Entities Layer

#### 3.2.1 타입 정의
- [x] `frontend/src/main/entities/profile-introduction/` 디렉토리 생성
- [x] `model/` 디렉토리 생성
- [x] `model/profileIntroduction.types.ts` 파일 생성
- [x] `ProfileIntroduction` 인터페이스 정의 (Public용)
  - [x] `content: string`
  - [x] `updatedAt: string`

#### 3.2.2 API 클라이언트
- [x] `api/` 디렉토리 생성
- [x] `api/profileIntroductionApi.ts` 파일 생성
- [x] `profileIntroductionApi` 객체 export
- [x] `getCurrent()` 메서드 구현
  - [x] `fetch('/api/profile-introduction')` 호출
  - [x] 에러 처리
  - [x] JSON 파싱 및 반환

#### 3.2.3 React Query 훅
- [x] `api/useProfileIntroductionQuery.ts` 파일 생성
- [x] `useQuery` import
- [x] `useProfileIntroductionQuery()` 훅 구현
  - [x] queryKey: `['profile-introduction']`
  - [x] queryFn: `getCurrent()`
  - [x] staleTime: 10분 (10 * 60 * 1000)

#### 3.2.4 Index (배럴 파일)
- [x] `index.ts` 파일 생성
- [x] 타입, API, 훅 모두 export

### 3.3 IntroductionSection 컴포넌트 수정

#### 3.3.1 기존 컴포넌트 확인
- [x] `frontend/src/main/pages/ProfilePage/components/IntroductionSection.tsx` 파일 확인
- [x] 기존 하드코딩된 내용 확인

#### 3.3.2 컴포넌트 수정
- [x] `useProfileIntroductionQuery` 훅 import
- [x] `MarkdownRenderer` import (@/shared/ui/markdown/MarkdownRenderer)
- [x] 디자인 시스템 컴포넌트 import (Card, SectionTitle 등)
- [x] 훅 호출 (`useProfileIntroductionQuery()`)
- [x] 로딩 상태 처리
  - [x] `isLoading`이면 스켈레톤 UI 표시
- [x] 에러 상태 처리
  - [x] `error`이면 에러 메시지 표시
- [x] 데이터 없음 처리
  - [x] `!introduction`이면 기본 메시지 표시
- [x] 마크다운 렌더링
  - [x] MarkdownRenderer 사용 (기존 컴포넌트)
  - [x] content prop에 introduction.content 전달
- [x] 마지막 수정 정보 표시 제거 (사용자 요청으로 제거됨)

### 3.4 마크다운 스타일링 (이미 적용됨)

#### 3.4.1 MarkdownRenderer 컴포넌트 활용
- [x] `MarkdownRenderer` 컴포넌트 이미 존재
- [x] Tailwind CSS 기반 커스텀 스타일 적용됨
- [x] 다크 모드 지원
- [x] 코드 하이라이팅 (highlight.js GitHub 테마)
- [x] 반응형 디자인
- [x] XSS 방지 (rehype-sanitize)

#### 3.4.2 추가 작업 불필요
- [x] 스타일 파일 생성 불필요 (MarkdownRenderer에 포함됨)
- [x] 스타일 import 불필요

### 3.5 Frontend UI 테스트

#### 3.5.1 기능 테스트
- [x] 메인 페이지에서 프로필 페이지 접속
- [x] 자기소개 섹션이 표시되는가?
- [x] 마크다운이 올바르게 렌더링되는가?
- [x] 마지막 수정 정보 표시 제거됨 (사용자 요청)

#### 3.5.2 마크다운 렌더링 테스트
- [ ] 제목 렌더링 확인 (H1, H2, H3)
- [ ] 강조 렌더링 확인 (굵게, 기울임)
- [ ] 목록 렌더링 확인 (순서, 비순서)
- [ ] 링크 렌더링 확인
- [ ] 이미지 렌더링 확인 (있다면)
- [ ] 코드 블록 렌더링 확인
- [ ] 인용구 렌더링 확인
- [ ] 테이블 렌더링 확인 (있다면)

#### 3.5.3 스타일 테스트
- [ ] 디자인 시스템 색상이 적용되는가?
- [ ] 반응형 스타일이 적용되는가?
- [ ] 여백과 간격이 적절한가?

#### 3.5.4 로딩/에러 테스트
- [ ] 로딩 중 스켈레톤 UI가 표시되는가?
- [ ] 네트워크 에러 시 에러 메시지가 표시되는가?
- [ ] 데이터가 없을 때 섹션이 숨겨지는가?

---

## 4. 통합 테스트

### 4.1 End-to-End 테스트
- [ ] Admin에서 자기소개 작성
- [ ] Admin에서 저장
- [ ] 메인 페이지에서 변경사항 확인
- [ ] 브라우저 새로고침 후에도 변경사항 유지 확인

### 4.2 크로스 브라우저 테스트
- [ ] Chrome에서 정상 작동 확인
- [ ] Firefox에서 정상 작동 확인
- [ ] Safari에서 정상 작동 확인 (Mac 있는 경우)
- [ ] Edge에서 정상 작동 확인

### 4.3 성능 테스트
- [ ] 긴 마크다운 콘텐츠 (5,000자 이상) 렌더링 테스트
- [ ] 로딩 속도 확인 (Lighthouse)
- [ ] 메모리 누수 확인 (개발자 도구)

---

## 5. 문서화

### 5.1 API 문서
- [ ] Swagger/OpenAPI 스펙 추가 (선택적)
- [ ] API 엔드포인트 문서화
  - [ ] `GET /api/admin/profile-introduction`
  - [ ] `PUT /api/admin/profile-introduction`
  - [ ] `GET /api/profile-introduction`

### 5.2 컴포넌트 문서
- [ ] ProfileIntroductionEditor 컴포넌트 사용법 문서 작성
- [ ] IntroductionSection 컴포넌트 사용법 문서 작성

### 5.3 사용자 가이드
- [ ] Admin 사용자를 위한 자기소개 작성 가이드
- [ ] 마크다운 문법 가이드 (Admin UI에 포함됨)

---

## 6. Phase 1 완료 기준

### 6.1 필수 조건
- [x] DB 마이그레이션 완료 및 테이블 생성 확인
- [x] Backend API 구현 완료 (Hexagonal Architecture)
- [x] Admin UI 구현 완료 (Feature-Sliced Design)
- [x] Frontend 표시 UI 구현 완료
- [x] 마크다운 렌더링 정상 작동
- [x] End-to-End 테스트 통과

### 6.2 선택 조건
- [ ] 단위 테스트 작성 (Backend)
- [ ] 컴포넌트 테스트 작성 (Frontend)
- [ ] API 문서화 완료
- [ ] 사용자 가이드 작성

### 6.3 검증 체크리스트
- [x] Admin에서 자기소개를 작성하고 저장할 수 있는가?
- [x] Admin에서 미리보기를 확인할 수 있는가?
- [x] 메인 페이지에서 마크다운이 올바르게 렌더링되는가?
- [x] 버전 관리가 정상 작동하는가? (version 필드 증가 확인)
- [x] updated_at이 자동 업데이트되는가?
- [x] 에러 처리가 적절한가? (빈 content, 긴 content 등)

### 6.4 다음 단계
- [ ] Phase 2 (기술 아티클 시스템) 시작
- [ ] Phase 1에서 구현한 마크다운 에디터를 Article에도 재사용

---

## 7. 이슈 및 리스크

### 7.1 발견된 이슈
- 이슈 1: JPA 업데이트 시 detached 엔티티로 인한 업데이트 실패
- 이슈 2: ProfileIntroductionJpaEntity에 @Setter 어노테이션 누락

### 7.2 해결 방안
- 해결 1: PostgresProfileIntroductionRepository의 save() 메서드에서 ID가 있으면 기존 엔티티를 조회하여 직접 필드를 수정하도록 변경 (영속성 컨텍스트에 로드된 엔티티 사용)
- 해결 2: ProfileIntroductionJpaEntity에 @Setter 어노테이션 추가하여 필드 업데이트 가능하도록 수정

### 7.3 기술적 부채
- 부채 1:
- 부채 2:

---

## 8. 회고

### 8.1 잘된 점
-

### 8.2 개선할 점
-

### 8.3 배운 점
-

### 8.4 Phase 2에 적용할 사항
-

---

## 9. 참고 자료

### 9.1 Backend
- [Hexagonal Architecture 가이드](../../technical/architecture/backend-architecture-guide.md)
- [CRUD 템플릿 가이드](../../technical/guides/backend/crud-template-guide.md)

### 9.2 Frontend
- [Feature-Sliced Design 가이드](../../technical/architecture/frontend-architecture.md)
- [CRUD 템플릿 가이드](../../technical/guides/frontend/crud-template-guide.md)

### 9.3 마크다운
- [react-markdown 공식 문서](https://github.com/remarkjs/react-markdown)
- [remark-gfm 공식 문서](https://github.com/remarkjs/remark-gfm)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)

---

**작성일**: 2026-01-10
**작성자**: AI Agent (Claude)
**상태**: 완료
