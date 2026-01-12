# 남은 작업 목록

**에픽**: [프론트엔드 구조 최적화](../../epic/frontend-structure-optimization.md)

## 완료된 작업 ✅

1. ✅ 엔티티 마이그레이션 완료 (project, tech-stack, education, experience, certification)
2. ✅ Features 파일 이동 완료 (chatbot, project-gallery, introduction)
3. ✅ 주요 Import 경로 업데이트 완료
4. ✅ 디자인 시스템 구축 완료
5. ✅ TypeScript Path Alias 설정 완료
6. ✅ ESLint 규칙 추가 완료

## 남은 작업 📋

### 1. Shared UI 컴포넌트 정리

다음 컴포넌트들을 `shared/ui`로 이동해야 합니다:

- [ ] `main/components/common/TechStackBadge` → `shared/ui/tech-stack/TechStackBadge`
- [ ] `main/components/common/TechStack` → `shared/ui/tech-stack/TechStackList`
- [ ] `main/components/common/icons/ProjectIcons` → `shared/ui/icon/ProjectIcons`
- [ ] `main/components/common/Modal` → `shared/ui/modal` (일부는 이미 있음)

### 2. Features 내부 Import 경로 수정

다음 파일들의 상대 경로를 path alias로 변경:

- [ ] `features/project-gallery/components/PortfolioSection.tsx`
- [ ] `features/project-gallery/components/ProjectFilter.tsx`
- [ ] `features/project-gallery/components/HistoryPanel.tsx`
- [ ] `features/project-gallery/components/ExperienceCard.tsx`
- [ ] `features/project-gallery/components/EducationCard.tsx`
- [ ] `features/project-gallery/components/CertificationCard.tsx`

### 3. Shared 서비스 정리

- [ ] `shared/techStackApi.ts` → `entities/tech-stack`로 통합 또는 별도 서비스로 유지 결정
- [ ] `shared/services/apiClient.ts` 확인 및 정리

### 4. 빌드 테스트 및 오류 수정

- [ ] `npm run build` 실행하여 빌드 오류 확인
- [ ] `npm run dev` 실행하여 런타임 오류 확인
- [ ] 발견된 오류 수정

### 5. 기존 폴더 정리 (선택사항)

모든 마이그레이션이 완료되고 테스트가 통과한 후:

- [ ] `main/features/*` 폴더 삭제
- [ ] `main/entities/*` 폴더 삭제 (새 엔티티 사용 확인 후)
- [ ] `admin/entities/*` 폴더 삭제 (새 엔티티 사용 확인 후)

## 우선순위

1. **높음**: 빌드 테스트 및 오류 수정
2. **중간**: Features 내부 Import 경로 수정
3. **낮음**: Shared UI 컴포넌트 정리 (점진적으로 진행 가능)

## 참고

- 모든 작업은 점진적으로 진행 가능합니다
- 각 단계마다 빌드 테스트를 수행하여 오류를 조기에 발견하세요
- 기존 폴더는 모든 마이그레이션이 완료될 때까지 유지하는 것을 권장합니다

