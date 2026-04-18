package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.portfolio.port.out.EducationRelationshipPort;
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
 * Admin Education 관계 관리 REST API Controller
 * 
 * 책임: Education-기술스택, Education-프로젝트 관계 CRUD
 */
@RestController
@RequestMapping("/api/admin/educations/{id}")
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminEducationRelationshipController {
    private static final String EDUCATION_NOT_FOUND = "Education not found";
    private static final String EDUCATION_NOT_FOUND_WITH_ID = "Education not found: ";
    private static final String INVALID_REQUEST_LOG = "Invalid request: {}";

    private final EducationJpaRepository educationJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;
    private final EducationTechStackJpaRepository educationTechStackJpaRepository;
    private final EducationProjectJpaRepository educationProjectJpaRepository;
    private final EducationRelationshipPort educationRelationshipPort;

    // ==================== 기술스택 관계 ====================

    @GetMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<List<TechStackRelationshipDto>>> getTechStackRelationships(
            @PathVariable String id) {
        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EDUCATION_NOT_FOUND_WITH_ID + id));

            List<EducationTechStackJpaEntity> relationships = 
                educationTechStackJpaRepository.findByEducationId(education.getId());

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

    @PostMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<Void>> addTechStackRelationship(
            @PathVariable String id,
            @RequestBody TechStackRelationshipRequest request) {
        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EDUCATION_NOT_FOUND));

            // ID로 조회, 없으면 name으로 조회 (하위 호환성)
            Optional<TechStackMetadataJpaEntity> techStackOpt = techStackMetadataJpaRepository
                .findById(request.getTechStackId());
            TechStackMetadataJpaEntity techStack = techStackOpt.orElseGet(() ->
                    techStackMetadataJpaRepository
                            .findByName(String.valueOf(request.getTechStackId()))
                            .orElseThrow(() -> new IllegalArgumentException("TechStack not found")));

            if (educationTechStackJpaRepository
                .findByEducationIdAndTechStackId(education.getId(), techStack.getId()) != null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AdminApiErrorMessages.RELATION_ALREADY_EXISTS));
            }

            EducationTechStackJpaEntity relationship = EducationTechStackJpaEntity.builder()
                .education(education)
                .techStack(techStack)
                .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
                .usageDescription(request.getUsageDescription())
                .build();

            educationTechStackJpaRepository.save(relationship);

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.TECH_STACK_RELATION_ADD_SUCCESS));
        } catch (Exception e) {
            log.error("Error adding tech stack relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.techStackRelationAddFailed(e)));
        }
    }

    @DeleteMapping("/tech-stacks/{techStackId}")
    public ResponseEntity<ApiResponse<Void>> deleteTechStackRelationship(
            @PathVariable String id,
            @PathVariable Long techStackId) {
        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EDUCATION_NOT_FOUND));

            educationTechStackJpaRepository.deleteByEducationIdAndTechStackId(
                education.getId(), techStackId);

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
            List<EducationRelationshipPort.TechStackRelation> relationships = items.stream()
                    .map(item -> new EducationRelationshipPort.TechStackRelation(
                            item.getTechStackId(),
                            Boolean.TRUE.equals(item.getIsPrimary()),
                            item.getUsageDescription()))
                    .toList();

            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EDUCATION_NOT_FOUND_WITH_ID + id));
            educationRelationshipPort.replaceTechStacks(education.getId(), relationships);

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

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectRelationshipDto>>> getProjectRelationships(
            @PathVariable String id) {
        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EDUCATION_NOT_FOUND_WITH_ID + id));

            List<EducationProjectJpaEntity> relationships = 
                educationProjectJpaRepository.findByEducationId(education.getId());

            List<ProjectRelationshipDto> dtos = relationships.stream()
                .map(rel -> ProjectRelationshipDto.builder()
                    .id(rel.getId())
                    .projectId(rel.getProject().getId())  // DB ID (삭제 시 사용)
                    .projectBusinessId(rel.getProject().getBusinessId())  // Business ID (외부 API)
                    .projectTitle(rel.getProject().getTitle())
                    .projectType(rel.getProjectType())
                    .grade(rel.getGrade())
                    .build())
                .toList();

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching project relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.projectRelationQueryFailed(e)));
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<Void>> addProjectRelationship(
            @PathVariable String id,
            @RequestBody ProjectRelationshipRequest request) {
        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EDUCATION_NOT_FOUND));

            if (educationRelationshipPort.hasProjectRelationship(education.getId(), request.getProjectBusinessId())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(AdminApiErrorMessages.RELATION_ALREADY_EXISTS));
            }

            educationRelationshipPort.addProjectRelationship(
                    education.getId(),
                    request.getProjectBusinessId(),
                    request.getProjectType(),
                    request.getGrade());

            log.info("Added project relationship: education={}, project={}", id, request.getProjectBusinessId());
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

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProjectRelationship(
            @PathVariable String id,
            @PathVariable Long projectId) {
        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EDUCATION_NOT_FOUND));

            educationProjectJpaRepository.deleteByEducationIdAndProjectId(
                education.getId(), projectId);

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.PROJECT_RELATION_DELETE_SUCCESS));
        } catch (Exception e) {
            log.error("Error deleting project relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(AdminApiErrorMessages.projectRelationDeleteFailed(e)));
        }
    }

    /**
     * 프로젝트 관계 일괄 업데이트 (원자적 트랜잭션 보장)
     * 
     * 기존 관계 전체 삭제 후 새 관계 생성
     * 하나라도 실패하면 전체 롤백
     */
    @PutMapping("/projects")
    public ResponseEntity<ApiResponse<Void>> updateProjectRelationships(
            @PathVariable String id,
            @RequestBody BulkProjectRelationshipRequest request) {
        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException(EDUCATION_NOT_FOUND_WITH_ID + id));

            List<EducationRelationshipPort.EducationProjectBulkItem> projectInputs =
                    (request.getProjectRelationships() == null || request.getProjectRelationships().isEmpty())
                            ? Collections.emptyList()
                            : request.getProjectRelationships().stream()
                                    .map(item -> new EducationRelationshipPort.EducationProjectBulkItem(
                                            item.getProjectBusinessId(),
                                            item.getProjectType(),
                                            item.getGrade()))
                                    .toList();

            educationRelationshipPort.replaceProjectsFromBusinessIds(education.getId(), projectInputs);

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

