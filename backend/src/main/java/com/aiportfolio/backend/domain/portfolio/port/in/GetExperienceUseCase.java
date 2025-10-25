package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.enums.ExperienceType;

import java.util.List;
import java.util.Optional;

/**
 * Experience 조회 UseCase (Query)
 *
 * 책임: Experience의 조회 작업 정의
 * CQRS 패턴의 Query 측면
 */
public interface GetExperienceUseCase {

    /**
     * 전체 Experience 조회 (정렬 순서대로)
     *
     * @return Experience 목록
     */
    List<Experience> getAllExperiences();

    /**
     * ID로 Experience 조회
     *
     * @param id Experience ID
     * @return Experience (Optional)
     */
    Optional<Experience> getExperienceById(String id);

    /**
     * 경력 타입별 조회
     *
     * @param type 경력 타입
     * @return Experience 목록
     */
    List<Experience> getExperiencesByType(ExperienceType type);

    /**
     * 조직별 조회
     *
     * @param organization 조직명
     * @return Experience 목록
     */
    List<Experience> getExperiencesByOrganization(String organization);

    /**
     * 현재 재직중인 Experience 조회 (endDate가 null)
     *
     * @return Experience 목록
     */
    List<Experience> getCurrentExperiences();

    /**
     * 특정 기술 스택을 사용한 Experience 조회
     *
     * @param techStackName 기술 스택명
     * @return Experience 목록
     */
    List<Experience> getExperiencesByTechStack(String techStackName);

    /**
     * 키워드로 Experience 검색 (직책, 설명, 조직명, 역할)
     *
     * @param keyword 검색 키워드
     * @return Experience 목록
     */
    List<Experience> searchExperiences(String keyword);
}
