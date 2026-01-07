# [FEATURE] 프론트엔드 구조 리팩토링: main/, admin/, design-system/ 최종 구조 확립

## 제안 배경

현재 프론트엔드 코드베이스에 중복된 구조가 존재합니다:
- **문제점**: `src/main/`, `src/pages/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/` 등이 혼재
- **원인**: Phase 6에서 새로운 컴포넌트, 페이지, 디자인시스템 개발 중 구조가 분리됨
- **목표**: 최종적으로 `src/`에는 `admin/`, `main/`, `design-system/`만 남기기

이 리팩토링은 다음과 같은 가치를 제공합니다:
- **명확한 앱 분리**: Public 앱(main)과 Admin 앱(admin)의 명확한 경계
- **공통 리소스 관리**: design-system을 통한 일관된 UI/UX
- **유지보수성 향상**: 각 앱이 독립적인 FSD 구조를 가짐
- **개발 효율성**: 새로운 개발자가 프로젝트 구조를 빠르게 이해 가능

## 요구사항

### 필수
1. **최종 디렉토리 구조 확립**
   ```
   frontend/src/
   ├── main/              # Public 포트폴리오 앱 (FSD)
   │   ├── app/           # 앱 진입점, 프로바이더, 라우터
   │   ├── pages/         # 페이지 컴포넌트
   │   ├── widgets/       # 복합 UI 블록
   │   ├── features/      # 비즈니스 기능
   │   ├── entities/      # 비즈니스 엔티티
   │   └── shared/        # main 앱 전용 공유 리소스
   ├── admin/             # Admin 대시보드 앱 (FSD)
   │   ├── app/
   │   ├── pages/
   │   ├── widgets/
   │   ├── features/
   │   ├── entities/
   │   └── shared/
   └── design-system/     # 공통 디자인 시스템
       ├── components/    # 공통 UI 컴포넌트
       ├── tokens/        # 디자인 토큰
       ├── styles/        # 공통 스타일
       └── providers/     # 공통 프로바이더
   ```

2. **마이그레이션 체크리스트**
   - [ ] `src/pages/` → `src/main/pages/`로 이동
   - [ ] `src/widgets/` → `src/main/widgets/`로 이동
   - [ ] `src/features/` → `src/main/features/`로 이동
   - [ ] `src/entities/` → `src/main/entities/`로 이동
   - [ ] `src/shared/` → `src/main/shared/` 또는 `src/design-system/`으로 분류
   - [ ] 중복 파일 식별 및 제거 (`src/main/` 내부 중복)
   - [ ] Import 경로 일괄 수정
   - [ ] TypeScript path alias 업데이트 (`tsconfig.json`)

3. **공통 컴포넌트 분류 기준**
   - **design-system으로 이동**:
     - 두 앱(main, admin)에서 모두 사용하는 UI 컴포넌트
     - 재사용 가능한 순수 UI 컴포넌트 (버튼, 입력, 카드 등)
     - 디자인 토큰, 테마 설정
   - **main/shared로 유지**:
     - main 앱에서만 사용하는 공유 리소스
     - main 앱 특화 유틸리티, 훅
   - **admin/shared로 분리**:
     - admin 앱에서만 사용하는 공유 리소스

### 선택
- Storybook 문서 업데이트 (design-system 컴포넌트 중심)
- 마이그레이션 스크립트 작성 (자동화)
- 레거시 코드 아카이빙

## 대안 비교

### A안: 단계적 마이그레이션 (점진적 이동) ✅ 선택
- **방식**: 기능별로 점진적으로 이동하면서 테스트
- **장점**:
  - 각 단계에서 동작 확인 가능
  - 리스크 분산
  - 충돌 발생 시 빠른 롤백 가능
- **단점**: 시간이 오래 걸림

### B안: 일괄 마이그레이션 (빅뱅)
- **방식**: 모든 파일을 한 번에 이동 후 Import 경로 일괄 수정
- **장점**: 빠른 완료
- **단점**:
  - 높은 리스크
  - 대규모 충돌 가능성
  - 디버깅 어려움

### C안: 새 구조에서 재작성
- **방식**: 기존 코드를 참고하여 새 구조에서 처음부터 작성
- **장점**: 깔끔한 코드베이스
- **단점**: 시간이 너무 많이 소요됨

**선택 이유**: A안을 선택. 현재 개발 중인 Phase 6와 병행 가능하며, 각 단계에서 검증 가능.

## 설계 메모

### 페이지 전환 애니메이션 컴포넌트 처리

**현재 위치**: `src/shared/ui/page-transition/AnimatedPageTransition.tsx`

**문제점**:
- `AnimatedRoutes` 컴포넌트가 구조적 문제로 사용 불가 (`<Routes>` 중첩 이슈)
- 현재는 `AnimatedPageTransition`으로 우회 중

**해결 방안 (2가지 옵션)**:

#### Option 1: main/shared/ui로 이동 (권장)
```
src/main/shared/ui/page-transition/
├── AnimatedPageTransition.tsx    # 현재 사용 중
└── index.ts
```
- **장점**: main 앱이 독립적으로 페이지 전환 로직 관리
- **단점**: admin에서도 필요하면 중복 코드 발생

#### Option 2: design-system/components로 이동
```
src/design-system/components/AnimatedPageTransition/
├── AnimatedPageTransition.tsx
└── index.ts
```
- **장점**: 두 앱에서 공통으로 사용 가능
- **단점**: 디자인 시스템에 라우팅 관련 로직이 포함됨 (관심사 분리 측면에서 애매함)

**권장**: Option 1 선택. 라우팅은 각 앱의 관심사이므로 `main/shared/ui`에 위치.

### Import Path Alias 설정

**현재** (`tsconfig.json`):
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@features/*": ["./src/features/*"],
    "@entities/*": ["./src/entities/*"],
    // ...
  }
}
```

**변경 후**:
```json
{
  "paths": {
    "@main/*": ["./src/main/*"],
    "@admin/*": ["./src/admin/*"],
    "@design-system/*": ["./src/design-system/*"],
  }
}
```

### 마이그레이션 단계

**Phase 1: 분석 및 계획** (1일)
1. 모든 파일의 의존성 맵 작성
2. 공통 컴포넌트 vs 앱 전용 컴포넌트 분류
3. 중복 파일 식별 목록 작성

**Phase 2: design-system 확립** (2일)
1. 공통 UI 컴포넌트를 `design-system/components`로 이동
2. 디자인 토큰 정리 (`design-system/tokens`)
3. 공통 프로바이더 이동 (`design-system/providers`)

**Phase 3: main 앱 구조 정리** (3일)
1. `src/pages/` → `src/main/pages/`
2. `src/widgets/` → `src/main/widgets/`
3. `src/features/` → `src/main/features/` (중복 제거)
4. `src/entities/` → `src/main/entities/` (중복 제거)
5. `src/shared/` → `src/main/shared/` (앱 전용만)

**Phase 4: Import 경로 수정** (2일)
1. TypeScript path alias 업데이트
2. 모든 import 문 수정
3. 빌드 테스트

**Phase 5: 중복 코드 제거 및 검증** (2일)
1. `src/main/` 내부 중복 파일 제거
2. 레거시 디렉토리 삭제 (`src/pages/`, `src/widgets/` 등)
3. 전체 앱 테스트
4. 문서 업데이트

**총 예상 소요 시간**: 10일

## 완료 기준

- [ ] `src/` 디렉토리에 `main/`, `admin/`, `design-system/`만 존재
- [ ] 중복 디렉토리 완전 제거 (`src/pages/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`)
- [ ] 모든 페이지 정상 렌더링 (Home, Profile, Projects, ProjectDetail, Chat)
- [ ] 페이지 전환 애니메이션 정상 작동
- [ ] TypeScript 컴파일 에러 0개
- [ ] 빌드 성공 (`npm run build`)
- [ ] 개발 서버 정상 실행 (`npm run dev`)
- [ ] Import 경로 일관성 유지 (모든 파일이 새 alias 사용)
- [ ] Storybook 정상 동작 (design-system 컴포넌트)
- [ ] 아키텍처 문서 업데이트 완료

---

**작성일**: 2026-01-07
**작성자**: AI Agent (Claude)
**우선순위**: Medium
**예상 소요 시간**: 10일
