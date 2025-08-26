# AI-Service Requirements 관리

## 파일 구조

### 로컬 개발용
- **`requirements-local.txt`**: 로컬 개발 시 사용하는 단일 파일
  - 모든 의존성을 하나의 파일에 포함
  - 빠른 설치: `pip install -r requirements-local.txt`

### Docker 배포용 (멀티스테이지 빌드)
- **`requirements-base.txt`**: 기본 의존성 (변경 빈도 낮음)
  - FastAPI, 데이터베이스, 유틸리티 등
- **`requirements-ml.txt`**: ML/AI 의존성 (용량 큼)
  - LangChain, Transformers, 임베딩 모델 등
- **`requirements.txt`**: Docker 빌드 시 사용 (현재는 안내용)

## 사용법

### 로컬 개발
```bash
# 로컬 개발 시
pip install -r requirements-local.txt
```

### Docker 빌드
```bash
# Docker 빌드 시 (자동으로 base + ml 조합 사용)
docker build -t ai-service .
```

## 새로운 의존성 추가 시

### 1. 로컬 개발용에 추가
```bash
# requirements-local.txt에 패키지 추가
echo "new-package==1.0.0" >> requirements-local.txt
```

### 2. Docker 배포용에 추가
**기본 의존성인 경우:**
```bash
# requirements-base.txt에 추가
echo "new-package==1.0.0" >> requirements-base.txt
```

**ML/AI 관련인 경우:**
```bash
# requirements-ml.txt에 추가
echo "new-package==1.0.0" >> requirements-ml.txt
```

## 주의사항

- **로컬과 배포 환경 동기화**: 새로운 패키지를 추가할 때는 두 환경 모두에 추가해야 함
- **버전 일치**: 로컬과 배포 환경의 패키지 버전을 일치시켜야 함
- **CI/CD 오류 방지**: Docker 빌드 시 누락된 패키지로 인한 오류를 방지하기 위해 적절한 파일에 추가

## 현재 구조

```
ai-service/
├── requirements-local.txt     # 로컬 개발용 (단일 파일)
├── requirements-base.txt      # Docker 기본 의존성
├── requirements-ml.txt        # Docker ML/AI 의존성
├── requirements.txt          # Docker 빌드 안내용
└── README-requirements.md    # 이 파일
```
