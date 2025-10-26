package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

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

        // 정렬 순서가 없으면 마지막에 추가
        if (education.getSortOrder() == null) {
            int maxSortOrder = portfolioRepositoryPort.findAllEducations().stream()
                .mapToInt(e -> e.getSortOrder() != null ? e.getSortOrder() : 0)
                .max()
                .orElse(0);
            education.setSortOrder(maxSortOrder + 1);
        }

        // 생성 시간 설정
        if (education.getCreatedAt() == null) {
            education.setCreatedAt(LocalDateTime.now());
        }
        education.setUpdatedAt(LocalDateTime.now());

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
        education.setUpdatedAt(LocalDateTime.now());

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

        sortOrderUpdates.forEach((id, sortOrder) -> {
            Education education = portfolioRepositoryPort.findEducationById(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));

            education.setSortOrder(sortOrder);
            education.setUpdatedAt(LocalDateTime.now());
            portfolioRepositoryPort.saveEducation(education);
        });

        log.info("Education sort orders updated successfully");
    }
}

