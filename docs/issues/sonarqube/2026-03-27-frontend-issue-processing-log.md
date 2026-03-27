# Frontend Sonar 이슈 처리 로그 (2026-03-27)

## 목적

- 이미 처리된 이슈를 다시 확인/재작업하지 않도록 상태를 고정한다.
- 배치별 결과를 남겨 다음 에이전트가 동일 기준으로 이어서 작업할 수 있게 한다.

## 기준

- 우선순위: `BUG + (BLOCKER/CRITICAL/MAJOR)`
- 확장 배치: `CODE_SMELL`의 `CRITICAL/MAJOR` 포함
- 현재 운영 원칙: `MINOR/INFO`는 후순위로 이월하고 `MAJOR+`를 먼저 소진

## Batch 1 (Top10: BUG 우선)

### 처리 완료 (`CLOSED/FIXED`)

- `e878ae5f-7e5b-4b98-b8c8-162d10b60bba`
- `30c5f3ad-abad-46be-b26d-6e11979b3ed0`
- `5285c54b-6435-4670-92b1-669827c5ed25`
- `deeb9fa6-6cf8-4d34-9035-d33e6b4cfca2`
- `67fe5bac-fefd-41ac-8092-1b7603ab71cc`
- `f752b977-bba6-4e5d-9e1a-28253600b368`
- `c3cce33c-8940-4e77-a59b-ac5518ac3fec`
- `1984c30b-4e97-4cfd-b16a-2ff25de113b3`
- `19051d0c-f7a0-44e3-b466-22ee748ef032`
- `05a2c989-a1d7-4b77-bd71-9b30942c73bc`

## Batch 2 (확장 Top10: CODE_SMELL CRITICAL 포함)

### 처리 완료 (`CLOSED/FIXED`)

- `6a2203ec-a895-4e52-939f-15fcdb852ce8`
- `9a6344f0-de16-4857-890b-609b0fe57db3`
- `bdb80f6e-127c-4c99-bbd6-16033d035b06`
- `2c626fcc-5fb3-4bb2-97d5-f4a3314daee2`
- `04034ba7-7a0a-4d81-b69e-b949baade684`
- `1e8f3e82-5c67-430e-9f8a-010727c93acb`
- `5796579f-3bb7-43aa-8f12-e23346445247`
- `af67c495-4485-4500-8058-c28f07fb9a4c`

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `4e891ae2-857e-4f60-8432-3771fd0d09ec` (`typescript:S3776`, `src/main/pages/ArticleDetailPage.tsx`)
- `f8b58a2b-c29a-4740-bf16-c6b616fd43f6` (`typescript:S3776`, `src/main/features/easter-eggs/effects/demon-slayer/DemonSlayerEffect.tsx`)

## Batch 3 (S3776 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `4e891ae2-857e-4f60-8432-3771fd0d09ec` (`typescript:S3776`, `src/main/pages/ArticleDetailPage.tsx`)
- `f8b58a2b-c29a-4740-bf16-c6b616fd43f6` (`typescript:S3776`, `src/main/features/easter-eggs/effects/demon-slayer/DemonSlayerEffect.tsx`)
- `45b05f95-7c57-4e01-8f2b-8ca4f110e697` (`typescript:S3776`, `src/main/features/easter-eggs/effects/matrix/MatrixEffect.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `6c0b8fb1-2e6e-4f05-92b3-1c3cc920f79e` (`typescript:S6853`, `src/main/pages/ProjectsListPage/components/ProjectSearchModal.tsx`)
- `6c1fd3b3-28ae-472b-aeac-b0f7067ff0d0` (`typescript:S4043`, `src/shared/utils/techStackCategorization.ts`)
- `3cf37e40-e2f8-46a5-a741-18dc8ca6d6c5` (`typescript:S1082`, `src/design-system/components/Modal/Modal.tsx`)

## Batch 4 (접근성/간단 정적규칙 확장 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `6c0b8fb1-2e6e-4f05-92b3-1c3cc920f79e` (`typescript:S6853`, `src/main/pages/ProjectsListPage/components/ProjectSearchModal.tsx`)
- `6c1fd3b3-28ae-472b-aeac-b0f7067ff0d0` (`typescript:S4043`, `src/shared/utils/techStackCategorization.ts`)
- `3cf37e40-e2f8-46a5-a741-18dc8ca6d6c5` (`typescript:S1082`, `src/design-system/components/Modal/Modal.tsx`)
- `4b3ef779-02a3-4a48-8db3-082fe0b19755` (`typescript:S1082`, `src/design-system/components/Modal/Modal.tsx`)
- `bdf1aca8-6223-4847-9e66-44728901708d` (`typescript:S1082`, `src/shared/ui/tech-stack/TechStackBadge.tsx`)
- `c15fd09e-fc14-42df-9e44-9186b73ae74d` (`typescript:S1082`, `src/main/features/easter-eggs/effects/video/VideoEffect.tsx`)
- `523cbbab-0655-4d9f-8187-31e948d726e3` (`typescript:S1082`, `src/main/pages/ProjectsListPage/components/ProjectHistoryTimeline.tsx`)
- `6cdcc272-7c78-4d5c-b76c-b725282dbe93` (`typescript:S2933`, `src/admin/entities/experience/api/adminExperienceApi.ts`)
- `6d067b2b-117d-430a-83e6-8fb5a9f801bb` (`typescript:S2933`, `src/main/features/easter-eggs/lib/manualBeatTiming.ts`)
- `6f4bae2f-c289-4f5e-9f53-5ebe87bae5dc` (`typescript:S6582`, `src/admin/shared/ui/SeriesSearchSelect.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `6f5f8644-041c-4b47-88f4-019e2c85d414` (`typescript:S3358`, `src/admin/shared/ui/SeriesSearchSelect.tsx`)
- `72d82674-fc7e-4d61-904c-259fb0361e40` (`css:S125`, `src/index.css`)
- `739e3433-c793-4ee8-a739-e47ed4eb516a` (`typescript:S1854`, `src/admin/hooks/useAuth.ts`)

## Batch 5 (가독성/불필요 코드 정리)

### 처리 완료 (코드 반영, 재분석 대기)

- `6f5f8644-041c-4b47-88f4-019e2c85d414` (`typescript:S3358`, `src/admin/shared/ui/SeriesSearchSelect.tsx`)
- `72d82674-fc7e-4d61-904c-259fb0361e40` (`css:S125`, `src/index.css`)
- `739e3433-c793-4ee8-a739-e47ed4eb516a` (`typescript:S1854`, `src/admin/hooks/useAuth.ts`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `79deb13e-e3ea-453e-a370-48af9d4bba7f` (`css:S4656`, `src/main/widgets/featured-projects-section/ui/FeaturedProjectsSection.module.css`)
- `7527c83c-56c2-4940-ba30-a703db32535e` (`typescript:S2933`, `src/main/features/easter-eggs/lib/beatDetector.ts`)
- `7c39d578-8a9e-45a7-906c-a4290e3021a1` (`typescript:S6848`, `src/main/entities/tech-stack/ui/TechStackBadge.tsx`)

## Batch 6 (스타일/불변성/접근성 보강)

### 처리 완료 (코드 반영, 재분석 대기)

- `79deb13e-e3ea-453e-a370-48af9d4bba7f` (`css:S4656`, `src/main/widgets/featured-projects-section/ui/FeaturedProjectsSection.module.css`)
- `7527c83c-56c2-4940-ba30-a703db32535e` (`typescript:S2933`, `src/main/features/easter-eggs/lib/beatDetector.ts`)
- `7c39d578-8a9e-45a7-906c-a4290e3021a1` (`typescript:S6848`, `src/main/entities/tech-stack/ui/TechStackBadge.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `7b265a2f-8f42-4e5b-a137-6bc9cbc580c2` (`css:S125`, `src/index.css`)
- `7c47acda-26c7-410d-b80c-eb3809ece65c` (`typescript:S6481`, `src/main/features/easter-eggs/store/easterEggStore.tsx`)
- `7c4df4c8-9cae-4eee-b040-667ed3a0226d` (`typescript:S6479`, `src/main/features/article-view/ui/ArticleControlPanel.tsx`)

## Batch 7 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `7b265a2f-8f42-4e5b-a137-6bc9cbc580c2` (`css:S125`, `src/index.css`)
- `7c47acda-26c7-410d-b80c-eb3809ece65c` (`typescript:S6481`, `src/main/features/easter-eggs/store/easterEggStore.tsx`)
- `7c4df4c8-9cae-4eee-b040-667ed3a0226d` (`typescript:S6479`, `src/main/features/article-view/ui/ArticleControlPanel.tsx`)
- `806ca105-bf92-493d-9d64-771faffe1b55` (`typescript:S6479`, `src/main/pages/ProfilePage/components/CertificationSection.tsx`)
- `7d4d6d51-089d-45e2-bdb0-378923f5eddd` (`typescript:S2933`, `src/main/features/easter-eggs/lib/manualBeatTiming.ts`)
- `7dc5d0af-15e5-4077-910d-46ad1a9447da` (`typescript:S4624`, `src/shared/services/apiClient.ts`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `7d286afa-02d9-402e-8e71-8e9826204db7` (`typescript:S6853`, `src/main/pages/ProjectsListPage/components/ProjectSearchModal.tsx`)
- `7f93573a-32c3-4cfa-b2d1-bf7f90bb64e3` (`typescript:S1871`, `src/main/features/chatbot/hooks/useChatMessages.tsx`)
- `8428e530-62ee-450e-b1da-62d4e81fd734` (`typescript:S6479`, `src/shared/ui/tech-stack/TechStackList.tsx`)

## 다음 작업 가이드

- 다음 에이전트는 Batch 3~7 `처리 완료` 항목에 대해 SonarQube 재분석 후 `CLOSED/FIXED` 여부를 먼저 확인한다.
- 재분석 후에도 `OPEN`이면 함수 분리/조건 분기 단순화 리팩터링을 1회 추가 적용한다.
- 신규 작업은 위 `OPEN` 우선 대상 순서대로 진행한다.
- 위 `CLOSED/FIXED` 키는 재검토 대상에서 제외한다.
