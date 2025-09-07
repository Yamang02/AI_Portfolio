# AI Service Pre-commit 설정 가이드

## 📋 개요

AI Service 프로젝트에 pre-commit 단계에서 실행되는 linter 설정을 구성했습니다. 이를 통해 코드 품질, 보안, 스타일 일관성을 자동으로 검사하고 유지할 수 있습니다.

## 🛠️ 설치된 도구들

### 1. **Ruff** - 빠른 Python linter/formatter
- **역할**: 코드 스타일 검사 및 자동 수정
- **설정**: `pyproject.toml`
- **특징**: 매우 빠른 속도, Black과 호환

### 2. **isort** - Import 정렬
- **역할**: Python import 문 자동 정렬
- **설정**: `.isort.cfg`
- **특징**: Black 프로필과 호환

### 3. **mypy** - 타입 체크
- **역할**: 정적 타입 검사
- **설정**: `mypy.ini`
- **특징**: 타입 안전성 보장

### 4. **bandit** - 보안 취약점 검사
- **역할**: 보안 취약점 탐지
- **설정**: `.bandit`
- **특징**: OWASP Top 10 기반 검사

### 5. **flake8** - 스타일 가이드 검사
- **역할**: PEP 8 스타일 가이드 준수 검사
- **설정**: `.flake8`
- **특징**: 추가 플러그인 지원

### 6. **pydocstyle** - Docstring 검사
- **역할**: Docstring 스타일 검사
- **설정**: `.pydocstyle`
- **특징**: Google 스타일 docstring 지원

### 7. **pre-commit-hooks** - 기본 Git 훅들
- **역할**: 기본적인 파일 검사
- **특징**: trailing whitespace, merge conflict 등 검사

## 🚀 설치 및 설정

### 1. Pre-commit 설치
```bash
# ai-service/demo 디렉토리에서 실행
pip install pre-commit

# 또는 requirements.txt에 추가
echo "pre-commit>=3.0.0" >> requirements.txt
pip install -r requirements.txt
```

### 2. Pre-commit 훅 설치
```bash
# ai-service/demo 디렉토리에서 실행
pre-commit install
```

### 3. 모든 파일에 대해 한 번 실행
```bash
# 기존 파일들도 검사하고 수정
pre-commit run --all-files
```

## 📁 생성된 설정 파일들

```
ai-service/demo/
├── .pre-commit-config.yaml    # Pre-commit 메인 설정
├── pyproject.toml            # Ruff 설정
├── .isort.cfg               # isort 설정
├── mypy.ini                 # mypy 설정
├── .bandit                  # bandit 설정
├── .flake8                  # flake8 설정
└── .pydocstyle              # pydocstyle 설정
```

## 🔧 설정 파일 설명

### `.pre-commit-config.yaml`
- 모든 linter를 통합하는 메인 설정 파일
- 각 도구의 버전과 실행 옵션 정의
- CI 환경에서의 동작 방식 설정

### `pyproject.toml` (Ruff 설정)
```toml
[tool.ruff]
target-version = "py311"
line-length = 88
lint.enable = ["E", "W", "F", "I", "B", "C4", "UP", "ARG", "SIM", "TCH", "Q", "RUF"]
```

### `.isort.cfg` (Import 정렬)
```ini
[settings]
profile = black
line_length = 88
known_first_party = ["demo", "application", "domain", "infrastructure", "config"]
```

### `mypy.ini` (타입 체크)
```ini
[tool.mypy]
python_version = "3.11"
ignore_missing_imports = true
exclude = ["tests/", "test_*.py", "*_test.py"]
```

## 🎯 사용법

### 자동 실행 (권장)
```bash
# Git 커밋 시 자동으로 실행됨
git add .
git commit -m "feat: add new feature"
# pre-commit 훅이 자동으로 실행되어 코드 검사 및 수정
```

### 수동 실행
```bash
# 모든 파일 검사
pre-commit run --all-files

# 특정 훅만 실행
pre-commit run ruff
pre-commit run mypy
pre-commit run bandit

# 특정 파일만 검사
pre-commit run --files application/usecases/document/add_document_usecase.py
```

### 훅 업데이트
```bash
# 모든 훅을 최신 버전으로 업데이트
pre-commit autoupdate

# 특정 훅만 업데이트
pre-commit autoupdate --repo https://github.com/astral-sh/ruff-pre-commit
```

## ⚙️ 커스터마이징

### 특정 파일 제외
```yaml
# .pre-commit-config.yaml에서
- id: ruff
  exclude: '^tests/|^migrations/'
```

### 특정 규칙 비활성화
```toml
# pyproject.toml에서
[tool.ruff]
lint.disable = ["E501", "B008"]
```

### 새로운 훅 추가
```yaml
# .pre-commit-config.yaml에 추가
- repo: https://github.com/pre-commit/mirrors-mypy
  rev: v1.13.0
  hooks:
    - id: mypy
      additional_dependencies: [types-requests]
```

## 🐛 문제 해결

### 훅 실행 실패 시
```bash
# 훅을 건너뛰고 커밋
git commit --no-verify -m "feat: urgent fix"

# 특정 훅만 건너뛰기
SKIP=mypy git commit -m "feat: add feature"
```

### 설정 파일 충돌
```bash
# 설정 파일 재생성
pre-commit clean
pre-commit install --install-hooks
```

### 성능 최적화
```bash
# 병렬 실행으로 속도 향상
pre-commit run --all-files --jobs 4
```

## 📊 CI/CD 통합

### GitHub Actions 예시
```yaml
name: Pre-commit
on: [push, pull_request]
jobs:
  pre-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - uses: pre-commit/action@v3.0.0
```

## 📈 모니터링

### 실행 결과 확인
```bash
# 마지막 실행 결과 확인
pre-commit run --all-files --verbose

# 통계 정보 확인
pre-commit run --all-files --show-diff-on-failure
```

### 성능 측정
```bash
# 실행 시간 측정
time pre-commit run --all-files
```

## 🔄 업데이트 및 유지보수

### 정기 업데이트
```bash
# 월 1회 실행 권장
pre-commit autoupdate
pre-commit run --all-files
```

### 새로운 도구 추가
1. `.pre-commit-config.yaml`에 새 훅 추가
2. 필요한 설정 파일 생성
3. `pre-commit install` 재실행
4. 테스트 실행

## 📚 참고 자료

- [Pre-commit 공식 문서](https://pre-commit.com/)
- [Ruff 문서](https://docs.astral.sh/ruff/)
- [mypy 문서](https://mypy.readthedocs.io/)
- [Bandit 문서](https://bandit.readthedocs.io/)

---

*설정 완료 후 `pre-commit run --all-files`로 모든 파일을 검사하여 설정이 올바르게 작동하는지 확인하세요!*
