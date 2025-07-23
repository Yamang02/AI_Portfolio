package com.aiportfolio.backend.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    private String id;
    private String title;
    private String description;
    private List<String> technologies;
    private String githubUrl;
    private String liveUrl;
    private String imageUrl;
    private String readme;
    private String type;
    private String source;
    private String startDate;
    private String endDate;
    
    @JsonProperty("isTeam")
    private boolean isTeam;
    
    private String externalUrl;
} 