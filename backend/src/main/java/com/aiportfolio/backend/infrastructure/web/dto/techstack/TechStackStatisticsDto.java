package com.aiportfolio.backend.infrastructure.web.dto.techstack;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 기술 스택 통계 DTO
 * API 응답용 기술 스택 통계 데이터 전송 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechStackStatisticsDto {
    
    @JsonProperty("totalTechnologies")
    private Long totalTechnologies;
    
    @JsonProperty("coreTechnologies")
    private Long coreTechnologies;
    
    @JsonProperty("activeTechnologies")
    private Long activeTechnologies;
    
    @JsonProperty("categoryCounts")
    private List<CategoryCountDto> categoryCounts;
    
    @JsonProperty("levelCounts")
    private List<LevelCountDto> levelCounts;
    
    /**
     * 카테고리별 개수 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryCountDto {
        @JsonProperty("category")
        private String category;
        
        @JsonProperty("count")
        private Long count;
    }
    
    /**
     * 레벨별 개수 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LevelCountDto {
        @JsonProperty("level")
        private String level;
        
        @JsonProperty("count")
        private Long count;
    }
}

