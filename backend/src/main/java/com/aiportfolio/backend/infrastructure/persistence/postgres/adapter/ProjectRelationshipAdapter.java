package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.portfolio.port.out.ProjectRelationshipPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectTechStackJpaRepository;
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
 * Project 관계 관리 Adapter
 * Hexagonal Architecture의 Adapter 역할
 * 
 * Project와 TechStack 간의 관계를 관리하는 구현체
 * 
 * Merge 전략을 사용하여 불필요한 DELETE/INSERT를 최소화하고
 * duplicate key constraint violation을 방지합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class ProjectRelationshipAdapter implements ProjectRelationshipPort {

    private final ProjectJpaRepository projectJpaRepository;
    private final ProjectTechStackJpaRepository projectTechStackJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;

    @Override
    public void replaceTechStacks(Long projectId, List<TechStackRelation> relationships) {
        log.debug("Replacing tech stacks for project: {} (using merge strategy)", projectId);

        ProjectJpaEntity project = projectJpaRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        // 1. 기존 관계 조회
        List<ProjectTechStackJpaEntity> existingRelations =
                projectTechStackJpaRepository.findByProjectId(projectId);
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
        List<ProjectTechStackJpaEntity> toDelete = existingRelations.stream()
                .filter(existing -> !requestedIds.contains(existing.getTechStack().getId()))
                .collect(Collectors.toList());

        if (!toDelete.isEmpty()) {
            log.debug("Deleting {} tech stack relationships", toDelete.size());
            projectTechStackJpaRepository.deleteAll(toDelete);
            // 명시적 플러시로 삭제가 DB에 반영되도록 보장
            projectTechStackJpaRepository.flush();
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

                ProjectTechStackJpaEntity relation = ProjectTechStackJpaEntity.builder()
                        .project(project)
                        .techStack(techStack)
                        .isPrimary(item.isPrimary())
                        .usageDescription(item.usageDescription())
                        .build();

                projectTechStackJpaRepository.save(relation);
            }
        }

        log.debug("Successfully replaced tech stacks for project: {} (deleted: {}, added: {})",
                projectId, toDelete.size(), toAdd.size());
    }
}



