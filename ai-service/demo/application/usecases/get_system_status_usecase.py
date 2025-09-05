"""
Get System Status Use Case - Demo Application Layer
시스템 상태 조회 유스케이스

전체 시스템의 실시간 상태 정보를 제공합니다.
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime
import psutil
import os


@dataclass
class SystemHealth:
    """시스템 건강 상태"""
    status: str  # healthy, warning, critical
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    uptime_seconds: float


@dataclass
class ServiceStatus:
    """서비스 상태"""
    name: str
    status: str  # active, inactive, error
    last_activity: datetime
    error_message: Optional[str] = None


class GetSystemStatusUseCase:
    """시스템 상태 조회 유스케이스"""
    
    def __init__(
        self,
        embedding_service=None,
        chunking_service=None,
        processing_status_service=None,
        validation_service=None
    ):
        self.embedding_service = embedding_service
        self.chunking_service = chunking_service
        self.processing_status_service = processing_status_service
        self.validation_service = validation_service
        self.start_time = datetime.now()
    
    def execute(self) -> Dict[str, Any]:
        """시스템 상태 조회 실행"""
        return {
            "system_health": self._get_system_health(),
            "service_statuses": self._get_service_statuses(),
            "resource_usage": self._get_resource_usage(),
            "error_summary": self._get_error_summary(),
            "uptime_info": self._get_uptime_info(),
            "last_updated": datetime.now().isoformat()
        }
    
    def _get_system_health(self) -> Dict[str, Any]:
        """시스템 건강 상태 조회"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # 건강 상태 판단
            health_status = "healthy"
            if cpu_percent > 80 or memory.percent > 85 or disk.percent > 90:
                health_status = "warning"
            if cpu_percent > 95 or memory.percent > 95 or disk.percent > 95:
                health_status = "critical"
            
            uptime = (datetime.now() - self.start_time).total_seconds()
            
            health = SystemHealth(
                status=health_status,
                cpu_usage=cpu_percent,
                memory_usage=memory.percent,
                disk_usage=disk.percent,
                uptime_seconds=uptime
            )
            
            return {
                "status": health.status,
                "cpu_usage_percent": round(health.cpu_usage, 2),
                "memory_usage_percent": round(health.memory_usage, 2),
                "disk_usage_percent": round(health.disk_usage, 2),
                "uptime_seconds": health.uptime_seconds,
                "uptime_formatted": self._format_uptime(uptime)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "cpu_usage_percent": 0,
                "memory_usage_percent": 0,
                "disk_usage_percent": 0,
                "uptime_seconds": 0
            }
    
    def _get_service_statuses(self) -> List[Dict[str, Any]]:
        """서비스 상태 조회"""
        services = []
        
        # 임베딩 서비스 상태
        if self.embedding_service:
            try:
                stats = self.embedding_service.get_embedding_statistics()
                services.append({
                    "name": "Embedding Service",
                    "status": "active",
                    "last_activity": datetime.now(),
                    "details": {
                        "total_embeddings": stats.get("total_embeddings", 0),
                        "model_name": stats.get("model_name", "Unknown")
                    }
                })
            except Exception as e:
                services.append({
                    "name": "Embedding Service",
                    "status": "error",
                    "last_activity": datetime.now(),
                    "error_message": str(e)
                })
        
        # 청킹 서비스 상태
        if self.chunking_service:
            try:
                stats = self.chunking_service.get_chunking_statistics()
                services.append({
                    "name": "Chunking Service",
                    "status": "active",
                    "last_activity": datetime.now(),
                    "details": {
                        "total_chunks": stats.get("total_chunks", 0),
                        "strategies_available": len(stats.get("available_strategies", []))
                    }
                })
            except Exception as e:
                services.append({
                    "name": "Chunking Service", 
                    "status": "error",
                    "last_activity": datetime.now(),
                    "error_message": str(e)
                })
        
        # 처리 상태 서비스
        if self.processing_status_service:
            try:
                stats = self.processing_status_service.get_processing_statistics()
                services.append({
                    "name": "Processing Status Service",
                    "status": "active", 
                    "last_activity": datetime.now(),
                    "details": {
                        "total_processes": stats.get("total_processes", 0),
                        "completed_processes": stats.get("completed_count", 0),
                        "failed_processes": stats.get("failed_count", 0)
                    }
                })
            except Exception as e:
                services.append({
                    "name": "Processing Status Service",
                    "status": "error",
                    "last_activity": datetime.now(),
                    "error_message": str(e)
                })
        
        # 검증 서비스
        if self.validation_service:
            try:
                # 간단한 상태 확인
                services.append({
                    "name": "Validation Service",
                    "status": "active",
                    "last_activity": datetime.now(),
                    "details": {
                        "service_type": "Data Validation",
                        "validation_rules": "Active"
                    }
                })
            except Exception as e:
                services.append({
                    "name": "Validation Service",
                    "status": "error", 
                    "last_activity": datetime.now(),
                    "error_message": str(e)
                })
        
        return services
    
    def _get_resource_usage(self) -> Dict[str, Any]:
        """리소스 사용량 상세 정보"""
        try:
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "memory": {
                    "total_gb": round(memory.total / (1024**3), 2),
                    "available_gb": round(memory.available / (1024**3), 2),
                    "used_gb": round(memory.used / (1024**3), 2),
                    "percent": round(memory.percent, 2)
                },
                "disk": {
                    "total_gb": round(disk.total / (1024**3), 2),
                    "free_gb": round(disk.free / (1024**3), 2),
                    "used_gb": round(disk.used / (1024**3), 2),
                    "percent": round(disk.percent, 2)
                },
                "cpu": {
                    "count": psutil.cpu_count(),
                    "percent": round(psutil.cpu_percent(interval=1), 2)
                }
            }
        except Exception as e:
            return {
                "error": str(e),
                "memory": {"total_gb": 0, "available_gb": 0, "used_gb": 0, "percent": 0},
                "disk": {"total_gb": 0, "free_gb": 0, "used_gb": 0, "percent": 0},
                "cpu": {"count": 0, "percent": 0}
            }
    
    def _get_error_summary(self) -> Dict[str, Any]:
        """에러 요약 정보"""
        error_summary = {
            "recent_errors": [],
            "error_counts": {
                "embedding_errors": 0,
                "chunking_errors": 0,
                "validation_errors": 0,
                "system_errors": 0
            },
            "critical_issues": []
        }
        
        # 처리 상태 서비스에서 실패한 작업들 조회
        if self.processing_status_service:
            try:
                failed_embeddings = self.embedding_service.get_failed_embeddings() if self.embedding_service else []
                error_summary["error_counts"]["embedding_errors"] = len(failed_embeddings)
                
                if failed_embeddings:
                    error_summary["recent_errors"].extend([
                        f"임베딩 실패: 청크 {chunk_id}" for chunk_id in failed_embeddings[:5]
                    ])
                
            except Exception as e:
                error_summary["recent_errors"].append(f"상태 조회 중 오류: {str(e)}")
        
        # 리소스 임계치 확인
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory_percent = psutil.virtual_memory().percent
            
            if cpu_percent > 90:
                error_summary["critical_issues"].append(f"CPU 사용률 높음: {cpu_percent:.1f}%")
            if memory_percent > 90:
                error_summary["critical_issues"].append(f"메모리 사용률 높음: {memory_percent:.1f}%")
                
        except Exception:
            pass
        
        return error_summary
    
    def _get_uptime_info(self) -> Dict[str, Any]:
        """가동 시간 정보"""
        uptime_seconds = (datetime.now() - self.start_time).total_seconds()
        
        return {
            "start_time": self.start_time.isoformat(),
            "current_time": datetime.now().isoformat(),
            "uptime_seconds": uptime_seconds,
            "uptime_formatted": self._format_uptime(uptime_seconds),
            "restart_required": False  # 향후 확장 가능
        }
    
    def _format_uptime(self, seconds: float) -> str:
        """가동 시간을 읽기 쉬운 형태로 포맷"""
        if seconds < 60:
            return f"{int(seconds)}초"
        elif seconds < 3600:
            return f"{int(seconds // 60)}분 {int(seconds % 60)}초"
        elif seconds < 86400:
            hours = int(seconds // 3600)
            minutes = int((seconds % 3600) // 60)
            return f"{hours}시간 {minutes}분"
        else:
            days = int(seconds // 86400)
            hours = int((seconds % 86400) // 3600)
            return f"{days}일 {hours}시간"
    
    def get_quick_status(self) -> str:
        """빠른 상태 확인"""
        try:
            health = self._get_system_health()
            return health["status"]
        except Exception:
            return "unknown"