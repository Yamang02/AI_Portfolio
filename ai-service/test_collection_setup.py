#!/usr/bin/env python3
"""
컬렉션 초기화 테스트 스크립트
Task 1.2 벡터 데이터베이스 환경 구성 테스트용
"""

import asyncio
import os
import sys
from pathlib import Path

# 프로젝트 루트를 Python path에 추가
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from qdrant_client import QdrantClient
from app.services.collection_manager import CollectionManager
from app.config import get_settings

async def test_collection_setup():
    """컬렉션 설정 테스트"""
    print("🔧 벡터 데이터베이스 컬렉션 초기화 테스트 시작...")
    
    try:
        # 설정 로드
        settings = get_settings()
        print(f"✅ 설정 로드 완료")
        print(f"   - Qdrant URL: {settings.qdrant_url}")
        print(f"   - Qdrant API Key: {'SET' if settings.qdrant_api_key else 'NOT SET'}")
        
        # Qdrant 클라이언트 생성
        if settings.qdrant_api_key:
            client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key
            )
            print(f"✅ Qdrant Cloud 클라이언트 생성 완료")
        else:
            client = QdrantClient(
                url=settings.qdrant_url
            )
            print(f"✅ 로컬 Qdrant 클라이언트 생성 완료")
        
        # 연결 테스트
        try:
            collections = client.get_collections()
            print(f"✅ Qdrant 서버 연결 성공")
            print(f"   - 기존 컬렉션 수: {len(collections.collections)}")
        except Exception as e:
            print(f"❌ Qdrant 서버 연결 실패: {e}")
            print("   Docker Compose가 실행 중인지 확인하세요:")
            print("   docker-compose -f docker-compose.ai.yml up -d qdrant")
            return False
        
        # 컬렉션 매니저 초기화
        collection_manager = CollectionManager(client)
        print(f"✅ 컬렉션 매니저 생성 완료")
        
        # 모든 컬렉션 초기화
        await collection_manager.initialize_all_collections()
        print(f"✅ 컬렉션 초기화 완료")
        
        # 컬렉션 확인
        collections = client.get_collections()
        collection_names = [c.name for c in collections.collections]
        print(f"   실제 생성된 컬렉션: {collection_names}")
        
        expected_collections = ["portfolio_embeddings", "project_embeddings", "skill_embeddings", "experience_embeddings"]
        created_collections = []
        
        for collection_name in expected_collections:
            if collection_name in collection_names:
                created_collections.append(collection_name)
                print(f"   ✅ {collection_name} - 생성 완료")
        
        print(f"\n✅ 테스트 완료!")
        print(f"   - 생성된 컬렉션: {', '.join(created_collections)}")
        print(f"   - 총 컬렉션 수: {len(created_collections)}/{len(expected_collections)}")
        
        return len(created_collections) == len(expected_collections)
        
    except Exception as e:
        print(f"❌ 테스트 실패: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """메인 함수"""
    print("=" * 60)
    print("🚀 Task 1.2 벡터 데이터베이스 환경 구성 테스트")
    print("=" * 60)
    
    # .env 파일 확인
    env_path = project_root / ".env"
    if not env_path.exists():
        print(f"❌ .env 파일이 없습니다: {env_path}")
        print("   .env.example을 참고해서 .env 파일을 생성하세요.")
        return False
    
    # 비동기 테스트 실행
    success = asyncio.run(test_collection_setup())
    
    if success:
        print("\n🎉 Task 1.2 벡터 데이터베이스 환경 구성이 성공적으로 완료되었습니다!")
        print("\n다음 단계:")
        print("1. 벡터 임베딩 생성 테스트: python scripts/test_vector_operations.py")
        print("2. 전체 AI 서비스 테스트: python scripts/test_ai_service.py")
        print("3. Docker 환경 테스트: ./scripts/run-dev.sh")
    else:
        print("\n❌ Task 1.2 테스트에 실패했습니다. 위의 오류를 확인해주세요.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)