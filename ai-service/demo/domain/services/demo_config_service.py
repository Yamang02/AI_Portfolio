"""
Demo Config Service - Demo Domain Layer
데모 설정 서비스

Demo 환경에 특화된 설정 관리를 담당하는 도메인 서비스입니다.
설정 파일에서 모델 정보, API 엔드포인트, 환경 설정을 관리합니다.
"""

import logging
from typing import Dict, Any, Optional, List
from pathlib import Path
import sys
import os

# 기존 common 설정 관리자 사용
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'common'))

from shared.infrastructure.config_manager import get_config_manager

logger = logging.getLogger(__name__)


class DemoConfigService:
    """Demo 설정 서비스 - 설정 관리 담당"""
    
    def __init__(self, environment: str = "demo"):
        self.environment = environment
        self.config_manager = get_config_manager(environment)
        self._model_info_cache: Optional[Dict[str, Any]] = None
        self._api_endpoints_cache: Optional[Dict[str, Any]] = None
        
        logger.info(f"✅ DemoConfigService initialized for environment: {environment}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 반환 (하드코딩 제거)"""
        if self._model_info_cache is None:
            self._model_info_cache = self._load_model_info_from_config()
        
        return self._model_info_cache
    
    def _load_model_info_from_config(self) -> Dict[str, Any]:
        """설정 파일에서 모델 정보 로드"""
        try:
            # LLM 설정 로드
            llm_config = self.config_manager.get_config("llm", {})
            embedding_config = self.config_manager.get_config("embedding", {})
            
            # Mock LLM 설정 (Demo 환경)
            mock_config = llm_config.get("mock", {})
            
            # 외부 API 설정 (Production 환경용)
            openai_config = llm_config.get("openai", {})
            google_config = llm_config.get("google", {})
            
            model_info = {
                "embedding_model": {
                    "provider": embedding_config.get("provider", "huggingface"),
                    "model_name": embedding_config.get("model_name", "sentence-transformers/all-MiniLM-L6-v2"),
                    "dimension": self._get_embedding_dimension(embedding_config.get("model_name")),
                    "device": embedding_config.get("device", "cpu"),
                    "normalize": embedding_config.get("normalize", True),
                    "batch_size": embedding_config.get("batch_size", 10)
                },
                "llm_models": {
                    "mock": {
                        "name": mock_config.get("model_name", "mock-gpt-3.5-turbo"),
                        "type": "mock",
                        "temperature": mock_config.get("temperature", 0.7),
                        "max_tokens": mock_config.get("max_tokens", 1000),
                        "response_delay": mock_config.get("response_delay", 0.5),
                        "status": "active",
                        "features": ["데모 환경", "빠른 응답", "안정적 동작"]
                    },
                    "openai": {
                        "name": openai_config.get("model_name", "gpt-3.5-turbo"),
                        "type": "completion",
                        "endpoint": "https://api.openai.com/v1/chat/completions",
                        "status": "configured" if openai_config.get("api_key") else "not_configured",
                        "features": ["고성능", "다양한 모델", "API 안정성"],
                        "limits": {
                            "max_tokens": openai_config.get("max_tokens", 4096),
                            "rate_limit": "3000 requests/min",
                            "context_window": 16384
                        }
                    },
                    "google": {
                        "name": google_config.get("model_name", "gemini-pro"),
                        "type": "completion",
                        "endpoint": "https://generativelanguage.googleapis.com/v1beta/models",
                        "status": "configured" if google_config.get("api_key") else "not_configured",
                        "features": ["멀티모달", "긴 컨텍스트", "창의적 응답"],
                        "limits": {
                            "max_tokens": google_config.get("max_output_tokens", 4096),
                            "rate_limit": "1000 requests/min",
                            "context_window": 1000000
                        }
                    }
                },
                "fallback_strategy": self._get_fallback_strategy(),
                "response_caching": False,
                "content_filtering": True
            }
            
            return model_info
            
        except Exception as e:
            logger.error(f"모델 정보 로드 실패: {e}")
            # Fallback: 기본값 반환
            return self._get_fallback_model_info()
    
    def _get_embedding_dimension(self, model_name: str) -> int:
        """임베딩 모델별 차원 반환"""
        dimension_map = {
            "sentence-transformers/all-MiniLM-L6-v2": 384,
            "sentence-transformers/all-mpnet-base-v2": 768,
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2": 384,
            "text-embedding-ada-002": 1536,
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072
        }
        return dimension_map.get(model_name, 384)
    
    def _get_fallback_strategy(self) -> str:
        """Fallback 전략 반환"""
        return self.config_manager.get_config("demo.fallback_strategy", "Mock → OpenAI → Google → Error")
    
    def _get_fallback_model_info(self) -> Dict[str, Any]:
        """Fallback 모델 정보 반환"""
        return {
            "embedding_model": {
                "provider": "huggingface",
                "model_name": "sentence-transformers/all-MiniLM-L6-v2",
                "dimension": 384,
                "device": "cpu",
                "normalize": True,
                "batch_size": 10
            },
            "llm_models": {
                "mock": {
                    "name": "mock-gpt-3.5-turbo",
                    "type": "mock",
                    "temperature": 0.7,
                    "max_tokens": 1000,
                    "response_delay": 0.5,
                    "status": "active",
                    "features": ["데모 환경", "빠른 응답", "안정적 동작"]
                }
            },
            "fallback_strategy": "Mock → Error",
            "response_caching": False,
            "content_filtering": True
        }
    
    def get_api_endpoints(self) -> Dict[str, Any]:
        """API 엔드포인트 정보 반환 (하드코딩 제거)"""
        if self._api_endpoints_cache is None:
            self._api_endpoints_cache = self._load_api_endpoints_from_config()
        
        return self._api_endpoints_cache
    
    def _load_api_endpoints_from_config(self) -> Dict[str, Any]:
        """설정 파일에서 API 엔드포인트 로드"""
        try:
            llm_config = self.config_manager.get_config("llm", {})
            
            endpoints = {
                "openai": {
                    "base_url": "https://api.openai.com/v1",
                    "chat_completions": "https://api.openai.com/v1/chat/completions",
                    "embeddings": "https://api.openai.com/v1/embeddings",
                    "models": "https://api.openai.com/v1/models",
                    "status": "configured" if llm_config.get("openai", {}).get("api_key") else "not_configured"
                },
                "google": {
                    "base_url": "https://generativelanguage.googleapis.com/v1beta",
                    "models": "https://generativelanguage.googleapis.com/v1beta/models",
                    "generate_content": "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    "status": "configured" if llm_config.get("google", {}).get("api_key") else "not_configured"
                },
                "anthropic": {
                    "base_url": "https://api.anthropic.com/v1",
                    "messages": "https://api.anthropic.com/v1/messages",
                    "status": "not_configured"  # 현재 설정 파일에 없음
                }
            }
            
            return endpoints
            
        except Exception as e:
            logger.error(f"API 엔드포인트 로드 실패: {e}")
            return self._get_fallback_api_endpoints()
    
    def _get_fallback_api_endpoints(self) -> Dict[str, Any]:
        """Fallback API 엔드포인트 반환"""
        return {
            "openai": {
                "base_url": "https://api.openai.com/v1",
                "chat_completions": "https://api.openai.com/v1/chat/completions",
                "status": "not_configured"
            },
            "google": {
                "base_url": "https://generativelanguage.googleapis.com/v1beta",
                "models": "https://generativelanguage.googleapis.com/v1beta/models",
                "status": "not_configured"
            }
        }
    
    def get_demo_limits(self) -> Dict[str, Any]:
        """Demo 환경 제한 설정 반환"""
        return self.config_manager.get_config("demo.limits", {
            "max_documents": 100,
            "max_queries_per_minute": 30,
            "max_response_length": 2000,
            "max_chunk_size": 1000,
            "max_embedding_batch_size": 10
        })
    
    def get_ui_settings(self) -> Dict[str, Any]:
        """UI 설정 반환"""
        return self.config_manager.get_config("demo.ui", {
            "show_debug_info": True,
            "enable_metrics_dashboard": True,
            "auto_refresh_interval": 5000,
            "theme": "light",
            "language": "ko"
        })
    
    def get_sample_data_config(self) -> Dict[str, Any]:
        """샘플 데이터 설정 반환"""
        return self.config_manager.get_config("demo.sample_data", {
            "load_on_startup": True,
            "documents_path": "./sampledata",
            "auto_load_sample_documents": True,
            "sample_document_types": ["PROJECT", "QA", "MANUAL"]
        })
    
    def get_rag_config(self) -> Dict[str, Any]:
        """RAG 설정 반환"""
        return self.config_manager.get_config("rag", {
            "chunk_size": 300,
            "chunk_overlap": 50,
            "top_k": 3,
            "similarity_threshold": 0.6,
            "max_context_length": 4000,
            "project_priority_boost": True,
            "include_metadata": True
        })
    
    def get_performance_config(self) -> Dict[str, Any]:
        """성능 설정 반환"""
        return self.config_manager.get_config("performance", {
            "max_concurrent_requests": 10,
            "request_timeout_seconds": 15,
            "mock_llm": {
                "response_delay": 0.3
            },
            "metrics": {
                "collection_interval": 30
            },
            "health_check": {
                "interval": 15,
                "timeout": 3
            }
        })
    
    def reload_config(self) -> bool:
        """설정 재로드"""
        try:
            self.config_manager.reload_config()
            self._model_info_cache = None
            self._api_endpoints_cache = None
            logger.info("✅ Demo 설정 재로드 완료")
            return True
        except Exception as e:
            logger.error(f"❌ Demo 설정 재로드 실패: {e}")
            return False
    
    def get_config_summary(self) -> Dict[str, Any]:
        """설정 요약 정보 반환"""
        try:
            return {
                "environment": self.environment,
                "config_loaded": self.config_manager._loaded,
                "config_file": str(self.config_manager.config_file),
                "model_info_loaded": self._model_info_cache is not None,
                "api_endpoints_loaded": self._api_endpoints_cache is not None,
                "demo_limits": self.get_demo_limits(),
                "ui_settings": self.get_ui_settings(),
                "rag_config": self.get_rag_config(),
                "last_updated": self.config_manager.get_config("last_updated", "unknown")
            }
        except Exception as e:
            logger.error(f"설정 요약 정보 조회 실패: {e}")
            return {
                "environment": self.environment,
                "error": str(e),
                "config_loaded": False
            }


# 전역 Demo 설정 서비스 인스턴스
demo_config_service = None


def get_demo_config_service(environment: str = "demo") -> DemoConfigService:
    """전역 Demo 설정 서비스 반환"""
    global demo_config_service
    
    if demo_config_service is None:
        demo_config_service = DemoConfigService(environment)
        
    return demo_config_service
