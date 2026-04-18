# Epic E19: admin-fsd-root-layer-cleanup

## 목표

- `admin/` 루트에 잔존하는 FSD 6레이어 외부 폴더(`api/`, `hooks/`, `config/`, `types/`, `utils/`, `App.css`)를 전부 FSD 레이어 안으로 이동한다.
- 이동 완료 후 루트 레벨에는 `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/` 6개 레이어만 존재한다.
- 프론트엔드 빌드(`npm --prefix frontend run build`)와 테스트(`npm --prefix frontend run test:coverage`)가 이동 전후 동일하게 통과한다.

## 배경 / 맥락

### 현재 상태

E18(P01)에서 `components/` 데드코드와 `shared/ui` 중복을 제거했지만, 루트 레벨에는 여전히 비FSD 폴더가 남아 있다.

| 폴더/파일 | 내용 | 위반 이유 |
|---|---|---|
| `api/adminApiClient.ts` | 공통 HTTP 클라이언트 | 레이어 외부 |
| `api/adminAuthApi.ts` | Auth 서버 통신 | entity 안으로 들어가야 함 |
| `api/adminProjectApi.ts` | Project 서버 통신 | entities/project에 중복 공존 |
| `api/adminUploadApi.ts` | 이미지 업로드 | 레이어 외부 |
| `api/types.ts` | ApiError 타입 | shared/types가 정착지 |
| `config/queryClient.ts` | QueryClient 설정 | app 레이어가 정착지 |
| `types/dataTable.types.ts` | DataTable 공통 타입 | shared/types가 정착지 |
| `utils/dataTransformers.ts` | 데이터 변환 유틸 | shared/lib이 정착지 |
| `hooks/useAuth.ts` | AuthProvider + useAuth | features/auth/model이 정착지 |
| `hooks/useProjects.ts` | Project CRUD hooks | entities/project와 중복 |
| `hooks/useAdminQuery.ts` | Query wrapper | shared/hooks가 정착지 |
| `hooks/useAdminMutation.ts` | Mutation wrapper | shared/hooks가 정착지 |
| `hooks/useTablePage.ts` | 테이블 페이지 hook | shared/hooks가 정착지 |
| `hooks/useUpload.ts` | 업로드 mutation | shared/hooks가 정착지 |
| `App.css` | 글로벌 스타일 | app 레이어가 정착지 |

### 문제

- FSD 레이어 밖 폴더가 존재하면 어디서든 import 가능해 레이어 경계가 의미 없어진다.
- `hooks/useProjects.ts`와 `entities/project/api/useProjectQuery.ts`가 중복 공존해 혼선을 준다.
- 새 feature 추가 시 정착지가 불명확해 동일 패턴의 비FSD 폴더가 계속 누적될 수 있다.

## 특이점

- `adminProjectApi.ts`와 `useProjects.ts`는 E18 이전 레거시, `projectApi.ts`와 `useProjectQuery.ts`는 E18에서 신설. 두 쌍의 인터페이스 차이를 P02에서 확인 후 하나로 통합한다.
- `useAuth.ts`에는 `AuthProvider`(컴포넌트)와 `useAuth`(hook)이 공존. `features/auth/model/`로 이동 시 `AuthProvider`는 `features/auth/ui/`로 분리를 검토한다.
- `useTablePage.ts`와 `shared/hooks/useManagementPage.ts`의 역할 중복 여부를 P03에서 비교 후 결정한다.
- 각 Phase는 이동 후 프론트 빌드 통과를 검증 기준으로 삼는다. Phase 간 import 경로 업데이트 누락이 발생하지 않도록 Phase별로 `npm --prefix frontend run build`를 수행한다.
- `admin/App.css`는 현재 import 사용처가 없는 상태다. P04에서 "재연결(import 복구) 또는 삭제" 중 하나를 선택해 정리한다.

## 검증 명령 규칙

- E19는 Frontend 구조 정리 에픽이므로 Phase별 기본 검증은 `npm --prefix frontend run build`를 사용한다.
- 회귀 검증 단계(P04)에서만 `npm --prefix frontend run test:coverage`를 수행한다.
- 루트 `npm run build`는 백엔드 Maven 실행을 포함하므로 E19의 기본 게이트로 사용하지 않는다.

## Phase 목록

- [P01: shared-infrastructure-migration](./P01.shared-infrastructure-migration.md)
- [P02: entity-api-consolidation](./P02.entity-api-consolidation.md)
- [P03: hooks-and-auth-feature-migration](./P03.hooks-and-auth-feature-migration.md)
- [P04: app-layer-cleanup-and-validation](./P04.app-layer-cleanup-and-validation.md)
- [P05: admin-index-centric-import-alignment](./P05.admin-index-centric-import-alignment.md)

## 상태

- [ ] P01 완료
- [ ] P02 완료
- [ ] P03 완료
- [ ] P04 완료
- [ ] P05 완료
