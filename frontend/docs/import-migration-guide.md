# Import 경로 마이그레이션 가이드

## 개요

이 문서는 기존 코드의 import 경로를 FSD 아키텍처에 맞게 업데이트하는 방법을 설명합니다.

## 주요 변경사항

### 1. Features Import 경로 변경

**Before:**
```typescript
import { Chatbot } from '../../features/chatbot';
import { PortfolioSection } from '../../features/projects';
import { CoreTechStackSection } from '../../features/introduction';
```

**After:**
```typescript
import { Chatbot } from '@features/chatbot';
import { PortfolioSection } from '@features/project-gallery';
import { CoreTechStackSection } from '@features/introduction';
```

### 2. Entities Import 경로 변경

**Before:**
```typescript
import { Project } from '../../entities/project';
import { useProjectsQuery } from '../../entities/project/api/useProjectsQuery';
```

**After:**
```typescript
import { Project, useProjectsQuery } from '@entities/project';
```

### 3. Shared Import 경로 변경

**Before:**
```typescript
import { ChatInputBar } from '../../../shared/ui/ChatInputBar';
import { apiClient } from '../../../shared/api/apiClient';
```

**After:**
```typescript
import { ChatInputBar } from '@shared/ui/chat';
import { apiClient } from '@shared/api/apiClient';
```

## 업데이트해야 할 파일 목록

### Features 관련
- [ ] `src/main/layout/components/HomePage.tsx`
- [ ] `src/main/pages/ProjectDetail/ProjectDetailPage.tsx`
- [ ] `src/main/layout/components/HeroSection.tsx`
- [ ] `src/main/components/common/Modal/ProjectModal.tsx`
- [ ] `src/main/pages/ProjectDetail/components/*.tsx`

### Entities 관련
- [ ] `src/main/features/projects/components/*.tsx`
- [ ] `src/main/pages/ProjectDetail/**/*.tsx`
- [ ] `src/admin/**/*.tsx`

## 자동화 스크립트

다음 명령어로 일괄 변경할 수 있습니다 (주의: 백업 후 실행):

```bash
# Windows PowerShell
# Features 경로 변경
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | ForEach-Object {
    (Get-Content $_.FullName) -replace "from ['\"]\.\.\/\.\.\/features\/", "from '@features/" | Set-Content $_.FullName
    (Get-Content $_.FullName) -replace "from ['\"]\.\.\/features\/", "from '@features/" | Set-Content $_.FullName
}

# Entities 경로 변경
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | ForEach-Object {
    (Get-Content $_.FullName) -replace "from ['\"]\.\.\/\.\.\/entities\/", "from '@entities/" | Set-Content $_.FullName
    (Get-Content $_.FullName) -replace "from ['\"]\.\.\/entities\/", "from '@entities/" | Set-Content $_.FullName
}
```

## 수동 업데이트 예시

### 예시 1: HomePage.tsx

**Before:**
```typescript
import { PortfolioSection } from '../../features/projects';
import { Chatbot } from '../../features/chatbot';
```

**After:**
```typescript
import { PortfolioSection } from '@features/project-gallery';
import { Chatbot } from '@features/chatbot';
```

### 예시 2: ProjectDetailPage.tsx

**Before:**
```typescript
import { useTOC, useActiveSection } from '../../features/projects/hooks';
import { Chatbot } from '../../features/chatbot';
```

**After:**
```typescript
import { useTOC, useActiveSection } from '@features/project-gallery/hooks';
import { Chatbot } from '@features/chatbot';
```

## 주의사항

1. **상대 경로 vs 절대 경로**: 같은 레이어 내부에서는 상대 경로 사용 가능, 다른 레이어로는 path alias 사용
2. **테스트**: 각 파일 변경 후 빌드 및 실행 테스트 필수
3. **점진적 변경**: 한 번에 모든 파일을 변경하지 말고 단계적으로 진행

