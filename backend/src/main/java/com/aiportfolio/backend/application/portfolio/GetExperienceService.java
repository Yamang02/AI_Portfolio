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

/**
 * Main app Experience query service.
 * Implements the Experience query use case for public APIs.
 */
@Service("getExperienceService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class GetExperienceService implements GetExperienceUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    /**
     * Internal helper for full list query.
     */
    private List<Experience> getAllExperiencesInternal() {
        return portfolioRepositoryPort.findAllExperiences();
    }

    @Override
    public List<Experience> getAllExperiences() {
        log.debug("Fetching all experiences (main)");
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
            .filter(e -> type != null && type.name().equals(e.getEmploymentType()))
            .toList();
    }

    @Override
    public List<Experience> getExperiencesByOrganization(String organization) {
        log.debug("Fetching experiences by organization: {}", organization);
        return getAllExperiencesInternal().stream()
            .filter(e -> e.isFromOrganization(organization))
            .toList();
    }

    @Override
    public List<Experience> getCurrentExperiences() {
        log.debug("Fetching current experiences");
        return getAllExperiencesInternal().stream()
            .filter(Experience::isCurrentlyEmployed)
            .toList();
    }

    @Override
    public List<Experience> getExperiencesByTechStack(String techStackName) {
        log.debug("Fetching experiences by tech stack: {}", techStackName);
        return getAllExperiencesInternal().stream()
            .filter(e -> e.usesTechnology(techStackName))
            .toList();
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
            .toList();
    }
}
