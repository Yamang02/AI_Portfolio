package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.portfolio.port.out.ExperienceRelationshipPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ExperienceJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ExperienceTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ExperienceJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ExperienceTechStackJpaRepository;
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
 * Experience 관계 관리 Adapter
 *
 * Experience와 TechStack 간의 관계를 관리하는 구현체
 *
 * Merge 전략을 사용하여 불필요한 DELETE/INSERT를 최소화하고
 * duplicate key constraint violation을 방지합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class ExperienceRelationshipAdapter implements ExperienceRelationshipPort {

    private final ExperienceJpaRepository experienceJpaRepository;
    private final ExperienceTechStackJpaRepository experienceTechStackJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;

    @Override
    public void replaceTechStacks(String experienceBusinessId, List<TechStackRelation> relationships) {
        log.debug("Replacing tech stacks for experience: {} (using merge strategy)", experienceBusinessId);

        ExperienceJpaEntity experience = experienceJpaRepository.findByBusinessId(experienceBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found: " + experienceBusinessId));

        List<ExperienceTechStackJpaEntity> existingRelations =
                experienceTechStackJpaRepository.findByExperienceId(experience.getId());
        log.debug("Found {} existing tech stack relationships", existingRelations.size());

        Set<Long> requestedIds = (relationships == null || relationships.isEmpty())
                ? Collections.emptySet()
                : relationships.stream()
                        .map(TechStackRelation::techStackId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
        log.debug("Requested tech stack IDs: {}", requestedIds);

        List<ExperienceTechStackJpaEntity> toDelete = existingRelations.stream()
                .filter(existing -> !requestedIds.contains(existing.getTechStack().getId()))
                .collect(Collectors.toList());

        if (!toDelete.isEmpty()) {
            log.debug("Deleting {} tech stack relationships", toDelete.size());
            experienceTechStackJpaRepository.deleteAll(toDelete);
            experienceTechStackJpaRepository.flush();
        }

        Set<Long> existingIds = existingRelations.stream()
                .map(existing -> existing.getTechStack().getId())
                .collect(Collectors.toSet());

        List<TechStackRelation> toAdd = (relationships == null || relationships.isEmpty())
                ? Collections.emptyList()
                : relationships.stream()
                        .filter(rel -> !existingIds.contains(rel.techStackId()))
                        .collect(Collectors.toList());

        if (!toAdd.isEmpty()) {
            log.debug("Adding {} new tech stack relationships", toAdd.size());
            for (TechStackRelation item : toAdd) {
                if (item.techStackId() == null) {
                    throw new IllegalArgumentException("Tech stack ID must not be null");
                }

                TechStackMetadataJpaEntity techStack = techStackMetadataJpaRepository.findById(item.techStackId())
                        .orElseThrow(() -> new IllegalArgumentException("TechStack not found: " + item.techStackId()));

                ExperienceTechStackJpaEntity relation = ExperienceTechStackJpaEntity.builder()
                        .experience(experience)
                        .techStack(techStack)
                        .isPrimary(item.isPrimary())
                        .usageDescription(item.usageDescription())
                        .build();

                experienceTechStackJpaRepository.save(relation);
            }
        }

        log.debug("Successfully replaced tech stacks for experience: {} (deleted: {}, added: {})",
                experienceBusinessId, toDelete.size(), toAdd.size());
    }
}
