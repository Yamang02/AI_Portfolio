package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.enums.ExperienceType;
import com.aiportfolio.backend.domain.portfolio.port.in.GetExperienceUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageExperienceUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.experience.ExperienceDto;
import com.aiportfolio.backend.infrastructure.web.admin.util.AdminAuthChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Experience REST API Controller (Admin)
 *
 * 책임: Experience CRUD 엔드포인트 제공 (관리자 전용)
 */
@RestController
@RequestMapping("/api/admin/experiences")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AdminExperienceController {

    private final GetExperienceUseCase getExperienceUseCase;
    private final ManageExperienceUseCase manageExperienceUseCase;
    private final AdminAuthChecker adminAuthChecker;

    // ==================== 조회 ====================

    /**
     * 전체 Experience 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExperienceDto>>> getAllExperiences(HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching all experiences");

        try {
            List<Experience> experiences = getExperienceUseCase.getAllExperiences();
            log.info("Fetched {} experiences", experiences.size());
            
            List<ExperienceDto> dtos = experiences.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching experiences - Exception type: {}, Message: {}", e.getClass().getName(), e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("경력 목록 조회 중 오류가 발생했습니다: " + e.getClass().getSimpleName() + " - " + e.getMessage()));
        }
    }

    /**
     * ID로 Experience 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExperienceDto>> getExperience(
            @PathVariable String id,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching experience by id: {}", id);

        try {
            Experience experience = getExperienceUseCase.getExperienceById(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found: " + id));

            return ResponseEntity.ok(ApiResponse.success(convertToDto(experience)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching experience by id: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("경력 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 검색
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ExperienceDto>>> searchExperiences(
            @RequestParam String keyword,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Searching experiences with keyword: {}", keyword);

        try {
            List<Experience> experiences = getExperienceUseCase.searchExperiences(keyword);
            List<ExperienceDto> dtos = experiences.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error searching experiences with keyword: {}", keyword, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("경력 검색 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // ==================== 관리 ====================

    /**
     * Experience 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExperienceDto>> createExperience(
            @Valid @RequestBody ExperienceDto dto,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Creating new experience: {}", dto.getTitle());

        try {
            Experience experience = convertToDomain(dto);
            Experience created = manageExperienceUseCase.createExperience(experience);

            return ResponseEntity.ok(ApiResponse.success(
                convertToDto(created),
                "Experience 생성 성공"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating experience", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("경력 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Experience 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExperienceDto>> updateExperience(
            @PathVariable String id,
            @Valid @RequestBody ExperienceDto dto,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Updating experience: {}", id);

        try {
            Experience experience = convertToDomain(dto);
            Experience updated = manageExperienceUseCase.updateExperience(id, experience);

            return ResponseEntity.ok(ApiResponse.success(
                convertToDto(updated),
                "Experience 수정 성공"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating experience: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("경력 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Experience 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(
            @PathVariable String id,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Deleting experience: {}", id);

        try {
            manageExperienceUseCase.deleteExperience(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Experience 삭제 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting experience: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("경력 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Experience 정렬 순서 일괄 업데이트
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

        log.info("Updating experience sort orders: {} items", sortOrderUpdates.size());

        try {
            manageExperienceUseCase.updateExperienceSortOrder(sortOrderUpdates);
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

    private ExperienceDto convertToDto(Experience experience) {
        return ExperienceDto.builder()
            .id(experience.getId())
            .title(experience.getTitle())
            .description(experience.getDescription())
            .organization(experience.getOrganization())
            .role(experience.getRole())
            .startDate(experience.getStartDate())
            .endDate(experience.getEndDate())
            .type(experience.getType() != null ? experience.getType().name() : null)
            .technologies(experience.getTechnologies() != null ? experience.getTechnologies() : new java.util.ArrayList<>())
            .mainResponsibilities(experience.getMainResponsibilities())
            .achievements(experience.getAchievements())
            .projects(experience.getProjects())
            .sortOrder(experience.getSortOrder())
            .createdAt(experience.getCreatedAt())
            .updatedAt(experience.getUpdatedAt())
            .build();
    }

    private Experience convertToDomain(ExperienceDto dto) {
        return Experience.builder()
            .id(dto.getId())
            .title(dto.getTitle())
            .description(dto.getDescription())
            .organization(dto.getOrganization())
            .role(dto.getRole())
            .startDate(dto.getStartDate())
            .endDate(dto.getEndDate())
            .type(dto.getType() != null ? ExperienceType.valueOf(dto.getType()) : null)
            .mainResponsibilities(dto.getMainResponsibilities())
            .achievements(dto.getAchievements())
            .projects(dto.getProjects())
            .sortOrder(dto.getSortOrder())
            .createdAt(dto.getCreatedAt())
            .updatedAt(dto.getUpdatedAt())
            // technologies는 techStackMetadata로 변환되는데, 이는 별도 로직이 필요하므로 
            // 여기서는 null로 설정 (저장 시 별도 처리)
            .techStackMetadata(null)
            .build();
    }
}

