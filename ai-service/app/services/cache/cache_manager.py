"""
캐시 매니저 모듈
고수준 캐시 관리 및 비즈니스 로직 제공
"""

import logging
from typing import Any, Optional, Dict, List
from datetime import datetime

from .redis_service import RedisService
from .cache_keys import CacheKeys, CacheKeyType

logger = logging.getLogger(__name__)


class CacheManager:
    """캐시 매니저 클래스"""
    
    def __init__(self):
        self.redis_service = RedisService()
    
    def is_available(self) -> bool:
        """캐시 시스템 사용 가능 여부"""
        return self.redis_service.is_available()
    
    # === 채팅 응답 캐시 ===
    
    def get_chat_response(self, question: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """채팅 응답 캐시 조회 (사용자별 우선, 공통 대체)"""
        try:
            # 1. 사용자별 캐시 조회 (개인화 응답)
            if user_id:
                user_key = CacheKeys.chat_user_response(user_id, question)
                cached_response = self.redis_service.get(user_key)
                if cached_response:
                    logger.debug(f"사용자별 캐시 적중: {user_id}")
                    return self._add_cache_metadata(cached_response, "user_specific")
            
            # 2. 공통 캐시 조회 (일반 응답)
            common_key = CacheKeys.chat_response(question)
            cached_response = self.redis_service.get(common_key)
            if cached_response:
                logger.debug(f"공통 캐시 적중: {question[:50]}...")
                return self._add_cache_metadata(cached_response, "common")
            
            logger.debug(f"캐시 미적중: {question[:50]}...")
            return None
            
        except Exception as e:
            logger.error(f"채팅 응답 캐시 조회 오류: {e}")
            return None
    
    def set_chat_response(self, question: str, response: Dict[str, Any], 
                         user_id: Optional[str] = None, is_personalized: bool = False) -> bool:
        """채팅 응답 캐시 저장"""
        try:
            # 캐시 데이터 준비
            cache_data = {
                "response": response,
                "cached_at": datetime.now().isoformat(),
                "question": question[:100],  # 원본 질문 일부 저장 (디버깅용)
            }
            
            # TTL 설정
            ttl = CacheKeys.get_ttl(CacheKeyType.CHAT_RESPONSE)
            
            success = False
            
            # 개인화 응답인 경우 사용자별 캐시에 저장
            if user_id and is_personalized:
                user_key = CacheKeys.chat_user_response(user_id, question)
                success = self.redis_service.set(user_key, cache_data, ttl)
                if success:
                    logger.debug(f"사용자별 캐시 저장: {user_id}")
            
            # 공통 응답으로도 저장 (일반적인 질문인 경우)
            if not is_personalized:
                common_key = CacheKeys.chat_response(question)
                success = self.redis_service.set(common_key, cache_data, ttl)
                if success:
                    logger.debug(f"공통 캐시 저장: {question[:50]}...")
            
            return success
            
        except Exception as e:
            logger.error(f"채팅 응답 캐시 저장 오류: {e}")
            return False
    
    # === 벡터 검색 캐시 ===
    
    def get_vector_search_result(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """벡터 검색 결과 캐시 조회"""
        try:
            key = CacheKeys.vector_search(query)
            cached_result = self.redis_service.get(key)
            
            if cached_result:
                logger.debug(f"벡터 검색 캐시 적중: {query[:50]}...")
                return cached_result.get("results", [])
            
            return None
            
        except Exception as e:
            logger.error(f"벡터 검색 캐시 조회 오류: {e}")
            return None
    
    def set_vector_search_result(self, query: str, results: List[Dict[str, Any]]) -> bool:
        """벡터 검색 결과 캐시 저장"""
        try:
            key = CacheKeys.vector_search(query)
            cache_data = {
                "results": results,
                "cached_at": datetime.now().isoformat(),
                "query": query[:100],
            }
            
            ttl = CacheKeys.get_ttl(CacheKeyType.VECTOR_SEARCH)
            success = self.redis_service.set(key, cache_data, ttl)
            
            if success:
                logger.debug(f"벡터 검색 캐시 저장: {query[:50]}...")
            
            return success
            
        except Exception as e:
            logger.error(f"벡터 검색 캐시 저장 오류: {e}")
            return False
    
    # === LLM 응답 캐시 ===
    
    def get_llm_response(self, prompt: str) -> Optional[str]:
        """LLM 응답 캐시 조회"""
        try:
            key = CacheKeys.llm_response(prompt)
            cached_result = self.redis_service.get(key)
            
            if cached_result:
                logger.debug(f"LLM 응답 캐시 적중")
                return cached_result.get("response")
            
            return None
            
        except Exception as e:
            logger.error(f"LLM 응답 캐시 조회 오류: {e}")
            return None
    
    def set_llm_response(self, prompt: str, response: str) -> bool:
        """LLM 응답 캐시 저장"""
        try:
            key = CacheKeys.llm_response(prompt)
            cache_data = {
                "response": response,
                "cached_at": datetime.now().isoformat(),
                "prompt_length": len(prompt),
            }
            
            ttl = CacheKeys.get_ttl(CacheKeyType.LLM_RESPONSE)
            success = self.redis_service.set(key, cache_data, ttl)
            
            if success:
                logger.debug(f"LLM 응답 캐시 저장")
            
            return success
            
        except Exception as e:
            logger.error(f"LLM 응답 캐시 저장 오류: {e}")
            return False
    
    # === 포트폴리오 데이터 캐시 ===
    
    def get_portfolio_data(self, data_type: str) -> Optional[Dict[str, Any]]:
        """포트폴리오 데이터 캐시 조회"""
        try:
            key = CacheKeys.portfolio_data(data_type)
            cached_data = self.redis_service.get(key)
            
            if cached_data:
                logger.debug(f"포트폴리오 데이터 캐시 적중: {data_type}")
                return cached_data.get("data")
            
            return None
            
        except Exception as e:
            logger.error(f"포트폴리오 데이터 캐시 조회 오류: {e}")
            return None
    
    def set_portfolio_data(self, data_type: str, data: Dict[str, Any]) -> bool:
        """포트폴리오 데이터 캐시 저장"""
        try:
            key = CacheKeys.portfolio_data(data_type)
            cache_data = {
                "data": data,
                "cached_at": datetime.now().isoformat(),
                "data_type": data_type,
            }
            
            ttl = CacheKeys.get_ttl(CacheKeyType.PORTFOLIO_DATA)
            success = self.redis_service.set(key, cache_data, ttl)
            
            if success:
                logger.debug(f"포트폴리오 데이터 캐시 저장: {data_type}")
            
            return success
            
        except Exception as e:
            logger.error(f"포트폴리오 데이터 캐시 저장 오류: {e}")
            return False
    
    # === 캐시 무효화 ===
    
    def invalidate_user_cache(self, user_id: str) -> int:
        """특정 사용자의 모든 캐시 무효화"""
        try:
            pattern = CacheKeys.get_user_pattern(user_id)
            deleted_count = self.redis_service.delete_pattern(pattern)
            logger.info(f"사용자 캐시 무효화: {user_id} ({deleted_count} keys)")
            return deleted_count
            
        except Exception as e:
            logger.error(f"사용자 캐시 무효화 오류: {e}")
            return 0
    
    def invalidate_chat_cache(self) -> int:
        """모든 채팅 캐시 무효화"""
        try:
            pattern = CacheKeys.get_pattern_for_type(CacheKeyType.CHAT_RESPONSE)
            user_pattern = CacheKeys.get_pattern_for_type(CacheKeyType.CHAT_USER_RESPONSE)
            
            deleted_count = self.redis_service.delete_pattern(pattern)
            deleted_count += self.redis_service.delete_pattern(user_pattern)
            
            logger.info(f"채팅 캐시 무효화 완료 ({deleted_count} keys)")
            return deleted_count
            
        except Exception as e:
            logger.error(f"채팅 캐시 무효화 오류: {e}")
            return 0
    
    def invalidate_portfolio_cache(self) -> int:
        """포트폴리오 데이터 캐시 무효화"""
        try:
            pattern = CacheKeys.get_pattern_for_type(CacheKeyType.PORTFOLIO_DATA)
            deleted_count = self.redis_service.delete_pattern(pattern)
            logger.info(f"포트폴리오 캐시 무효화 완료 ({deleted_count} keys)")
            return deleted_count
            
        except Exception as e:
            logger.error(f"포트폴리오 캐시 무효화 오류: {e}")
            return 0
    
    def invalidate_all_cache(self) -> bool:
        """모든 캐시 무효화 (주의: 개발용)"""
        try:
            success = self.redis_service.flush_all()
            if success:
                logger.warning("모든 캐시가 무효화되었습니다")
            return success
            
        except Exception as e:
            logger.error(f"전체 캐시 무효화 오류: {e}")
            return False
    
    # === 캐시 통계 및 모니터링 ===
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """캐시 통계 조회"""
        try:
            stats = self.redis_service.get_cache_stats()
            stats["cache_available"] = self.is_available()
            return stats
            
        except Exception as e:
            logger.error(f"캐시 통계 조회 오류: {e}")
            return {"cache_available": False, "error": str(e)}
    
    def _add_cache_metadata(self, cached_data: Dict[str, Any], cache_type: str) -> Dict[str, Any]:
        """캐시 메타데이터 추가"""
        if isinstance(cached_data, dict) and "response" in cached_data:
            response = cached_data["response"].copy()
            response["_cache_info"] = {
                "hit": True,
                "type": cache_type,
                "cached_at": cached_data.get("cached_at"),
            }
            return response
        return cached_data
    
    def close(self):
        """캐시 매니저 종료"""
        try:
            self.redis_service.close()
        except Exception as e:
            logger.error(f"캐시 매니저 종료 오류: {e}")