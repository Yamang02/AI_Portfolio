package com.aiportfolio.backend.domain.admin.model.vo;

import java.util.Locale;

/**
 * 클라우드 사용량 데이터의 상태를 나타냅니다.
 */
public enum CloudUsageStatus {
    HEALTHY,
    DEGRADED,
    UNAVAILABLE,
    DISABLED;

    /**
     * 외부 API의 상태 문자열을 안전하게 {@link CloudUsageStatus}로 변환합니다.
     * 예상치 못한 값은 {@link #UNAVAILABLE}로 매핑됩니다.
     *
     * @param status 외부 API에서 전달된 상태 문자열
     * @return 변환된 {@link CloudUsageStatus}
     */
    public static CloudUsageStatus from(String status) {
        if (status == null) {
            return UNAVAILABLE;
        }

        try {
            return valueOf(status.trim().toUpperCase(Locale.ENGLISH));
        } catch (IllegalArgumentException ignored) {
            return UNAVAILABLE;
        }
    }
}
