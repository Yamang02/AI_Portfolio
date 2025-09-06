"""
Get Processing Metrics Use Case - Demo Application Layer
처리 메트릭스 조회 유스케이스

실시간 처리 통계와 성능 메트릭스를 제공합니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict
import time
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)


@dataclass
class ProcessingMetrics:
    """처리 메트릭스"""
    total_processed: int
    successful_processed: int
    failed_processed: int
    pending_processed: int
    average_processing_time_ms: float
    throughput_per_minute: float


@dataclass
class StageMetrics:
    """단계별 메트릭스"""
    stage_name: str
    total_items: int
    completed_items: int
    failed_items: int
    average_duration_ms: float
    success_rate_percent: float


class GetProcessingMetricsUseCase:
    """처리 메트릭스 조회 유스케이스"""
    
    def __init__(
        self,
        processing_status_service=None,
        embedding_service=None,
        chunking_service=None,
        batch_processing_service=None,
        validation_service=None
    ):
        self.processing_status_service = processing_status_service
        self.embedding_service = embedding_service
        self.chunking_service = chunking_service
        self.batch_processing_service = batch_processing_service
        self.validation_service = validation_service
        
    @handle_usecase_errors(
        default_error_message="처리 메트릭스 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetProcessingMetricsUseCase")
    def execute(self, time_range_hours: int = 24) -> Dict[str, Any]:
        """처리 메트릭스 조회 실행"""
        return ResponseFormatter.statistics_response(
            data={
                "overall_metrics": self._get_overall_metrics(),
                "stage_metrics": self._get_stage_metrics(),
                "real_time_metrics": self._get_real_time_metrics(),
                "performance_trends": self._get_performance_trends(time_range_hours),
                "bottleneck_analysis": self._get_bottleneck_analysis(),
                "error_analysis": self._get_error_analysis(),
                "resource_utilization": self._get_resource_utilization(),
                "recommendations": self._get_performance_recommendations()
            },
            message="📊 처리 메트릭스를 성공적으로 조회했습니다"
        )
    
    def _get_overall_metrics(self) -> Dict[str, Any]:
        """전체 처리 메트릭스"""
        overall_metrics = {
            "document_processing": {
                "total_documents": 0,
                "processed_documents": 0,
                "failed_documents": 0,
                "processing_rate_percent": 0.0
            },
            "chunk_processing": {
                "total_chunks": 0,
                "processed_chunks": 0,
                "failed_chunks": 0,
                "processing_rate_percent": 0.0
            },
            "embedding_processing": {
                "total_embeddings": 0,
                "created_embeddings": 0,
                "failed_embeddings": 0,
                "processing_rate_percent": 0.0
            },
            "system_performance": {
                "average_response_time_ms": 0.0,
                "throughput_items_per_minute": 0.0,
                "error_rate_percent": 0.0,
                "uptime_hours": 0.0
            }
        }
        
        # 청킹 서비스 메트릭스
        if self.chunking_service:
            try:
                chunking_stats = self.chunking_service.get_chunking_statistics()
                overall_metrics["chunk_processing"].update({
                    "total_chunks": chunking_stats.get("total_chunks", 0),
                    "processed_chunks": chunking_stats.get("total_chunks", 0),
                    "processing_rate_percent": 100.0 if chunking_stats.get("total_chunks", 0) > 0 else 0.0
                })
            except Exception as e:
                overall_metrics["chunk_processing"]["error"] = str(e)
        
        # 임베딩 서비스 메트릭스
        if self.embedding_service:
            try:
                embedding_stats = self.embedding_service.get_embedding_statistics()
                overall_metrics["embedding_processing"].update({
                    "total_embeddings": embedding_stats.get("total_embeddings", 0),
                    "created_embeddings": embedding_stats.get("total_embeddings", 0),
                    "processing_rate_percent": 100.0 if embedding_stats.get("total_embeddings", 0) > 0 else 0.0
                })
            except Exception as e:
                overall_metrics["embedding_processing"]["error"] = str(e)
        
        # 처리 상태 서비스 메트릭스
        if self.processing_status_service:
            try:
                processing_stats = self.processing_status_service.get_processing_statistics()
                
                total_processes = processing_stats.get("total_processes", 0)
                completed_processes = processing_stats.get("completed_count", 0)
                failed_processes = processing_stats.get("failed_count", 0)
                
                if total_processes > 0:
                    success_rate = (completed_processes / total_processes) * 100
                    error_rate = (failed_processes / total_processes) * 100
                else:
                    success_rate = 0.0
                    error_rate = 0.0
                
                overall_metrics["system_performance"].update({
                    "error_rate_percent": error_rate,
                    "success_rate_percent": success_rate,
                    "total_processes": total_processes
                })
            except Exception as e:
                overall_metrics["system_performance"]["error"] = str(e)
        
        return overall_metrics
    
    def _get_stage_metrics(self) -> List[Dict[str, Any]]:
        """단계별 처리 메트릭스"""
        stage_metrics = []
        
        if not self.processing_status_service:
            return stage_metrics
        
        try:
            # 각 처리 단계별 통계
            processing_stages = [
                "DOCUMENT_UPLOADED",
                "CHUNKING_PENDING",
                "CHUNKING_PROCESSING", 
                "CHUNKING_COMPLETED",
                "CHUNKING_FAILED",
                "EMBEDDING_PENDING",
                "EMBEDDING_PROCESSING",
                "EMBEDDING_COMPLETED", 
                "EMBEDDING_FAILED"
            ]
            
            for stage in processing_stages:
                try:
                    stage_statuses = self.processing_status_service.get_statuses_by_stage(stage)
                    
                    if stage_statuses:
                        # 평균 처리 시간 계산 (Mock 데이터)
                        avg_duration = self._calculate_average_stage_duration(stage)
                        
                        stage_info = {
                            "stage_name": stage,
                            "display_name": self._get_stage_display_name(stage),
                            "total_items": len(stage_statuses),
                            "completed_items": len([s for s in stage_statuses if "COMPLETED" in s.stage.name]),
                            "failed_items": len([s for s in stage_statuses if "FAILED" in s.stage.name]),
                            "pending_items": len([s for s in stage_statuses if "PENDING" in s.stage.name]),
                            "average_duration_ms": avg_duration,
                            "success_rate_percent": self._calculate_stage_success_rate(stage_statuses)
                        }
                        
                        stage_metrics.append(stage_info)
                except Exception as e:
                    # 개별 단계 오류는 로그만 남기고 계속 진행
                    continue
                    
        except Exception as e:
            stage_metrics.append({
                "stage_name": "ERROR",
                "display_name": "시스템 오류",
                "error_message": str(e),
                "total_items": 0,
                "completed_items": 0,
                "failed_items": 0
            })
        
        return stage_metrics
    
    def _get_real_time_metrics(self) -> Dict[str, Any]:
        """실시간 메트릭스"""
        real_time_metrics = {
            "current_processing": {
                "active_processes": 0,
                "pending_processes": 0,
                "processes_per_minute": 0.0
            },
            "queue_status": {
                "document_queue_size": 0,
                "chunk_queue_size": 0,
                "embedding_queue_size": 0,
                "estimated_completion_time_minutes": 0
            },
            "live_performance": {
                "current_cpu_usage": 0.0,
                "current_memory_usage": 0.0,
                "active_connections": 1,
                "response_time_ms": 0.0
            }
        }
        
        if self.processing_status_service:
            try:
                # 현재 진행 중인 프로세스
                active_statuses = self.processing_status_service.get_active_processes()
                pending_statuses = self.processing_status_service.get_pending_processes()
                
                real_time_metrics["current_processing"].update({
                    "active_processes": len(active_statuses) if active_statuses else 0,
                    "pending_processes": len(pending_statuses) if pending_statuses else 0
                })
                
                # 대기열 상태 (추정)
                if self.embedding_service:
                    pending_embeddings = self.embedding_service.get_pending_embeddings()
                    real_time_metrics["queue_status"]["embedding_queue_size"] = len(pending_embeddings)
                
            except Exception as e:
                real_time_metrics["current_processing"]["error"] = str(e)
        
        # 배치 처리 메트릭스
        if self.batch_processing_service:
            try:
                active_jobs = self.batch_processing_service.get_active_jobs()
                if active_jobs:
                    total_progress = sum(job.progress_percentage for job in active_jobs)
                    avg_progress = total_progress / len(active_jobs) if active_jobs else 0
                    
                    real_time_metrics["current_processing"]["batch_jobs_active"] = len(active_jobs)
                    real_time_metrics["current_processing"]["average_batch_progress"] = avg_progress
                    
            except Exception as e:
                real_time_metrics["current_processing"]["batch_error"] = str(e)
        
        return real_time_metrics
    
    def _get_performance_trends(self, time_range_hours: int) -> Dict[str, Any]:
        """성능 트렌드 분석"""
        trends = {
            "processing_volume_trend": {
                "hourly_counts": [],
                "trend_direction": "stable",  # up, down, stable
                "peak_hours": [],
                "low_hours": []
            },
            "error_rate_trend": {
                "hourly_error_rates": [],
                "trend_direction": "stable",
                "average_error_rate": 0.0
            },
            "response_time_trend": {
                "hourly_avg_times": [],
                "trend_direction": "stable",
                "peak_response_time": 0.0,
                "average_response_time": 0.0
            }
        }
        
        # Mock 트렌드 데이터 생성 (실제로는 시계열 데이터에서 계산)
        current_time = datetime.now()
        for i in range(time_range_hours):
            hour_time = current_time - timedelta(hours=i)
            
            # 시간대별 처리량 시뮬레이션
            hour_count = max(0, 50 - abs(12 - hour_time.hour) * 2)  # 낮에 많고 밤에 적음
            trends["processing_volume_trend"]["hourly_counts"].append({
                "hour": hour_time.strftime("%H:00"),
                "count": hour_count
            })
            
            # 시간대별 에러율
            error_rate = min(5.0, abs(hour_time.hour - 14) * 0.2)  # 오후 2시에 가장 낮음
            trends["error_rate_trend"]["hourly_error_rates"].append({
                "hour": hour_time.strftime("%H:00"),
                "error_rate": error_rate
            })
            
            # 시간대별 응답시간
            response_time = 800 + abs(hour_time.hour - 15) * 50  # 오후 3시에 가장 빠름
            trends["response_time_trend"]["hourly_avg_times"].append({
                "hour": hour_time.strftime("%H:00"),
                "avg_time_ms": response_time
            })
        
        return trends
    
    def _get_bottleneck_analysis(self) -> Dict[str, Any]:
        """병목 분석"""
        bottleneck_analysis = {
            "identified_bottlenecks": [],
            "stage_performance": {},
            "resource_constraints": [],
            "optimization_opportunities": []
        }
        
        # 단계별 성능 분석
        stage_metrics = self._get_stage_metrics()
        slowest_stages = sorted(stage_metrics, key=lambda x: x.get("average_duration_ms", 0), reverse=True)[:3]
        
        for stage in slowest_stages:
            if stage.get("average_duration_ms", 0) > 1000:  # 1초 이상인 경우 병목으로 간주
                bottleneck_analysis["identified_bottlenecks"].append({
                    "stage": stage["display_name"],
                    "avg_duration_ms": stage["average_duration_ms"],
                    "impact": "high" if stage["average_duration_ms"] > 3000 else "medium"
                })
        
        # 리소스 제약 분석
        if self.embedding_service:
            try:
                embedding_stats = self.embedding_service.get_embedding_statistics()
                if embedding_stats.get("total_embeddings", 0) > 5000:
                    bottleneck_analysis["resource_constraints"].append({
                        "type": "memory",
                        "description": "대량의 임베딩이 메모리에 저장됨",
                        "recommendation": "벡터 DB 도입 또는 배치 처리 최적화"
                    })
            except:
                pass
        
        # 최적화 기회
        bottleneck_analysis["optimization_opportunities"] = [
            {
                "area": "임베딩 처리",
                "opportunity": "배치 크기 최적화",
                "expected_improvement": "30-50% 성능 향상"
            },
            {
                "area": "메모리 사용",
                "opportunity": "벡터 압축 적용",
                "expected_improvement": "메모리 사용량 40% 감소"
            },
            {
                "area": "I/O 최적화",
                "opportunity": "비동기 처리 도입",
                "expected_improvement": "처리량 2배 증가"
            }
        ]
        
        return bottleneck_analysis
    
    def _get_error_analysis(self) -> Dict[str, Any]:
        """에러 분석"""
        error_analysis = {
            "error_distribution": {},
            "common_errors": [],
            "error_trends": {},
            "recovery_metrics": {}
        }
        
        if self.processing_status_service:
            try:
                # 실패한 임베딩들 분석
                if self.embedding_service:
                    failed_embeddings = self.embedding_service.get_failed_embeddings()
                    error_analysis["error_distribution"]["embedding_errors"] = len(failed_embeddings)
                
                # 공통 에러 패턴
                error_analysis["common_errors"] = [
                    {
                        "error_type": "임베딩 생성 실패",
                        "frequency": len(failed_embeddings) if 'failed_embeddings' in locals() else 0,
                        "common_cause": "빈 텍스트 또는 차원 불일치"
                    },
                    {
                        "error_type": "메모리 부족",
                        "frequency": 2,
                        "common_cause": "대량 데이터 처리 시 메모리 초과"
                    }
                ]
                
            except Exception as e:
                error_analysis["analysis_error"] = str(e)
        
        return error_analysis
    
    def _get_resource_utilization(self) -> Dict[str, Any]:
        """리소스 사용률"""
        return {
            "cpu_utilization": {
                "current_percent": 25.0,  # Mock 데이터
                "average_percent": 22.5,
                "peak_percent": 85.0
            },
            "memory_utilization": {
                "current_mb": 512,
                "available_mb": 2048,
                "peak_mb": 1024,
                "utilization_percent": 25.0
            },
            "storage_utilization": {
                "vector_data_mb": 125,
                "document_data_mb": 45,
                "temp_data_mb": 23,
                "total_used_mb": 193
            },
            "network_utilization": {
                "api_calls_per_minute": 15,
                "data_transferred_mb": 5.2,
                "average_latency_ms": 450
            }
        }
    
    def _get_performance_recommendations(self) -> List[Dict[str, str]]:
        """성능 개선 권장사항"""
        recommendations = []
        
        # 처리량 기반 권장사항
        overall_metrics = self._get_overall_metrics()
        embedding_count = overall_metrics["embedding_processing"]["total_embeddings"]
        
        if embedding_count > 1000:
            recommendations.append({
                "category": "scalability",
                "priority": "high",
                "recommendation": "벡터 DB 도입으로 대량 데이터 처리 최적화",
                "expected_benefit": "쿼리 성능 10배 향상"
            })
        
        if embedding_count > 100:
            recommendations.append({
                "category": "performance",
                "priority": "medium",
                "recommendation": "임베딩 배치 크기를 32에서 64로 증가",
                "expected_benefit": "처리 속도 30% 향상"
            })
        
        # 일반적인 권장사항
        recommendations.extend([
            {
                "category": "monitoring",
                "priority": "medium",
                "recommendation": "실시간 메트릭스 대시보드 구축",
                "expected_benefit": "문제 조기 발견 및 대응"
            },
            {
                "category": "caching",
                "priority": "low",
                "recommendation": "임베딩 결과 캐싱 구현",
                "expected_benefit": "중복 계산 제거로 30% 성능 향상"
            },
            {
                "category": "optimization",
                "priority": "low", 
                "recommendation": "비동기 처리 도입으로 병렬성 향상",
                "expected_benefit": "처리량 2-3배 증가"
            }
        ])
        
        return recommendations
    
    def _calculate_average_stage_duration(self, stage: str) -> float:
        """단계별 평균 처리 시간 계산 (Mock)"""
        stage_durations = {
            "DOCUMENT_UPLOADED": 50,
            "CHUNKING_PENDING": 10,
            "CHUNKING_PROCESSING": 500,
            "CHUNKING_COMPLETED": 25,
            "EMBEDDING_PENDING": 20,
            "EMBEDDING_PROCESSING": 1200,
            "EMBEDDING_COMPLETED": 30,
        }
        return stage_durations.get(stage, 100)
    
    def _get_stage_display_name(self, stage: str) -> str:
        """단계명을 표시용으로 변환"""
        display_names = {
            "DOCUMENT_UPLOADED": "문서 업로드",
            "CHUNKING_PENDING": "청킹 대기",
            "CHUNKING_PROCESSING": "청킹 처리중",
            "CHUNKING_COMPLETED": "청킹 완료",
            "CHUNKING_FAILED": "청킹 실패",
            "EMBEDDING_PENDING": "임베딩 대기",
            "EMBEDDING_PROCESSING": "임베딩 처리중", 
            "EMBEDDING_COMPLETED": "임베딩 완료",
            "EMBEDDING_FAILED": "임베딩 실패"
        }
        return display_names.get(stage, stage)
    
    def _calculate_stage_success_rate(self, stage_statuses: List) -> float:
        """단계별 성공률 계산"""
        if not stage_statuses:
            return 0.0
        
        completed = len([s for s in stage_statuses if "COMPLETED" in s.stage.name])
        total = len(stage_statuses)
        
        return (completed / total) * 100 if total > 0 else 0.0
    
    def get_quick_metrics(self) -> Dict[str, Any]:
        """빠른 메트릭스 조회"""
        try:
            overall = self._get_overall_metrics()
            return {
                "total_processed": overall["embedding_processing"]["total_embeddings"],
                "error_rate": overall["system_performance"]["error_rate_percent"],
                "status": "healthy" if overall["system_performance"]["error_rate_percent"] < 5 else "warning"
            }
        except:
            return {"status": "unknown", "total_processed": 0, "error_rate": 0}
