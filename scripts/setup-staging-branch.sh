#!/bin/bash

# 스테이징 브랜치 설정 및 첫 배포 스크립트

echo "🌿 스테이징 브랜치 설정 시작..."

# 현재 브랜치 확인
current_branch=$(git branch --show-current)
echo "현재 브랜치: $current_branch"

# staging 브랜치가 이미 있는지 확인
if git show-ref --verify --quiet refs/heads/staging; then
    echo "✅ staging 브랜치가 이미 존재합니다."
    git checkout staging
    git pull origin staging
else
    echo "🆕 staging 브랜치를 생성합니다..."
    git checkout -b staging
fi

# develop 브랜치의 최신 변경사항 머지
echo "🔄 develop 브랜치 변경사항을 staging에 머지..."
git merge develop --no-ff -m "Merge develop into staging for deployment"

# 원격 저장소에 푸시
echo "📤 staging 브랜치를 원격 저장소에 푸시..."
git push origin staging

echo ""
echo "✅ 스테이징 브랜치 설정 완료!"
echo ""
echo "🚀 다음 단계:"
echo "1. GitHub Actions 워크플로우가 자동으로 실행됩니다"
echo "2. GitHub 리포지토리의 Actions 탭에서 진행상황을 확인하세요"
echo "3. 배포 완료 후 스테이징 URL에서 테스트하세요"
echo ""
echo "📱 GitHub Actions 확인: https://github.com/Yamang02/AI_Portfolio/actions"