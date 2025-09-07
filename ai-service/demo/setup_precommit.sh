# Pre-commit 설치 및 실행 스크립트

#!/bin/bash

# AI Service Pre-commit 설정 스크립트
# 이 스크립트는 ai-service/demo 디렉토리에서 실행해야 합니다

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 AI Service Pre-commit 설정을 시작합니다..."

# 현재 디렉토리 확인
if [ ! -f "requirements.txt" ]; then
    echo "❌ 오류: ai-service/demo 디렉토리에서 실행해주세요"
    exit 1
fi

echo "✅ 올바른 디렉토리에서 실행 중입니다"

# Python 가상환경 확인
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  가상환경이 활성화되지 않았습니다"
    echo "가상환경을 활성화한 후 다시 실행해주세요"
    exit 1
fi

echo "✅ 가상환경이 활성화되어 있습니다: $VIRTUAL_ENV"

# 필요한 패키지 설치
echo "📦 필요한 패키지들을 설치합니다..."

# requirements.txt에 pre-commit 추가 (이미 있으면 무시)
if ! grep -q "pre-commit" requirements.txt; then
    echo "pre-commit>=3.0.0" >> requirements.txt
    echo "✅ requirements.txt에 pre-commit 추가됨"
fi

# 패키지 설치
pip install -r requirements.txt

echo "✅ 패키지 설치 완료"

# pre-commit 설치
echo "🔧 Pre-commit 훅을 설치합니다..."
pre-commit install

echo "✅ Pre-commit 훅 설치 완료"

# 설정 파일 존재 확인
echo "📋 설정 파일들을 확인합니다..."

config_files=(
    ".pre-commit-config.yaml"
    "pyproject.toml"
    ".isort.cfg"
    "mypy.ini"
    ".bandit"
    ".flake8"
    ".pydocstyle"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 존재"
    else
        echo "❌ $file 누락"
        exit 1
    fi
done

echo "✅ 모든 설정 파일이 존재합니다"

# 첫 번째 실행 (모든 파일 검사)
echo "🔍 모든 파일에 대해 첫 번째 검사를 실행합니다..."
echo "이 과정은 시간이 걸릴 수 있습니다..."

if pre-commit run --all-files; then
    echo "✅ 첫 번째 검사 완료"
else
    echo "⚠️  일부 파일에서 문제가 발견되었습니다"
    echo "자동으로 수정된 파일들을 확인하고 커밋해주세요"
fi

# 테스트 실행
echo "🧪 설정이 올바르게 작동하는지 테스트합니다..."

# 간단한 Python 파일 생성하여 테스트
cat > test_linting.py << 'EOF'
"""Test file for pre-commit hooks."""

import os
import sys
from typing import List, Optional


def test_function(param1: str, param2: Optional[int] = None) -> List[str]:
    """Test function for linting.
    
    Args:
        param1: First parameter
        param2: Second parameter
        
    Returns:
        List of strings
    """
    result = []
    if param2:
        result.append(f"{param1}: {param2}")
    return result


if __name__ == "__main__":
    print("Test file created successfully")
EOF

echo "✅ 테스트 파일 생성됨"

# 테스트 파일에 대해 pre-commit 실행
echo "🔍 테스트 파일에 대해 pre-commit을 실행합니다..."
if pre-commit run --files test_linting.py; then
    echo "✅ 테스트 파일 검사 통과"
else
    echo "⚠️  테스트 파일에서 문제 발견됨"
fi

# 테스트 파일 정리
rm -f test_linting.py
echo "✅ 테스트 파일 정리 완료"

# 최종 상태 확인
echo "📊 최종 상태를 확인합니다..."

# pre-commit 버전 확인
echo "Pre-commit 버전: $(pre-commit --version)"

# 설치된 훅 확인
echo "설치된 훅들:"
pre-commit run --help | grep -A 20 "Available hooks:" || echo "훅 목록을 확인할 수 없습니다"

echo ""
echo "🎉 Pre-commit 설정이 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. git add ."
echo "2. git commit -m 'feat: add pre-commit configuration'"
echo "3. 코드 변경 후 git commit 시 자동으로 검사됩니다"
echo ""
echo "🔧 수동 실행:"
echo "  pre-commit run --all-files    # 모든 파일 검사"
echo "  pre-commit run ruff          # Ruff만 실행"
echo "  pre-commit run mypy          # mypy만 실행"
echo ""
echo "📚 자세한 내용은 PRE_COMMIT_GUIDE.md를 참조하세요"
