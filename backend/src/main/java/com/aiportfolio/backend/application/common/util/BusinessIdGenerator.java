package com.aiportfolio.backend.application.common.util;

import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

/**
 * 비즈니스 ID 생성 유틸리티
 *
 * 모든 도메인에서 일관된 ID 생성 패턴을 제공합니다.
 * 형식: {prefix}-{숫자3자리} (예: prj-001, exp-001, edu-001)
 *
 * 사용 예:
 * <pre>
 * Optional<String> lastId = repository.findLastBusinessIdByPrefix("exp-");
 * String newId = BusinessIdGenerator.generate("exp-", lastId);
 * // 결과: "exp-001" (첫 번째) 또는 "exp-012" (마지막이 exp-011인 경우)
 * </pre>
 */
@Slf4j
public class BusinessIdGenerator {

    /**
     * 비즈니스 ID 생성
     *
     * @param prefix 접두사 (예: "prj-", "exp-", "edu-", "cer-")
     * @param lastBusinessId 마지막 비즈니스 ID (Optional)
     * @return 생성된 비즈니스 ID (예: "exp-001")
     */
    public static String generate(String prefix, Optional<String> lastBusinessId) {
        validatePrefix(prefix);

        int nextNumber = lastBusinessId
            .map(id -> extractNumber(id, prefix))
            .orElse(0);

        // +1 증가 후 3자리 포맷팅
        String formattedNumber = String.format("%03d", nextNumber + 1);
        String generatedId = prefix + formattedNumber;

        log.debug("Generated business ID: {} (previous: {})", generatedId, lastBusinessId.orElse("none"));
        return generatedId;
    }

    /**
     * 비즈니스 ID에서 숫자 부분을 추출
     *
     * @param businessId 비즈니스 ID (예: "exp-010")
     * @param prefix 접두사 (예: "exp-")
     * @return 숫자 부분 (예: 10)
     */
    private static int extractNumber(String businessId, String prefix) {
        if (businessId == null || businessId.isEmpty()) {
            log.warn("Business ID is null or empty, returning 0");
            return 0;
        }

        if (!businessId.startsWith(prefix)) {
            log.warn("Business ID '{}' does not start with prefix '{}', returning 0", businessId, prefix);
            return 0;
        }

        try {
            // prefix 이후의 숫자 부분 추출 (예: "exp-010" → "010" → 10)
            String numberPart = businessId.substring(prefix.length());
            return Integer.parseInt(numberPart);
        } catch (Exception e) {
            log.error("Failed to extract number from business ID '{}' with prefix '{}', returning 0",
                businessId, prefix, e);
            return 0;
        }
    }

    /**
     * 접두사 유효성 검증
     *
     * @param prefix 접두사
     * @throws IllegalArgumentException 접두사가 유효하지 않은 경우
     */
    private static void validatePrefix(String prefix) {
        if (prefix == null || prefix.isEmpty()) {
            throw new IllegalArgumentException("Prefix cannot be null or empty");
        }

        if (!prefix.endsWith("-")) {
            log.warn("Prefix '{}' does not end with '-', but will be used as-is", prefix);
        }
    }

    /**
     * 지원되는 접두사 목록
     */
    public static class Prefix {
        public static final String PROJECT = "prj-";
        public static final String EXPERIENCE = "exp-";
        public static final String EDUCATION = "edu-";
        public static final String CERTIFICATION = "cer-";

        private Prefix() {
            // 유틸리티 클래스이므로 인스턴스화 방지
        }
    }
}
