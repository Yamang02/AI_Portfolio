package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Certification;

import java.util.Map;

/**
 * Certification 관리 UseCase (Command)
 *
 * 책임: Certification의 생성, 수정, 삭제 작업 정의
 * CQRS 패턴의 Command 측면
 */
public interface ManageCertificationUseCase {

    /**
     * Certification 생성
     *
     * @param certification 생성할 Certification 도메인 모델
     * @return 생성된 Certification
     */
    Certification createCertification(Certification certification);

    /**
     * Certification 수정
     *
     * @param id 수정할 Certification ID
     * @param certification 수정할 데이터
     * @return 수정된 Certification
     */
    Certification updateCertification(String id, Certification certification);

    /**
     * Certification 삭제
     *
     * @param id 삭제할 Certification ID
     */
    void deleteCertification(String id);

    /**
     * Certification 정렬 순서 일괄 업데이트
     *
     * @param sortOrderUpdates ID와 새로운 sortOrder 맵
     */
    void updateCertificationSortOrder(Map<String, Integer> sortOrderUpdates);
}
