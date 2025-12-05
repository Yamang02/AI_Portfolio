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
     * 빌링 데이터 지연을 고려하여 어제까지의 데이터만 조회
     */
    public static Period currentMonth() {
        LocalDate now = LocalDate.now();
        LocalDate yesterday = now.minusDays(1); // 어제까지 (오늘 데이터는 아직 없을 수 있음)
        return new Period(
            now.withDayOfMonth(1),
            yesterday // 현재 월 1일 ~ 어제
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







