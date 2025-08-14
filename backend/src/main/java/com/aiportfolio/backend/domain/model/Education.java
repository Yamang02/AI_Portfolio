package com.aiportfolio.backend.domain.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import com.aiportfolio.backend.domain.model.enums.EducationType;
import java.time.LocalDate;

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
    private LocalDate startDate;
    private LocalDate endDate;
    private EducationType type;
    private List<String> projects;
}

