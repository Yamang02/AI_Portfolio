package com.aiportfolio.backend.infrastructure.web.admin;

/**
 * 관리자 API에서 반복되는 오류 메시지 접두·조합 (Sonar S1192 대응).
 */
public final class AdminApiErrorMessages {

    private static final String SORT_ORDER_UPDATE_FAILED_PREFIX = "정렬 순서 업데이트 중 오류가 발생했습니다: ";

    /** 동일 문구가 여러 관계 컨트롤러에서 사용됨 */
    public static final String RELATION_ALREADY_EXISTS = "이미 관계가 존재합니다";

    private AdminApiErrorMessages() {
    }

    public static String sortOrderUpdateFailed(Exception e) {
        return SORT_ORDER_UPDATE_FAILED_PREFIX + e.getMessage();
    }

    public static String listQueryFailed(String resourceLabel, Exception e) {
        return resourceLabel + " 목록 조회 중 오류가 발생했습니다: "
                + e.getClass().getSimpleName() + " - " + e.getMessage();
    }

    public static String queryFailed(String resourceLabel, Exception e) {
        return resourceLabel + " 조회 중 오류가 발생했습니다: " + e.getMessage();
    }

    public static String searchFailed(String resourceLabel, Exception e) {
        return resourceLabel + " 검색 중 오류가 발생했습니다: " + e.getMessage();
    }

    public static String createFailed(String resourceLabel, Exception e) {
        return resourceLabel + " 생성 중 오류가 발생했습니다: " + e.getMessage();
    }

    public static String updateFailed(String resourceLabel, Exception e) {
        return resourceLabel + " 수정 중 오류가 발생했습니다: " + e.getMessage();
    }

    public static String deleteFailed(String resourceLabel, Exception e) {
        return resourceLabel + " 삭제 중 오류가 발생했습니다: " + e.getMessage();
    }

    public static String certificationsByCategoryFailed(Exception e) {
        return "카테고리별 자격증 조회 중 오류가 발생했습니다: " + e.getMessage();
    }

    public static String expiredCertificationsFailed(Exception e) {
        return "만료된 자격증 조회 중 오류가 발생했습니다: " + e.getMessage();
    }

    public static String expiringSoonCertificationsFailed(Exception e) {
        return "곧 만료될 자격증 조회 중 오류가 발생했습니다: " + e.getMessage();
    }

    public static String techStackRelationQueryFailed(Exception e) {
        return "기술스택 관계 조회 실패: " + e.getMessage();
    }

    public static String techStackRelationAddFailed(Exception e) {
        return "기술스택 관계 추가 실패: " + e.getMessage();
    }

    public static String techStackRelationDeleteFailed(Exception e) {
        return "기술스택 관계 삭제 실패: " + e.getMessage();
    }

    public static String techStackRelationBulkUpdateFailed(Exception e) {
        return "기술스택 관계 일괄 업데이트 실패: " + e.getMessage();
    }

    public static String projectRelationQueryFailed(Exception e) {
        return "프로젝트 관계 조회 실패: " + e.getMessage();
    }

    public static String projectRelationAddFailed(Exception e) {
        return "프로젝트 관계 추가 실패: " + e.getMessage();
    }

    public static String projectRelationDeleteFailed(Exception e) {
        return "프로젝트 관계 삭제 실패: " + e.getMessage();
    }

    public static String projectRelationBulkUpdateFailed(Exception e) {
        return "프로젝트 관계 일괄 업데이트 실패: " + e.getMessage();
    }

    public static String profileIntroductionSaveFailed(Exception e) {
        return "자기소개 저장 중 오류가 발생했습니다: " + e.getMessage();
    }
}
