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
 * Admin Experience 관계 관리 REST API Controller
 * 
 * 책임: Experience-기술스택, Experience-프로젝트 관계 CRUD
 */
@RestController
@RequestMapping("/api/admin/experiences/{id}")
@RequiredArgsConstructor
@Slf4j
@Transactional
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AdminExperienceRelationshipController {

    private final AdminAuthChecker adminAuthChecker;
    private final ExperienceJpaRepository experienceJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;
    private final ExperienceTechStackJpaRepository experienceTechStackJpaRepository;
    private final ExperienceProjectJpaRepository experienceProjectJpaRepository;

    // ==================== 기술스택 관계 ====================

    /**
     * 기술스택 관계 조회
     */
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
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found: " + id));

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

    /**
     * 기술스택 관계 추가
     */
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
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found"));

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

            // 중복 체크
            if (experienceTechStackJpaRepository
                .findByExperienceIdAndTechStackId(experience.getId(), techStack.getId()) != null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("이미 관계가 존재합니다"));
            }

            ExperienceTechStackJpaEntity relationship = ExperienceTechStackJpaEntity.builder()
                .experience(experience)
                .techStack(techStack)
                .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
                .usageDescription(request.getUsageDescription())
                .build();

            experienceTechStackJpaRepository.save(relationship);

            return ResponseEntity.ok(ApiResponse.success(null, "기술스택 관계 추가 성공"));
        } catch (Exception e) {
            log.error("Error adding tech stack relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("기술스택 관계 추가 실패: " + e.getMessage()));
        }
    }

    /**
     * 기술스택 관계 삭제
     */
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
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found"));

            experienceTechStackJpaRepository.deleteByExperienceIdAndTechStackId(
                experience.getId(), techStackId);

            return ResponseEntity.ok(ApiResponse.success(null, "기술스택 관계 삭제 성공"));
        } catch (Exception e) {
            log.error("Error deleting tech stack relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("기술스택 관계 삭제 실패: " + e.getMessage()));
        }
    }

    // ==================== 프로젝트 관계 ====================

    /**
     * 프로젝트 관계 조회
     */
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

        log.info("GET /api/admin/experiences/{}/projects - businessId: {}", id, id);
        
        try {
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found: " + id));
            
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
                    .isPrimary(false) // 현재는 지원 안함
                    .usageDescription(null) // Experience-Project에는 없음
                    .roleInProject(rel.getRoleInProject())
                    .contributionDescription(rel.getContributionDescription())
                    .build())
                .collect(Collectors.toList());
            
            log.info("Found {} project relationships for experience {}", dtos.size(), id);

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching project relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("프로젝트 관계 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 프로젝트 관계 추가
     */
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
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found"));

            // Business ID로 프로젝트 조회
            ProjectJpaEntity project = projectJpaRepository.findByBusinessId(request.getProjectBusinessId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + request.getProjectBusinessId()));

            // 중복 체크
            if (experienceProjectJpaRepository
                .findByExperienceIdAndProjectId(experience.getId(), project.getId()) != null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("이미 관계가 존재합니다"));
            }

            ExperienceProjectJpaEntity relationship = ExperienceProjectJpaEntity.builder()
                .experience(experience)
                .project(project)
                .roleInProject(request.getRoleInProject())
                .contributionDescription(request.getContributionDescription())
                .build();

            experienceProjectJpaRepository.save(relationship);

            log.info("Added project relationship: experience={}, project={}", id, request.getProjectBusinessId());
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

    /**
     * 프로젝트 관계 삭제
     */
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
            ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found"));

            experienceProjectJpaRepository.deleteByExperienceIdAndProjectId(
                experience.getId(), projectId);

            return ResponseEntity.ok(ApiResponse.success(null, "프로젝트 관계 삭제 성공"));
        } catch (Exception e) {
            log.error("Error deleting project relationship", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("프로젝트 관계 삭제 실패: " + e.getMessage()));
        }
    }
}

