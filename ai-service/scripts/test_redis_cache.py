#!/usr/bin/env python3
"""
Redis 캐시 시스템 테스트 스크립트
Task 1.3 구현 검증용
"""

import asyncio
import sys
import os
import json
import time
from typing import Dict, Any

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.cache import CacheManager, CacheKeys, RedisService
from app.config import get_settings


async def test_redis_connection():
    """Redis 연결 테스트"""
    print("=== Redis 연결 테스트 ===")
    
    redis_service = RedisService()
    
    try:
        is_available = redis_service.is_available()
        print(f"Redis 연결 상태: {'✅ 성공' if is_available else '❌ 실패'}")
        
        if is_available:
            info = redis_service.get_info()
            print(f"Redis 버전: {info.get('redis_version', 'N/A')}")
            print(f"사용 메모리: {info.get('used_memory_human', 'N/A')}")
            print(f"연결된 클라이언트: {info.get('connected_clients', 'N/A')}")
        
        return is_available
        
    except Exception as e:
        print(f"❌ Redis 연결 테스트 실패: {e}")
        return False
    finally:
        redis_service.close()


async def test_cache_keys():
    """캐시 키 생성 테스트"""
    print("\n=== 캐시 키 생성 테스트 ===")
    
    # 테스트 데이터
    test_question = "안녕하세요! 포트폴리오에 대해 알려주세요."
    test_user_id = "test_user_123"
    
    # 캐시 키 생성 테스트
    common_key = CacheKeys.chat_response(test_question)
    user_key = CacheKeys.chat_user_response(test_user_id, test_question)
    portfolio_key = CacheKeys.portfolio_data("projects")
    vector_key = CacheKeys.vector_search("프로젝트 검색")
    
    print(f"공통 채팅 키: {common_key}")
    print(f"사용자별 채팅 키: {user_key}")
    print(f"포트폴리오 키: {portfolio_key}")
    print(f"벡터 검색 키: {vector_key}")
    
    # 해시 일관성 테스트
    same_question_key = CacheKeys.chat_response(test_question)
    similar_question_key = CacheKeys.chat_response("안녕하세요! 포트폴리오에 대해 알려주세요.")  # 같은 내용
    different_question_key = CacheKeys.chat_response("다른 질문입니다.")
    
    print(f"\n해시 일관성 테스트:")
    print(f"동일 질문 키 일치: {'✅' if common_key == same_question_key else '❌'}")
    print(f"유사 질문 키 일치: {'✅' if common_key == similar_question_key else '❌'}")
    print(f"다른 질문 키 상이: {'✅' if common_key != different_question_key else '❌'}")


async def test_basic_cache_operations():
    """기본 캐시 CRUD 테스트"""
    print("\n=== 기본 캐시 CRUD 테스트 ===")
    
    redis_service = RedisService()
    
    if not redis_service.is_available():
        print("❌ Redis를 사용할 수 없어 테스트를 건너뜁니다.")
        return False
    
    try:
        test_key = "test:cache:basic"
        test_data = {
            "message": "테스트 데이터",
            "timestamp": time.time(),
            "number": 42,
            "list": [1, 2, 3]
        }
        
        # SET 테스트
        success = redis_service.set(test_key, test_data, ttl=60)
        print(f"데이터 저장: {'✅' if success else '❌'}")
        
        # GET 테스트
        retrieved_data = redis_service.get(test_key)
        data_match = retrieved_data == test_data
        print(f"데이터 조회: {'✅' if data_match else '❌'}")
        
        if not data_match:
            print(f"  원본: {test_data}")
            print(f"  조회: {retrieved_data}")
        
        # EXISTS 테스트
        exists = redis_service.exists(test_key)
        print(f"키 존재 확인: {'✅' if exists else '❌'}")
        
        # TTL 테스트
        ttl = redis_service.get_ttl(test_key)
        print(f"TTL 확인: {'✅' if 0 < ttl <= 60 else '❌'} (TTL: {ttl}초)")
        
        # DELETE 테스트
        deleted = redis_service.delete(test_key)
        print(f"데이터 삭제: {'✅' if deleted else '❌'}")
        
        # 삭제 후 확인
        after_delete = redis_service.get(test_key)
        print(f"삭제 후 조회: {'✅' if after_delete is None else '❌'}")
        
        return True
        
    except Exception as e:
        print(f"❌ 기본 캐시 테스트 실패: {e}")
        return False
    finally:
        redis_service.close()


async def test_cache_manager():
    """캐시 매니저 테스트"""
    print("\n=== 캐시 매니저 테스트 ===")
    
    cache_manager = CacheManager()
    
    if not cache_manager.is_available():
        print("❌ 캐시 매니저를 사용할 수 없어 테스트를 건너뜁니다.")
        return False
    
    try:
        test_question = "React와 TypeScript를 사용한 프로젝트가 있나요?"
        test_user_id = "test_user_456"
        test_response = {
            "answer": "네, 여러 프로젝트에서 React와 TypeScript를 사용했습니다.",
            "query_type": "project",
            "response_time": 1.23,
            "sources": ["project1.md", "project2.md"],
            "confidence": 0.95
        }
        
        # 채팅 응답 저장 테스트
        saved = cache_manager.set_chat_response(test_question, test_response, test_user_id, False)
        print(f"채팅 응답 저장: {'✅' if saved else '❌'}")
        
        # 채팅 응답 조회 테스트 (공통)
        retrieved = cache_manager.get_chat_response(test_question)
        if retrieved:
            print(f"공통 채팅 응답 조회: ✅")
            print(f"  답변: {retrieved.get('answer', '')[:50]}...")
            print(f"  캐시 정보: {retrieved.get('_cache_info', {})}")
        else:
            print(f"공통 채팅 응답 조회: ❌")
        
        # 사용자별 응답 저장 및 조회 테스트
        user_response = test_response.copy()
        user_response["answer"] = "개인화된 응답: " + user_response["answer"]
        
        saved_user = cache_manager.set_chat_response(test_question, user_response, test_user_id, True)
        print(f"사용자별 응답 저장: {'✅' if saved_user else '❌'}")
        
        retrieved_user = cache_manager.get_chat_response(test_question, test_user_id)
        if retrieved_user and "개인화된" in retrieved_user.get("answer", ""):
            print(f"사용자별 응답 조회: ✅")
        else:
            print(f"사용자별 응답 조회: ❌")
        
        # 벡터 검색 캐시 테스트
        test_query = "프론트엔드 개발"
        test_results = [
            {"content": "React 프로젝트", "score": 0.95},
            {"content": "Vue.js 프로젝트", "score": 0.88}
        ]
        
        vector_saved = cache_manager.set_vector_search_result(test_query, test_results)
        print(f"벡터 검색 결과 저장: {'✅' if vector_saved else '❌'}")
        
        vector_retrieved = cache_manager.get_vector_search_result(test_query)
        if vector_retrieved == test_results:
            print(f"벡터 검색 결과 조회: ✅")
        else:
            print(f"벡터 검색 결과 조회: ❌")
        
        # 캐시 통계 테스트
        stats = cache_manager.get_cache_stats()
        print(f"캐시 통계 조회: {'✅' if stats.get('cache_available') else '❌'}")
        if stats.get('cache_available'):
            print(f"  히트율: {stats.get('hit_rate_percent', 0)}%")
            print(f"  총 요청: {stats.get('total_requests', 0)}")
        
        return True
        
    except Exception as e:
        print(f"❌ 캐시 매니저 테스트 실패: {e}")
        return False
    finally:
        cache_manager.close()


async def test_cache_invalidation():
    """캐시 무효화 테스트"""
    print("\n=== 캐시 무효화 테스트 ===")
    
    cache_manager = CacheManager()
    
    if not cache_manager.is_available():
        print("❌ 캐시 매니저를 사용할 수 없어 테스트를 건너뜁니다.")
        return False
    
    try:
        test_user_id = "test_user_invalidation"
        test_questions = [
            "질문 1: 프로젝트는?",
            "질문 2: 경험은?",
            "질문 3: 기술스택은?"
        ]
        
        # 여러 캐시 데이터 저장
        for i, question in enumerate(test_questions):
            response = {
                "answer": f"답변 {i+1}",
                "query_type": "general",
                "response_time": 1.0
            }
            cache_manager.set_chat_response(question, response, test_user_id, True)
        
        print(f"테스트 캐시 {len(test_questions)}개 저장 완료")
        
        # 사용자 캐시 무효화 테스트
        deleted_count = cache_manager.invalidate_user_cache(test_user_id)
        print(f"사용자 캐시 무효화: {'✅' if deleted_count > 0 else '❌'} ({deleted_count}개 삭제)")
        
        # 무효화 후 조회 테스트
        remaining = 0
        for question in test_questions:
            if cache_manager.get_chat_response(question, test_user_id):
                remaining += 1
        
        print(f"무효화 후 조회: {'✅' if remaining == 0 else '❌'} ({remaining}개 남음)")
        
        return True
        
    except Exception as e:
        print(f"❌ 캐시 무효화 테스트 실패: {e}")
        return False
    finally:
        cache_manager.close()


async def test_performance():
    """캐시 성능 테스트"""
    print("\n=== 캐시 성능 테스트 ===")
    
    cache_manager = CacheManager()
    
    if not cache_manager.is_available():
        print("❌ 캐시 매니저를 사용할 수 없어 테스트를 건너뜁니다.")
        return False
    
    try:
        # 대량 데이터 저장 성능 테스트
        test_count = 100
        large_response = {
            "answer": "이것은 긴 응답입니다. " * 100,  # 약 2KB 데이터
            "query_type": "general",
            "response_time": 1.0,
            "sources": [f"source_{i}.md" for i in range(20)]
        }
        
        start_time = time.time()
        
        for i in range(test_count):
            question = f"성능 테스트 질문 {i}"
            cache_manager.set_chat_response(question, large_response)
        
        write_time = time.time() - start_time
        write_rate = test_count / write_time
        
        print(f"쓰기 성능: {write_rate:.1f} ops/sec ({test_count}건 in {write_time:.2f}초)")
        
        # 조회 성능 테스트
        start_time = time.time()
        hit_count = 0
        
        for i in range(test_count):
            question = f"성능 테스트 질문 {i}"
            result = cache_manager.get_chat_response(question)
            if result:
                hit_count += 1
        
        read_time = time.time() - start_time
        read_rate = test_count / read_time
        hit_rate = (hit_count / test_count) * 100
        
        print(f"읽기 성능: {read_rate:.1f} ops/sec ({test_count}건 in {read_time:.2f}초)")
        print(f"캐시 히트율: {hit_rate:.1f}% ({hit_count}/{test_count})")
        
        # 정리
        cache_manager.invalidate_chat_cache()
        
        return True
        
    except Exception as e:
        print(f"❌ 캐시 성능 테스트 실패: {e}")
        return False
    finally:
        cache_manager.close()


async def main():
    """메인 테스트 실행"""
    print("🔥 Redis 캐시 시스템 테스트 시작")
    print("=" * 50)
    
    # 설정 확인
    settings = get_settings()
    print(f"Redis 호스트: {settings.redis.host}:{settings.redis.port}")
    print(f"Redis DB: {settings.redis.db}")
    print(f"Redis SSL: {settings.redis.ssl}")
    print(f"캐시 TTL: {settings.redis.ttl}초")
    
    test_results = []
    
    # 테스트 실행
    tests = [
        ("Redis 연결", test_redis_connection),
        ("캐시 키 생성", test_cache_keys),
        ("기본 캐시 CRUD", test_basic_cache_operations),
        ("캐시 매니저", test_cache_manager),
        ("캐시 무효화", test_cache_invalidation),
        ("캐시 성능", test_performance),
    ]
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} 테스트 중 예외 발생: {e}")
            test_results.append((test_name, False))
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("🏁 테스트 결과 요약")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n총 {total}개 테스트 중 {passed}개 통과 ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 모든 테스트가 성공했습니다! Redis 캐시 시스템이 정상 작동합니다.")
        return 0
    else:
        print("⚠️ 일부 테스트가 실패했습니다. 설정과 환경을 확인해주세요.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())