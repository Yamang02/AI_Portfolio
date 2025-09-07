"""
Common Error Handler - Demo Application Layer
공통 오류 처리 데코레이터

UseCase 레벨에서 일관된 오류 처리를 제공합니다.
"""

import logging
import traceback
from typing import Dict, Any, Callable, TypeVar, Union
from functools import wraps
from datetime import datetime

logger = logging.getLogger(__name__)

T = TypeVar('T')


class UseCaseError(Exception):
    """UseCase 레벨 오류"""
    def __init__(self, message: str, error_code: str = "USECASE_ERROR", details: Dict[str, Any] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(UseCaseError):
    """검증 오류"""
    def __init__(self, message: str, field: str = None, value: Any = None):
        super().__init__(message, "VALIDATION_ERROR", {"field": field, "value": value})


class ServiceError(UseCaseError):
    """서비스 레벨 오류"""
    def __init__(self, message: str, service_name: str = None):
        super().__init__(message, "SERVICE_ERROR", {"service_name": service_name})


class ConfigurationError(UseCaseError):
    """설정 오류"""
    def __init__(self, message: str, config_key: str = None):
        super().__init__(message, "CONFIGURATION_ERROR", {"config_key": config_key})


def handle_usecase_errors(
    default_error_message: str = "처리 중 오류가 발생했습니다.",
    log_error: bool = True,
    include_traceback: bool = False,
    return_dto: bool = True
):
    """
    UseCase 오류 처리 데코레이터
    
    Args:
        default_error_message: 기본 오류 메시지
        log_error: 오류 로깅 여부
        include_traceback: 스택 트레이스 포함 여부
        return_dto: DTO 형태로 반환할지 여부
    """
    def decorator(func: Callable[..., Union[Dict[str, Any], T]]) -> Callable[..., Union[Dict[str, Any], T]]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Union[Dict[str, Any], T]:
            try:
                return func(*args, **kwargs)
                
            except ValidationError as e:
                if return_dto:
                    from application.dto.document_dtos import ErrorDto
                    error_response = ErrorDto(
                        success=False,
                        error=e.message,
                        error_code=e.error_code,
                        error_type="validation",
                        details=e.details,
                        timestamp=datetime.now().isoformat()
                    )
                else:
                    error_response = {
                        "success": False,
                        "error": e.message,
                        "error_code": e.error_code,
                        "error_type": "validation",
                        "details": e.details,
                        "timestamp": datetime.now().isoformat()
                    }
                
                if log_error:
                    logger.warning(f"검증 오류: {e.message} - {e.details}")
                
                return error_response
                
            except ServiceError as e:
                if return_dto:
                    from application.dto.document_dtos import ErrorDto
                    error_response = ErrorDto(
                        success=False,
                        error=e.message,
                        error_code=e.error_code,
                        error_type="service",
                        details=e.details,
                        timestamp=datetime.now().isoformat()
                    )
                else:
                    error_response = {
                        "success": False,
                        "error": e.message,
                        "error_code": e.error_code,
                        "error_type": "service",
                        "details": e.details,
                        "timestamp": datetime.now().isoformat()
                    }
                
                if log_error:
                    logger.error(f"서비스 오류: {e.message} - {e.details}")
                
                return error_response
                
            except ConfigurationError as e:
                if return_dto:
                    from application.dto.document_dtos import ErrorDto
                    error_response = ErrorDto(
                        success=False,
                        error=e.message,
                        error_code=e.error_code,
                        error_type="configuration",
                        details=e.details,
                        timestamp=datetime.now().isoformat()
                    )
                else:
                    error_response = {
                        "success": False,
                        "error": e.message,
                        "error_code": e.error_code,
                        "error_type": "configuration",
                        "details": e.details,
                        "timestamp": datetime.now().isoformat()
                    }
                
                if log_error:
                    logger.error(f"설정 오류: {e.message} - {e.details}")
                
                return error_response
                
            except UseCaseError as e:
                if return_dto:
                    from application.dto.document_dtos import ErrorDto
                    error_response = ErrorDto(
                        success=False,
                        error=e.message,
                        error_code=e.error_code,
                        error_type="usecase",
                        details=e.details,
                        timestamp=datetime.now().isoformat()
                    )
                else:
                    error_response = {
                        "success": False,
                        "error": e.message,
                        "error_code": e.error_code,
                        "error_type": "usecase",
                        "details": e.details,
                        "timestamp": datetime.now().isoformat()
                    }
                
                if log_error:
                    logger.error(f"UseCase 오류: {e.message} - {e.details}")
                
                return error_response
                
            except ValueError as e:
                if return_dto:
                    from application.dto.document_dtos import ErrorDto
                    error_response = ErrorDto(
                        success=False,
                        error=f"입력값 오류: {str(e)}",
                        error_code="VALUE_ERROR",
                        error_type="validation",
                        timestamp=datetime.now().isoformat()
                    )
                else:
                    error_response = {
                        "success": False,
                        "error": f"입력값 오류: {str(e)}",
                        "error_code": "VALUE_ERROR",
                        "error_type": "validation",
                        "timestamp": datetime.now().isoformat()
                    }
                
                if log_error:
                    logger.warning(f"입력값 오류: {e}")
                
                return error_response
                
            except Exception as e:
                if return_dto:
                    from application.dto.document_dtos import ErrorDto
                    error_response = ErrorDto(
                        success=False,
                        error=default_error_message,
                        error_code="UNEXPECTED_ERROR",
                        error_type="system",
                        timestamp=datetime.now().isoformat()
                    )
                    if include_traceback:
                        error_response.details = {"traceback": traceback.format_exc()}
                else:
                    error_response = {
                        "success": False,
                        "error": default_error_message,
                        "error_code": "UNEXPECTED_ERROR",
                        "error_type": "system",
                        "timestamp": datetime.now().isoformat()
                    }
                    if include_traceback:
                        error_response["traceback"] = traceback.format_exc()
                
                if log_error:
                    logger.error(f"예상치 못한 오류: {e}", exc_info=True)
                
                return error_response
                
        return wrapper
    return decorator


def validate_required_fields(**required_fields):
    """
    필수 필드 검증 데코레이터
    
    Args:
        **required_fields: 필드명과 검증 함수 매핑
    """
    def decorator(func: Callable[..., Dict[str, Any]]) -> Callable[..., Dict[str, Any]]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Dict[str, Any]:
            # 함수의 첫 번째 인자가 self인 경우 제외
            if args and hasattr(args[0], '__class__'):
                # 메서드 호출인 경우 - self 제외하고 나머지 args 처리
                method_args = args[1:]
            else:
                # 함수 호출인 경우
                method_args = args
            
            # 함수 시그니처에서 매개변수 이름들 가져오기
            import inspect
            sig = inspect.signature(func)
            param_names = list(sig.parameters.keys())
            
            # self가 있는 경우 제거
            if param_names and param_names[0] == 'self':
                param_names = param_names[1:]
            
            # 위치 인수를 키워드 인수로 변환
            bound_args = {}
            for i, param_name in enumerate(param_names):
                if i < len(method_args):
                    bound_args[param_name] = method_args[i]
            
            # kwargs와 병합 (kwargs가 우선)
            bound_args.update(kwargs)
            
            # 필수 필드 검증
            for field_name, validator in required_fields.items():
                if field_name not in bound_args:
                    raise ValidationError(f"필수 필드 '{field_name}'가 누락되었습니다.", field_name)
                
                value = bound_args[field_name]
                if not validator(value):
                    raise ValidationError(f"필드 '{field_name}'의 값이 유효하지 않습니다.", field_name, value)
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def validate_string_not_empty(value: Any) -> bool:
    """문자열이 비어있지 않은지 검증"""
    return isinstance(value, str) and len(value.strip()) > 0


def validate_positive_integer(value: Any) -> bool:
    """양의 정수인지 검증"""
    return isinstance(value, int) and value > 0


def validate_non_negative_number(value: Any) -> bool:
    """음수가 아닌 숫자인지 검증"""
    return isinstance(value, (int, float)) and value >= 0


def validate_boolean(value: Any) -> bool:
    """불린 값인지 검증"""
    return isinstance(value, bool)


def validate_list_not_empty(value: Any) -> bool:
    """리스트가 비어있지 않은지 검증"""
    return isinstance(value, list) and len(value) > 0


class ResponseFormatter:
    """일관된 응답 형식 제공"""
    
    @staticmethod
    def success(data: Any = None, message: str = "성공적으로 처리되었습니다.") -> Dict[str, Any]:
        """성공 응답 형식"""
        response = {
            "success": True,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        if data is not None:
            response["data"] = data
            
        return response
    
    @staticmethod
    def error(
        error_message: str,
        error_code: str = "ERROR",
        error_type: str = "system",
        details: Dict[str, Any] = None
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
            
        return response
    
    @staticmethod
    def validation_error(field: str, message: str, value: Any = None) -> Dict[str, Any]:
        """검증 오류 응답 형식"""
        return ResponseFormatter.error(
            f"'{field}' 필드 검증 실패: {message}",
            "VALIDATION_ERROR",
            "validation",
            {"field": field, "value": value}
        )
    
    @staticmethod
    def service_error(service_name: str, message: str) -> Dict[str, Any]:
        """서비스 오류 응답 형식"""
        return ResponseFormatter.error(
            f"{service_name} 서비스 오류: {message}",
            "SERVICE_ERROR",
            "service",
            {"service_name": service_name}
        )
    
    @staticmethod
    def configuration_error(config_key: str, message: str) -> Dict[str, Any]:
        """설정 오류 응답 형식"""
        return ResponseFormatter.error(
            f"설정 오류 ({config_key}): {message}",
            "CONFIGURATION_ERROR",
            "configuration",
            {"config_key": config_key}
        )


def log_usecase_execution(func_name: str = None):
    """UseCase 실행 로깅 데코레이터"""
    def decorator(func: Callable[..., Dict[str, Any]]) -> Callable[..., Dict[str, Any]]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Dict[str, Any]:
            usecase_name = func_name or func.__name__
            logger.info(f"🚀 {usecase_name} 실행 시작")
            
            start_time = datetime.now()
            result = func(*args, **kwargs)
            end_time = datetime.now()
            
            execution_time = (end_time - start_time).total_seconds()
            
            # DTO 객체와 딕셔너리 모두 지원
            if hasattr(result, 'success'):
                # DTO 객체인 경우
                if result.success:
                    logger.info(f"✅ {usecase_name} 실행 완료 ({execution_time:.2f}초)")
                else:
                    logger.warning(f"⚠️ {usecase_name} 실행 실패 ({execution_time:.2f}초)")
            elif hasattr(result, 'get') and result.get("success", False):
                # 딕셔너리인 경우
                logger.info(f"✅ {usecase_name} 실행 완료 ({execution_time:.2f}초)")
            elif hasattr(result, 'get') and not result.get("success", True):
                # 딕셔너리 실패인 경우
                logger.warning(f"⚠️ {usecase_name} 실행 실패 ({execution_time:.2f}초)")
            else:
                # 기타 객체인 경우 성공으로 간주
                logger.info(f"✅ {usecase_name} 실행 완료 ({execution_time:.2f}초)")
            
            return result
        return wrapper
    return decorator
