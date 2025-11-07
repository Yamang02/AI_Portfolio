package com.aiportfolio.backend.infrastructure.web.admin.dto;

import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 관리자 프로젝트 수정 HTTP 요청 DTO.
 */
@Getter
@Setter
@NoArgsConstructor
public class AdminProjectUpdateRequest {

    @Size(max = 255, message = "프로젝트 제목은 255자 이하여야 합니다")
    private String title;

    private String description;

    private String readme;

    private String type;

    private String status;

    private Boolean isTeam;

    private Integer teamSize;

    private String role;

    private List<String> myContributions;

    private LocalDate startDate;

    private LocalDate endDate;

    private String imageUrl;

    private List<String> screenshots;

    private String githubUrl;

    private String liveUrl;

    private String externalUrl;

    private List<String> technologies;

    private Integer sortOrder;

    public ProjectUpdateCommand toCommand() {
        return ProjectUpdateCommand.builder()
                .title(title)
                .description(description)
                .readme(readme)
                .type(type)
                .status(status)
                .isTeam(isTeam)
                .teamSize(teamSize)
                .role(role)
                .myContributions(myContributions)
                .startDate(startDate)
                .endDate(endDate)
                .imageUrl(imageUrl)
                .screenshots(screenshots)
                .githubUrl(githubUrl)
                .liveUrl(liveUrl)
                .externalUrl(externalUrl)
                .technologies(technologies)
                .sortOrder(sortOrder)
                .build();
    }
}

