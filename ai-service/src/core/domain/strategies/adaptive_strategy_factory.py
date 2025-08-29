"""
Adaptive Strategy Factory
설정 기반으로 동적 RAG 전략을 생성하는 팩토리
"""

from typing import Dict, Any, List, Optional, Type
import json
import logging
from pathlib import Path

from .base_strategy import RAGStrategy, QueryType
from ..models import RAGQuery, RAGResult, DocumentType

logger = logging.getLogger(__name__)


class ConfigurableStrategy(RAGStrategy):
    """YAML 설정 기반 동적 RAG 전략"""
    
    def __init__(self, config: Dict[str, Any]):
        strategy_name = config.get('name', 'configurable')
        super().__init__(strategy_name)
        
        self.config = config
        self.target_query_types = [QueryType(qt) for qt in config.get('target_query_types', ['general'])]
        self.base_score = config.get('base_score', 0.5)
        
        # 설정에서 각종 파라미터 로드
        self._load_document_filters()
        self._load_text_splitter_config()
        self._load_embedding_config() 
        self._load_search_config()
        
    def _load_document_filters(self):
        """문서 필터 설정 로드"""
        filter_config = self.config.get('document_filters', {})
        self.document_filter_config = {
            'document_type': [DocumentType(dt) for dt in filter_config.get('document_types', ['general'])],
            'priority_min': filter_config.get('priority_min', 5),
            'additional_filters': filter_config.get('additional_filters', {})
        }
        
    def _load_text_splitter_config(self):
        """텍스트 분할 설정 로드"""
        splitter_config = self.config.get('text_splitter', {})
        self.text_splitter_config = {
            'strategy': splitter_config.get('strategy', 'semantic'),
            'chunk_size': splitter_config.get('chunk_size', 500),
            'overlap': splitter_config.get('overlap', 75),
            **splitter_config.get('advanced_options', {})
        }
        
    def _load_embedding_config(self):
        """임베딩 설정 로드"""
        embedding_config = self.config.get('embedding', {})
        self.embedding_config = {
            'batch_size': embedding_config.get('batch_size', 20),
            'normalize': embedding_config.get('normalize', True),
            'model_preference': embedding_config.get('model_preference', 'multilingual'),
            **embedding_config.get('advanced_options', {})
        }
        
    def _load_search_config(self):
        """검색 설정 로드"""
        search_config = self.config.get('search', {})
        self.search_config = {
            'top_k': search_config.get('top_k', 6),
            'similarity_threshold': search_config.get('similarity_threshold', 0.7),
            'use_hybrid_search': search_config.get('use_hybrid_search', True),
            **search_config.get('boost_settings', {}),
            **search_config.get('advanced_options', {})
        }
    
    async def execute(self, rag_query: RAGQuery, context: Dict[str, Any]) -> RAGResult:
        """설정 기반 RAG 전략 실행"""
        
        # 문서 필터 적용
        document_filters = self.get_document_filters(rag_query.question)
        
        # 메타데이터에 전략 정보 추가
        strategy_metadata = {
            'strategy_name': self.strategy_name,
            'strategy_type': 'configurable',
            'config_version': self.config.get('version', '1.0'),
            'document_filters': document_filters,
            'search_config': self.search_config
        }
        
        # context에 전략별 설정 추가
        enhanced_context = {
            **context,
            'strategy_metadata': strategy_metadata,
            'document_filters': document_filters,
            'text_splitter_config': self.text_splitter_config,
            'embedding_config': self.embedding_config,
            'search_config': self.search_config
        }
        
        return enhanced_context
    
    def can_handle(self, query: str, query_type: QueryType) -> float:
        """설정 기반 적합도 점수 계산"""
        
        # 타겟 쿼리 타입 체크
        if query_type in self.target_query_types:
            type_bonus = 0.3
        else:
            type_bonus = 0.0
        
        # 설정된 키워드 매칭 (optional)
        keyword_score = 0.0
        if 'keywords' in self.config:
            keywords = self._extract_keywords(query)
            target_keywords = self.config['keywords']
            keyword_score = self._calculate_keyword_match_score(keywords, target_keywords)
        
        # 종합 점수
        total_score = self.base_score + type_bonus + keyword_score * 0.2
        
        return min(total_score, 1.0)
    
    def get_document_filters(self, query: str) -> Dict[str, Any]:
        """설정 기반 문서 필터"""
        return self.document_filter_config.copy()
    
    def get_text_splitter_config(self) -> Dict[str, Any]:
        """설정 기반 텍스트 분할 설정"""
        return self.text_splitter_config.copy()
    
    def get_embedding_config(self) -> Dict[str, Any]:
        """설정 기반 임베딩 설정"""
        return self.embedding_config.copy()
    
    def get_search_config(self) -> Dict[str, Any]:
        """설정 기반 검색 설정"""
        return self.search_config.copy()


class AdaptiveStrategyFactory:
    """동적 RAG 전략 생성 팩토리"""
    
    def __init__(self, config_dir: str = "ai-service/config/strategies"):
        self.config_dir = Path(config_dir)
        self.loaded_strategies = {}
        self.strategy_templates = {}
        
        # 기본 전략 템플릿 로드
        self._load_default_templates()
        
    def _load_default_templates(self):
        """기본 전략 템플릿들 정의"""
        self.strategy_templates = {
            "project_focused": {
                "name": "project_focused_v2",
                "target_query_types": ["project"],
                "base_score": 0.8,
                "document_filters": {
                    "document_types": ["project"],
                    "priority_min": 7
                },
                "text_splitter": {
                    "strategy": "semantic",
                    "chunk_size": 600,
                    "overlap": 100,
                    "advanced_options": {
                        "preserve_code_blocks": True,
                        "prefer_project_sections": True
                    }
                },
                "search": {
                    "top_k": 8,
                    "similarity_threshold": 0.7,
                    "boost_settings": {
                        "tech_stack_boost": 2.0,
                        "boost_recent_projects": True
                    }
                }
            },
            
            "experience_focused": {
                "name": "experience_focused_v2", 
                "target_query_types": ["experience"],
                "base_score": 0.8,
                "document_filters": {
                    "document_types": ["experience"],
                    "priority_min": 6
                },
                "text_splitter": {
                    "chunk_size": 500,
                    "overlap": 75,
                    "advanced_options": {
                        "preserve_achievement_sections": True
                    }
                },
                "search": {
                    "top_k": 6,
                    "similarity_threshold": 0.75,
                    "boost_settings": {
                        "achievement_boost": 1.5,
                        "boost_recent_experience": True
                    }
                }
            },
            
            "skill_focused": {
                "name": "skill_focused_v2",
                "target_query_types": ["skill"],
                "base_score": 0.85,
                "document_filters": {
                    "document_types": ["project", "skill"],
                    "priority_min": 5
                },
                "text_splitter": {
                    "chunk_size": 400,
                    "overlap": 50,
                    "advanced_options": {
                        "preserve_tech_sections": True
                    }
                },
                "search": {
                    "top_k": 5,
                    "similarity_threshold": 0.8,
                    "boost_settings": {
                        "exact_tech_match_boost": 3.0,
                        "skill_level_boost": 1.2
                    }
                }
            }
        }
    
    def create_strategy_from_config(self, config: Dict[str, Any]) -> ConfigurableStrategy:
        """설정으로부터 전략 생성"""
        strategy = ConfigurableStrategy(config)
        strategy_name = config.get('name', 'unnamed')
        self.loaded_strategies[strategy_name] = strategy
        
        logger.info(f"설정 기반 전략 생성: {strategy_name}")
        return strategy
    
    def create_strategy_from_template(self, template_name: str, overrides: Dict[str, Any] = None) -> ConfigurableStrategy:
        """템플릿으로부터 전략 생성"""
        if template_name not in self.strategy_templates:
            raise ValueError(f"알 수 없는 전략 템플릿: {template_name}")
        
        # 템플릿 복사
        config = self.strategy_templates[template_name].copy()
        
        # 오버라이드 적용
        if overrides:
            self._deep_update(config, overrides)
        
        return self.create_strategy_from_config(config)
    
    def create_strategy_from_file(self, config_file_path: str) -> ConfigurableStrategy:
        """JSON 파일로부터 전략 생성"""
        config_path = Path(config_file_path)
        
        if not config_path.exists():
            raise FileNotFoundError(f"설정 파일을 찾을 수 없음: {config_file_path}")
        
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        return self.create_strategy_from_config(config)
    
    def load_strategies_from_directory(self) -> List[ConfigurableStrategy]:
        """디렉토리에서 모든 전략 설정 파일 로드"""
        strategies = []
        
        if not self.config_dir.exists():
            logger.warning(f"전략 설정 디렉토리가 없음: {self.config_dir}")
            return strategies
        
        for config_file in self.config_dir.glob("*.json"):
            try:
                strategy = self.create_strategy_from_file(str(config_file))
                strategies.append(strategy)
                logger.info(f"전략 파일 로드: {config_file.name}")
            except Exception as e:
                logger.error(f"전략 파일 로드 실패 {config_file.name}: {e}")
        
        return strategies
    
    def get_all_template_strategies(self) -> List[ConfigurableStrategy]:
        """모든 기본 템플릿으로부터 전략들 생성"""
        strategies = []
        
        for template_name in self.strategy_templates:
            try:
                strategy = self.create_strategy_from_template(template_name)
                strategies.append(strategy)
            except Exception as e:
                logger.error(f"템플릿 전략 생성 실패 {template_name}: {e}")
        
        return strategies
    
    def save_strategy_config(self, strategy_name: str, config: Dict[str, Any], file_path: str = None):
        """전략 설정을 JSON 파일로 저장"""
        if file_path is None:
            file_path = self.config_dir / f"{strategy_name}.json"
        else:
            file_path = Path(file_path)
        
        # 디렉토리 생성
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        logger.info(f"전략 설정 저장: {file_path}")
    
    def _deep_update(self, base_dict: Dict[str, Any], update_dict: Dict[str, Any]):
        """딕셔너리 깊은 업데이트"""
        for key, value in update_dict.items():
            if key in base_dict and isinstance(base_dict[key], dict) and isinstance(value, dict):
                self._deep_update(base_dict[key], value)
            else:
                base_dict[key] = value
    
    def get_strategy_info(self) -> Dict[str, Any]:
        """팩토리 정보 반환"""
        return {
            "config_directory": str(self.config_dir),
            "loaded_strategies": list(self.loaded_strategies.keys()),
            "available_templates": list(self.strategy_templates.keys()),
            "total_strategies": len(self.loaded_strategies)
        }