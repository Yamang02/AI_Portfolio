"""
캐시 키 생성 및 관리 모듈
캐시 키 네이밍 규칙과 TTL 정책을 중앙에서 관리
"""

import hashlib
from enum import Enum
from typing import Optional


class CacheKeyType(Enum):
    """캐시 키 타입별 분류"""
    CHAT_RESPONSE = "chat:response"
    CHAT_USER_RESPONSE = "chat:response:user"
    PORTFOLIO_DATA = "portfolio:data"
    VECTOR_SEARCH = "vector:search"
    LLM_RESPONSE = "llm:response"


class CacheTTL(Enum):
    """TTL 정책 (초 단위)"""
    CHAT_RESPONSE = 3600  # 1시간
    FAQ_RESPONSE = 86400  # 24시간
    PORTFOLIO_DATA = 7200  # 2시간
    VECTOR_SEARCH = 1800  # 30분
    LLM_RESPONSE = 3600  # 1시간


class CacheKeys:
    """캐시 키 생성 및 관리 클래스"""
    
    @staticmethod
    def _generate_hash(content: str) -> str:
        """문자열을 해시로 변환 (MD5 사용)"""
        return hashlib.md5(content.encode('utf-8')).hexdigest()[:16]
    
    @staticmethod
    def chat_response(question: str) -> str:
        """공통 채팅 응답 캐시 키 생성"""
        question_hash = CacheKeys._generate_hash(question.strip().lower())
        return f"{CacheKeyType.CHAT_RESPONSE.value}:{question_hash}"
    
    @staticmethod
    def chat_user_response(user_id: str, question: str) -> str:
        """사용자별 채팅 응답 캐시 키 생성"""
        question_hash = CacheKeys._generate_hash(question.strip().lower())
        return f"{CacheKeyType.CHAT_USER_RESPONSE.value}:{user_id}:{question_hash}"
    
    @staticmethod
    def portfolio_data(data_type: str, last_updated: Optional[str] = None) -> str:
        """포트폴리오 데이터 캐시 키 생성"""
        key = f"{CacheKeyType.PORTFOLIO_DATA.value}:{data_type}"
        if last_updated:
            key += f":{last_updated}"
        return key
    
    @staticmethod
    def vector_search(query: str) -> str:
        """벡터 검색 결과 캐시 키 생성"""
        query_hash = CacheKeys._generate_hash(query.strip().lower())
        return f"{CacheKeyType.VECTOR_SEARCH.value}:{query_hash}"
    
    @staticmethod
    def llm_response(prompt: str) -> str:
        """LLM 응답 캐시 키 생성"""
        prompt_hash = CacheKeys._generate_hash(prompt)
        return f"{CacheKeyType.LLM_RESPONSE.value}:{prompt_hash}"
    
    @staticmethod
    def get_ttl(key_type: CacheKeyType) -> int:
        """키 타입별 TTL 반환"""
        ttl_mapping = {
            CacheKeyType.CHAT_RESPONSE: CacheTTL.CHAT_RESPONSE.value,
            CacheKeyType.CHAT_USER_RESPONSE: CacheTTL.CHAT_RESPONSE.value,
            CacheKeyType.PORTFOLIO_DATA: CacheTTL.PORTFOLIO_DATA.value,
            CacheKeyType.VECTOR_SEARCH: CacheTTL.VECTOR_SEARCH.value,
            CacheKeyType.LLM_RESPONSE: CacheTTL.LLM_RESPONSE.value,
        }
        return ttl_mapping.get(key_type, CacheTTL.CHAT_RESPONSE.value)
    
    @staticmethod
    def get_pattern_for_type(key_type: CacheKeyType) -> str:
        """키 타입별 패턴 반환 (삭제용)"""
        return f"{key_type.value}:*"
    
    @staticmethod
    def get_user_pattern(user_id: str) -> str:
        """특정 사용자의 모든 캐시 패턴 반환"""
        return f"{CacheKeyType.CHAT_USER_RESPONSE.value}:{user_id}:*"