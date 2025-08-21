#!/usr/bin/env python3
"""
벡터 스토어 기본 CRUD 테스트 스크립트
"""

import asyncio
import sys
import json
from typing import Dict, List, Any
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import numpy as np


async def test_vector_operations():
    """벡터 CRUD 작업 테스트"""
    print("🧪 벡터 스토어 CRUD 테스트 시작\n")
    
    # Qdrant 클라이언트 연결
    client = QdrantClient(host="localhost", port=6333)
    
    try:
        # 1. 컬렉션 목록 조회
        print("📋 1. 컬렉션 목록 조회")
        collections = client.get_collections()
        print(f"   총 {len(collections.collections)}개 컬렉션:")
        for col in collections.collections:
            print(f"   - {col.name}")
        print()
        
        # 2. 테스트 데이터 생성
        print("📝 2. 테스트 데이터 생성")
        test_collection = "portfolio_embeddings"
        
        # 384차원 랜덤 벡터 생성 (임시)
        test_vectors = []
        test_data = [
            {
                "id": "portfolio_001",
                "content": "안녕하세요! 저는 풀스택 개발자입니다.",
                "metadata": {
                    "section": "profile",
                    "title": "자기소개",
                    "language": "ko",
                    "priority": 10
                }
            },
            {
                "id": "portfolio_002", 
                "content": "Python, JavaScript, React, Spring Boot를 주로 사용합니다.",
                "metadata": {
                    "section": "skills",
                    "title": "주요 기술",
                    "language": "ko", 
                    "priority": 9
                }
            },
            {
                "id": "portfolio_003",
                "content": "AI 챗봇 프로젝트를 개발했습니다.",
                "metadata": {
                    "section": "projects",
                    "title": "AI 챗봇 프로젝트",
                    "language": "ko",
                    "priority": 8
                }
            }
        ]
        
        for item in test_data:
            # 임시로 랜덤 벡터 생성 (실제로는 임베딩 모델 사용)
            vector = np.random.rand(384).tolist()
            
            point = PointStruct(
                id=item["id"],
                vector=vector,
                payload=item["metadata"]
            )
            test_vectors.append(point)
        
        print(f"   {len(test_vectors)}개 테스트 포인트 생성 완료")
        print()
        
        # 3. 벡터 업서트
        print("⬆️ 3. 벡터 업서트")
        client.upsert(
            collection_name=test_collection,
            points=test_vectors
        )
        print(f"   {len(test_vectors)}개 포인트 업서트 완료")
        print()
        
        # 4. 컬렉션 통계 확인
        print("📊 4. 컬렉션 통계 확인")
        collection_info = client.get_collection(test_collection)
        print(f"   포인트 수: {collection_info.points_count}")
        print(f"   인덱스된 벡터 수: {collection_info.indexed_vectors_count}")
        print(f"   상태: {collection_info.status.value}")
        print()
        
        # 5. 포인트 조회
        print("🔍 5. 포인트 조회")
        points = client.retrieve(
            collection_name=test_collection,
            ids=["portfolio_001", "portfolio_002"],
            with_payload=True,
            with_vectors=False  # 벡터는 제외하고 메타데이터만
        )
        
        print(f"   조회된 포인트 수: {len(points)}")
        for point in points:
            print(f"   - ID: {point.id}")
            print(f"     섹션: {point.payload.get('section')}")
            print(f"     제목: {point.payload.get('title')}")
        print()
        
        # 6. 유사도 검색 (랜덤 벡터로)
        print("🎯 6. 유사도 검색 테스트")
        query_vector = np.random.rand(384).tolist()
        
        search_results = client.search(
            collection_name=test_collection,
            query_vector=query_vector,
            limit=3,
            with_payload=True,
            with_vectors=False
        )
        
        print(f"   검색 결과 수: {len(search_results)}")
        for i, result in enumerate(search_results, 1):
            print(f"   {i}. ID: {result.id}")
            print(f"      점수: {result.score:.4f}")
            print(f"      제목: {result.payload.get('title')}")
        print()
        
        # 7. 필터링 검색
        print("🔎 7. 필터링 검색 테스트")
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        
        filtered_results = client.search(
            collection_name=test_collection,
            query_vector=query_vector,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="section",
                        match=MatchValue(value="profile")
                    )
                ]
            ),
            limit=5,
            with_payload=True
        )
        
        print(f"   'profile' 섹션 검색 결과: {len(filtered_results)}")
        for result in filtered_results:
            print(f"   - {result.payload.get('title')}: {result.score:.4f}")
        print()
        
        # 8. 포인트 삭제 테스트
        print("🗑️ 8. 포인트 삭제 테스트")
        client.delete(
            collection_name=test_collection,
            points_selector=["portfolio_003"]
        )
        print("   포인트 'portfolio_003' 삭제 완료")
        
        # 삭제 후 통계 확인
        collection_info = client.get_collection(test_collection)
        print(f"   삭제 후 포인트 수: {collection_info.points_count}")
        print()
        
        print("✅ 모든 벡터 CRUD 테스트 완료!")
        
    except Exception as e:
        print(f"❌ 테스트 실패: {e}")
        sys.exit(1)
    
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(test_vector_operations())