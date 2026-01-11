package com.aiportfolio.backend.domain.article.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ArticleTechStack {
    private Long id;
    private Long articleId;
    private String techName;  // TechStackMetadata의 name 참조
    private Boolean isPrimary;  // 주요 기술 스택 여부
    private LocalDateTime createdAt;
}
