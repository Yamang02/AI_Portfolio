package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.common.util.BusinessIdGenerator;
import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.application.common.util.SortOrderService;
import com.aiportfolio.backend.application.common.util.TextFieldHelper;
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
    private final SortOrderService sortOrderService;

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Experience createExperience(Experience experience) {
        log.info("Creating new experience: {}", experience.getTitle());

        // ID 자동 생성 (생성 시에만)
        if (experience.getId() == null || experience.getId().isEmpty()) {
            Optional<String> lastBusinessId = portfolioRepositoryPort.findLastBusinessIdByPrefix(BusinessIdGenerator.Prefix.EXPERIENCE);
            String generatedId = BusinessIdGenerator.generate(BusinessIdGenerator.Prefix.EXPERIENCE, lastBusinessId);
            experience.setId(generatedId);
        }

        // 정렬 순서 자동 할당 (DB 쿼리 방식 - 더 효율적)
        if (experience.getSortOrder() == null) {
            int maxSortOrder = portfolioRepositoryPort.findMaxExperienceSortOrder();
            experience.setSortOrder(maxSortOrder + 1);
        }

        // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
        // title, organization, role은 필수 필드이므로 정규화하지 않음

        // 선택 필드: 정규화 적용
        experience.setDescription(TextFieldHelper.normalizeText(experience.getDescription()));
        experience.setJobField(TextFieldHelper.normalizeText(experience.getJobField()));
        experience.setEmploymentType(TextFieldHelper.normalizeText(experience.getEmploymentType()));
        experience.setMainResponsibilities(TextFieldHelper.normalizeTextList(experience.getMainResponsibilities()));
        experience.setAchievements(TextFieldHelper.normalizeTextList(experience.getAchievements()));

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

        // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
        // title, organization, role은 필수 필드이므로 정규화하지 않음

        // 선택 필드: 정규화 적용
        experience.setDescription(TextFieldHelper.normalizeText(experience.getDescription()));
        experience.setJobField(TextFieldHelper.normalizeText(experience.getJobField()));
        experience.setEmploymentType(TextFieldHelper.normalizeText(experience.getEmploymentType()));
        experience.setMainResponsibilities(TextFieldHelper.normalizeTextList(experience.getMainResponsibilities()));
        experience.setAchievements(TextFieldHelper.normalizeTextList(experience.getAchievements()));

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

        // 원본 정렬 순서 저장 (변경 추적용)
        Map<String, Integer> originalSortOrders = allExperiences.stream()
                .collect(java.util.stream.Collectors.toMap(Experience::getId, Experience::getSortOrder));

        // 각 업데이트에 대해 자동 재정렬 수행
        for (Map.Entry<String, Integer> entry : sortOrderUpdates.entrySet()) {
            allExperiences = sortOrderService.reorder(allExperiences, entry.getKey(), entry.getValue());
        }

        // 변경된 항목만 저장
        List<Experience> toUpdate = allExperiences.stream()
                .filter(exp -> !Objects.equals(exp.getSortOrder(), originalSortOrders.get(exp.getId())))
                .peek(exp -> exp.setUpdatedAt(MetadataHelper.setupUpdatedAt()))
                .collect(java.util.stream.Collectors.toList());

        if (!toUpdate.isEmpty()) {
            portfolioRepositoryPort.batchUpdateExperiences(toUpdate);
        }

        log.info("Experience sort orders updated successfully");
    }

}

