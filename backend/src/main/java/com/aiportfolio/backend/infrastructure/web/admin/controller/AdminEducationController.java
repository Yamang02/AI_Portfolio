package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.application.admin.service.ManageEducationService;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;
import com.aiportfolio.backend.domain.portfolio.port.in.GetEducationUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.education.EducationCommandRequest;
import com.aiportfolio.backend.infrastructure.web.dto.education.EducationDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Collections;
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
public class AdminEducationController {

    private final GetEducationUseCase adminGetEducationUseCase;
    private final ManageEducationService manageEducationService;

    public AdminEducationController(
            @Qualifier("adminGetEducationService") GetEducationUseCase adminGetEducationUseCase,
            ManageEducationService manageEducationService) {
        this.adminGetEducationUseCase = adminGetEducationUseCase;
        this.manageEducationService = manageEducationService;
    }

    // ==================== 조회 ====================

    /**
     * 전체 Education 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EducationDto>>> getAllEducations() {
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
    public ResponseEntity<ApiResponse<EducationDto>> getEducation(@PathVariable String id) {
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
            @RequestParam String keyword) {
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
            @Valid @RequestBody EducationCommandRequest request) {
        log.info("Creating new education: {}", request.getTitle());

        try {
            Education created = manageEducationService.createEducationWithRelations(
                toEducationDomain(request),
                toTechStackRelations(request),
                toProjectRelations(request)
            );
            Education response = adminGetEducationUseCase.getEducationById(created.getId())
                .orElse(created);

            return ResponseEntity.ok(ApiResponse.success(
                convertToDto(response),
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
            @Valid @RequestBody EducationCommandRequest request) {
        log.info("Updating education: {}", id);

        try {
            Education updated = manageEducationService.updateEducationWithRelations(
                id,
                toEducationDomain(request),
                toTechStackRelations(request),
                toProjectRelations(request)
            );
            Education response = adminGetEducationUseCase.getEducationById(updated.getId())
                .orElse(updated);

            return ResponseEntity.ok(ApiResponse.success(
                convertToDto(response),
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
    public ResponseEntity<ApiResponse<Void>> deleteEducation(@PathVariable String id) {
        log.info("Deleting education: {}", id);

        try {
            manageEducationService.deleteEducation(id);
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
            @RequestBody Map<String, Integer> sortOrderUpdates) {
        log.info("Updating education sort orders: {} items", sortOrderUpdates.size());

        try {
            manageEducationService.updateEducationSortOrder(sortOrderUpdates);
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

    private Education toEducationDomain(EducationCommandRequest request) {
        return Education.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .organization(request.getOrganization())
            .degree(request.getDegree())
            .major(request.getMajor())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .gpa(request.getGpa())
            .type(parseType(request.getType()))
            .sortOrder(request.getSortOrder())
            .techStackMetadata(Collections.emptyList())
            .projects(Collections.emptyList())
            .build();
    }

    private EducationType parseType(String rawType) {
        try {
            return EducationType.valueOf(rawType.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("유효하지 않은 학력 타입입니다: " + rawType, ex);
        }
    }

    private List<ManageEducationService.TechStackRelation> toTechStackRelations(EducationCommandRequest request) {
        return request.safeTechStackRelationships().stream()
            .map(item -> new ManageEducationService.TechStackRelation(
                item.getTechStackId(),
                Boolean.TRUE.equals(item.getIsPrimary()),
                item.getUsageDescription()
            ))
            .collect(Collectors.toList());
    }

    private List<ManageEducationService.ProjectRelation> toProjectRelations(EducationCommandRequest request) {
        return request.safeProjectRelationships().stream()
            .map(item -> new ManageEducationService.ProjectRelation(
                item.getProjectBusinessId(),
                item.getProjectType(),
                item.getGrade()
            ))
            .collect(Collectors.toList());
    }
}

