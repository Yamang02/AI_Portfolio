package com.aiportfolio.backend.application.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 텍스트 필드 정규화 헬퍼 클래스
 * 
 * textarea 필드의 빈 문자열, 공백만 있는 문자열 등을 일관되게 처리합니다.
 * - 빈 문자열("") → null로 변환
 * - 공백만 있는 문자열("   ") → null로 변환
 * - null → null 유지
 * - 유효한 문자열 → trim() 후 반환
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class TextFieldHelper {

    /**
     * 문자열을 정규화합니다.
     * 
     * @param value 정규화할 문자열
     * @return 정규화된 문자열 (빈 문자열이거나 공백만 있으면 null, 그 외에는 trim된 문자열)
     */
    public static String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * 문자열 리스트를 정규화합니다.
     * 
     * @param values 정규화할 문자열 리스트
     * @return 정규화된 문자열 리스트 (빈 문자열이나 공백만 있는 항목은 제거됨)
     */
    public static List<String> normalizeTextList(List<String> values) {
        if (values == null) {
            return null;
        }
        
        List<String> normalized = values.stream()
                .map(TextFieldHelper::normalizeText)
                .filter(value -> value != null)
                .collect(Collectors.toList());
        
        return normalized.isEmpty() ? null : normalized;
    }

    /**
     * 문자열이 유효한지 확인합니다 (null이 아니고 빈 문자열이 아니고 공백만 있지 않음).
     * 
     * @param value 확인할 문자열
     * @return 유효한 문자열이면 true, 그 외에는 false
     */
    public static boolean isValidText(String value) {
        return normalizeText(value) != null;
    }
}

