package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;

import java.util.List;
import java.util.Optional;

/**
 * Education 조회 UseCase (Query)
 *
 * 책임: Education의 조회 작업 정의
 * CQRS 패턴의 Query 측면
 */
public interface GetEducationUseCase {

    /**
     * 전체 Education 조회 (정렬 순서대로)
     *
     * @return Education 목록
     */
    List<Education> getAllEducations();

    /**
     * ID로 Education 조회
     *
     * @param id Education ID
     * @return Education (Optional)
     */
    Optional<Education> getEducationById(String id);

    /**
     * 교육 타입별 조회
     *
     * @param type 교육 타입
     * @return Education 목록
     */
    List<Education> getEducationsByType(EducationType type);

    /**
     * 교육기관별 조회
     *
     * @param organization 교육기관명
     * @return Education 목록
     */
    List<Education> getEducationsByOrganization(String organization);

    /**
     * 현재 진행중인 Education 조회 (endDate가 null)
     *
     * @return Education 목록
     */
    List<Education> getOngoingEducations();

    /**
     * 특정 기술 스택을 사용한 Education 조회
     *
     * @param techStackName 기술 스택명
     * @return Education 목록
     */
    List<Education> getEducationsByTechStack(String techStackName);

    /**
     * 키워드로 Education 검색 (제목, 설명, 교육기관명)
     *
     * @param keyword 검색 키워드
     * @return Education 목록
     */
    List<Education> searchEducations(String keyword);
}
