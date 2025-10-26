package com.aiportfolio.backend.infrastructure.web.dto.relationship;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 기술스택 관계 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechStackRelationshipDto {
    
    private Long id;
    private Long techStackId;
    private String techStackName;
    private String techStackDisplayName;
    private String category;
    private Boolean isPrimary;
    private String usageDescription;
}

