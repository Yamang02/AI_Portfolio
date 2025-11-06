package com.aiportfolio.backend.application.admin.mapper;

import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 프로젝트 응답 매퍼
 * 도메인 객체를 응답 DTO로 변환하는 책임을 담당합니다.
 */
@Component
public class ProjectResponseMapper {
    
    /**
     * Project 도메인 객체를 ProjectResponse로 변환합니다.
     * 
     * @param project 변환할 프로젝트 도메인 객체
     * @return 변환된 프로젝트 응답 DTO
     */
    public ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .readme(project.getReadme())
                .type(project.getType())
                .status(project.getStatus())
                .isTeam(project.isTeam())
                .teamSize(project.getTeamSize())
                .role(project.getRole())
                .myContributions(project.getMyContributions())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .imageUrl(project.getImageUrl())
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .externalUrl(project.getExternalUrl())
                .sortOrder(project.getSortOrder())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
    
    /**
     * Project 도메인 객체 목록을 ProjectResponse 목록으로 변환합니다.
     * 
     * @param projects 변환할 프로젝트 도메인 객체 목록
     * @return 변환된 프로젝트 응답 DTO 목록
     */
    public List<ProjectResponse> toResponseList(List<Project> projects) {
        return projects.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Project 도메인 객체를 상세 정보가 포함된 ProjectResponse로 변환합니다.
     * 
     * @param project 변환할 프로젝트 도메인 객체
     * @return 상세 정보가 포함된 프로젝트 응답 DTO
     */
    public ProjectResponse toDetailedResponse(Project project) {
        // 기술 스택 매핑
        List<ProjectResponse.TechnologyResponse> technologies = project.getTechStackMetadata() != null ?
                project.getTechStackMetadata().stream()
                        .map(tech -> {
                            // level 문자열을 proficiencyLevel 숫자로 변환
                            Integer proficiencyLevel = null;
                            if (tech.getLevel() != null) {
                                switch (tech.getLevel().toLowerCase()) {
                                    case "expert":
                                        proficiencyLevel = 5;
                                        break;
                                    case "intermediate":
                                        proficiencyLevel = 3;
                                        break;
                                    case "beginner":
                                        proficiencyLevel = 1;
                                        break;
                                    default:
                                        proficiencyLevel = 1;
                                }
                            }
                            return ProjectResponse.TechnologyResponse.builder()
                                    .id(null) // TechStackMetadata에는 id가 없음
                                    .name(tech.getName())
                                    .category(tech.getCategory())
                                    .proficiencyLevel(proficiencyLevel)
                                    .build();
                        })
                        .collect(Collectors.toList()) :
                List.of();
        
        // 스크린샷 매핑 (String -> ProjectScreenshotResponse)
        List<ProjectResponse.ProjectScreenshotResponse> screenshots = project.getScreenshots() != null ?
                java.util.stream.IntStream.range(0, project.getScreenshots().size())
                        .mapToObj(index -> ProjectResponse.ProjectScreenshotResponse.builder()
                                .id((long) index)
                                .imageUrl(project.getScreenshots().get(index))
                                .displayOrder(index)
                                .build())
                        .collect(Collectors.toList()) :
                List.of();
        
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .readme(project.getReadme())
                .type(project.getType())
                .status(project.getStatus())
                .isTeam(project.isTeam())
                .teamSize(project.getTeamSize())
                .role(project.getRole())
                .myContributions(project.getMyContributions())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .imageUrl(project.getImageUrl())
                .screenshots(screenshots)
                .technologies(technologies)
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .externalUrl(project.getExternalUrl())
                .sortOrder(project.getSortOrder())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
