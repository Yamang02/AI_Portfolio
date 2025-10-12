package com.aiportfolio.backend.infrastructure.web.dto.admin;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * 프로젝트 필터 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectFilter {

    private String searchQuery;
    private String isTeam; // all, team, individual
    private String projectType; // all, BUILD, LAB, MAINTENANCE
    private String status; // all, completed, in_progress, maintenance
    private List<String> selectedTechs;
    private String sortBy; // startDate, endDate, title, status, sortOrder, type
    private String sortOrder; // asc, desc
    private Integer page = 0;
    private Integer size = 20;

    public boolean isTeamFilter() {
        return "team".equals(isTeam);
    }

    public boolean isIndividualFilter() {
        return "individual".equals(isTeam);
    }

    public boolean hasSearchQuery() {
        return searchQuery != null && !searchQuery.trim().isEmpty();
    }

    public boolean hasTechFilter() {
        return selectedTechs != null && !selectedTechs.isEmpty();
    }

    public boolean isAllType() {
        return projectType == null || "all".equals(projectType);
    }

    public boolean isAllStatus() {
        return status == null || "all".equals(status);
    }
}
