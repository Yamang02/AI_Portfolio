"""
System Info Adapter
시스템 정보 관련 기능을 담당하는 어댑터
"""

import logging
from typing import Any, Tuple
import gradio as gr

logger = logging.getLogger(__name__)


class SystemInfoAdapter:
    """시스템 정보 관련 기능을 담당하는 어댑터"""
    
    def __init__(self, usecase_factory):
        """
        Args:
            usecase_factory: UseCase 팩토리 (의존성 주입)
        """
        self.usecase_factory = usecase_factory
        logger.info("✅ System Info Adapter initialized")
    
    # ==================== System Info 관련 이벤트 핸들러 ====================
    
    def handle_get_architecture_info(self) -> str:
        """아키텍처 정보 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetArchitectureInfoUseCase").execute()
            return self._format_architecture_info_response(result)
        except Exception as e:
            logger.error(f"Error in handle_get_architecture_info: {e}")
            return self._format_error_html(str(e))
    
    def handle_get_model_info(self) -> str:
        """모델 정보 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetModelInfoUseCase").execute()
            return self._format_model_info_response(result)
        except Exception as e:
            logger.error(f"Error in handle_get_model_info: {e}")
            return self._format_error_html(str(e))
    
    def handle_get_system_status(self) -> str:
        """시스템 상태 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetSystemStatusUseCase").execute()
            return self._format_system_status_response(result)
        except Exception as e:
            logger.error(f"Error in handle_get_system_status: {e}")
            return self._format_error_html(str(e))
    
    def handle_get_config_status(self) -> str:
        """설정 상태 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetConfigurationStatusUseCase").execute()
            return self._format_config_status_response(result)
        except Exception as e:
            logger.error(f"Error in handle_get_config_status: {e}")
            return self._format_error_html(str(e))
    
    def handle_get_processing_metrics(self) -> str:
        """처리 메트릭스 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetProcessingMetricsUseCase").execute()
            return self._format_processing_metrics_response(result)
        except Exception as e:
            logger.error(f"Error in handle_get_processing_metrics: {e}")
            return self._format_error_html(str(e))
    
    # ==================== 응답 포맷팅 메서드들 ====================
    
    def _format_architecture_info_response(self, result: dict) -> str:
        """아키텍처 정보 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            info = result.get("architecture_info", {})
            content = info.get('description', '아키텍처 정보를 불러올 수 없습니다.')
            return GradioCommonComponents.create_info_card(content, "🏗️ 시스템 아키텍처")
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "아키텍처 정보를 불러올 수 없습니다.")
            )
    
    def _format_model_info_response(self, result: dict) -> str:
        """모델 정보 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            models = result.get("models", {})
            llm_model = models.get("llm", {})
            embedding_model = models.get("embedding", {})
            
            return GradioCommonComponents.create_model_info_grid(llm_model, embedding_model)
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "모델 정보를 불러올 수 없습니다.")
            )
    
    def _format_system_status_response(self, result: dict) -> str:
        """시스템 상태 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            status = result.get("system_status", {})
            content = status.get('status', '시스템 상태를 불러올 수 없습니다.')
            return GradioCommonComponents.create_info_card(content, "📊 시스템 상태")
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "시스템 상태를 불러올 수 없습니다.")
            )
    
    def _format_config_status_response(self, result: dict) -> str:
        """설정 상태 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            config_status = result.get("config_status", {})
            content = config_status.get('status', '설정 상태를 불러올 수 없습니다.')
            return GradioCommonComponents.create_info_card(content, "⚙️ 설정 상태")
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "설정 상태를 불러올 수 없습니다.")
            )
    
    def _format_processing_metrics_response(self, result: dict) -> str:
        """처리 메트릭스 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            metrics = result.get("processing_metrics", {})
            content = metrics.get('metrics', '처리 메트릭스를 불러올 수 없습니다.')
            return GradioCommonComponents.create_info_card(content, "📈 처리 메트릭스")
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "처리 메트릭스를 불러올 수 없습니다.")
            )
    
    def handle_get_performance_analysis(self) -> str:
        """성능 분석 조회"""
        try:
            # 성능 분석 로직 (구현 필요)
            return GradioCommonComponents.create_info_card(
                "성능 분석 기능은 구현 중입니다.",
                "성능 분석"
            )
        except Exception as e:
            logger.error(f"성능 분석 실패: {e}")
            return self._format_error_html(f"성능 분석 실패: {str(e)}")
    
    def handle_get_overall_status(self) -> str:
        """전체 상태 조회"""
        try:
            # 전체 상태 조회 로직 (구현 필요)
            return GradioCommonComponents.create_info_card(
                "전체 상태 조회 기능은 구현 중입니다.",
                "전체 상태"
            )
        except Exception as e:
            logger.error(f"전체 상태 조회 실패: {e}")
            return self._format_error_html(f"전체 상태 조회 실패: {str(e)}")
    
    def _format_error_html(self, error_message: str) -> str:
        """에러 HTML 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        return GradioCommonComponents.create_error_message(error_message)
