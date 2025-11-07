package com.aiportfolio.backend.domain.admin.dto.request;

import com.aiportfolio.backend.domain.admin.model.command.ProjectCreateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;

/**
 * 프로젝트 생성 요청 DTO.
 * 도메인 계층에서 사용되는 데이터를 보존하여 기존 코드와의 호환성을 유지한다.
 */
@Data
public class ProjectCreateRequest {

    @NotBlank(message = "프로젝트 제목은 필수입니다")
    @Size(max = 255, message = "프로젝트 제목은 255자 이하여야 합니다")
    private String title;

    @NotBlank(message = "프로젝트 설명은 필수입니다")
    private String description;

    private String readme;

    @NotNull(message = "프로젝트 타입은 필수입니다")
    private String type; // BUILD, LAB, MAINTENANCE

    @NotNull(message = "프로젝트 상태는 필수입니다")
    private String status; // completed, in_progress, maintenance

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
    private List<String> technologies;

    private Integer sortOrder = 0;

    /**
     * 새롭게 도입된 커맨드 모델로 변환한다.
     */
    public ProjectCreateCommand toCommand() {
        return ProjectCreateCommand.fromRequest(this);
    }
}
