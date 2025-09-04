# AI Portfolio - Hexagonal Architecture

## 🏗️ 완전히 분리된 헥사고널 아키텍처

이 프로젝트는 완전히 분리된 헥사고널 아키텍처를 사용하여 구축된 AI 포트폴리오 시스템입니다.

## 📁 프로젝트 구조

```
📁 ai-service/
├── core/                          # 공통 핵심 (공유 커널)
│   ├── shared-kernel/             # 공유 커널
│   │   ├── value_objects/         # 값 객체
│   │   ├── common_validations.py  # 공통 유효성 검사
│   │   ├── config/                # 설정 파일들
│   │   └── monitoring/            # 모니터링
│   ├── core/                      # 기존 코어 서비스들
│   ├── config/                    # 환경별 설정
│   ├── .env.example               # 환경 변수 예시
│   ├── test_factory.py            # 테스트 팩토리
│   └── README.md                  # 코어 문서
├── demo/                          # 데모 헥사고널 (완전히 분리)
│   ├── domain/                    # 데모 도메인
│   ├── application/               # 데모 애플리케이션
│   ├── adapters/                  # 데모 어댑터
│   ├── sampledata/                # 샘플 데이터
│   ├── main.py                    # 데모 메인
│   ├── main_new.py                # 새로운 헥사고널 메인
│   ├── demo_legacy.py             # 레거시 데모
│   ├── main_legacy.py             # 레거시 메인
│   ├── Dockerfile                 # 데모 도커파일
│   └── requirements.txt           # 데모 요구사항
└── prod/                          # 프로덕션 헥사고널 (완전히 분리)
    ├── domain/                    # 프로덕션 도메인
    ├── application/               # 프로덕션 애플리케이션
    ├── adapters/                  # 프로덕션 어댑터
    ├── main.py                    # 프로덕션 메인
    ├── Dockerfile                 # 프로덕션 도커파일
    └── requirements.txt           # 프로덕션 요구사항
```

## 🎯 아키텍처 특징

### **완전한 분리**
- **`demo/`**: 독립적인 헥사고널 아키텍처 (Gradio UI)
- **`prod/`**: 독립적인 헥사고널 아키텍처 (FastAPI API)
- **`core/`**: 공통 핵심만 제공 (공유 커널)

### **의존성 방향**
```
demo/ → core/ ← prod/
```

### **각각이 완전한 헥사고널**
- 각 환경이 독립적인 도메인, 애플리케이션, 어댑터 레이어를 가짐
- 공통 핵심만 `core/`에서 공유
- 환경별 특화된 구현 가능

## 🚀 실행 방법

### **데모 실행**
```bash
cd ai-service/demo
python main_new.py
```

### **프로덕션 실행**
```bash
cd ai-service/prod
python main.py
```

## 📚 문서

- [코어 문서](core/README.md)
- [데모 가이드](demo/README.md)
- [프로덕션 가이드](prod/README.md)

## 🔧 개발 환경

- Python 3.11+
- FastAPI (프로덕션)
- Gradio (데모)
- Hexagonal Architecture
- RAG (Retrieval Augmented Generation)
