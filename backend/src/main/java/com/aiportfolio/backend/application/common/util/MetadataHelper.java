package com.aiportfolio.backend.application.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

/**
 * 메타데이터 처리 헬퍼 클래스
 * 
 * 생성일, 수정일 등의 메타데이터 설정에 공통으로 사용되는 로직을 제공합니다.
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class MetadataHelper {

    /**
     * 생성 시간을 설정합니다 (이미 설정되지 않은 경우에만)
     * 
     * @param createdAt 현재 설정된 생성 시간
     * @return 생성 시간 (기존 값 또는 현재 시간)
     */
    public static LocalDateTime setupCreatedAt(LocalDateTime createdAt) {
        if (createdAt == null) {
            return LocalDateTime.now();
        }
        return createdAt;
    }

    /**
     * 수정 시간을 설정합니다 (항상 현재 시간으로)
     * 
     * @return 현재 시간
     */
    public static LocalDateTime setupUpdatedAt() {
        return LocalDateTime.now();
    }

    /**
     * 엔티티의 ID를 안전하게 문자열로 변환합니다.
     * 
     * @param id 엔티티 ID
     * @return 문자열 ID
     */
    public static String toSafeString(Object id) {
        return id != null ? id.toString() : "null";
    }
}

