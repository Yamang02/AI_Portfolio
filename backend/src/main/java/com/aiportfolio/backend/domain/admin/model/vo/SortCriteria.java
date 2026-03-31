package com.aiportfolio.backend.domain.admin.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Comparator;

/**
 * 정렬 기준 값 객체
 * 프로젝트 정렬 조건을 나타내는 불변 객체
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SortCriteria {
    
    private SortField field;
    private SortOrder order;
    
    /**
     * 프로젝트 정렬을 위한 Comparator 생성
     */
    public Comparator<Object> getComparator() {
        if (field == null) {
            field = SortField.SORT_ORDER;
        }
        if (order == null) {
            order = SortOrder.ASC;
        }
        
        Comparator<Object> comparator = field.getComparator();
        return order == SortOrder.DESC ? comparator.reversed() : comparator;
    }
    
    /**
     * 정렬 필드 열거형
     */
    public enum SortField {
        START_DATE,
        END_DATE,
        TITLE,
        STATUS,
        SORT_ORDER,
        TYPE;
        
        public Comparator<Object> getComparator() {
            return switch (this) {
                case START_DATE -> comparingStartDate();
                case END_DATE -> comparingEndDate();
                case TITLE -> comparingString("getTitle", true);
                case STATUS -> comparingString("getStatus", false);
                case TYPE -> comparingString("getType", false);
                case SORT_ORDER -> comparingSortOrder();
            };
        }

        @SuppressWarnings({"unchecked", "rawtypes"})
        private static Comparator<Object> comparingStartDate() {
            return Comparator.comparing(obj -> {
                try {
                    return (Comparable) obj.getClass().getMethod("getStartDate").invoke(obj);
                } catch (Exception e) {
                    return null;
                }
            }, Comparator.nullsLast(Comparator.naturalOrder()));
        }

        @SuppressWarnings({"unchecked", "rawtypes"})
        private static Comparator<Object> comparingEndDate() {
            return Comparator.comparing(obj -> {
                try {
                    return (Comparable) obj.getClass().getMethod("getEndDate").invoke(obj);
                } catch (Exception e) {
                    return null;
                }
            }, Comparator.nullsLast(Comparator.naturalOrder()));
        }

        private static Comparator<Object> comparingString(String getterName, boolean caseInsensitive) {
            Comparator<String> order = caseInsensitive ? String.CASE_INSENSITIVE_ORDER : Comparator.naturalOrder();
            return Comparator.comparing(obj -> {
                try {
                    return (String) obj.getClass().getMethod(getterName).invoke(obj);
                } catch (Exception e) {
                    return "";
                }
            }, order);
        }

        private static Comparator<Object> comparingSortOrder() {
            return Comparator.comparing(obj -> {
                try {
                    Object sortOrder = obj.getClass().getMethod("getSortOrder").invoke(obj);
                    return sortOrder != null ? (Integer) sortOrder : 0;
                } catch (Exception e) {
                    return 0;
                }
            });
        }
    }
    
    /**
     * 정렬 순서 열거형
     */
    public enum SortOrder {
        ASC, DESC
    }
}
