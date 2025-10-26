package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;
import com.aiportfolio.backend.domain.portfolio.port.in.GetEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.education.EducationDto;
import com.aiportfolio.backend.infrastructure.web.admin.util.AdminAuthChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin 전용 Education REST API Controller
 *
 * 책임: Education CRUD 엔드포인트 제공 (관리자 전용)
 * 특징: 캐시 없는 실시간 데이터 조회
 */
@RestController
@RequestMapping("/api/admin/educations")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AdminEducationController {

    private final GetEducationUseCase adminGetEducationUseCase;
    private final ManageEducationUseCase manageEducationUseCase;
    private final AdminAuthChecker adminAuthChecker;

    public AdminEducationController(
            @Qualifier("adminGetEducationService") GetEducationUseCase adminGetEducationUseCase,
            @Qualifier("manageEducationService") ManageEducationUseCase manageEducationUseCase,
            AdminAuthChecker adminAuthChecker) {
        this.adminGetEducationUseCase = adminGetEducationUseCase;
        this.manageEducationUseCase = manageEducationUseCase;
        this.adminAuthChecker = adminAuthChecker;
    }

    // ==================== 조회 ====================

    /**
     * 전체 Education 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EducationDto>>> getAllEducations(HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching all educations (admin - no cache)");

        try {
            List<Education> educations = adminGetEducationUseCase.getAllEducations();
            log.info("Fetched {} educations", educations.size());
            
            List<EducationDto> dtos = educations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching educations - Exception type: {}, Message: {}", e.getClass().getName(), e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 목록 조회 중 오류가 발생했습니다: " + e.getClass().getSimpleName() + " - " + e.getMessage()));
        }
    }

    /**
     * ID로 Education 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EducationDto>> getEducation(@PathVariable String id, HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching education by id: {}", id);

        try {
            Education education = adminGetEducationUseCase.getEducationById(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));

            return ResponseEntity.ok(ApiResponse.success(convertToDto(education)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching education by id: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 검색
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EducationDto>>> searchEducations(
            @RequestParam String keyword,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Searching educations with keyword: {}", keyword);

        try {
            List<Education> educations = adminGetEducationUseCase.searchEducations(keyword);
            List<EducationDto> dtos = educations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error searching educations with keyword: {}", keyword, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 검색 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // ==================== 관리 ====================

    /**
     * Education 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EducationDto>> createEducation(
            @Valid @RequestBody EducationDto dto,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Creating new education: {}", dto.getTitle());

        try {
            Education education = convertToDomain(dto);
            Education created = manageEducationUseCase.createEducation(education);

            return ResponseEntity.ok(ApiResponse.success(
                convertToDto(created),
                "Education 생성 성공"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating education", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Education 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EducationDto>> updateEducation(
            @PathVariable String id,
            @Valid @RequestBody EducationDto dto,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Updating education: {}", id);

        try {
            Education education = convertToDomain(dto);
            Education updated = manageEducationUseCase.updateEducation(id, education);

            return ResponseEntity.ok(ApiResponse.success(
                convertToDto(updated),
                "Education 수정 성공"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating education: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Education 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(@PathVariable String id, HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Deleting education: {}", id);

        try {
            manageEducationUseCase.deleteEducation(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Education 삭제 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting education: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Education 정렬 순서 일괄 업데이트
     */
    @PatchMapping("/sort-order")
    public ResponseEntity<ApiResponse<Void>> updateSortOrder(
            @RequestBody Map<String, Integer> sortOrderUpdates,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Updating education sort orders: {} items", sortOrderUpdates.size());

        try {
            manageEducationUseCase.updateEducationSortOrder(sortOrderUpdates);
            return ResponseEntity.ok(ApiResponse.success(null, "정렬 순서 업데이트 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating sort orders", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("정렬 순서 업데이트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // ==================== 변환 메서드 ====================

    private EducationDto convertToDto(Education education) {
        return EducationDto.builder()
            .id(education.getId())
            .title(education.getTitle())
            .description(education.getDescription())
            .organization(education.getOrganization())
            .degree(education.getDegree())
            .major(education.getMajor())
            .startDate(education.getStartDate())
            .endDate(education.getEndDate())
            .gpa(education.getGpa())
            .type(education.getType() != null ? education.getType().name() : null)
            .technologies(education.getTechnologies() != null ? education.getTechnologies() : new java.util.ArrayList<>())
            .projects(new java.util.ArrayList<>()) // 릴레이션 테이블로 분리됨
            .sortOrder(education.getSortOrder())
            .createdAt(education.getCreatedAt())
            .updatedAt(education.getUpdatedAt())
            .build();
    }

    private Education convertToDomain(EducationDto dto) {
        return Education.builder()
            .id(dto.getId())
            .title(dto.getTitle())
            .description(dto.getDescription())
            .organization(dto.getOrganization())
            .degree(dto.getDegree())
            .major(dto.getMajor())
            .startDate(dto.getStartDate())
            .endDate(dto.getEndDate())
            .gpa(dto.getGpa())
            .type(dto.getType() != null ? EducationType.valueOf(dto.getType()) : null)
            .projects(new java.util.ArrayList<>()) // 릴레이션 테이블로 분리됨
            .sortOrder(dto.getSortOrder())
            .createdAt(dto.getCreatedAt())
            .updatedAt(dto.getUpdatedAt())
            // technologies는 techStackMetadata로 변환되는데, 이는 별도 로직이 필요하므로 
            // 여기서는 null로 설정 (저장 시 별도 처리)
            .techStackMetadata(null)
            .build();
    }
}

