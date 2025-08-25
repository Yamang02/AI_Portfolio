# Knowledge Base v2.0

## 🚀 개요

확장 가능한 다중 프로젝트 지원 지식베이스 시스템입니다. JSON 스키마 기반으로 구조화되어 있으며, AI 서비스와의 효율적인 연동을 지원합니다.

## 📁 구조

```
knowledge-base-v2/
├── schemas/                    # JSON 스키마 정의
│   ├── project-schema.json    # 프로젝트 메타데이터 스키마
│   └── content-schema.json    # 콘텐츠 스키마
├── projects/                   # 프로젝트별 데이터
│   └── ai-portfolio/
│       ├── metadata.json      # 프로젝트 메타데이터
│       └── content/           # 구조화된 콘텐츠
│           ├── architecture.json
│           ├── ai-services.json
│           ├── deployment.json
│           ├── frontend.json
│           └── development.json
├── shared/                     # 공통 지식베이스
│   ├── general-tech/
│   └── best-practices/
└── README.md
```

## 🎯 주요 특징

### ✅ **확장성**
- 새로운 프로젝트 추가 시 독립적 구성 가능
- 프로젝트별 고유 카테고리 및 태그 시스템
- JSON 스키마 기반 데이터 검증

### ✅ **검색 최적화** 
- 구조화된 메타데이터 (태그, 키워드, 카테고리)
- 난이도별, 우선순위별 필터링 지원
- 관련 콘텐츠 연결 시스템

### ✅ **AI 서비스 친화적**
- JSON 형태로 프로그래밍적 접근 용이
- 임베딩에 최적화된 텍스트 구조
- 메타데이터 기반 벡터 필터링 지원

## 📋 컨텐츠 스키마

### 기본 구조
```json
{
  "id": "unique-content-id",
  "project_id": "ai-portfolio", 
  "type": "qa",
  "category": "architecture",
  "title": "제목",
  "question": "질문",
  "answer": "답변",
  "tags": ["tag1", "tag2"],
  "keywords": ["키워드1", "키워드2"],
  "difficulty": "intermediate",
  "priority": 8,
  "related_content": ["related-id1"]
}
```

### 지원 콘텐츠 타입
- **qa**: 질문-답변 형태
- **documentation**: 문서 형태
- **tutorial**: 튜토리얼
- **reference**: 참조 자료
- **example**: 예시 코드/구현

## 🔧 AI 서비스 연동

### 데이터 로딩
```python
import json
from pathlib import Path

def load_project_knowledge(project_id: str):
    project_path = Path(f"knowledge-base-v2/projects/{project_id}")
    metadata = json.load(open(project_path / "metadata.json"))
    
    content = {}
    for content_file in (project_path / "content").glob("*.json"):
        category = content_file.stem
        content[category] = json.load(open(content_file))
    
    return metadata, content
```

### 검색 최적화
- **임베딩 단위**: 개별 Q&A 또는 콘텐츠 항목
- **메타데이터 필터링**: 카테고리, 태그, 난이도별
- **우선순위 가중치**: priority 필드 활용

## 📊 현재 데이터

### AI Portfolio 프로젝트
- **아키텍처**: 4개 Q&A (헥사고날 아키텍처, 패키지 구조 등)
- **AI 서비스**: 6개 Q&A (RAG, 벡터DB, 캐싱 등)
- **배포**: 추가 예정
- **프론트엔드**: 추가 예정
- **개발 프로세스**: 추가 예정

## 🚀 사용 방법

### 새 프로젝트 추가
1. `projects/` 아래 새 디렉토리 생성
2. `metadata.json` 프로젝트 정보 정의
3. `content/` 디렉토리에 카테고리별 JSON 파일 추가

### 콘텐츠 추가
1. 해당 프로젝트의 카테고리 JSON 파일 편집
2. 콘텐츠 스키마에 맞춰 새 항목 추가
3. 관련 콘텐츠 연결 설정

## 🔄 마이그레이션

기존 `knowledge-base/` → `knowledge-base-v2/` 마이그레이션:
- ✅ 스키마 정의 완료
- ✅ AI Portfolio 메타데이터 구성
- ✅ 아키텍처 및 AI 서비스 콘텐츠 변환
- 🔄 나머지 콘텐츠 변환 진행중

## 📈 로드맵

- [ ] 전체 콘텐츠 변환 완료
- [ ] AI 서비스 로딩 로직 구현
- [ ] 벡터스토어 연동 최적화
- [ ] 실시간 업데이트 시스템 구축