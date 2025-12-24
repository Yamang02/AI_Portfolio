package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.project.ProjectDataResponse;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 데이터 웹 컨트롤러 (헥사고날 아키텍처 Infrastructure/Web Layer)
 * Use Case와 Repository Port를 직접 사용하는 헥사고날 아키텍처 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/data")
@Tag(name = "Data", description = "포트폴리오 데이터 API")
public class DataController {
    
    private final GetProjectsUseCase getProjectsUseCase;
    private final GetAllDataUseCase getAllDataUseCase;
    private final ObjectMapper objectMapper;
    
    public DataController(
            @Qualifier("portfolioService") GetProjectsUseCase getProjectsUseCase,
            @Qualifier("portfolioApplicationService") GetAllDataUseCase getAllDataUseCase,
            ObjectMapper objectMapper) {
        this.getProjectsUseCase = getProjectsUseCase;
        this.getAllDataUseCase = getAllDataUseCase;
        this.objectMapper = objectMapper;
    }
    
    @GetMapping("/all")
    @Operation(summary = "모든 포트폴리오 데이터 조회", description = "프로젝트, 경험, 자격증 등 모든 포트폴리오 데이터를 조회합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllData() {
        Map<String, Object> allData = getAllDataUseCase.getAllPortfolioData();
        Map<String, Object> responseData = new java.util.HashMap<>(allData);

        Object projects = allData.get("projects");
        if (projects instanceof List<?> projectList) {
            List<ProjectDataResponse> mappedProjects = projectList.stream()
                .map(this::toProjectResponse)
                .collect(Collectors.toList());
            responseData.put("projects", mappedProjects);
        }

        return ResponseEntity.ok(ApiResponse.success(responseData, "포트폴리오 데이터 조회 성공"));
    }
    
    @GetMapping("/projects")
    @Operation(summary = "프로젝트 데이터 조회", description = "모든 프로젝트 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<ProjectDataResponse>>> getProjects() {
        List<ProjectDataResponse> projects = getProjectsUseCase.getAllProjects().stream()
            .map(this::toProjectResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(projects, "프로젝트 목록 조회 성공"));
    }
    
    @GetMapping("/experiences")
    @Operation(summary = "경험 데이터 조회", description = "모든 경험 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Experience>>> getExperiences() {
        List<Experience> experiences = getAllDataUseCase.getAllExperiences();
        return ResponseEntity.ok(ApiResponse.success(experiences, "경험 목록 조회 성공"));
    }
    
    @GetMapping("/certifications")
    @Operation(summary = "자격증 데이터 조회", description = "모든 자격증 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Certification>>> getCertifications() {
        List<Certification> certifications = getAllDataUseCase.getAllCertifications();
        return ResponseEntity.ok(ApiResponse.success(certifications, "자격증 목록 조회 성공"));
    }
    
    @GetMapping("/education")
    @Operation(summary = "교육 데이터 조회", description = "모든 교육 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Education>>> getEducation() {
        List<Education> education = getAllDataUseCase.getAllEducations();
        return ResponseEntity.ok(ApiResponse.success(education, "교육 목록 조회 성공"));
    }

    private ProjectDataResponse toProjectResponse(Object value) {
        if (value instanceof Project project) {
            return ProjectDataResponse.from(project);
        }

        Project project = objectMapper.convertValue(value, Project.class);
        return ProjectDataResponse.from(project);
    }
}
