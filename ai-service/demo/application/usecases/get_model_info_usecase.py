"""
Get Model Info Use Case - Demo Application Layer
모델 정보 조회 유스케이스

임베딩 모델과 외부 LLM 모델의 상태 및 정보를 제공합니다.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import requests
import time


@dataclass
class ModelInfo:
    """모델 정보"""
    name: str
    type: str  # embedding, llm
    status: str  # loaded, unloaded, error
    version: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None


@dataclass
class APIStatus:
    """외부 API 상태"""
    name: str
    endpoint: str
    status: str  # online, offline, error
    response_time_ms: Optional[float] = None
    last_checked: Optional[datetime] = None
    error_message: Optional[str] = None


class GetModelInfoUseCase:
    """모델 정보 조회 유스케이스"""
    
    def __init__(
        self,
        embedding_service=None,
        generation_service=None
    ):
        self.embedding_service = embedding_service
        self.generation_service = generation_service
    
    def execute(self) -> Dict[str, Any]:
        """모델 정보 조회 실행"""
        return {
            "embedding_models": self._get_embedding_model_info(),
            "llm_models": self._get_llm_model_info(),
            "api_status": self._get_api_status(),
            "model_performance": self._get_model_performance(),
            "resource_usage": self._get_model_resource_usage(),
            "recommendations": self._get_model_recommendations(),
            "last_updated": datetime.now().isoformat()
        }
    
    def _get_embedding_model_info(self) -> Dict[str, Any]:
        """임베딩 모델 정보 조회"""
        if not self.embedding_service:
            return {
                "status": "not_available",
                "models": []
            }
        
        try:
            # 임베딩 서비스에서 통계 정보 가져오기
            stats = self.embedding_service.get_embedding_statistics()
            vector_store_stats = self.embedding_service.get_vector_store_statistics()
            
            model_info = {
                "status": "loaded",
                "primary_model": {
                    "name": stats.get("model_name", "sentence-transformers/all-MiniLM-L6-v2"),
                    "dimension": stats.get("dimension", 384),
                    "type": "sentence-transformers",
                    "loaded_at": datetime.now().isoformat(),  # 실제로는 서비스 초기화 시점
                    "memory_usage_mb": self._estimate_embedding_model_memory(stats.get("dimension", 384))
                },
                "statistics": {
                    "total_embeddings_created": stats.get("total_embeddings", 0),
                    "vector_store_size_bytes": stats.get("total_vector_size_bytes", 0),
                    "embeddings_in_memory": stats.get("vector_store_embeddings", 0),
                    "average_vector_size": self._calculate_average_vector_size(stats)
                },
                "configuration": {
                    "model_path": "sentence-transformers/all-MiniLM-L6-v2",
                    "max_sequence_length": 512,
                    "normalize_embeddings": True,
                    "batch_size": 32
                },
                "capabilities": [
                    "텍스트 임베딩 생성",
                    "벡터 유사도 계산", 
                    "배치 처리",
                    "다국어 지원"
                ]
            }
            
            return model_info
            
        except Exception as e:
            return {
                "status": "error",
                "error_message": str(e),
                "models": []
            }
    
    def _get_llm_model_info(self) -> Dict[str, Any]:
        """LLM 모델 정보 조회"""
        if not self.generation_service:
            return {
                "status": "not_available",
                "models": []
            }
        
        try:
            # Generation Service에서 사용 중인 LLM 정보
            # 현재는 하드코딩된 정보이지만 실제로는 서비스에서 가져와야 함
            llm_info = {
                "status": "active",
                "external_apis": [
                    {
                        "name": "OpenAI GPT",
                        "model": "gpt-3.5-turbo",
                        "type": "completion",
                        "endpoint": "https://api.openai.com/v1/chat/completions",
                        "status": "configured",  # 실제 연결 테스트 필요
                        "features": ["대화형 AI", "컨텍스트 이해", "다국어 지원"],
                        "limits": {
                            "max_tokens": 4096,
                            "rate_limit": "3500 requests/min",
                            "context_window": 4096
                        }
                    },
                    {
                        "name": "Anthropic Claude",
                        "model": "claude-3-sonnet",
                        "type": "completion",
                        "endpoint": "https://api.anthropic.com/v1/messages",
                        "status": "configured",
                        "features": ["긴 컨텍스트", "안전한 AI", "분석적 사고"],
                        "limits": {
                            "max_tokens": 4096,
                            "rate_limit": "1000 requests/min", 
                            "context_window": 200000
                        }
                    }
                ],
                "local_models": [],  # 현재는 외부 API만 사용
                "fallback_strategy": "OpenAI → Claude → Error",
                "response_caching": False,
                "content_filtering": True
            }
            
            return llm_info
            
        except Exception as e:
            return {
                "status": "error",
                "error_message": str(e),
                "models": []
            }
    
    def _get_api_status(self) -> List[Dict[str, Any]]:
        """외부 API 상태 확인"""
        api_statuses = []
        
        # OpenAI API 상태 확인 (실제 요청은 하지 않고 모의 상태)
        api_statuses.append({
            "name": "OpenAI API",
            "endpoint": "https://api.openai.com",
            "status": "unknown",  # 실제로는 ping 테스트 필요
            "response_time_ms": None,
            "last_checked": datetime.now(),
            "note": "API 키 설정 여부에 따라 실제 상태 확인 가능"
        })
        
        # Anthropic API 상태 확인
        api_statuses.append({
            "name": "Anthropic API",
            "endpoint": "https://api.anthropic.com",
            "status": "unknown",
            "response_time_ms": None,
            "last_checked": datetime.now(),
            "note": "API 키 설정 여부에 따라 실제 상태 확인 가능"
        })
        
        # Hugging Face (임베딩 모델용)
        api_statuses.append({
            "name": "Hugging Face Hub",
            "endpoint": "https://huggingface.co",
            "status": "available",
            "response_time_ms": None,
            "last_checked": datetime.now(),
            "note": "모델 다운로드 및 캐시용"
        })
        
        return api_statuses
    
    def _get_model_performance(self) -> Dict[str, Any]:
        """모델 성능 메트릭"""
        performance = {
            "embedding_model": {
                "average_encoding_time_ms": 150,  # Mock 데이터
                "tokens_per_second": 2000,
                "batch_processing_efficiency": 85.5,
                "memory_efficiency": "Good"
            },
            "llm_models": {
                "average_response_time_ms": 1200,
                "tokens_per_second": 45,
                "success_rate_percent": 98.5,
                "cache_hit_rate_percent": 0  # 현재 캐싱 미구현
            },
            "overall": {
                "system_latency_ms": 1350,
                "throughput_requests_per_minute": 45,
                "error_rate_percent": 1.5
            }
        }
        
        return performance
    
    def _get_model_resource_usage(self) -> Dict[str, Any]:
        """모델 리소스 사용량"""
        return {
            "embedding_model": {
                "memory_usage_mb": self._estimate_embedding_model_memory(384),
                "cpu_usage_percent": 15,  # Mock 데이터
                "gpu_usage_percent": 0,   # CPU 전용
                "disk_cache_mb": 450
            },
            "llm_models": {
                "memory_usage_mb": 0,     # 외부 API 사용
                "network_usage_mb": 12.5, # API 호출 데이터
                "api_quota_usage": {
                    "openai": "unknown",
                    "anthropic": "unknown"
                }
            },
            "total": {
                "estimated_memory_mb": 450,
                "estimated_storage_mb": 1200
            }
        }
    
    def _get_model_recommendations(self) -> List[Dict[str, str]]:
        """모델 사용 권장사항"""
        recommendations = []
        
        # 임베딩 모델 권장사항
        if self.embedding_service:
            try:
                stats = self.embedding_service.get_embedding_statistics()
                if stats.get("total_embeddings", 0) > 10000:
                    recommendations.append({
                        "type": "performance",
                        "message": "대량의 임베딩이 생성되었습니다. 벡터 DB 최적화를 고려해보세요.",
                        "action": "벡터 인덱싱 또는 압축 적용"
                    })
            except:
                pass
        
        # LLM 모델 권장사항
        recommendations.extend([
            {
                "type": "cost",
                "message": "비용 최적화를 위해 응답 캐싱 구현을 검토해보세요.",
                "action": "Redis 또는 메모리 캐싱 도입"
            },
            {
                "type": "performance", 
                "message": "높은 처리량이 필요한 경우 로컬 LLM 모델 고려",
                "action": "Ollama 또는 vLLM 도입 검토"
            },
            {
                "type": "reliability",
                "message": "API 장애에 대비한 Fallback 전략 강화 필요",
                "action": "다중 API 지원 및 재시도 로직 구현"
            }
        ])
        
        return recommendations
    
    def _estimate_embedding_model_memory(self, dimension: int) -> float:
        """임베딩 모델 메모리 사용량 추정 (MB)"""
        # sentence-transformers/all-MiniLM-L6-v2 기준 추정
        base_model_size = 90  # MB
        vector_storage_per_1k = dimension * 4 * 1000 / (1024 * 1024)  # float32 기준
        
        if self.embedding_service:
            try:
                stats = self.embedding_service.get_embedding_statistics()
                embeddings_count = stats.get("total_embeddings", 0)
                vector_storage = embeddings_count * dimension * 4 / (1024 * 1024)
                return base_model_size + vector_storage
            except:
                pass
        
        return base_model_size
    
    def _calculate_average_vector_size(self, stats: Dict[str, Any]) -> float:
        """평균 벡터 크기 계산"""
        total_bytes = stats.get("total_vector_size_bytes", 0)
        total_embeddings = stats.get("total_embeddings", 0)
        
        if total_embeddings > 0:
            return total_bytes / total_embeddings
        return 0.0
    
    def check_model_health(self) -> Dict[str, str]:
        """모델 건강 상태 빠른 확인"""
        health = {
            "embedding_model": "unknown",
            "llm_models": "unknown",
            "overall": "unknown"
        }
        
        try:
            if self.embedding_service:
                self.embedding_service.get_embedding_statistics()
                health["embedding_model"] = "healthy"
        except:
            health["embedding_model"] = "error"
        
        try:
            if self.generation_service:
                # 간단한 상태 확인 (실제로는 서비스별 health check 메서드 필요)
                health["llm_models"] = "configured"
        except:
            health["llm_models"] = "error"
        
        # 전체 상태 결정
        if health["embedding_model"] == "healthy" and health["llm_models"] in ["healthy", "configured"]:
            health["overall"] = "healthy"
        elif "error" in health.values():
            health["overall"] = "degraded" 
        else:
            health["overall"] = "unknown"
        
        return health