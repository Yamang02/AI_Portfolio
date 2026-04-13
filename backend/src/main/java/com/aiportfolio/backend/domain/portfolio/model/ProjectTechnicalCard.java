package com.aiportfolio.backend.domain.portfolio.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTechnicalCard {
    private Long id;
    private String businessId;
    private String title;
    private String category;
    private String problemStatement;
    private String analysis;
    private String solution;
    private Long articleId;
    private boolean pinned;
    private Integer sortOrder;
}

