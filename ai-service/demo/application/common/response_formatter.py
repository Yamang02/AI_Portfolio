"""
Response Formatter - Demo Application Layer
응답 형식 관리

UseCase에서 일관된 응답 형식을 제공합니다.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass


@dataclass
class UseCaseResponse:
    """UseCase 응답 기본 구조"""
    success: bool
    message: str
    timestamp: str
    data: Optional[Any] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
    error_type: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class ResponseFormatter:
    """일관된 응답 형식 제공"""
    
    @staticmethod
    def success(
        data: Any = None, 
        message: str = "성공적으로 처리되었습니다.",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """성공 응답 형식"""
        response = {
            "success": True,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        if data is not None:
            response["data"] = data
            
        if metadata:
            response["metadata"] = metadata
            
        return response
    
    @staticmethod
    def error(
        error_message: str,
        error_code: str = "ERROR",
        error_type: str = "system",
        details: Optional[Dict[str, Any]] = None,
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """오류 응답 형식"""
        response = {
            "success": False,
            "error": error_message,
            "error_code": error_code,
            "error_type": error_type,
            "timestamp": datetime.now().isoformat()
        }
        
        if details:
            response["details"] = details
            
        if suggestions:
            response["suggestions"] = suggestions
            
        return response
    
    @staticmethod
    def validation_error(
        field: str, 
        message: str, 
        value: Any = None,
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """검증 오류 응답 형식"""
        suggestions = suggestions or [
            f"'{field}' 필드의 값을 확인해주세요.",
            "입력 형식이 올바른지 확인해주세요."
        ]
        
        return ResponseFormatter.error(
            f"'{field}' 필드 검증 실패: {message}",
            "VALIDATION_ERROR",
            "validation",
            {"field": field, "value": value},
            suggestions
        )
    
    @staticmethod
    def service_error(
        service_name: str, 
        message: str,
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """서비스 오류 응답 형식"""
        suggestions = suggestions or [
            f"{service_name} 서비스 상태를 확인해주세요.",
            "잠시 후 다시 시도해주세요."
        ]
        
        return ResponseFormatter.error(
            f"{service_name} 서비스 오류: {message}",
            "SERVICE_ERROR",
            "service",
            {"service_name": service_name},
            suggestions
        )
    
    @staticmethod
    def configuration_error(
        config_key: str, 
        message: str,
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """설정 오류 응답 형식"""
        suggestions = suggestions or [
            f"'{config_key}' 설정을 확인해주세요.",
            "설정 파일의 형식이 올바른지 확인해주세요."
        ]
        
        return ResponseFormatter.error(
            f"설정 오류 ({config_key}): {message}",
            "CONFIGURATION_ERROR",
            "configuration",
            {"config_key": config_key},
            suggestions
        )
    
    @staticmethod
    def not_found_error(
        resource_type: str,
        resource_id: str,
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """리소스 없음 오류 응답 형식"""
        suggestions = suggestions or [
            f"{resource_type} ID '{resource_id}'가 존재하는지 확인해주세요.",
            "리소스 목록을 다시 확인해주세요."
        ]
        
        return ResponseFormatter.error(
            f"{resource_type} '{resource_id}'를 찾을 수 없습니다.",
            "NOT_FOUND_ERROR",
            "resource",
            {"resource_type": resource_type, "resource_id": resource_id},
            suggestions
        )
    
    @staticmethod
    def permission_error(
        action: str,
        resource: str,
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """권한 오류 응답 형식"""
        suggestions = suggestions or [
            f"{resource}에 대한 {action} 권한이 있는지 확인해주세요.",
            "관리자에게 문의해주세요."
        ]
        
        return ResponseFormatter.error(
            f"{resource}에 대한 {action} 권한이 없습니다.",
            "PERMISSION_ERROR",
            "permission",
            {"action": action, "resource": resource},
            suggestions
        )
    
    @staticmethod
    def rate_limit_error(
        limit_type: str,
        limit_value: str,
        suggestions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """속도 제한 오류 응답 형식"""
        suggestions = suggestions or [
            f"{limit_type} 제한({limit_value})을 확인해주세요.",
            "잠시 후 다시 시도해주세요."
        ]
        
        return ResponseFormatter.error(
            f"{limit_type} 제한에 도달했습니다 ({limit_value})",
            "RATE_LIMIT_ERROR",
            "rate_limit",
            {"limit_type": limit_type, "limit_value": limit_value},
            suggestions
        )
    
    @staticmethod
    def paginated_response(
        data: List[Any],
        page: int,
        page_size: int,
        total_count: int,
        message: str = "데이터를 성공적으로 조회했습니다."
    ) -> Dict[str, Any]:
        """페이지네이션 응답 형식"""
        total_pages = (total_count + page_size - 1) // page_size
        
        return ResponseFormatter.success(
            data=data,
            message=message,
            metadata={
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_previous": page > 1
                }
            }
        )
    
    @staticmethod
    def list_response(
        data: List[Any],
        count: int,
        message: str = "목록을 성공적으로 조회했습니다."
    ) -> Dict[str, Any]:
        """목록 응답 형식"""
        return ResponseFormatter.success(
            data=data,
            message=message,
            metadata={
                "count": count,
                "total": len(data)
            }
        )
    
    @staticmethod
    def statistics_response(
        data: Dict[str, Any],
        message: str = "통계를 성공적으로 조회했습니다."
    ) -> Dict[str, Any]:
        """통계 응답 형식"""
        return ResponseFormatter.success(
            data=data,
            message=message,
            metadata={
                "generated_at": datetime.now().isoformat(),
                "data_type": "statistics"
            }
        )
    
    @staticmethod
    def health_check_response(
        status: str,
        services: Dict[str, str],
        message: str = "시스템 상태를 확인했습니다."
    ) -> Dict[str, Any]:
        """헬스체크 응답 형식"""
        return ResponseFormatter.success(
            data={
                "status": status,
                "services": services,
                "checked_at": datetime.now().isoformat()
            },
            message=message,
            metadata={
                "data_type": "health_check"
            }
        )


class ErrorCode:
    """오류 코드 상수"""
    
    # 일반 오류
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    TIMEOUT_ERROR = "TIMEOUT_ERROR"
    
    # 검증 오류
    VALIDATION_ERROR = "VALIDATION_ERROR"
    REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING"
    INVALID_FORMAT = "INVALID_FORMAT"
    INVALID_VALUE = "INVALID_VALUE"
    
    # 서비스 오류
    SERVICE_ERROR = "SERVICE_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    SERVICE_TIMEOUT = "SERVICE_TIMEOUT"
    
    # 설정 오류
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
    CONFIG_NOT_FOUND = "CONFIG_NOT_FOUND"
    CONFIG_INVALID = "CONFIG_INVALID"
    
    # 리소스 오류
    NOT_FOUND_ERROR = "NOT_FOUND_ERROR"
    ALREADY_EXISTS_ERROR = "ALREADY_EXISTS_ERROR"
    PERMISSION_ERROR = "PERMISSION_ERROR"
    
    # 비즈니스 로직 오류
    BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR"
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
    
    # 외부 API 오류
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR"
    API_KEY_INVALID = "API_KEY_INVALID"
    API_RATE_LIMIT = "API_RATE_LIMIT"


class ErrorType:
    """오류 타입 상수"""
    
    SYSTEM = "system"
    VALIDATION = "validation"
    SERVICE = "service"
    CONFIGURATION = "configuration"
    RESOURCE = "resource"
    PERMISSION = "permission"
    BUSINESS = "business"
    EXTERNAL = "external"
    NETWORK = "network"
