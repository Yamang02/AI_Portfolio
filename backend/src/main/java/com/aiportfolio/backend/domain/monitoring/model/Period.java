package com.aiportfolio.backend.domain.monitoring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 기간 정보
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Period {
    private LocalDate startDate;
    private LocalDate endDate;

    /**
     * 현재 월 기간 생성
     */
    public static Period currentMonth() {
        LocalDate now = LocalDate.now();
        return new Period(
            now.withDayOfMonth(1),
            now.withDayOfMonth(now.lengthOfMonth())
        );
    }

    /**
     * 지난 N일 기간 생성
     */
    public static Period lastNDays(int days) {
        LocalDate now = LocalDate.now();
        return new Period(now.minusDays(days), now);
    }
}

