package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;
import com.aiportfolio.backend.domain.portfolio.port.in.GetEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.education.EducationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Education REST API Controller
 *
 * 책임: Education CRUD 엔드포인트 제공
 */
@RestController
@RequestMapping("/api/educations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class EducationController {

    private final GetEducationUseCase getEducationUseCase;
    private final ManageEducationUseCase manageEducationUseCase;

    // ==================== 조회 (Public) ====================

    /**
     * 전체 Education 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EducationDto>>> getAllEducations() {
        log.info("Fetching all educations");

        try {
            List<Education> educations = getEducationUseCase.getAllEducations();
            List<EducationDto> dtos = educations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching educations", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 목록 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * ID로 Education 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EducationDto>> getEducation(@PathVariable String id) {
        log.info("Fetching education by id: {}", id);

        try {
            Education education = getEducationUseCase.getEducationById(id)
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
     * 타입별 Education 조회
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<EducationDto>>> getEducationsByType(@PathVariable String type) {
        log.info("Fetching educations by type: {}", type);

        try {
            EducationType educationType = EducationType.valueOf(type.toUpperCase());
            List<Education> educations = getEducationUseCase.getEducationsByType(educationType);
            List<EducationDto> dtos = educations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid education type: " + type));
        } catch (Exception e) {
            log.error("Error fetching educations by type: {}", type, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 교육기관별 조회
     */
    @GetMapping("/organization/{organization}")
    public ResponseEntity<ApiResponse<List<EducationDto>>> getEducationsByOrganization(@PathVariable String organization) {
        log.info("Fetching educations by organization: {}", organization);

        try {
            List<Education> educations = getEducationUseCase.getEducationsByOrganization(organization);
            List<EducationDto> dtos = educations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching educations by organization: {}", organization, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("교육 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 진행중인 Education 조회
     */
    @GetMapping("/ongoing")
    public ResponseEntity<ApiResponse<List<EducationDto>>> getOngoingEducations() {
        log.info("Fetching ongoing educations");

        try {
            List<Education> educations = getEducationUseCase.getOngoingEducations();
            List<EducationDto> dtos = educations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching ongoing educations", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("진행중인 교육 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 검색
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EducationDto>>> searchEducations(@RequestParam String keyword) {
        log.info("Searching educations with keyword: {}", keyword);

        try {
            List<Education> educations = getEducationUseCase.searchEducations(keyword);
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

    // ==================== 관리 (Admin) ====================

    /**
     * Education 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EducationDto>> createEducation(@Valid @RequestBody EducationDto dto) {
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
            @Valid @RequestBody EducationDto dto) {
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
    public ResponseEntity<ApiResponse<Void>> deleteEducation(@PathVariable String id) {
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
    public ResponseEntity<ApiResponse<Void>> updateSortOrder(@RequestBody Map<String, Integer> sortOrderUpdates) {
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
            .technologies(education.getTechnologies())
            .projects(education.getProjects())
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
            .projects(dto.getProjects())
            .sortOrder(dto.getSortOrder())
            .createdAt(dto.getCreatedAt())
            .updatedAt(dto.getUpdatedAt())
            .build();
    }
}
