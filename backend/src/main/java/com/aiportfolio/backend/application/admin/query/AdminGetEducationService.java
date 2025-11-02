package com.aiportfolio.backend.application.admin.query;

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
 * Admin 전용 Education 조회 서비스
 *
 * 책임: Education 조회 UseCase 구현 (Admin 관리 화면용)
 * 특징: 캐시 없이 실시간 데이터 조회
 */
@Service("adminGetEducationService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AdminGetEducationService implements GetEducationUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    /**
     * Admin 전용: 캐시 없이 직접 DB 조회
     */
    private List<Education> getAllEducationsInternal() {
        return portfolioRepositoryPort.findAllEducationsWithoutCache();
    }

    @Override
    public List<Education> getAllEducations() {
        log.debug("Fetching all educations (admin - no cache)");
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
        log.debug("Fetching education by id: {} (admin - no cache)", id);
        return portfolioRepositoryPort.findEducationById(id);
    }

    @Override
    public List<Education> getEducationsByType(EducationType type) {
        log.debug("Fetching educations by type: {} (admin - no cache)", type);
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
        log.debug("Fetching educations by organization: {} (admin - no cache)", organization);
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
        log.debug("Fetching ongoing educations (admin - no cache)");
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
        log.debug("Fetching educations by tech stack: {} (admin - no cache)", techStackName);
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
        log.debug("Searching educations with keyword: {} (admin - no cache)", keyword);
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

