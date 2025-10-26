package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Admin 전용 Education 관리 서비스
 *
 * 책임: Education 생성/수정/삭제 UseCase 구현
 * 특징: Cache Evict로 캐시 자동 무효화
 */
@Service("manageEducationService")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageEducationService implements ManageEducationUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Education createEducation(Education education) {
        log.info("Creating new education: {}", education.getTitle());

        // 정렬 순서 자동 할당 (DB 쿼리 방식 - 더 효율적)
        if (education.getSortOrder() == null) {
            int maxSortOrder = portfolioRepositoryPort.findMaxEducationSortOrder();
            education.setSortOrder(maxSortOrder + 1);
        }

        // 메타데이터 설정
        education.setCreatedAt(MetadataHelper.setupCreatedAt(education.getCreatedAt()));
        education.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        Education saved = portfolioRepositoryPort.saveEducation(education);

        log.info("Education created successfully: {}", saved.getId());
        return saved;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Education updateEducation(String id, Education education) {
        log.info("Updating education: {}", id);

        // 존재 여부 확인
        Education existing = portfolioRepositoryPort.findEducationById(id)
            .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));

        // ID 유지 (변경 불가)
        education.setId(existing.getId());

        // 생성 시간 유지
        education.setCreatedAt(existing.getCreatedAt());

        // 수정 시간 갱신
        education.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        Education updated = portfolioRepositoryPort.saveEducation(education);

        log.info("Education updated successfully: {}", updated.getId());
        return updated;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void deleteEducation(String id) {
        log.info("Deleting education: {}", id);

        if (!portfolioRepositoryPort.findEducationById(id).isPresent()) {
            throw new IllegalArgumentException("Education not found: " + id);
        }

        portfolioRepositoryPort.deleteEducation(id);

        log.info("Education deleted successfully: {}", id);
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void updateEducationSortOrder(Map<String, Integer> sortOrderUpdates) {
        log.info("Updating education sort orders: {} items", sortOrderUpdates.size());

        // 모든 Education 조회
        List<Education> allEducations = portfolioRepositoryPort.findAllEducationsWithoutCache();

        // 각 업데이트에 대해 자동 재정렬 수행
        for (Map.Entry<String, Integer> entry : sortOrderUpdates.entrySet()) {
            String id = entry.getKey();
            Integer newSortOrder = entry.getValue();

            // 현재 Education 찾기
            Education targetEducation = allEducations.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));

            Integer oldSortOrder = targetEducation.getSortOrder();

            // 자동 재정렬 수행
            List<Education> reordered = reorderEducations(
                allEducations,
                targetEducation,
                oldSortOrder,
                newSortOrder
            );

            // 재정렬된 Education들을 저장
            for (Education edu : reordered) {
                edu.setUpdatedAt(MetadataHelper.setupUpdatedAt());
                portfolioRepositoryPort.saveEducation(edu);
            }

            allEducations = reordered; // 다음 업데이트를 위해 목록 갱신
        }

        log.info("Education sort orders updated successfully");
    }

    /**
     * Education 자동 재정렬
     */
    private List<Education> reorderEducations(
            List<Education> allEducations,
            Education targetEducation,
            Integer oldSortOrder,
            Integer newSortOrder) {
        
        List<Education> result = new ArrayList<>();
        String targetId = targetEducation.getId();

        if (oldSortOrder == newSortOrder) {
            return allEducations;
        }

        if (oldSortOrder < newSortOrder) {
            // 뒤로 이동
            for (Education edu : allEducations) {
                if (edu.getId().equals(targetId)) {
                    result.add(createUpdatedEducation(edu, newSortOrder));
                } else if (edu.getSortOrder() != null &&
                          edu.getSortOrder() > oldSortOrder &&
                          edu.getSortOrder() <= newSortOrder) {
                    result.add(createUpdatedEducation(edu, edu.getSortOrder() - 1));
                } else {
                    result.add(edu);
                }
            }
        } else {
            // 앞으로 이동
            for (Education edu : allEducations) {
                if (edu.getId().equals(targetId)) {
                    result.add(createUpdatedEducation(edu, newSortOrder));
                } else if (edu.getSortOrder() != null &&
                          edu.getSortOrder() >= newSortOrder &&
                          edu.getSortOrder() < oldSortOrder) {
                    result.add(createUpdatedEducation(edu, edu.getSortOrder() + 1));
                } else {
                    result.add(edu);
                }
            }
        }

        return result;
    }

    /**
     * sortOrder만 변경된 Education 생성
     */
    private Education createUpdatedEducation(Education original, Integer newSortOrder) {
        original.setSortOrder(newSortOrder);
        original.setUpdatedAt(MetadataHelper.setupUpdatedAt());
        return original;
    }
}

