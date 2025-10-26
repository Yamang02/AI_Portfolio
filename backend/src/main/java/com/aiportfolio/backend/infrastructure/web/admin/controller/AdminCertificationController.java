package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.port.in.GetCertificationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageCertificationUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.certification.CertificationDto;
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
 * Admin 전용 Certification REST API Controller
 *
 * 책임: Certification CRUD 엔드포인트 제공 (관리자 전용)
 * 특징: 캐시 없는 실시간 데이터 조회
 */
@RestController
@RequestMapping("/api/admin/certifications")
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AdminCertificationController {

    private final GetCertificationUseCase getCertificationUseCase;
    private final ManageCertificationUseCase manageCertificationUseCase;
    private final AdminAuthChecker adminAuthChecker;

    public AdminCertificationController(
            @Qualifier("getCertificationService") GetCertificationUseCase getCertificationUseCase,
            @Qualifier("manageCertificationService") ManageCertificationUseCase manageCertificationUseCase,
            AdminAuthChecker adminAuthChecker) {
        this.getCertificationUseCase = getCertificationUseCase;
        this.manageCertificationUseCase = manageCertificationUseCase;
        this.adminAuthChecker = adminAuthChecker;
    }

    // ==================== 조회 ====================

    /**
     * 전체 Certification 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CertificationDto>>> getAllCertifications(HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching all certifications (admin - no cache)");

        try {
            List<Certification> certifications = getCertificationUseCase.getAllCertificationsWithoutCache();
            log.info("Fetched {} certifications", certifications.size());

            List<CertificationDto> dtos = certifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching certifications - Exception type: {}, Message: {}", e.getClass().getName(), e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("자격증 목록 조회 중 오류가 발생했습니다: " + e.getClass().getSimpleName() + " - " + e.getMessage()));
        }
    }

    /**
     * ID로 Certification 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CertificationDto>> getCertification(@PathVariable String id, HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching certification by id: {}", id);

        try {
            Certification certification = getCertificationUseCase.getCertificationById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found: " + id));

            return ResponseEntity.ok(ApiResponse.success(convertToDto(certification)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching certification by id: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("자격증 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 카테고리별 Certification 조회
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<CertificationDto>>> getCertificationsByCategory(
            @PathVariable String category,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching certifications by category: {}", category);

        try {
            List<Certification> certifications = getCertificationUseCase.getCertificationsByCategory(category);
            List<CertificationDto> dtos = certifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching certifications by category: {}", category, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("카테고리별 자격증 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 만료된 Certification 조회
     */
    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<CertificationDto>>> getExpiredCertifications(HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching expired certifications");

        try {
            List<Certification> certifications = getCertificationUseCase.getExpiredCertifications();
            List<CertificationDto> dtos = certifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching expired certifications", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("만료된 자격증 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 곧 만료될 Certification 조회 (3개월 이내)
     */
    @GetMapping("/expiring-soon")
    public ResponseEntity<ApiResponse<List<CertificationDto>>> getExpiringSoonCertifications(HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Fetching expiring soon certifications");

        try {
            List<Certification> certifications = getCertificationUseCase.getExpiringSoonCertifications();
            List<CertificationDto> dtos = certifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching expiring soon certifications", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("곧 만료될 자격증 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // ==================== 관리 ====================

    /**
     * Certification 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CertificationDto>> createCertification(
            @Valid @RequestBody CertificationDto dto,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Creating new certification: {}", dto.getName());

        try {
            Certification certification = convertToDomain(dto);
            Certification created = manageCertificationUseCase.createCertification(certification);

            return ResponseEntity.ok(ApiResponse.success(
                convertToDto(created),
                "Certification 생성 성공"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating certification", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("자격증 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Certification 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CertificationDto>> updateCertification(
            @PathVariable String id,
            @Valid @RequestBody CertificationDto dto,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Updating certification: {}", id);

        try {
            Certification certification = convertToDomain(dto);
            Certification updated = manageCertificationUseCase.updateCertification(id, certification);

            return ResponseEntity.ok(ApiResponse.success(
                convertToDto(updated),
                "Certification 수정 성공"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating certification: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("자격증 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Certification 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCertification(@PathVariable String id, HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        log.info("Deleting certification: {}", id);

        try {
            manageCertificationUseCase.deleteCertification(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Certification 삭제 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting certification: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("자격증 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Certification 정렬 순서 일괄 업데이트
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

        log.info("Updating certification sort orders: {} items", sortOrderUpdates.size());

        try {
            manageCertificationUseCase.updateCertificationSortOrder(sortOrderUpdates);
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

    private CertificationDto convertToDto(Certification certification) {
        return CertificationDto.builder()
            .id(certification.getId())
            .name(certification.getName())
            .issuer(certification.getIssuer())
            .date(certification.getDate())
            .expiryDate(certification.getExpiryDate())
            .credentialId(certification.getCredentialId())
            .credentialUrl(certification.getCredentialUrl())
            .description(certification.getDescription())
            .category(certification.getCategory())
            .sortOrder(certification.getSortOrder())
            .createdAt(certification.getCreatedAt())
            .updatedAt(certification.getUpdatedAt())
            .build();
    }

    private Certification convertToDomain(CertificationDto dto) {
        return Certification.builder()
            .id(dto.getId())
            .name(dto.getName())
            .issuer(dto.getIssuer())
            .date(dto.getDate())
            .expiryDate(dto.getExpiryDate())
            .credentialId(dto.getCredentialId())
            .credentialUrl(dto.getCredentialUrl())
            .description(dto.getDescription())
            .category(dto.getCategory())
            .sortOrder(dto.getSortOrder())
            .createdAt(dto.getCreatedAt())
            .updatedAt(dto.getUpdatedAt())
            .build();
    }
}
