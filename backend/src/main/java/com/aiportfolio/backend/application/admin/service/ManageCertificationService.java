package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.common.util.BusinessIdGenerator;
import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.application.common.util.SortOrderService;
import com.aiportfolio.backend.application.common.util.TextFieldHelper;
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
    private final SortOrderService sortOrderService;

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Certification createCertification(Certification certification) {
        log.info("Creating new certification: {}", certification.getName());

        // ID 자동 생성 (생성 시에만)
        if (certification.getId() == null || certification.getId().isEmpty()) {
            Optional<String> lastBusinessId = portfolioRepositoryPort.findLastBusinessIdByPrefix(BusinessIdGenerator.Prefix.CERTIFICATION);
            String generatedId = BusinessIdGenerator.generate(BusinessIdGenerator.Prefix.CERTIFICATION, lastBusinessId);
            certification.setId(generatedId);
        }

        // 정렬 순서 자동 할당
        if (certification.getSortOrder() == null) {
            int maxSortOrder = portfolioRepositoryPort.findMaxCertificationSortOrder();
            certification.setSortOrder(maxSortOrder + 1);
        }

        // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
        // name, issuer는 필수 필드이므로 정규화하지 않음

        // 선택 필드: 정규화 적용
        certification.setDescription(TextFieldHelper.normalizeText(certification.getDescription()));
        certification.setCredentialId(TextFieldHelper.normalizeText(certification.getCredentialId()));
        certification.setCredentialUrl(TextFieldHelper.normalizeText(certification.getCredentialUrl()));
        certification.setCategory(TextFieldHelper.normalizeText(certification.getCategory()));

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

        // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
        // name, issuer는 필수 필드이므로 정규화하지 않음

        // 선택 필드: 정규화 적용
        certification.setDescription(TextFieldHelper.normalizeText(certification.getDescription()));
        certification.setCredentialId(TextFieldHelper.normalizeText(certification.getCredentialId()));
        certification.setCredentialUrl(TextFieldHelper.normalizeText(certification.getCredentialUrl()));
        certification.setCategory(TextFieldHelper.normalizeText(certification.getCategory()));

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

        // 원본 정렬 순서 저장 (변경 추적용)
        Map<String, Integer> originalSortOrders = allCertifications.stream()
                .collect(java.util.stream.Collectors.toMap(Certification::getId, Certification::getSortOrder));

        // 각 업데이트에 대해 자동 재정렬 수행
        for (Map.Entry<String, Integer> entry : sortOrderUpdates.entrySet()) {
            allCertifications = sortOrderService.reorder(allCertifications, entry.getKey(), entry.getValue());
        }

        // 변경된 항목만 저장
        List<Certification> toUpdate = allCertifications.stream()
                .filter(cert -> !Objects.equals(cert.getSortOrder(), originalSortOrders.get(cert.getId())))
                .peek(cert -> cert.setUpdatedAt(MetadataHelper.setupUpdatedAt()))
                .collect(java.util.stream.Collectors.toList());

        if (!toUpdate.isEmpty()) {
            portfolioRepositoryPort.batchUpdateCertifications(toUpdate);
        }

        log.info("Certification sort orders updated successfully");
    }
}
