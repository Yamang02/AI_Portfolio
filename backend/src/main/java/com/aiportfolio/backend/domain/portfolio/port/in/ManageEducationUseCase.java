package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Education;

/**
 * Education 관리 UseCase (Command)
 *
 * 책임: Education의 생성, 수정, 삭제 작업 정의
 * CQRS 패턴의 Command 측면
 */
public interface ManageEducationUseCase {

    /**
     * Education 생성
     *
     * @param education 생성할 Education 도메인 모델
     * @return 생성된 Education
     */
    Education createEducation(Education education);

    /**
     * Education 수정
     *
     * @param id 수정할 Education ID
     * @param education 수정할 데이터
     * @return 수정된 Education
     */
    Education updateEducation(String id, Education education);

    /**
     * Education 삭제
     *
     * @param id 삭제할 Education ID
     */
    void deleteEducation(String id);

    /**
     * Education 정렬 순서 일괄 업데이트
     *
     * @param sortOrderUpdates ID와 새로운 sortOrder 맵
     */
    void updateEducationSortOrder(java.util.Map<String, Integer> sortOrderUpdates);
}
