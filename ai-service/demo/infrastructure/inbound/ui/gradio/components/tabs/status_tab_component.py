"""
System Info Tab Component
시스템 정보 탭 컴포넌트

순수한 UI 컴포넌트입니다. UI 구성만 담당하고 이벤트 처리는 GradioAdapter에 위임합니다.
"""

import gradio as gr
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class SystemInfoTabComponent:
    """시스템 정보 탭 컴포넌트 - 순수한 UI 구성만 담당"""
    
    def __init__(self, gradio_adapter):
        """
        Args:
            gradio_adapter: Gradio 어댑터 (의존성 주입)
        """
        self.gradio_adapter = gradio_adapter
        logger.info("✅ System Info Tab Component initialized with Gradio Adapter")
    
    def create_tab(self) -> gr.Tab:
        """시스템 정보 탭 생성"""
        with gr.Tab("📊 System Info", id=4) as tab:
            gr.Markdown("## 📊 System Info")
            gr.Markdown("시스템 정보, 아키텍처, 모델 상태 등을 확인할 수 있습니다")
            
            # 아키텍처 정보 섹션
            gr.Markdown("### 🏗️ 아키텍처 정보")
            with gr.Row():
                architecture_btn = gr.Button("🏗️ 아키텍처 정보 조회", variant="primary")
                architecture_refresh_btn = gr.Button("🔄 새로고침", size="sm")
            
            architecture_output = gr.HTML(
                label="아키텍처 정보",
                value="<div style='text-align: center; color: #666; padding: 40px;'>아키텍처 정보를 조회하면 여기에 표시됩니다.</div>"
            )
            
            # 모델 정보 섹션
            gr.Markdown("### 🤖 모델 정보")
            model_info_btn = gr.Button("🤖 모델 정보 조회", variant="primary")
            model_output = gr.HTML(
                label="모델 정보",
                value="<div style='text-align: center; color: #666; padding: 40px;'>모델 정보를 조회하면 여기에 표시됩니다.</div>"
            )
            
            # 시스템 상태 섹션
            gr.Markdown("### 💾 시스템 상태")
            system_status_btn = gr.Button("💾 시스템 상태 조회", variant="primary")
            system_output = gr.HTML(
                label="시스템 상태",
                value="<div style='text-align: center; color: #666; padding: 40px;'>시스템 상태를 조회하면 여기에 표시됩니다.</div>"
            )
            
            # 설정 상태 섹션
            gr.Markdown("### ⚙️ 설정 상태")
            config_status_btn = gr.Button("⚙️ 설정 상태 조회", variant="primary")
            config_output = gr.HTML(
                label="설정 상태",
                value="<div style='text-align: center; color: #666; padding: 40px;'>설정 상태를 조회하면 여기에 표시됩니다.</div>"
            )
            
            # 처리 메트릭스 섹션
            gr.Markdown("### 📊 처리 메트릭스")
            metrics_btn = gr.Button("📊 처리 메트릭스 조회", variant="primary")
            metrics_output = gr.HTML(
                label="처리 메트릭스",
                value="<div style='text-align: center; color: #666; padding: 40px;'>처리 메트릭스를 조회하면 여기에 표시됩니다.</div>"
            )
            
            # 성능 분석 섹션
            gr.Markdown("### ⚡ 성능 분석")
            performance_btn = gr.Button("⚡ 성능 분석 조회", variant="primary")
            performance_output = gr.HTML(
                label="성능 분석",
                value="<div style='text-align: center; color: #666; padding: 40px;'>성능 분석을 조회하면 여기에 표시됩니다.</div>"
            )
            
            # 전체 상태 요약 섹션
            gr.Markdown("### 📋 전체 상태 요약")
            with gr.Row():
                overall_status_btn = gr.Button("📋 전체 상태 요약", variant="primary", size="lg")
                refresh_all_btn = gr.Button("🔄 모든 정보 새로고침", variant="secondary", size="lg")
            
            overall_status = gr.HTML(
                label="전체 상태 요약",
                value="<div style='text-align: center; color: #666; padding: 40px;'>전체 상태를 조회하면 여기에 요약이 표시됩니다.</div>"
            )
            
            # Event handlers - GradioAdapter에 위임
            architecture_btn.click(
                fn=self.gradio_adapter.handle_get_architecture_info,
                outputs=architecture_output
            )
            
            architecture_refresh_btn.click(
                fn=self.gradio_adapter.handle_get_architecture_info,
                outputs=architecture_output
            )
            
            model_info_btn.click(
                fn=self.gradio_adapter.handle_get_model_info,
                outputs=model_output
            )
            
            system_status_btn.click(
                fn=self.gradio_adapter.handle_get_system_status,
                outputs=system_output
            )
            
            config_status_btn.click(
                fn=self.gradio_adapter.handle_get_config_status,
                outputs=config_output
            )
            
            metrics_btn.click(
                fn=self.gradio_adapter.handle_get_processing_metrics,
                outputs=metrics_output
            )
            
            performance_btn.click(
                fn=self.gradio_adapter.handle_get_performance_analysis,
                outputs=performance_output
            )
            
            overall_status_btn.click(
                fn=self.gradio_adapter.handle_get_overall_status,
                outputs=overall_status
            )
            
            refresh_all_btn.click(
                fn=self.gradio_adapter.handle_get_overall_status,
                outputs=overall_status
            )
        
        return tab