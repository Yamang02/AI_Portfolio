package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageExperienceUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Admin 전용 Experience 관리 서비스
 *
 * 책임: Experience 생성/수정/삭제 UseCase 구현
 * 특징: Cache Evict로 캐시 자동 무효화
 */
@Service("manageExperienceService")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageExperienceService implements ManageExperienceUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Experience createExperience(Experience experience) {
        log.info("Creating new experience: {}", experience.getTitle());

        // 정렬 순서 자동 할당 (DB 쿼리 방식 - 더 효율적)
        if (experience.getSortOrder() == null) {
            int maxSortOrder = portfolioRepositoryPort.findMaxExperienceSortOrder();
            experience.setSortOrder(maxSortOrder + 1);
        }

        // 메타데이터 설정
        experience.setCreatedAt(MetadataHelper.setupCreatedAt(experience.getCreatedAt()));
        experience.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        Experience saved = portfolioRepositoryPort.saveExperience(experience);

        log.info("Experience created successfully: {}", saved.getId());
        return saved;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Experience updateExperience(String id, Experience experience) {
        log.info("Updating experience: {}", id);

        // 존재 여부 확인
        Experience existing = portfolioRepositoryPort.findExperienceById(id)
            .orElseThrow(() -> new IllegalArgumentException("Experience not found: " + id));

        // ID 유지 (변경 불가)
        experience.setId(existing.getId());

        // 생성 시간 유지
        experience.setCreatedAt(existing.getCreatedAt());

        // 수정 시간 갱신
        experience.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        Experience updated = portfolioRepositoryPort.saveExperience(experience);

        log.info("Experience updated successfully: {}", updated.getId());
        return updated;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void deleteExperience(String id) {
        log.info("Deleting experience: {}", id);

        if (!portfolioRepositoryPort.findExperienceById(id).isPresent()) {
            throw new IllegalArgumentException("Experience not found: " + id);
        }

        portfolioRepositoryPort.deleteExperience(id);

        log.info("Experience deleted successfully: {}", id);
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void updateExperienceSortOrder(Map<String, Integer> sortOrderUpdates) {
        log.info("Updating experience sort orders: {} items", sortOrderUpdates.size());

        // 모든 Experience 조회
        List<Experience> allExperiences = portfolioRepositoryPort.findAllExperiencesWithoutCache();

        // 각 업데이트에 대해 자동 재정렬 수행
        for (Map.Entry<String, Integer> entry : sortOrderUpdates.entrySet()) {
            String id = entry.getKey();
            Integer newSortOrder = entry.getValue();

            // 현재 Experience 찾기
            Experience targetExperience = allExperiences.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Experience not found: " + id));

            Integer oldSortOrder = targetExperience.getSortOrder();

            // 자동 재정렬 수행
            List<Experience> reordered = reorderExperiences(
                allExperiences,
                targetExperience,
                oldSortOrder,
                newSortOrder
            );

            // 재정렬된 Experience들을 저장
            for (Experience exp : reordered) {
                exp.setUpdatedAt(MetadataHelper.setupUpdatedAt());
                portfolioRepositoryPort.saveExperience(exp);
            }

            allExperiences = reordered; // 다음 업데이트를 위해 목록 갱신
        }

        log.info("Experience sort orders updated successfully");
    }

    /**
     * Experience 자동 재정렬
     */
    private List<Experience> reorderExperiences(
            List<Experience> allExperiences,
            Experience targetExperience,
            Integer oldSortOrder,
            Integer newSortOrder) {
        
        List<Experience> result = new ArrayList<>();
        String targetId = targetExperience.getId();

        if (oldSortOrder == newSortOrder) {
            return allExperiences;
        }

        if (oldSortOrder < newSortOrder) {
            // 뒤로 이동
            for (Experience exp : allExperiences) {
                if (exp.getId().equals(targetId)) {
                    result.add(createUpdatedExperience(exp, newSortOrder));
                } else if (exp.getSortOrder() != null &&
                          exp.getSortOrder() > oldSortOrder &&
                          exp.getSortOrder() <= newSortOrder) {
                    result.add(createUpdatedExperience(exp, exp.getSortOrder() - 1));
                } else {
                    result.add(exp);
                }
            }
        } else {
            // 앞으로 이동
            for (Experience exp : allExperiences) {
                if (exp.getId().equals(targetId)) {
                    result.add(createUpdatedExperience(exp, newSortOrder));
                } else if (exp.getSortOrder() != null &&
                          exp.getSortOrder() >= newSortOrder &&
                          exp.getSortOrder() < oldSortOrder) {
                    result.add(createUpdatedExperience(exp, exp.getSortOrder() + 1));
                } else {
                    result.add(exp);
                }
            }
        }

        return result;
    }

    /**
     * sortOrder만 변경된 Experience 생성
     */
    private Experience createUpdatedExperience(Experience original, Integer newSortOrder) {
        original.setSortOrder(newSortOrder);
        original.setUpdatedAt(MetadataHelper.setupUpdatedAt());
        return original;
    }
}

