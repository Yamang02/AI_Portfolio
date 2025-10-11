package com.aiportfolio.backend.infrastructure.web.dto.techstack;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 기술 스택 메타데이터 DTO
 * API 응답용 기술 스택 메타데이터 데이터 전송 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechStackMetadataDto {
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("displayName")
    private String displayName;
    
    @JsonProperty("category")
    private String category;
    
    @JsonProperty("level")
    private String level;
    
    @JsonProperty("isCore")
    private Boolean isCore;
    
    @JsonProperty("isActive")
    private Boolean isActive;
    
    @JsonProperty("iconUrl")
    private String iconUrl;
    
    @JsonProperty("colorHex")
    private String colorHex;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("sortOrder")
    private Integer sortOrder;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}

