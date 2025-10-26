package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.port.in.GetCertificationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Admin 전용 Certification 조회 서비스
 *
 * 책임: Certification 조회 UseCase 구현
 * 특징: 캐시 없이 실시간 DB 조회
 */
@Service("getCertificationService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class GetCertificationService implements GetCertificationUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    @Override
    public List<Certification> getAllCertificationsWithoutCache() {
        log.info("Getting all certifications without cache");
        return portfolioRepositoryPort.findAllCertificationsWithoutCache();
    }

    @Override
    public Optional<Certification> getCertificationById(String id) {
        log.info("Getting certification by id: {}", id);
        return portfolioRepositoryPort.findCertificationById(id);
    }

    @Override
    public List<Certification> getCertificationsByCategory(String category) {
        log.info("Getting certifications by category: {}", category);
        return portfolioRepositoryPort.findCertificationsByCategory(category);
    }

    @Override
    public List<Certification> getExpiredCertifications() {
        log.info("Getting expired certifications");
        return portfolioRepositoryPort.findAllCertificationsWithoutCache()
            .stream()
            .filter(Certification::isExpired)
            .collect(Collectors.toList());
    }

    @Override
    public List<Certification> getExpiringSoonCertifications() {
        log.info("Getting expiring soon certifications");
        return portfolioRepositoryPort.findAllCertificationsWithoutCache()
            .stream()
            .filter(Certification::isExpiringSoon)
            .collect(Collectors.toList());
    }
}
