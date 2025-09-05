"""
System Info Tab Adapter
시스템 정보 탭 어댑터

시스템 정보 및 아키텍처 시각화 탭의 UI를 담당합니다.
아키텍처 다이어그램, 모델 상태, 설정 정보, 처리 메트릭스를 표시합니다.
"""

import gradio as gr
import logging
from typing import Optional
from application.usecases.get_architecture_info_usecase import GetArchitectureInfoUseCase
from application.usecases.get_system_status_usecase import GetSystemStatusUseCase
from application.usecases.get_model_info_usecase import GetModelInfoUseCase
from application.usecases.get_configuration_status_usecase import GetConfigurationStatusUseCase
from application.usecases.get_processing_metrics_usecase import GetProcessingMetricsUseCase

logger = logging.getLogger(__name__)


class SystemInfoTabAdapter:
    """시스템 정보 탭 어댑터 - 아키텍처 시각화와 시스템 상태 UI"""
    
    def __init__(
        self,
        embedding_service=None,
        chunking_service=None,
        processing_status_service=None,
        validation_service=None,
        generation_service=None,
        batch_processing_service=None,
        config_manager=None
    ):
        # Use Cases 초기화
        self.architecture_usecase = GetArchitectureInfoUseCase()
        self.system_status_usecase = GetSystemStatusUseCase(
            embedding_service=embedding_service,
            chunking_service=chunking_service,
            processing_status_service=processing_status_service,
            validation_service=validation_service
        )
        self.model_info_usecase = GetModelInfoUseCase(
            embedding_service=embedding_service,
            generation_service=generation_service
        )
        self.config_status_usecase = GetConfigurationStatusUseCase(
            config_manager=config_manager
        )
        self.processing_metrics_usecase = GetProcessingMetricsUseCase(
            processing_status_service=processing_status_service,
            embedding_service=embedding_service,
            chunking_service=chunking_service,
            batch_processing_service=batch_processing_service,
            validation_service=validation_service
        )
        
        logger.info("✅ System Info Tab Adapter initialized")
    
    def create_tab(self) -> gr.Tab:
        """시스템 정보 탭 생성"""
        with gr.Tab("🏗️ 시스템 정보", id=5) as tab:
            gr.Markdown("## 🏗️ 시스템 정보 및 아키텍처")
            gr.Markdown("헥사고널 아키텍처 구조, 시스템 상태, 모델 정보, 처리 메트릭스를 확인합니다")
            
            # Section A: 아키텍처 시각화 (최상단)
            with gr.Accordion("🏗️ 아키텍처 시각화", open=True):
                with gr.Row():
                    architecture_btn = gr.Button("🏗️ 아키텍처 정보 보기", variant="primary")
                    architecture_refresh_btn = gr.Button("🔄 새로고침", variant="secondary")
                
                architecture_output = gr.Textbox(
                    label="헥사고널 아키텍처 구조 및 데이터 흐름",
                    lines=20,
                    interactive=False
                )
            
            # Section B: 모델 및 서비스 상태
            with gr.Accordion("🤖 모델 및 서비스 상태", open=False):
                with gr.Row():
                    with gr.Column(scale=1):
                        model_info_btn = gr.Button("🤖 모델 정보", variant="primary")
                        model_output = gr.Textbox(
                            label="임베딩 모델 & LLM 상태",
                            lines=12,
                            interactive=False
                        )
                    
                    with gr.Column(scale=1):
                        system_status_btn = gr.Button("💾 시스템 상태", variant="primary")
                        system_output = gr.Textbox(
                            label="서비스 상태 & 리소스 사용량",
                            lines=12,
                            interactive=False
                        )
            
            # Section C: 설정 및 구성 정보
            with gr.Accordion("⚙️ 설정 및 구성 정보", open=False):
                with gr.Row():
                    config_status_btn = gr.Button("⚙️ 설정 상태 확인", variant="primary")
                    config_reload_btn = gr.Button("🔄 설정 재로드", variant="secondary")
                
                config_output = gr.Textbox(
                    label="설정 파일 로드 상태 및 검증 결과",
                    lines=15,
                    interactive=False
                )
            
            # Section D: 처리 현황 대시보드
            with gr.Accordion("📊 처리 현황 대시보드", open=False):
                with gr.Row():
                    with gr.Column(scale=1):
                        metrics_btn = gr.Button("📊 처리 메트릭스", variant="primary")
                        metrics_output = gr.Textbox(
                            label="실시간 처리 통계",
                            lines=15,
                            interactive=False
                        )
                    
                    with gr.Column(scale=1):
                        performance_btn = gr.Button("⚡ 성능 분석", variant="primary")
                        performance_output = gr.Textbox(
                            label="성능 트렌드 & 병목 분석",
                            lines=15,
                            interactive=False
                        )
            
            # 하단: 종합 상태 표시
            with gr.Row():
                overall_status = gr.Textbox(
                    label="🚦 전체 시스템 상태",
                    lines=3,
                    interactive=False,
                    value="시스템 정보를 로드하려면 위의 버튼들을 클릭하세요"
                )
            
            # Event handlers
            architecture_btn.click(
                fn=self._get_architecture_info,
                outputs=architecture_output
            )
            architecture_refresh_btn.click(
                fn=self._get_architecture_info,
                outputs=architecture_output
            )
            
            model_info_btn.click(
                fn=self._get_model_info,
                outputs=model_output
            )
            
            system_status_btn.click(
                fn=self._get_system_status,
                outputs=system_output
            )
            
            config_status_btn.click(
                fn=self._get_config_status,
                outputs=config_output
            )
            
            metrics_btn.click(
                fn=self._get_processing_metrics,
                outputs=metrics_output
            )
            
            performance_btn.click(
                fn=self._get_performance_analysis,
                outputs=performance_output
            )
            
            # 전체 상태 업데이트 이벤트들
            for btn in [architecture_btn, model_info_btn, system_status_btn, config_status_btn]:
                btn.click(
                    fn=self._get_overall_status,
                    outputs=overall_status
                )
        
        return tab
    
    def _get_architecture_info(self) -> str:
        """아키텍처 정보 조회"""
        try:
            architecture_info = self.architecture_usecase.execute()
            
            result = "🏗️ **헥사고널 아키텍처 구조**\n\n"
            
            # 헥사고널 아키텍처 구조
            hex_structure = architecture_info["hexagonal_architecture"]
            result += f"**🔵 Core (도메인)**\n"
            result += f"• {hex_structure['core']['name']}: {hex_structure['core']['description']}\n"
            result += f"• 구성요소: {', '.join(hex_structure['core']['components'])}\n\n"
            
            result += f"**🔶 Application Layer**\n"
            result += f"• {hex_structure['application']['name']}: {hex_structure['application']['description']}\n"
            result += f"• 구성요소: {', '.join(hex_structure['application']['components'])}\n\n"
            
            result += f"**🔷 Inbound Adapters**\n"
            result += f"• {hex_structure['adapters']['inbound']['name']}: {hex_structure['adapters']['inbound']['description']}\n"
            result += f"• 구성요소: {', '.join(hex_structure['adapters']['inbound']['components'])}\n\n"
            
            result += f"**🔸 Outbound Adapters**\n" 
            result += f"• {hex_structure['adapters']['outbound']['name']}: {hex_structure['adapters']['outbound']['description']}\n"
            result += f"• 구성요소: {', '.join(hex_structure['adapters']['outbound']['components'])}\n\n"
            
            # 데이터 흐름
            result += "**🔄 주요 데이터 흐름**\n\n"
            for flow in architecture_info["data_flows"][:3]:  # 상위 3개만 표시
                result += f"**{flow['name']}:**\n"
                for step in flow['steps']:
                    result += f"  {step}\n"
                result += f"  관련 컴포넌트: {', '.join(flow['components'])}\n\n"
            
            # 기술 스택
            result += "**🛠️ 기술 스택**\n"
            tech_stack = architecture_info["technology_stack"]
            result += f"• UI: {', '.join(tech_stack['ui_framework'])}\n"
            result += f"• AI 모델: {', '.join(tech_stack['ai_models'])}\n"
            result += f"• 저장소: {', '.join(tech_stack['storage'])}\n"
            
            return result
            
        except Exception as e:
            logger.error(f"Error in _get_architecture_info: {e}")
            return f"❌ 아키텍처 정보 조회 실패: {str(e)}"
    
    def _get_model_info(self) -> str:
        """모델 정보 조회"""
        try:
            model_info = self.model_info_usecase.execute()
            
            result = "🤖 **모델 정보**\n\n"
            
            # 임베딩 모델 정보
            embedding_models = model_info["embedding_models"]
            result += "**🔤 임베딩 모델**\n"
            result += f"• 상태: {'✅ ' + embedding_models['status'] if embedding_models['status'] == 'loaded' else '❌ ' + embedding_models['status']}\n"
            
            if "primary_model" in embedding_models:
                model = embedding_models["primary_model"]
                result += f"• 모델명: {model['name']}\n"
                result += f"• 차원: {model['dimension']}\n"
                result += f"• 메모리 사용량: {model.get('memory_usage_mb', 0)}MB\n"
                
                stats = embedding_models.get("statistics", {})
                result += f"• 생성된 임베딩: {stats.get('total_embeddings_created', 0)}개\n"
                result += f"• 벡터 저장소 크기: {stats.get('vector_store_size_bytes', 0) / 1024 / 1024:.1f}MB\n"
            
            result += "\n"
            
            # LLM 모델 정보
            llm_models = model_info["llm_models"]
            result += "**🧠 LLM 모델**\n"
            result += f"• 상태: {'✅ ' + llm_models['status'] if llm_models['status'] == 'active' else '❌ ' + llm_models['status']}\n"
            
            if "external_apis" in llm_models:
                result += "• 외부 API:\n"
                for api in llm_models["external_apis"][:2]:  # 상위 2개만 표시
                    status_icon = "✅" if api["status"] == "configured" else "❌"
                    result += f"  - {api['name']} ({api['model']}): {status_icon} {api['status']}\n"
            
            # API 상태
            result += "\n**🌐 API 상태**\n"
            api_statuses = model_info["api_status"]
            for api in api_statuses:
                status_icon = "✅" if api["status"] == "available" else "❓"
                result += f"• {api['name']}: {status_icon} {api['status']}\n"
            
            return result
            
        except Exception as e:
            logger.error(f"Error in _get_model_info: {e}")
            return f"❌ 모델 정보 조회 실패: {str(e)}"
    
    def _get_system_status(self) -> str:
        """시스템 상태 조회"""
        try:
            system_status = self.system_status_usecase.execute()
            
            result = "💾 **시스템 상태**\n\n"
            
            # 시스템 건강도
            health = system_status["system_health"]
            health_icon = {"healthy": "✅", "warning": "⚠️", "critical": "❌", "error": "💥"}.get(health["status"], "❓")
            result += f"**전체 상태:** {health_icon} {health['status']}\n\n"
            
            # 리소스 사용량
            result += "**리소스 사용량:**\n"
            result += f"• CPU: {health.get('cpu_usage_percent', 0):.1f}%\n"
            result += f"• 메모리: {health.get('memory_usage_percent', 0):.1f}%\n"
            result += f"• 디스크: {health.get('disk_usage_percent', 0):.1f}%\n"
            result += f"• 가동시간: {health.get('uptime_formatted', '알 수 없음')}\n\n"
            
            # 서비스 상태
            result += "**서비스 상태:**\n"
            services = system_status["service_statuses"]
            for service in services:
                status_icon = {"active": "✅", "inactive": "⏸️", "error": "❌"}.get(service["status"], "❓")
                result += f"• {service['name']}: {status_icon} {service['status']}\n"
                
                if "details" in service:
                    for key, value in service["details"].items():
                        result += f"  - {key}: {value}\n"
            
            # 에러 요약
            error_summary = system_status.get("error_summary", {})
            if error_summary.get("recent_errors"):
                result += "\n**최근 오류:**\n"
                for error in error_summary["recent_errors"][:3]:  # 최대 3개만
                    result += f"• {error}\n"
            
            return result
            
        except Exception as e:
            logger.error(f"Error in _get_system_status: {e}")
            return f"❌ 시스템 상태 조회 실패: {str(e)}"
    
    def _get_config_status(self) -> str:
        """설정 상태 조회"""
        try:
            config_status = self.config_status_usecase.execute()
            
            result = "⚙️ **설정 상태**\n\n"
            
            # 설정 파일 상태
            result += "**설정 파일 상태:**\n"
            config_files = config_status["config_files"]
            for file_info in config_files:
                status_icon = "✅" if file_info["exists"] else "❌"
                result += f"• {file_info['filename']}: {status_icon} {'존재' if file_info['exists'] else '없음'}\n"
                
                if file_info["exists"] and file_info.get("loaded"):
                    result += f"  - 로드됨: ✅\n"
                elif file_info["exists"]:
                    result += f"  - 로드됨: ❌\n"
                
                if "size_bytes" in file_info and file_info["size_bytes"] > 0:
                    result += f"  - 크기: {file_info['size_bytes']} bytes\n"
            
            result += "\n"
            
            # 설정 섹션 상태
            result += "**설정 섹션 상태:**\n"
            sections = config_status["config_sections"]
            for section in sections:
                status_icon = {"loaded": "✅", "incomplete": "⚠️", "error": "❌", "not_available": "❓"}.get(section["status"], "❓")
                result += f"• {section['name']}: {status_icon} {section['status']}\n"
                result += f"  - 로드된 키: {section['keys_count']}개\n"
                
                if section.get("missing_keys"):
                    result += f"  - 누락된 키: {len(section['missing_keys'])}개\n"
                
                # 주요 설정값 일부 표시
                if section.get("sample_values"):
                    sample_count = min(2, len(section["sample_values"]))  # 최대 2개
                    sample_items = list(section["sample_values"].items())[:sample_count]
                    for key, value in sample_items:
                        result += f"  - {key}: {value}\n"
            
            result += "\n"
            
            # 검증 결과
            validation = config_status.get("validation_results", {})
            if validation:
                result += f"**검증 결과:** {validation.get('overall_status', 'unknown')}\n"
                result += f"**설정 완성도:** {validation.get('config_completeness', 0):.1f}%\n"
                
                if validation.get("critical_issues"):
                    result += f"**중요 문제:** {len(validation['critical_issues'])}개\n"
                if validation.get("warnings"):
                    result += f"**경고:** {len(validation['warnings'])}개\n"
            
            return result
            
        except Exception as e:
            logger.error(f"Error in _get_config_status: {e}")
            return f"❌ 설정 상태 조회 실패: {str(e)}"
    
    def _get_processing_metrics(self) -> str:
        """처리 메트릭스 조회"""
        try:
            metrics = self.processing_metrics_usecase.execute()
            
            result = "📊 **처리 메트릭스**\n\n"
            
            # 전체 메트릭스
            overall = metrics["overall_metrics"]
            result += "**전체 처리 현황:**\n"
            
            chunk_proc = overall["chunk_processing"]
            result += f"• 청크 처리: {chunk_proc['processed_chunks']}/{chunk_proc['total_chunks']}개 ({chunk_proc['processing_rate_percent']:.1f}%)\n"
            
            emb_proc = overall["embedding_processing"]
            result += f"• 임베딩 처리: {emb_proc['created_embeddings']}/{emb_proc['total_embeddings']}개 ({emb_proc['processing_rate_percent']:.1f}%)\n"
            
            sys_perf = overall["system_performance"]
            result += f"• 에러율: {sys_perf.get('error_rate_percent', 0):.1f}%\n"
            result += f"• 평균 응답시간: {sys_perf.get('average_response_time_ms', 0):.0f}ms\n\n"
            
            # 단계별 메트릭스
            result += "**단계별 처리 현황:**\n"
            stage_metrics = metrics["stage_metrics"]
            for stage in stage_metrics[:5]:  # 상위 5개만
                result += f"• {stage['display_name']}: {stage['completed_items']}/{stage['total_items']}개\n"
                if stage.get('success_rate_percent', 0) > 0:
                    result += f"  - 성공률: {stage['success_rate_percent']:.1f}%\n"
                if stage.get('average_duration_ms', 0) > 0:
                    result += f"  - 평균 처리시간: {stage['average_duration_ms']:.0f}ms\n"
            
            # 실시간 메트릭스
            real_time = metrics.get("real_time_metrics", {})
            if real_time.get("current_processing"):
                current = real_time["current_processing"]
                result += "\n**실시간 현황:**\n"
                result += f"• 활성 프로세스: {current.get('active_processes', 0)}개\n"
                result += f"• 대기 프로세스: {current.get('pending_processes', 0)}개\n"
                
                if "batch_jobs_active" in current:
                    result += f"• 배치 작업: {current['batch_jobs_active']}개 진행중\n"
                    if "average_batch_progress" in current:
                        result += f"  - 평균 진행률: {current['average_batch_progress']:.1f}%\n"
            
            return result
            
        except Exception as e:
            logger.error(f"Error in _get_processing_metrics: {e}")
            return f"❌ 처리 메트릭스 조회 실패: {str(e)}"
    
    def _get_performance_analysis(self) -> str:
        """성능 분석 조회"""
        try:
            metrics = self.processing_metrics_usecase.execute()
            
            result = "⚡ **성능 분석**\n\n"
            
            # 병목 분석
            bottleneck = metrics.get("bottleneck_analysis", {})
            if bottleneck.get("identified_bottlenecks"):
                result += "**식별된 병목:**\n"
                for bottleneck_item in bottleneck["identified_bottlenecks"]:
                    impact_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(bottleneck_item.get("impact", "low"), "⚪")
                    result += f"• {bottleneck_item['stage']}: {bottleneck_item['avg_duration_ms']:.0f}ms {impact_icon}\n"
                result += "\n"
            
            # 리소스 사용률
            resource_util = metrics.get("resource_utilization", {})
            if resource_util:
                result += "**리소스 사용률:**\n"
                
                cpu = resource_util.get("cpu_utilization", {})
                result += f"• CPU: 현재 {cpu.get('current_percent', 0):.1f}% (평균 {cpu.get('average_percent', 0):.1f}%)\n"
                
                memory = resource_util.get("memory_utilization", {})
                result += f"• 메모리: {memory.get('current_mb', 0)}MB / {memory.get('available_mb', 0)}MB ({memory.get('utilization_percent', 0):.1f}%)\n"
                
                storage = resource_util.get("storage_utilization", {})
                result += f"• 저장소: 벡터 {storage.get('vector_data_mb', 0)}MB, 문서 {storage.get('document_data_mb', 0)}MB\n"
                
                network = resource_util.get("network_utilization", {})
                result += f"• 네트워크: API 호출 {network.get('api_calls_per_minute', 0)}/분, 평균 지연 {network.get('average_latency_ms', 0):.0f}ms\n\n"
            
            # 성능 권장사항
            recommendations = metrics.get("recommendations", [])
            if recommendations:
                result += "**성능 개선 권장사항:**\n"
                for rec in recommendations[:4]:  # 상위 4개
                    priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(rec.get("priority", "low"), "⚪")
                    result += f"• {rec['recommendation']} {priority_icon}\n"
                    if "expected_benefit" in rec:
                        result += f"  - 예상 효과: {rec['expected_benefit']}\n"
                result += "\n"
            
            # 최적화 기회
            if bottleneck.get("optimization_opportunities"):
                result += "**최적화 기회:**\n"
                for opp in bottleneck["optimization_opportunities"][:3]:  # 상위 3개
                    result += f"• {opp['area']}: {opp['opportunity']}\n"
                    result += f"  - 예상 개선: {opp['expected_improvement']}\n"
            
            return result
            
        except Exception as e:
            logger.error(f"Error in _get_performance_analysis: {e}")
            return f"❌ 성능 분석 조회 실패: {str(e)}"
    
    def _get_overall_status(self) -> str:
        """전체 시스템 상태 요약"""
        try:
            # 각 Use Case에서 빠른 상태 확인
            architecture_status = "✅ 로드됨"
            
            try:
                system_quick = self.system_status_usecase.get_quick_status()
                system_status = {"healthy": "✅ 정상", "warning": "⚠️ 경고", "critical": "❌ 위험", "unknown": "❓ 알 수 없음"}.get(system_quick, "❓")
            except:
                system_status = "❓ 확인 불가"
            
            try:
                model_health = self.model_info_usecase.check_model_health()
                model_status = {"healthy": "✅ 정상", "degraded": "⚠️ 저하", "error": "❌ 오류", "unknown": "❓ 알 수 없음"}.get(model_health.get("overall", "unknown"), "❓")
            except:
                model_status = "❓ 확인 불가"
            
            try:
                config_quick = self.config_status_usecase.get_quick_config_status()
                config_status = {"healthy": "✅ 정상", "warning": "⚠️ 경고", "critical": "❌ 위험", "unknown": "❓ 알 수 없음"}.get(config_quick, "❓")
            except:
                config_status = "❓ 확인 불가"
            
            return f"🏗️ 아키텍처: {architecture_status} | 💾 시스템: {system_status} | 🤖 모델: {model_status} | ⚙️ 설정: {config_status}"
            
        except Exception as e:
            logger.error(f"Error in _get_overall_status: {e}")
            return f"❌ 전체 상태 확인 실패: {str(e)}"
