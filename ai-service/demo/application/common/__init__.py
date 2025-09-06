"""
Common - Demo Application Layer
공통 기능 모듈

UseCase에서 공통으로 사용하는 오류 처리, 응답 형식 등을 제공합니다.
"""

from .error_handler import (
    handle_usecase_errors,
    validate_required_fields,
    UseCaseError,
    ValidationError,
    ServiceError,
    ConfigurationError,
    validate_string_not_empty,
    validate_positive_integer,
    validate_non_negative_number,
    validate_boolean,
    validate_list_not_empty,
    log_usecase_execution
)

from .response_formatter import (
    ResponseFormatter,
    ErrorCode,
    ErrorType,
    UseCaseResponse
)

__all__ = [
    # Error Handler
    "handle_usecase_errors",
    "validate_required_fields",
    "UseCaseError",
    "ValidationError", 
    "ServiceError",
    "ConfigurationError",
    "validate_string_not_empty",
    "validate_positive_integer",
    "validate_non_negative_number",
    "validate_boolean",
    "validate_list_not_empty",
    "log_usecase_execution",
    
    # Response Formatter
    "ResponseFormatter",
    "ErrorCode",
    "ErrorType",
    "UseCaseResponse"
]
