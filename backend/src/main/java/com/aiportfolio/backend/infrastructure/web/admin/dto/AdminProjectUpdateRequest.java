package com.aiportfolio.backend.infrastructure.web.admin.dto;

import com.aiportfolio.backend.domain.admin.dto.request.ProjectUpdateRequest;
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

    public ProjectUpdateRequest toDomainRequest() {
        ProjectUpdateRequest request = new ProjectUpdateRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setReadme(readme);
        request.setType(type);
        request.setStatus(status);
        request.setIsTeam(isTeam);
        request.setTeamSize(teamSize);
        request.setRole(role);
        request.setMyContributions(myContributions);
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setImageUrl(imageUrl);
        request.setScreenshots(screenshots);
        request.setGithubUrl(githubUrl);
        request.setLiveUrl(liveUrl);
        request.setExternalUrl(externalUrl);
        request.setTechnologies(technologies);
        request.setSortOrder(sortOrder);
        return request;
    }

    public ProjectUpdateCommand toCommand() {
        return toDomainRequest().toCommand();
    }
}

