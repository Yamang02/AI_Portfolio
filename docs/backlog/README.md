# 백로그 (Backlog)

프로젝트 백로그, 아이디어, 계획 중인 피처 요청 등을 관리합니다.

## 📁 폴더 구조

```
backlog/
├── archive/        # 아카이브된 이슈 (에픽에 포함됨)
├── features/       # 활성 피처 요청
└── ideas.md        # 아이디어 모음

../epic/            # 에픽 문서 (상위 docs/epic 디렉토리)
├── frontend-structure-optimization.md
└── ux-data-loading-optimization.md
```

## 📝 사용 방법

### 이슈 관리
- **features/**: 새로운 기능 요청이나 개선 사항을 작성합니다.
- **아이디어**: 향후 검토할 아이디어들을 `ideas.md`에 기록합니다.

### 에픽 관리
- **에픽 생성**: 여러 관련 이슈를 묶어 `docs/epic/` 디렉토리에 에픽 문서를 작성합니다.
- **에픽 구조**:
  ```markdown
  # 에픽: [에픽명]

  ## 개요
  ## 목표
  ## 비즈니스 가치
  ## 포함된 이슈
  ## 완료 기준
  ## 우선순위 및 순서
  ## 리스크 및 대응 방안
  ```

### 아카이브 정책
- **아카이브 시점**: 이슈가 에픽에 포함되면 자동으로 `archive/` 디렉토리로 이동합니다.
- **에픽 링크**: 아카이브된 이슈는 헤더에 에픽 링크를 포함합니다.
  ```markdown
  # [ISSUE] 이슈 제목

  **에픽**: [에픽명](../../epic/epic-name.md)
  ```
- **아카이브 파일 네이밍**: 원본 파일명 유지 (예: `frontend-structure-refactoring.md`)

### 이슈 작성 가이드
1. **제목**: 명확하고 구체적인 제목 사용
2. **메타데이터**: 작성일, 우선순위, 카테고리, 상태 포함
3. **문제 요약**: 해결하려는 문제를 간결하게 설명
4. **주요 작업**: 체크리스트 형식으로 작업 항목 나열
5. **완료 기준**: 명확한 완료 조건 정의

## 🔗 관련 문서

- [에픽 디렉토리](../epic/): 전체 에픽 목록
- [프론트엔드 아키텍처](../technical/architecture/frontend-architecture.md)
- [백엔드 아키텍처](../technical/architecture/backend-architecture-guide.md)
