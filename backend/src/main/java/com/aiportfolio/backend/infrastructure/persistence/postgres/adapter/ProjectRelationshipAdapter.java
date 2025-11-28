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

import java.util.List;

/**
 * Project 관계 관리 Adapter
 * Hexagonal Architecture의 Adapter 역할
 * 
 * Project와 TechStack 간의 관계를 관리하는 구현체
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
    public void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships) {
        log.debug("Replacing tech stacks for project: {}", projectBusinessId);

        ProjectJpaEntity project = projectJpaRepository.findByBusinessId(projectBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectBusinessId));

        // 기존 관계 삭제
        projectTechStackJpaRepository.deleteByProjectId(project.getId());

        if (relationships == null || relationships.isEmpty()) {
            log.debug("No tech stacks to add for project: {}", projectBusinessId);
            return;
        }

        // 새로운 관계 생성
        for (TechStackRelation item : relationships) {
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

        log.debug("Successfully replaced tech stacks for project: {}", projectBusinessId);
    }
}

