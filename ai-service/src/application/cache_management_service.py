"""
Cache Management Service - Application Layer
전체 캐싱 시스템의 통합 관리 서비스
"""

import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import asdict

logger = logging.getLogger(__name__)


class CacheManagementService:
    """통합 캐시 관리 서비스"""
    
    def __init__(self, redis_client):
        self.redis_client = redis_client
        
        # 캐시 카테고리 및 TTL 설정
        self.cache_categories = {
            "embeddings": {
                "pattern": "gemini_emb:*",
                "default_ttl": 7 * 24 * 3600,  # 7일
                "description": "Gemini API 임베딩 캐시"
            },
            "project_overviews": {
                "pattern": "project_overview:*",
                "default_ttl": 24 * 3600,  # 1일
                "description": "프로젝트 개요 캐시"
            },
            "search_results": {
                "pattern": "search_result:*",
                "default_ttl": 6 * 3600,  # 6시간
                "description": "검색 결과 캐시"
            },
            "llm_responses": {
                "pattern": "llm_response:*",
                "default_ttl": 12 * 3600,  # 12시간
                "description": "LLM 응답 캐시"
            }
        }
        
        logger.info("CacheManagementService initialized")
    
    async def get_cache_overview(self) -> Dict[str, Any]:
        """전체 캐시 시스템 개요"""
        try:
            overview = {
                "cache_categories": {},
                "total_keys": 0,
                "total_memory_mb": 0.0,
                "redis_info": {},
                "generated_at": datetime.now().isoformat()
            }
            
            # Redis 서버 정보
            redis_info = await self.redis_client.info()
            overview["redis_info"] = {
                "redis_version": redis_info.get("redis_version", "unknown"),
                "used_memory_human": redis_info.get("used_memory_human", "0B"),
                "connected_clients": redis_info.get("connected_clients", 0),
                "total_commands_processed": redis_info.get("total_commands_processed", 0)
            }
            
            # 카테고리별 캐시 통계
            total_keys = 0
            for category, config in self.cache_categories.items():
                pattern = config["pattern"]
                keys = await self.redis_client.keys(pattern)
                key_count = len(keys)
                total_keys += key_count
                
                # 샘플 키들의 메모리 사용량 추정
                memory_estimate = await self._estimate_memory_usage(keys[:10])
                
                overview["cache_categories"][category] = {
                    "key_count": key_count,
                    "pattern": pattern,
                    "memory_estimate_mb": round(memory_estimate * key_count / 10, 2),
                    "ttl_hours": config["default_ttl"] / 3600,
                    "description": config["description"]
                }
            
            overview["total_keys"] = total_keys
            overview["total_memory_mb"] = sum(
                cat["memory_estimate_mb"] for cat in overview["cache_categories"].values()
            )
            
            return overview
            
        except Exception as e:
            logger.error(f"Failed to get cache overview: {e}")
            return {"error": str(e), "generated_at": datetime.now().isoformat()}
    
    async def clear_category_cache(self, category: str) -> Dict[str, Any]:
        """카테고리별 캐시 클리어"""
        try:
            if category not in self.cache_categories:
                return {
                    "success": False,
                    "error": f"Unknown category: {category}",
                    "available_categories": list(self.cache_categories.keys())
                }
            
            pattern = self.cache_categories[category]["pattern"]
            keys = await self.redis_client.keys(pattern)
            
            if keys:
                deleted_count = await self.redis_client.delete(*keys)
                logger.info(f"Cleared {deleted_count} keys from category '{category}'")
            else:
                deleted_count = 0
            
            return {
                "success": True,
                "category": category,
                "deleted_keys": deleted_count,
                "pattern": pattern,
                "cleared_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to clear category cache '{category}': {e}")
            return {"success": False, "error": str(e)}
    
    async def clear_all_cache(self) -> Dict[str, Any]:
        """전체 캐시 클리어"""
        try:
            results = {}
            total_deleted = 0
            
            for category in self.cache_categories.keys():
                result = await self.clear_category_cache(category)
                results[category] = result
                if result.get("success"):
                    total_deleted += result.get("deleted_keys", 0)
            
            return {
                "success": True,
                "total_deleted_keys": total_deleted,
                "category_results": results,
                "cleared_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to clear all cache: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_cache_statistics(self) -> Dict[str, Any]:
        """상세 캐시 통계"""
        try:
            stats = {
                "categories": {},
                "expiry_analysis": {},
                "size_analysis": {},
                "generated_at": datetime.now().isoformat()
            }
            
            for category, config in self.cache_categories.items():
                pattern = config["pattern"]
                keys = await self.redis_client.keys(pattern)
                
                if not keys:
                    stats["categories"][category] = {
                        "key_count": 0,
                        "total_size_mb": 0,
                        "avg_ttl_hours": 0
                    }
                    continue
                
                # TTL 분석 (샘플링)
                sample_keys = keys[:20]  # 최대 20개 샘플
                ttls = []
                total_size = 0
                
                for key in sample_keys:
                    ttl = await self.redis_client.ttl(key)
                    if ttl > 0:
                        ttls.append(ttl)
                    
                    # 키 크기 추정
                    try:
                        value = await self.redis_client.get(key)
                        if value:
                            total_size += len(value.encode('utf-8'))
                    except:
                        pass
                
                avg_ttl = sum(ttls) / len(ttls) if ttls else 0
                avg_size_mb = (total_size / len(sample_keys)) / (1024 * 1024) if sample_keys else 0
                
                stats["categories"][category] = {
                    "key_count": len(keys),
                    "total_size_mb": round(avg_size_mb * len(keys), 2),
                    "avg_ttl_hours": round(avg_ttl / 3600, 2),
                    "sample_size": len(sample_keys)
                }
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get cache statistics: {e}")
            return {"error": str(e)}
    
    async def optimize_cache(self) -> Dict[str, Any]:
        """캐시 최적화 실행"""
        try:
            optimization_results = {
                "actions_taken": [],
                "memory_freed_mb": 0,
                "keys_removed": 0,
                "optimized_at": datetime.now().isoformat()
            }
            
            # 1. 만료된 키 정리 (Redis가 자동으로 하지만 명시적으로 실행)
            expired_keys = []
            for category, config in self.cache_categories.items():
                pattern = config["pattern"]
                keys = await self.redis_client.keys(pattern)
                
                for key in keys:
                    ttl = await self.redis_client.ttl(key)
                    if ttl == -1:  # TTL이 설정되지 않은 키
                        await self.redis_client.expire(key, config["default_ttl"])
                        optimization_results["actions_taken"].append(f"Set TTL for {key}")
                    elif ttl == -2:  # 만료된 키
                        expired_keys.append(key)
            
            if expired_keys:
                deleted = await self.redis_client.delete(*expired_keys)
                optimization_results["keys_removed"] += deleted
                optimization_results["actions_taken"].append(f"Removed {deleted} expired keys")
            
            # 2. 중복 임베딩 검사 및 정리 (선택적)
            await self._optimize_embeddings(optimization_results)
            
            # 3. 메모리 사용량 보고
            redis_info = await self.redis_client.info()
            optimization_results["memory_after_mb"] = round(
                redis_info.get("used_memory", 0) / (1024 * 1024), 2
            )
            
            logger.info(f"Cache optimization completed: {optimization_results}")
            return optimization_results
            
        except Exception as e:
            logger.error(f"Failed to optimize cache: {e}")
            return {"error": str(e)}
    
    async def _optimize_embeddings(self, results: Dict[str, Any]):
        """임베딩 캐시 최적화"""
        try:
            embedding_pattern = self.cache_categories["embeddings"]["pattern"]
            embedding_keys = await self.redis_client.keys(embedding_pattern)
            
            if len(embedding_keys) > 1000:  # 1000개 이상일 때만 최적화
                # 오래된 임베딩부터 제거 (TTL 기반)
                key_ttls = []
                for key in embedding_keys:
                    ttl = await self.redis_client.ttl(key)
                    key_ttls.append((key, ttl))
                
                # TTL이 짧은 순서로 정렬 (곧 만료될 것들)
                key_ttls.sort(key=lambda x: x[1])
                
                # 상위 10% 제거
                keys_to_remove = [key for key, _ in key_ttls[:len(key_ttls)//10]]
                if keys_to_remove:
                    deleted = await self.redis_client.delete(*keys_to_remove)
                    results["keys_removed"] += deleted
                    results["actions_taken"].append(f"Optimized {deleted} old embeddings")
            
        except Exception as e:
            logger.warning(f"Embedding optimization failed: {e}")
    
    async def _estimate_memory_usage(self, keys: List[str]) -> float:
        """키들의 메모리 사용량 추정 (MB)"""
        if not keys:
            return 0.0
        
        try:
            total_size = 0
            for key in keys:
                value = await self.redis_client.get(key)
                if value:
                    total_size += len(key.encode('utf-8')) + len(value.encode('utf-8'))
            
            return total_size / (1024 * 1024)  # MB 변환
            
        except Exception as e:
            logger.warning(f"Memory estimation failed: {e}")
            return 0.0
    
    async def health_check(self) -> Dict[str, Any]:
        """캐시 시스템 헬스 체크"""
        try:
            health = {
                "status": "healthy",
                "redis_connected": False,
                "cache_categories_status": {},
                "warnings": [],
                "checked_at": datetime.now().isoformat()
            }
            
            # Redis 연결 확인
            try:
                await self.redis_client.ping()
                health["redis_connected"] = True
            except Exception as e:
                health["status"] = "unhealthy"
                health["warnings"].append(f"Redis connection failed: {e}")
            
            # 카테고리별 상태 확인
            for category, config in self.cache_categories.items():
                try:
                    keys = await self.redis_client.keys(config["pattern"])
                    health["cache_categories_status"][category] = {
                        "key_count": len(keys),
                        "status": "ok"
                    }
                except Exception as e:
                    health["cache_categories_status"][category] = {
                        "status": "error",
                        "error": str(e)
                    }
                    health["warnings"].append(f"Category '{category}' check failed: {e}")
            
            # 메모리 사용량 체크
            try:
                redis_info = await self.redis_client.info()
                used_memory_mb = redis_info.get("used_memory", 0) / (1024 * 1024)
                if used_memory_mb > 100:  # 100MB 이상일 때 경고
                    health["warnings"].append(f"High memory usage: {used_memory_mb:.1f}MB")
            except:
                pass
            
            if health["warnings"]:
                health["status"] = "warning"
            
            return health
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "checked_at": datetime.now().isoformat()
            }
    
    def get_cache_config(self) -> Dict[str, Any]:
        """캐시 설정 정보 반환"""
        return {
            "categories": {
                name: {
                    "pattern": config["pattern"],
                    "ttl_hours": config["default_ttl"] / 3600,
                    "description": config["description"]
                }
                for name, config in self.cache_categories.items()
            },
            "service": "CacheManagementService",
            "version": "1.0.0"
        }