package com.aiportfolio.backend.infrastructure.web;

/**
 * 공개·관리 API에서 반복되는 응답 메시지 (Sonar S1192 대응).
 */
public final class WebApiResponseMessages {

    private WebApiResponseMessages() {
    }

    // --- Cloud usage (공개 API) ---

    public static String cloudInvalidSearchCondition(Exception e) {
        return "잘못된 검색 조건: " + e.getMessage();
    }

    public static String cloudCostSearchFailed(Exception e) {
        return "비용 검색 실패: " + e.getMessage();
    }

    public static final String AWS_CURRENT_MONTH_SUCCESS = "AWS 현재 월 사용량 조회 성공";
    public static final String AWS_USAGE_TREND_SUCCESS = "AWS 비용 추이 조회 성공";
    public static final String AWS_USAGE_TREND_30_SUCCESS = "AWS 30일 비용 추이 조회 성공";
    public static final String AWS_USAGE_TREND_6M_SUCCESS = "AWS 6개월 비용 추이 조회 성공";
    public static final String AWS_SERVICE_BREAKDOWN_SUCCESS = "AWS 서비스별 비용 분석 조회 성공";
    public static final String GCP_CURRENT_MONTH_SUCCESS = "GCP 현재 월 사용량 조회 성공";
    public static final String GCP_USAGE_TREND_SUCCESS = "GCP 비용 추이 조회 성공";
    public static final String GCP_USAGE_TREND_30_SUCCESS = "GCP 30일 비용 추이 조회 성공";
    public static final String GCP_USAGE_TREND_6M_SUCCESS = "GCP 6개월 비용 추이 조회 성공";
    public static final String GCP_SERVICE_BREAKDOWN_SUCCESS = "GCP 서비스별 비용 분석 조회 성공";
    public static final String COST_SEARCH_SUCCESS = "비용 검색 성공";

    /** 전역 예외 핸들러·컨트롤러 공통 라벨 */
    public static final String LABEL_BAD_REQUEST = "잘못된 요청";
    public static final String LABEL_SERVER_ERROR = "서버 오류";
    public static final String LABEL_ILLEGAL_STATE = "서버 상태 오류";
    public static final String LABEL_PAYLOAD_TOO_LARGE = "파일 크기 제한 초과";
    public static final String FILE_SIZE_EXCEEDED_DETAIL = "파일 크기가 너무 큽니다. 최대 업로드 크기를 초과했습니다.";
    public static final String GENERIC_REQUEST_FAILED = "요청 처리 중 오류가 발생했습니다.";

    /** 관리자 전용 예외 핸들러 */
    public static final String LABEL_AUTH_REQUIRED = "인증 필요";
    public static final String LABEL_VALIDATION_ERROR = "검증 오류";
    public static final String ADMIN_API_UNEXPECTED = "관리자 API 처리 중 오류가 발생했습니다.";

    public static String validationFailedDetail(String joinedFieldErrors) {
        return "입력값 검증 실패: " + joinedFieldErrors;
    }

    // --- 관계 API (Education / Experience / Project) ---

    public static final String TECH_STACK_RELATION_ADD_SUCCESS = "기술스택 관계 추가 성공";
    public static final String TECH_STACK_RELATION_DELETE_SUCCESS = "기술스택 관계 삭제 성공";
    public static final String TECH_STACK_RELATION_BULK_UPDATE_SUCCESS = "기술스택 관계 일괄 업데이트 성공";
    public static final String PROJECT_RELATION_ADD_SUCCESS = "프로젝트 관계 추가 성공";
    public static final String PROJECT_RELATION_DELETE_SUCCESS = "프로젝트 관계 삭제 성공";
    public static final String PROJECT_RELATION_BULK_UPDATE_SUCCESS = "프로젝트 관계 일괄 업데이트 성공";

    public static final String SORT_ORDER_UPDATE_SUCCESS = "정렬 순서 업데이트 성공";

    public static final String EDUCATION_DELETE_SUCCESS = "Education 삭제 성공";
    public static final String EXPERIENCE_DELETE_SUCCESS = "Experience 삭제 성공";
    public static final String CERTIFICATION_DELETE_SUCCESS = "Certification 삭제 성공";

    public static final String PROFILE_INTRO_EMPTY = "자기소개가 없습니다.";
    public static final String PROFILE_INTRO_SAVE_SUCCESS = "자기소개가 저장되었습니다.";
    public static final String IMAGE_DELETE_SUCCESS = "이미지 삭제 성공";

    public static final String TECH_STACK_SORT_ORDER_REQUIRED = "정렬 순서가 필요합니다.";

    // --- Admin article ---

    public static final String ARTICLE_NOT_FOUND = "아티클을 찾을 수 없습니다.";
    public static final String SERIES_NOT_FOUND = "시리즈를 찾을 수 없습니다.";
    public static final String ARTICLE_LIST_SUCCESS = "아티클 목록 조회 성공";
    public static final String ARTICLE_GET_SUCCESS = "아티클 조회 성공";
    public static final String ARTICLE_CREATE_SUCCESS = "아티클 생성 성공";
    public static final String ARTICLE_UPDATE_SUCCESS = "아티클 수정 성공";
    public static final String ARTICLE_DELETE_SUCCESS = "아티클 삭제 성공";
    public static final String ARTICLE_STATS_SUCCESS = "아티클 통계 조회 성공";
    public static final String ARTICLE_NAVIGATION_SUCCESS = "아티클 네비게이션 조회 성공";
    public static final String SERIES_SEARCH_SUCCESS = "시리즈 검색 성공";
    public static final String SERIES_GET_SUCCESS = "시리즈 조회 성공";
    public static final String SERIES_CREATE_SUCCESS = "시리즈 생성 성공";

    // --- Admin project ---

    public static final String PROJECT_LIST_SUCCESS = "프로젝트 목록 조회 성공";
    public static final String PROJECT_GET_SUCCESS = "프로젝트 조회 성공";
    public static final String PROJECT_CREATE_SUCCESS = "프로젝트 생성 성공";
    public static final String PROJECT_UPDATE_SUCCESS = "프로젝트 수정 성공";
    public static final String PROJECT_DELETE_SUCCESS = "프로젝트 삭제 성공";

    // --- Public data API (DataController) ---

    public static final String PORTFOLIO_DATA_FETCH_SUCCESS = "포트폴리오 데이터 조회 성공";
    public static final String PUBLIC_EXPERIENCE_LIST_SUCCESS = "경험 목록 조회 성공";
    public static final String PUBLIC_CERTIFICATION_LIST_SUCCESS = "자격증 목록 조회 성공";
    public static final String PUBLIC_EDUCATION_LIST_SUCCESS = "교육 목록 조회 성공";

    // --- Admin auth ---

    public static final String ADMIN_LOGIN_SUCCESS = "로그인 성공";
    public static final String ADMIN_LOGOUT_SUCCESS = "로그아웃 성공";
    public static final String ADMIN_SESSION_VALID = "세션이 유효합니다";

    // --- Admin cloud usage ---

    public static final String ADMIN_CLOUD_USAGE_FETCH_SUCCESS = "클라우드 사용량 조회 성공";

    // --- Chat ---

    public static final String CHAT_INPUT_VALIDATION_FAILED = "입력 검증 실패";
    public static final String CHAT_RATE_LIMIT_MESSAGE = "요청 제한";
    public static final String CHAT_RESPONSE_SUCCESS = "챗봇 응답 성공";
    public static final String CHAT_RESPONSE_FAILED = "챗봇 응답 실패";
    public static final String CHAT_HEALTH_CHECK_MESSAGE = "챗봇 서비스 상태 확인";
    public static final String CHAT_USAGE_STATUS_SUCCESS = "사용량 제한 상태 조회 성공";
    public static final String CHAT_USAGE_STATUS_FAILED = "사용량 제한 상태 조회 실패";
    public static final String CHAT_SYSTEM_ERROR_USER_MESSAGE = "죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.";

    // --- Admin image upload ---

    public static final String LABEL_UPLOAD_FAILED = "업로드 실패";
    public static final String LABEL_DB_SAVE_FAILED = "DB 저장 실패";
    public static final String LABEL_DELETE_FAILED = "삭제 실패";
    public static final String IMAGE_UPLOAD_SUCCESS = "이미지 업로드 성공";
    public static final String UPLOAD_FILE_EMPTY = "파일이 비어있습니다";
    public static final String UPLOAD_UNSUPPORTED_IMAGE_TYPE = "지원하지 않는 이미지 형식입니다";
    public static final String UPLOAD_URL_MISSING = "이미지 업로드는 성공했지만 URL을 받지 못했습니다";
    public static final String UPLOAD_DB_SAVE_FAILED_SINGLE =
            "이미지 업로드는 성공했지만 DB 저장에 실패했습니다. 이미지는 Cloudinary에 저장되었지만 프로젝트 정보는 업데이트되지 않았습니다.";
    public static final String UPLOAD_NO_FILES = "업로드할 파일이 없습니다";
    public static final String UPLOAD_INVALID_FILES_IN_BATCH = "유효하지 않은 파일이 포함되어 있습니다";
    public static final String UPLOAD_ALL_IMAGES_FAILED = "모든 이미지 업로드에 실패했습니다";
    public static final String UPLOAD_MAX_SIZE_10MB_DETAIL = "파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.";
    public static final String UPLOAD_GENERIC_ERROR = "이미지 업로드 중 오류가 발생했습니다";
    public static final String IMAGE_DELETE_ERROR = "이미지 삭제 중 오류가 발생했습니다";

    public static String uploadDbSaveFailedMultiMessage(int imageCount) {
        return String.format(
                "이미지 업로드는 성공했지만 DB 저장에 실패했습니다. %d개의 이미지가 Cloudinary에 저장되었지만 프로젝트 정보는 업데이트되지 않았습니다.",
                imageCount);
    }

    // --- Admin cache (Map 응답 메시지) ---

    public static final String CACHE_FLUSH_SUCCESS = "캐시가 성공적으로 초기화되었습니다.";
    public static final String CACHE_PATTERN_DELETE_SUCCESS = "패턴별 캐시가 성공적으로 삭제되었습니다.";
    public static final String FRONTEND_CACHE_INVALIDATE_NOTICE = "모든 사용자의 프론트엔드 캐시가 무효화됩니다.";

    public static String cacheFlushFailed(String detail) {
        return "캐시 초기화 중 오류가 발생했습니다: " + detail;
    }

    public static String cacheStatsQueryFailed(String detail) {
        return "캐시 통계 조회 중 오류가 발생했습니다: " + detail;
    }

    public static String cacheKeysByPatternQueryFailed(String detail) {
        return "패턴별 캐시 키 조회 중 오류가 발생했습니다: " + detail;
    }

    public static String cachePatternDeleteFailed(String detail) {
        return "패턴별 캐시 삭제 중 오류가 발생했습니다: " + detail;
    }

    public static String frontendCacheVersionQueryFailed(String detail) {
        return "프론트엔드 캐시 버전 조회 중 오류가 발생했습니다: " + detail;
    }

    public static String frontendCacheVersionUpdateFailed(String detail) {
        return "프론트엔드 캐시 버전 업데이트 중 오류가 발생했습니다: " + detail;
    }

    // --- GitHub ---

    public static final String GITHUB_PROJECTS_LIST_SUCCESS = "GitHub 프로젝트 목록 조회 성공";
    public static final String GITHUB_PROJECTS_LIST_FAILED = "GitHub 프로젝트 목록 조회 실패";
    public static final String GITHUB_PROJECT_NOT_FOUND = "GitHub 프로젝트를 찾을 수 없습니다";
    public static final String GITHUB_PROJECT_GET_SUCCESS = "GitHub 프로젝트 조회 성공";
    public static final String GITHUB_PROJECT_GET_FAILED = "GitHub 프로젝트 조회 실패";
}
