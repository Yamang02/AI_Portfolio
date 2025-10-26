package com.aiportfolio.backend.application.portfolio;

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
 * Main 앱 전용 Experience 조회 서비스
 *
 * 책임: Experience 조회 UseCase 구현 (Main 앱용)
 * 특징: Redis 캐시 사용 (Repository 레벨 @Cacheable)
 */
@Service("getExperienceService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class GetExperienceService implements GetExperienceUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    /**
     * Main 앱용: 캐시된 데이터 조회 (@Cacheable)
     */
    private List<Experience> getAllExperiencesInternal() {
        return portfolioRepositoryPort.findAllExperiences();
    }

    @Override
    public List<Experience> getAllExperiences() {
        log.debug("Fetching all experiences (main - with cache)");
        return getAllExperiencesInternal();
    }

    @Override
    public Optional<Experience> getExperienceById(String id) {
        log.debug("Fetching experience by id: {}", id);
        return portfolioRepositoryPort.findExperienceById(id);
    }

    @Override
    public List<Experience> getExperiencesByType(ExperienceType type) {
        log.debug("Fetching experiences by type: {}", type);
        return getAllExperiencesInternal().stream()
            .filter(e -> e.getType() == type)
            .collect(Collectors.toList());
    }

    @Override
    public List<Experience> getExperiencesByOrganization(String organization) {
        log.debug("Fetching experiences by organization: {}", organization);
        return getAllExperiencesInternal().stream()
            .filter(e -> e.isFromOrganization(organization))
            .collect(Collectors.toList());
    }

    @Override
    public List<Experience> getCurrentExperiences() {
        log.debug("Fetching current experiences");
        return getAllExperiencesInternal().stream()
            .filter(Experience::isCurrentlyEmployed)
            .collect(Collectors.toList());
    }

    @Override
    public List<Experience> getExperiencesByTechStack(String techStackName) {
        log.debug("Fetching experiences by tech stack: {}", techStackName);
        return getAllExperiencesInternal().stream()
            .filter(e -> e.usesTechnology(techStackName))
            .collect(Collectors.toList());
    }

    @Override
    public List<Experience> searchExperiences(String keyword) {
        log.debug("Searching experiences with keyword: {}", keyword);
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
