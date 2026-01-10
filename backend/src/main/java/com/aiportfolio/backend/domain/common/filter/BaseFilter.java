package com.aiportfolio.backend.domain.common.filter;

import java.time.LocalDateTime;

/**
 * 기본 필터 추상 클래스
 * - date_from, date_to 필드를 기본 제공
 * - 모든 필터 클래스의 기본 추상 클래스
 */
public abstract class BaseFilter {
    protected LocalDateTime dateFrom;
    protected LocalDateTime dateTo;

    public BaseFilter() {
    }

    public BaseFilter(LocalDateTime dateFrom, LocalDateTime dateTo) {
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
    }

    public LocalDateTime getDateFrom() {
        return dateFrom;
    }

    public void setDateFrom(LocalDateTime dateFrom) {
        this.dateFrom = dateFrom;
    }

    public LocalDateTime getDateTo() {
        return dateTo;
    }

    public void setDateTo(LocalDateTime dateTo) {
        this.dateTo = dateTo;
    }
}
