package com.aiportfolio.backend.infrastructure.web.dto.education;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Education DTO (Data Transfer Object)
 *
 * 역할: REST API 요청/응답 데이터 전송
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("title")
    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("organization")
    @NotBlank(message = "교육기관은 필수입니다")
    private String organization;

    @JsonProperty("degree")
    private String degree;

    @JsonProperty("major")
    private String major;

    @JsonProperty("startDate")
    private LocalDate startDate;

    @JsonProperty("endDate")
    private LocalDate endDate;

    @JsonProperty("gpa")
    private BigDecimal gpa;

    @JsonProperty("type")
    private String type;

    @JsonProperty("technologies")
    private List<String> technologies;

    @JsonProperty("projects")
    private List<String> projects;

    @JsonProperty("sortOrder")
    private Integer sortOrder;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
