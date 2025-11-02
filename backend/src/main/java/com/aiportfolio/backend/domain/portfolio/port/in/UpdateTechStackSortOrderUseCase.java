package com.aiportfolio.backend.domain.portfolio.port.in;

import java.util.List;

/**
 * 기술스택 정렬 순서 업데이트 UseCase
 * 기술스택의 정렬 순서를 변경하고 다른 항목들의 순서를 자동으로 조정
 */
public interface UpdateTechStackSortOrderUseCase {
    
    /**
     * 기술스택의 정렬 순서를 변경하고 관련된 다른 항목들을 자동 재정렬
     * 
     * @param techStackName 변경할 기술스택 이름
     * @param newSortOrder 새로운 정렬 순서
     * @return 업데이트된 기술스택 목록
     */
    List<com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata> updateSortOrder(String techStackName, int newSortOrder);
    
    /**
     * 여러 기술스택의 정렬 순서를 일괄 업데이트
     * 
     * @param sortOrderUpdates 정렬 순서 업데이트 정보 (이름, 새로운 순서)
     * @return 업데이트된 기술스택 목록
     */
    List<com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata> updateSortOrders(List<SortOrderUpdate> sortOrderUpdates);
    
    /**
     * 정렬 순서 업데이트 정보를 담는 내부 클래스
     */
    class SortOrderUpdate {
        private String techStackName;
        private int newSortOrder;
        
        public SortOrderUpdate(String techStackName, int newSortOrder) {
            this.techStackName = techStackName;
            this.newSortOrder = newSortOrder;
        }
        
        public String getTechStackName() {
            return techStackName;
        }
        
        public int getNewSortOrder() {
            return newSortOrder;
        }
    }
}
