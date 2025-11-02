package com.aiportfolio.backend.infrastructure.web.dto.experience;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Experience DTO (Data Transfer Object)
 *
 * 역할: REST API 요청/응답 데이터 전송
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("title")
    @NotBlank(message = "직책은 필수입니다")
    private String title;

    @JsonProperty("description")
    @NotBlank(message = "설명은 필수입니다")
    private String description;

    @JsonProperty("organization")
    @NotBlank(message = "조직명은 필수입니다")
    private String organization;

    @JsonProperty("role")
    @NotBlank(message = "역할은 필수입니다")
    private String role;

    @JsonProperty("startDate")
    private LocalDate startDate;

    @JsonProperty("endDate")
    private LocalDate endDate;

    @JsonProperty("type")
    private String type;

    @JsonProperty("technologies")
    private List<String> technologies;

    @JsonProperty("mainResponsibilities")
    private List<String> mainResponsibilities;

    @JsonProperty("achievements")
    private List<String> achievements;

    @JsonProperty("projects")
    private List<String> projects;

    @JsonProperty("sortOrder")
    private Integer sortOrder;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
