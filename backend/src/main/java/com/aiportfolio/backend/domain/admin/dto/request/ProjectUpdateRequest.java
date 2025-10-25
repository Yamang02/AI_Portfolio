package com.aiportfolio.backend.domain.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 프로젝트 수정 요청 DTO
 * 도메인 계층에서 사용되는 프로젝트 수정 요청 데이터 전송 객체
 */
@Data
public class ProjectUpdateRequest {

    @NotBlank(message = "프로젝트 제목은 필수입니다")
    @Size(max = 255, message = "프로젝트 제목은 255자 이하여야 합니다")
    private String title;

    @NotBlank(message = "프로젝트 설명은 필수입니다")
    private String description;

    private String readme;

    private String type; // BUILD, LAB, MAINTENANCE

    private String status; // completed, in_progress, maintenance

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
}
