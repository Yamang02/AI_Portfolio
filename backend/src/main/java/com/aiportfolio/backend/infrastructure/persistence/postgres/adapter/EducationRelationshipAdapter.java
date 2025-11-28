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

import java.util.List;

/**
 * Education 관계 관리 Adapter
 * Hexagonal Architecture의 Adapter 역할
 * 
 * Education과 TechStack, Project 간의 관계를 관리하는 구현체
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
        log.debug("Replacing tech stacks for education: {}", educationBusinessId);

        EducationJpaEntity education = educationJpaRepository.findByBusinessId(educationBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + educationBusinessId));

        // 기존 관계 삭제
        educationTechStackJpaRepository.deleteByEducationId(education.getId());

        if (relationships == null || relationships.isEmpty()) {
            log.debug("No tech stacks to add for education: {}", educationBusinessId);
            return;
        }

        // 새로운 관계 생성
        for (TechStackRelation item : relationships) {
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

        log.debug("Successfully replaced tech stacks for education: {}", educationBusinessId);
    }

    @Override
    public void replaceProjects(String educationBusinessId, List<ProjectRelation> relationships) {
        log.debug("Replacing projects for education: {}", educationBusinessId);

        EducationJpaEntity education = educationJpaRepository.findByBusinessId(educationBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + educationBusinessId));

        // 기존 관계 삭제
        educationProjectJpaRepository.deleteByEducationId(education.getId());

        if (relationships == null || relationships.isEmpty()) {
            log.debug("No projects to add for education: {}", educationBusinessId);
            return;
        }

        // 새로운 관계 생성
        for (ProjectRelation item : relationships) {
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

        log.debug("Successfully replaced projects for education: {}", educationBusinessId);
    }
}

