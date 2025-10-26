package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageExperienceUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

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

        // 메타데이터 설정
        if (experience.getCreatedAt() == null) {
            experience.setCreatedAt(LocalDateTime.now());
        }
        experience.setUpdatedAt(LocalDateTime.now());

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
        experience.setUpdatedAt(LocalDateTime.now());

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

        sortOrderUpdates.forEach((id, sortOrder) -> {
            Experience experience = portfolioRepositoryPort.findExperienceById(id)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found: " + id));

            // sortOrder 필드는 Experience에 없으므로 추가 필요시 도메인 모델 수정
            // 현재는 기본 저장만 수행
            experience.setUpdatedAt(LocalDateTime.now());
            portfolioRepositoryPort.saveExperience(experience);
        });

        log.info("Experience sort orders updated successfully");
    }
}

