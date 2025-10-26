package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageCertificationUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Admin 전용 Certification 관리 서비스
 *
 * 책임: Certification 생성/수정/삭제 UseCase 구현
 * 특징: Cache Evict로 캐시 자동 무효화
 */
@Service("manageCertificationService")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageCertificationService implements ManageCertificationUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Certification createCertification(Certification certification) {
        log.info("Creating new certification: {}", certification.getName());

        // 정렬 순서 자동 할당
        if (certification.getSortOrder() == null) {
            int maxSortOrder = portfolioRepositoryPort.findMaxCertificationSortOrder();
            certification.setSortOrder(maxSortOrder + 1);
        }

        // 메타데이터 설정
        certification.setCreatedAt(MetadataHelper.setupCreatedAt(certification.getCreatedAt()));
        certification.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        Certification saved = portfolioRepositoryPort.saveCertification(certification);

        log.info("Certification created successfully: {}", saved.getId());
        return saved;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Certification updateCertification(String id, Certification certification) {
        log.info("Updating certification: {}", id);

        // 존재 여부 확인
        Certification existing = portfolioRepositoryPort.findCertificationById(id)
            .orElseThrow(() -> new IllegalArgumentException("Certification not found: " + id));

        // ID 유지 (변경 불가)
        certification.setId(existing.getId());

        // 생성 시간 유지
        certification.setCreatedAt(existing.getCreatedAt());

        // 수정 시간 갱신
        certification.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        Certification updated = portfolioRepositoryPort.saveCertification(certification);

        log.info("Certification updated successfully: {}", updated.getId());
        return updated;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void deleteCertification(String id) {
        log.info("Deleting certification: {}", id);

        if (!portfolioRepositoryPort.findCertificationById(id).isPresent()) {
            throw new IllegalArgumentException("Certification not found: " + id);
        }

        portfolioRepositoryPort.deleteCertification(id);

        log.info("Certification deleted successfully: {}", id);
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void updateCertificationSortOrder(Map<String, Integer> sortOrderUpdates) {
        log.info("Updating certification sort orders: {} items", sortOrderUpdates.size());

        // 모든 Certification 조회
        List<Certification> allCertifications = portfolioRepositoryPort.findAllCertificationsWithoutCache();

        // 각 업데이트에 대해 자동 재정렬 수행
        for (Map.Entry<String, Integer> entry : sortOrderUpdates.entrySet()) {
            String id = entry.getKey();
            Integer newSortOrder = entry.getValue();

            // 현재 Certification 찾기
            Certification targetCertification = allCertifications.stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Certification not found: " + id));

            Integer oldSortOrder = targetCertification.getSortOrder();

            // 자동 재정렬 수행
            List<Certification> reordered = reorderCertifications(
                allCertifications,
                targetCertification,
                oldSortOrder,
                newSortOrder
            );

            // 재정렬된 Certification들을 저장
            for (Certification cert : reordered) {
                cert.setUpdatedAt(MetadataHelper.setupUpdatedAt());
                portfolioRepositoryPort.saveCertification(cert);
            }

            allCertifications = reordered; // 다음 업데이트를 위해 목록 갱신
        }

        log.info("Certification sort orders updated successfully");
    }

    /**
     * Certification 자동 재정렬
     */
    private List<Certification> reorderCertifications(
            List<Certification> allCertifications,
            Certification targetCertification,
            Integer oldSortOrder,
            Integer newSortOrder) {

        List<Certification> result = new ArrayList<>();
        String targetId = targetCertification.getId();

        if (oldSortOrder == newSortOrder) {
            return allCertifications;
        }

        if (oldSortOrder < newSortOrder) {
            // 뒤로 이동
            for (Certification cert : allCertifications) {
                if (cert.getId().equals(targetId)) {
                    result.add(createUpdatedCertification(cert, newSortOrder));
                } else if (cert.getSortOrder() != null &&
                          cert.getSortOrder() > oldSortOrder &&
                          cert.getSortOrder() <= newSortOrder) {
                    result.add(createUpdatedCertification(cert, cert.getSortOrder() - 1));
                } else {
                    result.add(cert);
                }
            }
        } else {
            // 앞으로 이동
            for (Certification cert : allCertifications) {
                if (cert.getId().equals(targetId)) {
                    result.add(createUpdatedCertification(cert, newSortOrder));
                } else if (cert.getSortOrder() != null &&
                          cert.getSortOrder() >= newSortOrder &&
                          cert.getSortOrder() < oldSortOrder) {
                    result.add(createUpdatedCertification(cert, cert.getSortOrder() + 1));
                } else {
                    result.add(cert);
                }
            }
        }

        return result;
    }

    /**
     * sortOrder만 변경된 Certification 생성
     */
    private Certification createUpdatedCertification(Certification original, Integer newSortOrder) {
        original.setSortOrder(newSortOrder);
        original.setUpdatedAt(MetadataHelper.setupUpdatedAt());
        return original;
    }
}
