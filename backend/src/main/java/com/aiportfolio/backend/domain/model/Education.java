package com.aiportfolio.backend.domain.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Education {
    private String id;
    private String title;
    private String description;
    private List<String> technologies;
    private String organization;
    private String startDate;
    private String endDate;
    private String type;
    private List<String> projects;
}

