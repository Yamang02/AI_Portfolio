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

## Batch 8 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `7d286afa-02d9-402e-8e71-8e9826204db7` (`typescript:S6853`, `src/main/pages/ProjectsListPage/components/ProjectSearchModal.tsx`)
- `7f93573a-32c3-4cfa-b2d1-bf7f90bb64e3` (`typescript:S1871`, `src/main/features/chatbot/hooks/useChatMessages.tsx`)
- `8428e530-62ee-450e-b1da-62d4e81fd734` (`typescript:S6479`, `src/shared/ui/tech-stack/TechStackList.tsx`)
- `80d41999-cecc-4eb0-9af0-22dc5a81c311` (`typescript:S5869`, `src/shared/lib/markdown/generateHeadingId.ts`)
- `832435df-2542-4832-883c-eeb67671e262` (`typescript:S6582`, `src/admin/shared/ui/SeriesSearchSelect.tsx`)
- `85b09f81-9824-4b95-bb07-7dbb5b2a3412` (`typescript:S6479`, `src/main/pages/ProfilePage/components/CareerTimelineSection.tsx`)
- `86124bdd-2f1e-42b4-836b-862ff6624801` (`typescript:S6479`, `src/main/pages/ProfilePage/components/CareerCard.tsx`)
- `86356d45-969e-4c31-9ba3-abf2f9fdee82` (`typescript:S6479`, `src/main/pages/ProjectsListPage/components/ProjectSectionContent.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `87b69829-1ba2-4ba1-af56-6137de19c944` (`typescript:S2933`, `src/admin/entities/education/api/adminEducationApi.ts`)
- `885230f6-9362-4b26-9507-e155dbd3b900` (`typescript:S6848`, `src/design-system/components/Card/Card.tsx`)
- `889583ba-7554-46b1-b053-b4893f449713` (`typescript:S1871`, `src/shared/hooks/useScrollAnimation.ts`)

## Batch 9 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `87b69829-1ba2-4ba1-af56-6137de19c944` (`typescript:S2933`, `src/admin/entities/education/api/adminEducationApi.ts`)
- `885230f6-9362-4b26-9507-e155dbd3b900` (`typescript:S6848`, `src/design-system/components/Card/Card.tsx`)
- `889583ba-7554-46b1-b053-b4893f449713` (`typescript:S1871`, `src/shared/hooks/useScrollAnimation.ts`)
- `0ccb8e61-1b2e-4fef-a50a-199ffdeab2e3` (`typescript:S6848`, `src/design-system/components/Badge/Badge.tsx`)
- `08c0df59-cc61-41a6-a902-e38a6eb1a7d6` (`typescript:S6479`, `src/design-system/components/Pagination/Pagination.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `00c82b2c-f710-431d-bee2-ff647f1afc32` (`typescript:S6582`, `src/admin/shared/ui/SeriesSearchSelect.tsx`)
- `021e44b9-4b07-484b-8cdc-6c1e75de7819` (`typescript:S6848`, `src/admin/shared/ui/markdown/MarkdownEditor.tsx`)
- `02698b4e-c0ee-460a-8044-e4fe8a6f786d` (`typescript:S6478`, `src/main/features/chatbot/components/ChatMessage.tsx`)

## Batch 10 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `00c82b2c-f710-431d-bee2-ff647f1afc32` (`typescript:S6582`, `src/admin/shared/ui/SeriesSearchSelect.tsx`)
- `021e44b9-4b07-484b-8cdc-6c1e75de7819` (`typescript:S6848`, `src/admin/shared/ui/markdown/MarkdownEditor.tsx`)
- `02698b4e-c0ee-460a-8044-e4fe8a6f786d` (`typescript:S6478`, `src/main/features/chatbot/components/ChatMessage.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `02d30a05-8b72-4514-8ae8-b61b0bdb379d` (`typescript:S6481`, `src/shared/providers/ThemeProvider.tsx`)
- `042386b2-a73c-44fb-bf94-71d0e7c4ae39` (`typescript:S4624`, `src/shared/api/apiClient.ts`)
- `074d324f-8e53-40d2-a554-cf0fa12565d0` (`typescript:S6853`, `src/main/pages/ProjectsListPage/components/ProjectSearchModal.tsx`)

## Batch 11 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `02d30a05-8b72-4514-8ae8-b61b0bdb379d` (`typescript:S6481`, `src/shared/providers/ThemeProvider.tsx`)
- `042386b2-a73c-44fb-bf94-71d0e7c4ae39` (`typescript:S4624`, `src/shared/api/apiClient.ts`)
- `074d324f-8e53-40d2-a554-cf0fa12565d0` (`typescript:S6853`, `src/main/pages/ProjectsListPage/components/ProjectSearchModal.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `0c2e369a-71d5-4c6b-a678-290d76049f33` (`typescript:S125`, `src/admin/pages/CertificationList.tsx`)
- `1013aaca-9eb0-4f0e-990a-4adef5c90fb9` (`typescript:S6582`, `src/admin/features/experience-management/hooks/useExperienceFilter.ts`)
- `1014f62e-da01-410e-ac37-5cb6d6fa5ea0` (`typescript:S6582`, `src/admin/api/adminUploadApi.ts`)

## Batch 12 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `0c2e369a-71d5-4c6b-a678-290d76049f33` (`typescript:S125`, `src/admin/pages/CertificationList.tsx`)
- `1013aaca-9eb0-4f0e-990a-4adef5c90fb9` (`typescript:S6582`, `src/admin/features/experience-management/hooks/useExperienceFilter.ts`)
- `1014f62e-da01-410e-ac37-5cb6d6fa5ea0` (`typescript:S6582`, `src/admin/api/adminUploadApi.ts`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `161efb37-1ffb-487e-b4ed-4fe4cc67db6a` (`typescript:S2933`, `src/main/features/easter-eggs/lib/resourcePreloader.ts`)
- `1271eb13-5dc9-4706-8b03-6f02f7c34b92` (`typescript:S1854`, `src/main/pages/ArticleListPage.tsx`)
- `12f7a876-f370-4287-a72a-90682f9d2f91` (`typescript:S3358`, `src/shared/utils/techStackCategorization.ts`)

## Batch 13 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `161efb37-1ffb-487e-b4ed-4fe4cc67db6a` (`typescript:S2933`, `src/main/features/easter-eggs/lib/resourcePreloader.ts`)
- `1271eb13-5dc9-4706-8b03-6f02f7c34b92` (`typescript:S1854`, `src/main/pages/ArticleListPage.tsx`)
- `12f7a876-f370-4287-a72a-90682f9d2f91` (`typescript:S3358`, `src/shared/utils/techStackCategorization.ts`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `163a0b32-8d07-417e-aa82-d2cd2a0c640f` (`typescript:S6819`, `src/main/widgets/featured-projects-section/ui/FeaturedProjectsSection.tsx`)
- `167f330e-c67f-43b6-9c87-4f4fbd65e613` (`typescript:S6479`, `src/main/pages/ProjectDetailPage/ProjectDetailPage.tsx`)
- `14cb1fa9-629b-4777-a718-ffcee63a3da0` (`typescript:S1871`, `src/main/features/chatbot/hooks/useChatMessages.tsx`)

## Batch 14 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `163a0b32-8d07-417e-aa82-d2cd2a0c640f` (`typescript:S6819`, `src/main/widgets/featured-projects-section/ui/FeaturedProjectsSection.tsx`)
- `167f330e-c67f-43b6-9c87-4f4fbd65e613` (`typescript:S6479`, `src/main/pages/ProjectDetailPage/ProjectDetailPage.tsx`)
- `14cb1fa9-629b-4777-a718-ffcee63a3da0` (`typescript:S1871`, `src/main/features/chatbot/hooks/useChatMessages.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `05a2c989-a1d7-4b77-bd71-9b30942c73bc` (`typescript:S6440`, `src/design-system/components/Pagination/Pagination.stories.tsx`)
- `08c0df59-cc61-41a6-a902-e38a6eb1a7d6` (`typescript:S6479`, `src/design-system/components/Pagination/Pagination.tsx`)
- `0ccb8e61-1b2e-4fef-a50a-199ffdeab2e3` (`typescript:S6848`, `src/design-system/components/Badge/Badge.tsx`)

## Batch 15 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `05a2c989-a1d7-4b77-bd71-9b30942c73bc` (`typescript:S6440`, `src/design-system/components/Pagination/Pagination.stories.tsx`)
- `08c0df59-cc61-41a6-a902-e38a6eb1a7d6` (`typescript:S6479`, `src/design-system/components/Pagination/Pagination.tsx`)
- `0ccb8e61-1b2e-4fef-a50a-199ffdeab2e3` (`typescript:S6848`, `src/design-system/components/Badge/Badge.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `1009a7da-5f63-479b-9d4f-cf3acbf8374a` (`typescript:S6478`, `src/main/features/chatbot/components/ChatMessage.tsx`)
- `14861c1f-67b6-450c-bb5c-d878d955a7d1` (`typescript:S6478`, `src/main/features/chatbot/components/ChatMessage.tsx`)
- `16a596ff-ba6d-4be7-8e1e-f55a0ffef619` (`typescript:S2589`, `src/main/features/easter-eggs/effects/demon-slayer/DemonSlayerEffect.tsx`)

## Batch 16 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `1009a7da-5f63-479b-9d4f-cf3acbf8374a` (`typescript:S6478`, `src/main/features/chatbot/components/ChatMessage.tsx`)
- `14861c1f-67b6-450c-bb5c-d878d955a7d1` (`typescript:S6478`, `src/main/features/chatbot/components/ChatMessage.tsx`)
- `16a596ff-ba6d-4be7-8e1e-f55a0ffef619` (`typescript:S2589`, `src/main/features/easter-eggs/effects/demon-slayer/DemonSlayerEffect.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `17d26ef1-fd33-4554-86c7-3818f8280d75` (`typescript:S2301`, `src/admin/features/project-management/ui/TechStackSelector.tsx`)
- `1a2b63e1-866d-4c2f-a756-cecc500ba231` (`typescript:S3358`, `src/shared/utils/imageOptimization.ts`)
- `1c1ed28e-abf6-414b-b70f-5e42d24d70f3` (`css:S4666`, `src/main/widgets/featured-projects-section/ui/FeaturedProjectsSection.module.css`)

## Batch 17 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `17d26ef1-fd33-4554-86c7-3818f8280d75` (`typescript:S2301`, `src/admin/features/project-management/ui/TechStackSelector.tsx`)
- `1a2b63e1-866d-4c2f-a756-cecc500ba231` (`typescript:S3358`, `src/shared/utils/imageOptimization.ts`)
- `1c1ed28e-abf6-414b-b70f-5e42d24d70f3` (`css:S4666`, `src/main/widgets/featured-projects-section/ui/FeaturedProjectsSection.module.css`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `19051d0c-f7a0-44e3-b466-22ee748ef032` (`typescript:S6440`, `src/design-system/components/Pagination/Pagination.stories.tsx`)
- `1984c30b-4e97-4cfd-b16a-2ff25de113b3` (`typescript:S6440`, `src/design-system/components/Badge/Badge.stories.tsx`)
- `210558db-d9af-4a0f-b056-fa4d20a3c158` (`typescript:S6582`, `src/admin/api/adminProjectApi.ts`)

## Batch 18 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `19051d0c-f7a0-44e3-b466-22ee748ef032` (`typescript:S6440`, `src/design-system/components/Pagination/Pagination.stories.tsx`)
- `1984c30b-4e97-4cfd-b16a-2ff25de113b3` (`typescript:S6440`, `src/design-system/components/Badge/Badge.stories.tsx`)
- `210558db-d9af-4a0f-b056-fa4d20a3c158` (`typescript:S6582`, `src/admin/api/adminProjectApi.ts`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `1b7f73cb-e71f-4c1d-8a20-bb71aa9ed149` (`typescript:S1854`, `src/admin/features/project-management/ui/ProjectScreenshotsUpload.tsx`)
- `20facda1-6a7c-44f5-99e1-55792d538770` (`typescript:S1854`, `src/admin/features/cache-management/ui/RedisCacheModal.tsx`)
- `2152c2ac-339d-48ef-88af-71da2ce1e267` (`typescript:S6582`, `src/main/features/project-gallery/hooks/useTOCFromDOM.ts`)

## Batch 19 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `1b7f73cb-e71f-4c1d-8a20-bb71aa9ed149` (`typescript:S1854`, `src/admin/features/project-management/ui/ProjectScreenshotsUpload.tsx`)
- `20facda1-6a7c-44f5-99e1-55792d538770` (`typescript:S1854`, `src/admin/features/cache-management/ui/RedisCacheModal.tsx`)
- `2152c2ac-339d-48ef-88af-71da2ce1e267` (`typescript:S6582`, `src/main/features/project-gallery/hooks/useTOCFromDOM.ts`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `22372f43-fde0-4e4c-b887-1ce77805df6d` (`typescript:S2933`, `src/admin/entities/relationship/api/relationshipApi.ts`)
- `226014de-17a4-453e-880c-bcf21aaced1c` (`typescript:S3358`, `src/main/pages/ArticleDetailPage.tsx`)
- `2b09eff2-af78-4b32-af5b-9ffe4e7adc02` (`typescript:S6819`, `src/design-system/components/Carousel/ProjectThumbnailCarousel.tsx`)

## Batch 20 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `22372f43-fde0-4e4c-b887-1ce77805df6d` (`typescript:S2933`, `src/admin/entities/relationship/api/relationshipApi.ts`)
- `226014de-17a4-453e-880c-bcf21aaced1c` (`typescript:S3358`, `src/main/pages/ArticleDetailPage.tsx`)
- `2b09eff2-af78-4b32-af5b-9ffe4e7adc02` (`typescript:S6819`, `src/design-system/components/Carousel/ProjectThumbnailCarousel.tsx`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `26a0e668-6032-45b6-8a0d-8c5fe7d00e3f` (`typescript:S3358`, `src/admin/features/project-management/ui/TechStackSelector.tsx`)
- `30f1c4fb-8907-4e5c-bd76-2c939bac61e7` (`typescript:S6479`, `src/shared/ui/skeleton/SkeletonCard.tsx`)
- `317cc4e4-7733-4267-9b77-fcd79edc5c26` (`css:S4666`, `src/design-system/components/Badge/DateBadge.module.css`)

## Batch 21 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `26a0e668-6032-45b6-8a0d-8c5fe7d00e3f` (`typescript:S3358`, `src/admin/features/project-management/ui/TechStackSelector.tsx`)
- `30f1c4fb-8907-4e5c-bd76-2c939bac61e7` (`typescript:S6479`, `src/shared/ui/skeleton/SkeletonCard.tsx`)
- `317cc4e4-7733-4267-9b77-fcd79edc5c26` (`css:S4666`, `src/design-system/components/Badge/DateBadge.module.css`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `2c447abb-5f13-4540-93c4-31d07ea8539b` (`css:S7924`, `src/admin/App.css`)
- `331434e8-62e9-4a87-82a9-3e06afd08c6d` (`typescript:S3358`, `src/shared/utils/techStackCategorization.ts`)
- `33394322-41db-4b1c-b284-99807c1491be` (`typescript:S6582`, `src/main/features/easter-eggs/effects/demon-slayer/hooks.ts`)

## Batch 22 (대배치: MAJOR+ 연속 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `2c447abb-5f13-4540-93c4-31d07ea8539b` (`css:S7924`, `src/admin/App.css`)
- `331434e8-62e9-4a87-82a9-3e06afd08c6d` (`typescript:S3358`, `src/shared/utils/techStackCategorization.ts`)
- `33394322-41db-4b1c-b284-99807c1491be` (`typescript:S6582`, `src/main/features/easter-eggs/effects/demon-slayer/hooks.ts`)

### 미해결 (`OPEN`) — 다음 배치 우선 대상

- `38350d0e-5ab4-49ea-85e8-72bc5f48cf16` (`typescript:S6479`, `src/admin/features/project-management/ui/ProjectScreenshotsUpload.tsx`)
- `38639231-672f-44ce-b886-8e2b173984a3` (`typescript:S3358`, `src/admin/features/cloud-usage-monitoring/ui/CloudUsageCard.tsx`)
- `38e75a5a-73f1-48a4-80a4-4dd3f8f3b90a` (`typescript:S6819`, `src/shared/ui/markdown/MarkdownRenderer.tsx`)

## Batch 23 (BLOCKER/CRITICAL 우선 처리)

### 처리 완료 (코드 반영, 재분석 대기)

- `448c3fe7-8393-421f-b8d9-def749613a7c` (`typescript:S3735`, `src/main/features/chatbot/hooks/useChatMessages.tsx`)

### 미해결 (`OPEN`) — BLOCKER/CRITICAL

- 없음 (현재 로그 기준 미처리 BLOCKER/CRITICAL 0건)

## Batch 24 (MAJOR 최다 유형 집중: `typescript:S3358`)

### 처리 완료 (코드 반영, 재분석 대기)

- `a6ca8271-811f-446a-ac0a-3c23c8693492` (`typescript:S3358`, `src/admin/features/article-management/config/articleColumns.tsx`)
- `ebc5e6ae-36c8-4e88-8e9b-f853cd6a6c4d` (`typescript:S3358`, `src/admin/features/article-management/config/articleColumns.tsx`)
- `b56d99c0-be85-41c4-be05-984a885a02bf` (`typescript:S3358`, `src/admin/features/cloud-usage-monitoring/ui/CloudUsageCard.tsx`)
- `4ca6cae9-484b-4afe-8331-658824c9b66d` (`typescript:S3358`, `src/admin/features/project-management/ui/ProjectThumbnailUpload.tsx`)
- `46960203-44a8-49ad-a4f6-30ee9c14ff4a` (`typescript:S3358`, `src/admin/features/tech-stack-management/ui/TechStackTableColumns.tsx`)
- `4f7687d6-9d97-4521-accf-9161823ed508` (`typescript:S3358`, `src/design-system/components/Skeleton/Skeleton.tsx`)
- `6b5759df-d971-4c7f-8fe1-0f8200f82f86` (`typescript:S3358`, `src/design-system/components/Skeleton/Skeleton.tsx`)
- `910b1a51-4329-483c-8733-a8b8c14b648e` (`typescript:S3358`, `src/main/features/chatbot/components/ChatMessage.tsx`)

### 미해결 (`OPEN`) — 동일 유형(`typescript:S3358`) 다음 우선 대상

- `39efd196-a13d-4a64-9839-91f858db103b` (`typescript:S3358`, `src/main/pages/ProfilePage/components/CareerTimelineSection.tsx`)
- `42712458-32e4-4d38-bb91-911f511ffc00` (`typescript:S3358`, `src/shared/ui/tech-stack/TechStackList.tsx`)
- `5a4f3ecf-e38a-436f-a877-9dee68b96f43` (`typescript:S3358`, `src/admin/pages/TechStackManagement.tsx`)

## 다음 작업 가이드

- 다음 에이전트는 Batch 23~24 `처리 완료` 항목을 포함해 SonarQube 재분석 후 `CLOSED/FIXED` 여부를 먼저 확인한다.
- 재분석 후에도 `OPEN`이면 규칙별 최소 리팩터링(중첩 삼항 분리, optional chaining 단순화, CSS 중복 정리)을 1회 추가 적용한다.
- 신규 작업은 Batch 24 하단의 `typescript:S3358` 우선 대상 3건부터 진행한다.
- 해당 3건 완료 후에는 `typescript:S6479`(잔여 최다), `typescript:S2933`, `css:S125` 순으로 소거한다.
- 위 `CLOSED/FIXED` 키는 재검토 대상에서 제외한다.
