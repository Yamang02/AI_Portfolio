package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Experience;

import java.util.Map;

/**
 * Experience 관리 UseCase (Command)
 *
 * 책임: Experience의 생성, 수정, 삭제 작업 정의
 * CQRS 패턴의 Command 측면
 */
public interface ManageExperienceUseCase {

    /**
     * Experience 생성
     *
     * @param experience 생성할 Experience 도메인 모델
     * @return 생성된 Experience
     */
    Experience createExperience(Experience experience);

    /**
     * Experience 수정
     *
     * @param id 수정할 Experience ID
     * @param experience 수정할 데이터
     * @return 수정된 Experience
     */
    Experience updateExperience(String id, Experience experience);

    /**
     * Experience 삭제
     *
     * @param id 삭제할 Experience ID
     */
    void deleteExperience(String id);

    /**
     * Experience 정렬 순서 일괄 업데이트
     *
     * @param sortOrderUpdates ID와 새로운 sortOrder 맵
     */
    void updateExperienceSortOrder(Map<String, Integer> sortOrderUpdates);

    /**
     * 정렬 순서 업데이트 정보를 담는 내부 클래스
     */
    class SortOrderUpdate {
        private String experienceId;
        private int newSortOrder;

        public SortOrderUpdate(String experienceId, int newSortOrder) {
            this.experienceId = experienceId;
            this.newSortOrder = newSortOrder;
        }

        public String getExperienceId() {
            return experienceId;
        }

        public int getNewSortOrder() {
            return newSortOrder;
        }
    }
}
