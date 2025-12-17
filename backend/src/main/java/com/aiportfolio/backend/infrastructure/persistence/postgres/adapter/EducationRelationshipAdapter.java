package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.portfolio.port.out.EducationRelationshipPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.EducationJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.EducationProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.EducationTechStackJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.TechStackMetadataJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Education 관계 관리 Adapter
 * Hexagonal Architecture의 Adapter 역할
 * 
 * Education과 TechStack, Project 간의 관계를 관리하는 구현체
 * 
 * Merge 전략을 사용하여 불필요한 DELETE/INSERT를 최소화하고
 * duplicate key constraint violation을 방지합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class EducationRelationshipAdapter implements EducationRelationshipPort {

    private final EducationJpaRepository educationJpaRepository;
    private final EducationTechStackJpaRepository educationTechStackJpaRepository;
    private final EducationProjectJpaRepository educationProjectJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;

    @Override
    public void replaceTechStacks(String educationBusinessId, List<TechStackRelation> relationships) {
        log.debug("Replacing tech stacks for education: {} (using merge strategy)", educationBusinessId);

        EducationJpaEntity education = educationJpaRepository.findByBusinessId(educationBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + educationBusinessId));

        // 1. 기존 관계 조회
        List<EducationTechStackJpaEntity> existingRelations =
                educationTechStackJpaRepository.findByEducationId(education.getId());
        log.debug("Found {} existing tech stack relationships", existingRelations.size());

        // 2. 요청된 tech_stack_id 집합
        Set<Long> requestedIds = (relationships == null || relationships.isEmpty())
                ? Collections.emptySet()
                : relationships.stream()
                        .map(TechStackRelation::techStackId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
        log.debug("Requested tech stack IDs: {}", requestedIds);

        // 3. 기존 관계 중 삭제할 것들 (요청에 없는 것들)
        List<EducationTechStackJpaEntity> toDelete = existingRelations.stream()
                .filter(existing -> !requestedIds.contains(existing.getTechStack().getId()))
                .collect(Collectors.toList());

        if (!toDelete.isEmpty()) {
            log.debug("Deleting {} tech stack relationships", toDelete.size());
            educationTechStackJpaRepository.deleteAll(toDelete);
            // 명시적 플러시로 삭제가 DB에 반영되도록 보장
            educationTechStackJpaRepository.flush();
        }

        // 4. 기존에 있던 tech_stack_id 집합
        Set<Long> existingIds = existingRelations.stream()
                .map(existing -> existing.getTechStack().getId())
                .collect(Collectors.toSet());

        // 5. 새로 추가할 관계들 (기존에 없는 것들)
        List<TechStackRelation> toAdd = (relationships == null || relationships.isEmpty())
                ? Collections.emptyList()
                : relationships.stream()
                        .filter(rel -> !existingIds.contains(rel.techStackId()))
                        .collect(Collectors.toList());

        // 6. 추가 실행
        if (!toAdd.isEmpty()) {
            log.debug("Adding {} new tech stack relationships", toAdd.size());
            for (TechStackRelation item : toAdd) {
                if (item.techStackId() == null) {
                    throw new IllegalArgumentException("Tech stack ID must not be null");
                }

                TechStackMetadataJpaEntity techStack = techStackMetadataJpaRepository.findById(item.techStackId())
                        .orElseThrow(() -> new IllegalArgumentException("TechStack not found: " + item.techStackId()));

                EducationTechStackJpaEntity relation = EducationTechStackJpaEntity.builder()
                        .education(education)
                        .techStack(techStack)
                        .isPrimary(item.isPrimary())
                        .usageDescription(item.usageDescription())
                        .build();

                educationTechStackJpaRepository.save(relation);
            }
        }

        log.debug("Successfully replaced tech stacks for education: {} (deleted: {}, added: {})",
                educationBusinessId, toDelete.size(), toAdd.size());
    }

    @Override
    public void replaceProjects(String educationBusinessId, List<ProjectRelation> relationships) {
        log.debug("Replacing projects for education: {} (using merge strategy)", educationBusinessId);

        EducationJpaEntity education = educationJpaRepository.findByBusinessId(educationBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + educationBusinessId));

        // 1. 기존 관계 조회
        List<EducationProjectJpaEntity> existingRelations =
                educationProjectJpaRepository.findByEducationId(education.getId());
        log.debug("Found {} existing project relationships", existingRelations.size());

        // 2. 요청된 project_business_id 집합
        Set<String> requestedBusinessIds = (relationships == null || relationships.isEmpty())
                ? Collections.emptySet()
                : relationships.stream()
                        .map(ProjectRelation::projectBusinessId)
                        .filter(Objects::nonNull)
                        .filter(id -> !id.isBlank())
                        .collect(Collectors.toSet());
        log.debug("Requested project business IDs: {}", requestedBusinessIds);

        // 3. 기존 관계 중 삭제할 것들 (요청에 없는 것들)
        List<EducationProjectJpaEntity> toDelete = existingRelations.stream()
                .filter(existing -> {
                    String existingBusinessId = existing.getProject().getBusinessId();
                    return !requestedBusinessIds.contains(existingBusinessId);
                })
                .collect(Collectors.toList());

        if (!toDelete.isEmpty()) {
            log.debug("Deleting {} project relationships", toDelete.size());
            educationProjectJpaRepository.deleteAll(toDelete);
            // 명시적 플러시로 삭제가 DB에 반영되도록 보장
            educationProjectJpaRepository.flush();
        }

        // 4. 기존에 있던 project_business_id 집합
        Set<String> existingBusinessIds = existingRelations.stream()
                .map(existing -> existing.getProject().getBusinessId())
                .collect(Collectors.toSet());

        // 5. 새로 추가할 관계들 (기존에 없는 것들)
        List<ProjectRelation> toAdd = (relationships == null || relationships.isEmpty())
                ? Collections.emptyList()
                : relationships.stream()
                        .filter(rel -> {
                            String projectBusinessId = rel.projectBusinessId();
                            return projectBusinessId != null
                                    && !projectBusinessId.isBlank()
                                    && !existingBusinessIds.contains(projectBusinessId);
                        })
                        .collect(Collectors.toList());

        // 6. 추가 실행
        if (!toAdd.isEmpty()) {
            log.debug("Adding {} new project relationships", toAdd.size());
            for (ProjectRelation item : toAdd) {
                if (item.projectBusinessId() == null || item.projectBusinessId().isBlank()) {
                    throw new IllegalArgumentException("Project business ID must not be blank");
                }

                ProjectJpaEntity project = projectJpaRepository.findByBusinessId(item.projectBusinessId())
                        .orElseThrow(() -> new IllegalArgumentException("Project not found: " + item.projectBusinessId()));

                EducationProjectJpaEntity relation = EducationProjectJpaEntity.builder()
                        .education(education)
                        .project(project)
                        .projectType(item.projectType())
                        .grade(item.grade())
                        .build();

                educationProjectJpaRepository.save(relation);
            }
        }

        log.debug("Successfully replaced projects for education: {} (deleted: {}, added: {})",
                educationBusinessId, toDelete.size(), toAdd.size());
    }
}


