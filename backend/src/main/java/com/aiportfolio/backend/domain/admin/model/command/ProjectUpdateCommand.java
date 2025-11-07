package com.aiportfolio.backend.domain.admin.model.command;

import com.aiportfolio.backend.domain.admin.dto.request.ProjectUpdateRequest;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

/**
 * 관리자 프로젝트 수정 요청을 표현하는 도메인 커맨드.
 */
@Getter
@Builder
public class ProjectUpdateCommand {

    private final String title;
    private final String description;
    private final String readme;
    private final String type;
    private final String status;
    private final Boolean isTeam;
    private final Integer teamSize;
    private final String role;
    private final List<String> myContributions;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String imageUrl;
    private final List<String> screenshots;
    private final String githubUrl;
    private final String liveUrl;
    private final String externalUrl;
    private final List<String> technologies;
    private final Integer sortOrder;

    public static ProjectUpdateCommand fromRequest(ProjectUpdateRequest request) {
        return ProjectUpdateCommand.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .readme(request.getReadme())
                .type(request.getType())
                .status(request.getStatus())
                .isTeam(request.getIsTeam())
                .teamSize(request.getTeamSize())
                .role(request.getRole())
                .myContributions(request.getMyContributions())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .imageUrl(request.getImageUrl())
                .screenshots(request.getScreenshots())
                .githubUrl(request.getGithubUrl())
                .liveUrl(request.getLiveUrl())
                .externalUrl(request.getExternalUrl())
                .technologies(request.getTechnologies())
                .sortOrder(request.getSortOrder())
                .build();
    }
}

