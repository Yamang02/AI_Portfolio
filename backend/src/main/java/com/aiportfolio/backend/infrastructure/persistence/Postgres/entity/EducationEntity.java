package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;

import java.time.LocalDate;
import java.util.List;

/**
 * PostgreSQL 테이블과 매핑되는 Education 엔티티
 * 도메인 모델과는 별도로 데이터베이스 스키마에 맞춰 설계
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationEntity {
    
    private Long dbId; // DB 내부 ID (SERIAL)
    private String businessId; // 비즈니스 ID (EDU001, EDU002 등)
    private String title;
    private String description;
    private List<String> technologies; // JSONB로 저장
    private String organization;
    private LocalDate startDate;
    private LocalDate endDate;
    private EducationType type;
    private List<String> projects; // JSONB로 저장
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
