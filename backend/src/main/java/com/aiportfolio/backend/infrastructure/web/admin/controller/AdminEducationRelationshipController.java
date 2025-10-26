package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.*;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.relationship.*;
import com.aiportfolio.backend.infrastructure.web.admin.util.AdminAuthChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AdminEducationRelationshipController {

    private final AdminAuthChecker adminAuthChecker;
    private final EducationJpaRepository educationJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;
    private final EducationTechStackJpaRepository educationTechStackJpaRepository;
    private final EducationProjectJpaRepository educationProjectJpaRepository;

    // ==================== 기술스택 관계 ====================

    @GetMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<List<TechStackRelationshipDto>>> getTechStackRelationships(
            @PathVariable String id,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));

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
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching tech stack relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("기술스택 관계 조회 실패: " + e.getMessage()));
        }
    }

    @PostMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<Void>> addTechStackRelationship(
            @PathVariable String id,
            @RequestBody TechStackRelationshipRequest request,
            HttpServletRequest httpRequest) {
        try {
            adminAuthChecker.requireAuthentication(httpRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found"));

            TechStackMetadataJpaEntity techStack;
            // ID로 조회
            Optional<TechStackMetadataJpaEntity> techStackOpt = techStackMetadataJpaRepository
                .findById(request.getTechStackId());
            
            if (techStackOpt.isPresent()) {
                techStack = techStackOpt.get();
            } else {
                // ID로 못 찾으면 name으로 조회 (하위 호환성)
                techStack = techStackMetadataJpaRepository
                    .findByName(String.valueOf(request.getTechStackId()))
                    .orElseThrow(() -> new IllegalArgumentException("TechStack not found"));
            }

            if (educationTechStackJpaRepository
                .findByEducationIdAndTechStackId(education.getId(), techStack.getId()) != null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("이미 관계가 존재합니다"));
            }

            EducationTechStackJpaEntity relationship = EducationTechStackJpaEntity.builder()
                .education(education)
                .techStack(techStack)
                .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
                .usageDescription(request.getUsageDescription())
                .build();

            educationTechStackJpaRepository.save(relationship);

            return ResponseEntity.ok(ApiResponse.success(null, "기술스택 관계 추가 성공"));
        } catch (Exception e) {
            log.error("Error adding tech stack relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("기술스택 관계 추가 실패: " + e.getMessage()));
        }
    }

    @DeleteMapping("/tech-stacks/{techStackId}")
    public ResponseEntity<ApiResponse<Void>> deleteTechStackRelationship(
            @PathVariable String id,
            @PathVariable Long techStackId,
            HttpServletRequest httpRequest) {
        try {
            adminAuthChecker.requireAuthentication(httpRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found"));

            educationTechStackJpaRepository.deleteByEducationIdAndTechStackId(
                education.getId(), techStackId);

            return ResponseEntity.ok(ApiResponse.success(null, "기술스택 관계 삭제 성공"));
        } catch (Exception e) {
            log.error("Error deleting tech stack relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("기술스택 관계 삭제 실패: " + e.getMessage()));
        }
    }

    // ==================== 프로젝트 관계 ====================

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectRelationshipDto>>> getProjectRelationships(
            @PathVariable String id,
            HttpServletRequest request) {
        try {
            adminAuthChecker.requireAuthentication(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));

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
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching project relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("프로젝트 관계 조회 실패: " + e.getMessage()));
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<Void>> addProjectRelationship(
            @PathVariable String id,
            @RequestBody ProjectRelationshipRequest request,
            HttpServletRequest httpRequest) {
        try {
            adminAuthChecker.requireAuthentication(httpRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found"));

            // Business ID로 프로젝트 조회
            ProjectJpaEntity project = projectJpaRepository.findByBusinessId(request.getProjectBusinessId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + request.getProjectBusinessId()));

            if (educationProjectJpaRepository
                .findByEducationIdAndProjectId(education.getId(), project.getId()) != null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("이미 관계가 존재합니다"));
            }

            EducationProjectJpaEntity relationship = EducationProjectJpaEntity.builder()
                .education(education)
                .project(project)
                .projectType(request.getProjectType())
                .grade(request.getGrade())
                .build();

            educationProjectJpaRepository.save(relationship);

            log.info("Added project relationship: education={}, project={}", id, request.getProjectBusinessId());
            return ResponseEntity.ok(ApiResponse.success(null, "프로젝트 관계 추가 성공"));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error adding project relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("프로젝트 관계 추가 실패: " + e.getMessage()));
        }
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProjectRelationship(
            @PathVariable String id,
            @PathVariable Long projectId,
            HttpServletRequest httpRequest) {
        try {
            adminAuthChecker.requireAuthentication(httpRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 필요"));
        }

        try {
            EducationJpaEntity education = educationJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found"));

            educationProjectJpaRepository.deleteByEducationIdAndProjectId(
                education.getId(), projectId);

            return ResponseEntity.ok(ApiResponse.success(null, "프로젝트 관계 삭제 성공"));
        } catch (Exception e) {
            log.error("Error deleting project relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("프로젝트 관계 삭제 실패: " + e.getMessage()));
        }
    }
}

