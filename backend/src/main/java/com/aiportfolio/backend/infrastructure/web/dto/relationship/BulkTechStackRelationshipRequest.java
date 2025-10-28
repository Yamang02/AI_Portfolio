package com.aiportfolio.backend.infrastructure.web.dto.relationship;

import lombok.Data;
import java.util.List;

/**
 * 기술스택 관계 일괄 업데이트 요청 DTO
 *
 * Education 또는 Experience의 기술스택 관계를 한 번에 업데이트
 * (기존 관계 전체 삭제 → 새 관계 생성, @Transactional로 원자성 보장)
 */
@Data
public class BulkTechStackRelationshipRequest {

    private List<TechStackRelationshipItem> techStackRelationships;

    /**
     * 개별 기술스택 관계 아이템
     */
    @Data
    public static class TechStackRelationshipItem {
        private Long techStackId;
        private Boolean isPrimary;
        private String usageDescription;
    }
}
