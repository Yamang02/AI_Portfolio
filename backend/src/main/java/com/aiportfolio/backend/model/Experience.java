package com.aiportfolio.backend.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experience {
    private String id;
    private String title;
    private String description;
    private List<String> technologies;
    private String organization;
    private String role;
    private String startDate;
    private String endDate;
    private String type;
    private List<String> mainResponsibilities;
    private List<String> achievements;
    private List<String> projects;
} 