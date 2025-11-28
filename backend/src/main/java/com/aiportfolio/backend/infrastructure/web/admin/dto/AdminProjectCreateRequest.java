package com.aiportfolio.backend.infrastructure.web.admin.dto;

import com.aiportfolio.backend.domain.admin.model.command.ProjectCreateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 관리자 프로젝트 생성 HTTP 요청 DTO.
 */
@Getter
@Setter
@NoArgsConstructor
public class AdminProjectCreateRequest {

    @NotBlank(message = "프로젝트 제목은 필수입니다")
    @Size(max = 255, message = "프로젝트 제목은 255자 이하여야 합니다")
    private String title;

    @NotBlank(message = "프로젝트 설명은 필수입니다")
    private String description;

    private String readme;

    @NotNull(message = "프로젝트 타입은 필수입니다")
    private String type;

    @NotNull(message = "프로젝트 상태는 필수입니다")
    private String status;

    private Boolean isTeam = Boolean.FALSE;

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

    @NotNull(message = "기술 스택은 필수입니다")
    private List<Long> technologies;

    private Integer sortOrder = 0;

    public ProjectCreateCommand toCommand() {
        return ProjectCreateCommand.builder()
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

