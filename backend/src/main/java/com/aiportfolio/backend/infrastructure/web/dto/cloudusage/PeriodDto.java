package com.aiportfolio.backend.infrastructure.web.dto.cloudusage;

import com.aiportfolio.backend.domain.monitoring.model.Period;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 기간 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodDto {
    private LocalDate startDate;
    private LocalDate endDate;

    public static PeriodDto from(Period period) {
        return PeriodDto.builder()
            .startDate(period.getStartDate())
            .endDate(period.getEndDate())
            .build();
    }
}








