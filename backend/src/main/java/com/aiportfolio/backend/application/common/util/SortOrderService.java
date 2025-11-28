package com.aiportfolio.backend.application.common.util;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 정렬 순서 관리 유틸리티 서비스
 * 
 * 공통 정렬 로직을 제공하여 중복 코드를 제거합니다.
 * Sortable 인터페이스를 구현하지 않은 도메인 모델도 사용 가능합니다.
 */
@Component
public class SortOrderService {

    /**
     * 정렬 순서를 업데이트하고 자동으로 재정렬
     *
     * @param items 전체 아이템 리스트
     * @param targetId 이동할 대상 ID
     * @param newSortOrder 새로운 정렬 순서
     * @return 재정렬된 아이템 리스트
     */
    public <T extends Sortable> List<T> reorder(
            List<T> items,
            String targetId,
            Integer newSortOrder) {

        T target = items.stream()
            .filter(item -> item.getId().equals(targetId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Item not found: " + targetId));

        Integer oldSortOrder = target.getSortOrder();

        if (Objects.equals(oldSortOrder, newSortOrder)) {
            return items;
        }

        List<T> result = new ArrayList<>();

        if (oldSortOrder < newSortOrder) {
            // 뒤로 이동
            for (T item : items) {
                if (item.getId().equals(targetId)) {
                    result.add(updateSortOrder(item, newSortOrder));
                } else if (item.getSortOrder() != null &&
                          item.getSortOrder() > oldSortOrder &&
                          item.getSortOrder() <= newSortOrder) {
                    result.add(updateSortOrder(item, item.getSortOrder() - 1));
                } else {
                    result.add(item);
                }
            }
        } else {
            // 앞으로 이동
            for (T item : items) {
                if (item.getId().equals(targetId)) {
                    result.add(updateSortOrder(item, newSortOrder));
                } else if (item.getSortOrder() != null &&
                          item.getSortOrder() >= newSortOrder &&
                          item.getSortOrder() < oldSortOrder) {
                    result.add(updateSortOrder(item, item.getSortOrder() + 1));
                } else {
                    result.add(item);
                }
            }
        }

        return result;
    }

    private <T extends Sortable> T updateSortOrder(T item, Integer newSortOrder) {
        item.setSortOrder(newSortOrder);
        return item;
    }
}

