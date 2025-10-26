package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Certification;

import java.util.List;
import java.util.Optional;

/**
 * Certification 조회 UseCase (Query)
 *
 * 책임: Certification 조회 작업 정의
 * CQRS 패턴의 Query 측면
 */
public interface GetCertificationUseCase {

    /**
     * 모든 Certification 조회 (어드민용, 캐시 없음)
     *
     * @return Certification 목록
     */
    List<Certification> getAllCertificationsWithoutCache();

    /**
     * ID로 Certification 조회
     *
     * @param id Certification ID
     * @return Certification
     */
    Optional<Certification> getCertificationById(String id);

    /**
     * 카테고리별 Certification 조회
     *
     * @param category 카테고리
     * @return Certification 목록
     */
    List<Certification> getCertificationsByCategory(String category);

    /**
     * 만료된 Certification 조회
     *
     * @return 만료된 Certification 목록
     */
    List<Certification> getExpiredCertifications();

    /**
     * 곧 만료될 Certification 조회 (3개월 이내)
     *
     * @return 곧 만료될 Certification 목록
     */
    List<Certification> getExpiringSoonCertifications();
}
