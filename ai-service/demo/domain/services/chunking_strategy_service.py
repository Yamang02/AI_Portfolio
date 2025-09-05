"""
Chunking Strategy Service
청킹 전략 도메인 서비스

청킹 전략 관련 비즈니스 로직을 담당합니다.
ConfigManager를 통해 설정을 관리합니다.
"""

import logging
from typing import Dict, List, Optional
from domain.entities.chunking_strategy import ChunkingStrategy, ChunkingStrategyConfig
from core.shared.config.chunking.chunking_config_manager import ChunkingConfigManager

logger = logging.getLogger(__name__)


class ChunkingStrategyService:
    """청킹 전략 도메인 서비스"""
    
    def __init__(self):
        self._config: Optional[ChunkingStrategyConfig] = None
        self.config_manager = ChunkingConfigManager()
    
    def load_strategies(self) -> ChunkingStrategyConfig:
        """청킹 전략 설정 로드"""
        try:
            # ChunkingConfigManager를 통해 설정 로드
            raw_config = self.config_manager._config_cache
            
            if not raw_config:
                logger.warning("청킹 전략 설정을 로드할 수 없습니다. 기본 설정을 사용합니다.")
                return self._create_default_config()
            
            # 엔티티로 변환
            strategies = {}
            for name, strategy_data in raw_config.get('chunking_strategies', {}).items():
                # parameters 섹션에서 실제 값 추출
                parameters = strategy_data.get('parameters', {})
                strategies[name] = ChunkingStrategy(
                    name=name,
                    description=strategy_data.get('description', ''),
                    chunk_size=parameters.get('chunk_size', 500),
                    chunk_overlap=parameters.get('chunk_overlap', 75),
                    detection_rules=strategy_data.get('detection_rules', {}),
                    performance_settings=strategy_data.get('performance_settings', {})
                )
            
            self._config = ChunkingStrategyConfig(
                strategies=strategies,
                document_detection=raw_config.get('document_detection', {}),
                performance=raw_config.get('performance', {})
            )
            
            logger.info(f"청킹 전략 설정 로드 완료: {len(strategies)}개 전략")
            return self._config
            
        except Exception as e:
            logger.error(f"청킹 전략 설정 로드 실패: {e}")
            return self._create_default_config()
    
    def get_strategy(self, name: str) -> Optional[ChunkingStrategy]:
        """전략 이름으로 전략 조회"""
        if not self._config:
            self.load_strategies()
        
        return self._config.get_strategy(name) if self._config else None
    
    def get_all_strategies(self) -> List[ChunkingStrategy]:
        """모든 전략 목록 반환"""
        if not self._config:
            self.load_strategies()
        
        return self._config.get_all_strategies() if self._config else []
    
    def get_strategy_names(self) -> List[str]:
        """전략 이름 목록 반환"""
        if not self._config:
            self.load_strategies()
        
        return self._config.get_strategy_names() if self._config else []
    
    def get_default_chunk_size(self, strategy_name: str) -> int:
        """전략별 기본 청크 크기 반환"""
        strategy = self.get_strategy(strategy_name)
        return strategy.chunk_size if strategy else 500
    
    def get_default_chunk_overlap(self, strategy_name: str) -> int:
        """전략별 기본 청크 겹침 반환"""
        strategy = self.get_strategy(strategy_name)
        return strategy.chunk_overlap if strategy else 75
    
    
    def _create_default_config(self) -> ChunkingStrategyConfig:
        """기본 설정 생성"""
        default_strategies = {
            "PROJECT": ChunkingStrategy(
                name="PROJECT",
                description="프로젝트 문서용 청킹 전략",
                chunk_size=600,
                chunk_overlap=100,
                detection_rules={},
                performance_settings={}
            ),
            "QA": ChunkingStrategy(
                name="QA",
                description="Q&A 문서용 청킹 전략",
                chunk_size=400,
                chunk_overlap=50,
                detection_rules={},
                performance_settings={}
            ),
            "TEXT": ChunkingStrategy(
                name="TEXT",
                description="일반 텍스트용 청킹 전략",
                chunk_size=500,
                chunk_overlap=75,
                detection_rules={},
                performance_settings={}
            )
        }
        
        return ChunkingStrategyConfig(
            strategies=default_strategies,
            document_detection={},
            performance={}
        )
