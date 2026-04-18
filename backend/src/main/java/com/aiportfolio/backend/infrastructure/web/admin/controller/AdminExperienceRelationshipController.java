package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.portfolio.port.out.ExperienceRelationshipPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.*;
import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.admin.AdminApiErrorMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.relationship.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Admin Experience 관계 관리 REST API Controller
 * 
 * 책임: Experience-기술스택, Experience-프로젝트 관계 CRUD
 */
@RestController
@RequestMapping("/api/admin/experiences/{id}")
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminExperienceRelationshipController {
    private static final String EXPERIENCE_NOT_FOUND = "Experience not found";
    private static final String EXPERIENCE_NOT_FOUND_WITH_ID = "Experience not found: ";
    private static final String INVALID_REQUEST_LOG = "Invalid request: {}";

    private final ExperienceJpaRepository experienceJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;
    private final ExperienceTechStackJpaRepository experienceTechStackJpaRepository;
    private final ExperienceProjectJpaRepository experienceProjectJpaRepository;
    private final ExperienceRelationshipPort experienceRelationshipPort;

    // ==================== 기술스택 관계 ====================

    /**
     * 기술스택 관계 조회
     */
    @GetMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<List<TechStackRelationshipDto>>> getTechStackRelationships(
            @PathVariable String id) {
        try {
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EXPERIENCE_NOT_FOUND_WITH_ID + id));

            log.info("Fetching relationships for experience: businessId={}, dbId={}", id, experience.getId());
            
            List<ExperienceTechStackJpaEntity> relationships = 
                experienceTechStackJpaRepository.findByExperienceId(experience.getId());
            
            log.info("Found {} tech stack relationships", relationships.size());

            List<TechStackRelationshipDto> dtos = relationships.stream()
                .map(rel -> TechStackRelationshipDto.builder()
                    .id(rel.getId())
                    .techStackId(rel.getTechStack().getId())
                    .techStackName(rel.getTechStack().getName())
                    .techStackDisplayName(rel.getTechStack().getDisplayName())
                    .category(rel.getTechStack().getCategory())
                    .isPrimary(rel.getIsPrimary())
                    .usageDescription(rel.getUsageDescription())
                    .build())
                .toList();

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching tech stack relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationQueryFailed(e)));
        }
    }

    /**
     * 기술스택 관계 추가
     */
    @PostMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<Void>> addTechStackRelationship(
            @PathVariable String id,
            @RequestBody TechStackRelationshipRequest request) {
        try {
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EXPERIENCE_NOT_FOUND));

            // ID로 조회, 없으면 name으로 조회 (하위 호환성)
            Optional<TechStackMetadataJpaEntity> techStackOpt = techStackMetadataJpaRepository
                .findById(request.getTechStackId());
            TechStackMetadataJpaEntity techStack = techStackOpt.orElseGet(() ->
                    techStackMetadataJpaRepository
                            .findByName(String.valueOf(request.getTechStackId()))
                            .orElseThrow(() -> new IllegalArgumentException("TechStack not found")));

            // 중복 체크
            if (experienceTechStackJpaRepository
                .findByExperienceIdAndTechStackId(experience.getId(), techStack.getId()) != null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AdminApiErrorMessages.RELATION_ALREADY_EXISTS));
            }

            ExperienceTechStackJpaEntity relationship = ExperienceTechStackJpaEntity.builder()
                .experience(experience)
                .techStack(techStack)
                .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
                .usageDescription(request.getUsageDescription())
                .build();

            experienceTechStackJpaRepository.save(relationship);

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.TECH_STACK_RELATION_ADD_SUCCESS));
        } catch (Exception e) {
            log.error("Error adding tech stack relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationAddFailed(e)));
        }
    }

    /**
     * 기술스택 관계 삭제
     */
    @DeleteMapping("/tech-stacks/{techStackId}")
    public ResponseEntity<ApiResponse<Void>> deleteTechStackRelationship(
            @PathVariable String id,
            @PathVariable Long techStackId) {
        try {
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EXPERIENCE_NOT_FOUND));

            experienceTechStackJpaRepository.deleteByExperienceIdAndTechStackId(
                experience.getId(), techStackId);

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.TECH_STACK_RELATION_DELETE_SUCCESS));
        } catch (Exception e) {
            log.error("Error deleting tech stack relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationDeleteFailed(e)));
        }
    }

    /**
     * 기술스택 관계 일괄 업데이트 (원자적 트랜잭션 보장)
     *
     * 기존 관계 전체 삭제 후 새 관계 생성
     * 하나라도 실패하면 전체 롤백
     */
    @PutMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<Void>> updateTechStackRelationships(
            @PathVariable String id,
            @RequestBody BulkTechStackRelationshipRequest request) {
        try {
            List<BulkTechStackRelationshipRequest.TechStackRelationshipItem> items =
                    request.getTechStackRelationships() != null
                            ? request.getTechStackRelationships()
                            : List.of();
            List<ExperienceRelationshipPort.TechStackRelation> relationships = items.stream()
                    .map(item -> new ExperienceRelationshipPort.TechStackRelation(
                            item.getTechStackId(),
                            Boolean.TRUE.equals(item.getIsPrimary()),
                            item.getUsageDescription()))
                    .toList();

            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EXPERIENCE_NOT_FOUND_WITH_ID + id));
            experienceRelationshipPort.replaceTechStacks(experience.getId(), relationships);

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.TECH_STACK_RELATION_BULK_UPDATE_SUCCESS));
        } catch (IllegalArgumentException e) {
            log.error(INVALID_REQUEST_LOG, e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating tech stack relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationBulkUpdateFailed(e)));
        }
    }

    // ==================== 프로젝트 관계 ====================

    /**
     * 프로젝트 관계 조회
     */
    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectRelationshipDto>>> getProjectRelationships(
            @PathVariable String id) {
        log.info("GET /api/admin/experiences/{}/projects - businessId: {}", id, id);
        
        try {
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EXPERIENCE_NOT_FOUND_WITH_ID + id));
            
            log.info("Found experience: id={}, dbId={}", experience.getBusinessId(), experience.getId());

            List<ExperienceProjectJpaEntity> relationships = 
                experienceProjectJpaRepository.findByExperienceId(experience.getId());
            
            log.info("Found {} relationship entities for experience dbId={}", relationships.size(), experience.getId());

            List<ProjectRelationshipDto> dtos = relationships.stream()
                .map(rel -> ProjectRelationshipDto.builder()
                    .id(rel.getId())
                    .projectId(rel.getProject().getId())  // DB ID (삭제 시 사용)
                    .projectBusinessId(rel.getProject().getBusinessId())  // Business ID (외부 API)
                    .projectTitle(rel.getProject().getTitle())
                    .roleInProject(rel.getRoleInProject())
                    .contributionDescription(rel.getContributionDescription())
                    .build())
                .toList();
            
            log.info("Found {} project relationships for experience {}", dtos.size(), id);

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching project relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.projectRelationQueryFailed(e)));
        }
    }

    /**
     * 프로젝트 관계 추가
     */
    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<Void>> addProjectRelationship(
            @PathVariable String id,
            @RequestBody ProjectRelationshipRequest request) {
        try {
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EXPERIENCE_NOT_FOUND));

            if (experienceRelationshipPort.hasProjectRelationship(
                    experience.getId(), request.getProjectBusinessId())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AdminApiErrorMessages.RELATION_ALREADY_EXISTS));
            }

            experienceRelationshipPort.addProjectRelationship(
                    experience.getId(),
                    request.getProjectBusinessId(),
                    request.getRoleInProject(),
                    request.getContributionDescription());

            log.info("Added project relationship: experience={}, project={}", id, request.getProjectBusinessId());
            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.PROJECT_RELATION_ADD_SUCCESS));
        } catch (IllegalArgumentException e) {
            log.error(INVALID_REQUEST_LOG, e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error adding project relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.projectRelationAddFailed(e)));
        }
    }

    /**
     * 프로젝트 관계 삭제
     */
    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProjectRelationship(
            @PathVariable String id,
            @PathVariable Long projectId) {
        try {
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EXPERIENCE_NOT_FOUND));

            experienceProjectJpaRepository.deleteByExperienceIdAndProjectId(
                experience.getId(), projectId);

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.PROJECT_RELATION_DELETE_SUCCESS));
        } catch (Exception e) {
            log.error("Error deleting project relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.projectRelationDeleteFailed(e)));
        }
    }

    /**
     * 프로젝트 관계 일괄 업데이트 (Merge 전략 사용)
     * 
     * 기존 관계와 요청된 관계를 비교하여
     * 삭제할 것만 삭제하고 추가할 것만 추가합니다.
     * 하나라도 실패하면 전체 롤백
     */
    @PutMapping("/projects")
    public ResponseEntity<ApiResponse<Void>> updateProjectRelationships(
            @PathVariable String id,
            @RequestBody BulkProjectRelationshipRequest request) {
        try {
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EXPERIENCE_NOT_FOUND_WITH_ID + id));
            
            List<ExperienceRelationshipPort.ExperienceProjectBulkItem> projectInputs =
                    (request.getProjectRelationships() == null || request.getProjectRelationships().isEmpty())
                            ? Collections.emptyList()
                            : request.getProjectRelationships().stream()
                                    .map(item -> new ExperienceRelationshipPort.ExperienceProjectBulkItem(
                                            item.getProjectBusinessId(),
                                            item.getRoleInProject(),
                                            item.getContributionDescription()))
                                    .toList();

            experienceRelationshipPort.replaceProjectsFromBusinessIds(experience.getId(), projectInputs);
            
            log.info("Updated project relationships for experience: {} (using merge strategy)", id);
            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.PROJECT_RELATION_BULK_UPDATE_SUCCESS));
        } catch (IllegalArgumentException e) {
            log.error(INVALID_REQUEST_LOG, e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating project relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.projectRelationBulkUpdateFailed(e)));
        }
    }
}

