# 마이그레이션 가이드

## 개요

이 문서는 기존 코드를 FSD 아키텍처로 마이그레이션하는 방법을 설명합니다.

## 마이그레이션 체크리스트

### 1. 엔티티 마이그레이션 ✅

**완료된 엔티티:**
- ✅ `entities/project` - 통합 완료
- ✅ `entities/tech-stack` - 통합 완료
- ✅ `entities/education` - 통합 완료
- ✅ `entities/experience` - 통합 완료
- ✅ `entities/certification` - 통합 완료

**다음 단계:**
- [ ] 기존 코드에서 새 엔티티 import로 변경
  - `main/entities/*` → `@entities/*`
  - `admin/entities/*` → `@entities/*`

### 2. Features 마이그레이션

**마이그레이션 대상:**
- `main/features/chatbot` → `features/chatbot`
- `main/features/projects` → `features/project-gallery`
- `main/features/introduction` → `features/introduction`

**진행 방법:**
1. 폴더 구조 생성
2. 파일 이동
3. import 경로 업데이트

### 3. Pages 마이그레이션

**마이그레이션 대상:**
- `main/pages/ProjectDetail` → `pages/public/project-detail`
- `admin/pages/*` → `pages/admin/*`

### 4. Widgets 생성

**생성할 위젯:**
- `widgets/project-showcase` - 프로젝트 쇼케이스 위젯
- `widgets/admin-dashboard` - 관리자 대시보드 위젯

### 5. Import 경로 업데이트

**변경 예시:**

```typescript
// Before
import { Project } from '../../entities/project';
import { ChatInputBar } from '../../../shared/ui/ChatInputBar';

// After
import { Project } from '@entities/project';
import { ChatInputBar } from '@shared/ui/chat';
```

### 6. ESLint 규칙 추가

**추가할 규칙:**
- FSD 레이어 간 import 규칙 강제
- Path alias 사용 강제
- 상대 경로 import 금지 (특정 레이어 내부 제외)

## 단계별 마이그레이션

### Step 1: 엔티티 사용 업데이트

기존 코드에서 엔티티 import를 업데이트합니다:

```typescript
// Before
import { useProjectsQuery } from '../../entities/project/api/useProjectsQuery';

// After
import { useProjectsQuery } from '@entities/project';
```

### Step 2: Features 이동

Features를 새 위치로 이동하고 import 경로를 업데이트합니다.

### Step 3: Pages 이동

Pages를 새 위치로 이동하고 라우터 설정을 업데이트합니다.

### Step 4: 테스트

각 단계마다 애플리케이션이 정상 작동하는지 확인합니다.

## 주의사항

1. **점진적 마이그레이션**: 한 번에 모든 것을 변경하지 말고 단계적으로 진행합니다.
2. **테스트**: 각 단계마다 테스트를 수행합니다.
3. **백업**: 마이그레이션 전에 코드를 백업합니다.
4. **문서화**: 변경 사항을 문서화합니다.

## 참고 자료

- [FSD 아키텍처 문서](./architecture.md)
- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)

