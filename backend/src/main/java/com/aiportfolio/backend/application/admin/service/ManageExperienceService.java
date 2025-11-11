package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.common.util.BusinessIdGenerator;
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

        // ID 자동 생성 (생성 시에만)
        if (experience.getId() == null || experience.getId().isEmpty()) {
            Optional<String> lastBusinessId = portfolioRepositoryPort.findLastBusinessIdByPrefix(BusinessIdGenerator.Prefix.EXPERIENCE);
            String generatedId = BusinessIdGenerator.generate(BusinessIdGenerator.Prefix.EXPERIENCE, lastBusinessId);
            experience.setId(generatedId);
            log.debug("Generated experience ID: {}", generatedId);
        }

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

        // 모든 Experience 조회 및 스냅샷 생성 (원본 보호)
        List<Experience> allExperiences = portfolioRepositoryPort.findAllExperiencesWithoutCache();
        List<Experience> originalSnapshot = new ArrayList<>();
        for (Experience exp : allExperiences) {
            Experience snapshot = Experience.builder()
                .id(exp.getId())
                .title(exp.getTitle())
                .description(exp.getDescription())
                .organization(exp.getOrganization())
                .role(exp.getRole())
                .startDate(exp.getStartDate())
                .endDate(exp.getEndDate())
                .jobField(exp.getJobField())
                .employmentType(exp.getEmploymentType())
                .mainResponsibilities(exp.getMainResponsibilities())
                .achievements(exp.getAchievements())
                .projects(exp.getProjects())
                .sortOrder(exp.getSortOrder())
                .createdAt(exp.getCreatedAt())
                .updatedAt(exp.getUpdatedAt())
                .build();
            originalSnapshot.add(snapshot);
        }

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

            // 재정렬된 Experience들 중 변경된 것만 저장
            Map<String, Experience> originalMap = originalSnapshot.stream()
                .collect(java.util.stream.Collectors.toMap(Experience::getId, e -> e));
            
            for (Experience exp : reordered) {
                Experience original = originalMap.get(exp.getId());
                
                // sortOrder가 변경된 것만 저장 (updatedAt 갱신)
                if (original != null && !original.getSortOrder().equals(exp.getSortOrder())) {
                    log.debug("Updating sortOrder for experience {}: {} -> {}", 
                        exp.getId(), original.getSortOrder(), exp.getSortOrder());
                    exp.setUpdatedAt(MetadataHelper.setupUpdatedAt());
                    portfolioRepositoryPort.saveExperience(exp);
                }
            }

            // 다음 업데이트를 위해 목록 갱신 및 스냅샷 업데이트
            allExperiences = reordered;
            originalSnapshot = new ArrayList<>();
            for (Experience exp : allExperiences) {
                Experience snapshot = Experience.builder()
                    .id(exp.getId())
                    .title(exp.getTitle())
                    .description(exp.getDescription())
                    .organization(exp.getOrganization())
                    .role(exp.getRole())
                    .startDate(exp.getStartDate())
                    .endDate(exp.getEndDate())
                    .jobField(exp.getJobField())
                    .employmentType(exp.getEmploymentType())
                    .mainResponsibilities(exp.getMainResponsibilities())
                    .achievements(exp.getAchievements())
                    .projects(exp.getProjects())
                    .sortOrder(exp.getSortOrder())
                    .createdAt(exp.getCreatedAt())
                    .updatedAt(exp.getUpdatedAt())
                    .build();
                originalSnapshot.add(snapshot);
            }
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
     * sortOrder만 변경된 Experience 생성 (원본을 보호하기 위해 복사본 생성)
     *
     * Note: updatedAt은 호출하는 측에서 변경 여부를 확인하고 설정해야 함
     */
    private Experience createUpdatedExperience(Experience original, Integer newSortOrder) {
        return Experience.builder()
            .id(original.getId())
            .title(original.getTitle())
            .description(original.getDescription())
            .organization(original.getOrganization())
            .role(original.getRole())
            .startDate(original.getStartDate())
            .endDate(original.getEndDate())
            .jobField(original.getJobField())
            .employmentType(original.getEmploymentType())
            .mainResponsibilities(original.getMainResponsibilities())
            .achievements(original.getAchievements())
            .projects(original.getProjects())
            .sortOrder(newSortOrder)
            .createdAt(original.getCreatedAt())
            .updatedAt(original.getUpdatedAt())
            .build();
    }

}

