"""
Common Error Handler - Infrastructure Layer
시스템 공통 에러 처리 시스템

모든 인프라시스템(Gradio, REST API, GraphQL 등)에서 공통으로 사용하는 에러 처리 시스템입니다.
ENUM 기반으로 에러 패턴, 코드, 타입을 체계적으로 관리합니다.
"""

import logging
import traceback
from typing import Any, Dict, Optional, Union
from datetime import datetime
from abc import ABC, abstractmethod
import gradio as gr
from .error_enums import (
    ErrorPattern, ErrorCode, ErrorType, InterfaceType, ErrorSeverity, ErrorCategory,
    ERROR_PATTERN_MESSAGES, INTERFACE_DEFAULT_MESSAGES, ERROR_CODE_TYPE_MAPPING,
    get_error_pattern_from_message, get_user_friendly_message, 
    get_error_code_from_pattern, get_error_type_from_code
)

logger = logging.getLogger(__name__)


class ErrorContext:
    """에러 컨텍스트 정보"""
    def __init__(self, 
                 user_id: Optional[str] = None,
                 session_id: Optional[str] = None,
                 request_id: Optional[str] = None,
                 interface_type: InterfaceType = InterfaceType.GRADIO,
                 severity: ErrorSeverity = ErrorSeverity.MEDIUM,
                 category: ErrorCategory = ErrorCategory.SYSTEM_RESOURCE):
        self.user_id = user_id
        self.session_id = session_id
        self.request_id = request_id
        self.interface_type = interface_type
        self.severity = severity
        self.category = category
        self.timestamp = datetime.now().isoformat()


class ErrorResponse:
    """에러 응답 표준 형식"""
    def __init__(self, 
                 error_message: str,
                 error_code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
                 error_type: ErrorType = ErrorType.SYSTEM,
                 error_pattern: Optional[ErrorPattern] = None,
                 severity: ErrorSeverity = ErrorSeverity.MEDIUM,
                 category: ErrorCategory = ErrorCategory.SYSTEM_RESOURCE,
                 details: Optional[Dict[str, Any]] = None,
                 context: Optional[ErrorContext] = None):
        self.error_message = error_message
        self.error_code = error_code
        self.error_type = error_type
        self.error_pattern = error_pattern
        self.severity = severity
        self.category = category
        self.details = details or {}
        self.context = context
        self.timestamp = datetime.now().isoformat()


class ErrorHandlerInterface(ABC):
    """에러 처리 인터페이스"""
    
    @abstractmethod
    def handle_error(self, 
                    exception: Exception, 
                    context: Optional[ErrorContext] = None) -> ErrorResponse:
        """에러를 처리하고 표준 응답을 반환"""
        pass
    
    @abstractmethod
    def convert_to_user_friendly_message(self, 
                                       error_message: str, 
                                       interface_type: str = "unknown") -> str:
        """기술적 에러 메시지를 사용자 친화적으로 변환"""
        pass


class CommonErrorHandler(ErrorHandlerInterface):
    """시스템 공통 에러 처리기 - ENUM 기반"""
    
    def __init__(self):
        # ENUM 기반으로 에러 패턴과 메시지를 관리
        pass
    
    def handle_error(self, 
                    exception: Exception, 
                    context: Optional[ErrorContext] = None) -> ErrorResponse:
        """에러를 처리하고 표준 응답을 반환 - ENUM 기반"""
        
        # 에러 메시지에서 패턴 추출
        error_pattern = get_error_pattern_from_message(str(exception))
        
        # 에러 코드와 타입 결정
        error_code = get_error_code_from_pattern(error_pattern)
        error_type = get_error_type_from_code(error_code)
        
        # 사용자 친화적 메시지 생성
        interface_type = context.interface_type if context else InterfaceType.GRADIO
        user_message = get_user_friendly_message(error_pattern, interface_type)
        
        # 에러 심각도 결정
        severity = self._determine_severity(exception, error_pattern)
        
        # 에러 카테고리 결정
        category = self._determine_category(exception, error_pattern)
        
        return ErrorResponse(
            error_message=user_message,
            error_code=error_code,
            error_type=error_type,
            error_pattern=error_pattern,
            severity=severity,
            category=category,
            details={
                "original_error": str(exception),
                "exception_type": type(exception).__name__,
                "traceback": traceback.format_exc()
            },
            context=context
        )
    
    def convert_to_user_friendly_message(self, 
                                       error_message: str, 
                                       interface_type: InterfaceType = InterfaceType.GRADIO) -> str:
        """기술적 에러 메시지를 사용자 친화적으로 변환 - ENUM 기반"""
        
        # 에러 패턴 추출
        error_pattern = get_error_pattern_from_message(error_message)
        
        # 사용자 친화적 메시지 반환
        return get_user_friendly_message(error_pattern, interface_type)
    
    def _determine_severity(self, exception: Exception, error_pattern: ErrorPattern) -> ErrorSeverity:
        """에러 심각도 결정"""
        # 예외 타입별 심각도 매핑
        severity_mapping = {
            ValueError: ErrorSeverity.LOW,
            FileNotFoundError: ErrorSeverity.MEDIUM,
            PermissionError: ErrorSeverity.HIGH,
            TimeoutError: ErrorSeverity.MEDIUM,
            ConnectionError: ErrorSeverity.HIGH,
            Exception: ErrorSeverity.MEDIUM
        }
        
        return severity_mapping.get(type(exception), ErrorSeverity.MEDIUM)
    
    def _determine_category(self, exception: Exception, error_pattern: ErrorPattern) -> ErrorCategory:
        """에러 카테고리 결정"""
        # 에러 패턴별 카테고리 매핑
        category_mapping = {
            ErrorPattern.VALIDATION: ErrorCategory.USER_INPUT,
            ErrorPattern.DOCUMENT_ID: ErrorCategory.USER_INPUT,
            ErrorPattern.NOT_FOUND: ErrorCategory.SYSTEM_RESOURCE,
            ErrorPattern.PERMISSION: ErrorCategory.SECURITY,
            ErrorPattern.AUTHENTICATION: ErrorCategory.SECURITY,
            ErrorPattern.AUTHORIZATION: ErrorCategory.SECURITY,
            ErrorPattern.SERVICE: ErrorCategory.EXTERNAL_DEPENDENCY,
            ErrorPattern.NETWORK: ErrorCategory.EXTERNAL_DEPENDENCY,
            ErrorPattern.TIMEOUT: ErrorCategory.PERFORMANCE,
            ErrorPattern.RATE_LIMIT: ErrorCategory.BUSINESS_LOGIC,
            ErrorPattern.CONFIGURATION: ErrorCategory.SYSTEM_RESOURCE,
            ErrorPattern.DUPLICATE: ErrorCategory.DATA_INTEGRITY,
            ErrorPattern.INVALID_FORMAT: ErrorCategory.USER_INPUT,
            ErrorPattern.RESOURCE_EXHAUSTED: ErrorCategory.SYSTEM_RESOURCE,
            ErrorPattern.DEPENDENCY_UNAVAILABLE: ErrorCategory.EXTERNAL_DEPENDENCY
        }
        
        return category_mapping.get(error_pattern, ErrorCategory.SYSTEM_RESOURCE)
    
    def _handle_validation_error(self, 
                              exception: ValueError, 
                              context: Optional[ErrorContext]) -> ErrorResponse:
        """검증 에러 처리"""
        user_message = self.convert_to_user_friendly_message(
            str(exception), 
            context.interface_type if context else "unknown"
        )
        
        return ErrorResponse(
            error_message=user_message,
            error_code="VALIDATION_ERROR",
            error_type="validation",
            details={"original_error": str(exception)},
            context=context
        )
    
    def _handle_not_found_error(self, 
                              exception: FileNotFoundError, 
                              context: Optional[ErrorContext]) -> ErrorResponse:
        """리소스 없음 에러 처리"""
        user_message = self.convert_to_user_friendly_message(
            str(exception), 
            context.interface_type if context else "unknown"
        )
        
        return ErrorResponse(
            error_message=user_message,
            error_code="NOT_FOUND_ERROR",
            error_type="resource",
            details={"original_error": str(exception)},
            context=context
        )
    
    def _handle_permission_error(self, 
                               exception: PermissionError, 
                               context: Optional[ErrorContext]) -> ErrorResponse:
        """권한 에러 처리"""
        user_message = self.convert_to_user_friendly_message(
            str(exception), 
            context.interface_type if context else "unknown"
        )
        
        return ErrorResponse(
            error_message=user_message,
            error_code="PERMISSION_ERROR",
            error_type="permission",
            details={"original_error": str(exception)},
            context=context
        )
    
    def _handle_timeout_error(self, 
                            exception: TimeoutError, 
                            context: Optional[ErrorContext]) -> ErrorResponse:
        """타임아웃 에러 처리"""
        user_message = self.convert_to_user_friendly_message(
            str(exception), 
            context.interface_type if context else "unknown"
        )
        
        return ErrorResponse(
            error_message=user_message,
            error_code="TIMEOUT_ERROR",
            error_type="timeout",
            details={"original_error": str(exception)},
            context=context
        )
    
    def _handle_network_error(self, 
                            exception: ConnectionError, 
                            context: Optional[ErrorContext]) -> ErrorResponse:
        """네트워크 에러 처리"""
        user_message = self.convert_to_user_friendly_message(
            str(exception), 
            context.interface_type if context else "unknown"
        )
        
        return ErrorResponse(
            error_message=user_message,
            error_code="NETWORK_ERROR",
            error_type="network",
            details={"original_error": str(exception)},
            context=context
        )
    
    def _handle_generic_error(self, 
                             exception: Exception, 
                             context: Optional[ErrorContext]) -> ErrorResponse:
        """일반 에러 처리"""
        user_message = self.convert_to_user_friendly_message(
            str(exception), 
            context.interface_type if context else "unknown"
        )
        
        return ErrorResponse(
            error_message=user_message,
            error_code="UNEXPECTED_ERROR",
            error_type="system",
            details={
                "original_error": str(exception),
                "exception_type": type(exception).__name__,
                "traceback": traceback.format_exc()
            },
            context=context
        )


# 싱글톤 인스턴스
common_error_handler = CommonErrorHandler()


def _create_error_response_by_type(return_type, error_message: str, interface_type: InterfaceType):
    """반환 타입에 따라 적절한 에러 응답 생성"""
    if interface_type == InterfaceType.GRADIO:
        from infrastructure.inbound.ui.gradio.components.common.gradio_common_components import GradioCommonComponents
        import gradio as gr
        
        error_html = GradioCommonComponents.create_error_message(error_message)
        
        # 반환 타입에 따라 다른 에러 응답 생성
        if hasattr(return_type, '__origin__'):
            # Generic 타입 (예: Tuple[str, str, Any])
            if return_type.__origin__ is tuple:
                if len(return_type.__args__) == 3:
                    # Tuple[str, str, Any] 형식
                    return error_html, "", gr.update(choices=[], value=None)
                elif len(return_type.__args__) == 2:
                    # Tuple[str, Any] 형식
                    return error_html, gr.update(choices=[], value=None)
                else:
                    # 기타 튜플 형식
                    return (error_html,) * len(return_type.__args__)
            else:
                # 기타 Generic 타입
                return error_html
        elif return_type == str:
            # 단일 문자열 반환
            return error_html
        elif return_type == type(None) or return_type is None:
            # None 반환
            return None
        else:
            # 기타 타입 (Any, gr.update 등)
            return gr.update(choices=[], value=None)
    
    elif interface_type == InterfaceType.REST:
        # REST API용 JSON 에러 응답
        return {
            "success": False,
            "error": error_message,
            "error_code": "INFRASTRUCTURE_ERROR",
            "error_type": "infrastructure"
        }
    
    else:
        # 기본 에러 응답
        return {"error": error_message}


def handle_infrastructure_error(interface_type: InterfaceType = InterfaceType.GRADIO):
    """스마트 인프라시스템별 에러 처리 데코레이터 - 반환 타입 자동 감지"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                # 에러 컨텍스트 생성
                context = ErrorContext(interface_type=interface_type)
                
                # 공통 에러 처리
                error_response = common_error_handler.handle_error(e, context)
                
                # 에러 로깅
                logger.error(f"🚨 {interface_type.value.upper()} 에러 처리: {error_response.error_message}")
                logger.error(f"   원본 에러: {e}")
                logger.error(f"   에러 패턴: {error_response.error_pattern.value if error_response.error_pattern else 'None'}")
                logger.error(f"   에러 코드: {error_response.error_code.value}")
                logger.error(f"   에러 타입: {error_response.error_type.value}")
                logger.error(f"   심각도: {error_response.severity.value}")
                logger.error(f"   카테고리: {error_response.category.value}")
                
                # 반환 타입을 동적으로 감지하고 적절한 에러 응답 생성
                return_type = func.__annotations__.get('return', type(None))
                return _create_error_response_by_type(return_type, error_response.error_message, interface_type)
        
        return wrapper
    return decorator


def _format_error_for_interface(error_response: ErrorResponse, interface_type: InterfaceType):
    """인터페이스별 에러 응답 형식 변환 - ENUM 기반"""
    
    if interface_type == InterfaceType.GRADIO:
        # Gradio용 에러 응답 - 직접 반환
        from infrastructure.inbound.ui.gradio.components.common.gradio_common_components import GradioCommonComponents
        import gradio as gr
        
        error_html = GradioCommonComponents.create_error_message(error_response.error_message)
        
        # Gradio 형식으로 직접 반환 (UI Response 객체 없이)
        return error_html, "", gr.update(choices=[], value=None)
    
    elif interface_type == InterfaceType.REST:
        # REST API용 JSON 에러 응답
        return {
            "success": False,
            "error": error_response.error_message,
            "error_code": error_response.error_code.value,
            "error_type": error_response.error_type.value,
            "error_pattern": error_response.error_pattern.value if error_response.error_pattern else None,
            "severity": error_response.severity.value,
            "category": error_response.category.value,
            "timestamp": error_response.timestamp,
            "details": error_response.details
        }
    
    elif interface_type == InterfaceType.GRAPHQL:
        # GraphQL용 에러 응답
        return {
            "errors": [{
                "message": error_response.error_message,
                "extensions": {
                    "code": error_response.error_code.value,
                    "type": error_response.error_type.value,
                    "pattern": error_response.error_pattern.value if error_response.error_pattern else None,
                    "severity": error_response.severity.value,
                    "category": error_response.category.value,
                    "details": error_response.details
                }
            }]
        }
    
    elif interface_type == InterfaceType.WEBSOCKET:
        # WebSocket용 에러 응답
        return {
            "type": "error",
            "message": error_response.error_message,
            "code": error_response.error_code.value,
            "severity": error_response.severity.value
        }
    
    else:
        # 기본 에러 응답
        return {
            "error": error_response.error_message,
            "code": error_response.error_code.value,
            "type": error_response.error_type.value,
            "severity": error_response.severity.value
        }
