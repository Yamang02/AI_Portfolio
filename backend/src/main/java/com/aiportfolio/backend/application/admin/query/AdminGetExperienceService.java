package com.aiportfolio.backend.application.admin.query;

import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.enums.ExperienceType;
import com.aiportfolio.backend.domain.portfolio.port.in.GetExperienceUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Admin 전용 Experience 조회 서비스
 *
 * 책임: Experience 조회 UseCase 구현 (Admin 관리 화면용)
 * 특징: 캐시 없이 실시간 데이터 조회
 */
@Service("adminGetExperienceService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AdminGetExperienceService implements GetExperienceUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    /**
     * Admin 전용: 캐시 없이 직접 DB 조회
     */
    private List<Experience> getAllExperiencesInternal() {
        return portfolioRepositoryPort.findAllExperiencesWithoutCache();
    }

    @Override
    public List<Experience> getAllExperiences() {
        log.debug("Fetching all experiences (admin - no cache)");
        return getAllExperiencesInternal();
    }

    @Override
    public Optional<Experience> getExperienceById(String id) {
        log.debug("Fetching experience by id: {} (admin - no cache)", id);
        return portfolioRepositoryPort.findExperienceById(id);
    }

    @Override
    public List<Experience> getExperiencesByType(ExperienceType type) {
        log.debug("Fetching experiences by type: {} (admin - no cache)", type);
        return getAllExperiencesInternal().stream()
            .filter(e -> type != null && type.name().equals(e.getEmploymentType()))
            .collect(Collectors.toList());
    }

    @Override
    public List<Experience> getExperiencesByOrganization(String organization) {
        log.debug("Fetching experiences by organization: {} (admin - no cache)", organization);
        return getAllExperiencesInternal().stream()
            .filter(e -> e.isFromOrganization(organization))
            .collect(Collectors.toList());
    }

    @Override
    public List<Experience> getCurrentExperiences() {
        log.debug("Fetching current experiences (admin - no cache)");
        return getAllExperiencesInternal().stream()
            .filter(Experience::isCurrentlyEmployed)
            .collect(Collectors.toList());
    }

    @Override
    public List<Experience> getExperiencesByTechStack(String techStackName) {
        log.debug("Fetching experiences by tech stack: {} (admin - no cache)", techStackName);
        return getAllExperiencesInternal().stream()
            .filter(e -> e.usesTechnology(techStackName))
            .collect(Collectors.toList());
    }

    @Override
    public List<Experience> searchExperiences(String keyword) {
        log.debug("Searching experiences with keyword: {} (admin - no cache)", keyword);
        String lowerKeyword = keyword.toLowerCase();
        return getAllExperiencesInternal().stream()
            .filter(e ->
                e.getTitle().toLowerCase().contains(lowerKeyword) ||
                (e.getDescription() != null && e.getDescription().toLowerCase().contains(lowerKeyword)) ||
                e.getOrganization().toLowerCase().contains(lowerKeyword) ||
                e.getRole().toLowerCase().contains(lowerKeyword)
            )
            .collect(Collectors.toList());
    }
}

