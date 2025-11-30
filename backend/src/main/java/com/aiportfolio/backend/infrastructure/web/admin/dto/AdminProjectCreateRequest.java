package com.aiportfolio.backend.infrastructure.web.admin.dto;

import com.aiportfolio.backend.domain.admin.model.command.ProjectCreateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
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
    @Size(max = 200, message = "프로젝트 제목은 200자를 초과할 수 없습니다")
    private String title;

    @NotBlank(message = "프로젝트 설명은 필수입니다")
    @Size(max = 2000, message = "프로젝트 설명은 2000자를 초과할 수 없습니다")
    private String description;

    @Size(max = 10000, message = "README는 10000자를 초과할 수 없습니다")
    private String readme;

    @NotNull(message = "프로젝트 타입은 필수입니다")
    @Size(max = 50, message = "프로젝트 타입은 50자를 초과할 수 없습니다")
    private String type;

    @NotNull(message = "프로젝트 상태는 필수입니다")
    @Size(max = 50, message = "상태는 50자를 초과할 수 없습니다")
    private String status;

    private Boolean isTeam = Boolean.FALSE;

    private Integer teamSize;

    @Size(max = 255, message = "역할은 255자를 초과할 수 없습니다")
    private String role;

    private List<String> myContributions;

    @NotNull(message = "시작일은 필수입니다")
    private LocalDate startDate;

    private LocalDate endDate;

    @URL(message = "올바른 이미지 URL 형식이어야 합니다")
    private String imageUrl;

    private List<@URL(message = "올바른 스크린샷 URL 형식이어야 합니다") String> screenshots;

    @URL(message = "올바른 GitHub URL 형식이어야 합니다")
    private String githubUrl;

    @URL(message = "올바른 라이브 URL 형식이어야 합니다")
    private String liveUrl;

    @URL(message = "올바른 외부 URL 형식이어야 합니다")
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

