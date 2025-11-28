package com.aiportfolio.backend.domain.portfolio.model;

import com.aiportfolio.backend.application.common.util.Sortable;

// Java 표준 라이브러리 imports
import java.time.LocalDate;
import java.time.LocalDateTime;

// 외부 라이브러리 imports
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Certification 도메인 모델
 *
 * 순수 비즈니스 도메인 모델 (인프라 의존성 없음)
 * Hexagonal Architecture의 중심 도메인
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certification implements Sortable {

    /**
     * 비즈니스 ID (CRT001, CRT002 등)
     */
    private String id;

    /**
     * 자격증명
     */
    private String name;

    /**
     * 발급기관
     */
    private String issuer;

    /**
     * 취득일
     */
    private LocalDate date;

    /**
     * 만료일 (NULL이면 만료 없음)
     */
    private LocalDate expiryDate;

    /**
     * 자격증 번호/ID
     */
    private String credentialId;

    /**
     * 자격증 확인 URL
     */
    private String credentialUrl;

    /**
     * 설명
     */
    private String description;

    /**
     * 카테고리 (IT, Language, Project Management 등)
     */
    private String category;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 자격증이 만료되었는지 확인
     *
     * @return 만료 여부
     */
    public boolean isExpired() {
        if (expiryDate == null) {
            return false; // 만료일이 없으면 만료되지 않음
        }
        return LocalDate.now().isAfter(expiryDate);
    }

    /**
     * 자격증이 곧 만료될 예정인지 확인 (3개월 이내)
     *
     * @return 곧 만료 여부
     */
    public boolean isExpiringSoon() {
        if (expiryDate == null) {
            return false;
        }
        LocalDate threeMonthsFromNow = LocalDate.now().plusMonths(3);
        return !LocalDate.now().isAfter(expiryDate) && expiryDate.isBefore(threeMonthsFromNow);
    }
}
