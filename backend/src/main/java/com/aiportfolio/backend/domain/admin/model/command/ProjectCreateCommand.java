package com.aiportfolio.backend.domain.admin.model.command;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

/**
 * 관리자 프로젝트 생성 요청을 표현하는 도메인 커맨드.
 */
@Getter
@Builder
public class ProjectCreateCommand {

    private final String title;
    private final String description;
    private final String readme;
    private final String type;
    private final String status;
    private final Boolean isTeam;
    private final Boolean isFeatured;
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
    private final List<Long> technologies;
    private final Integer sortOrder;

}

