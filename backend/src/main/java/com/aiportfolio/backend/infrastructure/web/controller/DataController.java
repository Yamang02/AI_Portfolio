package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    
    public DataController(
            @Qualifier("portfolioService") GetProjectsUseCase getProjectsUseCase,
            @Qualifier("portfolioApplicationService") GetAllDataUseCase getAllDataUseCase) {
        this.getProjectsUseCase = getProjectsUseCase;
        this.getAllDataUseCase = getAllDataUseCase;
    }
    
    @GetMapping("/all")
    @Operation(summary = "모든 포트폴리오 데이터 조회", description = "프로젝트, 경험, 자격증 등 모든 포트폴리오 데이터를 조회합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllData() {
        try {
            Map<String, Object> allData = getAllDataUseCase.getAllPortfolioData();
            
            return ResponseEntity.ok(ApiResponse.success(allData, "포트폴리오 데이터 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching all data", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 데이터 조회 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/projects")
    @Operation(summary = "프로젝트 데이터 조회", description = "모든 프로젝트 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Project>>> getProjects() {
        try {
            List<Project> projects = getProjectsUseCase.getAllProjects();
            return ResponseEntity.ok(ApiResponse.success(projects, "프로젝트 목록 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching projects", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("프로젝트 목록 조회 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/experiences")
    @Operation(summary = "경험 데이터 조회", description = "모든 경험 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Experience>>> getExperiences() {
        try {
            List<Experience> experiences = getAllDataUseCase.getAllExperiences();
            return ResponseEntity.ok(ApiResponse.success(experiences, "경험 목록 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching experiences", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("경험 목록 조회 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/certifications")
    @Operation(summary = "자격증 데이터 조회", description = "모든 자격증 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Certification>>> getCertifications() {
        try {
            List<Certification> certifications = getAllDataUseCase.getAllCertifications();
            return ResponseEntity.ok(ApiResponse.success(certifications, "자격증 목록 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching certifications", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("자격증 목록 조회 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/education")
    @Operation(summary = "교육 데이터 조회", description = "모든 교육 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Education>>> getEducation() {
        try {
            List<Education> education = getAllDataUseCase.getAllEducations();
            return ResponseEntity.ok(ApiResponse.success(education, "교육 목록 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching education", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("교육 목록 조회 실패", e.getMessage()));
        }
    }
}