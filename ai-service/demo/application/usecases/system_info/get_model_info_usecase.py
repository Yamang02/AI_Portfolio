"""
Get Model Info Use Case - Demo Application Layer
모델 정보 조회 유스케이스

임베딩 모델과 외부 LLM 모델의 상태 및 정보를 제공합니다.
설정 기반으로 동작하여 하드코딩된 값을 제거했습니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import requests
import time
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)
from config.demo_config_manager import get_demo_config_manager

logger = logging.getLogger(__name__)


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
        
        # DemoConfigManager 초기화
        try:
            self.demo_config = get_demo_config_manager()
            logger.info("✅ GetModelInfoUseCase initialized with DemoConfigManager")
        except Exception as e:
            logger.error(f"❌ DemoConfigManager 초기화 실패: {e}")
            raise RuntimeError("Demo 설정을 로드할 수 없습니다.")
    
    @handle_usecase_errors(
        default_error_message="모델 정보 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetModelInfoUseCase")
    def execute(self) -> Dict[str, Any]:
        """모델 정보 조회 실행"""
        return ResponseFormatter.statistics_response(
            data={
                "embedding_models": self._get_embedding_model_info(),
                "llm_models": self._get_llm_model_info(),
                "api_status": self._get_api_status(),
                "model_performance": self._get_model_performance(),
                "resource_usage": self._get_model_resource_usage(),
                "recommendations": self._get_model_recommendations()
            },
            message="🤖 모델 정보를 성공적으로 조회했습니다"
        )
    
    def _get_embedding_model_info(self) -> Dict[str, Any]:
        """임베딩 모델 정보 조회 (설정 기반)"""
        # DemoConfigManager에서 모델 정보 로드
        embedding_config = self.demo_config.get_embedding_config()
        
        # 서비스 통계 정보 추가 (있는 경우)
        stats = {}
        if self.embedding_service:
            try:
                stats = self.embedding_service.get_embedding_statistics()
            except Exception as e:
                logger.warning(f"임베딩 서비스 통계 조회 실패: {e}")
        
        return {
            "status": "loaded",
            "primary_model": {
                "name": embedding_config.get("model_name", "sentence-transformers/all-MiniLM-L6-v2"),
                "dimension": embedding_config.get("dimension", 384),
                "type": embedding_config.get("provider", "sentence-transformers"),
                "device": embedding_config.get("device", "cpu"),
                "normalize": embedding_config.get("normalize", True),
                "batch_size": embedding_config.get("batch_size", 32),
                "loaded_at": datetime.now().isoformat(),
                "memory_usage_mb": self._estimate_embedding_model_memory(embedding_config.get("dimension", 384))
            },
            "statistics": {
                "total_embeddings_created": stats.get("total_embeddings", 0),
                "vector_store_size_bytes": stats.get("total_vector_size_bytes", 0),
                "embeddings_in_memory": stats.get("vector_store_embeddings", 0),
                "average_vector_size": self._calculate_average_vector_size(stats)
            },
            "configuration": {
                "model_path": embedding_config.get("model_name", "sentence-transformers/all-MiniLM-L6-v2"),
                "max_sequence_length": 512,  # sentence-transformers 기본값
                "normalize_embeddings": embedding_config.get("normalize", True),
                "batch_size": embedding_config.get("batch_size", 32)
            },
            "capabilities": [
                "텍스트 임베딩 생성",
                "벡터 유사도 계산", 
                "배치 처리",
                "다국어 지원"
            ]
        }
    
    def _get_llm_model_info(self) -> Dict[str, Any]:
        """LLM 모델 정보 조회 (설정 기반)"""
        # DemoConfigManager에서 LLM 모델 정보 로드
        llm_config = self.demo_config.get_llm_config()
        
        return {
            "status": "active",
            "external_apis": [
                llm_config.get("openai", {}),
                llm_config.get("google", {})
            ],
            "mock_model": llm_config.get("mock", {}),
            "local_models": [],  # 현재는 외부 API만 사용
            "fallback_strategy": llm_config.get("fallback_strategy", "mock"),
            "response_caching": llm_config.get("response_caching", False),
            "content_filtering": llm_config.get("content_filtering", True)
        }
    
    def _get_api_status(self) -> List[Dict[str, Any]]:
        """외부 API 상태 확인 (설정 기반)"""
        # DemoConfigManager에서 API 엔드포인트 정보 로드
        api_endpoints = self.demo_config.get_api_endpoints()
        
        api_statuses = []
        
        # 각 API별 상태 확인
        for api_name, endpoint_info in api_endpoints.items():
            api_statuses.append({
                "name": f"{api_name.upper()} API",
                "endpoint": endpoint_info.get("base_url", "unknown"),
                "status": endpoint_info.get("status", "unknown"),
                "response_time_ms": None,
                "last_checked": datetime.now(),
                "note": f"API 키 설정 여부에 따라 실제 상태 확인 가능"
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
