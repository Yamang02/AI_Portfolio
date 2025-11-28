package com.aiportfolio.backend.application.common.util;

/**
 * 정렬 가능한 엔티티를 나타내는 인터페이스
 * 
 * SortOrderService에서 사용하기 위한 마커 인터페이스
 */
public interface Sortable {
    /**
     * 엔티티의 ID를 반환합니다.
     */
    String getId();

    /**
     * 현재 정렬 순서를 반환합니다.
     */
    Integer getSortOrder();

    /**
     * 정렬 순서를 설정합니다.
     */
    void setSortOrder(Integer sortOrder);
}


