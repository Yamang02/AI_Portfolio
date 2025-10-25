package com.aiportfolio.backend.domain.admin.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Comparator;
import com.aiportfolio.backend.domain.portfolio.model.Project;

/**
 * 프로젝트 필터 값 객체
 * 프로젝트 검색 및 필터링 조건을 나타내는 불변 객체
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
    @Builder.Default
    private Integer page = 0;
    
    @Builder.Default
    private Integer size = 20;

    /**
     * 팀 프로젝트 필터 여부 확인
     */
    public boolean isTeamFilter() {
        return "team".equals(isTeam);
    }

    /**
     * 개인 프로젝트 필터 여부 확인
     */
    public boolean isIndividualFilter() {
        return "individual".equals(isTeam);
    }

    /**
     * 검색 쿼리 존재 여부 확인
     */
    public boolean hasSearchQuery() {
        return searchQuery != null && !searchQuery.trim().isEmpty();
    }

    /**
     * 기술 스택 필터 존재 여부 확인
     */
    public boolean hasTechFilter() {
        return selectedTechs != null && !selectedTechs.isEmpty();
    }

    /**
     * 모든 타입 필터 여부 확인
     */
    public boolean isAllType() {
        return projectType == null || "all".equals(projectType);
    }

    /**
     * 모든 상태 필터 여부 확인
     */
    public boolean isAllStatus() {
        return status == null || "all".equals(status);
    }

    /**
     * 정렬 기준이 기본값인지 확인
     */
    public boolean isDefaultSort() {
        return sortBy == null || "sortOrder".equals(sortBy);
    }

    /**
     * 오름차순 정렬 여부 확인
     */
    public boolean isAscending() {
        return sortOrder == null || "asc".equals(sortOrder);
    }
    
    /**
     * 프로젝트가 필터 조건을 만족하는지 확인합니다.
     * 
     * @param project 확인할 프로젝트
     * @return 필터 조건 만족 여부
     */
    public boolean matches(Project project) {
        return matchesSearch(project) && 
               matchesTeamFilter(project) && 
               matchesTypeFilter(project) && 
               matchesStatusFilter(project) &&
               matchesTechFilter(project);
    }
    
    /**
     * 검색 쿼리 필터 매칭
     */
    private boolean matchesSearch(Project project) {
        if (!hasSearchQuery()) {
            return true;
        }
        
        String query = searchQuery.toLowerCase();
        return project.getTitle().toLowerCase().contains(query) ||
               (project.getDescription() != null && 
                project.getDescription().toLowerCase().contains(query));
    }
    
    /**
     * 팀/개인 프로젝트 필터 매칭
     */
    private boolean matchesTeamFilter(Project project) {
        if (isTeamFilter()) {
            return project.isTeam();
        }
        if (isIndividualFilter()) {
            return !project.isTeam();
        }
        return true;
    }
    
    /**
     * 프로젝트 타입 필터 매칭
     */
    private boolean matchesTypeFilter(Project project) {
        if (isAllType()) {
            return true;
        }
        return project.getType().equals(projectType);
    }
    
    /**
     * 프로젝트 상태 필터 매칭
     */
    private boolean matchesStatusFilter(Project project) {
        if (isAllStatus()) {
            return true;
        }
        return project.getStatus().toLowerCase().equals(status);
    }
    
    /**
     * 기술 스택 필터 매칭
     */
    private boolean matchesTechFilter(Project project) {
        if (!hasTechFilter()) {
            return true;
        }
        
        // TODO: 기술 스택 필터링 로직 구현
        // 현재는 기술 스택 정보가 Project 도메인에 없으므로 추후 구현
        return true;
    }
    
    /**
     * 정렬 기준을 위한 Comparator 생성
     */
    public Comparator<Object> getSortCriteria() {
        Comparator<Object> comparator = getComparator();
        return isAscending() ? comparator : comparator.reversed();
    }
    
    /**
     * 정렬 필드에 따른 Comparator 생성
     */
    private Comparator<Object> getComparator() {
        if (sortBy == null || "sortOrder".equals(sortBy)) {
            return Comparator.comparing(obj -> {
                try {
                    Object sortOrder = obj.getClass().getMethod("getSortOrder").invoke(obj);
                    return sortOrder != null ? (Integer) sortOrder : 0;
                } catch (Exception e) {
                    return 0;
                }
            });
        }
        
        switch (sortBy) {
                case "startDate":
                    return Comparator.comparing(obj -> {
                        try {
                            Object result = obj.getClass().getMethod("getStartDate").invoke(obj);
                            @SuppressWarnings("unchecked")
                            Comparable<Object> comparable = (Comparable<Object>) result;
                            return result != null ? comparable : null;
                        } catch (Exception e) {
                            return null;
                        }
                    }, Comparator.nullsLast(Comparator.naturalOrder()));
                case "endDate":
                    return Comparator.comparing(obj -> {
                        try {
                            Object result = obj.getClass().getMethod("getEndDate").invoke(obj);
                            @SuppressWarnings("unchecked")
                            Comparable<Object> comparable = (Comparable<Object>) result;
                            return result != null ? comparable : null;
                        } catch (Exception e) {
                            return null;
                        }
                    }, Comparator.nullsLast(Comparator.naturalOrder()));
            case "title":
                return Comparator.comparing(obj -> {
                    try {
                        return (String) obj.getClass().getMethod("getTitle").invoke(obj);
                    } catch (Exception e) {
                        return "";
                    }
                }, String.CASE_INSENSITIVE_ORDER);
            case "status":
                return Comparator.comparing(obj -> {
                    try {
                        return (String) obj.getClass().getMethod("getStatus").invoke(obj);
                    } catch (Exception e) {
                        return "";
                    }
                });
            case "type":
                return Comparator.comparing(obj -> {
                    try {
                        return (String) obj.getClass().getMethod("getType").invoke(obj);
                    } catch (Exception e) {
                        return "";
                    }
                });
            default:
                return Comparator.comparing(obj -> {
                    try {
                        Object sortOrder = obj.getClass().getMethod("getSortOrder").invoke(obj);
                        return sortOrder != null ? (Integer) sortOrder : 0;
                    } catch (Exception e) {
                        return 0;
                    }
                }); // 기본 정렬
        }
    }
}
