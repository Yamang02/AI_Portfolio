package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;
import com.aiportfolio.backend.domain.portfolio.port.in.GetEducationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Main 앱 전용 Education 조회 서비스
 *
 * 책임: Education 조회 UseCase 구현 (Main 앱용)
 * 특징: Redis 캐시 사용 (Repository 레벨 @Cacheable)
 */
@Service("getEducationService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class GetEducationService implements GetEducationUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    /**
     * Main 앱용: 캐시된 데이터 조회 (@Cacheable)
     */
    private List<Education> getAllEducationsInternal() {
        return portfolioRepositoryPort.findAllEducations();
    }

    @Override
    public List<Education> getAllEducations() {
        log.debug("Fetching all educations (main - with cache)");
        return getAllEducationsInternal().stream()
            .sorted((e1, e2) -> {
                Integer order1 = e1.getSortOrder() != null ? e1.getSortOrder() : Integer.MAX_VALUE;
                Integer order2 = e2.getSortOrder() != null ? e2.getSortOrder() : Integer.MAX_VALUE;
                return order1.compareTo(order2);
            })
            .collect(Collectors.toList());
    }

    @Override
    public Optional<Education> getEducationById(String id) {
        log.debug("Fetching education by id: {} (main - with cache)", id);
        return portfolioRepositoryPort.findEducationById(id);
    }

    @Override
    public List<Education> getEducationsByType(EducationType type) {
        log.debug("Fetching educations by type: {} (main - with cache)", type);
        return getAllEducationsInternal().stream()
            .filter(e -> e.getType() == type)
            .sorted((e1, e2) -> {
                Integer order1 = e1.getSortOrder() != null ? e1.getSortOrder() : Integer.MAX_VALUE;
                Integer order2 = e2.getSortOrder() != null ? e2.getSortOrder() : Integer.MAX_VALUE;
                return order1.compareTo(order2);
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<Education> getEducationsByOrganization(String organization) {
        log.debug("Fetching educations by organization: {} (main - with cache)", organization);
        return getAllEducationsInternal().stream()
            .filter(e -> e.getOrganization().equalsIgnoreCase(organization))
            .sorted((e1, e2) -> {
                Integer order1 = e1.getSortOrder() != null ? e1.getSortOrder() : Integer.MAX_VALUE;
                Integer order2 = e2.getSortOrder() != null ? e2.getSortOrder() : Integer.MAX_VALUE;
                return order1.compareTo(order2);
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<Education> getOngoingEducations() {
        log.debug("Fetching ongoing educations (main - with cache)");
        return getAllEducationsInternal().stream()
            .filter(Education::isOngoing)
            .sorted((e1, e2) -> {
                Integer order1 = e1.getSortOrder() != null ? e1.getSortOrder() : Integer.MAX_VALUE;
                Integer order2 = e2.getSortOrder() != null ? e2.getSortOrder() : Integer.MAX_VALUE;
                return order1.compareTo(order2);
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<Education> getEducationsByTechStack(String techStackName) {
        log.debug("Fetching educations by tech stack: {} (main - with cache)", techStackName);
        return getAllEducationsInternal().stream()
            .filter(e -> e.getTechStackMetadata() != null &&
                        e.getTechStackMetadata().stream()
                            .anyMatch(tech -> tech.getName().equalsIgnoreCase(techStackName)))
            .sorted((e1, e2) -> {
                Integer order1 = e1.getSortOrder() != null ? e1.getSortOrder() : Integer.MAX_VALUE;
                Integer order2 = e2.getSortOrder() != null ? e2.getSortOrder() : Integer.MAX_VALUE;
                return order1.compareTo(order2);
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<Education> searchEducations(String keyword) {
        log.debug("Searching educations with keyword: {} (main - with cache)", keyword);
        String lowerKeyword = keyword.toLowerCase();
        return getAllEducationsInternal().stream()
            .filter(e ->
                e.getTitle().toLowerCase().contains(lowerKeyword) ||
                (e.getDescription() != null && e.getDescription().toLowerCase().contains(lowerKeyword)) ||
                e.getOrganization().toLowerCase().contains(lowerKeyword) ||
                (e.getMajor() != null && e.getMajor().toLowerCase().contains(lowerKeyword))
            )
            .sorted((e1, e2) -> {
                Integer order1 = e1.getSortOrder() != null ? e1.getSortOrder() : Integer.MAX_VALUE;
                Integer order2 = e2.getSortOrder() != null ? e2.getSortOrder() : Integer.MAX_VALUE;
                return order1.compareTo(order2);
            })
            .collect(Collectors.toList());
    }
}
