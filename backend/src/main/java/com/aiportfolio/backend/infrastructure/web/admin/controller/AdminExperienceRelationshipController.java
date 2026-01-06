package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.portfolio.port.out.ExperienceRelationshipPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.*;
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
public class AdminExperienceRelationshipController {

    private final ExperienceJpaRepository experienceJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;
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
            @RequestBody TechStackRelationshipRequest request) {
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
            @PathVariable Long techStackId) {
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
            List<ExperienceRelationshipPort.TechStackRelation> relationships =
                request.getTechStackRelationships() == null
                    ? List.of()
                    : request.getTechStackRelationships().stream()
                        .map(item -> new ExperienceRelationshipPort.TechStackRelation(
                            item.getTechStackId(),
                            item.getIsPrimary() != null ? item.getIsPrimary() : false,
                            item.getUsageDescription()
                        ))
                        .collect(Collectors.toList());

            experienceRelationshipPort.replaceTechStacks(id, relationships);

            return ResponseEntity.ok(ApiResponse.success(null, "기술스택 관계 일괄 업데이트 성공"));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating tech stack relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("기술스택 관계 일괄 업데이트 실패: " + e.getMessage()));
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
            @RequestBody ProjectRelationshipRequest request) {
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
            @PathVariable Long projectId) {
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
            // BulkProjectRelationshipRequest를 ExperienceRelationshipPort.ProjectRelation으로 변환
            List<ExperienceRelationshipPort.ProjectRelation> projectRelations = 
                (request.getProjectRelationships() == null || request.getProjectRelationships().isEmpty())
                    ? Collections.emptyList()
                    : request.getProjectRelationships().stream()
                        .map(item -> new ExperienceRelationshipPort.ProjectRelation(
                            item.getProjectBusinessId(),
                            item.getRoleInProject(),
                            item.getContributionDescription()
                        ))
                        .collect(Collectors.toList());

            // Merge 전략을 사용하여 관계 업데이트
            experienceRelationshipPort.replaceProjects(id, projectRelations);
            
            log.info("Updated project relationships for experience: {} (using merge strategy)", id);
            return ResponseEntity.ok(ApiResponse.success(null, "프로젝트 관계 일괄 업데이트 성공"));
        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating project relationships", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("프로젝트 관계 일괄 업데이트 실패: " + e.getMessage()));
        }
    }
}

