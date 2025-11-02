package com.aiportfolio.backend.infrastructure.web.dto.relationship;

import lombok.Data;

/**
 * 기술스택 관계 생성/수정 요청 DTO
 */
@Data
public class TechStackRelationshipRequest {
    
    private Long techStackId;
    private Boolean isPrimary;
    private String usageDescription;
}

