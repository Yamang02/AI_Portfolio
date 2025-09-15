"""
Error Enums - Infrastructure Layer
에러 처리 관련 ENUM 정의

에러 패턴, 에러 코드, 에러 타입, 인터페이스 타입 등을 ENUM으로 관리합니다.
"""

from enum import Enum
from typing import Dict, List


class ErrorPattern(Enum):
    """에러 패턴 ENUM"""
    DOCUMENT_ID = "document_id"
    VALIDATION = "validation"
    SERVICE = "service"
    TIMEOUT = "timeout"
    NOT_FOUND = "not found"
    PERMISSION = "permission"
    RATE_LIMIT = "rate limit"
    NETWORK = "network"
    CONFIGURATION = "configuration"
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    DUPLICATE = "duplicate"
    INVALID_FORMAT = "invalid format"
    RESOURCE_EXHAUSTED = "resource exhausted"
    DEPENDENCY_UNAVAILABLE = "dependency unavailable"


class ErrorCode(Enum):
    """에러 코드 ENUM"""
    # 일반 에러
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SYSTEM_ERROR = "SYSTEM_ERROR"
    
    # 검증 에러
    VALIDATION_ERROR = "VALIDATION_ERROR"
    REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING"
    INVALID_FORMAT = "INVALID_FORMAT"
    INVALID_VALUE = "INVALID_VALUE"
    
    # 리소스 에러
    NOT_FOUND_ERROR = "NOT_FOUND_ERROR"
    ALREADY_EXISTS_ERROR = "ALREADY_EXISTS_ERROR"
    RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED"
    
    # 권한 에러
    PERMISSION_ERROR = "PERMISSION_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    
    # 서비스 에러
    SERVICE_ERROR = "SERVICE_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    SERVICE_TIMEOUT = "SERVICE_TIMEOUT"
    DEPENDENCY_UNAVAILABLE = "DEPENDENCY_UNAVAILABLE"
    
    # 네트워크 에러
    NETWORK_ERROR = "NETWORK_ERROR"
    CONNECTION_ERROR = "CONNECTION_ERROR"
    TIMEOUT_ERROR = "TIMEOUT_ERROR"
    
    # 설정 에러
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
    CONFIG_NOT_FOUND = "CONFIG_NOT_FOUND"
    CONFIG_INVALID = "CONFIG_INVALID"
    
    # 제한 에러
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"


class ErrorType(Enum):
    """에러 타입 ENUM"""
    SYSTEM = "system"
    VALIDATION = "validation"
    RESOURCE = "resource"
    PERMISSION = "permission"
    SERVICE = "service"
    NETWORK = "network"
    CONFIGURATION = "configuration"
    BUSINESS = "business"
    TECHNICAL = "technical"


class InterfaceType(Enum):
    """인터페이스 타입 ENUM"""
    GRADIO = "gradio"
    REST = "rest"
    GRAPHQL = "graphql"
    WEBSOCKET = "websocket"
    CLI = "cli"
    BATCH = "batch"
    SCHEDULER = "scheduler"


class ErrorSeverity(Enum):
    """에러 심각도 ENUM"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorCategory(Enum):
    """에러 카테고리 ENUM"""
    USER_INPUT = "user_input"
    SYSTEM_RESOURCE = "system_resource"
    EXTERNAL_DEPENDENCY = "external_dependency"
    BUSINESS_LOGIC = "business_logic"
    DATA_INTEGRITY = "data_integrity"
    SECURITY = "security"
    PERFORMANCE = "performance"


# 에러 패턴별 사용자 친화적 메시지 매핑
ERROR_PATTERN_MESSAGES: Dict[ErrorPattern, str] = {
    ErrorPattern.DOCUMENT_ID: "문서를 찾을 수 없습니다. 문서 목록을 새로고침해주세요.",
    ErrorPattern.VALIDATION: "입력값이 올바르지 않습니다. 다시 확인해주세요.",
    ErrorPattern.SERVICE: "서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    ErrorPattern.TIMEOUT: "요청 시간이 초과되었습니다. 다시 시도해주세요.",
    ErrorPattern.NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
    ErrorPattern.PERMISSION: "접근 권한이 없습니다.",
    ErrorPattern.RATE_LIMIT: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
    ErrorPattern.NETWORK: "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.",
    ErrorPattern.CONFIGURATION: "시스템 설정에 문제가 있습니다. 관리자에게 문의해주세요.",
    ErrorPattern.AUTHENTICATION: "인증이 필요합니다. 로그인해주세요.",
    ErrorPattern.AUTHORIZATION: "권한이 부족합니다. 관리자에게 문의해주세요.",
    ErrorPattern.DUPLICATE: "이미 존재하는 데이터입니다.",
    ErrorPattern.INVALID_FORMAT: "데이터 형식이 올바르지 않습니다.",
    ErrorPattern.RESOURCE_EXHAUSTED: "시스템 리소스가 부족합니다. 잠시 후 다시 시도해주세요.",
    ErrorPattern.DEPENDENCY_UNAVAILABLE: "외부 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요."
}

# 인터페이스별 기본 에러 메시지 매핑
INTERFACE_DEFAULT_MESSAGES: Dict[InterfaceType, str] = {
    InterfaceType.GRADIO: "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    InterfaceType.REST: "서버 오류가 발생했습니다. 관리자에게 문의해주세요.",
    InterfaceType.GRAPHQL: "요청 처리 중 오류가 발생했습니다.",
    InterfaceType.WEBSOCKET: "연결에 문제가 발생했습니다. 페이지를 새로고침해주세요.",
    InterfaceType.CLI: "명령 실행 중 오류가 발생했습니다.",
    InterfaceType.BATCH: "배치 작업 중 오류가 발생했습니다.",
    InterfaceType.SCHEDULER: "스케줄 작업 중 오류가 발생했습니다."
}

# 에러 코드별 에러 타입 매핑
ERROR_CODE_TYPE_MAPPING: Dict[ErrorCode, ErrorType] = {
    # 검증 에러
    ErrorCode.VALIDATION_ERROR: ErrorType.VALIDATION,
    ErrorCode.REQUIRED_FIELD_MISSING: ErrorType.VALIDATION,
    ErrorCode.INVALID_FORMAT: ErrorType.VALIDATION,
    ErrorCode.INVALID_VALUE: ErrorType.VALIDATION,
    
    # 리소스 에러
    ErrorCode.NOT_FOUND_ERROR: ErrorType.RESOURCE,
    ErrorCode.ALREADY_EXISTS_ERROR: ErrorType.RESOURCE,
    ErrorCode.RESOURCE_EXHAUSTED: ErrorType.RESOURCE,
    
    # 권한 에러
    ErrorCode.PERMISSION_ERROR: ErrorType.PERMISSION,
    ErrorCode.AUTHENTICATION_ERROR: ErrorType.PERMISSION,
    ErrorCode.AUTHORIZATION_ERROR: ErrorType.PERMISSION,
    
    # 서비스 에러
    ErrorCode.SERVICE_ERROR: ErrorType.SERVICE,
    ErrorCode.SERVICE_UNAVAILABLE: ErrorType.SERVICE,
    ErrorCode.SERVICE_TIMEOUT: ErrorType.SERVICE,
    ErrorCode.DEPENDENCY_UNAVAILABLE: ErrorType.SERVICE,
    
    # 네트워크 에러
    ErrorCode.NETWORK_ERROR: ErrorType.NETWORK,
    ErrorCode.CONNECTION_ERROR: ErrorType.NETWORK,
    ErrorCode.TIMEOUT_ERROR: ErrorType.NETWORK,
    
    # 설정 에러
    ErrorCode.CONFIGURATION_ERROR: ErrorType.CONFIGURATION,
    ErrorCode.CONFIG_NOT_FOUND: ErrorType.CONFIGURATION,
    ErrorCode.CONFIG_INVALID: ErrorType.CONFIGURATION,
    
    # 제한 에러
    ErrorCode.RATE_LIMIT_ERROR: ErrorType.BUSINESS,
    ErrorCode.QUOTA_EXCEEDED: ErrorType.BUSINESS,
    
    # 일반 에러
    ErrorCode.UNKNOWN_ERROR: ErrorType.SYSTEM,
    ErrorCode.INTERNAL_ERROR: ErrorType.SYSTEM,
    ErrorCode.SYSTEM_ERROR: ErrorType.SYSTEM
}

# 에러 패턴별 에러 코드 매핑
ERROR_PATTERN_CODE_MAPPING: Dict[ErrorPattern, ErrorCode] = {
    ErrorPattern.DOCUMENT_ID: ErrorCode.NOT_FOUND_ERROR,
    ErrorPattern.VALIDATION: ErrorCode.VALIDATION_ERROR,
    ErrorPattern.SERVICE: ErrorCode.SERVICE_ERROR,
    ErrorPattern.TIMEOUT: ErrorCode.TIMEOUT_ERROR,
    ErrorPattern.NOT_FOUND: ErrorCode.NOT_FOUND_ERROR,
    ErrorPattern.PERMISSION: ErrorCode.PERMISSION_ERROR,
    ErrorPattern.RATE_LIMIT: ErrorCode.RATE_LIMIT_ERROR,
    ErrorPattern.NETWORK: ErrorCode.NETWORK_ERROR,
    ErrorPattern.CONFIGURATION: ErrorCode.CONFIGURATION_ERROR,
    ErrorPattern.AUTHENTICATION: ErrorCode.AUTHENTICATION_ERROR,
    ErrorPattern.AUTHORIZATION: ErrorCode.AUTHORIZATION_ERROR,
    ErrorPattern.DUPLICATE: ErrorCode.ALREADY_EXISTS_ERROR,
    ErrorPattern.INVALID_FORMAT: ErrorCode.INVALID_FORMAT,
    ErrorPattern.RESOURCE_EXHAUSTED: ErrorCode.RESOURCE_EXHAUSTED,
    ErrorPattern.DEPENDENCY_UNAVAILABLE: ErrorCode.DEPENDENCY_UNAVAILABLE
}


def get_error_pattern_from_message(error_message: str) -> ErrorPattern:
    """에러 메시지에서 에러 패턴을 추출"""
    error_lower = error_message.lower()
    
    for pattern in ErrorPattern:
        if pattern.value in error_lower:
            return pattern
    
    return ErrorPattern.VALIDATION  # 기본값


def get_user_friendly_message(error_pattern: ErrorPattern, interface_type: InterfaceType = InterfaceType.GRADIO) -> str:
    """에러 패턴과 인터페이스 타입에 따른 사용자 친화적 메시지 반환"""
    return ERROR_PATTERN_MESSAGES.get(error_pattern, INTERFACE_DEFAULT_MESSAGES.get(interface_type, "알 수 없는 오류가 발생했습니다."))


def get_error_code_from_pattern(error_pattern: ErrorPattern) -> ErrorCode:
    """에러 패턴에 따른 에러 코드 반환"""
    return ERROR_PATTERN_CODE_MAPPING.get(error_pattern, ErrorCode.UNKNOWN_ERROR)


def get_error_type_from_code(error_code: ErrorCode) -> ErrorType:
    """에러 코드에 따른 에러 타입 반환"""
    return ERROR_CODE_TYPE_MAPPING.get(error_code, ErrorType.SYSTEM)
