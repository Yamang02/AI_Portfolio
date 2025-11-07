package com.aiportfolio.backend.domain.admin.dto.request;

import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;

/**
 * 프로젝트 수정 요청 DTO.
 * 기존 API와의 호환성을 위해 도메인 계층에 유지한다.
 */
@Data
public class ProjectUpdateRequest {

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

    /**
     * 커맨드 모델로의 변환을 제공한다.
     */
    public ProjectUpdateCommand toCommand() {
        return ProjectUpdateCommand.fromRequest(this);
    }
}
