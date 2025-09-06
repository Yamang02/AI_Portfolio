"""
Factory 패턴 테스트 스크립트
"""

import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_factory_pattern():
    """Factory 패턴 테스트"""
    try:
        # Factory 클래스들 import 테스트
        from src.adapters.outbound.llm.llm_factory import LLMAdapterFactory, LLMProvider
        from src.adapters.outbound.embedding.embedding_factory import EmbeddingAdapterFactory, EmbeddingProvider
        from src.adapters.outbound.databases.database_factory import DatabaseAdapterFactory, DatabaseProvider
        
        print("✅ Factory 클래스들 import 성공")
        
        # 지원하는 제공자 목록 테스트
        llm_providers = LLMAdapterFactory.get_supported_providers()
        embedding_providers = EmbeddingAdapterFactory.get_supported_providers()
        db_providers = DatabaseAdapterFactory.get_supported_providers()
        
        print(f"✅ LLM 제공자: {llm_providers}")
        print(f"✅ 임베딩 제공자: {embedding_providers}")
        print(f"✅ 데이터베이스 제공자: {db_providers}")
        
        return True
        
    except Exception as e:
        print(f"❌ Factory 패턴 테스트 실패: {e}")
        return False

if __name__ == "__main__":
    test_factory_pattern()

