# AI Portfolio Service - Common Infrastructure

이 디렉토리는 AI Portfolio Service의 공통 인프라스트럭처를 포함합니다.

## 📁 구조

```
common/
├── config/                     # 공통 설정 파일들
│   ├── base.yaml              # 기본 설정
│   ├── production.yaml        # 프로덕션 환경 설정
│   ├── development.yaml       # 개발 환경 설정
│   └── README.md              # 설정 가이드
├── shared/                    # 공유 컴포넌트들
│   ├── infrastructure/        # 인프라 컴포넌트
│   │   ├── config_manager.py  # 설정 관리자
│   │   ├── chunking/          # 텍스트 청킹 관련
│   │   └── prompts/           # 프롬프트 템플릿
│   ├── logging/               # 로깅 유틸리티
│   ├── monitoring/            # 모니터링 도구
│   └── value_objects/         # 공통 값 객체
└── README.md                  # 이 파일
```

## 🎯 목적

이 디렉토리는 **Demo**와 **Production** 환경에서 **공통으로 사용되는** 컴포넌트들을 포함합니다:

### ✅ 공유하는 것들
- **도메인 엔티티**: Document, Chunk 등 기본 도메인 객체
- **포트 인터페이스**: LLMPort, VectorStorePort 등 추상 인터페이스
- **공통 유틸리티**: 로깅, 모니터링, 검증 등
- **기본 설정**: 공통 비즈니스 규칙, 기본값 등

### ❌ 분리된 것들
- **Demo 설정**: `demo/config/` 디렉토리로 이동
- **Production 설정**: `prod/config/` 디렉토리로 이동
- **환경별 어댑터**: 각 환경의 `adapters/` 디렉토리에서 관리
- **환경별 서비스**: 각 환경의 `services/` 디렉토리에서 관리

## 🔧 사용법

### 설정 관리자 사용
```python
from common.shared.infrastructure.config_manager import get_config_manager

# 환경별 설정 로드
config_manager = get_config_manager("production")  # 또는 "development"
```

### 공통 컴포넌트 사용
```python
from common.shared.value_objects.document_entities import Document
from common.shared.infrastructure.chunking.chunking_config_manager import ChunkingConfigManager
```

## 📋 변경 사항

### Demo 관련 내용 분리 완료
- `usecase_config.py` → `demo/config/usecase_config.py`
- `adapter_config.py` → `demo/config/adapter_config.py`  
- `service_config.py` → `demo/config/service_config.py`
- `demo.yaml` → `demo/config/demo.yaml`

### 새로운 Demo 설정 구조
```
demo/config/
├── demo_config_manager.py    # Demo 전용 설정 관리자
├── usecase_config.py         # Demo UseCase 설정
├── adapter_config.py         # Demo Adapter 설정 (Gradio UI)
├── service_config.py         # Demo Service 설정
├── demo.yaml                 # Demo 환경 설정
└── gradio.yaml               # Gradio UI 특화 설정
```

## 🚀 장점

1. **명확한 분리**: Demo와 Production이 독립적으로 관리
2. **공통 부분 최소화**: 정말 필요한 것만 공유
3. **유지보수성 향상**: 각 환경별로 최적화된 설정
4. **확장성**: 새로운 환경 추가 시 기존 환경에 영향 없음

## 📞 문의

공통 인프라에 대한 문의사항이 있으시면 이슈를 생성해 주세요.