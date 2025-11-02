package com.aiportfolio.backend.application.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.function.Function;

/**
 * 정렬 순서 관리 헬퍼 클래스
 * 
 * sortOrder 자동 할당 및 관리에 사용되는 공통 로직을 제공합니다.
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SortOrderHelper {

    /**
     * 다음 정렬 순서를 계산합니다.
     * 
     * 기존 항목들 중 최대 sortOrder를 찾아 +1을 반환합니다.
     * 모든 항목이 null이면 1을 반환합니다.
     * 
     * @param entities 기존 엔티티 목록
     * @param sortOrderExtractor sortOrder를 추출하는 함수
     * @param <T> 엔티티 타입
     * @return 다음 정렬 순서
     */
    public static <T> Integer calculateNextSortOrder(List<T> entities, Function<T, Integer> sortOrderExtractor) {
        if (entities == null || entities.isEmpty()) {
            return 1;
        }

        int maxSortOrder = entities.stream()
            .map(sortOrderExtractor)
            .filter(order -> order != null)
            .mapToInt(Integer::intValue)
            .max()
            .orElse(0);

        return maxSortOrder + 1;
    }

    /**
     * 정렬 순서를 설정합니다 (없으면 자동 할당).
     * 
     * @param currentSortOrder 현재 정렬 순서
     * @param existingEntities 기존 엔티티 목록
     * @param sortOrderExtractor sortOrder를 추출하는 함수
     * @param <T> 엔티티 타입
     * @return 설정된 정렬 순서
     */
    public static <T> Integer assignSortOrder(
            Integer currentSortOrder, 
            List<T> existingEntities, 
            Function<T, Integer> sortOrderExtractor) {
        
        if (currentSortOrder != null) {
            return currentSortOrder;
        }

        return calculateNextSortOrder(existingEntities, sortOrderExtractor);
    }

    /**
     * 정렬 순서 유효성을 검증합니다.
     * 
     * @param sortOrder 검증할 정렬 순서
     * @return 유효한 경우 true
     */
    public static boolean isValidSortOrder(Integer sortOrder) {
        return sortOrder != null && sortOrder > 0;
    }

    /**
     * 정렬 순서 검증 실패 시 예외를 던집니다.
     * 
     * @param sortOrder 검증할 정렬 순서
     * @throws IllegalArgumentException 정렬 순서가 유효하지 않은 경우
     */
    public static void validateSortOrder(Integer sortOrder) {
        if (!isValidSortOrder(sortOrder)) {
            throw new IllegalArgumentException(
                "정렬 순서는 1 이상의 정수여야 합니다: " + sortOrder
            );
        }
    }

    /**
     * 중간 삽입 시 자동 재정렬을 수행합니다.
     * 
     * 예시: [1,2,3,4,5] → 3번을 2번으로 → [1,3,2,4,5]
     * 
     * @param entities 모든 엔티티 목록
     * @param targetId 변경 대상 ID 추출 함수
     * @param targetEntityId 실제 변경할 엔티티의 ID
     * @param oldSortOrder 기존 정렬 순서
     * @param newSortOrder 새로운 정렬 순서
     * @param sortOrderExtractor 정렬 순서 추출 함수
     * @param entityUpdater 엔티티 업데이트 함수 (새로운 정렬 순서 적용)
     * @param <T> 엔티티 타입
     * @param <ID> ID 타입
     * @return 재정렬된 엔티티 목록
     */
    public static <T, ID> List<T> reorderEntities(
            List<T> entities,
            Function<T, ID> targetId,
            ID targetEntityId,
            int oldSortOrder,
            int newSortOrder,
            Function<T, Integer> sortOrderExtractor,
            java.util.function.BiFunction<T, Integer, T> entityUpdater) {
        
        List<T> result = new ArrayList<>();
        
        if (oldSortOrder == newSortOrder) {
            // 정렬 순서가 변경되지 않은 경우
            return entities;
        }
        
        if (oldSortOrder < newSortOrder) {
            // 뒤로 이동하는 경우 (예: 3번 → 7번)
            // 기존 4,5,6,7번이 3,4,5,6번으로 이동
            for (T entity : entities) {
                ID entityId = targetId.apply(entity);
                Integer entitySortOrder = sortOrderExtractor.apply(entity);
                
                if (entityId.equals(targetEntityId)) {
                    // 대상 엔티티를 새로운 위치로 이동
                    result.add(entityUpdater.apply(entity, newSortOrder));
                } else if (entitySortOrder != null && 
                          entitySortOrder > oldSortOrder && 
                          entitySortOrder <= newSortOrder) {
                    // 기존 항목들을 앞으로 이동 (sortOrder - 1)
                    result.add(entityUpdater.apply(entity, entitySortOrder - 1));
                } else {
                    // 나머지는 그대로 유지
                    result.add(entity);
                }
            }
        } else {
            // 앞으로 이동하는 경우 (예: 7번 → 3번)
            // 기존 3,4,5,6번이 4,5,6,7번으로 이동
            for (T entity : entities) {
                ID entityId = targetId.apply(entity);
                Integer entitySortOrder = sortOrderExtractor.apply(entity);
                
                if (entityId.equals(targetEntityId)) {
                    // 대상 엔티티를 새로운 위치로 이동
                    result.add(entityUpdater.apply(entity, newSortOrder));
                } else if (entitySortOrder != null && 
                          entitySortOrder >= newSortOrder && 
                          entitySortOrder < oldSortOrder) {
                    // 기존 항목들을 뒤로 이동 (sortOrder + 1)
                    result.add(entityUpdater.apply(entity, entitySortOrder + 1));
                } else {
                    // 나머지는 그대로 유지
                    result.add(entity);
                }
            }
        }
        
        return result;
    }
}

